import React, { useState, useMemo } from 'react';
import { Market, HistoricalResult } from '../types';
import {
  Calendar,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

interface HistoricalChartPageProps {
  markets: Market[];
  results: HistoricalResult[];
  initialMarketSlug?: string;
}

export const HistoricalChartPage: React.FC<HistoricalChartPageProps> = ({
  markets,
  results,
  initialMarketSlug
}) => {
  const defaultMarket =
    markets.find((m) => m.slug === initialMarketSlug) || markets[0] || null;

  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    defaultMarket ? defaultMarket.id : ''
  );
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const selectedMarket = markets.find((m) => m.id === selectedMarketId);

  // Filter records for selected market
  const chartData = useMemo(() => {
    let filtered = results.filter((r) => r.market_id === selectedMarketId);

    if (searchFilter.trim()) {
      const q = searchFilter.trim();
      filtered = filtered.filter(
        (r) =>
          r.result_date.includes(q) ||
          r.jodi.includes(q) ||
          r.open_pana.includes(q) ||
          r.close_pana.includes(q) ||
          r.open_digit === q ||
          r.close_digit === q
      );
    }

    return filtered.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.result_date.localeCompare(a.result_date)
        : a.result_date.localeCompare(b.result_date);
    });
  }, [results, selectedMarketId, searchFilter, sortOrder]);

  const handleExportCSV = () => {
    if (!selectedMarket || chartData.length === 0) return;
    const headers = 'market,date,open_pana,open_digit,jodi,close_digit,close_pana\n';
    const rows = chartData
      .map(
        (r) =>
          `${selectedMarket.slug},${r.result_date},${r.open_pana},${r.open_digit},${r.jodi},${r.close_digit},${r.close_pana}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMarket.slug}-historical-chart.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-400" />
            <span>Historical Panel Charts</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete records of Open Pana, Jodi, and Close Pana exactly as entered by the administrator.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={chartData.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors disabled:opacity-50 self-start"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Chart</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Market Picker */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-mono text-slate-400">Market:</span>
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-500 w-full md:w-64"
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.open_time} - {m.close_time})
              </option>
            ))}
          </select>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by date, Jodi, Pana..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white font-mono"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Panel Chart Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-3 py-3">Day</th>
                <th className="px-5 py-3 text-center text-amber-300">Open Pana</th>
                <th className="px-3 py-3 text-center text-slate-300">Open</th>
                <th className="px-6 py-3 text-center text-emerald-400 font-bold">Jodi</th>
                <th className="px-3 py-3 text-center text-slate-300">Close</th>
                <th className="px-5 py-3 text-center text-amber-300">Close Pana</th>
                <th className="px-5 py-3 text-center text-slate-400">Panel Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {chartData.length > 0 ? (
                chartData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-200 font-medium">
                      {row.result_date}
                    </td>
                    <td className="px-3 py-3 text-slate-400 text-xs">
                      {getDayName(row.result_date)}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-amber-300">
                      {row.open_pana}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-300">
                      {row.open_digit}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-extrabold text-base tracking-wider">
                        {row.jodi}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-300">
                      {row.close_digit}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-amber-300">
                      {row.close_pana}
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-400">
                      <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {row.open_pana}-{row.jodi}-{row.close_pana}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500 text-xs">
                    No historical chart records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-950/80 px-5 py-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Showing {chartData.length} records</span>
          <span>Verified Administrator Chart Data</span>
        </div>
      </div>
    </div>
  );
};
