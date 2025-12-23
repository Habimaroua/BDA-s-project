import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { toast } from "sonner";
import { Loader2, Settings, User, Mail, Lock } from "lucide-react";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);
        try {
            const data = await api.put('/profile/update', formData);
            if (data.error) throw new Error(data.error);

            toast.success("Profil mis à jour !");
            onOpenChange(false);
            // On pourrait forcer un refresh de la page ou de l'auth ici
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <Settings className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-display">Paramètres du compte</DialogTitle>
                    <DialogDescription>
                        Modifiez vos informations personnelles et votre mot de passe ici.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name" className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Nom complet
                        </Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Nom et Prénom"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Adresse Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div className="pt-2 border-t border-border mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Changer le mot de passe (optionnel)</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pass" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Nouveau mot de passe
                                </Label>
                                <Input
                                    id="pass"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Confirmer le mot de passe
                                </Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer les modifications
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
