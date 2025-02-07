import { BettingRound, GameAction, BettingState, isValidAction } from './actions';
import { Player, PlayerStatus } from '../core/types';
import { calculatePotSize, getNextActivePlayer } from '../core/utils';

export class RoundManager {
    private bettingState: BettingState;
    private readonly SMALL_BLIND: number = 1;
    private readonly BIG_BLIND: number = 2;

    constructor(players: Player[], dealerPosition: number) {
        this.bettingState = this.initializeBettingState(players, dealerPosition);
    }

    private initializeBettingState(players: Player[], dealerPosition: number): BettingState {
        const activePlayers = players.filter(p => p.status === 'ACTIVE');
        let smallBlindPos, bigBlindPos;
        if (players.length === 2) {
            smallBlindPos = dealerPosition;
            bigBlindPos = (dealerPosition + 1) % players.length;
        } else {
            smallBlindPos = (dealerPosition + 1) % players.length;
            bigBlindPos = (dealerPosition + 2) % players.length;
        }
        
        // Set blind positions
        players[smallBlindPos].isSmallBlind = true;
        players[bigBlindPos].isBigBlind = true;
        
        // Post blinds
        players[smallBlindPos].bet = this.SMALL_BLIND;
        players[smallBlindPos].stack -= this.SMALL_BLIND;
        
        players[bigBlindPos].bet = this.BIG_BLIND;
        players[bigBlindPos].stack -= this.BIG_BLIND;
        
        return {
            currentBet: this.BIG_BLIND,
            pot: this.SMALL_BLIND + this.BIG_BLIND,
            currentPlayer: this.getFirstToAct(players, dealerPosition),
            round: 'PRE_FLOP',
            actionsThisRound: new Map(),
            players,
            minRaise: this.BIG_BLIND,
            lastRaise: this.BIG_BLIND,
            sidePots: []
        };
    }

    private getFirstToAct(players: Player[], dealerPosition: number): Player {
        // Handle heads-up scenario
        if (players.length === 2) {
            if (this.bettingState?.round === 'PRE_FLOP') {
                // Pre-flop: Small blind (dealer) acts first
                return players.find(p => p.isSmallBlind)!;
            } else {
                // Post-flop: Big blind acts first
                return players.find(p => p.isBigBlind)!;
            }
        }
        
        // Existing logic for other cases
        const utgPosition = (dealerPosition + 3) % players.length;
        return players.find(p => p.position === utgPosition)!;
    }

    public isRoundComplete(): boolean {
        const activePlayers = this.bettingState.players.filter(p => 
            p.status === 'ACTIVE' || p.status === 'ALL_IN'
        );
        
        // For heads-up pre-flop, need 2 actions (SB call + BB check)
        if (this.bettingState.players.length === 2 && 
            this.bettingState.round === 'PRE_FLOP') {
            return this.bettingState.actionsThisRound.size === 2 && 
                   activePlayers.every(p => p.bet === this.bettingState.currentBet);
        }
        
        // Existing logic for other cases
        const allActed = activePlayers.every(player => 
            this.bettingState.actionsThisRound.has(player.id)
        );
        
        const betsMatched = activePlayers
            .filter(p => p.status === 'ACTIVE')
            .every(p => p.bet === this.bettingState.currentBet);

        return allActed && betsMatched;
    }

    public advanceRound(): BettingRound {
        const rounds: BettingRound[] = ['PRE_FLOP', 'FLOP', 'TURN', 'RIVER'];
        const currentIndex = rounds.indexOf(this.bettingState.round);
        
        if (currentIndex < rounds.length - 1) {
            this.bettingState.round = rounds[currentIndex + 1];
            this.bettingState.currentBet = 0;
            this.bettingState.actionsThisRound.clear();
            
            // Handle heads-up post-flop acting order
            if (this.bettingState.players.length === 2 && this.bettingState.round !== 'PRE_FLOP') {
                this.bettingState.currentPlayer = this.bettingState.players.find(p => p.isBigBlind)!;
            } else {
                this.bettingState.currentPlayer = this.getFirstActivePlayerAfterDealer();
            }
        }

        return this.bettingState.round;
    }

