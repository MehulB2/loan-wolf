import type { Borrower } from './borrower';
import type { Loan, RoundOutcome } from './loan';
import type { EconomicEvent } from './events';

export type GamePhase = 'start' | 'playing' | 'resolving' | 'gameover' | 'leaderboard';
export type GameResult = 'win' | 'bankrupt' | null;

export interface RoundHistory {
  round: number;
  profit: number;
  cash: number;
  defaultRate: number;
}

export interface GameState {
  phase: GamePhase;
  result: GameResult;
  round: number;
  maxRounds: number;
  cash: number;
  startingCash: number;
  totalProfit: number;
  reputation: number;
  activeLoans: Loan[];
  loanHistory: Loan[];
  currentBorrowers: Borrower[];
  activeEvents: EconomicEvent[];
  roundHistory: RoundHistory[];
  lastRoundOutcomes: RoundOutcome[];
  score: number;

  startGame: (mode: 10 | 20 | 30) => void;
  approveLoan: (borrowerId: string, premium: boolean) => void;
  rejectBorrower: (borrowerId: string) => void;
  resolveRound: () => void;
  resetGame: () => void;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
}
