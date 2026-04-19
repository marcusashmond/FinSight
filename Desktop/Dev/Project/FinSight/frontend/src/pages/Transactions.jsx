import { useState } from 'react';
import { transactionsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const Transactions = () => {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '' });
  const [applied, setApplied] = useState({});
  const { data: transactions, loading, error, refetch } = useFetch(
    () => transactionsAPI.getAll(applied),
    [JSON.stringify(applied)]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await transactionsAPI.delete(id);
    refetch();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

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
        <button
          onClick={() => setApplied(filters)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          Filter
        </button>
        <button
          onClick={() => { setFilters({ startDate: '', endDate: '', category: '' }); setApplied({}); }}
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
