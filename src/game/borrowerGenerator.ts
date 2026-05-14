import type { Borrower, BehavioralFlag, Industry, LoanPurpose } from '../types/borrower';
import type { EconomicEvent } from '../types/events';
import { getActiveMultiplier } from './economicEvents';
import { calculateSuggestedRate } from './loanPricer';

const NAMES = [
  'James Nguyen', 'Sarah Mitchell', 'David Chen', 'Emma Williams', 'Michael Torres',
  'Jessica Brown', 'Robert Kim', 'Amanda Johnson', 'Christopher Lee', 'Lauren Davis',
  'Matthew Wilson', 'Stephanie Taylor', 'Andrew Anderson', 'Rachel Thomas', 'Daniel Martinez',
  'Nicole Robinson', 'Joshua Clark', 'Megan Lewis', 'Ryan Walker', 'Ashley Hall',
  'Kevin Young', 'Samantha Allen', 'Brandon Scott', 'Brittany Green', 'Tyler Adams',
  'Kayla Baker', 'Justin Nelson', 'Danielle Carter', 'Aaron Mitchell', 'Tiffany Perez',
];

const INDUSTRIES: Industry[] = [
  'Real Estate', 'Technology', 'Healthcare', 'Retail', 'Mining',
  'Construction', 'Finance', 'Hospitality', 'Agriculture', 'Manufacturing',
];

const LOAN_PURPOSES: LoanPurpose[] = [
  'Home Purchase', 'Business Expansion', 'Debt Consolidation', 'Vehicle',
  'Medical', 'Education', 'Investment Property', 'Working Capital',
];

const BEHAVIORAL_FLAGS: BehavioralFlag[] = [
  'unstable_income', 'gambling', 'high_dti', 'overdraft_history', 'volatile_cashflow',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateCreditScore(round: number): number {
  // Round 1-10: skewed toward 600-800 (easier borrowers)
  // Round 11-20: balanced 450-780
  // Round 21-30: skewed toward 350-650 (riskier borrowers)
  if (round <= 10) {
    // Skew high - use beta-like distribution
    const base = randomInt(600, 800);
    const noise = randomInt(-50, 50);
    return clamp(base + noise, 550, 820);
  } else if (round <= 20) {
    return randomInt(450, 780);
  } else {
    const base = randomInt(350, 650);
    const noise = randomInt(-50, 50);
    return clamp(base + noise, 300, 700);
  }
}

function generateBehavioralFlags(round: number): BehavioralFlag[] {
  // Earlier rounds: fewer flags, later rounds: more
  let maxFlags: number;
  let flagProb: number;

  if (round <= 10) {
    maxFlags = 1;
    flagProb = 0.2;
  } else if (round <= 20) {
    maxFlags = 2;
    flagProb = 0.4;
  } else {
    maxFlags = 3;
    flagProb = 0.6;
  }

  const flags: BehavioralFlag[] = [];
  for (const flag of BEHAVIORAL_FLAGS) {
    if (flags.length >= maxFlags) break;
    if (Math.random() < flagProb) {
      flags.push(flag);
    }
  }
  return flags;
}

function generateLoanAmount(industry: Industry, annualIncome: number): number {
  const multipliers: Record<Industry, [number, number]> = {
    'Real Estate': [3, 8],
    'Technology': [0.5, 3],
    'Healthcare': [0.5, 2],
    'Retail': [0.3, 2],
    'Mining': [1, 4],
    'Construction': [1, 5],
    'Finance': [0.5, 3],
    'Hospitality': [0.3, 2],
    'Agriculture': [1, 4],
    'Manufacturing': [0.5, 3],
  };
  const [minMult, maxMult] = multipliers[industry];
  const amount = annualIncome * randomFloat(minMult, maxMult);
  // Round to nearest $5,000
  return Math.round(amount / 5000) * 5000;
}

export function generateBorrowers(count: number, round: number, events: EconomicEvent[]): Borrower[] {
  const usedNames = new Set<string>();
  const borrowers: Borrower[] = [];

  for (let i = 0; i < count; i++) {
    // Pick unique name
    let name: string;
    do {
      name = NAMES[Math.floor(Math.random() * NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);

    const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
    const loanPurpose = LOAN_PURPOSES[Math.floor(Math.random() * LOAN_PURPOSES.length)];
    const creditScore = generateCreditScore(round);
    const annualIncome = randomInt(45000, 250000);
    const monthlyIncome = annualIncome / 12;
    const dtiRatio = randomFloat(0.10, 0.45);
    const monthlyDebt = Math.round(monthlyIncome * dtiRatio);
    const behavioralFlags = generateBehavioralFlags(round);
    const employmentYears = randomFloat(0.5, 20);
    const loanAmount = generateLoanAmount(industry, annualIncome);

    // Calculate hidden PD
    const basePD = ((850 - creditScore) / 850) * 0.4;
    const dtiRatioActual = (monthlyDebt * 12) / annualIncome;
    const dtiPenalty = clamp(Math.max(0, (dtiRatioActual - 0.3)) * 0.3, 0, 0.3);
    const flagPenalty = behavioralFlags.length * 0.05;
    const rawPD = clamp(basePD + dtiPenalty + flagPenalty, 0.01, 0.95);

    // Apply economic multiplier
    const economicMultiplier = getActiveMultiplier(events, industry);
    const hiddenPD = clamp(rawPD * economicMultiplier, 0.01, 0.97);

    const suggestedRate = calculateSuggestedRate(hiddenPD, loanAmount);

    borrowers.push({
      id: `borrower_${Date.now()}_${i}`,
      name,
      industry,
      loanPurpose,
      loanAmount,
      annualIncome,
      monthlyDebt,
      creditScore,
      behavioralFlags,
      employmentYears: Math.round(employmentYears * 10) / 10,
      hiddenPD,
      suggestedRate,
    });
  }

  return borrowers;
}
