-- ============================================
-- POLITIQUES RLS POUR LA TABLE EVENTS
-- ============================================
-- Ce fichier corrige l'erreur "new row violates row-level security policy for table \"events\""

-- --------------------------------------------
-- 1. ACTIVER RLS SUR LA TABLE EVENTS (si pas déjà fait)
-- --------------------------------------------

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- 2. POLITIQUE DE LECTURE
-- --------------------------------------------

-- Tout le monde peut voir les événements de son université
DROP POLICY IF EXISTS "Les événements sont visibles par tous les utilisateurs authentifiés" ON events;
CREATE POLICY "Les événements sont visibles par tous les utilisateurs authentifiés"
ON events FOR SELECT
TO authenticated
USING (true);

-- --------------------------------------------
-- 3. POLITIQUE DE CRÉATION
-- --------------------------------------------

-- Les admins d'une association peuvent créer des événements pour cette association
DROP POLICY IF EXISTS "Les admins peuvent créer des événements pour leur association" ON events;
CREATE POLICY "Les admins peuvent créer des événements pour leur association"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  -- Vérifier que l'utilisateur est admin de l'association
  EXISTS (
    SELECT 1 FROM association_admins
    WHERE association_admins.association_id = events.association_id
    AND association_admins.user_id = auth.uid()
  )
  OR
  -- OU l'événement n'est pas lié à une association (organisateur externe)
  events.association_id IS NULL
);

-- --------------------------------------------
-- 4. POLITIQUE DE MISE À JOUR
-- --------------------------------------------

-- Les admins d'une association peuvent modifier les événements de leur association
DROP POLICY IF EXISTS "Les admins peuvent modifier les événements de leur association" ON events;
CREATE POLICY "Les admins peuvent modifier les événements de leur association"
ON events FOR UPDATE
TO authenticated
USING (
  -- Vérifier que l'utilisateur est admin de l'association
  EXISTS (
    SELECT 1 FROM association_admins
    WHERE association_admins.association_id = events.association_id
    AND association_admins.user_id = auth.uid()
  )
  OR
  -- OU l'événement n'est pas lié à une association
  events.association_id IS NULL
)
WITH CHECK (
  -- Même vérification pour la nouvelle version
  EXISTS (
    SELECT 1 FROM association_admins
    WHERE association_admins.association_id = events.association_id
    AND association_admins.user_id = auth.uid()
  )
  OR
  events.association_id IS NULL
);

-- --------------------------------------------
-- 5. POLITIQUE DE SUPPRESSION
-- --------------------------------------------

-- Seuls les présidents peuvent supprimer des événements
DROP POLICY IF EXISTS "Les présidents peuvent supprimer les événements de leur association" ON events;
CREATE POLICY "Les présidents peuvent supprimer les événements de leur association"
ON events FOR DELETE
TO authenticated
USING (
  -- Vérifier que l'utilisateur est président de l'association
  EXISTS (
    SELECT 1 FROM association_admins
    WHERE association_admins.association_id = events.association_id
    AND association_admins.user_id = auth.uid()
    AND association_admins.role = 'president'
  )
  OR
  -- OU l'événement n'est pas lié à une association
  events.association_id IS NULL
);

-- --------------------------------------------
-- 6. POLITIQUES RLS POUR event_ticket_types
-- --------------------------------------------

ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les types de billets
DROP POLICY IF EXISTS "Les types de billets sont visibles par tous" ON event_ticket_types;
CREATE POLICY "Les types de billets sont visibles par tous"
ON event_ticket_types FOR SELECT
TO authenticated
USING (true);

-- Les admins peuvent créer des types de billets pour leurs événements
DROP POLICY IF EXISTS "Les admins peuvent créer des types de billets" ON event_ticket_types;
CREATE POLICY "Les admins peuvent créer des types de billets"
ON event_ticket_types FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e
    JOIN association_admins aa ON e.association_id = aa.association_id
    WHERE e.id = event_ticket_types.event_id
    AND aa.user_id = auth.uid()
  )
  OR
  -- Ou pour les événements sans association
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_ticket_types.event_id
    AND e.association_id IS NULL
  )
);

-- Les admins peuvent modifier les types de billets
DROP POLICY IF EXISTS "Les admins peuvent modifier les types de billets" ON event_ticket_types;
CREATE POLICY "Les admins peuvent modifier les types de billets"
ON event_ticket_types FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN association_admins aa ON e.association_id = aa.association_id
    WHERE e.id = event_ticket_types.event_id
    AND aa.user_id = auth.uid()
  )
);

-- Les présidents peuvent supprimer les types de billets
DROP POLICY IF EXISTS "Les présidents peuvent supprimer les types de billets" ON event_ticket_types;
CREATE POLICY "Les présidents peuvent supprimer les types de billets"
ON event_ticket_types FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN association_admins aa ON e.association_id = aa.association_id
    WHERE e.id = event_ticket_types.event_id
    AND aa.user_id = auth.uid()
    AND aa.role = 'president'
  )
);

-- ============================================
-- FIN DU SCRIPT SQL
-- ============================================

-- INSTRUCTIONS D'UTILISATION :
-- 1. Copier ce script dans l'éditeur SQL de Supabase
-- 2. Exécuter tout le script
-- 3. Vérifier que les politiques sont bien créées dans la section "Policies" de la table events
-- 4. Tester la création d'un événement depuis l'application