    private getFirstActivePlayerAfterDealer(): Player {
        const dealerIndex = this.bettingState.players.findIndex(p => p.isDealer);
        let currentIndex = (dealerIndex + 1) % this.bettingState.players.length;
        
        while (currentIndex !== dealerIndex) {
            const player = this.bettingState.players[currentIndex];
            if (player.status === 'ACTIVE') return player;
            currentIndex = (currentIndex + 1) % this.bettingState.players.length;
        }
        
        return this.bettingState.players[currentIndex];
    }

    public getCurrentState(): BettingState {
        return this.bettingState;
    }

    public isHandComplete(): boolean {
        const activePlayers = this.bettingState.players.filter(p => 
            p.status === 'ACTIVE' || p.status === 'ALL_IN'
        );
        
        // Hand ends if only one active player remains
        if (activePlayers.filter(p => p.status === 'ACTIVE').length <= 1) {
            return true;
        }
        
        // Hand ends after river betting is complete
        return this.bettingState.round === 'RIVER' && this.isRoundComplete();
    }

    private updateSidePots(): void {
        this.bettingState.sidePots = [];
        const allInPlayers = this.bettingState.players
            .filter(p => p.status === 'ALL_IN')
            .sort((a, b) => a.bet - b.bet);
        
        const activePlayers = this.bettingState.players
            .filter(p => p.status === 'ACTIVE' || p.status === 'ALL_IN');
        
        let processedBets = 0;
        
        allInPlayers.forEach(allInPlayer => {
            const betLevel = allInPlayer.bet;
            const contribution = betLevel - processedBets;
            
            if (contribution > 0) {
                const eligiblePlayers = activePlayers.filter(p => p.bet >= betLevel);
                const potAmount = contribution * eligiblePlayers.length;
                
                this.bettingState.sidePots.push({
                    amount: potAmount,
                    eligiblePlayers: eligiblePlayers.map(p => p.id)
                });
                
                processedBets = betLevel;
            }
        });

        const remainingBets = activePlayers
            .filter(p => p.status === 'ACTIVE')
            .reduce((sum, p) => sum + Math.max(0, p.bet - processedBets), 0);
        
        if (remainingBets > 0) {
            this.bettingState.sidePots.push({
                amount: remainingBets,
                eligiblePlayers: activePlayers
                    .filter(p => p.status === 'ACTIVE')
                    .map(p => p.id)
            });
        }
    }

    public handleAllIn(player: Player, amount: number): void {
        if (amount >= player.stack) {
            player.bet += player.stack;
            player.stack = 0;
            player.status = 'ALL_IN';
            this.updateSidePots();
            
            // Update minimum raise if this was a raise
            if (amount > this.bettingState.currentBet) {
                this.bettingState.minRaise = amount - this.bettingState.currentBet;
                this.bettingState.currentBet = amount;
            }
        }
    }

    private postBlinds(): void {
        const smallBlindPlayer = this.bettingState.players.find(p => p.isSmallBlind);
        const bigBlindPlayer = this.bettingState.players.find(p => p.isBigBlind);
        
        if (smallBlindPlayer && smallBlindPlayer.stack >= this.SMALL_BLIND) {
            smallBlindPlayer.bet = this.SMALL_BLIND;
            smallBlindPlayer.stack -= this.SMALL_BLIND;
        } else {
            this.handleAllIn(smallBlindPlayer!, smallBlindPlayer!.stack);
        }
        
        if (bigBlindPlayer && bigBlindPlayer.stack >= this.BIG_BLIND) {
            bigBlindPlayer.bet = this.BIG_BLIND;
            bigBlindPlayer.stack -= this.BIG_BLIND;
        } else {
            this.handleAllIn(bigBlindPlayer!, bigBlindPlayer!.stack);
        }
    }

    private shouldReopenBetting(): boolean {
        const lastAction = Array.from(this.bettingState.actionsThisRound.values()).pop();
        return lastAction?.type === 'RAISE' && 
               this.bettingState.players.filter(p => p.status === 'ACTIVE').length > 1;
    }

