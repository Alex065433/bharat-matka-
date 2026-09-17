import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Market, HistoricalResult, PredictionRun, PredictionCandidate } from '../types';
import { INITIAL_MARKETS, generateInitialHistoricalResults, generateInitialHistoricalResultsForMarkets } from './seedData';
import { calculateDigitFromPana } from '../lib/matkaMath';

const STORAGE_KEY_MARKETS = 'bharat_matka_markets_v2';
const STORAGE_KEY_RESULTS = 'bharat_matka_results_v2';
const STORAGE_KEY_RUNS = 'bharat_matka_runs_v2';
const STORAGE_KEY_CANDIDATES = 'bharat_matka_candidates_v2';
const STORAGE_KEY_CONFIG = 'bharat_matka_supabase_config_v2';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function getStoredConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored Supabase config:', e);
  }
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey && !envUrl.includes('xyzcompany')) {
    return { url: envUrl, anonKey: envKey };
  }
  return null;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url, anonKey }));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const config = getStoredConfig();
  if (config && config.url && config.anonKey) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(config.url, config.anonKey);
      } catch (err) {
        console.error('Failed to instantiate Supabase client:', err);
        supabaseInstance = null;
      }
    }
    return supabaseInstance;
  }
  return null;
}

// -------------------------------------------------------------------------
// LOCAL / HYBRID REPOSITORY LAYER
// -------------------------------------------------------------------------

function loadLocalMarkets(): Market[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MARKETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with INITIAL_MARKETS so all 24 Bharat Matka games always appear
        const existingMap = new Map<string, Market>(parsed.map((m: Market) => [m.id, m]));
        let modified = false;
        INITIAL_MARKETS.forEach((initM) => {
          if (!existingMap.has(initM.id)) {
            existingMap.set(initM.id, initM);
            modified = true;
          }
        });
        const mergedList = Array.from(existingMap.values()).sort((a, b) => a.display_order - b.display_order);
        if (modified) {
          saveLocalMarkets(mergedList);
        }
        return mergedList;
      }
    }
  } catch (e) {
    console.error('Error reading local markets:', e);
  }
  localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(INITIAL_MARKETS));
  return INITIAL_MARKETS;
}

function saveLocalMarkets(markets: Market[]): void {
  localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(markets));
}

function loadLocalResults(): HistoricalResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every market in INITIAL_MARKETS has historical records
        const existingMarketIds = new Set(parsed.map((r: HistoricalResult) => r.market_id));
        const missingMarkets = INITIAL_MARKETS.filter((m) => !existingMarketIds.has(m.id));
        if (missingMarkets.length > 0) {
          const addedResults = generateInitialHistoricalResultsForMarkets(missingMarkets);
          const combined = [...parsed, ...addedResults];
          saveLocalResults(combined);
          return combined;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local results:', e);
  }
  const seed = generateInitialHistoricalResults();
  localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(seed));
  return seed;
}

function saveLocalResults(results: HistoricalResult[]): void {
  localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
}

function loadLocalRuns(): PredictionRun[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RUNS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalRuns(runs: PredictionRun[]): void {
  localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(runs));
}

function loadLocalCandidates(): PredictionCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CANDIDATES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalCandidates(candidates: PredictionCandidate[]): void {
  localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
}

// -------------------------------------------------------------------------
// REPOSITORY API METHODS (DYNAMIC SUPABASE WITH INSTANT FALLBACK)
// -------------------------------------------------------------------------

export async function fetchMarkets(): Promise<Market[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('markets')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Market[];
      }
    } catch (err) {
      console.warn('Supabase fetchMarkets failed, using local storage:', err);
    }
  }
  return loadLocalMarkets();
}

