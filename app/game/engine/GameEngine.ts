import DeckManager from './DeckManager';
import { Card, Player, GameState } from '../core/types';

class GameEngine {
    private deckManager: DeckManager;
    private players: Player[];
    private dealerPosition: number;
    private gameState: GameState;
    private communityCards: Card[];
    private burnedCards: Card[];

    constructor(numberOfPlayers: number = 5) {
        this.deckManager = new DeckManager();
        this.players = this.initializePlayers(numberOfPlayers);
        this.dealerPosition = this.randomizeDealer(numberOfPlayers);
        this.gameState = GameState.WAITING;
        this.communityCards = [];
        this.burnedCards = [];
        this.deckManager.shuffle();
        this.assignPositions();
    }

    private initializePlayers(count: number): Player[] {
        return Array.from({ length: count }, (_, index) => ({
            id: (index + 1).toString(),
            name: `Player ${index + 1}`,
            position: index,
            cards: [],
            chips: 1000,
            stack: 1000,
            bet: 0,
            status: 'ACTIVE',
            isDealer: false,
            isSmallBlind: false,
            isBigBlind: false
        }));
    }

    private randomizeDealer(count: number): number {
        return Math.floor(Math.random() * count);
    }

    private assignPositions(): void {
        const count = this.players.length;
        
        // Reset all positions
        this.players.forEach(player => {
            player.isDealer = false;
            player.isSmallBlind = false;
            player.isBigBlind = false;
        });

        // Assign dealer
        this.players[this.dealerPosition].isDealer = true;

        // Assign small blind (next player after dealer)
        const smallBlindPos = (this.dealerPosition + 1) % count;
        this.players[smallBlindPos].isSmallBlind = true;

        // Assign big blind (next player after small blind)
        const bigBlindPos = (this.dealerPosition + 2) % count;
        this.players[bigBlindPos].isBigBlind = true;
    }

    public startNewHand(): void {
        // Create a new deck manager for each hand
        this.deckManager = new DeckManager();
        this.deckManager.shuffle();

        // Clear previous hand data
        this.communityCards = [];
        this.burnedCards = [];
        this.players.forEach(player => player.cards = []);

        // Assign dealer, small blind, and big blind positions
        this.assignPositions();

        // Deal cards to players
        this.dealHoleCards();

        // Deal community cards
        this.dealCommunityCards();

        // Move dealer button for next hand
        this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
    }

    private dealHoleCards(): void {
        // Deal first card to each player, starting with small blind
        for (let i = 0; i < this.players.length; i++) {
            const playerIndex = (this.dealerPosition + 1 + i) % this.players.length; // Start with small blind
            const card = this.deckManager.drawCard();
            if (card) this.players[playerIndex].cards.push(card);
        }

        // Deal second card to each player, starting with small blind
        for (let i = 0; i < this.players.length; i++) {
            const playerIndex = (this.dealerPosition + 1 + i) % this.players.length; // Start with small blind
            const card = this.deckManager.drawCard();
            if (card) this.players[playerIndex].cards.push(card);
        }
    }

    private dealCommunityCards(): void {
        // Burn and deal flop
        this.burnedCards.push(this.deckManager.drawCard()!);
        const flop = this.deckManager.drawCards(3);
        this.communityCards.push(...flop);

        // Burn and deal turn
        this.burnedCards.push(this.deckManager.drawCard()!);
        const turn = this.deckManager.drawCard();
        if (turn) this.communityCards.push(turn);

        // Burn and deal river
        this.burnedCards.push(this.deckManager.drawCard()!);
        const river = this.deckManager.drawCard();
        if (river) this.communityCards.push(river);
    }

    public getGameState() {
        return {
            players: this.players,
            dealerPosition: this.dealerPosition,
            communityCards: this.communityCards,
            burnedCards: this.burnedCards,
            remainingCards: this.deckManager.getRemainingCards(),
            deck: this.deckManager.getDeck()
        };
    }
}

export default GameEngine;
