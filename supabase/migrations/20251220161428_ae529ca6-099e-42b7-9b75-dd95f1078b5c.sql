-- =====================================================
-- SCHÉMA DE BASE DE DONNÉES POUR PLATEFORME D'EXAMENS
-- Basé sur le cahier des charges PDF
-- =====================================================

-- 1. TYPES ENUM
CREATE TYPE public.user_role AS ENUM ('vice_doyen', 'admin', 'chef_departement', 'professeur', 'etudiant');
CREATE TYPE public.type_examen AS ENUM ('rattrapage', 'normal');
CREATE TYPE public.type_conflit AS ENUM ('surveillance', 'etudiant', 'salle', 'horaire');
CREATE TYPE public.niveau_conflit AS ENUM ('faible', 'moyen', 'critique');
CREATE TYPE public.statut_examen AS ENUM ('planifie', 'en_cours', 'termine', 'annule');

-- 2. TABLE PROFILES (utilisateurs)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'etudiant',
  department_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. TABLE USER_ROLES (pour gestion des rôles sécurisée)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. TABLE DEPARTEMENTS
CREATE TABLE public.departements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  chef_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.departements ENABLE ROW LEVEL SECURITY;

-- Ajouter FK sur profiles pour department_id
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_department 
FOREIGN KEY (department_id) REFERENCES public.departements(id);

-- 5. TABLE FORMATIONS
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  niveau TEXT NOT NULL, -- L1, L2, L3, M1, M2
  departement_id UUID NOT NULL REFERENCES public.departements(id) ON DELETE CASCADE,
  nombre_etudiants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

-- 6. TABLE MODULES
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  coefficient DECIMAL(3,1) DEFAULT 1.0,
  heures_cours INTEGER DEFAULT 0,
  heures_td INTEGER DEFAULT 0,
  heures_tp INTEGER DEFAULT 0,
  responsable_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- 7. TABLE LIEUX_EXAMEN (Salles et Amphithéâtres)
CREATE TABLE public.lieux_examen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('salle', 'amphi', 'labo')),
  capacite INTEGER NOT NULL,
  batiment TEXT,
  etage INTEGER,
  equipements TEXT[], -- projecteur, wifi, climatisation, etc.
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lieux_examen ENABLE ROW LEVEL SECURITY;

-- 8. TABLE SESSIONS_EXAMEN (Périodes d'examens)
CREATE TABLE public.sessions_examen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type type_examen NOT NULL DEFAULT 'normal',
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  annee_universitaire TEXT NOT NULL, -- ex: "2024-2025"
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sessions_examen ENABLE ROW LEVEL SECURITY;

-- 9. TABLE EXAMENS
CREATE TABLE public.examens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions_examen(id) ON DELETE CASCADE,
  lieu_id UUID REFERENCES public.lieux_examen(id),
  date_examen DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  duree_minutes INTEGER NOT NULL,
  statut statut_examen DEFAULT 'planifie',
  nombre_inscrits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.examens ENABLE ROW LEVEL SECURITY;

-- 10. TABLE SURVEILLANCES
CREATE TABLE public.surveillances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examen_id UUID NOT NULL REFERENCES public.examens(id) ON DELETE CASCADE,
  professeur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'surveillant' CHECK (role IN ('surveillant', 'responsable', 'assistant')),
  confirme BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(examen_id, professeur_id)
);

ALTER TABLE public.surveillances ENABLE ROW LEVEL SECURITY;

-- 11. TABLE INSCRIPTIONS_EXAMEN (Étudiants inscrits aux examens)
CREATE TABLE public.inscriptions_examen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examen_id UUID NOT NULL REFERENCES public.examens(id) ON DELETE CASCADE,
  etudiant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  present BOOLEAN,
  note DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(examen_id, etudiant_id)
);

ALTER TABLE public.inscriptions_examen ENABLE ROW LEVEL SECURITY;

-- 12. TABLE CONFLITS
CREATE TABLE public.conflits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type type_conflit NOT NULL,
  niveau niveau_conflit NOT NULL DEFAULT 'moyen',
  description TEXT NOT NULL,
  examen_1_id UUID REFERENCES public.examens(id) ON DELETE CASCADE,
  examen_2_id UUID REFERENCES public.examens(id) ON DELETE CASCADE,
  professeur_id UUID REFERENCES public.profiles(id),
  etudiant_id UUID REFERENCES public.profiles(id),
  lieu_id UUID REFERENCES public.lieux_examen(id),
  resolu BOOLEAN DEFAULT FALSE,
  solution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.conflits ENABLE ROW LEVEL SECURITY;

-- 13. TABLE DISPONIBILITES_PROFESSEUR
CREATE TABLE public.disponibilites_professeur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professeur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 0 AND 6),
  date_specifique DATE,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.disponibilites_professeur ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INDEX PARTIELS POUR OPTIMISATION (Comme demandé dans PDF)
