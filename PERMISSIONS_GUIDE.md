# 🔐 Système de Permissions des Associations - Guide Complet

## 📋 Vue d'ensemble

Mozaï utilise un système de permissions à 3 niveaux pour gérer les droits d'administration des associations. Chaque utilisateur peut avoir un rôle différent dans chaque association.

---

## 👥 Les 3 Rôles

### 👑 **Président**
Le niveau le plus élevé - Tous les droits sur l'association

**Permissions :**
- ✅ Créer/modifier/supprimer des publications
- ✅ Épingler des publications
- ✅ Créer/modifier/supprimer des événements
- ✅ Gérer les membres du bureau (ajouter/retirer/modifier)
- ✅ Modifier les informations de l'association (nom, description, recrutement)
- ✅ Gérer les administrateurs (ajouter/retirer/promouvoir)
- ✅ Supprimer définitivement l'association

**Obtention :**
- Automatique lors de la création d'une association
- Nécessite un abonnement `is_admin = true` dans profiles

---

### ⚙️ **Admin**
Le bras droit du président - Presque tous les droits

**Permissions :**
- ✅ Créer/modifier/supprimer des publications
- ✅ Épingler des publications
- ✅ Créer/modifier/supprimer des événements
- ✅ Gérer les membres du bureau (ajouter/retirer/modifier)
- ✅ Modifier les informations de l'association (nom, description, recrutement)
- ❌ Gérer les administrateurs
- ❌ Supprimer l'association

**Obtention :**
- Ajouté par un président
- Ne nécessite PAS d'abonnement `is_admin`

---

### ✍️ **Éditeur**
Le community manager - Droits limités

**Permissions :**
- ✅ Créer des publications (texte, image, lien)
- ❌ Modifier/supprimer des publications
- ❌ Épingler des publications
- ❌ Événements
- ❌ Membres du bureau
- ❌ Informations de l'association
- ❌ Administrateurs

**Obtention :**
- Ajouté par un président
- Ne nécessite PAS d'abonnement `is_admin`

---

## 🗄️ Structure Base de Données

### Table `association_admins`

```sql
CREATE TABLE association_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('president', 'admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(association_id, user_id)
);
```

**Contraintes :**
- Un utilisateur ne peut avoir qu'un seul rôle par association
- Le rôle est supprimé automatiquement si l'association ou l'utilisateur est supprimé

---

## 💻 Utilisation dans le Code

### 1. Importer le Hook

```typescript
import { useAssociationPermissions } from '@/hooks/useAssociationPermissions';
```

### 2. Utiliser le Hook

```typescript
function AssociationDetailScreen() {
  const { id } = useLocalSearchParams(); // ID de l'association
  const permissions = useAssociationPermissions(id as string);

  // Vérifier les permissions
  if (permissions.canCreatePost) {
    // Afficher le bouton "Créer une publication"
  }

  if (permissions.canManageAdmins) {
    // Afficher la section de gestion des admins
  }

  if (permissions.isLoading) {
    // Afficher un loader pendant le chargement
  }

  return (
    <View>
      {permissions.canEditAssociationInfo && (
        <Button onPress={openEditModal}>Modifier</Button>
      )}
    </View>
  );
}
```

### 3. Permissions Disponibles

```typescript
interface AssociationPermissions {
  // Rôle de l'utilisateur
  role: 'president' | 'admin' | 'editor' | null;
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
```

### 4. Fonctions Utilitaires

```typescript
import { getRoleLabel, getRoleIcon, getRoleDescription } from '@/hooks/useAssociationPermissions';

// Obtenir le libellé français
getRoleLabel('president'); // "Président"
getRoleLabel('admin');     // "Administrateur"
getRoleLabel('editor');    // "Éditeur"

// Obtenir l'icône
getRoleIcon('president'); // "👑"
getRoleIcon('admin');     // "⚙️"
getRoleIcon('editor');    // "✍️"

// Obtenir la description
getRoleDescription('president');
// "Tous les droits sur l'association"
```

---

## 🔧 Configuration Initiale dans Supabase

### Étapes à suivre :

1. **Ouvrir l'éditeur SQL de Supabase**

2. **Exécuter le script SQL**
   - Copier tout le contenu de `supabase-permissions-setup.sql`
   - Coller dans l'éditeur SQL
   - Exécuter

