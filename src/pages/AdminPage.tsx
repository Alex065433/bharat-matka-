import React, { useState } from 'react';
import { Market, HistoricalResult } from '../types';
import {
  saveHistoricalResult,
  saveMarket,
  bulkImportHistoricalResults,
  savePredictionRun
} from '../services/supabase';
import { calculateDigitFromPana, isValidPana, generate220Panas } from '../lib/matkaMath';
import { generatePredictions, MODEL_VERSION } from '../lib/predictionEngine';
import {
  Sliders,
  Plus,
  FileSpreadsheet,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Lock,
  LogOut,
  Database,
  Trash2,
  UploadCloud
} from 'lucide-react';

interface AdminPageProps {
  markets: Market[];
  results: HistoricalResult[];
  onRefreshData: () => Promise<void>;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  hasSupabase: boolean;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  markets,
  results,
  onRefreshData,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  hasSupabase
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'add-result' | 'markets' | 'bulk-import' | 'generator'
  >('dashboard');

  // Admin login credentials (default local passcode or custom)
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Add/Edit Result Form State
  const [formMarketId, setFormMarketId] = useState<string>(markets[0]?.id || '');
  const [formDate, setFormDate] = useState<string>('2026-09-17');
  const [formOpenPana, setFormOpenPana] = useState<string>('');
  const [formClosePana, setFormClosePana] = useState<string>('');
  const [formStatusMsg, setFormStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Market Form State
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketSlug, setNewMarketSlug] = useState('');
  const [newMarketOpenTime, setNewMarketOpenTime] = useState('09:30 AM');
  const [newMarketCloseTime, setNewMarketCloseTime] = useState('11:30 AM');
  const [marketStatusMsg, setMarketStatusMsg] = useState<string | null>(null);

