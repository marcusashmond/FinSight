import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const BudgetChart = ({ budgets, spendMap }) => {
  const data = budgets
    .map((b) => ({
      category: b.category,
      Limit: b.limit,
      Spent: spendMap[b.category] || 0,
    }))
    .filter((d) => d.Limit > 0);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="Limit" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.Spent > entry.Limit ? '#ef4444' : '#10b981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetChart;
