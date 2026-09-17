import React, { useState } from 'react';
import { Market, HistoricalResult } from '../types';
import { generatePredictions, MODEL_VERSION } from '../lib/predictionEngine';
import {
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Clock,
  Filter,
  Search,
  LayoutGrid,
  Table,
  Flame,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface PredictionsPageProps {
  markets: Market[];
  results: HistoricalResult[];
  onSelectMarket: (marketSlug: string) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  markets,
  results,
  onSelectMarket
}) => {
  // Target date selection: Today, Tomorrow, Custom
  const todayStr = '2026-09-17';
  const tomorrowStr = '2026-09-18';
  const [selectedDateMode, setSelectedDateMode] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(todayStr);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<'all' | 'morning' | 'day' | 'night' | 'delhi'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const activeTargetDate =
    selectedDateMode === 'today'
      ? todayStr
      : selectedDateMode === 'tomorrow'
      ? tomorrowStr
      : customDate;

  const activeMarkets = markets.filter((m) => m.status === 'active');

  const sessionFiltered = selectedSession === 'all'
    ? activeMarkets
    : activeMarkets.filter((m) => m.session === selectedSession);

  const filteredMarkets = sessionFiltered.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sessionCounts = {
    all: activeMarkets.length,
    morning: activeMarkets.filter(m => m.session === 'morning').length,
    day: activeMarkets.filter(m => m.session === 'day').length,
    night: activeMarkets.filter(m => m.session === 'night').length,
    delhi: activeMarkets.filter(m => m.session === 'delhi').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Empirical Model: {MODEL_VERSION}</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-white">
            Bharat Matka AI Predictions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic OTC (Open To Close) 4 Strong Ank, Top Jodis, and Panas calculated strictly from prior historical draws.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <button
            id="btn-date-today"
            onClick={() => setSelectedDateMode('today')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              selectedDateMode === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Today (17 Sep)
          </button>
          <button
            id="btn-date-tomorrow"
            onClick={() => setSelectedDateMode('tomorrow')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              selectedDateMode === 'tomorrow'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Tomorrow (18 Sep)
          </button>
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setSelectedDateMode('custom');
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        {/* Session Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All Games', count: sessionCounts.all },
              { id: 'morning', label: 'Morning', count: sessionCounts.morning },
              { id: 'day', label: 'Day', count: sessionCounts.day },
              { id: 'night', label: 'Night', count: sessionCounts.night },
              { id: 'delhi', label: 'Delhi King', count: sessionCounts.delhi }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSession(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedSession === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedSession === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Layout Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Master Table View"
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MASTER TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Game Name</th>
                  <th className="py-3.5 px-3 font-semibold">Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-amber-400">OTC 4 Strong Ank</th>
                  <th className="py-3.5 px-3 font-semibold">Cut Ank</th>
                  <th className="py-3.5 px-3 font-semibold text-emerald-400">Top Jodis</th>
                  <th className="py-3.5 px-3 font-semibold text-amber-300">Top Panas</th>
                  <th className="py-3.5 px-3 font-semibold">Historical Coverage</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredMarkets.map((market) => {
                  const marketHistory = results.filter((r) => r.market_id === market.id);
                  const { singles, jodis, panas, otc, trainingDataCount } = generatePredictions(
                    marketHistory,
                    activeTargetDate
                  );

                  return (
                    <tr
                      key={market.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectMarket(market.slug)}
                    >
                      <td className="py-3 px-4 font-serif font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                        <div>{market.name}</div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {market.session || 'general'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {market.open_time} - {market.close_time}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {otc.otc_digits.map((d) => (
                            <span
                              key={d}
                              className="w-7 h-7 flex items-center justify-center rounded bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/40"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {otc.otc_digits.map((d) => `${d}→${otc.cut_digits[d]}`).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {jodis.slice(0, 3).map((j) => (
                            <span
                              key={j.number}
                              className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold"
                            >
                              {j.number}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {panas.slice(0, 2).map((p) => (
                            <span
                              key={p.number}
                              className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold"
                            >
                              {p.number}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 text-[11px] font-semibold">
                          {otc.confidence_score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMarket(market.slug);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <span>Analyze</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => {
            const marketHistory = results.filter((r) => r.market_id === market.id);
            const { singles, jodis, panas, otc, trainingDataCount } = generatePredictions(
              marketHistory,
              activeTargetDate
            );

            const hasSufficientData = trainingDataCount >= 5;
            const topSingle = singles[0];
            const topJodis = jodis.slice(0, 3);
            const topPanas = panas.slice(0, 3);

            return (
              <div
                key={market.id}
                id={`pred-card-${market.slug}`}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                        {market.name}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{market.open_time} - {market.close_time}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {activeTargetDate}
                    </span>
                  </div>

                  {hasSufficientData ? (
                    <div className="space-y-3.5 my-3">
                      {/* MASTER OTC 4 STRONG ANK BLOCK */}
                      <div className="bg-slate-950/90 border border-amber-500/40 rounded-lg p-3.5">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-bold uppercase text-amber-300 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>OTC 4 Strong Ank</span>
                          </span>
                          <span className="font-mono text-emerald-400 text-[11px] font-semibold">
                            {otc.confidence_score}% Coverage
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {otc.otc_digits.map((d) => (
                            <div
                              key={d}
                              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded p-1.5"
                            >
                              <span className="text-xl font-mono font-bold text-amber-400 block">
                                {d}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">
                                Cut: {otc.cut_digits[d]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Jodis */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold uppercase text-slate-300">Top Jodi Candidates</span>
                          <span className="text-[11px] text-slate-500 font-mono">Rank 1-3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {topJodis.map((j) => (
                            <div
                              key={j.number}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-center"
                            >
                              <span className="text-base font-bold font-mono text-emerald-400 block">
                                {j.number}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {j.model_score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Panas */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-semibold uppercase text-slate-300">Top Pana Candidates</span>
                          <span className="text-[11px] text-slate-500 font-mono">Rank 1-3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {topPanas.map((p) => (
                            <div
                              key={p.number}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-center"
                            >
                              <span className="text-sm font-bold font-mono text-amber-300 block">
                                {p.number}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {p.model_score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>Audited Draws: {trainingDataCount}</span>
                        <span>Zero Future Leakage</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-dashed border-slate-800 rounded-lg p-6 text-center my-4 space-y-2">
                      <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                      <p className="text-sm text-slate-300 font-medium">Insufficient Historical Data</p>
                      <p className="text-xs text-slate-500">
                        Requires at least 5 prior draws before {activeTargetDate} to calculate reproducible statistical distributions.
                      </p>
                    </div>
                  )}
                </div>

                {/* View Full Analysis Link */}
                <button
                  id={`btn-view-analysis-${market.slug}`}
                  onClick={() => onSelectMarket(market.slug)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all group"
                >
                  <span>View Full Statistical Factors & AI Report</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Statistical Disclaimer */}
      <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300 block mb-0.5">Model Score Calculation Notice:</span>
          Bharat Matka AI Analytics calculates model scores from empirical frequency, cycle intervals, and joint digit probabilities.
          These represent mathematical probabilities based on historical patterns. They are not guaranteed future results.
        </div>
      </div>
    </div>
  );
};

