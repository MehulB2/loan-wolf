export const STARTING_CASH = 1_000_000;
export const MAX_ROUNDS = 30;
export const LGD = 0.45;
export const BASE_RATE = 0.05;
export const FUNDING_COST = 0.02;
export const PREMIUM_BONUS = 0.025;
export const BANKRUPTCY_THRESHOLD = 0;
export const BORROWERS_PER_ROUND = 3;

export const RISK_PREMIUM: Record<string, number> = {
  Low: 0.01,
  Medium: 0.03,
  High: 0.06,
  VeryHigh: 0.10,
};

export const PD_BANDS = {
  Low: 0.05,
  Medium: 0.15,
  High: 0.30,
};
