import { describe, test, expect } from '@jest/globals';
import GameEngine from '../app/game/engine/GameEngine';

describe('GameEngine', () => {
    test('should simulate a complete poker hand with 5 players', () => {
        const game = new GameEngine(5);
        
        // Get initial state before starting the hand
        let state = game.getGameState();
        
        // Log the initial shuffled deck
        console.log('\nInitial Shuffled Deck:');
        console.log(state.deck.map(card => `${card.rank}${card.suit}`).join(', '));
        
        // Start a new hand
        game.startNewHand();
        
        // Get the updated game state after dealing
        state = game.getGameState();
        
        // Log the dealer, small blind, and big blind positions
        console.log('\nHand 1 Positions:');
        state.players.forEach(player => {
            const position = [];
            if (player.isDealer) position.push('Dealer');
            if (player.isSmallBlind) position.push('Small Blind');
            if (player.isBigBlind) position.push('Big Blind');
            
            console.log(`Player ${player.id}: ${position.join(', ') || 'Regular Position'}`);
        });
        
        // Log each player's cards
        console.log('\nPlayer Cards:');
        state.players.forEach(player => {
            console.log(`Player ${player.id}: ${player.cards.map(card => `${card.rank}${card.suit}`).join(', ')}`);
        });
        
        // Log community cards
        console.log('\nCommunity Cards:');
        console.log('Flop:', state.communityCards.slice(0, 3).map(card => `${card.rank}${card.suit}`).join(', '));
        console.log('Turn:', state.communityCards[3]?.rank + state.communityCards[3]?.suit);
        console.log('River:', state.communityCards[4]?.rank + state.communityCards[4]?.suit);
        
        // Log burned cards
        console.log('\nBurned Cards:');
        console.log(state.burnedCards.map(card => `${card.rank}${card.suit}`).join(', '));
        
        // Log remaining deck
        console.log('\nRemaining Deck:');
        console.log(state.deck.map(card => `${card.rank}${card.suit}`).join(', '));
        
        // Verify the correct number of cards were dealt
        expect(state.players.every(player => player.cards.length === 2)).toBe(true);
        expect(state.communityCards.length).toBe(5);
        expect(state.burnedCards.length).toBe(3);
        expect(state.remainingCards).toBe(52 - (5 * 2) - 5 - 3); // 52 - (player cards) - community cards - burn cards
        
        // Verify only one dealer, small blind, and big blind
        expect(state.players.filter(p => p.isDealer).length).toBe(1);
        expect(state.players.filter(p => p.isSmallBlind).length).toBe(1);
        expect(state.players.filter(p => p.isBigBlind).length).toBe(1);
        
        // Simulate multiple hands to verify position rotation
        console.log('\nPosition Rotation Over Multiple Hands:');
        for (let i = 0; i < 3; i++) {
            game.startNewHand();
            const newState = game.getGameState();
            console.log(`\nHand ${i + 2} Positions:`);
            newState.players.forEach(player => {
                const position = [];
                if (player.isDealer) position.push('Dealer');
                if (player.isSmallBlind) position.push('Small Blind');
                if (player.isBigBlind) position.push('Big Blind');
                
                console.log(`Player ${player.id}: ${position.join(', ') || 'Regular Position'}`);
            });
        }
    });
});