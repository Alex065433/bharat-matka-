import React, { useState } from 'react';
import { Market, HistoricalResult } from '../types';
import { MarketCard } from '../components/MarketCard';
import {
  Sparkles,
  TrendingUp,
  Calendar,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Search
} from 'lucide-react';

interface HomePageProps {
  markets: Market[];
  results: HistoricalResult[];
  onNavigate: (page: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  markets,
  results,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<'all' | 'morning' | 'day' | 'night' | 'delhi'>('all');

  // Map latest result for each market
  const latestResultMap: Record<string, HistoricalResult> = {};
  results.forEach((r) => {
    const existing = latestResultMap[r.market_id];
    if (!existing || r.result_date > existing.result_date) {
      latestResultMap[r.market_id] = r;
    }
  });

  const sessionFiltered = selectedSession === 'all'
    ? markets
    : markets.filter((m) => m.session === selectedSession);

  const filteredMarkets = sessionFiltered.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const counts = {
    all: markets.length,
    morning: markets.filter(m => m.session === 'morning').length,
    day: markets.filter(m => m.session === 'day').length,
    night: markets.filter(m => m.session === 'night').length,
    delhi: markets.filter(m => m.session === 'delhi').length
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Analytical Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Statistical Modeling Engine • Version 2.4</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            BHARAT MATKA <span className="text-amber-400">AI ANALYTICS</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Historical chart pattern analysis, cycle interval distributions, and transparent multi-factor
            candidate ranking for all major Matka markets. Built on empirical data with zero future-data leakage.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              id="hero-btn-predictions"
              onClick={() => onNavigate('predictions')}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Today's Statistical Predictions</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              id="hero-btn-charts"
              onClick={() => onNavigate('chart')}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Historical Panel Charts</span>
            </button>
            <button
              id="hero-btn-backtest"
              onClick={() => onNavigate('backtest')}
              className="px-4 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-mono text-sm flex items-center gap-2 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Model Accuracy Report</span>
            </button>
          </div>
        </div>

        {/* Quick Analytical Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Pana Analysis</div>
            <div className="font-mono text-base font-semibold text-white mt-1">220 Panas Tracked</div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">SP, DP, TP Classification</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Single Digits</div>
            <div className="font-mono text-base font-semibold text-white mt-1">Digits 0 - 9</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">Modulo-10 Verified</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Jodi Matrix</div>
            <div className="font-mono text-base font-semibold text-white mt-1">100 Combinations</div>
            <div className="text-[11px] text-blue-400/80 mt-0.5">Cycle Gap Analysis</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Backtest Discipline</div>
            <div className="font-mono text-base font-semibold text-white mt-1">Zero Leakage</div>
            <div className="text-[11px] text-purple-400/80 mt-0.5">Empirically Audited</div>
          </div>
        </div>
      </section>

      {/* Today's Results Live Board */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <span>Bharat Matka Live Markets</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {markets.length} Games
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Complete directory of Morning, Day, Night, and Delhi regional games with real-time analysis
            </p>
          </div>
          {/* Market Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Session Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-800/80">
          {(
            [
              { id: 'all', label: 'All Games', count: counts.all },
              { id: 'morning', label: 'Morning Session', count: counts.morning },
              { id: 'day', label: 'Day Session', count: counts.day },
              { id: 'night', label: 'Night Session', count: counts.night },
              { id: 'delhi', label: 'Delhi King', count: counts.delhi }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSession(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedSession === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedSession === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              latestResult={latestResultMap[market.id]}
              onSelectMarket={(slug, action) => {
                if (action === 'prediction') {
                  onNavigate('prediction-detail', slug);
                } else {
                  onNavigate('chart', slug);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Featured Section: How the Statistical Engine Operates */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="max-w-2xl">
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            Transparent Multi-Factor Model Scoring
          </h3>
          <p className="text-sm text-slate-400">
            Unlike arbitrary random number pickers, Bharat Matka AI Analytics uses historical data
            with a reproducible formula scoring each candidate across 6 distinct statistical axes:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm font-mono">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Frequency & Recency</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compares long-term observed presence against expected normal distributions, supplemented by recent 20-draw momentum.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Cycle Gap Analysis</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates current gap versus average historical gap while capping overdue penalties to prevent the Gambler's Fallacy.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm font-mono">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Digit & Pattern Harmony</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Correlates Single Patti, Double Patti, and Triple Patti distributions with derived digit sum parity modulo 10.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
