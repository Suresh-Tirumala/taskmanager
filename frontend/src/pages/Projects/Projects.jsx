import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import Loader from '../../components/UI/Loader';
import Modal from '../../components/UI/Modal';
import { Plus, Search, Users, Trash2, Edit } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', members: [] });
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { triggerRefresh } = useData();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProjects();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setAllUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        members: formData.members
      };
      if (formData.id) {
        await api.put(`/projects/${formData.id}`, submitData);
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', submitData);
        toast.success('Project created successfully');
      }
      setShowModal(false);
      setFormData({ title: '', description: '', members: [] });
      fetchProjects();
      triggerRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    try {
      await api.delete(`/projects/${id.id || id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
      triggerRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const openEditModal = (project) => {
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description || '',
      members: project.members.map(m => m.id || m._id)
    });
    setShowModal(true);
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        {isAdmin && (
          <button
            onClick={() => { setFormData({ title: '', description: '', members: [] }); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id || project._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/projects/${project.id || project._id}`} className="text-lg font-semibold text-gray-800 hover:text-primary-600">
                  {project.title}
                </Link>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  {project.members?.length || 0} members
                </div>
                <span className="text-gray-500">{project.taskCount || 0} tasks</span>
              </div>
              <Link
                to={`/projects/${project.id || project._id}`}
                className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={formData.id ? 'Edit Project' : 'Create Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Project title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="Project description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {allUsers.map((user) => (
                <label key={user.id || user._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={formData.members.includes(user.id || user._id)}
                    onChange={(e) => {
                      const userId = user.id || user._id;
                      if (e.target.checked) {
                        setFormData({ ...formData, members: [...formData.members, userId] });
                      } else {
                        setFormData({ ...formData, members: formData.members.filter(id => id !== userId) });
                      }
                    }}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-400">({user.email})</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {formData.id ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;