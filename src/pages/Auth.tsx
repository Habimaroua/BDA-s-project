import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const Auth = () => {
    const { session } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<UserRole>("etudiant");

    useEffect(() => {
        if (session) {
            const from = (location.state as { from: { pathname: string } } | null)?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        }
    }, [session, navigate, location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            // Navigation handled by useEffect
        } catch (error: any) {
            setErrorMessage(error.message || "Erreur lors de la connexion");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // 1. Inscription Supabase
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth`,
                    data: {
                        nom: lastName,
                        prenom: firstName,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            let currentSession = data.session;

            // 2. Si pas de session (Email Confirm actif ou autre), on tente une connexion immédiate
            let signInErrorObj = null;
            if (!currentSession) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (!signInError && signInData.session) {
                    currentSession = signInData.session;
                } else {
                    signInErrorObj = signInError;
                }
            }

            // 3. Gestion de la réussite
            if (currentSession) {
                // FORCE: Insertion manuelle du profil et du rôle (Ceinture et Bretelles)
                // Cela garantit que les données existent même si le Trigger SQL échoue
                const { error: profileError } = await supabase.from("profiles").insert({
                    id: currentSession.user.id,
                    email: email,
                    nom: lastName,
                    prenom: firstName,
                    role: role
                });

                // On ignore l'erreur de duplication (23505) qui signifie que le Trigger a marché
                if (profileError && profileError.code !== '23505') {
                    console.error("Erreur insertion profil manuelle:", profileError);
                    alert(`Erreur de base de données (Profil) : ${profileError.message}\nAvez-vous exécuté le script SQL fourni ?`);
                }

                // Insertion rôle explicite aussi si besoin
                const { error: roleError } = await supabase.from("user_roles").insert({
                    user_id: currentSession.user.id,
                    role: role
                });
                if (roleError && roleError.code !== '23505') {
                    console.error("Erreur insertion role manuelle:", roleError);
                    alert(`Erreur de base de données (Rôle) : ${roleError.message}`);
                }

                navigate("/dashboard");
            } else {
                // 4. Si toujours pas de session, c'est que l'email doit être vérifié
                console.error("Echec auto-login:", signInErrorObj);
                const reason = signInErrorObj ? `Raison: ${signInErrorObj.message}` : "Raison inconnue (Email Confirm activé ?)";
                setSuccessMessage(`Compte créé, mais connexion automatique impossible.\n${reason}\n\nVeuillez vérifier vos emails ou modifier les paramètres Supabase.`);
            }
        } catch (error: any) {
            console.error("Erreur inscription:", error);
            setErrorMessage(error.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${heroBg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-accent/5" />

            <Card className="w-full max-w-lg mx-4 relative z-10 shadow-2xl border-accent/20 animate-fade-in">
                <CardHeader className="space-y-1 text-center items-center pb-2">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl font-display font-bold">Bienvenue sur UniSchedule</CardTitle>
                    <CardDescription>
                        Plateforme de gestion et planification d'examens
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">Connexion</TabsTrigger>
                            <TabsTrigger value="signup">Inscription</TabsTrigger>
                        </TabsList>

                        {/* Error / Success Messages */}
                        {errorMessage && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert className="mb-4 bg-green-500/15 text-green-600 border-green-500/20">
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        {/* Login Form */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-login">Email</Label>
                                    <Input
                                        id="email-login"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-login">Mot de passe</Label>
                                    <Input
                                        id="password-login"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Se connecter
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Sign Up Form */}
                        <TabsContent value="signup">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname">Prénom</Label>
                                        <Input
                                            id="firstname"
                                            placeholder="Jean"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname">Nom</Label>
                                        <Input
                                            id="lastname"
                                            placeholder="Dupont"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Rôle</Label>
                                    <Select
                                        onValueChange={(value) => setRole(value as UserRole)}
                                        defaultValue={role}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez votre rôle" />
                                        </SelectTrigger>
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
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input
                                        id="email-signup"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-signup">Mot de passe</Label>
                                    <Input
                                        id="password-signup"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Créer un compte
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="justify-center text-sm text-muted-foreground p-4 bg-muted/20">
                    © 2025 UniSchedule
                </CardFooter>
            </Card>
        </div>
    );
};

export default Auth;
