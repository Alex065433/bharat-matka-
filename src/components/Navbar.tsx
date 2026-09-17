import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ShieldAlert,
  Sliders,
  Sparkles,
  Clock,
  Menu,
  X,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
  hasSupabase: boolean;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  hasSupabase,
  isAdminLoggedIn
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Indian Standard Time (IST) display
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Layers },
    { id: 'predictions', label: 'AI Predictions', icon: Sparkles },
    { id: 'chart', label: 'Historical Charts', icon: Calendar },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'backtest', label: 'Model Backtest', icon: TrendingUp },
    { id: 'history', label: 'Prediction History', icon: Clock },
    { id: 'admin', label: 'Admin Console', icon: Sliders }
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-b border-amber-500/20 px-4 py-1 text-xs text-amber-300/90 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">IST LIVE:</span>
          <span>{currentTime || 'Loading clock...'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-400">
            Statistical Pattern Recognition • Zero Data Leakage
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-[11px]">
            <Database className={`w-3 h-3 ${hasSupabase ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{hasSupabase ? 'Supabase Connected' : 'Local Storage Engine'}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            id="brand-logo"
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-slate-950 text-xl tracking-tighter">
                BM
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-wide text-white">
                  BHARAT MATKA
                </span>
                <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  AI Analytics
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Historical Chart Analysis & Statistical Modeling
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Admin Status & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="disclaimer-nav-btn"
              onClick={() => handleNav('about')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hidden md:flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Methodology</span>
            </button>

            {isAdminLoggedIn ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Admin Active
              </span>
            ) : null}

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => handleNav('about')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-800"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Methodology & Disclaimer</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
