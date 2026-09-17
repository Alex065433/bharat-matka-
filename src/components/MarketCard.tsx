import React from 'react';
import { Market, HistoricalResult } from '../types';
import { Clock, ArrowUpRight, Calendar, Sparkles } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  latestResult?: HistoricalResult | null;
  onSelectMarket: (marketSlug: string, action: 'prediction' | 'chart') => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  latestResult,
  onSelectMarket
}) => {
  const openPana = latestResult?.open_pana || '***';
  const openDigit = latestResult?.open_digit || '*';
  const closeDigit = latestResult?.close_digit || '*';
  const closePana = latestResult?.close_pana || '***';
  const jodi = `${openDigit}${closeDigit}`;

  const isActive = market.status === 'active';

  return (
    <div
      id={`market-card-${market.slug}`}
      className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between group"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
              {market.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{market.open_time} - {market.close_time}</span>
            </div>
          </div>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isActive ? 'Live Market' : 'Inactive'}
          </span>
        </div>

        {/* Traditional Panel Result Display Box */}
        <div className="my-4 bg-slate-950/90 border border-slate-800/90 rounded-lg p-3 text-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
            Latest Result {latestResult ? `(${latestResult.result_date})` : ''}
          </span>
          <div className="flex items-center justify-center gap-2 font-mono text-xl sm:text-2xl font-bold tracking-wider">
            <span className="text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/5">
              {openPana}
            </span>
            <span className="text-slate-500">-</span>
            <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {jodi}
            </span>
            <span className="text-slate-500">-</span>
            <span className="text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/5">
              {closePana}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
        <button
          id={`btn-pred-${market.slug}`}
          onClick={() => onSelectMarket(market.slug, 'prediction')}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Prediction</span>
        </button>
        <button
          id={`btn-chart-${market.slug}`}
          onClick={() => onSelectMarket(market.slug, 'chart')}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Panel Chart</span>
        </button>
      </div>
    </div>
  );
};
