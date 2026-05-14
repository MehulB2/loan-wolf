import type { Loan, RoundOutcome } from '../types/loan';
import type { EconomicEvent } from '../types/events';
import { LGD } from './constants';
import { getActiveMultiplier } from './economicEvents';

export function resolveLoans(
  loans: Loan[],
  events: EconomicEvent[]
): { updatedLoans: Loan[]; outcomes: RoundOutcome[]; cashDelta: number } {
  const updatedLoans: Loan[] = [];
  const outcomes: RoundOutcome[] = [];
  let cashDelta = 0;

  for (const loan of loans) {
    if (loan.status !== 'active') {
      updatedLoans.push(loan);
      continue;
    }

    const multiplier = getActiveMultiplier(events, loan.industry);
    const effectivePD = Math.min(loan.hiddenPD * multiplier, 0.97);
    const roll = Math.random();

    if (roll < effectivePD) {
      // Default
      const loss = loan.amount * LGD;
      const updatedLoan: Loan = {
        ...loan,
        status: 'defaulted',
        outcome: 'default',
        pnl: -loss,
      };
      updatedLoans.push(updatedLoan);
      outcomes.push({
        loanId: loan.id,
        borrowerName: loan.borrowerName,
        outcome: 'default',
        pnl: -loss,
      });
      cashDelta -= loss;
    } else {
      // Repaid
      const gain = loan.amount * (loan.interestRate / 12);
      const updatedLoan: Loan = {
        ...loan,
        status: 'repaid',
        outcome: 'repaid',
        pnl: gain,
      };
      updatedLoans.push(updatedLoan);
      outcomes.push({
        loanId: loan.id,
        borrowerName: loan.borrowerName,
        outcome: 'repaid',
        pnl: gain,
      });
      cashDelta += gain;
    }
  }

  return { updatedLoans, outcomes, cashDelta };
}

export function calculatePortfolioEL(loans: Loan[], events: EconomicEvent[]): number {
  return loans
    .filter(l => l.status === 'active')
    .reduce((sum, loan) => {
      const multiplier = getActiveMultiplier(events, loan.industry);
      const effectivePD = Math.min(loan.hiddenPD * multiplier, 0.97);
      return sum + effectivePD * LGD * loan.amount;
    }, 0);
}
