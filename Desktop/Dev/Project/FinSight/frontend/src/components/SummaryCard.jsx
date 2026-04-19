const colorMap = {
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
};

const SummaryCard = ({ label, value, color = 'indigo' }) => (
  <div className={`rounded-2xl border p-5 shadow-sm ${colorMap[color]}`}>
    <p className="text-sm font-medium opacity-75">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

export default SummaryCard;
