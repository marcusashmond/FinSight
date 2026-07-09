import { useState, useEffect, useRef } from 'react';
import { budgetsAPI, analyticsAPI } from '../services/api';

const NotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedAlerts') || '[]'); } catch { return []; }
  });
  const ref = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, cRes] = await Promise.all([budgetsAPI.getAll(), analyticsAPI.categories()]);
        const budgets = bRes.data || [];
        const spendMap = {};
        (cRes.data || []).forEach((c) => { spendMap[c._id] = Math.abs(c.total); });

        const computed = budgets.flatMap((b) => {
          const spent = spendMap[b.category] || 0;
          const pct = (spent / b.limit) * 100;
          if (pct >= 100) return [{ id: b._id, category: b.category, type: 'over', spent, limit: b.limit, pct }];
          if (pct >= 80) return [{ id: b._id, category: b.category, type: 'near', spent, limit: b.limit, pct }];
          return [];
        });
        setAlerts(computed);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('dismissedAlerts', JSON.stringify(next));
  };

  const dismissAll = () => {
    const next = [...dismissed, ...visible.map((a) => a.id)];
    setDismissed(next);
    localStorage.setItem('dismissedAlerts', JSON.stringify(next));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {visible.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
            <span className="font-semibold text-sm">Budget Alerts</span>
            {visible.length > 0 && (
              <button onClick={dismissAll} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                Dismiss all
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="px-4 py-5 text-sm text-gray-400 text-center">No alerts — you're on track!</p>
          ) : (
            <div className="divide-y dark:divide-gray-700 max-h-72 overflow-y-auto">
              {visible.map((a) => (
                <div key={a.id} className="px-4 py-3 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${a.type === 'over' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                      {a.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {a.type === 'over'
                        ? `Over budget by $${(a.spent - a.limit).toFixed(2)}`
                        : `${a.pct.toFixed(0)}% of $${a.limit} limit used`}
                    </p>
                  </div>
                  <button onClick={() => dismiss(a.id)} className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 ml-3 mt-0.5 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
