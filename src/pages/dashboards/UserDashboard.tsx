import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { ExamSchedule } from '@/components/dashboard/ExamSchedule';
import { UserRole } from '@/types';

interface UserDashboardProps {
    role: UserRole;
}

const UserDashboard = ({ role }: UserDashboardProps) => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const getSubTitle = () => {
        if (location.pathname === '/my-exams') return "Mes Responsabilités";
        if (location.pathname === '/my-supervision') return "Mes Surveillances";
        return "Mon Planning d'Examens";
    };

    const viewType = location.pathname === '/my-supervision' ? 'supervision' : 'exams';

    return (
        <div className="min-h-screen bg-background flex w-full">
            <Sidebar role={role} />
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <DashboardHeader role={role} onSearch={setSearchQuery} />
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto w-full">
                        <ExamSchedule
                            role={role}
                            title={getSubTitle()}
                            viewType={viewType}
                            searchQuery={searchQuery}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
