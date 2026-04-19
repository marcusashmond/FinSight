import { useState } from 'react';
import { subscriptionsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const Recurring = () => {
  const { data: subs, loading, refetch } = useFetch(subscriptionsAPI.getAll);
  const [form, setForm] = useState({ merchant: '', amount: '', frequency: 'monthly' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const monthlyTotal = subs?.reduce((acc, s) => {
    if (s.frequency === 'monthly') return acc + s.amount;
    if (s.frequency === 'weekly') return acc + s.amount * 4;
    if (s.frequency === 'yearly') return acc + s.amount / 12;
    return acc;
  }, 0) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subscriptionsAPI.create({ ...form, amount: parseFloat(form.amount) });
      setForm({ merchant: '', amount: '', frequency: 'monthly' });
      setShowForm(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscription?')) return;
    await subscriptionsAPI.delete(id);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Subscription'}
        </button>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Estimated monthly cost</p>
        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{fmt(monthlyTotal)}</p>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 max-w-md">
          <h2 className="font-semibold mb-4">New Subscription</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Service / Merchant</label>
              <input type="text" required placeholder="e.g. Netflix" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" required min="0.01" step="0.01" placeholder="0.00" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                {['weekly', 'monthly', 'yearly'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <tr>
              {['Service', 'Amount', 'Frequency', 'Monthly Cost', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : subs?.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No subscriptions tracked yet.</td></tr>
            ) : subs?.map((s) => {
              const monthly = s.frequency === 'monthly' ? s.amount
                : s.frequency === 'weekly' ? s.amount * 4
                : s.amount / 12;
              return (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{s.merchant}</td>
                  <td className="px-4 py-3">{fmt(s.amount)}</td>
                  <td className="px-4 py-3 capitalize">{s.frequency}</td>
                  <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-semibold">{fmt(monthly)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-600 text-xs">
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recurring;
