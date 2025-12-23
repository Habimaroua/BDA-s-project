import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ConflictsPanel } from '@/components/dashboard/ConflictsPanel';
import { ExamSchedule } from '@/components/dashboard/ExamSchedule';
import { DepartmentStats } from '@/components/dashboard/DepartmentStats';
import { FormationsList } from '@/components/dashboard/FormationsList';
import { UserRole } from '@/types';

interface ChefDashboardProps {
    role: UserRole;
}

const ChefDashboard = ({ role }: ChefDashboardProps) => {
    const { user } = useAuth();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<any>(null);

    // Récupérer le nom du département via les stats si absent de la session
    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await api.get('/stats');
                setStats(data);
            } catch (e) { console.error(e); }
        };
        loadStats();
    }, []);

    const deptName = user?.department_name || stats?.departmentName;

    const isFormationsPage = location.pathname === '/formations';
    const isDashboardPage = location.pathname === '/dashboard';
    const isSchedulePage = location.pathname === '/schedule';

    return (
        <div className="min-h-screen bg-background flex w-full">
            <Sidebar role={role} />
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <DashboardHeader role={role} onSearch={setSearchQuery} />
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                    {/* Message de Bienvenue au tout début */}
                    {isDashboardPage && (
                        <div className="p-8 bg-accent/5 border border-accent/10 rounded-2xl text-center animate-fade-in">
                            <h3 className="text-xl font-display font-bold mb-2">
                                Bienvenue sur votre espace Département {deptName ? `- ${deptName}` : ''}
                            </h3>
                            <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                Gérez vos filières, consultez les statistiques et validez les plannings depuis vos menus dédiés.
                            </p>
                        </div>
                    )}

                    {/* Statistiques visibles sur le Dashboard principal */}
                    {isDashboardPage && <StatsOverview role={role} />}

                    <div className="animate-fade-in transition-all">
                        {isDashboardPage && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <DepartmentStats />
                                </div>
                                <div className="lg:col-span-1">
                                    <ConflictsPanel role={role} />
                                </div>
                            </div>
                        )}

                        {isFormationsPage && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <FormationsList />
                                </div>
                                <div className="lg:col-span-1">
                                    <ConflictsPanel role={role} />
                                </div>
                            </div>
                        )}

                        {isSchedulePage && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <div>
                                        <h2 className="text-xl font-bold">Gestion des Emplois du Temps</h2>
                                        <p className="text-sm text-muted-foreground">Vue multi-filières et multi-années (L1-M2)</p>
                                    </div>
                                </div>
                                <ExamSchedule
                                    role={role}
                                    title="Planning Multi-Filières"
                                    viewType="exams"
                                    searchQuery={searchQuery}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChefDashboard;