3. **Vérifier la création de la table**
   ```sql
   SELECT * FROM association_admins LIMIT 5;
   ```

4. **Migration des données existantes** (automatique dans le script)
   - Tous les créateurs d'associations deviennent automatiquement présidents

---

## 📝 Exemples d'Utilisation

### Ajouter un Admin à une Association

```typescript
// Code côté client (uniquement si tu es président)
const { error } = await supabase
  .from('association_admins')
  .insert([{
    association_id: 'uuid-de-l-association',
    user_id: 'uuid-de-l-utilisateur',
    role: 'admin' // ou 'editor'
  }]);
```

### Vérifier si un Utilisateur est Président

```typescript
const { data } = await supabase
  .from('association_admins')
  .select('role')
  .eq('association_id', associationId)
  .eq('user_id', userId)
  .maybeSingle();

const isPresident = data?.role === 'president';
```

### Retirer un Admin

```typescript
const { error } = await supabase
  .from('association_admins')
  .delete()
  .eq('association_id', associationId)
  .eq('user_id', userId);
```

### Changer le Rôle d'un Admin

```typescript
const { error } = await supabase
  .from('association_admins')
  .update({ role: 'admin' }) // Passer de 'editor' à 'admin'
  .eq('association_id', associationId)
  .eq('user_id', userId);
```

---

## ⚠️ Important : Distinction avec l'Abonnement

### `is_admin` dans `profiles` (Abonnement)
- Permet de **créer** des associations
- Nécessaire pour obtenir le rôle de **président**
- Payant / Abonnement

### Rôles dans `association_admins` (Gestion d'asso)
- Permet de **gérer** une association spécifique
- **Admin** et **Éditeur** ne nécessitent PAS d'abonnement
- Gratuit pour les collaborateurs

**Exemple :**
- Alice a `is_admin = true` → Elle crée une asso et devient présidente
- Alice ajoute Bob comme admin → Bob peut gérer l'asso SANS payer
- Alice ajoute Claire comme éditrice → Claire peut poster SANS payer

---

## 🎯 Cas d'Usage

### Cas 1 : BDE d'une École
- **Président** : Le président élu du BDE
- **Admin** : Vice-président, trésorier, secrétaire
- **Éditeur** : Responsable communication (posts sur les réseaux)

### Cas 2 : Association Sportive
- **Président** : Le président de l'asso
- **Admin** : Responsable événements, responsable adhésions
- **Éditeur** : Community manager pour les posts d'actualités

### Cas 3 : Club Culturel
- **Président** : Le fondateur du club
- **Admin** : Co-fondateurs
- **Éditeur** : Membres actifs qui publient du contenu

---

## 🔒 Sécurité

### Row Level Security (RLS)

Les policies Supabase garantissent que :
- ✅ Tout le monde peut **voir** les admins d'une association
- ✅ Seuls les **présidents** peuvent **modifier** les admins
- ✅ Les rôles sont vérifiés côté serveur

### Vérifications Côté Client

Le hook `useAssociationPermissions` vérifie les permissions côté client pour :
- Afficher/masquer les boutons d'actions
- Activer/désactiver les fonctionnalités
- Améliorer l'UX

**Mais la vraie sécurité est côté serveur (RLS) !**

---

## 📚 Ressources

- **Hook principal** : `/hooks/useAssociationPermissions.ts`
- **Script SQL** : `/supabase-permissions-setup.sql`
- **Exemple d'usage** : `/app/association-detail.tsx`

---

## ❓ FAQ

**Q : Puis-je avoir plusieurs présidents ?**
R : Non, un seul président par association (contrainte UNIQUE). Tu peux promouvoir quelqu'un en président et te rétrograder en admin.

**Q : Un éditeur peut-il supprimer ses propres posts ?**
R : Non, seuls les présidents et admins peuvent supprimer des posts.

**Q : Que se passe-t-il si je supprime une association ?**
R : Tous les rôles dans `association_admins` sont automatiquement supprimés (CASCADE).

**Q : Comment devenir admin d'une association ?**
R : Le président de l'association doit t'ajouter manuellement (fonctionnalité à venir dans l'UI).

---

**Dernière mise à jour** : 2025-10-30
