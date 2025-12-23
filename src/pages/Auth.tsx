import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { UserRole } from "@/types";
import { api } from "@/lib/api";

interface Department {
    id: number;
    name: string;
    code: string;
}

const Auth = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<UserRole>("etudiant");
    const [departmentId, setDepartmentId] = useState<string>("");
    const [formations, setFormations] = useState<any[]>([]);
    const [formationId, setFormationId] = useState<string>("");
    const [newDeptName, setNewDeptName] = useState("");
    const [newDeptCode, setNewDeptCode] = useState("");

    useEffect(() => {
        // Fetch departments for signup
        const fetchDepts = async () => {
            try {
                const data = await api.get('/departments');
                if (Array.isArray(data)) {
                    setDepartments(data);
                }
            } catch (err) {
                console.error("Failed to fetch departments", err);
            }
        };
        fetchDepts();
    }, []);

    useEffect(() => {
        if (departmentId && departmentId !== 'other' && role === 'etudiant') {
            const fetchFormations = async () => {
                try {
                    const data = await api.get(`/public/formations?deptId=${departmentId}`);
                    setFormations(data);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchFormations();
        } else {
            setFormations([]);
            setFormationId("");
        }
    }, [departmentId, role]);

    useEffect(() => {
        if (user && !isAuthenticating) {
            const from = (location.state as { from: { pathname: string } } | null)?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        }
    }, [user, navigate, location, isAuthenticating]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const data = await api.post('/auth/login', { email, password });

            if (data.error) throw new Error(data.error);

            setIsAuthenticating(true);
            login(data.token, data.user);

            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (error: any) {
            setErrorMessage(error.message || "Erreur lors de la connexion");
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        const isGlobalRole = role === 'admin' || role === 'vice_doyen';

        if (!departmentId && !isGlobalRole) {
            setErrorMessage("Veuillez sélectionner un département.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const fullName = `${firstName} ${lastName}`;
            const data = await api.post('/auth/signup', {
                email,
                password,
                full_name: fullName,
                role,
                department_id: departmentId === 'other' ? null : parseInt(departmentId),
                formation_id: formationId ? parseInt(formationId) : null,
                new_department_name: departmentId === 'other' ? newDeptName : null,
                new_department_code: departmentId === 'other' ? newDeptCode : null
            });

            if (data.error) throw new Error(data.error);

            setSuccessMessage("Compte créé avec succès ! Préparation de votre espace...");

            // Auto login
            const loginData = await api.post('/auth/login', { email, password });
            if (!loginData.error) {
                setIsAuthenticating(true);
                login(loginData.token, loginData.user);
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Erreur lors de l'inscription");
            setLoading(false);
        }
    };

    if (isAuthenticating) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${heroBg})` }} />
                <div className="relative z-10 flex flex-col items-center space-y-6 animate-reveal">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-display font-bold text-foreground">Authentification réussie !</h2>
                        <p className="text-muted-foreground animate-pulse">Préparation de votre tableau de bord...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroBg})` }} />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-accent/5" />

            <Card className="w-full max-w-lg mx-4 relative z-10 shadow-2xl border-accent/20 animate-fade-in">
                <CardHeader className="space-y-1 text-center items-center pb-2">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl font-display font-bold">UniSchedule</CardTitle>
                    <CardDescription>Gestion et planification des examens</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">Connexion</TabsTrigger>
                            <TabsTrigger value="signup">Inscription</TabsTrigger>
                        </TabsList>

                        {errorMessage && <Alert variant="destructive" className="mb-4"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
                        {successMessage && <Alert className="mb-4 bg-green-500/15 text-green-600 border-green-500/20"><AlertDescription>{successMessage}</AlertDescription></Alert>}

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email</Label>
                                    <Input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-login">Mot de passe</Label>
                                    <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Se connecter</Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="firstname">Prénom</Label><Input id="firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" required /></div>
                                    <div className="space-y-2"><Label htmlFor="lastname">Nom</Label><Input id="lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" required /></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Rôle</Label>
                                        <Select onValueChange={(value) => setRole(value as UserRole)} defaultValue={role}>
                                            <SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="etudiant">Étudiant</SelectItem>
                                                <SelectItem value="professeur">Professeur</SelectItem>
                                                <SelectItem value="chef_departement">Chef de Département</SelectItem>
                                                <SelectItem value="vice_doyen">Vice-Doyen</SelectItem>
                                                <SelectItem value="admin">Administrateur</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Département</Label>
                                        <Select
                                            onValueChange={(value) => setDepartmentId(value)}
                                            value={departmentId}
                                            disabled={role === 'admin' || role === 'vice_doyen'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={role === 'admin' || role === 'vice_doyen' ? "Accès Global (Tous)" : "Choisir..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name} ({dept.code})
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="other" className="font-bold text-accent">+ Autre département...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(role === 'admin' || role === 'vice_doyen') && (
                                            <p className="text-[10px] text-accent font-medium mt-1">Accès à l'ensemble de la faculté.</p>
                                        )}
                                    </div>
                                </div>

                                {role === 'etudiant' && departmentId && departmentId !== 'other' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <Label htmlFor="formation">Filière / Formation</Label>
                                        <Select
                                            onValueChange={(value) => setFormationId(value)}
                                            value={formationId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir votre filière..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formations.map((f) => (
                                                    <SelectItem key={f.id} value={f.id.toString()}>
                                                        {f.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {departmentId === 'other' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-dept-name">Nom du département</Label>
                                            <Input id="new-dept-name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Génie Mécanique" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-dept-code">Code (ex: GM)</Label>
                                            <Input id="new-dept-code" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} placeholder="GM" required />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2"><Label htmlFor="email-signup">Email</Label><Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required /></div>
                                <div className="space-y-2"><Label htmlFor="password-signup">Mot de passe</Label><Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer mon compte</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;
