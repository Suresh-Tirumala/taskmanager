import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import Loader from '../../components/UI/Loader';
import Modal from '../../components/UI/Modal';
import { Search, Filter, Plus, Trash2, Edit } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', project: '' });
  const { user } = useAuth();
  const { triggerRefresh } = useData();
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'medium',
    status: 'todo',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.project) params.append('project', filters.project);

      const response = await api.get(`/tasks?${params}`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch projects');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.assignedTo) delete submitData.assignedTo;
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id || editingTask._id}`, submitData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', submitData);
        toast.success('Task created successfully');
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' });
      fetchTasks();
      triggerRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id.id || id._id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
      triggerRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      project: task.project?.id || task.project?._id || task.project,
      assignedTo: task.assignedTo?.id || task.assignedTo?._id || task.assignedTo || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        {isAdmin && (
          <button
            onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' }); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="input-field"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="input-field"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id || task._id} className={`card flex items-center justify-between ${isOverdue(task) ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status?.replace('-', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {isOverdue(task) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Overdue</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{task.project?.title}</span>
                  {task.assignedTo && <span>Assigned: {task.assignedTo.name}</span>}
                  {task.dueDate && (
                    <span className={isOverdue(task) ? 'text-red-500' : ''}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {(isAdmin || task.createdBy?.id === user?.id || task.createdBy?._id === user?.id || task.createdBy === user?.id) && (
                  <button
                    onClick={() => handleDelete(task)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTask(null); }} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Task description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="input-field"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;