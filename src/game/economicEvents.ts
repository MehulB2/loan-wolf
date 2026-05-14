import type { EconomicEvent, EventType } from '../types/events';

interface EventTemplate {
  type: EventType;
  name: string;
  description: string;
  icon: string;
  pdMultiplier: number;
  rateEffect: number;
  affectedIndustries?: string[];
  duration: number;
  severity: 'low' | 'medium' | 'high';
}

export const EVENT_LIBRARY: EventTemplate[] = [
  {
    type: 'recession',
    name: 'Recession',
    description: 'Economic downturn increases default risk across all sectors.',
    icon: '📉',
    pdMultiplier: 2.0,
    rateEffect: -100,
    duration: 3,
    severity: 'high',
  },
  {
    type: 'rate_hike',
    name: 'Rate Hike',
    description: 'Central bank raises rates, increasing borrowing costs.',
    icon: '📈',
    pdMultiplier: 1.2,
    rateEffect: 200,
    duration: 2,
    severity: 'medium',
  },
  {
    type: 'housing_boom',
    name: 'Housing Boom',
    description: 'Property values surge, reducing real estate default risk.',
    icon: '🏠',
    pdMultiplier: 0.6,
    rateEffect: 50,
    affectedIndustries: ['Real Estate', 'Construction'],
    duration: 3,
    severity: 'low',
  },
  {
    type: 'mining_boom',
    name: 'Mining Boom',
    description: 'Commodity prices spike, boosting resource sectors.',
    icon: '⛏️',
    pdMultiplier: 0.7,
    rateEffect: 100,
    affectedIndustries: ['Mining', 'Agriculture'],
    duration: 2,
    severity: 'low',
  },
  {
    type: 'inflation_spike',
    name: 'Inflation Spike',
    description: 'Rising prices erode purchasing power and increase defaults.',
    icon: '💸',
    pdMultiplier: 1.4,
    rateEffect: 150,
    duration: 2,
    severity: 'medium',
  },
  {
    type: 'sme_downturn',
    name: 'SME Downturn',
    description: 'Small and medium businesses face severe cash flow crunch.',
    icon: '🏪',
    pdMultiplier: 1.8,
    rateEffect: 0,
    affectedIndustries: ['Retail', 'Hospitality', 'Manufacturing'],
    duration: 3,
    severity: 'high',
  },
  {
    type: 'tech_crash',
    name: 'Tech Crash',
    description: 'Technology sector valuations collapse amid market correction.',
    icon: '💻',
    pdMultiplier: 1.6,
    rateEffect: -50,
    affectedIndustries: ['Technology'],
    duration: 2,
    severity: 'high',
  },
  {
    type: 'rate_cut',
    name: 'Rate Cut',
    description: 'Central bank cuts rates, easing financial conditions.',
    icon: '✂️',
    pdMultiplier: 0.9,
    rateEffect: -150,
    duration: 2,
    severity: 'low',
  },
];

export function getActiveMultiplier(events: EconomicEvent[], industry?: string): number {
  let multiplier = 1.0;
  for (const event of events) {
    if (!event.affectedIndustries || !industry) {
      multiplier *= event.pdMultiplier;
    } else if (event.affectedIndustries.includes(industry)) {
      multiplier *= event.pdMultiplier;
    }
  }
  return multiplier;
}

export function maybeSpawnEvent(round: number, activeEvents: EconomicEvent[]): EconomicEvent | null {
  // Probability increases with round number
  const baseProb = 0.15 + (round / 30) * 0.25;
  if (Math.random() > baseProb) return null;

  // Don't spawn if too many active events
  if (activeEvents.length >= 3) return null;

  // Get active event types to avoid duplicates
  const activeTypes = new Set(activeEvents.map(e => e.type));
  const available = EVENT_LIBRARY.filter(e => !activeTypes.has(e.type));
  if (available.length === 0) return null;

  // Weight toward more severe events in later rounds
  let pool: EventTemplate[];
  if (round >= 20) {
    pool = available.filter(e => e.severity === 'high' || e.severity === 'medium');
    if (pool.length === 0) pool = available;
  } else if (round >= 10) {
    pool = available;
  } else {
    pool = available.filter(e => e.severity === 'low' || e.severity === 'medium');
    if (pool.length === 0) pool = available;
  }

  const template = pool[Math.floor(Math.random() * pool.length)];
  const newEvent: EconomicEvent = {
    ...template,
    id: `${template.type}_${Date.now()}`,
    roundsRemaining: template.duration,
  };

  return newEvent;
}
