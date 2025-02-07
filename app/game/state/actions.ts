import { Player, PlayerStatus } from '../core/types';

export type BettingRound = 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER';

export type GameAction = {
    type: 'CHECK' | 'CALL' | 'RAISE' | 'FOLD';
    playerId: string;
    amount?: number; // Only for RAISE
};

export type BettingState = {
    currentBet: number;
    pot: number;
    currentPlayer: Player;
    round: BettingRound;
    actionsThisRound: Map<string, GameAction>;
    players: Player[];
    minRaise: number;
    lastRaise: number;
    lastRaisePlayer?: Player; // Add this to track who made the last raise
    sidePots: { amount: number; eligiblePlayers: string[] }[];
};

export const isValidAction = (
    action: GameAction,
    player: Player,
    bettingState: BettingState
): boolean => {
    // First check if player is active and it's their turn
    if (player.status !== 'ACTIVE') return false;
    if (player.id !== bettingState.currentPlayer.id) return false;

    switch (action.type) {
        case 'CHECK':
            // Can only check if no one has bet or if you've matched the current bet
            return bettingState.currentBet === 0 || player.bet === bettingState.currentBet;
        case 'CALL':
            // Can call if there's a bet to call and you have chips
            const callAmount = bettingState.currentBet - player.bet;
            return callAmount > 0 && player.stack > 0;
        case 'RAISE':
            if (!action.amount) return false;
            const minRaiseAmount = bettingState.currentBet + bettingState.minRaise;
            const totalCost = action.amount - player.bet;
            return (
                action.amount >= minRaiseAmount && // Must be at least min raise
                totalCost <= player.stack && // Can't raise more than your stack
                bettingState.lastRaisePlayer?.id !== player.id // Can't raise your own raise
            );
        case 'FOLD':
            // Can always fold
            return true;
        default:
            return false;
    }
};
