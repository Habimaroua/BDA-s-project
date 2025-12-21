-- ==========================================
-- REPARATION FINALE DES DROITS D'ACCÈS
-- ==========================================

-- 1. Autoriser l'insertion directe du profil (si le trigger échoue)
DROP POLICY IF EXISTS "Autoriser insertion profil" ON public.profiles;
CREATE POLICY "Autoriser insertion profil" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 2. Autoriser l'insertion directe du rôle
DROP POLICY IF EXISTS "Autoriser insertion role" ON public.user_roles;
CREATE POLICY "Autoriser insertion role" 
ON public.user_roles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Réparer le Trigger (Version ultra-compatible)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insertion Profil
  INSERT INTO public.profiles (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', 'Nouveau'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'etudiant')
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Insertion Role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'etudiant')
  ) ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 4. Vérifier les permissions schéma
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
