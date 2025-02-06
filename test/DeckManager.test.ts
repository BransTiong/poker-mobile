import DeckManager from '../app/game/engine/DeckManager';
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('DeckManager', () => {
  let deckManager: DeckManager;

  beforeEach(() => {
    deckManager = new DeckManager();
  });

  test('should show initial deck state', () => {
    const deck = deckManager.getDeck();
    console.log('\nInitial Deck:');
    console.log(deck.map(card => `${card.rank}${card.suit}`).join(', '));
    expect(deck.length).toBe(52);
  });

  test('should show drawn cards', () => {
    const card = deckManager.drawCard();
    console.log('\nDrawn Card:', `${card?.rank}${card?.suit}`);
    
    const remainingDeck = deckManager.getDeck();
    console.log('Remaining Cards:', remainingDeck.length);
    console.log(remainingDeck.map(card => `${card.rank}${card.suit}`).join(', '));
  });

  test('should show multiple drawn cards', () => {
    const cards = deckManager.drawCards(5);
    console.log('\nDrawn 5 Cards:');
    console.log(cards.map(card => `${card.rank}${card.suit}`).join(', '));
    
    const remainingDeck = deckManager.getDeck();
    console.log('\nRemaining Cards:', remainingDeck.length);
    console.log(remainingDeck.map(card => `${card.rank}${card.suit}`).join(', '));
  });

  test('should show shuffled deck', () => {
    deckManager.shuffle();
    const shuffledDeck = deckManager.getDeck();
    console.log('\nShuffled Deck:');
    console.log(shuffledDeck.map(card => `${card.rank}${card.suit}`).join(', '));
  });

  test('should provide server seed hash', () => {
    const hash = deckManager.getServerSeedHash();
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 hash is 64 characters
  });

  test('should simulate a poker game deal with 2 players', () => {
    deckManager.shuffle();
    const shuffledDeck = deckManager.getDeck();
    console.log('\n SIMULATED GAME Shuffled Deck:');
    console.log(shuffledDeck.map(card => `${card.rank}${card.suit}`).join(', '));
    
    // Deal cards one at a time to each player
    const player1Cards = [];
    const player2Cards = [];
    
    // First round of cards
    player1Cards.push(deckManager.drawCard()!);  // First card to player 1
    player2Cards.push(deckManager.drawCard()!);  // First card to player 2
    
    // Second round of cards
    player1Cards.push(deckManager.drawCard()!);  // Second card to player 1
    player2Cards.push(deckManager.drawCard()!);  // Second card to player 2
    
    console.log('\nPlayer 1 Cards:');
    console.log(player1Cards.map(card => `${card.rank}${card.suit}`).join(', '));
    
    console.log('\nPlayer 2 Cards:');
    console.log(player2Cards.map(card => `${card.rank}${card.suit}`).join(', '));

    const burnCard = []
    
    // Burn a card and deal the flop (3 cards)
    burnCard.push(deckManager.drawCard()); // Burn
    const flopCards = deckManager.drawCards(3);
    
    // Burn a card and deal the turn (1 card)
    burnCard.push(deckManager.drawCard()); // Burn
    const turnCard = deckManager.drawCard();
    
    // Burn a card and deal the river (1 card)
    burnCard.push(deckManager.drawCard()); // Burn
    const riverCard = deckManager.drawCard();
    
    const communityCards = [...flopCards, turnCard!, riverCard!];
    
    console.log('\nCommunity Cards:');
    console.log('Flop:', flopCards.map(card => `${card.rank}${card.suit}`).join(', '));
    console.log('Turn:', `${turnCard?.rank}${turnCard?.suit}`);
    console.log('River:', `${riverCard?.rank}${riverCard?.suit}`);

    console.log('\nBurn Cards:');
    console.log(burnCard.map(card => `${card?.rank}${card?.suit}`).join(', '));

    const remainingDeck = deckManager.getDeck();
    console.log('Remaining Cards:', remainingDeck.length);
    console.log(remainingDeck.map(card => `${card.rank}${card.suit}`).join(', '));
    
    // Verify correct number of remaining cards
    // Initial deck (52) - player cards (4) - community cards (5) - burn cards (3) = 40
    expect(deckManager.getRemainingCards()).toBe(40);
  });
});