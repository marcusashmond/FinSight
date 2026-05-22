import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const CATEGORIES = ['Groceries', 'Transport', 'Dining', 'Shopping', 'Utilities', 'Health', 'Housing', 'Subscriptions', 'Other'];
const PAGE_SIZE = 20;

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

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <span className="ml-1 text-gray-300">↕</span>;
  return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};

const Transactions = () => {
  const [searchParams] = useSearchParams();
  const initialMerchant = searchParams.get('merchant') || '';
  const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '', merchant: initialMerchant });
  const [applied, setApplied] = useState(initialMerchant ? { merchant: initialMerchant } : {});
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', merchant: '', category: 'Groceries', type: 'expense', amount: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    const m = searchParams.get('merchant') || '';
    if (m) {
      setFilters((f) => ({ ...f, merchant: m }));
      setApplied({ merchant: m });
      setPage(1);
    }
  }, [searchParams]);

  const queryKey = JSON.stringify({ applied, sortBy, sortOrder, page });
  const { data, loading, error, refetch } = useFetch(
    () => transactionsAPI.getAll({ ...applied, sortBy, sortOrder, page, limit: PAGE_SIZE }),
    [queryKey]
  );

  const transactions = data?.transactions || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
    setPage(1);
  };

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

  const openEdit = (tx) => {
    setEditTx(tx._id);
    setEditForm({
      date: tx.date.slice(0, 10),
      merchant: tx.merchant || '',
      category: tx.category,
      type: tx.type,
      amount: Math.abs(tx.amount).toString(),
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const amount = parseFloat(editForm.amount);
      await transactionsAPI.update(editTx, {
        ...editForm,
        amount: editForm.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      });
      setEditTx(null);
      refetch();
    } finally {
      setEditSaving(false);
    }
  };

  const sortableHeader = (label, field) => (
    <th
      className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200"
      onClick={() => handleSort(field)}
    >
      {label}<SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
    </th>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          {transactions.length > 0 && (
            <button onClick={() => exportCSV(transactions)}
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition">
              Export CSV
            </button>
          )}
          <button onClick={() => setShowForm((v) => !v)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">New Transaction</h2>
          {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" required className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Merchant</label>
              <input type="text" placeholder="e.g. Walmart" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" min="0.01" step="0.01" required placeholder="0.00"
                className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
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

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Start Date</label>
          <input type="date" className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">End Date</label>
          <input type="date" className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Category</label>
          <input type="text" placeholder="e.g. Groceries" className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Merchant</label>
          <input type="text" placeholder="e.g. Walmart" className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
            value={filters.merchant} onChange={(e) => setFilters({ ...filters, merchant: e.target.value })} />
        </div>
        <button onClick={() => { setApplied(filters); setPage(1); }}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition">
          Filter
        </button>
        <button onClick={() => { setFilters({ startDate: '', endDate: '', category: '', merchant: '' }); setApplied({}); setPage(1); }}
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          Clear
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <tr>
              {sortableHeader('Date', 'date')}
              {sortableHeader('Merchant', 'merchant')}
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              {sortableHeader('Amount', 'amount')}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No transactions found.</td></tr>
            ) : transactions.map((tx) => (
              editTx === tx._id ? (
                <tr key={tx._id} className="bg-indigo-50 dark:bg-indigo-950">
                  <td colSpan={6} className="px-4 py-3">
                    <form onSubmit={handleEditSave} className="flex flex-wrap gap-2 items-end">
                      <input type="date" required className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm"
                        value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                      <input type="text" placeholder="Merchant" className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm w-32"
                        value={editForm.merchant} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })} />
                      <select className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm"
                        value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm"
                        value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      <input type="number" min="0.01" step="0.01" required className="border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm w-24"
                        value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
                      <button type="submit" disabled={editSaving}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setEditTx(null)}
                        className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        Cancel
                      </button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{tx.merchant || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs">{tx.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{tx.type}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {fmt(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(tx)} className="text-indigo-400 hover:text-indigo-600 text-xs">Edit</button>
                      <button onClick={() => handleDelete(tx._id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t dark:border-gray-700 flex items-center justify-between text-sm">
            <p className="text-gray-500">{total} transactions</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded-lg border dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Previous
              </button>
              <span className="text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
