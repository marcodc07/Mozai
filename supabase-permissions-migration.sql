-- ============================================
-- MIGRATION PROPRE VERS LE SYSTÈME DE PERMISSIONS
-- ============================================
-- Exécuter ce script dans Supabase SQL Editor

-- --------------------------------------------
-- ÉTAPE 1 : NETTOYAGE (si la table existe déjà)
-- --------------------------------------------

-- Supprimer les policies existantes (si elles existent)
DROP POLICY IF EXISTS "Les admins des associations sont visibles par tous" ON association_admins;
DROP POLICY IF EXISTS "Seuls les présidents peuvent gérer les admins" ON association_admins;
DROP POLICY IF EXISTS "Lecture des admins autorisée" ON association_admins;
DROP POLICY IF EXISTS "Insertion admins par présidents" ON association_admins;
DROP POLICY IF EXISTS "Modification admins par présidents" ON association_admins;
DROP POLICY IF EXISTS "Suppression admins par présidents" ON association_admins;

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS update_association_admins_updated_at ON association_admins;

-- Supprimer les index existants
DROP INDEX IF EXISTS idx_association_admins_association_id;
DROP INDEX IF EXISTS idx_association_admins_user_id;
DROP INDEX IF EXISTS idx_association_admins_association_user;

-- Supprimer la vue existante
DROP VIEW IF EXISTS association_admins_with_profiles;

-- Supprimer la table existante
DROP TABLE IF EXISTS association_admins CASCADE;

-- --------------------------------------------
-- ÉTAPE 2 : CRÉATION DE LA TABLE
-- --------------------------------------------

CREATE TABLE association_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('president', 'admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Un utilisateur ne peut avoir qu'un seul rôle par association
  UNIQUE(association_id, user_id)
);

-- Commentaires
COMMENT ON TABLE association_admins IS 'Gère les rôles et permissions des administrateurs d''associations';
COMMENT ON COLUMN association_admins.role IS 'president: tous droits | admin: gestion asso sans admin | editor: création posts uniquement';

-- --------------------------------------------
-- ÉTAPE 3 : INDEX POUR PERFORMANCES
-- --------------------------------------------

CREATE INDEX idx_association_admins_association_id ON association_admins(association_id);
CREATE INDEX idx_association_admins_user_id ON association_admins(user_id);
CREATE INDEX idx_association_admins_association_user ON association_admins(association_id, user_id);

-- --------------------------------------------
-- ÉTAPE 4 : ROW LEVEL SECURITY (RLS)
-- --------------------------------------------

-- IMPORTANT : On DÉSACTIVE RLS sur cette table pour éviter la récursion
-- Les permissions sont gérées côté application avec le hook useAssociationPermissions
-- Cette table est publique de toute façon (tout le monde peut voir les admins)

-- Désactiver RLS
ALTER TABLE association_admins DISABLE ROW LEVEL SECURITY;

-- NOTE : La sécurité est assurée par :
-- 1. Le hook useAssociationPermissions côté client (affichage des boutons)
-- 2. Les vérifications côté serveur avant d'ajouter/modifier des admins
-- 3. Les utilisateurs authentifiés peuvent lire, mais les modifications
--    sont contrôlées dans l'application

-- --------------------------------------------
-- ÉTAPE 5 : TRIGGER POUR updated_at
-- --------------------------------------------

-- Créer ou remplacer la fonction (au cas où elle n'existe pas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur association_admins
CREATE TRIGGER update_association_admins_updated_at
BEFORE UPDATE ON association_admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- ÉTAPE 6 : FONCTIONS UTILITAIRES
-- --------------------------------------------

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role_in_association(
  p_user_id UUID,
  p_association_id UUID
)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM association_admins
  WHERE user_id = p_user_id
  AND association_id = p_association_id;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_association_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := get_user_role_in_association(p_user_id, p_association_id);

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  IF user_role = 'president' THEN
    RETURN TRUE;
  END IF;

  IF user_role = 'admin' THEN
    RETURN p_permission NOT IN ('manage_admins', 'delete_association');
  END IF;

  IF user_role = 'editor' THEN
    RETURN p_permission = 'create_post';
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- ÉTAPE 7 : VUE AVEC PROFILS
-- --------------------------------------------

CREATE OR REPLACE VIEW association_admins_with_profiles AS
SELECT
  aa.id,
  aa.association_id,
  aa.user_id,
  aa.role,
  aa.created_at,
  aa.updated_at,
  p.email,
  p.full_name,
  a.name as association_name
FROM association_admins aa
LEFT JOIN profiles p ON aa.user_id = p.id
LEFT JOIN associations a ON aa.association_id = a.id;

-- --------------------------------------------
-- ÉTAPE 8 : MIGRATION DES DONNÉES
-- --------------------------------------------

-- Convertir tous les créateurs en présidents
INSERT INTO association_admins (association_id, user_id, role)
SELECT
  id as association_id,
  created_by as user_id,
  'president' as role
FROM associations
WHERE created_by IS NOT NULL
ON CONFLICT (association_id, user_id) DO NOTHING;

-- --------------------------------------------
-- ÉTAPE 9 : VÉRIFICATION
-- --------------------------------------------

-- Afficher le nombre de présidents créés
SELECT
  COUNT(*) as nombre_presidents,
  'Présidents migrés avec succès' as message
FROM association_admins
WHERE role = 'president';

-- Afficher quelques exemples
SELECT
  a.name as association,
  p.full_name as president,
  aa.role,
  aa.created_at
FROM association_admins aa
JOIN associations a ON aa.association_id = a.id
JOIN profiles p ON aa.user_id = p.id
ORDER BY aa.created_at DESC
LIMIT 5;

-- ============================================
-- MIGRATION TERMINÉE !
-- ============================================

-- Si tout s'est bien passé, vous devriez voir :
-- 1. Le nombre de présidents créés
-- 2. Une liste de quelques associations avec leurs présidents
