import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield } from 'lucide-react';
import { api } from '@/lib/api';

const SupervisionList = () => {
    // This would ideally fetch from an endpoint listing all supervision assignments
    // For now, let's create a placeholder view
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-display">Gestion des Surveillances</h2>
                    <p className="text-muted-foreground">Affectation des surveillants aux examens.</p>
                </div>
            </div>

            <Card className="shaow-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        Vue d'ensemble
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Cette interface permettra aux administrateurs de voir la charge de surveillance par professeur
                        et d'ajuster les affectations générées par l'algorithme.
                    </p>

                    <div className="p-4 border border-dashed rounded-lg bg-secondary/20 text-center">
                        <p className="text-sm">Fonctionnalité en cours de développement...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupervisionList;