export async function addMarket(market: Omit<Market, 'id'>): Promise<Market> {
  const newId = `m-${market.slug || Date.now()}`;
  const newMarket: Market = {
    ...market,
    id: newId,
    created_at: new Date().toISOString()
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('markets').insert([newMarket]).select().single();
      if (!error && data) return data as Market;
    } catch (err) {
      console.warn('Supabase addMarket failed, saving locally:', err);
    }
  }

  const markets = loadLocalMarkets();
  markets.push(newMarket);
  saveLocalMarkets(markets);
  return newMarket;
}

export async function updateMarket(id: string, updates: Partial<Market>): Promise<Market> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('markets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Market;
    } catch (err) {
      console.warn('Supabase updateMarket failed, updating locally:', err);
    }
  }

  const markets = loadLocalMarkets();
  const idx = markets.findIndex((m) => m.id === id);
  if (idx >= 0) {
    markets[idx] = { ...markets[idx], ...updates };
    saveLocalMarkets(markets);
    return markets[idx];
  }
  throw new Error('Market not found');
}

export async function deleteMarket(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('markets').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteMarket error:', e);
    }
  }
  const markets = loadLocalMarkets().filter((m) => m.id !== id);
  saveLocalMarkets(markets);
}

export async function fetchHistoricalResults(marketId?: string): Promise<HistoricalResult[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from('historical_results').select('*').order('result_date', { ascending: true });
      if (marketId) query = query.eq('market_id', marketId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as HistoricalResult[];
      }
    } catch (err) {
      console.warn('Supabase fetchHistoricalResults failed, fallback to local:', err);
    }
  }

  const all = loadLocalResults();
  if (marketId) {
    return all.filter((r) => r.market_id === marketId).sort((a, b) => a.result_date.localeCompare(b.result_date));
  }
  return all.sort((a, b) => a.result_date.localeCompare(b.result_date));
}

export async function saveHistoricalResult(
  record: Omit<HistoricalResult, 'id'>,
  id?: string
): Promise<HistoricalResult> {
  // Ensure single digit & jodi consistency
  const openDigit = record.open_digit || calculateDigitFromPana(record.open_pana);
  const closeDigit = record.close_digit || calculateDigitFromPana(record.close_pana);
  const jodi = record.jodi || `${openDigit}${closeDigit}`;

  const payload: HistoricalResult = {
    ...record,
    id: id || `res-${record.market_id}-${record.result_date}`,
    open_digit: openDigit,
    close_digit: closeDigit,
    jodi: jodi,
    updated_at: new Date().toISOString()
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('historical_results')
        .upsert(payload)
        .select()
        .single();
      if (!error && data) {
        await evaluatePastPredictions(data as HistoricalResult);
        return data as HistoricalResult;
      }
    } catch (err) {
      console.warn('Supabase saveHistoricalResult error, falling back locally:', err);
    }
  }

  const list = loadLocalResults();
  const existingIdx = list.findIndex(
    (r) => (id && r.id === id) || (r.market_id === record.market_id && r.result_date === record.result_date)
  );
  if (existingIdx >= 0) {
    list[existingIdx] = payload;
  } else {
    list.push(payload);
  }
  saveLocalResults(list);

  // Trigger evaluation
  await evaluatePastPredictions(payload);
  return payload;
}

export async function deleteHistoricalResult(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('historical_results').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const list = loadLocalResults().filter((r) => r.id !== id);
  saveLocalResults(list);
}

export async function bulkImportResults(
  records: Omit<HistoricalResult, 'id'>[]
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const rec of records) {
    const res = await saveHistoricalResult(rec);
    if (res) inserted++;
  }
  return { inserted, updated };
}

// -------------------------------------------------------------------------
// PREDICTION RUNS & ACCURACY EVALUATION
// -------------------------------------------------------------------------

export async function fetchPredictionRuns(marketId?: string): Promise<PredictionRun[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let q = sb.from('prediction_runs').select('*, candidates:prediction_candidates(*)').order('generated_at', { ascending: false });
      if (marketId) q = q.eq('market_id', marketId);
      const { data, error } = await q;
      if (!error && data) return data as PredictionRun[];
    } catch (err) {
      console.warn('Supabase fetchPredictionRuns error:', err);
    }
  }

  const runs = loadLocalRuns();
  const candidates = loadLocalCandidates();
  const filtered = marketId ? runs.filter((r) => r.market_id === marketId) : runs;

  return filtered.map((r) => ({
    ...r,
    candidates: candidates.filter((c) => c.prediction_run_id === r.id)
  })).sort((a, b) => b.generated_at.localeCompare(a.generated_at));
}

export async function savePredictionRunRecord(
  run: Omit<PredictionRun, 'id'>,
  candidates: Omit<PredictionCandidate, 'id' | 'prediction_run_id'>[]
): Promise<PredictionRun> {
  const runId = `run-${run.market_id}-${run.prediction_date}-${Date.now()}`;
  const fullRun: PredictionRun = {
    ...run,
    id: runId
  };

  const fullCandidates: PredictionCandidate[] = candidates.map((c, idx) => ({
    ...c,
    id: `cand-${runId}-${idx}`,
    prediction_run_id: runId
  }));

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('prediction_runs').insert([fullRun]);
      await sb.from('prediction_candidates').insert(fullCandidates);
      return { ...fullRun, candidates: fullCandidates };
    } catch (err) {
      console.warn('Supabase savePredictionRunRecord error, saving locally:', err);
    }
  }

  const runs = loadLocalRuns();
  runs.unshift(fullRun);
  saveLocalRuns(runs);

  const storedCandidates = loadLocalCandidates();
  saveLocalCandidates([...fullCandidates, ...storedCandidates]);

  return { ...fullRun, candidates: fullCandidates };
}

/**
 * Accuracy Engine: When the administrator enters the actual result,
 * automatically evaluate previous predictions for that market and date.
 */
export async function evaluatePastPredictions(result: HistoricalResult): Promise<number> {
  const runs = loadLocalRuns().filter(
    (r) => r.market_id === result.market_id && r.prediction_date === result.result_date
  );

  if (runs.length === 0) return 0;

  const allCandidates = loadLocalCandidates();
  let evaluatedCount = 0;

  runs.forEach((run) => {
    allCandidates.forEach((cand) => {
      if (cand.prediction_run_id === run.id) {
        let actual = '';
        let matched = false;

        if (cand.type === 'single') {
          actual = result.open_digit;
          matched = cand.candidate === result.open_digit || cand.candidate === result.close_digit;
        } else if (cand.type === 'jodi') {
          actual = result.jodi;
          matched = cand.candidate === result.jodi;
        } else if (cand.type === 'pana') {
          actual = `${result.open_pana}, ${result.close_pana}`;
          matched = cand.candidate === result.open_pana || cand.candidate === result.close_pana;
        }

        cand.actual_result = actual;
        cand.matched = matched;
        cand.evaluated_at = new Date().toISOString();
        evaluatedCount++;
      }
    });
  });

  saveLocalCandidates(allCandidates);
  return evaluatedCount;
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    const testUrl = url || getStoredConfig()?.url;
    const testKey = key || getStoredConfig()?.anonKey;
    if (!testUrl || !testKey) {
      return { success: false, message: 'No Supabase URL or Anon Key configured.' };
    }
    const client = createClient(testUrl, testKey);
    const { error } = await client.from('markets').select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase PostgreSQL successfully!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

export function isSupabaseConfigured(): boolean {
  return getStoredConfig() !== null;
}

export async function initializeDatabaseWithSeedData(): Promise<void> {
  // Ensure local markets & historical results are initialized if empty
  loadLocalMarkets();
  loadLocalResults();
}

export async function saveMarket(market: Market): Promise<Market> {
  return addMarket(market);
}

export const bulkImportHistoricalResults = bulkImportResults;
export const savePredictionRun = savePredictionRunRecord;
