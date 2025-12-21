import { Calendar, Clock, MapPin, User, Play, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exams } from '@/data/mockData';
import type { UserRole } from '@/types';

interface ExamScheduleProps {
  role: UserRole;
}

export const ExamSchedule = ({ role }: ExamScheduleProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="shadow-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="font-display text-lg">Emploi du Temps</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Examens à venir</p>
        </div>
        <div className="flex items-center gap-2">
          {(role === 'admin') && (
            <Button variant="hero" size="sm" className="gap-2">
              <Play className="w-4 h-4" />
              Générer EDT
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exams.map((exam, index) => (
            <div
              key={exam.id}
              className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {exam.department}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exam.formation}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{exam.moduleName}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(exam.dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(exam.dateTime)} ({exam.duration}min)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{exam.salleName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{exam.professorName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Détails
                  </Button>
                  {role === 'admin' && (
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
