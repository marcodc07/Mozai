import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface AddMemberModalProps {
  visible: boolean;
  associationId: string;
  existingMembersCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({
  visible,
  associationId,
  existingMembersCount,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setRole('');
    setPhotoUri(null);
  };

  const handleClose = () => {
    if (firstName.trim() || lastName.trim() || role.trim() || photoUri) {
      Alert.alert(
        'Abandonner ?',
        'Les informations saisies seront perdues',
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Abandonner',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à ta galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `member-${associationId}-${Date.now()}.${fileExt}`;
      const filePath = `association-logos/${fileName}`;

      // Lire le fichier en base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Convertir base64 en ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Upload sur Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('association-logos')
        .upload(filePath, byteArray.buffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        throw uploadError;
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('association-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload photo:', error);
      return null;
    }
  };

  const handleAdd = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires');
      return;
    }

    if (!role.trim()) {
      Alert.alert('Erreur', 'La fonction est obligatoire');
      return;
    }

    setLoading(true);

    try {
      let photoUrl: string | null = null;

      // Upload de la photo si présente
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri);
      }

      // Créer le nom complet
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // Ajouter le membre
      const { error } = await supabase
        .from('association_members')
        .insert([{
          association_id: associationId,
          name: fullName,
          role: role.trim(),
          photo_url: photoUrl,
          display_order: existingMembersCount + 1,
        }]);

      if (error) throw error;

      Alert.alert('Succès', 'Membre ajouté avec succès');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur ajout membre:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'ajouter le membre');
    } finally {
      setLoading(false);
    }
  };

  const canAdd = firstName.trim() && lastName.trim() && role.trim() && !loading;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ajouter un membre</Text>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!canAdd}
              style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.addButtonText, !canAdd && styles.addButtonTextDisabled]}>
                  Ajouter
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Photo */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Photo (optionnelle)</Text>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.photoButton}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                        stroke="#7566d9"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Circle cx={12} cy={7} r={4} stroke="#7566d9" strokeWidth={2} />
                    </Svg>
                    <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
                  </View>
                )}
                {photoUri && (
                  <View style={styles.photoEditBadge}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                        stroke="#ffffff"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Informations */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Informations</Text>

              {/* Prénom */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Ex: Marie"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  maxLength={50}
                />
              </View>

              {/* Nom */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Ex: Dupont"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  maxLength={50}
                />
              </View>

              {/* Fonction */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fonction *</Text>
                <TextInput
                  style={styles.input}
                  value={role}
                  onChangeText={setRole}
                  placeholder="Ex: Président(e), Trésorier(ère), Secrétaire..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  maxLength={100}
                />
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
                <Path d="M12 16v-4M12 8h.01" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.infoText}>
                Les membres du bureau seront affichés dans la section "À propos" de l'association
              </Text>
            </View>

            {/* Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7566d9',
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  addButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(117, 102, 217, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7566d9',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7566d9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#23243b',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(117, 102, 217, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 19,
  },
});
