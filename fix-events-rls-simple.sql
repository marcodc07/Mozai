-- ============================================
-- FIX RAPIDE POUR L'ERREUR RLS SUR LA TABLE EVENTS
-- ============================================
-- Cette version utilise le champ is_admin de la table profiles
-- Plus simple que la version avec association_admins

-- --------------------------------------------
-- 1. SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- --------------------------------------------

DROP POLICY IF EXISTS "Les événements sont visibles par tous les utilisateurs authentifiés" ON events;
DROP POLICY IF EXISTS "Les admins peuvent créer des événements pour leur association" ON events;
DROP POLICY IF EXISTS "Les admins peuvent modifier les événements de leur association" ON events;
DROP POLICY IF EXISTS "Les présidents peuvent supprimer les événements de leur association" ON events;

-- --------------------------------------------
-- 2. ACTIVER RLS SUR LA TABLE EVENTS
-- --------------------------------------------

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- 3. POLITIQUE DE LECTURE (TOUS)
-- --------------------------------------------

CREATE POLICY "Tout le monde peut voir les événements"
ON events FOR SELECT
TO authenticated
USING (true);

-- --------------------------------------------
-- 4. POLITIQUE DE CRÉATION (ADMINS UNIQUEMENT)
-- --------------------------------------------

CREATE POLICY "Les admins peuvent créer des événements"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- --------------------------------------------
-- 5. POLITIQUE DE MISE À JOUR (ADMINS UNIQUEMENT)
-- --------------------------------------------

CREATE POLICY "Les admins peuvent modifier les événements"
ON events FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- --------------------------------------------
-- 6. POLITIQUE DE SUPPRESSION (ADMINS UNIQUEMENT)
-- --------------------------------------------

CREATE POLICY "Les admins peuvent supprimer les événements"
ON events FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- --------------------------------------------
-- 7. POLITIQUES POUR event_ticket_types
-- --------------------------------------------

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les types de billets sont visibles par tous" ON event_ticket_types;
DROP POLICY IF EXISTS "Les admins peuvent créer des types de billets" ON event_ticket_types;
DROP POLICY IF EXISTS "Les admins peuvent modifier les types de billets" ON event_ticket_types;
DROP POLICY IF EXISTS "Les présidents peuvent supprimer les types de billets" ON event_ticket_types;

-- Activer RLS
ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les types de billets
CREATE POLICY "Tout le monde peut voir les types de billets"
ON event_ticket_types FOR SELECT
TO authenticated
USING (true);

-- Les admins peuvent créer des types de billets
CREATE POLICY "Les admins peuvent créer des types de billets"
ON event_ticket_types FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Les admins peuvent modifier les types de billets
CREATE POLICY "Les admins peuvent modifier les types de billets"
ON event_ticket_types FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Les admins peuvent supprimer les types de billets
CREATE POLICY "Les admins peuvent supprimer les types de billets"
ON event_ticket_types FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================
-- FIN DU SCRIPT SQL
-- ============================================

-- INSTRUCTIONS :
-- 1. Va dans Supabase Dashboard > SQL Editor
-- 2. Copie et colle CE SCRIPT COMPLET
-- 3. Clique sur "Run" pour exécuter
-- 4. Tu pourras alors créer des événements sans erreur RLS !
