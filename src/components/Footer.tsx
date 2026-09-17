import React from 'react';
import { ShieldAlert, Cpu, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-white">BHARAT MATKA AI ANALYTICS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v2.4
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            A production-ready historical Matka chart analysis and statistical pattern recognition platform.
            Our engine evaluates Pana frequencies, cycle intervals, and joint Bayesian digit distributions
            from historical data without data leakage.
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono pt-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hybrid Bayesian & Cycle Gap Scoring Engine</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Analytical Modules
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('predictions')}
                className="hover:text-amber-400 transition-colors"
              >
                Top Candidate Predictions
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('chart')}
                className="hover:text-amber-400 transition-colors"
              >
                Historical Panel Charts
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('statistics')}
                className="hover:text-amber-400 transition-colors"
              >
                Frequency & Gap Distributions
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('backtest')}
                className="hover:text-amber-400 transition-colors"
              >
                Zero-Leakage Model Backtest
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Governance & Legal
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Methodology Framework</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('admin')}
                className="hover:text-amber-400 transition-colors"
              >
                Administrative Portal
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mandatory Prominent Statistical Disclaimer Banner */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900">
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              Mandatory Statistical Disclaimer & Responsible Use Notice
            </p>
            <p className="text-slate-400 leading-relaxed">
              These are statistical model outputs based on historical data. They are not guaranteed future results.
              Bharat Matka AI Analytics provides purely informational, academic, and statistical pattern recognition
              derived from past observed records. The platform never guarantees accuracy and does not operate as a gambling operator.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-slate-500">
          <p>© 2026 Bharat Matka AI Analytics. All rights reserved.</p>
          <p className="font-mono">Engine: v2.4-HybridBayesianPattern</p>
        </div>
      </div>
    </footer>
  );
};
