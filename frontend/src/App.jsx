import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import ProjectDetails from './pages/Projects/ProjectDetails';
import Tasks from './pages/Tasks/Tasks';
import Profile from './pages/Profile/Profile';
import Layout from './components/Layout/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
}

function DashboardWrapper() {
  const { refreshKey } = useData();
  return <Dashboard key={refreshKey} />;
}

function ProjectsWrapper() {
  const location = useLocation();
  return <Projects key={location.pathname} />;
}

function TasksWrapper() {
  const location = useLocation();
  return <Tasks key={location.pathname} />;
}

function ProjectDetailsWrapper() {
  const location = useLocation();
  return <ProjectDetails key={location.pathname + location.search} />;
}

function App() {
  return (
    <DataProvider>
      <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="projects" element={<ProjectsWrapper />} />
        <Route path="projects/:id" element={<ProjectDetailsWrapper />} />
        <Route path="tasks" element={<TasksWrapper />} />
        <Route path="profile" element={<Profile />} />
      </Route>
<Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </DataProvider>
  );
}

export default App;