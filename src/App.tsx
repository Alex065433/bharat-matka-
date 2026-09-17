import React, { useState, useEffect } from 'react';
import { Market, HistoricalResult } from './types';
import {
  fetchMarkets,
  fetchHistoricalResults,
  initializeDatabaseWithSeedData,
  isSupabaseConfigured
} from './services/supabase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PredictionsPage } from './pages/PredictionsPage';
import { PredictionDetailPage } from './pages/PredictionDetailPage';
import { HistoricalChartPage } from './pages/HistoricalChartPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { BacktestingPage } from './pages/BacktestingPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import { AboutAndDisclaimerPage } from './pages/AboutAndDisclaimerPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [results, setResults] = useState<HistoricalResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedMarketSlug, setSelectedMarketSlug] = useState<string>('kalyan');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [hasSupabase, setHasSupabase] = useState<boolean>(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      setHasSupabase(isSupabaseConfigured());
      // Initialize seed data if storage is empty
      await initializeDatabaseWithSeedData();

      const [loadedMarkets, loadedResults] = await Promise.all([
        fetchMarkets(),
        fetchHistoricalResults()
      ]);

      setMarkets(loadedMarkets);
      setResults(loadedResults);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleNavigate = (page: string, param?: string) => {
    setCurrentPage(page);
    if (param) {
      setSelectedMarketSlug(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedMarket =
    markets.find((m) => m.slug === selectedMarketSlug) || markets[0] || null;

  const marketHistory = selectedMarket
    ? results.filter((r) => r.market_id === selectedMarket.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        hasSupabase={hasSupabase}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-slate-400">
              Loading Bharat Matka Analytics Engine...
            </span>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                markets={markets}
                results={results}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'predictions' && (
              <PredictionsPage
                markets={markets}
                results={results}
                onSelectMarket={(slug) => handleNavigate('prediction-detail', slug)}
              />
            )}

            {currentPage === 'prediction-detail' && selectedMarket && (
              <PredictionDetailPage
                market={selectedMarket}
                history={marketHistory}
                onBack={() => handleNavigate('predictions')}
                onNavigateChart={(slug) => handleNavigate('chart', slug)}
              />
            )}

            {currentPage === 'chart' && (
              <HistoricalChartPage
                markets={markets}
                results={results}
                initialMarketSlug={selectedMarketSlug}
              />
            )}

            {currentPage === 'statistics' && (
              <StatisticsPage
                markets={markets}
                results={results}
              />
            )}

            {currentPage === 'backtest' && (
              <BacktestingPage
                markets={markets}
                results={results}
              />
            )}

            {currentPage === 'history' && (
              <PredictionHistoryPage
                markets={markets}
              />
            )}

            {currentPage === 'about' && (
              <AboutAndDisclaimerPage />
            )}

            {currentPage === 'admin' && (
              <AdminPage
                markets={markets}
                results={results}
                onRefreshData={loadAllData}
                isAdminLoggedIn={isAdminLoggedIn}
                setIsAdminLoggedIn={setIsAdminLoggedIn}
                hasSupabase={hasSupabase}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
