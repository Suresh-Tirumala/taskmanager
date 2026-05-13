import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORS = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444'
};

const PriorityChart = ({ data }) => {
  const chartData = data?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
    color: COLORS[item._id]
  })) || [];

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No tasks yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={60} />
        <Tooltip />
        <Bar dataKey="count" radius={4}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PriorityChart;