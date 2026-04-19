import { useState } from 'react';
import { assetsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const ASSET_CATEGORIES = ['Checking', 'Savings', 'Investment', 'Property', 'Vehicle', 'Other'];
const LIABILITY_CATEGORIES = ['Mortgage', 'Car Loan', 'Student Loan', 'Credit Card', 'Other'];

const NetWorth = () => {
  const { data: items, loading, refetch } = useFetch(assetsAPI.getAll);
  const [form, setForm] = useState({ name: '', type: 'asset', category: 'Checking', value: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const assets = items?.filter((i) => i.type === 'asset') || [];
  const liabilities = items?.filter((i) => i.type === 'liability') || [];
  const totalAssets = assets.reduce((s, i) => s + i.value, 0);
  const totalLiabilities = liabilities.reduce((s, i) => s + i.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const categories = form.type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assetsAPI.create({ ...form, value: parseFloat(form.value) });
      setForm({ name: '', type: 'asset', category: 'Checking', value: '' });
      setShowForm(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    await assetsAPI.delete(id);
    refetch();
  };

  const Section = ({ title, rows, total, color }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold">{title}</h2>
        <span className={`font-bold ${color}`}>{fmt(total)}</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-4 text-sm text-gray-400">None added yet.</p>
      ) : rows.map((item) => (
        <div key={item._id} className="px-4 py-3 flex justify-between items-center border-b dark:border-gray-800 last:border-0">
          <div>
            <p className="font-medium text-sm">{item.name}</p>
            <p className="text-xs text-gray-400">{item.category}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm">{fmt(item.value)}</span>
            <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Net Worth</h1>
        <button onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      <div className={`rounded-2xl p-6 text-center shadow ${netWorth >= 0 ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'}`}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Net Worth</p>
        <p className={`text-4xl font-bold mt-1 ${netWorth >= 0 ? 'text-green-600' : 'text-red-500'}`}>{fmt(netWorth)}</p>
        <div className="flex justify-center gap-8 mt-4 text-sm">
          <span className="text-green-600 font-medium">Assets: {fmt(totalAssets)}</span>
          <span className="text-red-500 font-medium">Liabilities: {fmt(totalLiabilities)}</span>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 max-w-md">
          <h2 className="font-semibold mb-4">Add Item</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value, category: e.target.value === 'asset' ? 'Checking' : 'Mortgage' })}>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" required placeholder="e.g. Chase Savings" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value ($)</label>
              <input type="number" required min="0" step="0.01" placeholder="0.00" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="space-y-4">
          <Section title="Assets" rows={assets} total={totalAssets} color="text-green-600" />
          <Section title="Liabilities" rows={liabilities} total={totalLiabilities} color="text-red-500" />
        </div>
      )}
    </div>
  );
};

export default NetWorth;
