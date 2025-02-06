import { Rank } from './types';

export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'] as const;
export const SUITS = ['♠', '♣', '♥', '♦'] as const;

export const HAND_RANKINGS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_A_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  ONE_PAIR: 2,
  HIGH_CARD: 1,
} as const;

export const RANK_VALUES: Record<Rank, number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
} as const;

export const MAX_PLAYERS = 9;
export const MIN_PLAYERS = 2;
export const STARTING_STACK = 200;