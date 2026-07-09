import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const intensityClass = (total, max) => {
  if (!total || total === 0) return 'bg-gray-100 dark:bg-gray-800';
  const pct = total / max;
  if (pct < 0.25) return 'bg-red-100 dark:bg-red-950';
  if (pct < 0.5)  return 'bg-red-300 dark:bg-red-800';
  if (pct < 0.75) return 'bg-red-500 dark:bg-red-600';
  return 'bg-red-700 dark:bg-red-400';
};

const SpendingHeatmap = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const spendMap = {};
  (data || []).forEach((d) => { spendMap[d.date] = d.total; });

  const max = Math.max(...Object.values(spendMap), 1);

  // Build weeks ending today, starting on the Sunday 364 days ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  const cursor = new Date(startDate);

  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({
        date: iso,
        total: spendMap[iso] || 0,
        isFuture: cursor > today,
        month: cursor.getMonth(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month label per first week of each new month
  const monthLabels = weeks.map((week, wi) => {
    if (wi === 0 || week[0].month !== weeks[wi - 1][0].month) {
      return MONTHS[week[0].month];
    }
    return '';
  });

  return (
    <div className="relative overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {weeks.map((_, wi) => (
          <div key={wi} className="w-3.5 shrink-0 text-[10px] text-gray-400 leading-none">
            {monthLabels[wi]}
          </div>
        ))}
      </div>

      <div className="flex gap-0">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAYS.map((d, i) => (
            <div key={d} className={`h-3 w-6 text-[10px] text-gray-400 leading-3 ${i % 2 === 0 ? 'invisible' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`w-3 h-3 rounded-sm ${
                    cell.isFuture
                      ? 'opacity-0 pointer-events-none'
                      : intensityClass(cell.total, max)
                  }`}
                  onMouseEnter={(e) => !cell.isFuture && setTooltip({ ...cell, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 ml-8">
        <span className="text-[10px] text-gray-400">Less</span>
        {[
          'bg-gray-100 dark:bg-gray-800',
          'bg-red-100 dark:bg-red-950',
          'bg-red-300 dark:bg-red-800',
          'bg-red-500 dark:bg-red-600',
          'bg-red-700 dark:bg-red-400',
        ].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-gray-400">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <p className="font-medium">{tooltip.total > 0 ? fmt(tooltip.total) : 'No spending'}</p>
          <p className="text-gray-300 mt-0.5">
            {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default SpendingHeatmap;
