import type { Loan, RoundOutcome } from '../types/loan';
import type { EconomicEvent } from '../types/events';
import { LGD } from './constants';
import { getActiveMultiplier } from './economicEvents';

function generateDefaultReason(
  loan: Loan,
  multiplier: number,
  effectivePD: number,
  events: EconomicEvent[]
): string {
  const pdPct = Math.round(effectivePD * 100);
  const basePdPct = Math.round(loan.hiddenPD * 100);

  const affectingEvents = events.filter(e =>
    !e.affectedIndustries || e.affectedIndustries.includes(loan.industry)
  );

  if (affectingEvents.length > 0 && multiplier > 1.15) {
    const evt = affectingEvents[0];
    return `${evt.name} hit the ${loan.industry} sector hard, pushing this borrower's default probability from ${basePdPct}% up to ${pdPct}%.`;
  }

  if (effectivePD >= 0.7) {
    return `Extremely high-risk borrower — default probability was ${pdPct}%. The ${loan.purpose.toLowerCase()} loan was always a long shot.`;
  }

  if (effectivePD >= 0.45) {
    return `Above-average default risk at ${pdPct}%. ${loan.industry} sector conditions contributed to the shortfall.`;
  }

  if (effectivePD >= 0.25) {
    return `Moderate risk borrower (PD: ${pdPct}%) — even mid-range loans default occasionally. This one didn't repay.`;
  }

  return `Low-probability default — this borrower had only a ${pdPct}% chance of defaulting, but statistical variance happens.`;
}

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
        reason: generateDefaultReason(loan, multiplier, effectivePD, events),
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
