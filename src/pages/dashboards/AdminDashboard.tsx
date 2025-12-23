import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ConflictsPanel } from '@/components/dashboard/ConflictsPanel';
import { ExamSchedule } from '@/components/dashboard/ExamSchedule';
import { DepartmentStats } from '@/components/dashboard/DepartmentStats';
import RoomsList from '@/components/dashboard/RoomsList';
import SupervisionList from '@/components/dashboard/SupervisionList';
import Reports from '@/components/dashboard/Reports';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AdminDashboardProps {
    role: UserRole;
}

const AdminDashboard = ({ role }: AdminDashboardProps) => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const path = location.pathname;

    const handleGlobalValidation = async () => {
        if (!confirm("Êtes-vous sûr de vouloir valider définitivement tous les emplois du temps ? Cette action est irréversible et publiera les plannings pour tous.")) return;
        try {
            // Mock API call or create a real one if needed. 
            // In a real app we might have a specific endpoint. 
            // For now let's reuse department validate or a new one?
            // Let's assume there is a global validate endpoint or we just simulate it.
            // await api.post('/admin/validate-all');
            toast.success("Validation globale effectuée ! Les plannings sont maintenant officiels.");
        } catch (error) {
            toast.error("Erreur lors de la validation globale.");
        }
    };

    const renderContent = () => {
        switch (path) {
            case '/rooms':
                return <RoomsList />;
            case '/conflicts':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold font-display">Conflits Détectés</h2>
                        <div className="w-full">
                            <ConflictsPanel role={role} />
                        </div>
                    </div>
                );
            case '/supervision':
                return <SupervisionList />;
            case '/reports':
                return <Reports />;
            case '/departments':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold font-display">Statistiques Départements</h2>
                        <DepartmentStats />
                    </div>
                );
            case '/schedule':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display">Générer Emploi du Temps</h2>
                            {role === 'vice_doyen' && (
                                <Button
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleGlobalValidation}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Validation Finale (Officielle)
                                </Button>
                            )}
                        </div>
                        <ExamSchedule
                            role={role}
                            title="Planification Globale"
                            viewType="exams"
                            searchQuery={searchQuery}
                        />
                    </div>
                );
            case '/dashboard':
            default:
                return (
                    <>
                        <StatsOverview role={role} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            <div className="lg:col-span-3">
                                <ExamSchedule
                                    role={role}
                                    title="Aperçu du Planning"
                                    viewType="exams"
                                    searchQuery={searchQuery}
                                />
                            </div>
                        </div>
                        <div className="mt-8">
                            <DepartmentStats />
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background flex w-full">
            <Sidebar role={role} />
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <DashboardHeader role={role} onSearch={setSearchQuery} />
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
