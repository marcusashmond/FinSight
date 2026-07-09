import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, transactionsAPI, seedAPI } from '../services/api';
import useFetch from '../hooks/useFetch';
import SummaryCard from '../components/SummaryCard';
import CategoryChart from '../components/CategoryChart';
import TrendChart from '../components/TrendChart';
import { DashboardSkeleton } from '../components/Skeleton';
import SpendingHeatmap from '../components/SpendingHeatmap';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await transactionsAPI.getAll({ merchant: query, limit: 5 });
        setResults(res.data?.transactions || []);
        setOpen(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goToTransactions = () => {
    navigate(`/transactions?merchant=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search transactions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full pl-9 pr-4 py-2 text-sm border dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">...</span>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No transactions found.</p>
          ) : (
            <>
              {results.map((tx) => (
                <div key={tx._id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{tx.merchant || '—'}</p>
                    <p className="text-xs text-gray-400">{tx.category} · {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {fmt(tx.amount)}
                  </span>
                </div>
              ))}
              <button
                onClick={goToTransactions}
                className="w-full px-4 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 border-t dark:border-gray-700 text-left font-medium transition"
              >
                View all results for "{query}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const downloadReport = async () => {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const [catRes, summaryRes] = await Promise.all([analyticsAPI.categories(), analyticsAPI.summary()]);
  const categories = catRes.data || [];
  const summary = summaryRes.data || {};

  const lines = [
    `FinSight Monthly Report — ${month}`,
    '',
    `Total Income,$${(summary.income ?? 0).toFixed(2)}`,
    `Total Expenses,$${Math.abs(summary.expenses ?? 0).toFixed(2)}`,
    `Net Balance,$${(summary.net ?? 0).toFixed(2)}`,
    '',
    'Category Breakdown',
    'Category,Amount',
    ...categories.map((c) => `${c._id},$${Math.abs(c.total).toFixed(2)}`),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finsight-report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const Dashboard = () => {
  const [seeding, setSeeding] = useState(false);
  const { data: summary, loading: sl } = useFetch(analyticsAPI.summary);
  const { data: categories, loading: cl } = useFetch(analyticsAPI.categories);
  const { data: trends, loading: tl } = useFetch(analyticsAPI.trends);
  const { data: insights } = useFetch(analyticsAPI.insights);
  const { data: dailySpend } = useFetch(analyticsAPI.daily);

  const loadDemoData = async () => {
    if (!window.confirm('This will replace all your current data with demo data. Continue?')) return;
    setSeeding(true);
    try {
      await seedAPI.load();
      window.location.reload();
    } finally {
      setSeeding(false);
    }
  };

if (sl && cl && tl) return <DashboardSkeleton />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDemoData}
            disabled={seeding}
            className="border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition">
            {seeding ? 'Loading...' : 'Load Demo Data'}
          </button>
          <button
            onClick={downloadReport}
            className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition">
            Download Report
          </button>
          <SearchBar />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Income" value={sl ? '...' : fmt(summary?.income)} color="green" />
        <SummaryCard label="Total Expenses" value={sl ? '...' : fmt(summary?.expenses)} color="red" />
        <SummaryCard
          label="Net Balance"
          value={sl ? '...' : fmt(summary?.net)}
          color={summary?.net >= 0 ? 'indigo' : 'red'}
        />
      </div>

      {insights?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4">
          <h2 className="font-semibold text-lg mb-3">Spending Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((i) => (
              <div key={i.category} className={`rounded-xl px-4 py-3 flex justify-between items-center ${i.change > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950'}`}>
                <div>
                  <p className="font-medium text-sm">{i.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {fmt(i.previous)} last month → {fmt(i.current)} this month
                  </p>
                </div>
                <span className={`text-sm font-bold ${i.change > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {i.change > 0 ? '+' : ''}{i.change.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4">
          <h2 className="font-semibold text-lg mb-4">Spending by Category</h2>
          {cl ? <p className="text-gray-400">Loading...</p> : <CategoryChart data={categories} />}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4">
          <h2 className="font-semibold text-lg mb-4">Monthly Trends</h2>
          {tl ? <p className="text-gray-400">Loading...</p> : <TrendChart data={trends} />}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">Daily Spending — Past Year</h2>
        <SpendingHeatmap data={dailySpend} />
      </div>
    </div>
  );
};

export default Dashboard;
