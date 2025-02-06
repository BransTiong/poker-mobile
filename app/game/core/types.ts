import { HAND_RANKINGS } from './constants';

export type Suit = '♠' | '♣' | '♥' | '♦';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'A';

export type Card = {
  suit: Suit;
  rank: Rank;
  hidden?: boolean;
};

export type HandRanking = keyof typeof HAND_RANKINGS;

export type Hand = {
  cards: Card[];
  ranking: HandRanking;
  value: number;
};

export type GamePhase = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';
export type PlayerAction = 'CHECK' | 'CALL' | 'RAISE' | 'FOLD';
export type PlayerStatus = 'ACTIVE' | 'FOLDED' | 'ALL_IN' | 'SITTING_OUT' | 'LEFT';

export type GamePlayer = {
  id: string;
  name: string;
  stack: number;
  bet: number;
  cards: Card[];
  status: PlayerStatus;
  position: number;
  isBot?: boolean;
  hand?: Hand;
};

export enum GameState {
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED'
}

export interface Player {
    id: number;
    position: number;
    cards: Card[];
    chips: number;
    isDealer: boolean;
    isSmallBlind: boolean;
    isBigBlind: boolean;
}