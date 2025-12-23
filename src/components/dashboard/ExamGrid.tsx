import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

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
                    const key = `${exam.date_time}`;
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
                                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none mt-1">
                                                        {new Date(key).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </Badge>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-secondary/10">
                                        <td className="p-4 border border-border font-bold text-[10px] uppercase text-muted-foreground bg-secondary/20">Matière</td>
                                        {sortedSessionKeys.map((key, i) => (
                                            <td key={i} className="p-4 border border-border text-center font-bold text-sm text-foreground">
                                                {sessions[key][0].module_name}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 border border-border font-bold text-[10px] uppercase text-muted-foreground bg-secondary/5">Salles</td>
                                        {sortedSessionKeys.map((key, i) => (
                                            <td key={i} className="p-4 border border-border text-center">
                                                <div className="flex flex-col gap-2">
                                                    {sessions[key].map((ex: any, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="justify-center py-1.5 bg-accent/5 text-accent border-accent/20 font-medium">
                                                            <MapPin className="w-3 h-3 mr-1.5" />
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
