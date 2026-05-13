import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      <div className="card">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-800 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="btn-danger w-full"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;