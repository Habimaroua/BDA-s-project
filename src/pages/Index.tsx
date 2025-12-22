import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  Calendar,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 gradient-hero opacity-90" />

        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Optimisation Intelligente</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Planification des Examens
              <br />
              <span className="text-accent">Universitaires</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Une plateforme intelligente pour générer automatiquement des emplois du temps
              d'examens optimaux, sans conflits et en quelques secondes.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>13 000+ Étudiants</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>7 Départements</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>200+ Formations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Accéder à la Plateforme
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Connectez-vous pour accéder à votre espace personnalisé.
            </p>

            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate('/auth')}
              className="group"
            >
              Se connecter
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Génération Rapide',
                description: 'Plannings optimaux générés en moins de 45 secondes grâce à nos algorithmes avancés.',
              },
              {
                icon: Shield,
                title: 'Détection de Conflits',
                description: 'Identification automatique des chevauchements étudiants, professeurs et salles.',
              },
              {
                icon: Calendar,
                title: 'Multi-Départements',
                description: 'Gestion centralisée de tous les départements avec vues personnalisées.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 UniSchedule - Plateforme d'Optimisation des Emplois du Temps</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
