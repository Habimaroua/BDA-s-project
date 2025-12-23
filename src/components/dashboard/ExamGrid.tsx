import { Badge } from "@/components/ui/badge";
import { MapPin, BookOpen } from "lucide-react";

interface ExamGridProps {
    exams: any[];
    formationName?: string;
}

export const ExamGrid = ({ exams }: ExamGridProps) => {
    if (!exams || exams.length === 0) return null;

    // 1. Group exams by formation
    const examsByFormation: { [key: string]: any[] } = {};
    exams.forEach(exam => {
        const fName = exam.formation_name || "Sans filière";
        if (!examsByFormation[fName]) examsByFormation[fName] = [];
        examsByFormation[fName].push(exam);
    });

    const formationNames = Object.keys(examsByFormation).sort();

    return (
        <div className="space-y-12">
            {formationNames.map((fName) => {
                const formationExams = examsByFormation[fName];

                // 2. Group these exams by date and time (session)
                const sessions: { [key: string]: any[] } = {};
                formationExams.forEach(exam => {
                    const dateValue = exam.date_heure || exam.date_time || exam.dateTime;
                    if (!dateValue) return;

                    const cleanDate = typeof dateValue === 'string' && dateValue.includes(' ') ? dateValue.replace(' ', 'T') : dateValue;
                    const d = new Date(cleanDate);
                    if (isNaN(d.getTime())) return;

                    const key = d.toISOString();
                    if (!sessions[key]) sessions[key] = [];
                    sessions[key].push(exam);
                });

                const sortedSessionKeys = Object.keys(sessions).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                return (
                    <div key={fName} className="space-y-4 animate-slide-up">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1 bg-primary rounded-full" />
                            <h3 className="text-xl font-bold font-display text-primary">{fName}</h3>
                            <Badge variant="outline" className="ml-2 font-normal">
                                {formationExams.length} examens
                            </Badge>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-border shadow-soft bg-white">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest">
                                        <th className="p-4 border border-border w-32 text-left bg-primary/10">Groupes</th>
                                        {sortedSessionKeys.map((key, i) => (
                                            <th key={i} className="p-4 border border-border text-center min-w-[140px]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-muted-foreground font-medium">{new Date(key).toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
                                                    <span className="text-sm">{new Date(key).toLocaleDateString('fr-FR')}</span>
                                                    <div className="flex items-center gap-1.5 mt-2 bg-muted/30 p-1.5 rounded-lg border border-border/50">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none mb-1">Début</span>
                                                            <Badge className="bg-primary/10 text-primary border-none text-[11px] font-bold px-2 py-0.5">
                                                                {new Date(key).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                            </Badge>
                                                        </div>
                                                        <div className="h-4 w-px bg-border self-end mb-1" />
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none mb-1">Fin</span>
                                                            <Badge className="bg-amber-100 text-amber-700 border-none text-[11px] font-bold px-2 py-0.5">
                                                                {(() => {
                                                                    const start = new Date(key);
                                                                    const firstExam = sessions[key][0];
                                                                    const duration = (firstExam.duree_minutes || firstExam.duration || 90);
                                                                    return new Date(start.getTime() + duration * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                                })()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="group hover:bg-muted/30 transition-colors">
                                        <td className="p-4 border border-border font-bold text-[10px] uppercase text-muted-foreground bg-muted/50 w-32">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-3 h-3 text-primary" />
                                                Matière
                                            </div>
                                        </td>
                                        {sortedSessionKeys.map((key, i) => (
                                            <td key={i} className="p-4 border border-border text-center">
                                                <div className="font-bold text-sm text-primary bg-primary/5 py-2 px-3 rounded-lg border border-primary/10 inline-block min-w-[120px]">
                                                    {sessions[key][0].module_name}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="group hover:bg-muted/30 transition-colors">
                                        <td className="p-4 border border-border font-bold text-[10px] uppercase text-muted-foreground bg-muted/30 w-32">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-secondary" />
                                                Salles
                                            </div>
                                        </td>
                                        {sortedSessionKeys.map((key, i) => (
                                            <td key={i} className="p-4 border border-border text-center">
                                                <div className="flex flex-col gap-2 items-center">
                                                    {sessions[key].map((ex: any, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="justify-center py-1.5 px-3 bg-teal-50 text-teal-700 border-teal-200 font-medium shadow-sm hover:bg-teal-100 transition-all">
                                                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                                                            {ex.room_name || 'TBD'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
