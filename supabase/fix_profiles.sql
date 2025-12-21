-- =====================================================
-- SCRIPT DE RÉPARATION : INSERTION DES PROFILS
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- 1. On supprime l'ancien trigger pour être sûr
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. On recrée la fonction qui insère le profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insertion dans la table PROFILES
  INSERT INTO public.profiles (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- On récupère les infos envoyées depuis le formulaire (ou valeurs par défaut)
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, '')
  );
  
  -- Insertion dans la table USER_ROLES (sécurité)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, '')
  );
  
  RETURN NEW;
END;
$$;

-- 3. On réactive le déclencheur (Trigger) sur la création d'utilisateur
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. CRITIQUE : Au cas où le trigger échoue, on autorise l'insertion manuelle
-- Cela permet au site web de "forcer" l'ajout si besoin (ceinture de sécurité)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
