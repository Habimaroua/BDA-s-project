import { BookOpen, Users, GraduationCap, ArrowRight, Plus, X, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const FormationsList = () => {
    const [formations, setFormations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newFormationName, setNewFormationName] = useState('');
    const [addingFormation, setAddingFormation] = useState(false);
    const [expandedFormation, setExpandedFormation] = useState<number | null>(null);
    const [modules, setModules] = useState<{ [key: number]: any[] }>({});
    const [loadingModules, setLoadingModules] = useState<{ [key: number]: boolean }>({});

    // État pour l'ajout de module
    const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
    const [currentFormationId, setCurrentFormationId] = useState<number | null>(null);
    const [newModuleData, setNewModuleData] = useState({ nom: '', credits: 3, duration: 120, pre_req_id: 'none' });
    const [addingModule, setAddingModule] = useState(false);

    useEffect(() => {
        fetchFormations();
    }, []);

    const fetchFormations = async () => {
        console.log("🔍 Début de fetchFormations...");
        try {
            console.log("📡 Appel API: /formations");
            const data = await api.get('/formations');
            console.log(" Données reçues:", data);
            console.log("Type de données:", typeof data);
            console.log("Est un tableau?", Array.isArray(data));

            if (Array.isArray(data)) {
                console.log(" Données valides, nombre de formations:", data.length);
                setFormations(data);
            } else {
                console.error(" Format de données formations invalide:", data);
                setFormations([]);
            }
        } catch (error) {
            console.error("❌Erreur formations:", error);
        } finally {
            setLoading(false);
            console.log("Fin de fetchFormations");
        }
    };

    const fetchModules = async (formationId: number) => {
        setLoadingModules(prev => ({ ...prev, [formationId]: true }));
        try {
            const data = await api.get(`/formations/${formationId}/modules`);
            if (Array.isArray(data)) {
                setModules(prev => ({ ...prev, [formationId]: data }));
            }
        } catch (error) {
            console.error("Erreur modules:", error);
            toast.error("Erreur lors du chargement des modules");
        } finally {
            setLoadingModules(prev => ({ ...prev, [formationId]: false }));
        }
    };

    const toggleFormation = (formationId: number) => {
        if (expandedFormation === formationId) {
            setExpandedFormation(null);
        } else {
            setExpandedFormation(formationId);
            if (!modules[formationId]) {
                fetchModules(formationId);
            }
        }
    };

    const handleAddFormation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newFormationName.trim()) {
            toast.error("Veuillez saisir un nom de filière");
            return;
        }

        setAddingFormation(true);
        try {
            await api.post('/formations/add', { name: newFormationName.trim() });
            toast.success("Filière ajoutée avec succès !");
            setNewFormationName('');
            setShowAddDialog(false);
            fetchFormations();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'ajout de la filière");
        } finally {
            setAddingFormation(false);
        }
    };

    const handleOpenAddModule = (formationId: number) => {
        setCurrentFormationId(formationId);
        setNewModuleData({ nom: '', credits: 3, duration: 120, pre_req_id: 'none' });
        setShowAddModuleDialog(true);
    };

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentFormationId || !newModuleData.nom.trim()) {
            toast.error("Le nom du module est requis");
            return;
        }

        setAddingModule(true);
        try {
            await api.post('/modules/add', {
                nom: newModuleData.nom.trim(),
                credits: newModuleData.credits,
                formation_id: currentFormationId,
                duration: newModuleData.duration,
                pre_req_id: newModuleData.pre_req_id === 'none' ? null : Number(newModuleData.pre_req_id)
            });
            toast.success("Module ajouté avec succès !");
            setShowAddModuleDialog(false);
            fetchModules(currentFormationId);
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'ajout du module");
        } finally {
            setAddingModule(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-accent/20 mb-4"></div>
            <p className="text-muted-foreground">Chargement des filières...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Filières & Formations</h2>
                    <p className="text-muted-foreground">Gérer les spécialités de votre département</p>
                </div>
                <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4" />
                    Ajouter une filière
                </Button>
            </div>

            {/* Dialog d'ajout de filière */}
            {showAddDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md mx-4 animate-scale-in">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-xl">Ajouter une filière</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Créer une nouvelle spécialité pour votre département</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAddDialog(false)}
                                className="h-8 w-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddFormation} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="formation-name">Nom de la filière</Label>
                                    <Input
                                        id="formation-name"
                                        placeholder="Ex: L3 Informatique, Master Big Data..."
                                        value={newFormationName}
                                        onChange={(e) => setNewFormationName(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Soyez précis : incluez le niveau (L1, L2, M1...) et la spécialité
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowAddDialog(false)}
                                        disabled={addingFormation}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 gap-2"
                                        disabled={addingFormation}
                                    >
                                        {addingFormation ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Ajout...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Ajouter
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Dialog d'ajout de Module */}
            {showAddModuleDialog && currentFormationId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md mx-4 animate-scale-in">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-xl">Ajouter un module</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Ajouter une matière à cette formation</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAddModuleDialog(false)}
                                className="h-8 w-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddModule} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="module-name">Nom du module</Label>
                                    <Input
                                        id="module-name"
                                        placeholder="Ex: Algorithmique, Analyse..."
                                        value={newModuleData.nom}
                                        onChange={(e) => setNewModuleData({ ...newModuleData, nom: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="module-credits">Crédits</Label>
                                        <Input
                                            id="module-credits"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={newModuleData.credits}
                                            onChange={(e) => setNewModuleData({ ...newModuleData, credits: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="module-duration">Durée (min)</Label>
                                        <Input
                                            id="module-duration"
                                            type="number"
                                            min="30"
                                            step="30"
                                            value={newModuleData.duration || 120}
                                            onChange={(e) => setNewModuleData({ ...newModuleData, duration: parseInt(e.target.value) || 120 })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Pré-requis (Optionnel)</Label>
                                    <Select
                                        onValueChange={(val) => setNewModuleData({ ...newModuleData, pre_req_id: val })}
                                        value={newModuleData.pre_req_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un pré-requis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Aucun</SelectItem>
                                            {modules[currentFormationId]?.map((m: any) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowAddModuleDialog(false)}
                                        disabled={addingModule}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 gap-2"
                                        disabled={addingModule}
                                    >
                                        {addingModule ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Ajout...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Ajouter
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {formations.length === 0 ? (
                <Card className="p-12 text-center shadow-card bg-secondary/20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-accent/40" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Aucune filière trouvée</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Il n'y a pas encore de formations enregistrées pour votre département.
                                Cliquez sur le bouton "Ajouter une filière" ci-dessus pour commencer.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {formations.map((f, index) => (
                        <Card key={f.id} className="group hover:border-accent/50 transition-all duration-300 shadow-card animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <GraduationCap className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg mb-2">{f.name}</CardTitle>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="w-fit">Actif</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span className="font-semibold text-foreground">{f.student_count || 0}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Étudiants</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <BookOpen className="w-4 h-4" />
                                                <span className="font-semibold text-foreground">{f.nb_modules || 0}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Modules</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 group-hover:bg-accent group-hover:text-white transition-colors"
                                    onClick={() => toggleFormation(f.id)}
                                >
                                    {expandedFormation === f.id ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Masquer les modules
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Voir les modules
                                        </>
                                    )}
                                </Button>

                                {/* Liste des modules */}
                                {expandedFormation === f.id && (
                                    <div className="mt-4 space-y-2 animate-slide-down">
                                        <div className="flex justify-end mb-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 text-xs h-8"
                                                onClick={() => handleOpenAddModule(f.id)}
                                            >
                                                <Layers className="w-3.5 h-3.5" />
                                                Ajouter un module
                                            </Button>
                                        </div>

                                        {loadingModules[f.id] ? (
                                            <div className="text-center py-4 text-muted-foreground text-sm">
                                                Chargement des modules...
                                            </div>
                                        ) : modules[f.id]?.length > 0 ? (
                                            <div className="space-y-2">
                                                {modules[f.id].map((module: any) => (
                                                    <div key={module.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-sm">{module.nom}</p>
                                                                {module.pre_req_nom && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Pré-requis: {module.pre_req_nom}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {module.credits} crédits
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground text-sm">
                                                Aucun module pour cette formation
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
