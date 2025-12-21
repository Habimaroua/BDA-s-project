import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Building2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardStats } from '@/data/mockData';
import type { UserRole } from '@/types';

interface StatsOverviewProps {
  role: UserRole;
}

export const StatsOverview = ({ role }: StatsOverviewProps) => {
  const stats = [
    {
      label: 'Étudiants Inscrits',
      value: dashboardStats.totalStudents.toLocaleString('fr-FR'),
      icon: Users,
      change: '+2.5%',
      changeType: 'positive' as const,
      roles: ['vice-dean', 'admin'],
    },
    {
      label: 'Examens Planifiés',
      value: dashboardStats.totalExams.toLocaleString('fr-FR'),
      icon: Calendar,
      change: '+12',
      changeType: 'neutral' as const,
      roles: ['vice-dean', 'admin', 'department-head'],
    },
    {
      label: 'Conflits Détectés',
      value: dashboardStats.totalConflicts.toString(),
      icon: AlertTriangle,
      change: '-5',
      changeType: 'positive' as const,
      roles: ['vice-dean', 'admin', 'department-head'],
    },
    {
      label: 'Taux d\'Occupation',
      value: `${dashboardStats.roomOccupancy}%`,
      icon: Building2,
      change: '+3.2%',
      changeType: 'neutral' as const,
      roles: ['vice-dean', 'admin'],
    },
    {
      label: 'Examens / Jour',
      value: dashboardStats.avgExamsPerDay.toString(),
      icon: Clock,
      change: 'Moyenne',
      changeType: 'neutral' as const,
      roles: ['vice-dean', 'admin'],
    },
    {
      label: 'Départements',
      value: dashboardStats.departmentsCount.toString(),
      icon: TrendingUp,
      change: 'Actifs',
      changeType: 'neutral' as const,
      roles: ['vice-dean'],
    },
  ];

  const filteredStats = stats.filter(stat => 
    stat.roles.includes(role) || role === 'vice-dean'
  );

  const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredStats.slice(0, 4).map((stat, index) => (
        <Card 
          key={stat.label} 
          className="overflow-hidden animate-scale-in shadow-card hover:shadow-card-hover transition-shadow"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                <p className={`text-xs font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
