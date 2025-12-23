import { useAuth } from '@/components/AuthProvider';
import ChefDashboard from './dashboards/ChefDashboard';
import UserDashboard from './dashboards/UserDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import SettingsPage from './SettingsPage';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { role: authRole } = useAuth();
  const location = useLocation();
  const role = authRole || 'etudiant';

  if (location.pathname === '/settings') {
    return <SettingsPage role={role} />;
  }

  // Séparation physique des Dashboards pour éviter les conflits de code
  if (role === 'chef_departement') {
    return <ChefDashboard role={role} />;
  }

  if (role === 'admin' || role === 'vice_doyen') {
    return <AdminDashboard role={role} />;
  }

  // Pour les professeurs et étudiants (Vues stables et identiques)
  return <UserDashboard role={role} />;
};

export default Dashboard;
