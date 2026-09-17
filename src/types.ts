export type MarketStatus = 'active' | 'inactive';
export type MarketSession = 'morning' | 'day' | 'night' | 'delhi';

export interface Market {
  id: string;
  name: string;
  slug: string;
  open_time: string; // e.g. "03:45 PM"
  close_time: string; // e.g. "05:45 PM"
  status: MarketStatus;
  display_order: number;
  session?: MarketSession;
  created_at?: string;
}

export interface OTCAnalysis {
  otc_digits: string[]; // 4 high-probability Ank
  cut_digits: Record<string, string>; // Cut map (e.g. 3->8)
  touch_digits: string[];
  confidence_score: number; // e.g. 91.2%
  recommended_panas_by_digit: Record<string, string[]>;
  family_jodis: string[];
  cycle_status: string;
}

export interface HistoricalResult {
  id: string;
  market_id: string;
  result_date: string; // YYYY-MM-DD
  open_pana: string; // 3 digits, e.g. "128"
  open_digit: string; // 1 digit, e.g. "1"
  jodi: string; // 2 digits, e.g. "19"
  close_digit: string; // 1 digit, e.g. "9"
  close_pana: string; // 3 digits, e.g. "469"
  created_at?: string;
  updated_at?: string;
}

export type PanaType = 'SP' | 'DP' | 'TP'; // Single Patti, Double Patti, Triple Patti

export interface PanaAnalysis {
  pana: string;
  type: PanaType;
  sum: number;
  frequency: number;
  recent_frequency: number;
  current_gap: number;
  avg_gap: number;
  max_gap: number;
  last_appearance: string | null;
  historical_percentage: number;
  model_score: number;
  factors: {
    frequency_score: number;
    recent_score: number;
    gap_score: number;
    digit_pattern_score: number;
    recurrence_score: number;
    jodi_relationship_score: number;
  };
}

export interface DigitAnalysis {
  digit: string; // "0" to "9"
  total_frequency: number;
  recent_frequency: number;
  current_gap: number;
  avg_gap: number;
  max_gap: number;
  last_appearance: string | null;
  historical_percentage: number;
  model_score: number;
  reason: string;
}

export interface JodiAnalysis {
  jodi: string; // "00" to "99"
  frequency: number;
  recent_frequency: number;
  current_gap: number;
  avg_gap: number;
  last_appearance: string | null;
  historical_percentage: number;
  related_open_digits: string[];
  related_close_digits: string[];
  model_score: number;
  reason: string;
}

export interface CandidatePrediction {
  rank: number;
  number: string;
  type: 'single' | 'jodi' | 'pana';
  model_score: number;
  historical_frequency: number;
  recent_frequency: number;
  current_gap: number;
  avg_gap: number;
  factors_summary: string;
  pana_type?: PanaType;
  sub_scores?: {
    frequency_weight: number;
    recency_weight: number;
    gap_weight: number;
    pattern_weight: number;
  };
}

export interface PredictionRun {
  id: string;
  market_id: string;
  prediction_date: string;
  model_version: string;
  training_data_count: number;
  generated_at: string;
  candidates?: PredictionCandidate[];
  ai_explanation?: string;
}

export interface PredictionCandidate {
  id: string;
  prediction_run_id: string;
  type: 'single' | 'jodi' | 'pana';
  candidate: string;
  rank: number;
  model_score: number;
  actual_result?: string | null;
  matched?: boolean | null;
  evaluated_at?: string | null;
  factors_summary?: string;
}

export interface MarketSummaryPrediction {
  market: Market;
  latest_result?: HistoricalResult | null;
  prediction_date: string;
  has_sufficient_data: boolean;
  training_count: number;
  top_single?: CandidatePrediction;
  top_jodi?: CandidatePrediction[];
  top_pana?: CandidatePrediction[];
  model_version: string;
}

export interface BacktestEvaluation {
  prediction_date: string;
  actual_single: string;
  actual_jodi: string;
  actual_open_pana: string;
  actual_close_pana: string;
  single_candidates: CandidatePrediction[];
  jodi_candidates: CandidatePrediction[];
  pana_candidates: CandidatePrediction[];
  hit_top1_single: boolean;
  hit_top5_single: boolean;
  hit_top1_jodi: boolean;
  hit_top5_jodi: boolean;
  hit_top10_jodi: boolean;
  hit_top5_pana: boolean;
  hit_top10_pana: boolean;
  hit_top20_pana: boolean;
}

export interface AccuracyReport {
  sample_size: number;
  date_range: { from: string; to: string };
  single: {
    top1_hit_rate: number;
    top3_hit_rate: number;
    top5_hit_rate: number;
  };
  jodi: {
    top1_hit_rate: number;
    top5_hit_rate: number;
    top10_hit_rate: number;
  };
  pana: {
    top5_hit_rate: number;
    top10_hit_rate: number;
    top20_hit_rate: number;
  };
  market_breakdown: {
    market_id: string;
    market_name: string;
    sample_size: number;
    single_top5: number;
    jodi_top10: number;
  }[];
}

export type TimeframeOption = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';
