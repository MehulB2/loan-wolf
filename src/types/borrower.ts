export type BehavioralFlag = 'unstable_income' | 'gambling' | 'high_dti' | 'overdraft_history' | 'volatile_cashflow';

export type Industry = 'Real Estate' | 'Technology' | 'Healthcare' | 'Retail' | 'Mining' | 'Construction' | 'Finance' | 'Hospitality' | 'Agriculture' | 'Manufacturing';

export type LoanPurpose = 'Home Purchase' | 'Business Expansion' | 'Debt Consolidation' | 'Vehicle' | 'Medical' | 'Education' | 'Investment Property' | 'Working Capital';

export interface Borrower {
  id: string;
  name: string;
  industry: Industry;
  loanPurpose: LoanPurpose;
  loanAmount: number;
  annualIncome: number;
  monthlyDebt: number;
  creditScore: number;
  behavioralFlags: BehavioralFlag[];
  employmentYears: number;
  hiddenPD: number;
  suggestedRate: number;
}
