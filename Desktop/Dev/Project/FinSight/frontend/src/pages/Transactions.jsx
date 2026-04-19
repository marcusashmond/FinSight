import { useState } from 'react';
import { transactionsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const CATEGORIES = ['Groceries', 'Transport', 'Dining', 'Shopping', 'Utilities', 'Health', 'Housing', 'Subscriptions', 'Other'];

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const exportCSV = (transactions) => {
  const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount'];
  const rows = transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString(),
    tx.merchant || '',
    tx.category,
    tx.type,
    tx.amount.toFixed(2),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const Transactions = () => {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '', merchant: '' });
  const [applied, setApplied] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', merchant: '', category: 'Groceries', type: 'expense', amount: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: transactions, loading, error, refetch } = useFetch(
    () => transactionsAPI.getAll(applied),
    [JSON.stringify(applied)]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await transactionsAPI.delete(id);
    refetch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const amount = parseFloat(form.amount);
      await transactionsAPI.create({
        ...form,
        amount: form.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      });
      setForm({ date: '', merchant: '', category: 'Groceries', type: 'expense', amount: '' });
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          {transactions?.length > 0 && (
            <button
              onClick={() => exportCSV(transactions)}
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition"
            >
              Export CSV
            </button>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">New Transaction</h2>
          {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Merchant</label>
              <input type="text" placeholder="e.g. Walmart" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" min="0.01" step="0.01" required placeholder="0.00"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Start Date</label>
          <input type="date" className="border rounded-lg px-3 py-1.5 text-sm"
            value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">End Date</label>
          <input type="date" className="border rounded-lg px-3 py-1.5 text-sm"
            value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Category</label>
          <input type="text" placeholder="e.g. Groceries" className="border rounded-lg px-3 py-1.5 text-sm"
            value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Merchant</label>
          <input type="text" placeholder="e.g. Walmart" className="border rounded-lg px-3 py-1.5 text-sm"
            value={filters.merchant} onChange={(e) => setFilters({ ...filters, merchant: e.target.value })} />
        </div>
        <button
          onClick={() => setApplied(filters)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          Filter
        </button>
        <button
          onClick={() => { setFilters({ startDate: '', endDate: '', category: '', merchant: '' }); setApplied({}); }}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Clear
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Date', 'Merchant', 'Category', 'Type', 'Amount', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : transactions?.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No transactions found.</td></tr>
            ) : transactions?.map((tx) => (
              <tr key={tx._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{tx.merchant || '—'}</td>
                <td className="px-4 py-3">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{tx.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className={`px-4 py-3 font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {fmt(tx.amount)}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(tx._id)} className="text-red-400 hover:text-red-600 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
