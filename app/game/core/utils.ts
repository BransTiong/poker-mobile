import { Card, Hand, HandRanking, GamePlayer } from './types';
import { RANK_VALUES } from './constants';

export const calculatePotSize = (players: GamePlayer[]): number => {
  return players.reduce((total, player) => total + player.bet, 0);
};

export const getNextActivePlayer = (
  players: GamePlayer[],
  currentPosition: number
): GamePlayer | undefined => {
  const sortedPlayers = [...players].sort((a, b) => a.position - b.position);
  const activePlayers = sortedPlayers.filter(
    (p) => p.status === 'ACTIVE' || p.status === 'ALL_IN'
  );

  const currentIndex = activePlayers.findIndex((p) => p.position === currentPosition);
  return activePlayers[(currentIndex + 1) % activePlayers.length];
};

export const isValidRaise = (
  amount: number,
  player: GamePlayer,
  currentBet: number,
  minRaise: number
): boolean => {
  return (
    amount >= currentBet + minRaise &&
    amount <= player.stack &&
    amount >= player.bet + (currentBet - player.bet)
  );
};

export const calculateSidePots = (players: GamePlayer[]): { amount: number; eligiblePlayers: string[] }[] => {
  const allInPlayers = players
    .filter((p) => p.status === 'ALL_IN')
    .sort((a, b) => a.bet - b.bet);

  return allInPlayers.map((player) => ({
    amount: players.reduce((total, p) => total + Math.min(p.bet, player.bet), 0),
    eligiblePlayers: players
      .filter((p) => p.status !== 'FOLDED' && p.bet >= player.bet)
      .map((p) => p.id),
  }));
};

export const compareCards = (a: Card, b: Card): number => {
  return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
};