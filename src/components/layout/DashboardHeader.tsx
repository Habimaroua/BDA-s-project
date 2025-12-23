import { useNavigate } from 'react-router-dom';
import { Bell, Search, User as UserIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';
import { getRoleLabel } from '@/data/mockData';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Settings as SettingsIcon, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  role: UserRole;
  onSearch?: (query: string) => void;
}

export const DashboardHeader = ({ role, onSearch }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Sync theme on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else if (prefersDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const enabled = localStorage.getItem('notifications_enabled') !== 'false';
      if (!enabled) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        const data = await api.get('/notifications');
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Erreur notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.post('/notifications/mark-read', { notificationId: id });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  const getWelcomeMessage = () => {
    switch (role) {
      case 'vice_doyen':
        return 'Vue Stratégique Globale';
      case 'admin':
        return 'Gestion des Plannings';
      case 'chef_departement':
        return 'Tableau de Bord Département';
      default:
        return 'Mon Planning';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {getWelcomeMessage()}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un module, une salle..."
              className="pl-10 w-64 bg-secondary/50 border-transparent focus:border-accent"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative group">
                <Bell className="w-5 h-5 group-hover:text-accent transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse-soft" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuLabel className="flex justify-between items-center px-2 py-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && <Badge variant="destructive" className="ml-2 text-[10px] h-4 px-1">{unreadCount}</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-4 text-muted-foreground">Aucune notification</p>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!n.is_read ? 'bg-accent/5 font-medium' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex justify-between w-full">
                        <span className="text-xs font-bold text-foreground">{n.title}</span>
                        {!n.is_read && <span className="w-1.5 h-1.5 bg-accent rounded-full" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                      <div className="flex justify-between w-full mt-1">
                        <span className="text-[9px] text-slate-400 italic">
                          {new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[9px] font-medium text-accent uppercase tracking-wider">{n.type}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 bg-secondary/30">
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer justify-center text-xs text-muted-foreground hover:text-accent">
                  Gérer toutes mes préférences
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-muted-foreground hover:text-accent">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer group hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{user?.full_name || 'Utilisateur'}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/20 group-hover:border-accent group-hover:bg-accent/20 transition-all">
                  <UserIcon className="w-5 h-5 text-accent" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                <Badge variant="outline" className="mr-2 h-4 w-4 p-0 flex items-center justify-center">E</Badge>
                <span>Mon Espace</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
