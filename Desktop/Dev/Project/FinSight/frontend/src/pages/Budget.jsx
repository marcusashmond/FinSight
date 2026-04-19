import { useState } from 'react';
import { budgetsAPI, analyticsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const CATEGORIES = ['Groceries', 'Transport', 'Dining', 'Shopping', 'Utilities', 'Health', 'Housing', 'Subscriptions', 'Other'];

const Budget = () => {
  const { data: budgets, loading, refetch } = useFetch(budgetsAPI.getAll);
  const { data: categorySpend } = useFetch(analyticsAPI.categories);
  const [form, setForm] = useState({ category: 'Groceries', limit: '', period: 'monthly' });
  const [saving, setSaving] = useState(false);

  const spendMap = {};
  categorySpend?.forEach((c) => { spendMap[c._id] = Math.abs(c.total); });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await budgetsAPI.delete(id);
    refetch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await budgetsAPI.create({ ...form, limit: parseFloat(form.limit) });
      refetch();
      setForm({ category: 'Groceries', limit: '', period: 'monthly' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Budgets</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 max-w-md">
        <h2 className="font-semibold mb-4">Set a Budget</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2"
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Limit ($)</label>
            <input type="number" min="1" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2"
              value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2"
              value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
              {['monthly', 'weekly', 'yearly'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Your Budgets</h2>
        {loading ? <p className="text-gray-400">Loading...</p> : budgets?.length === 0 ? (
          <p className="text-gray-400">No budgets set yet.</p>
        ) : budgets?.map((b) => {
          const spent = spendMap[b.category] || 0;
          const pct = Math.min((spent / b.limit) * 100, 100);
          const over = spent > b.limit;
          const nearLimit = !over && pct >= 80;
          return (
            <div key={b._id} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{b.category}</span>
                  {nearLimit && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">80% reached</span>
                  )}
                  {over && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Over budget</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${over ? 'text-red-500' : nearLimit ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-300'}`}>
                    ${spent.toFixed(2)} / ${b.limit} <span className="text-gray-400 font-normal">({b.period})</span>
                  </span>
                  <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:text-red-600 text-xs">
                    Delete
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${over ? 'bg-red-500' : nearLimit ? 'bg-yellow-400' : 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {over && <p className="text-red-500 text-xs mt-1">Over budget by ${(spent - b.limit).toFixed(2)}</p>}
              {nearLimit && <p className="text-yellow-600 text-xs mt-1">{pct.toFixed(0)}% of budget used — slowing down?</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;
