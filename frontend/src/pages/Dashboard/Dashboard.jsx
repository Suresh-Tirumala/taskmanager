import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/UI/Loader';
import StatusChart from '../../components/Charts/StatusChart';
import PriorityChart from '../../components/Charts/PriorityChart';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, CheckSquare, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey, triggerRefresh } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, myTasksRes] = await Promise.all([
          api.get('/tasks/dashboard'),
          api.get('/tasks/my-tasks')
        ]);
        console.log('DEBUG: Dashboard stats received:', statsRes.data.stats);
        console.log('DEBUG: My tasks received:', myTasksRes.data.tasks);
        setStats(statsRes.data.stats);
        setMyTasks(myTasksRes.data.tasks);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: isAdmin ? 'Total Projects' : 'Assigned Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'bg-blue-500', link: '/projects' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'bg-purple-500', link: '/tasks' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle, color: 'bg-green-500', link: '/tasks?status=completed' },
    { label: 'Pending', value: stats?.pendingTasks || 0, icon: Clock, color: 'bg-yellow-500', link: '/tasks?status=in-progress' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: 'bg-red-500', link: '/tasks' },
    { label: 'My Tasks', value: stats?.myTasks || 0, icon: CheckSquare, color: 'bg-indigo-500', link: '/tasks' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={triggerRefresh}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Status</h3>
          <StatusChart data={stats?.statusDistribution || []} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
          <PriorityChart data={stats?.priorityDistribution || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div key={task.id || task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.project?.title || 'No Project'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status?.replace('-', ' ')}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(task.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">My Tasks</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {myTasks.length > 0 ? (
              myTasks.map((task) => (
                <div key={task._id || task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.project?.title && <span className="mr-2">[{task.project.title}]</span>}
                      {task.dueDate ? (
                        <span className={isOverdue(task) ? 'text-red-500' : ''}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task) && ' (Overdue)'}
                        </span>
                      ) : (
                        <span>No due date</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status?.replace('-', ' ')}
                    </span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;