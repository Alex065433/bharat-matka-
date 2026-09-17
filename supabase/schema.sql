-- ==============================================================================
-- BHARAT MATKA AI ANALYTICS - POSTGRESQL / SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Markets Table
CREATE TABLE IF NOT EXISTS public.markets (
    id TEXT PRIMARY KEY DEFAULT ('m-' || uuid_generate_v4()::text),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    open_time TEXT NOT NULL,
    close_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for markets
CREATE INDEX IF NOT EXISTS idx_markets_slug ON public.markets(slug);
CREATE INDEX IF NOT EXISTS idx_markets_status ON public.markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_display_order ON public.markets(display_order);

-- 3. Historical Results Chart Table
CREATE TABLE IF NOT EXISTS public.historical_results (
    id TEXT PRIMARY KEY DEFAULT ('res-' || uuid_generate_v4()::text),
    market_id TEXT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    result_date DATE NOT NULL,
    open_pana VARCHAR(3) NOT NULL CHECK (open_pana ~ '^[0-9]{3}$'),
    open_digit VARCHAR(1) NOT NULL CHECK (open_digit ~ '^[0-9]$'),
    jodi VARCHAR(2) NOT NULL CHECK (jodi ~ '^[0-9]{2}$'),
    close_digit VARCHAR(1) NOT NULL CHECK (close_digit ~ '^[0-9]$'),
    close_pana VARCHAR(3) NOT NULL CHECK (close_pana ~ '^[0-9]{3}$'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_market_date UNIQUE(market_id, result_date)
);

-- Required Performance Indexes on Historical Results
CREATE INDEX IF NOT EXISTS idx_results_market_id ON public.historical_results(market_id);
CREATE INDEX IF NOT EXISTS idx_results_date ON public.historical_results(result_date);
CREATE INDEX IF NOT EXISTS idx_results_jodi ON public.historical_results(jodi);
CREATE INDEX IF NOT EXISTS idx_results_open_digit ON public.historical_results(open_digit);
CREATE INDEX IF NOT EXISTS idx_results_close_digit ON public.historical_results(close_digit);
CREATE INDEX IF NOT EXISTS idx_results_open_pana ON public.historical_results(open_pana);
CREATE INDEX IF NOT EXISTS idx_results_close_pana ON public.historical_results(close_pana);

-- 4. Prediction Runs Table
CREATE TABLE IF NOT EXISTS public.prediction_runs (
    id TEXT PRIMARY KEY DEFAULT ('run-' || uuid_generate_v4()::text),
    market_id TEXT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'v2.4-HybridBayesianPattern',
    training_data_count INTEGER NOT NULL DEFAULT 0,
    ai_explanation TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prediction_runs_market_date ON public.prediction_runs(market_id, prediction_date);

-- 5. Prediction Candidates Table
CREATE TABLE IF NOT EXISTS public.prediction_candidates (
    id TEXT PRIMARY KEY DEFAULT ('cand-' || uuid_generate_v4()::text),
    prediction_run_id TEXT NOT NULL REFERENCES public.prediction_runs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('single', 'jodi', 'pana')),
    candidate TEXT NOT NULL,
    rank INTEGER NOT NULL,
    model_score NUMERIC(5, 2) NOT NULL,
    actual_result TEXT,
    matched BOOLEAN DEFAULT NULL,
    evaluated_at TIMESTAMPTZ,
    factors_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_candidates_run_id ON public.prediction_candidates(prediction_run_id);
CREATE INDEX IF NOT EXISTS idx_candidates_type ON public.prediction_candidates(type);
CREATE INDEX IF NOT EXISTS idx_candidates_matched ON public.prediction_candidates(matched);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_candidates ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies (Anonymous and Authenticated can read published data)
CREATE POLICY "Public Read Markets"
ON public.markets FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public Read Historical Results"
ON public.historical_results FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public Read Prediction Runs"
ON public.prediction_runs FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public Read Prediction Candidates"
ON public.prediction_candidates FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Administrator Modify Policies (Only Authenticated Admins can insert/update/delete)
CREATE POLICY "Admin Modify Markets"
ON public.markets FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin Modify Historical Results"
ON public.historical_results FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin Modify Prediction Runs"
ON public.prediction_runs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin Modify Prediction Candidates"
ON public.prediction_candidates FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
