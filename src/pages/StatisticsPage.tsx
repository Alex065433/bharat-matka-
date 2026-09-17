import React, { useState, useMemo } from 'react';
import { Market, HistoricalResult, TimeframeOption } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { BarChart3, Filter, PieChart as PieIcon, Layers, TrendingUp } from 'lucide-react';
import { getPanaType } from '../lib/matkaMath';

interface StatisticsPageProps {
  markets: Market[];
  results: HistoricalResult[];
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#14b8a6', '#6366f1'];

export const StatisticsPage: React.FC<StatisticsPageProps> = ({
  markets,
  results
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    markets[0]?.id || ''
  );
  const [timeframe, setTimeframe] = useState<TimeframeOption>('90d');

  // Filter results by timeframe
  const filteredResults = useMemo(() => {
    let list = results.filter((r) => r.market_id === selectedMarketId);
    const anchorDate = new Date('2026-09-17');

    let days = 3650; // 'all'
    if (timeframe === '7d') days = 7;
    else if (timeframe === '30d') days = 30;
    else if (timeframe === '90d') days = 90;
    else if (timeframe === '6m') days = 180;
    else if (timeframe === '1y') days = 365;

    const cutoff = new Date(anchorDate);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    return list.filter((r) => r.result_date >= cutoffStr);
  }, [results, selectedMarketId, timeframe]);

  // 1. Single Digit Frequencies (0-9)
  const digitFrequencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i <= 9; i++) counts[i.toString()] = 0;

    filteredResults.forEach((r) => {
      if (r.open_digit && counts[r.open_digit] !== undefined) counts[r.open_digit]++;
      if (r.close_digit && counts[r.close_digit] !== undefined) counts[r.close_digit]++;
    });

    const total = Math.max(1, filteredResults.length * 2);

    return Object.keys(counts).map((digit) => ({
      digit: `Digit ${digit}`,
      rawDigit: digit,
      frequency: counts[digit],
      probability: Math.round((counts[digit] / total) * 1000) / 10
    }));
  }, [filteredResults]);

  // 2. Pana Type Distribution (SP vs DP vs TP)
  const panaTypeData = useMemo(() => {
    const types = { SP: 0, DP: 0, TP: 0 };
    filteredResults.forEach((r) => {
      if (r.open_pana) types[getPanaType(r.open_pana)]++;
      if (r.close_pana) types[getPanaType(r.close_pana)]++;
    });

    return [
      { name: 'Single Patti (SP)', value: types.SP, color: '#f59e0b' },
      { name: 'Double Patti (DP)', value: types.DP, color: '#10b981' },
      { name: 'Triple Patti (TP)', value: types.TP, color: '#8b5cf6' }
    ];
  }, [filteredResults]);

  // 3. Top Most Frequent Jodis in Timeframe
  const topJodisData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredResults.forEach((r) => {
      if (r.jodi) counts[r.jodi] = (counts[r.jodi] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([jodi, count]) => ({ jodi, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredResults]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            <span>Interactive Statistical Charts</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical frequency distribution, cycle gaps, and Pana parity breakdown across customizable historical windows.
          </p>
        </div>

        {/* Controls: Market & Timeframe */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {(['7d', '30d', '90d', '6m', '1y', 'all'] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Statistical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Digit Frequency (0-9) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Single Digit Frequency (0 - 9)
              </h3>
              <p className="text-xs text-slate-400">
                Number of occurrences across open and close draws ({filteredResults.length} draws evaluated)
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
              {timeframe.toUpperCase()}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={digitFrequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="rawDigit" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="frequency" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pana Composition (SP vs DP vs TP) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Pana Type Composition
              </h3>
              <p className="text-xs text-slate-400">
                Single Patti (SP: 120), Double Patti (DP: 90), and Triple Patti (TP: 10)
              </p>
            </div>
            <PieIcon className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={panaTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                >
                  {panaTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Recurring Jodis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg lg:col-span-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-white">
              Most Recurrent Jodis in Selected Period
            </h3>
            <p className="text-xs text-slate-400">
              Highest absolute occurrences within the selected timeframe
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            {topJodisData.map((item, idx) => (
              <div
                key={item.jodi}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center"
              >
                <div className="text-[10px] text-slate-500 font-mono">Rank #{idx + 1}</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 my-1">
                  {item.jodi}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {item.count} hits
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
