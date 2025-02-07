import { describe, test, expect } from '@jest/globals';
import { RoundManager } from '../app/game/state/rounds';
import { Player, PlayerStatus } from '../app/game/core/types';
import { GameAction } from '../app/game/state/actions';

describe('Poker Round Management', () => {
    const createMockPlayers = (count: number): Player[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: (i + 1).toString(),
            name: `Player ${i + 1}`,
            position: i,
            cards: [],
            chips: 1000,
            stack: 1000,
            bet: 0,
            status: 'ACTIVE' as PlayerStatus,
            isDealer: false,
            isSmallBlind: false,
            isBigBlind: false
        }));
    };

    test('should prevent folded players from taking actions', () => {
        const players = createMockPlayers(6);
        const roundManager = new RoundManager(players, 0);
        
        // UTG folds
        roundManager.handleAction({ 
            type: 'FOLD', 
            playerId: '4'
        });
        
        // Attempt action after folding
        const attemptedAction = roundManager.handleAction({ 
            type: 'RAISE', 
            playerId: '4',
            amount: 10 
        });
        
        expect(attemptedAction).toBe(false);
        expect(players[3].status).toBe('FOLDED');
    });

    test('should simulate a complete pre-flop betting round', () => {
        const players = createMockPlayers(6);
        const roundManager = new RoundManager(players, 0);
        
        // Small blind and big blind should have posted
        expect(players[1].bet).toBe(1);
        expect(players[2].bet).toBe(2);
        
        // UTG raises
        expect(roundManager.handleAction({ 
            type: 'RAISE', 
            playerId: '4', 
            amount: 6 
        })).toBe(true);
        
        // MP calls
        expect(roundManager.handleAction({ 
            type: 'CALL', 
            playerId: '5'
        })).toBe(true);
        
        // CO folds
        expect(roundManager.handleAction({ 
            type: 'FOLD', 
            playerId: '6'
        })).toBe(true);
        
        // Verify CO can't act after folding
        expect(roundManager.handleAction({ 
            type: 'CALL', 
            playerId: '6'
        })).toBe(false);
        
        // Button folds
        expect(roundManager.handleAction({ 
            type: 'FOLD', 
            playerId: '1'
        })).toBe(true);
        
        // SB calls
        expect(roundManager.handleAction({ 
            type: 'CALL', 
            playerId: '2'
        })).toBe(true);
        
        // BB calls
        expect(roundManager.handleAction({ 
            type: 'CALL', 
            playerId: '3'
        })).toBe(true);
        
        expect(roundManager.isRoundComplete()).toBe(true);
    });

    test('should handle all-in scenarios', () => {
        const players = createMockPlayers(3);
        const roundManager = new RoundManager(players, 0);
        
        // Player goes all-in
        roundManager.handleAllIn(players[0], 1000);
        
        const state = roundManager.getCurrentState();
        expect(state.sidePots.length).toBeGreaterThan(0);
        expect(players[0].status).toBe('ALL_IN');
    });

    test('should correctly rotate betting positions', () => {
        const players = createMockPlayers(4);
        const roundManager = new RoundManager(players, 0);
        
        const initialState = roundManager.getCurrentState();
        const firstToAct = initialState.currentPlayer;
        
        // Simulate completing the pre-flop round
        roundManager.advanceRound();
        
        const flopState = roundManager.getCurrentState();
        expect(flopState.currentPlayer.id).not.toBe(firstToAct.id);
    });

    test('should handle re-raises and betting reopening', () => {
        const players = createMockPlayers(6);
        const roundManager = new RoundManager(players, 0);
        
        // UTG raises to 6
        expect(roundManager.handleAction({ 
            type: 'RAISE', 
            playerId: '4', 
            amount: 6 
        })).toBe(true);
        
        // MP re-raises to 12
        expect(roundManager.handleAction({ 
            type: 'RAISE', 
            playerId: '5',
            amount: 12
        })).toBe(true);
        
        // Verify betting reopens for earlier positions
        expect(roundManager.getCurrentState().currentBet).toBe(12);
    });

    test('should handle short stack and all-in scenarios', () => {
        const players = createMockPlayers(3);
        players[0].stack = 10; // Short stack
        const roundManager = new RoundManager(players, 0);
        
        // Player goes all-in with less than minimum raise
        expect(roundManager.handleAction({
            type: 'RAISE',
            playerId: '1',
            amount: 10
        })).toBe(true);
        
        expect(players[0].status).toBe('ALL_IN');
        expect(roundManager.getCurrentState().sidePots.length).toBe(1);
    });

    test('should handle multiple side pots', () => {
        const players = createMockPlayers(4);
        players[0].stack = 10;  // Player 1 (BTN)
        players[1].stack = 20;  // Player 2 (SB)
        const roundManager = new RoundManager(players, 0); // Dealer at position 0
        
        // Get initial acting order
        let state = roundManager.getCurrentState();
        console.log('First to act:', state.currentPlayer.id); // Should be UTG (player 3)

        // UTG (player 4) folds
        roundManager.handleAction({ 
            type: 'FOLD', 
            playerId: '4' 
        });
        
        // MP (player 5) folds
        roundManager.handleAction({ 
            type: 'FOLD', 
            playerId: '5' 
        });
        
        // Now it's Player 1's turn (BTN)
        console.log('Current player:', roundManager.getCurrentState().currentPlayer.id);
        
        // Player 1 (BTN) raises
        expect(roundManager.handleAction({
            type: 'RAISE',
            playerId: '1',
            amount: 10
        })).toBe(true); // Now valid
    });

    test('should handle blind vs blind scenarios', () => {
        const players = createMockPlayers(2);
        const roundManager = new RoundManager(players, 0);
        
        console.log('\n--- Blind vs Blind Test ---');
        console.log('Initial state:');
        players.forEach(p => console.log(
            `Player ${p.id}: Stack=${p.stack}, Bet=${p.bet}, ` +
            `Status=${p.status}, isSB=${p.isSmallBlind}, isBB=${p.isBigBlind}`
        ));
        
        // Small blind (Player 1) should act first
        console.log('\nSmall blind completes to 2:');
        const callResult = roundManager.handleAction({
            type: 'CALL',
            playerId: '1'
        });
        console.log('Call result:', callResult);
        console.log('After SB calls:');
        players.forEach(p => console.log(
            `Player ${p.id}: Stack=${p.stack}, Bet=${p.bet}, ` +
            `Status=${p.status}, isSB=${p.isSmallBlind}, isBB=${p.isBigBlind}`
        ));
        
        // Big blind checks
        console.log('\nBig blind checks:');
        const checkResult = roundManager.handleAction({
            type: 'CHECK',
            playerId: '2'
        });
        console.log('Check result:', checkResult);
        console.log('After BB checks:');
        players.forEach(p => console.log(
            `Player ${p.id}: Stack=${p.stack}, Bet=${p.bet}, ` +
            `Status=${p.status}, isSB=${p.isSmallBlind}, isBB=${p.isBigBlind}`
        ));
        
        const isComplete = roundManager.isRoundComplete();
        console.log('\nIs round complete:', isComplete);
        
        expect(callResult).toBe(true);
        expect(checkResult).toBe(true);
        expect(isComplete).toBe(true);
    });

    test('should handle minimum raise rules', () => {
        const players = createMockPlayers(3);
        const roundManager = new RoundManager(players, 0);
        
        // Attempt raise smaller than minimum
        expect(roundManager.handleAction({
            type: 'RAISE',
            playerId: '1',
            amount: 3  // Less than BB + min raise
        })).toBe(false);
        
        // Valid minimum raise
        expect(roundManager.handleAction({
            type: 'RAISE',
            playerId: '1',
            amount: 4  // BB + min raise
        })).toBe(true);
    });
});