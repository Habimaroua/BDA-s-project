import {
  Users,
  Calendar,
  AlertTriangle,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardStats } from '@/data/mockData';
import type { UserRole } from '@/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface StatsOverviewProps {
  role: UserRole;
}

export const StatsOverview = ({ role }: StatsOverviewProps) => {
  const [realStats, setRealStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats');
        setRealStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const dataToUse = realStats || dashboardStats;

  const stats = [
    {
      label: 'Étudiants Inscrits',
      value: (dataToUse?.totalStudents ?? 0).toLocaleString('fr-FR'),
      icon: Users,
      change: '+2.5%',
      changeType: 'positive' as const,
      roles: ['vice_doyen', 'admin'],
    },
    {
      label: 'Filières Actives',
      value: (dataToUse?.formationsCount ?? 0).toString(),
      icon: TrendingUp,
      change: 'Spécialités',
      changeType: 'neutral' as const,
      roles: ['chef_departement'],
    },
    {
      label: 'Examens Planifiés',
      value: (dataToUse?.totalExams ?? 0).toLocaleString('fr-FR'),
      icon: Calendar,
      change: 'Total session',
      changeType: 'neutral' as const,
      roles: ['vice_doyen', 'admin', 'chef_departement'],
    },
    {
      label: 'Examens Validés',
      value: (dataToUse?.validatedExams ?? 0).toString(),
      icon: CheckCircle,
      change: 'Approuvés',
      changeType: 'positive' as const,
      roles: ['chef_departement'],
    },
    {
      label: 'En attente',
      value: (dataToUse?.nonValidatedExams ?? 0).toString(),
      icon: Clock,
      change: 'À valider',
      changeType: 'neutral' as const,
      roles: ['chef_departement'],
    },
    {
      label: 'Conflits Détectés',
      value: (dataToUse?.totalConflicts ?? 0).toString(),
      icon: AlertTriangle,
      change: '-5',
      changeType: 'positive' as const,
      roles: ['vice_doyen', 'admin', 'chef_departement'],
    },
    {
      label: 'Salles Exploitées',
      value: (dataToUse?.usedRooms ?? 0).toString(),
      icon: Building2,
      change: 'Occupation',
      changeType: 'neutral' as const,
      roles: ['chef_departement', 'admin'],
    },
    {
      label: 'Taux d\'Occupation',
      value: `${dataToUse?.roomOccupancy ?? 0}%`,
      icon: Building2,
      change: '+3.2%',
      changeType: 'neutral' as const,
      roles: ['vice_doyen', 'admin'],
    },
    {
      label: 'Départements',
      value: (dataToUse?.departmentsCount ?? 0).toString(),
      icon: TrendingUp,
      change: 'Actifs',
      changeType: 'neutral' as const,
      roles: ['vice_doyen'],
    },
  ];

  const filteredStats = stats.filter(stat =>
    stat.roles.includes(role) || role === 'vice_doyen'
  );

  const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredStats.map((stat, index) => (
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
