import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { UserRole } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface SettingsPageProps {
    role: UserRole;
}

const SettingsPage = ({ role }: SettingsPageProps) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [email, setEmail] = useState(user?.email || '');

    const handleSave = () => {
        toast.success("Paramètres enregistrés avec succès !");
    };

    return (
        <div className="min-h-screen bg-background flex w-full">
            <Sidebar role={role} />
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <DashboardHeader role={role} />
                <div className="p-6 max-w-4xl mx-auto w-full space-y-6 animate-fade-in">

                    <h2 className="text-2xl font-bold font-display">Paramètres</h2>
                    <p className="text-muted-foreground">Gérez vos préférences et la configuration de votre compte.</p>

                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle>Profil</CardTitle>
                            <CardDescription>Vos informations personnelles.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nom Complet</Label>
                                    <Input value={user?.full_name} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rôle</Label>
                                    <Input value={role} disabled className="capitalize" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle>Préférences</CardTitle>
                            <CardDescription>Personnalisez l'interface.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Recevoir des alertes pour les conflits et validations.
                                    </p>
                                </div>
                                <Switch checked={notifications} onCheckedChange={setNotifications} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Mode Sombre</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Activer le thème sombre (Bientôt disponible).
                                    </p>
                                </div>
                                <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline">Annuler</Button>
                        <Button onClick={handleSave}>Enregistrer</Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
