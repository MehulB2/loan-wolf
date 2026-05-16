export type LoanStatus = 'active' | 'defaulted' | 'repaid';
export type DecisionType = 'approve' | 'approve_premium' | 'reject';

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  hiddenPD: number;
  industry: string;
  purpose: string;
  round: number;
  status: LoanStatus;
  outcome?: 'default' | 'repaid';
  pnl?: number;
}

export interface RoundOutcome {
  loanId: string;
  borrowerName: string;
  outcome: 'default' | 'repaid';
  pnl: number;
  reason?: string;
}
