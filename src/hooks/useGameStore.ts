import { create } from 'zustand';
import type { GameState, GamePhase, GameResult, RoundHistory } from '../types/gameState';
import type { Loan } from '../types/loan';
import { STARTING_CASH, MAX_ROUNDS, BORROWERS_PER_ROUND, PREMIUM_BONUS, BANKRUPTCY_THRESHOLD } from '../game/constants';
import { generateBorrowers } from '../game/borrowerGenerator';
import { resolveLoans } from '../game/defaultEngine';
import { maybeSpawnEvent } from '../game/economicEvents';
import { upsertScore } from '../utils/firebase';

const initialState = {
  phase: 'start' as GamePhase,
  result: null as GameResult,
  round: 1,
  maxRounds: MAX_ROUNDS,
  cash: STARTING_CASH,
  startingCash: STARTING_CASH,
  totalProfit: 0,
  reputation: 75,
  activeLoans: [] as Loan[],
  loanHistory: [] as Loan[],
  currentBorrowers: [],
  activeEvents: [],
  roundHistory: [] as RoundHistory[],
  lastRoundOutcomes: [],
  score: 0,
  playerName: '',
  gameId: null as string | null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  startGame: (mode: 10 | 20 | 30) => {
    const events: never[] = [];
    const borrowers = generateBorrowers(BORROWERS_PER_ROUND, 1, events);
    const gameId = crypto.randomUUID();
    const { playerName } = get();
    set({
      ...initialState,
      phase: 'playing',
      maxRounds: mode,
      currentBorrowers: borrowers,
      activeEvents: [],
      activeLoans: [],
      loanHistory: [],
      roundHistory: [],
      lastRoundOutcomes: [],
      cash: STARTING_CASH,
      totalProfit: 0,
      reputation: 75,
      round: 1,
      score: 0,
      result: null,
      playerName,
      gameId,
    });
    upsertScore(gameId, playerName, 0, 1, mode, 0);
  },

  approveLoan: (borrowerId: string, premium: boolean) => {
    const state = get();
    const borrower = state.currentBorrowers.find(b => b.id === borrowerId);
    if (!borrower) return;

    const rate = borrower.suggestedRate + (premium ? PREMIUM_BONUS : 0);
    const loan: Loan = {
      id: `loan_${Date.now()}_${borrowerId}`,
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      amount: borrower.loanAmount,
      interestRate: rate,
      hiddenPD: borrower.hiddenPD,
      industry: borrower.industry,
      purpose: borrower.loanPurpose,
      round: state.round,
      status: 'active',
    };

    const newBorrowers = state.currentBorrowers.filter(b => b.id !== borrowerId);
    set({
      activeLoans: [...state.activeLoans, loan],
      currentBorrowers: newBorrowers,
    });

    // Auto-resolve if all borrowers are processed
    if (newBorrowers.length === 0) {
      get().resolveRound();
    }
  },

  rejectBorrower: (borrowerId: string) => {
    const state = get();
    const newBorrowers = state.currentBorrowers.filter(b => b.id !== borrowerId);
    const newRep = Math.max(0, state.reputation - 2);
    set({
      currentBorrowers: newBorrowers,
      reputation: newRep,
    });

    if (newBorrowers.length === 0) {
      get().resolveRound();
    }
  },

  resolveRound: () => {
    const state = get();
    if (state.phase === 'resolving') return; // Prevent double-resolve

    set({ phase: 'resolving' });

    // Use setTimeout to allow UI to show resolving state
    setTimeout(() => {
      const currentState = get();
      const { updatedLoans, outcomes, cashDelta } = resolveLoans(
        currentState.activeLoans,
        currentState.activeEvents
      );

      const newCash = currentState.cash + cashDelta;
      const newTotalProfit = currentState.totalProfit + cashDelta;

      // Update reputation based on outcomes
      let repDelta = 0;
      for (const outcome of outcomes) {
        if (outcome.outcome === 'default') repDelta -= 5;
        else repDelta += 1;
      }
      const newRep = Math.min(100, Math.max(0, currentState.reputation + repDelta));

      // Separate active from resolved loans
      const resolvedLoans = updatedLoans.filter(l => l.status !== 'active');
      const stillActiveLoans = updatedLoans.filter(l => l.status === 'active');

      // Tick down events and remove expired ones
      const tickedEvents = currentState.activeEvents
        .map(e => ({ ...e, roundsRemaining: e.roundsRemaining - 1 }))
        .filter(e => e.roundsRemaining > 0);

      // Maybe spawn new event
      const newEvent = maybeSpawnEvent(currentState.round, tickedEvents);
      const newActiveEvents = newEvent ? [...tickedEvents, newEvent] : tickedEvents;

      // Record round history
      const totalResolved = resolvedLoans.length + currentState.loanHistory.length;
      const totalDefaulted = [...resolvedLoans, ...currentState.loanHistory].filter(
        l => l.status === 'defaulted'
      ).length;
      const defaultRate = totalResolved > 0 ? totalDefaulted / totalResolved : 0;

      const roundEntry: RoundHistory = {
        round: currentState.round,
        profit: cashDelta,
        cash: newCash,
        defaultRate,
      };

      const newScore = newTotalProfit + newRep * 1000;

      const { gameId, playerName } = currentState;

      // Check game end conditions
      if (newCash <= BANKRUPTCY_THRESHOLD) {
        set({
          phase: 'gameover',
          result: 'bankrupt',
          cash: newCash,
          totalProfit: newTotalProfit,
          reputation: newRep,
          activeLoans: stillActiveLoans,
          loanHistory: [...currentState.loanHistory, ...resolvedLoans],
          activeEvents: newActiveEvents,
          roundHistory: [...currentState.roundHistory, roundEntry],
          lastRoundOutcomes: outcomes,
          score: newScore,
        });
        if (gameId) upsertScore(gameId, playerName, newScore, currentState.round, currentState.maxRounds, defaultRate);
        return;
      }

      if (currentState.round >= currentState.maxRounds) {
        set({
          phase: 'gameover',
          result: 'win',
          cash: newCash,
          totalProfit: newTotalProfit,
          reputation: newRep,
          activeLoans: stillActiveLoans,
          loanHistory: [...currentState.loanHistory, ...resolvedLoans],
          activeEvents: newActiveEvents,
          roundHistory: [...currentState.roundHistory, roundEntry],
          lastRoundOutcomes: outcomes,
          score: newScore,
        });
        if (gameId) upsertScore(gameId, playerName, newScore, currentState.round, currentState.maxRounds, defaultRate);
        return;
      }

      // Advance to next round
      const nextRound = currentState.round + 1;
      const newBorrowers = generateBorrowers(BORROWERS_PER_ROUND, nextRound, newActiveEvents);

      set({
        phase: 'playing',
        round: nextRound,
        cash: newCash,
        totalProfit: newTotalProfit,
        reputation: newRep,
        activeLoans: stillActiveLoans,
        loanHistory: [...currentState.loanHistory, ...resolvedLoans],
        currentBorrowers: newBorrowers,
        activeEvents: newActiveEvents,
        roundHistory: [...currentState.roundHistory, roundEntry],
        lastRoundOutcomes: outcomes,
        score: newScore,
      });
      if (gameId) upsertScore(gameId, playerName, newScore, currentState.round, currentState.maxRounds, defaultRate);
    }, 1500);
  },

  resetGame: () => {
    const { playerName } = get();
    set({ ...initialState, phase: 'start', playerName, gameId: null });
  },

  openLeaderboard: () => set({ phase: 'leaderboard' }),
  closeLeaderboard: () => set({ phase: 'start' }),
  setPlayerName: (name: string) => set({ playerName: name }),
}));
