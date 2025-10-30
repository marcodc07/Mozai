-- ============================================
-- SYSTÈME DE PERMISSIONS POUR LES ASSOCIATIONS
-- ============================================
-- Ce fichier contient toutes les requêtes SQL à exécuter dans Supabase
-- pour mettre en place le système de permissions par rôle

-- --------------------------------------------
-- 1. CRÉATION DE LA TABLE association_admins
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS association_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('president', 'admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Un utilisateur ne peut avoir qu'un seul rôle par association
  UNIQUE(association_id, user_id)
);

-- Commentaires pour documentation
COMMENT ON TABLE association_admins IS 'Gère les rôles et permissions des administrateurs d''associations';
COMMENT ON COLUMN association_admins.role IS 'president: tous droits | admin: gestion asso sans admin | editor: création posts uniquement';

-- --------------------------------------------
-- 2. INDEX POUR PERFORMANCES
-- --------------------------------------------

-- Index pour rechercher les admins d'une association
CREATE INDEX IF NOT EXISTS idx_association_admins_association_id
ON association_admins(association_id);

-- Index pour rechercher les associations d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_association_admins_user_id
ON association_admins(user_id);

-- Index composite pour vérification rapide des permissions
CREATE INDEX IF NOT EXISTS idx_association_admins_association_user
ON association_admins(association_id, user_id);

-- --------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- --------------------------------------------

-- Activer RLS sur la table
ALTER TABLE association_admins ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir les admins des associations
CREATE POLICY "Les admins des associations sont visibles par tous"
ON association_admins FOR SELECT
TO authenticated
USING (true);

-- Policy : Seuls les présidents peuvent ajouter/modifier/supprimer des admins
CREATE POLICY "Seuls les présidents peuvent gérer les admins"
ON association_admins FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM association_admins aa
    WHERE aa.association_id = association_admins.association_id
    AND aa.user_id = auth.uid()
    AND aa.role = 'president'
  )
);

-- --------------------------------------------
-- 4. TRIGGER POUR updated_at
-- --------------------------------------------

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur association_admins
DROP TRIGGER IF EXISTS update_association_admins_updated_at ON association_admins;
CREATE TRIGGER update_association_admins_updated_at
BEFORE UPDATE ON association_admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- 5. FONCTION POUR VÉRIFIER LES PERMISSIONS
-- --------------------------------------------

-- Fonction pour obtenir le rôle d'un utilisateur sur une association
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

  RETURN user_role; -- Retourne 'president', 'admin', 'editor' ou NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a une permission spécifique
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_association_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Récupérer le rôle de l'utilisateur
  user_role := get_user_role_in_association(p_user_id, p_association_id);

  -- Si pas de rôle, pas de permission
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Président a tous les droits
  IF user_role = 'president' THEN
    RETURN TRUE;
  END IF;

  -- Admin a presque tous les droits sauf gestion admins et suppression
  IF user_role = 'admin' THEN
    RETURN p_permission NOT IN ('manage_admins', 'delete_association');
  END IF;

  -- Éditeur peut seulement créer des posts
  IF user_role = 'editor' THEN
    RETURN p_permission = 'create_post';
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- 6. MIGRATION DES DONNÉES EXISTANTES
-- --------------------------------------------

-- Convertir les créateurs d'associations en présidents
-- ATTENTION : Exécuter cette requête UNE SEULE FOIS !
INSERT INTO association_admins (association_id, user_id, role)
SELECT
  id as association_id,
  created_by as user_id,
  'president' as role
FROM associations
WHERE created_by IS NOT NULL
ON CONFLICT (association_id, user_id) DO NOTHING;

-- --------------------------------------------
-- 7. VUES UTILES (optionnel)
-- --------------------------------------------

-- Vue pour avoir les infos complètes des admins avec les profils
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
-- 8. DONNÉES DE TEST (optionnel - à supprimer en prod)
-- --------------------------------------------

-- Exemple : Ajouter un admin à une association
-- INSERT INTO association_admins (association_id, user_id, role)
-- VALUES (
--   'uuid-de-l-association',
--   'uuid-de-l-utilisateur',
--   'admin' -- ou 'president' ou 'editor'
-- );

-- ============================================
-- FIN DU SCRIPT SQL
-- ============================================

-- NOTES D'UTILISATION :
-- 1. Exécuter ce script dans l'éditeur SQL de Supabase
-- 2. Vérifier que les tables associations et profiles existent déjà
-- 3. La section 6 (migration) ne doit être exécutée qu'une seule fois
-- 4. Les permissions sont maintenant gérées par association_admins,
--    pas par le champ created_by
