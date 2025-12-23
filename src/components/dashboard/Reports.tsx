import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Reports = () => {
    // Mock Data for KPIs
    const dataProfHours = [
        { name: 'Info', heures: 450 },
        { name: 'Math', heures: 320 },
        { name: 'Génie Civil', heures: 280 },
        { name: 'Eco', heures: 190 },
    ];

    const dataRoomUsage = [
        { name: 'Utilisées', value: 78 },
        { name: 'Libres', value: 22 },
    ];

    const COLORS = ['#0f172a', '#e2e8f0'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-display">Rapports & KPIs Académiques</h2>
                    <p className="text-muted-foreground">Vue stratégique sur l'utilisation des ressources et la charge d'enseignement.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exporter PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heures Professeurs par Département */}
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle>Volume Horaire par Département</CardTitle>
                        <CardDescription>Total des heures d'enseignement planifiées.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataProfHours}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="heures" fill="#0f172a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Taux d'Utilisation des Salles */}
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle>Taux d'Occupation Global</CardTitle>
                        <CardDescription>Pourcentage des créneaux de salles utilisés.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataRoomUsage}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataRoomUsage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center">
                            <span className="text-3xl font-bold">78%</span>
                            <p className="text-xs text-muted-foreground">Global</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tableau Récapitulatif */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Indicateurs de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4 pb-4 border-b font-medium text-sm text-muted-foreground">
                            <div>Indicateur</div>
                            <div className="text-center">Valeur Actuelle</div>
                            <div className="text-center">Cible</div>
                            <div className="text-right">Statut</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center text-sm">
                            <div className="font-medium">Taux de Conflits</div>
                            <div className="text-center text-red-500">1.2%</div>
                            <div className="text-center text-muted-foreground">0%</div>
                            <div className="text-right"><span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">Critique</span></div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center text-sm">
                            <div className="font-medium">Satisfaction Étudiants (Simulée)</div>
                            <div className="text-center text-green-600">85%</div>
                            <div className="text-center text-muted-foreground">80%</div>
                            <div className="text-right"><span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">Bon</span></div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center text-sm">
                            <div className="font-medium">Utilisation Amphis</div>
                            <div className="text-center">92%</div>
                            <div className="text-center text-muted-foreground">90%</div>
                            <div className="text-right"><span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">Saturé</span></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reports;