    private handleHeadsUpAction(action: GameAction, player: Player): boolean {
        if (this.bettingState.round === 'PRE_FLOP') {
            if (action.type === 'CALL' && player.isSmallBlind) {
                const amountToCall = this.BIG_BLIND - player.bet;
                
                if (amountToCall > 0) {
                    if (player.stack >= amountToCall) {
                        player.bet += amountToCall;
                        player.stack -= amountToCall;
                        this.bettingState.currentBet = this.BIG_BLIND;
                        this.bettingState.actionsThisRound.set(player.id, action);
                        return true;
                    }
                    this.handleAllIn(player, amountToCall);
                    return true;
                }
            }
            
            if (action.type === 'CHECK' && player.isBigBlind) {
                // Validate and record check
                if (player.bet === this.bettingState.currentBet) {
                    this.bettingState.actionsThisRound.set(player.id, action);
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    public handleAction(action: GameAction): boolean {
        const player = this.bettingState.players.find(p => p.id === action.playerId);
        if (!player || player.status !== 'ACTIVE') return false;

        // Try heads-up handling first
        if (this.bettingState.players.length === 2) {
            const handled = this.handleHeadsUpAction(action, player);
            if (handled !== false) return handled;
        }

        // Check if it's player's turn
        if (player.id !== this.bettingState.currentPlayer.id) return false;

        // Special validation for heads-up
        if (this.bettingState.players.length === 2) {
            if (action.type === 'CHECK' && 
                player.isBigBlind && 
                this.bettingState.round === 'PRE_FLOP' &&
                this.bettingState.currentBet === this.BIG_BLIND) {
                // Allow BB to check when SB just calls
                return true;
            }
        }

        // Modified heads-up call handling
        if (this.bettingState.players.length === 2 && 
            this.bettingState.round === 'PRE_FLOP' &&
            action.type === 'CALL' &&
            player.isSmallBlind) {
            
            const amountToCall = this.BIG_BLIND - player.bet; // Directly use BIG_BLIND instead of currentBet
            if (amountToCall <= 0) return false;

            if (player.stack >= amountToCall) {
                player.bet += amountToCall;
                player.stack -= amountToCall;
                this.bettingState.currentBet = Math.max(this.bettingState.currentBet, player.bet);
                this.bettingState.actionsThisRound.set(player.id, action);
                return true;
            } else {
                this.handleAllIn(player, amountToCall);
                return true;
            }
        }

        // Validate the action
        if (!isValidAction(action, player, this.bettingState)) return false;

        // Apply the action
        switch (action.type) {
            case 'FOLD':
                player.status = 'FOLDED';
                break;
            case 'RAISE':
                if (!action.amount) return false;
                const totalRaiseAmount = Math.min(action.amount, player.stack);
                
                // Handle all-in scenario
                if (totalRaiseAmount >= player.stack) {
                    player.bet += player.stack;
                    player.stack = 0;
                    player.status = 'ALL_IN';
                    this.bettingState.currentBet = player.bet;
                } else {
                    const additionalBet = totalRaiseAmount - player.bet;
                    player.stack -= additionalBet;
                    player.bet = totalRaiseAmount;
                    this.bettingState.currentBet = totalRaiseAmount;
                }
                
                // Update minimum raise
                const raiseAmount = player.bet - this.bettingState.currentBet;
                if (raiseAmount > 0) {
                    this.bettingState.minRaise = raiseAmount;
                    this.bettingState.lastRaisePlayer = player;
                }
                
                this.updateSidePots();
                break;
            case 'CALL':
                const callAmount = this.bettingState.currentBet - player.bet;
                if (callAmount <= 0) return false; // Can't call zero
                if (callAmount >= player.stack) {
                    this.handleAllIn(player, player.stack);
                } else {
                    player.stack -= callAmount;
                    player.bet = this.bettingState.currentBet;
                }
                break;
            case 'CHECK':
                // Special case for heads-up big blind
                if (this.bettingState.players.length === 2 && 
                    player.isBigBlind && 
                    this.bettingState.round === 'PRE_FLOP' && 
                    this.bettingState.currentBet === player.bet) {
                    return true;
                }
                return this.bettingState.currentBet === 0 || player.bet === this.bettingState.currentBet;
        }

        // Record the action
        this.bettingState.actionsThisRound.set(player.id, action);

        // Find next active player
        const nextPlayer = this.getNextActivePlayer();
        if (nextPlayer) {
            this.bettingState.currentPlayer = nextPlayer;
        }

        return true;
    }

    private getNextActivePlayer(): Player | undefined {
        const currentPosition = this.bettingState.currentPlayer.position;
        let nextPosition = (currentPosition + 1) % this.bettingState.players.length;
        
        while (nextPosition !== currentPosition) {
            const player = this.bettingState.players[nextPosition];
            if (player.status === 'ACTIVE') return player;
            nextPosition = (nextPosition + 1) % this.bettingState.players.length;
        }
        
        return undefined;
    }
} 