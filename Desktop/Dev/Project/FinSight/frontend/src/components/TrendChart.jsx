import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm">No trend data available.</p>;

  const map = {};
  data.forEach(({ _id, total }) => {
    const key = `${MONTHS[_id.month - 1]} ${_id.year}`;
    if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
    if (_id.type === 'income') map[key].income = total;
    else map[key].expenses = Math.abs(total);
  });

  const chartData = Object.values(map);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
