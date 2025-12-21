import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ConflictsPanel } from '@/components/dashboard/ConflictsPanel';
import { ExamSchedule } from '@/components/dashboard/ExamSchedule';
import { DepartmentStats } from '@/components/dashboard/DepartmentStats';
import type { UserRole } from '@/types';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'admin';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} />
      
      <main className="flex-1 ml-64">
        <DashboardHeader role={role} />
        
        <div className="p-6 space-y-6">
          <StatsOverview role={role} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ExamSchedule role={role} />
            </div>
            <div>
              <ConflictsPanel role={role} />
            </div>
          </div>
          
          {(role === 'vice-dean' || role === 'admin') && (
            <DepartmentStats />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
