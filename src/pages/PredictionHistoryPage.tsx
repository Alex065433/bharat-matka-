import React, { useState, useEffect } from 'react';
import { Market, PredictionRun } from '../types';
import { fetchPredictionRuns } from '../services/supabase';
import { Clock, CheckCircle2, XCircle, Filter, Sparkles, Layers } from 'lucide-react';

interface PredictionHistoryPageProps {
  markets: Market[];
}

export const PredictionHistoryPage: React.FC<PredictionHistoryPageProps> = ({
  markets
}) => {
  const [runs, setRuns] = useState<PredictionRun[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPredictionRuns(
        selectedMarketId === 'all' ? undefined : selectedMarketId
      );
      setRuns(data);
      setLoading(false);
    }
    load();
  }, [selectedMarketId]);

  const marketMap = new Map(markets.map((m) => [m.id, m.name]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-amber-400" />
            <span>Prediction Audit & Run History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable log of all generated statistical forecasts matched automatically against verified actual outcomes.
          </p>
        </div>

        {/* Market Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Market:</span>
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Markets</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono text-xs">
          Loading prediction history records...
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-white">No Stored Prediction Runs Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Generate and save predictions from the Prediction Page or run the batch generator in the Admin Console.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {runs.map((run) => (
            <div
              key={run.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-lg text-white">
                    {marketMap.get(run.market_id) || run.market_id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Target Date: {run.prediction_date}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <span>Version: {run.model_version}</span>
                  <span>•</span>
                  <span>Training Samples: {run.training_data_count}</span>
                </div>
              </div>

              {/* Candidates Grid */}
              {run.candidates && run.candidates.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                    Forecasted Candidates & Actual Outcomes:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {run.candidates.map((cand) => (
                      <div
                        key={cand.id}
                        className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                          cand.matched === true
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : cand.matched === false
                            ? 'bg-slate-950 border-slate-800 text-slate-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                          <span>{cand.type.toUpperCase()} #{cand.rank}</span>
                          <span>{cand.model_score}pt</span>
                        </div>
                        <div className="text-lg font-bold text-white my-0.5">
                          {cand.candidate}
                        </div>
                        <div className="text-[10px] flex items-center gap-1 mt-1 pt-1 border-t border-slate-800/80">
                          {cand.matched === true ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Hit!
                            </span>
                          ) : cand.matched === false ? (
                            <span className="text-slate-500">Outcome: {cand.actual_result}</span>
                          ) : (
                            <span className="text-amber-400">Pending Draw</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
