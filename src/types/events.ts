export type EventType = 'recession' | 'rate_hike' | 'housing_boom' | 'mining_boom' | 'inflation_spike' | 'sme_downturn' | 'tech_crash' | 'rate_cut';

export interface EconomicEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  icon: string;
  pdMultiplier: number;
  rateEffect: number;
  affectedIndustries?: string[];
  duration: number;
  roundsRemaining: number;
  severity: 'low' | 'medium' | 'high';
}