-- =====================================================

-- Index sur examens actifs uniquement
CREATE INDEX idx_examens_planifies ON public.examens(date_examen) 
WHERE statut = 'planifie';

-- Index sur conflits non résolus
CREATE INDEX idx_conflits_non_resolus ON public.conflits(created_at DESC) 
WHERE resolu = FALSE;

-- Index sur lieux disponibles
CREATE INDEX idx_lieux_disponibles ON public.lieux_examen(capacite DESC) 
WHERE disponible = TRUE;

-- Index sur sessions actives
CREATE INDEX idx_sessions_actives ON public.sessions_examen(date_debut, date_fin) 
WHERE active = TRUE;

-- Index composé pour recherche d'examens
CREATE INDEX idx_examens_date_lieu ON public.examens(date_examen, lieu_id, heure_debut);

-- =====================================================
-- FONCTION SECURITY DEFINER POUR VÉRIFIER LES RÔLES
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- =====================================================
-- PROCÉDURES PL/pgSQL POUR OPTIMISATION (Comme demandé)
-- =====================================================

-- Procédure pour détecter les conflits de surveillance
CREATE OR REPLACE FUNCTION public.detecter_conflits_surveillance()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nb_conflits INTEGER := 0;
  r RECORD;
BEGIN
  -- Détecter les professeurs ayant 2+ examens au même moment
  FOR r IN 
    SELECT 
      s1.professeur_id,
      e1.id AS examen_1,
      e2.id AS examen_2,
      e1.date_examen,
      e1.heure_debut
    FROM surveillances s1
    JOIN surveillances s2 ON s1.professeur_id = s2.professeur_id AND s1.examen_id < s2.examen_id
    JOIN examens e1 ON s1.examen_id = e1.id
    JOIN examens e2 ON s2.examen_id = e2.id
    WHERE e1.date_examen = e2.date_examen
      AND e1.heure_debut < e2.heure_fin
      AND e2.heure_debut < e1.heure_fin
      AND e1.statut = 'planifie'
      AND e2.statut = 'planifie'
      AND NOT EXISTS (
        SELECT 1 FROM conflits c 
        WHERE c.examen_1_id = e1.id AND c.examen_2_id = e2.id AND c.type = 'surveillance'
      )
  LOOP
    INSERT INTO conflits (type, niveau, description, examen_1_id, examen_2_id, professeur_id)
    VALUES ('surveillance', 'critique', 
            'Professeur assigné à deux examens simultanés',
            r.examen_1, r.examen_2, r.professeur_id);
    nb_conflits := nb_conflits + 1;
  END LOOP;
  
  RETURN nb_conflits;
END;
$$;

-- Procédure pour détecter les conflits d'étudiants
CREATE OR REPLACE FUNCTION public.detecter_conflits_etudiants()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nb_conflits INTEGER := 0;
  r RECORD;
BEGIN
  -- Détecter les étudiants ayant 2+ examens au même moment
  FOR r IN 
    SELECT 
      i1.etudiant_id,
      e1.id AS examen_1,
      e2.id AS examen_2
    FROM inscriptions_examen i1
    JOIN inscriptions_examen i2 ON i1.etudiant_id = i2.etudiant_id AND i1.examen_id < i2.examen_id
    JOIN examens e1 ON i1.examen_id = e1.id
    JOIN examens e2 ON i2.examen_id = e2.id
    WHERE e1.date_examen = e2.date_examen
      AND e1.heure_debut < e2.heure_fin
      AND e2.heure_debut < e1.heure_fin
      AND e1.statut = 'planifie'
      AND e2.statut = 'planifie'
      AND NOT EXISTS (
        SELECT 1 FROM conflits c 
        WHERE c.examen_1_id = e1.id AND c.examen_2_id = e2.id AND c.type = 'etudiant'
      )
  LOOP
    INSERT INTO conflits (type, niveau, description, examen_1_id, examen_2_id, etudiant_id)
    VALUES ('etudiant', 'critique', 
            'Étudiant inscrit à deux examens simultanés',
            r.examen_1, r.examen_2, r.etudiant_id);
    nb_conflits := nb_conflits + 1;
  END LOOP;
  
  RETURN nb_conflits;
END;
$$;

