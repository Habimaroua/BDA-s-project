import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ConflictsPanelProps {
  role: UserRole;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return AlertTriangle;
    case 'medium':
      return AlertCircle;
    default:
      return Info;
  }
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        badge: 'bg-destructive/20 text-destructive border-destructive/30',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-600',
        badge: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      };
    default:
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600',
        badge: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      };
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'student_overlap':
      return 'Étudiant';
    case 'professor_overlap':
      return 'Professeur';
    case 'capacity_violation':
      return 'Salle';
    case 'equity_warning':
      return 'Équité';
    default:
      return type;
  }
};

export const ConflictsPanel = ({ role }: ConflictsPanelProps) => {
  const [conflictsData, setConflictsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const data = await api.get('/conflicts');
        if (Array.isArray(data)) {
          setConflictsData(data);
        } else {
          console.error("Format de données conflits invalide:", data);
          setConflictsData([]);
        }
      } catch (error) {
        console.error("Erreur conflits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConflicts();
  }, []);

  return (
    <Card className="h-full shadow-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-lg">Conflits Récents</CardTitle>
        <Badge variant="outline" className={conflictsData.length > 0 ? "bg-destructive/10 text-destructive border-destructive/30" : ""}>
          {conflictsData.length} actifs
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="py-10 text-center text-xs text-muted-foreground italic">Analyse des conflits...</div>
        ) : conflictsData.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">Aucun conflit détecté.</div>
        ) : (
          conflictsData.map((conflict) => {
            const Icon = getSeverityIcon(conflict.severity);
            const styles = getSeverityStyles(conflict.severity);

            return (
              <div
                key={conflict.id}
                className={`p-4 rounded-lg ${styles.bg} transition-all hover:scale-[1.02] cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-background ${styles.text}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] px-1 h-4 ${styles.badge}`}>
                        {getTypeLabel(conflict.type)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">{conflict.module_name}</span>
                    </div>
                    <p className="text-sm text-foreground leading-tight">{conflict.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {(role === 'admin' || role === 'vice_doyen') && conflictsData.length > 0 && (
          <Button variant="ghost" className="w-full mt-4 group text-xs">
            Gérer tous les conflits
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