  // Bulk CSV Upload State
  const [csvPreview, setCsvPreview] = useState<{
    valid: any[];
    invalid: any[];
    duplicates: any[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Auto-calculated digits from Pana
  const openDigit = formOpenPana.length === 3 ? calculateDigitFromPana(formOpenPana) : '*';
  const closeDigit = formClosePana.length === 3 ? calculateDigitFromPana(formClosePana) : '*';
  const calculatedJodi = `${openDigit}${closeDigit}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passcode: admin123 or bharat2026
    if (passcode === 'admin123' || passcode === 'bharat2026' || passcode === 'admin') {
      setIsAdminLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Passcode. Default access: admin123');
    }
  };

  // Submit Result
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatusMsg(null);

    if (!isValidPana(formOpenPana)) {
      setFormStatusMsg({
        type: 'error',
        text: `Invalid Open Pana "${formOpenPana}". Must be a valid 3-digit sorted Pana.`
      });
      return;
    }

    if (!isValidPana(formClosePana)) {
      setFormStatusMsg({
        type: 'error',
        text: `Invalid Close Pana "${formClosePana}". Must be a valid 3-digit sorted Pana.`
      });
      return;
    }

    const calculatedOpenDigit = calculateDigitFromPana(formOpenPana);
    const calculatedCloseDigit = calculateDigitFromPana(formClosePana);
    const jodi = `${calculatedOpenDigit}${calculatedCloseDigit}`;

    const newResult: HistoricalResult = {
      id: `res-${formMarketId}-${formDate}`,
      market_id: formMarketId,
      result_date: formDate,
      open_pana: formOpenPana,
      open_digit: calculatedOpenDigit,
      jodi,
      close_digit: calculatedCloseDigit,
      close_pana: formClosePana
    };

    try {
      await saveHistoricalResult(newResult);
      await onRefreshData();
      setFormStatusMsg({
        type: 'success',
        text: `Result saved successfully! [${formOpenPana} - ${jodi} - ${formClosePana}]`
      });
      setFormOpenPana('');
      setFormClosePana('');
    } catch (err: any) {
      setFormStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to save result.'
      });
    }
  };

  // Save Market
  const handleSaveMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketName.trim()) return;

    const slug = newMarketSlug.trim() || newMarketName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newMarket: Market = {
      id: `m-${slug}`,
      name: newMarketName.trim(),
      slug,
      open_time: newMarketOpenTime,
      close_time: newMarketCloseTime,
      status: 'active',
      display_order: markets.length + 1
    };

    await saveMarket(newMarket);
    await onRefreshData();
    setMarketStatusMsg(`Market "${newMarket.name}" created successfully!`);
    setNewMarketName('');
    setNewMarketSlug('');
  };

  // Handle CSV File Upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      const valid: any[] = [];
      const invalid: any[] = [];
      const duplicates: any[] = [];

      const existingKeys = new Set(results.map((r) => `${r.market_id}_${r.result_date}`));

      // Expected header: market_slug,result_date,open_pana,close_pana
      lines.slice(1).forEach((line, index) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length < 4) {
          invalid.push({ lineIndex: index + 2, raw: line, error: 'Insufficient columns' });
          return;
        }

        const [marketSlug, resultDate, openPana, closePana] = parts;
        const targetMarket = markets.find((m) => m.slug === marketSlug || m.id === marketSlug);

        if (!targetMarket) {
          invalid.push({ lineIndex: index + 2, raw: line, error: `Market "${marketSlug}" not found` });
          return;
        }

        if (!isValidPana(openPana) || !isValidPana(closePana)) {
          invalid.push({ lineIndex: index + 2, raw: line, error: 'Invalid Pana format (must be 3 digits)' });
          return;
        }

        const openD = calculateDigitFromPana(openPana);
        const closeD = calculateDigitFromPana(closePana);
        const jodi = `${openD}${closeD}`;

        const key = `${targetMarket.id}_${resultDate}`;
        if (existingKeys.has(key)) {
          duplicates.push({ lineIndex: index + 2, resultDate, marketName: targetMarket.name });
          return;
        }

        valid.push({
          id: `res-${targetMarket.id}-${resultDate}`,
          market_id: targetMarket.id,
          result_date: resultDate,
          open_pana: openPana,
          open_digit: openD,
          jodi,
          close_digit: closeD,
          close_pana: closePana
        });
      });

      setCsvPreview({ valid, invalid, duplicates });
    };
    reader.readAsText(file);
  };

  const handleCommitBulkImport = async () => {
    if (!csvPreview || csvPreview.valid.length === 0) return;
    setIsImporting(true);
    await bulkImportHistoricalResults(csvPreview.valid);
    await onRefreshData();
    setIsImporting(false);
    setCsvPreview(null);
    alert(`Successfully imported ${csvPreview.valid.length} historical records!`);
  };

  // Run Batch Predictions for All Markets
  const handleBatchGeneratePredictions = async () => {
    const targetDate = '2026-09-18';
    let count = 0;
    for (const m of markets) {
      const history = results.filter((r) => r.market_id === m.id);
      const { singles, jodis, panas, trainingDataCount } = generatePredictions(history, targetDate);

      if (trainingDataCount >= 3) {
        const runId = `run-${m.id}-${targetDate}`;
        await savePredictionRun(
          {
            market_id: m.id,
            prediction_date: targetDate,
            model_version: MODEL_VERSION,
            training_data_count: trainingDataCount,
            generated_at: new Date().toISOString()
          },
          [
            ...singles.slice(0, 3).map((s) => ({
              type: 'single' as const,
              candidate: s.number,
              rank: s.rank,
              model_score: s.model_score,
              factors_summary: s.factors_summary
            })),
            ...jodis.slice(0, 3).map((j) => ({
              type: 'jodi' as const,
              candidate: j.number,
              rank: j.rank,
              model_score: j.model_score,
              factors_summary: j.factors_summary
            })),
            ...panas.slice(0, 3).map((p) => ({
              type: 'pana' as const,
              candidate: p.number,
              rank: p.rank,
              model_score: p.model_score,
              factors_summary: p.factors_summary
            }))
          ]
        );
        count++;
      }
    }
    alert(`Successfully generated and saved predictions for ${count} markets for date ${targetDate}!`);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400">
              Enter the administrative passcode to manage markets, results, and prediction engine runs.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Admin Passcode
              </label>
              <input
                type="password"
                placeholder="Enter passcode (default: admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {loginError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors"
            >
              Sign In to Console
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 font-mono">
            Default credentials: <span className="text-amber-400">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Administrator Console</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-white">
            System Administration
          </h1>
        </div>

        <button
          onClick={() => setIsAdminLoggedIn(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white transition-colors self-start"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'add-result', label: 'Add Result' },
          { id: 'markets', label: 'Manage Markets' },
          { id: 'bulk-import', label: 'Bulk CSV Import' },
          { id: 'generator', label: 'Prediction Engine' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD METRICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-400 font-mono">Configured Markets</div>
              <div className="font-serif text-3xl font-bold text-white mt-1">{markets.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">All active in database</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-400 font-mono">Historical Results</div>
              <div className="font-serif text-3xl font-bold text-white mt-1">{results.length}</div>
              <div className="text-[11px] text-amber-400 mt-1">Verified draw records</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-400 font-mono">Database Status</div>
              <div className="font-serif text-xl font-bold text-white mt-1">
                {hasSupabase ? 'Supabase Live' : 'Local Storage Engine'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {hasSupabase ? 'Cloud PostgreSQL sync active' : 'Runs client-side storage bridge'}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-slate-400 font-mono">Model Version</div>
              <div className="font-mono text-xl font-bold text-amber-400 mt-1">{MODEL_VERSION}</div>
              <div className="text-[11px] text-slate-400 mt-1">Zero-leakage enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD / EDIT RESULT (With Auto-Calculated Single Digits & Jodi) */}
      {activeTab === 'add-result' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">
              Record Official Market Result
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter 3-digit Open Pana and Close Pana. Open Digit, Close Digit, and Jodi calculate automatically modulo 10.
            </p>
          </div>

          <form onSubmit={handleSaveResult} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Select Market
                </label>
                <select
                  value={formMarketId}
                  onChange={(e) => setFormMarketId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Result Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Open Pana (3 digits, e.g. 128)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. 128"
                  value={formOpenPana}
                  onChange={(e) => setFormOpenPana(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  Derived Open Single: <strong className="text-white">{openDigit}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Close Pana (3 digits, e.g. 469)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. 469"
                  value={formClosePana}
                  onChange={(e) => setFormClosePana(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  Derived Close Single: <strong className="text-white">{closeDigit}</strong>
                </span>
              </div>
            </div>

            {/* Calculated Outcome Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                Calculated Outcome Preview
              </span>
              <div className="text-2xl font-mono font-bold text-white tracking-widest">
                <span className="text-amber-300">{formOpenPana || '***'}</span>
                <span className="text-slate-600"> - </span>
                <span className="text-emerald-400">{calculatedJodi}</span>
                <span className="text-slate-600"> - </span>
                <span className="text-amber-300">{formClosePana || '***'}</span>
              </div>
            </div>

            {formStatusMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-mono ${
                  formStatusMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {formStatusMsg.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-colors shadow-lg"
            >
              Save Official Result & Trigger Evaluations
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MANAGE MARKETS */}
      {activeTab === 'markets' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-serif font-bold text-lg text-white mb-4">
              Add New Market
            </h3>
            <form onSubmit={handleSaveMarket} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Market Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Milan Day"
                  value={newMarketName}
                  onChange={(e) => setNewMarketName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Open Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 03:00 PM"
                  value={newMarketOpenTime}
                  onChange={(e) => setNewMarketOpenTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Close Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 05:00 PM"
                  value={newMarketCloseTime}
                  onChange={(e) => setNewMarketCloseTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition-colors"
                >
                  Create Market
                </button>
              </div>
            </form>
            {marketStatusMsg && (
              <p className="text-xs text-emerald-400 font-mono mt-2">{marketStatusMsg}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Open</th>
                  <th className="px-4 py-3">Close</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {markets.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-white font-semibold">{m.name}</td>
                    <td className="px-4 py-3 text-slate-400">{m.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{m.open_time}</td>
                    <td className="px-4 py-3 text-slate-300">{m.close_time}</td>
                    <td className="px-4 py-3 text-emerald-400">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BULK CSV IMPORT */}
      {activeTab === 'bulk-import' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <span>Bulk Historical Chart CSV Import</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload historical records. Format required: <code>market_slug,result_date,open_pana,close_pana</code>.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3">
            <UploadCloud className="w-10 h-10 text-slate-500 mx-auto" />
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
            />
          </div>

          {/* Validation Preview */}
          {csvPreview && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-emerald-400 font-mono">Valid Rows</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {csvPreview.valid.length}
                  </div>
                </div>
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-rose-400 font-mono">Invalid Rows</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {csvPreview.invalid.length}
                  </div>
                </div>
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-amber-400 font-mono">Duplicate Rows</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {csvPreview.duplicates.length}
                  </div>
                </div>
              </div>

              {csvPreview.valid.length > 0 && (
                <button
                  onClick={handleCommitBulkImport}
                  disabled={isImporting}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs font-mono transition-colors"
                >
                  {isImporting
                    ? 'Importing into Database...'
                    : `Commit ${csvPreview.valid.length} Valid Rows`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PREDICTION ENGINE BATCH GENERATOR */}
      {activeTab === 'generator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 max-w-xl">
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Batch Prediction Engine</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Runs the mathematical engine across all active markets for target date <strong>2026-09-18</strong> and stores ranked candidates in the database.
          </p>
          <button
            onClick={handleBatchGeneratePredictions}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs font-mono transition-colors shadow-lg"
          >
            Execute Batch Prediction Runs
          </button>
        </div>
      )}
    </div>
  );
};
