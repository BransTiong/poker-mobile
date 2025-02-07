import { describe, test, expect } from '@jest/globals';
import { GameAction, BettingState, isValidAction } from '../app/game/state/actions';
import { Player, PlayerStatus } from '../app/game/core/types';

describe('Poker Actions', () => {
    // Setup mock players and betting state
    const createMockPlayer = (id: string, stack: number = 1000, bet: number = 0): Player => ({
        id,
        name: `Player ${id}`,
        position: parseInt(id),
        cards: [],
        chips: stack,
        stack,
        bet,
        status: 'ACTIVE' as PlayerStatus,
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false
    });

    const createMockBettingState = (
        currentBet: number = 0,
        currentPlayerId: string = '1'
    ): BettingState => ({
        currentBet,
        pot: 0,
        currentPlayer: createMockPlayer(currentPlayerId),
        round: 'PRE_FLOP',
        actionsThisRound: new Map(),
        players: [
            createMockPlayer('1'),
            createMockPlayer('2'),
            createMockPlayer('3')
        ],
        minRaise: 20,
        lastRaise: 0,
        sidePots: []
    });

    test('should allow check when no bets made', () => {
        const player = createMockPlayer('1');
        const state = createMockBettingState(0, '1');
        const action: GameAction = { type: 'CHECK', playerId: '1' };

        expect(isValidAction(action, player, state)).toBe(true);
    });

    test('should not allow check when there are bets', () => {
        const player = createMockPlayer('1');
        const state = createMockBettingState(20, '1');
        const action: GameAction = { type: 'CHECK', playerId: '1' };

        expect(isValidAction(action, player, state)).toBe(false);
    });

    test('should allow call when player has enough chips', () => {
        const player = createMockPlayer('1', 1000, 0);
        const state = createMockBettingState(20, '1');
        const action: GameAction = { type: 'CALL', playerId: '1' };

        expect(isValidAction(action, player, state)).toBe(true);
    });

    test('should allow valid raise', () => {
        const player = createMockPlayer('1', 1000, 0);
        const state = createMockBettingState(20, '1');
        const action: GameAction = { 
            type: 'RAISE', 
            playerId: '1',
            amount: 60 // Current bet (20) + minRaise (20) + extra
        };

        expect(isValidAction(action, player, state)).toBe(true);
    });

    test('should not allow raise below minimum', () => {
        const player = createMockPlayer('1', 1000, 0);
        const state = createMockBettingState(20, '1');
        const action: GameAction = { 
            type: 'RAISE', 
            playerId: '1',
            amount: 30 // Below min raise
        };

        expect(isValidAction(action, player, state)).toBe(false);
    });

    test('should not allow raise above stack', () => {
        const player = createMockPlayer('1', 50, 0);
        const state = createMockBettingState(20, '1');
        const action: GameAction = { 
            type: 'RAISE', 
            playerId: '1',
            amount: 100
        };

        expect(isValidAction(action, player, state)).toBe(false);
    });

    test('should always allow fold', () => {
        const player = createMockPlayer('1');
        const state = createMockBettingState(1000, '1'); // Even with huge bet
        const action: GameAction = { type: 'FOLD', playerId: '1' };

        expect(isValidAction(action, player, state)).toBe(true);
    });

    test('should not allow action when not players turn', () => {
        const player = createMockPlayer('1');
        const state = createMockBettingState(0, '2'); // Current player is 2
        const action: GameAction = { type: 'CHECK', playerId: '1' };

        expect(isValidAction(action, player, state)).toBe(false);
    });
});