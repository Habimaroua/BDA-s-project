import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Building2,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { getRoleLabel } from '@/data/mockData';

interface SidebarProps {
  role: UserRole;
}

const menuItems = {
  'vice_doyen': [
    { icon: LayoutDashboard, label: 'Vue Globale', path: '/dashboard' },
    { icon: Calendar, label: 'Emplois du Temps', path: '/schedule' },
    { icon: AlertTriangle, label: 'Conflits', path: '/conflicts' },
    { icon: Building2, label: 'Départements', path: '/departments' },
    { icon: FileSpreadsheet, label: 'Rapports', path: '/reports' },
  ],
  'admin': [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/dashboard' },
    { icon: Calendar, label: 'Générer EDT', path: '/schedule' },
    { icon: AlertTriangle, label: 'Conflits', path: '/conflicts' },
    { icon: Building2, label: 'Salles', path: '/rooms' },
    { icon: Users, label: 'Surveillances', path: '/supervision' },
  ],
  'chef_departement': [
    { icon: LayoutDashboard, label: 'Département', path: '/dashboard' },
    { icon: Calendar, label: 'Emplois du Temps', path: '/schedule' },
    { icon: AlertTriangle, label: 'Conflits', path: '/conflicts' },
    { icon: BookOpen, label: 'Formations', path: '/formations' },
  ],
  'etudiant': [
    { icon: LayoutDashboard, label: 'Mon Planning', path: '/dashboard' },
    { icon: Calendar, label: 'Mes Examens', path: '/my-exams' },
  ],
  'professeur': [
    { icon: LayoutDashboard, label: 'Mon Planning', path: '/dashboard' },
    { icon: Calendar, label: 'Mes Examens', path: '/my-exams' },
    { icon: Users, label: 'Surveillances', path: '/my-supervision' },
  ],
};

export const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const items = menuItems[role] || menuItems['etudiant'];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-foreground">UniSchedule</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestion Examens</p>
          </div>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-4">
        <div className="px-3 py-2 rounded-lg bg-sidebar-accent">
          <p className="text-xs text-sidebar-foreground/60 mb-1">Connecté en tant que</p>
          <p className="text-sm font-medium text-sidebar-primary">{getRoleLabel(role)}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname.includes('dashboard'));

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Paramètres</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
