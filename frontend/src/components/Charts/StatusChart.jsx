import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  'todo': '#3B82F6',
  'in-progress': '#F59E0B',
  'completed': '#10B981'
};

const StatusChart = ({ data }) => {
  const chartData = data?.map(item => ({
    name: item._id === 'todo' ? 'To Do' : item._id === 'in-progress' ? 'In Progress' : 'Completed',
    value: item.count,
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
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusChart;