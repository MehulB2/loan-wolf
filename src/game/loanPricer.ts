import { LGD, BASE_RATE, FUNDING_COST, RISK_PREMIUM } from './constants';

export function getCreditBand(pd: number): string {
  if (pd < 0.05) return 'Low';
  if (pd < 0.15) return 'Medium';
  if (pd < 0.30) return 'High';
  return 'VeryHigh';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateSuggestedRate(pd: number, _loanAmount: number): number {
  const band = getCreditBand(pd);
  const elMargin = pd * LGD;
  const rate = BASE_RATE + FUNDING_COST + elMargin + RISK_PREMIUM[band];
  return clamp(rate, 0.04, 0.35);
}
