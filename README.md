# UniSchedule

UniSchedule est une plateforme moderne de gestion et de planification d'examens universitaires. Elle permet de gérer les départements, les formations, les modules, ainsi que les plannings d'examens et les surveillances, tout en détectant automatiquement les conflits.

## Fonctionnalités Principales

- **Tableau de Bord Holistique** : Vue d'ensemble des statistiques clés (étudiants, examens, conflits).
- **Gestion RBAC (Role-Based Access Control)** : Accès différencié pour les administrateurs, vice-doyens, chefs de département, professeurs et étudiants.
- **Planification d'Examens** : Création et visualisation des calendriers d'examens.
- **Détection de Conflits** : Identification automatique des chevauchements d'horaires pour les étudiants, professeurs et salles.
- **Gestion des Ressources** : Administration des départements, modules et lieux d'examen.

## Technologies Utilisées

- **Frontend** : React, TypeScript, Vite, tailwindcss, shadcn/ui, Lucide React.
- **Backend & Auth** : Supabase.
- **Gestion d'État** : TanStack Query (React Query).

## Installation Locale

### Prérequis

- Node.js (v18+)
- npm ou yarn

### Étapes

1. **Cloner le projet**
   ```sh
   git clone <url-du-repo>
   cd design-hub-pro-main
   ```

2. **Installer les dépendances**
   ```sh
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine et ajoutez vos clés Supabase (si nécessaire, bien que le projet utilise déjà une configuration interne).

4. **Lancer le serveur de développement**
   ```sh
   npm run dev
   ```

## Structure du Projet

- `src/components` : Composants UI réutilisables et composants de mise en page.
- `src/pages` : Pages principales de l'application (Auth, Dashboard, etc.).
- `src/hooks` : Hooks React personnalisés.
- `src/types` : Définitions des types TypeScript.
- `src/integrations` : Clients de services externes (Supabase).
- `supabase/` : Scripts SQL pour la base de données (migrations, seeds).

---

© 2025 UniSchedule - Tous droits réservés.
