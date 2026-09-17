import React from 'react';
import {
  ShieldAlert,
  BookOpen,
  Cpu,
  Binary,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { MODEL_VERSION } from '../lib/predictionEngine';

export const AboutAndDisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Analytical Framework & Research Whitepaper</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
          Statistical Methodology & Governance
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
          Bharat Matka AI Analytics operates purely as an empirical pattern recognition platform.
          Below is the complete mathematical and architectural disclosure of how our engine operates.
        </p>
      </div>

      {/* Mandatory Prominent Disclaimer Banner */}
      <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>MANDATORY STATISTICAL DISCLAIMER</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          <strong>These are statistical model outputs based on historical data. They are not guaranteed future results.</strong>
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Past frequency, cycle intervals, and probabilistic harmonic scores represent mathematical tendencies
          derived from historical chart archives. No statistical model can guarantee outcomes in stochastic games.
          This platform is strictly designed for historical pattern analysis, mathematical modeling, and educational research.
        </p>
      </div>

      {/* 1. Mathematical Distinction: Frequency vs Probability vs Model Score */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <Binary className="w-6 h-6 text-amber-400" />
          <span>Core Mathematical Definitions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-mono text-sm font-bold text-amber-400 uppercase">
              1. Observed Frequency
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The exact count of times a specific Single Digit, Jodi, or Pana appeared in verified historical panel draws within a defined time horizon.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-mono text-sm font-bold text-emerald-400 uppercase">
              2. Probability Score
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The empirical probability density function (PDF) comparing observed occurrences against uniform discrete distribution expectations.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-mono text-sm font-bold text-blue-400 uppercase">
              3. Model Score
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our normalized index [55 - 94] combining frequency, cycle gap deviation, recent momentum, and Pana parity into a weighted composite metric.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Why Raw Frequency is Insufficient */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <span>Why Historical Frequency Alone is Insufficient</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          A common mistake in simple lotto analysis is relying solely on raw frequency:
        </p>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>The Gambler's Fallacy Trap:</strong> A number being "overdue" does not physically alter the odds of subsequent draws. Our engine penalizes extreme overdue intervals to avoid false expectancy.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Cycle Gap Alignment:</strong> Numbers exhibit mean-reverting inter-arrival gaps. Our algorithm calculates the current gap relative to the historical median cycle.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Pana Structure Constraints:</strong> 220 Panas consist of 120 Single Pattis, 90 Double Pattis, and only 10 Triple Pattis. The probability of each class is structurally asymmetric.
            </span>
          </li>
        </ul>
      </section>

      {/* 3. Zero-Data-Leakage Guarantee */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>Zero Future-Data Leakage Architecture</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          In historical backtesting, predicting a date like <code>2026-09-10</code> MUST only use historical draws strictly dated <code>&lt; 2026-09-10</code>.
          Our prediction pipeline filters training arrays by timestamp before evaluating candidates, guaranteeing zero data leakage and honest hit-rate evaluation.
        </p>
      </section>
    </div>
  );
};