-- Procédure pour vérifier la capacité des salles
CREATE OR REPLACE FUNCTION public.verifier_capacite_salles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nb_alertes INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN 
    SELECT e.id, e.nombre_inscrits, l.capacite, l.nom
    FROM examens e
    JOIN lieux_examen l ON e.lieu_id = l.id
    WHERE e.nombre_inscrits > l.capacite
      AND e.statut = 'planifie'
      AND NOT EXISTS (
        SELECT 1 FROM conflits c WHERE c.examen_1_id = e.id AND c.type = 'salle'
      )
  LOOP
    INSERT INTO conflits (type, niveau, description, examen_1_id, lieu_id)
    VALUES ('salle', 'critique', 
            'Capacité de la salle dépassée: ' || r.nombre_inscrits || ' inscrits pour ' || r.capacite || ' places',
            r.id, r.lieu_id);
    nb_alertes := nb_alertes + 1;
  END LOOP;
  
  RETURN nb_alertes;
END;
$$;

-- Fonction pour obtenir les statistiques du dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_examens', (SELECT COUNT(*) FROM examens WHERE statut = 'planifie'),
    'examens_cette_semaine', (SELECT COUNT(*) FROM examens WHERE date_examen BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'),
    'conflits_non_resolus', (SELECT COUNT(*) FROM conflits WHERE resolu = FALSE),
    'conflits_critiques', (SELECT COUNT(*) FROM conflits WHERE resolu = FALSE AND niveau = 'critique'),
    'salles_disponibles', (SELECT COUNT(*) FROM lieux_examen WHERE disponible = TRUE),
    'total_salles', (SELECT COUNT(*) FROM lieux_examen),
    'total_professeurs', (SELECT COUNT(*) FROM profiles WHERE role = 'professeur'),
    'total_etudiants', (SELECT COUNT(*) FROM profiles WHERE role = 'etudiant')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departements_updated_at BEFORE UPDATE ON public.departements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formations_updated_at BEFORE UPDATE ON public.formations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lieux_updated_at BEFORE UPDATE ON public.lieux_examen
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_examens_updated_at BEFORE UPDATE ON public.examens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions_examen
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour créer automatiquement le profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', 'Nouveau'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'etudiant')
  );
  
  -- Ajouter aussi dans user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'etudiant'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- POLITIQUES RLS
-- =====================================================

-- Profiles: lecture publique, modification par soi-même ou admin
CREATE POLICY "Profiles visibles par tous les authentifiés"
ON public.profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Utilisateurs peuvent modifier leur profil"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins peuvent tout modifier sur profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- User Roles
CREATE POLICY "Roles visibles par admins"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen') OR user_id = auth.uid());

CREATE POLICY "Admins peuvent gérer les roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- Departements: lecture par tous, modification par admins
CREATE POLICY "Departements visibles par tous"
ON public.departements FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins peuvent gérer departements"
ON public.departements FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- Formations
CREATE POLICY "Formations visibles par tous"
ON public.formations FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins et chefs peuvent gérer formations"
ON public.formations FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'vice_doyen')
  OR public.has_role(auth.uid(), 'chef_departement')
);

-- Modules
CREATE POLICY "Modules visibles par tous"
ON public.modules FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins et profs peuvent gérer modules"
ON public.modules FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'vice_doyen')
  OR public.has_role(auth.uid(), 'chef_departement')
  OR responsable_id = auth.uid()
);

-- Lieux
CREATE POLICY "Lieux visibles par tous"
ON public.lieux_examen FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins peuvent gérer lieux"
ON public.lieux_examen FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- Sessions
CREATE POLICY "Sessions visibles par tous"
ON public.sessions_examen FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins peuvent gérer sessions"
ON public.sessions_examen FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- Examens
CREATE POLICY "Examens visibles par tous"
ON public.examens FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins et chefs peuvent gérer examens"
ON public.examens FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'vice_doyen')
  OR public.has_role(auth.uid(), 'chef_departement')
);

-- Surveillances
CREATE POLICY "Surveillances visibles par tous"
ON public.surveillances FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins peuvent gérer surveillances"
ON public.surveillances FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'vice_doyen')
  OR professeur_id = auth.uid()
);

-- Inscriptions
CREATE POLICY "Etudiants voient leurs inscriptions"
ON public.inscriptions_examen FOR SELECT TO authenticated
USING (etudiant_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen') OR public.has_role(auth.uid(), 'professeur'));

CREATE POLICY "Admins peuvent gérer inscriptions"
ON public.inscriptions_examen FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- Conflits
CREATE POLICY "Conflits visibles par staff"
ON public.conflits FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'vice_doyen')
  OR public.has_role(auth.uid(), 'chef_departement')
  OR professeur_id = auth.uid()
);

CREATE POLICY "Admins peuvent gérer conflits"
ON public.conflits FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

-- Disponibilités
CREATE POLICY "Profs voient leurs disponibilités"
ON public.disponibilites_professeur FOR SELECT TO authenticated
USING (professeur_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));

CREATE POLICY "Profs peuvent gérer leurs disponibilités"
ON public.disponibilites_professeur FOR ALL TO authenticated
USING (professeur_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vice_doyen'));