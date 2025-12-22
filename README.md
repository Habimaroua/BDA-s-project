# UniSchedule - Plateforme de Planification d'Examens

UniSchedule est une solution robuste et élégante pour la gestion des calendriers d'examens universitaires. Elle intègre des contraintes académiques complexes pour garantir une organisation équitable et sans conflits.

## 🚀 Architecture Technique

- **Frontend** : React + Vite + Tailwind CSS (Design Premium & Responsive)
- **Backend** : Node.js + Express (API REST sécurisée)
- **Base de Données** : MySQL (Relationnel, structuré pour la performance)
- **Authentification** : JWT (JSON Web Tokens) avec hachage de mots de passe (Bcrypt)

## ⚖️ Respect des Contraintes Académiques

Le système modélise et surveille automatiquement les règles suivantes :
- **Étudiants** : Garantie de maximum **1 examen par jour**.
- **Professeurs** : Charge de travail limitée à **3 examens/jour**.
- **Capacité** : Vérification stricte de la capacité des salles et amphis par rapport au nombre d'étudiants inscrits.
- **Priorités** : Affectation prioritaire des enseignants pour la surveillance des examens de leur propre département.
- **Équité** : Algorithme de répartition pour assurer un nombre égal de surveillances entre tous les enseignants.

## 📂 Structure du Projet

- `/src` : Application React (Frontend)
- `/server` : Backend Node.js & Scripts SQL
  - `schema.sql` : Création de la BD et Dataset réaliste.
  - `dashboard_queries.sql` : Requêtes d'analyse des contraintes critiques.
- `/public` : Assets statiques

## 🛠️ Installation & Déploiement

### Local
1. Cloner le dépôt.
2. Importer `server/schema.sql` dans votre serveur MySQL local.
3. Dash `npm install` dans la racine et dans `/server`.
4. Configurer le `.env` dans `/server`.
5. Lancer le backend (`node index.js`) et le frontend (`npm run dev`).

### Déploiement en ligne
1. **Base de Données** : Héberger MySQL sur **Railway.app** ou **Aiven**.
2. **Backend** : Déployer le dossier `/server` sur **Render.com**.
3. **Frontend** : Déployer sur **Vercel** ou **Netlify**.

---
© 2025 UniSchedule. Excellence Opérationnelle Académique.
