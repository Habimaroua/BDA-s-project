-- =====================================================
-- JEU DE DONNÉES DE DÉMONSTRATION (SEED)
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- 1. Départements
INSERT INTO public.departements (code, nom) VALUES
('DEP-INF', 'Informatique'),
('DEP-MATH', 'Mathématiques'),
('DEP-PHYS', 'Physique'),
('DEP-BIO', 'Biologie'),
('DEP-ECO', 'Économie'),
('DEP-DROIT', 'Droit'),
('DEP-LANG', 'Langues Entrangères');

-- 2. Formations (Liaison avec Départements via sous-requête)
WITH deps AS (SELECT id, code FROM public.departements)
INSERT INTO public.formations (code, nom, niveau, departement_id) VALUES
('L1-INF', 'Licence 1 Informatique', 'L1', (SELECT id FROM deps WHERE code = 'DEP-INF')),
('L2-INF', 'Licence 2 Informatique', 'L2', (SELECT id FROM deps WHERE code = 'DEP-INF')),
('L3-INF', 'Licence 3 Informatique', 'L3', (SELECT id FROM deps WHERE code = 'DEP-INF')),
('M1-GL', 'Master 1 Génie Logiciel', 'M1', (SELECT id FROM deps WHERE code = 'DEP-INF')),
('M2-IA', 'Master 2 Intelligence Artificielle', 'M2', (SELECT id FROM deps WHERE code = 'DEP-INF')),
('L1-MATH', 'Licence 1 Mathématiques', 'L1', (SELECT id FROM deps WHERE code = 'DEP-MATH')),
('L1-ECO', 'Licence 1 Économie', 'L1', (SELECT id FROM deps WHERE code = 'DEP-ECO'));

-- 3. Lieux d'examen (Salles)
INSERT INTO public.lieux_examen (code, nom, type, capacite, equipements) VALUES
('AMPHI-A', 'Amphithéâtre A', 'amphi', 200, ARRAY['projecteur', 'sonorisation']),
('AMPHI-B', 'Amphithéâtre B', 'amphi', 150, ARRAY['projecteur', 'sonorisation']),
('AMPHI-C', 'Amphithéâtre C', 'amphi', 300, ARRAY['projecteur', 'sonorisation', 'climatisation']),
('SALLE-101', 'Salle 101', 'salle', 40, ARRAY['tableau_blanc']),
('SALLE-102', 'Salle 102', 'salle', 40, ARRAY['tableau_blanc']),
('LABO-INF-1', 'Laboratoire Info 1', 'labo', 25, ARRAY['ordinateurs', 'projecteur']),
('LABO-INF-2', 'Laboratoire Info 2', 'labo', 25, ARRAY['ordinateurs']);

-- 4. Sessions d'examen
INSERT INTO public.sessions_examen (nom, type, date_debut, date_fin, annee_universitaire, active) VALUES
('Session Normale Hiver 2025', 'normal', '2025-01-10', '2025-01-25', '2024-2025', TRUE),
('Session Rattrapage Hiver 2025', 'rattrapage', '2025-02-15', '2025-02-20', '2024-2025', FALSE);

-- Note: Pour les utilisateurs (profiles), ils doivent être créés via l'authentification Supabase.
-- Une fois créés, vous pouvez modifier leur rôle dans la table `profiles`.
