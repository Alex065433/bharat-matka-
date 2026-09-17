import React, { useState, useMemo } from 'react';
import { Market, HistoricalResult } from '../types';
import { runBacktest, MODEL_VERSION } from '../lib/predictionEngine';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface BacktestingPageProps {
  markets: Market[];
  results: HistoricalResult[];
}

export const BacktestingPage: React.FC<BacktestingPageProps> = ({
  markets,
  results
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    markets[0]?.id || ''
  );

  const selectedMarket = markets.find((m) => m.id === selectedMarketId);

  // Run zero-leakage backtest on historical dataset
  const backtestResult = useMemo(() => {
    const marketHistory = results.filter((r) => r.market_id === selectedMarketId);
    return runBacktest(marketHistory, 8);
  }, [results, selectedMarketId]);

  const { evaluations, report } = backtestResult;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Leakage Rolling Horizon Backtest</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-white">
            Model Backtesting & Accuracy Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical accuracy evaluation across all historical dates. Each past test uses strictly prior records.
          </p>
        </div>

        {/* Market Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Market:</span>
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-500"
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accuracy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Single Digit Hit Rates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-white">Single Digit Accuracy</h3>
            <span className="text-xs font-mono text-amber-400">N = {report.sample_size}</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 1 Hit Rate:</span>
                <span className="text-white font-bold">{report.single.top1_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.single.top1_hit_rate)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 3 Candidates Hit Rate:</span>
                <span className="text-white font-bold">{report.single.top3_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.single.top3_hit_rate)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 5 Candidates Hit Rate:</span>
                <span className="text-emerald-400 font-bold">{report.single.top5_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.single.top5_hit_rate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jodi Hit Rates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-white">Jodi Hit Rates (00-99)</h3>
            <span className="text-xs font-mono text-emerald-400">100 Possibilities</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 1 Exact Match:</span>
                <span className="text-white font-bold">{report.jodi.top1_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.jodi.top1_hit_rate * 3)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 5 Candidates Hit Rate:</span>
                <span className="text-white font-bold">{report.jodi.top5_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.jodi.top5_hit_rate * 2)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 10 Candidates Hit Rate:</span>
                <span className="text-emerald-400 font-bold">{report.jodi.top10_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.jodi.top10_hit_rate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pana Hit Rates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-white">Pana / Panel Hit Rates</h3>
            <span className="text-xs font-mono text-purple-400">220 Possibilities</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 5 Panas:</span>
                <span className="text-white font-bold">{report.pana.top5_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.pana.top5_hit_rate * 2)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 10 Panas:</span>
                <span className="text-white font-bold">{report.pana.top10_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.pana.top10_hit_rate * 1.5)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Top 20 Panas:</span>
                <span className="text-emerald-400 font-bold">{report.pana.top20_hit_rate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, report.pana.top20_hit_rate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Audit Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-xl text-white">
              Draw-by-Draw Evaluation Audit Log
            </h3>
            <p className="text-xs text-slate-400">
              Each historical date hides the actual result, executes the statistical model, and verifies candidate matches.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Audit sample: {evaluations.length} draws
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Draw Date</th>
                  <th className="px-4 py-3 text-center">Actual Outcome</th>
                  <th className="px-4 py-3">Top Single Match</th>
                  <th className="px-4 py-3">Top Jodi Match</th>
                  <th className="px-4 py-3">Pana In Top 10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {evaluations.slice(-15).reverse().map((ev) => (
                  <tr key={ev.prediction_date} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3 text-slate-200 font-medium">
                      {ev.prediction_date}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
                        {ev.actual_open_pana}-{ev.actual_jodi}-{ev.actual_close_pana}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ev.hit_top1_single ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Top 1 Hit ({ev.actual_single})</span>
                        </span>
                      ) : ev.hit_top5_single ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Top 5 Hit</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Miss</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ev.hit_top1_jodi ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Exact Top 1 Hit ({ev.actual_jodi})</span>
                        </span>
                      ) : ev.hit_top5_jodi ? (
                        <span className="inline-flex items-center gap-1 text-blue-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Top 5 Hit</span>
                        </span>
                      ) : ev.hit_top10_jodi ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Top 10 Hit</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Miss</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ev.hit_top10_pana ? (
                        <span className="inline-flex items-center gap-1 text-purple-400 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hit in Top 10</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Miss</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
