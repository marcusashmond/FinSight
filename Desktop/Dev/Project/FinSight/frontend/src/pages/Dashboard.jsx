import { analyticsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';
import SummaryCard from '../components/SummaryCard';
import CategoryChart from '../components/CategoryChart';
import TrendChart from '../components/TrendChart';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const Dashboard = () => {
  const { data: summary, loading: sl } = useFetch(analyticsAPI.summary);
  const { data: categories, loading: cl } = useFetch(analyticsAPI.categories);
  const { data: trends, loading: tl } = useFetch(analyticsAPI.trends);
  const { data: insights } = useFetch(analyticsAPI.insights);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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
    </div>
  );
};

export default Dashboard;
