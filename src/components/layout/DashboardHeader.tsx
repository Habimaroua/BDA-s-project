import { Bell, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserRole } from '@/types';
import { getRoleLabel } from '@/data/mockData';
import { useAuth } from '@/components/AuthProvider';

interface DashboardHeaderProps {
  role: UserRole;
}

export const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const { user } = useAuth();

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
          <p className="text-sm text-muted-foreground">
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
              placeholder="Rechercher..."
              className="pl-10 w-64 bg-secondary/50 border-transparent focus:border-accent"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-soft" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.full_name || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
