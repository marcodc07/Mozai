import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

// Types pour les rôles
export type AssociationRole = 'president' | 'admin' | 'editor' | null;

// Interface pour les permissions
export interface AssociationPermissions {
  // Rôle de l'utilisateur
  role: AssociationRole;
  isLoading: boolean;

  // Permissions générales
  canViewAdminPanel: boolean;

  // Permissions sur les publications
  canCreatePost: boolean;
  canEditPost: boolean;
  canDeletePost: boolean;
  canPinPost: boolean;

  // Permissions sur les événements
  canCreateEvent: boolean;
  canEditEvent: boolean;
  canDeleteEvent: boolean;

  // Permissions sur les membres du bureau
  canManageMembers: boolean;

  // Permissions sur les informations de l'association
  canEditAssociationInfo: boolean;

  // Permissions sur les administrateurs
  canManageAdmins: boolean;

  // Permission ultime
  canDeleteAssociation: boolean;
}

/**
 * Hook pour gérer les permissions d'un utilisateur sur une association
 *
 * @param associationId - ID de l'association
 * @returns Objet contenant le rôle et toutes les permissions
 *
 * @example
 * const { role, canCreatePost, canManageAdmins } = useAssociationPermissions(associationId);
 *
 * if (canCreatePost) {
 *   // Afficher le bouton "Créer une publication"
 * }
 */
export function useAssociationPermissions(associationId: string | undefined): AssociationPermissions {
  const { user } = useAuth();
  const [role, setRole] = useState<AssociationRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!associationId || !user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    loadUserRole();
  }, [associationId, user]);

  const loadUserRole = async () => {
    if (!user || !associationId) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('association_admins')
        .select('role')
        .eq('association_id', associationId)
        .eq('user_id', user.id)
        .maybeSingle(); // maybeSingle() au lieu de single() pour éviter l'erreur si pas de résultat

      if (error) {
        console.error('Erreur chargement rôle:', error);
        setRole(null);
      } else {
        setRole(data?.role as AssociationRole || null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul des permissions basé sur le rôle
  const permissions: AssociationPermissions = {
    role,
    isLoading,
    canViewAdminPanel: role !== null,

    // Publications
    canCreatePost: role === 'president' || role === 'admin' || role === 'editor',
    canEditPost: role === 'president' || role === 'admin',
    canDeletePost: role === 'president' || role === 'admin',
    canPinPost: role === 'president' || role === 'admin',

    // Événements
    canCreateEvent: role === 'president' || role === 'admin',
    canEditEvent: role === 'president' || role === 'admin',
    canDeleteEvent: role === 'president' || role === 'admin',

    // Membres du bureau
    canManageMembers: role === 'president' || role === 'admin',

    // Informations de l'association
    canEditAssociationInfo: role === 'president' || role === 'admin',

    // Administrateurs
    canManageAdmins: role === 'president',

    // Suppression
    canDeleteAssociation: role === 'president',
  };

  return permissions;
}

/**
 * Fonction utilitaire pour obtenir le libellé en français d'un rôle
 */
export function getRoleLabel(role: AssociationRole): string {
  switch (role) {
    case 'president':
      return 'Président';
    case 'admin':
      return 'Administrateur';
    case 'editor':
      return 'Éditeur';
    default:
      return 'Membre';
  }
}

/**
 * Fonction utilitaire pour obtenir l'icône d'un rôle
 */
export function getRoleIcon(role: AssociationRole): string {
  switch (role) {
    case 'president':
      return '👑';
    case 'admin':
      return '⚙️';
    case 'editor':
      return '✍️';
    default:
      return '👤';
  }
}

/**
 * Fonction utilitaire pour obtenir la description d'un rôle
 */
export function getRoleDescription(role: AssociationRole): string {
  switch (role) {
    case 'president':
      return 'Tous les droits sur l\'association';
    case 'admin':
      return 'Gestion de l\'association (sauf admins et suppression)';
    case 'editor':
      return 'Création de publications uniquement';
    default:
      return 'Aucun droit d\'administration';
  }
}
