import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { conflicts } from '@/data/mockData';
import type { UserRole, Conflict } from '@/types';

interface ConflictsPanelProps {
  role: UserRole;
}

const getSeverityIcon = (severity: Conflict['severity']) => {
  switch (severity) {
    case 'high':
      return AlertTriangle;
    case 'medium':
      return AlertCircle;
    default:
      return Info;
  }
};

const getSeverityStyles = (severity: Conflict['severity']) => {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        badge: 'bg-destructive/20 text-destructive border-destructive/30',
      };
    case 'medium':
      return {
        bg: 'bg-warning/10',
        text: 'text-warning',
        badge: 'bg-warning/20 text-warning border-warning/30',
      };
    default:
      return {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        badge: 'bg-muted text-muted-foreground border-border',
      };
  }
};

const getTypeLabel = (type: Conflict['type']) => {
  switch (type) {
    case 'student':
      return 'Étudiant';
    case 'professor':
      return 'Professeur';
    case 'room':
      return 'Salle';
  }
};

export const ConflictsPanel = ({ role }: ConflictsPanelProps) => {
  return (
    <Card className="h-full shadow-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-lg">Conflits Récents</CardTitle>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          {conflicts.length} actifs
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {conflicts.map((conflict) => {
          const Icon = getSeverityIcon(conflict.severity);
          const styles = getSeverityStyles(conflict.severity);

          return (
            <div
              key={conflict.id}
              className={`p-4 rounded-lg ${styles.bg} transition-all hover:scale-[1.02] cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background ${styles.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${styles.badge}`}>
                      {getTypeLabel(conflict.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{conflict.department}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{conflict.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {(role === 'admin' || role === 'vice-dean') && (
          <Button variant="ghost" className="w-full mt-4 group">
            Voir tous les conflits
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
