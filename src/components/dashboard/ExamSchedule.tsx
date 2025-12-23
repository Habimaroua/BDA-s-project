import { Calendar, Clock, MapPin, User, Play, Download, Search, CheckCircle, Filter, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { UserRole } from '@/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ExamGrid } from './ExamGrid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExamScheduleProps {
  role: UserRole;
  title?: string;
  viewType?: 'exams' | 'supervision';
  searchQuery?: string;
}

export const ExamSchedule = ({ role, title = "Emploi du Temps", viewType = 'exams', searchQuery = '' }: ExamScheduleProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formations, setFormations] = useState<any[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [startDate, setStartDate] = useState<string>('2025-06-01');
  const [endDate, setEndDate] = useState<string>('2025-06-20');

  // Auto-switch to grid if a formation is selected and it looks like a planning
  useEffect(() => {
    if (selectedFormation !== 'all') {
      setViewMode('grid');
    } else {
      setViewMode('list');
    }
  }, [selectedFormation]);

  const handleGenerateSchedule = async () => {
    if (!confirm("Attention : Cette action va réinitialiser et re-générer tous les plannings non validés. Continuer ?")) return;

    setIsGenerating(true);
    try {
      const payload: any = {};
      if (selectedFormation !== 'all') {
        payload.formationId = selectedFormation;
      }
      payload.startDate = startDate;
      payload.endDate = endDate;

      const res = await api.post('/schedule/generate', payload);
      toast.success(res.message || "Génération du planning terminée avec succès !");
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération du planning.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const result = await api.get('/formations');
        if (Array.isArray(result)) setFormations(result);
      } catch (e) { console.error(e); }
    };
    if (role === 'chef_departement' || role === 'admin' || role === 'vice_doyen') {
      fetchFormations();
    }
  }, [role]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = '/exams';
        if (viewType === 'supervision') {
          endpoint = '/my-supervision';
        } else if (role === 'professeur' && title === 'Mes Responsabilités') {
          endpoint = '/my-exams';
        }

        const result = await api.get(endpoint);
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Format de données planning invalide:", result);
          setData([]);
        }
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewType, role, title]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      // Nettoyer la date au cas où (format MySQL vers ISO)
      const cleanDate = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(cleanDate);
      if (isNaN(d.getTime())) return "Format date invalide";

      return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "--:--";
    try {
      const cleanDate = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(cleanDate);
      if (isNaN(d.getTime())) return "--:--";

      return d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return "--:--";
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const moduleMatch = (item.module_name || item.moduleName || '').toLowerCase().includes(searchLower);
    const roomMatch = (item.room_name || item.salleName || '').toLowerCase().includes(searchLower);
    const formationMatch = selectedFormation === 'all' ||
      item.formation_id?.toString() === selectedFormation ||
      item.formation?.toString() === selectedFormation;

    return (moduleMatch || roomMatch) && formationMatch;
  });

  const handleValidatePlanning = async () => {
    try {
      await api.post('/department/validate', {});
      toast.success("Le planning de votre département a été validé !");
    } catch (error) {
      toast.error("Erreur lors de la validation.");
    }
  };

  const currentFormationName = formations.find(f => f.id.toString() === selectedFormation)?.name || "";

  return (
    <Card className="shadow-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="font-display text-lg">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {viewType === 'supervision' ? 'Vos surveillances assignées' : 'Examens programmés'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(role === 'chef_departement' || role === 'admin' || role === 'vice_doyen') && formations.length > 0 && (
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer"
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
              >
                <option value="all">Toutes les filières</option>
                {formations.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          {(role === 'admin' || role === 'vice_doyen') && (
            <div className="flex items-center gap-4 bg-secondary/20 p-2 rounded-xl border border-border/50 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Début</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-xs bg-background/50 w-32"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Fin</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-xs bg-background/50 w-32"
                />
              </div>
              <Button
                variant="hero"
                size="sm"
                className="gap-2 mt-4"
                onClick={handleGenerateSchedule}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isGenerating ? 'Génération...' : 'Lancer Algorithme'}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {(role === 'chef_departement' && viewType === 'exams') && (
              <Button variant="hero" size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleValidatePlanning}>
                <CheckCircle className="w-4 h-4" />
                Valider
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-20 text-center text-muted-foreground italic">Chargement des données...</div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            {searchQuery || selectedFormation !== 'all' ? "Aucun résultat pour ces filtres." : "Aucun examen trouvé."}
          </div>
        ) : viewMode === 'grid' ? (
          <ExamGrid exams={filteredData} formationName={currentFormationName} />
        ) : (
          <div className="space-y-4">
            {filteredData.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-accent/10 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px]">
                        {item.department_name || item.department || 'Info'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-accent/20 text-accent">
                        {item.formation_name || item.formation || 'Licence'}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm md:text-base">{item.module_name || item.moduleName}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>{formatDate(item.date_time || item.dateTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>{formatTime(item.date_time || item.dateTime)} ({item.duration}min)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        <span className="truncate">{item.room_name || item.salleName || 'Salle non définie'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-accent" />
                        <span className="truncate">{viewType === 'supervision' ? 'Surveillant' : (item.full_name || item.professorName || 'Responsable')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Details button removed */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
