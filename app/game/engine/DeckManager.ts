import * as Crypto from 'expo-crypto';
import { RANKS, SUITS } from '../core/constants';
import { Card, Rank, Suit } from '../core/types';

class DeckManager {
    private deck: Card[] = [];
    private serverSeed: string;
    private clientSeed: string | null = null;

    private generateServerSeed(): string {
        // Simple synchronous random seed generation
        return Math.random().toString(36).substring(2) +
               Math.random().toString(36).substring(2);
    }

    constructor(clientSeed?: string) {
        this.serverSeed = this.generateServerSeed();
        if (clientSeed) {
            this.clientSeed = clientSeed;
        }
        this.initializeDeck();
        this.shuffleDeck();
    }

    private initializeDeck() {
        this.deck = [];
        SUITS.forEach((suit: Suit) => {
            RANKS.forEach((rank: Rank) => {
                this.deck.push({
                    suit,
                    rank,
                    hidden: false
                });
            });
        });
    }

    private shuffleDeck() {
        const combinedSeed = this.clientSeed ? this.serverSeed + this.clientSeed : this.serverSeed;
        const rng = this.seededRNG(combinedSeed);

        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    private seededRNG(seed: string): () => number {
        // Using a simple hash function since we can't use crypto in React Native
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        // Seed the random number generator
        let state = hash;
        
        return function() {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 0xFFFFFFFF;
        };
    }

    public getDeck(): Card[] {
        return this.deck;
    }

    public drawCard(hidden: boolean = false): Card | undefined {
        const card = this.deck.pop();
        if (card) {
            card.hidden = hidden;
            return card;
        }
        return undefined;
    }

    public drawCards(count: number, hidden: boolean = false): Card[] {
        const cards: Card[] = [];
        for (let i = 0; i < count; i++) {
            const card = this.drawCard(hidden);
            if (card) cards.push(card);
        }
        return cards;
    }

    public getServerSeedHash(): string {
        // Using a simple hash function for demo purposes
        let hash = 0;
        for (let i = 0; i < this.serverSeed.length; i++) {
            const char = this.serverSeed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    public shuffle(): void {
        this.shuffleDeck();
    }

    public revealServerSeed(): string {
        return this.serverSeed;
    }

    public getRemainingCards(): number {
        return this.deck.length;
    }
}

export default DeckManager;
