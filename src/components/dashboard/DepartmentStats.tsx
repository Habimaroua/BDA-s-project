import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { departments } from '@/data/mockData';

export const DepartmentStats = () => {
  // Mock stats per department
  const deptStats = departments.map((dept, index) => ({
    ...dept,
    examCount: Math.floor(Math.random() * 100) + 50,
    conflictRate: Math.random() * 5,
    roomUsage: 60 + Math.random() * 35,
  }));

  return (
    <Card className="shadow-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Statistiques par Département</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {deptStats.map((dept, index) => (
            <div 
              key={dept.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{dept.code}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.examCount} examens planifiés</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{dept.roomUsage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Occupation salles</p>
                </div>
              </div>
              <Progress value={dept.roomUsage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
