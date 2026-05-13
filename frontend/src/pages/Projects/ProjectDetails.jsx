import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import Loader from '../../components/UI/Loader';
import Modal from '../../components/UI/Modal';
import { ArrowLeft, Plus, Trash2, Edit, User, Calendar } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo'
  });
  const { user } = useAuth();
  const { triggerRefresh } = useData();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProject();
    fetchUsers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error('Failed to fetch project');
    } finally {
      setLoading(false);
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

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...taskForm };
    if (!submitData.assignedTo) delete submitData.assignedTo;
    try {
      await api.post('/tasks', { ...submitData, project: id });
      toast.success('Task created successfully');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
      fetchProject();
      triggerRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      fetchProject();
      triggerRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
      triggerRefresh();
    } catch (error) {
      toast.error('Failed to update task status');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
          <p className="text-gray-600">{project.description || 'No description'}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Project Info</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Created by</p>
            <p className="font-medium">{project.createdBy?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Members</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(project.members || []).map((member) => (
                <span key={member.id || member._id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Tasks ({tasks.length})</h2>
        {isAdmin && (
          <button onClick={() => setShowTaskModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No tasks in this project</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id || task._id} className="card flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status?.replace('-', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {task.assignedTo && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {(task.assignedTo.name || task.assignedTo)}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id || task._id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                {(isAdmin || task.createdBy?.id === user?.id || task.createdBy?._id === user?.id || task.createdBy === user?.id) && (
                  <button
                    onClick={() => handleDeleteTask(task.id || task._id)}
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

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="input-field"
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Task description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="input-field"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;