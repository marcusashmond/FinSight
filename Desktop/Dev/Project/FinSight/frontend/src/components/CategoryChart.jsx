import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm">No data available.</p>;

  const chartData = data
    .filter((d) => d.total < 0)
    .map((d) => ({ name: d._id, value: Math.abs(d.total) }));

  if (chartData.length === 0) return <p className="text-gray-400 text-sm">No expense data.</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
