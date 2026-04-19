import { useState } from 'react';
import { goalsAPI } from '../services/api';
import useFetch from '../hooks/useFetch';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const daysLeft = (date) => {
  const diff = new Date(date) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const Goals = () => {
  const { data: goals, loading, refetch } = useFetch(goalsAPI.getAll);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', savedAmount: '', targetDate: '' });
  const [saving, setSaving] = useState(false);
  const [contributing, setContributing] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalsAPI.create({
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        savedAmount: parseFloat(form.savedAmount) || 0,
      });
      setForm({ name: '', targetAmount: '', savedAmount: '', targetDate: '' });
      setShowForm(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleContribute = async (goal) => {
    const amount = parseFloat(contributing[goal._id] || 0);
    if (!amount || amount <= 0) return;
    await goalsAPI.update(goal._id, { savedAmount: Math.min(goal.savedAmount + amount, goal.targetAmount) });
    setContributing((prev) => ({ ...prev, [goal._id]: '' }));
    refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await goalsAPI.delete(id);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <button onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 max-w-md">
          <h2 className="font-semibold mb-4">Create Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Goal Name</label>
              <input type="text" required placeholder="e.g. Emergency Fund" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
              <input type="number" required min="1" step="0.01" placeholder="0.00" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Already Saved ($)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.savedAmount} onChange={(e) => setForm({ ...form, savedAmount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Date</label>
              <input type="date" required className="w-full border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Create Goal'}
            </button>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading...</p> : goals?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No goals yet.</p>
          <p className="text-sm mt-1">Set a savings goal to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const done = pct >= 100;
            const days = daysLeft(goal.targetDate);
            const remaining = goal.targetAmount - goal.savedAmount;
            return (
              <div key={goal._id} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{days} days left · {new Date(goal.targetDate).toLocaleDateString()}</p>
                  </div>
                  {done && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>}
                  <button onClick={() => handleDelete(goal._id)} className="text-red-400 hover:text-red-600 text-xs ml-2">Delete</button>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{fmt(goal.savedAmount)} saved</span>
                    <span className="font-medium">{fmt(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${done ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% complete · {fmt(remaining)} remaining</p>
                </div>

                {!done && (
                  <div className="flex gap-2">
                    <input
                      type="number" min="0.01" step="0.01" placeholder="Add amount"
                      className="flex-1 border dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm"
                      value={contributing[goal._id] || ''}
                      onChange={(e) => setContributing((prev) => ({ ...prev, [goal._id]: e.target.value }))}
                    />
                    <button onClick={() => handleContribute(goal)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition">
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
