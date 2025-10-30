import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
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

interface EditMemberModalProps {
  visible: boolean;
  member: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMemberModal({
  visible,
  member,
  onClose,
  onSuccess,
}: EditMemberModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setRole(member.role || '');
      setPhotoUri(member.photo_url || null);
    }
  }, [member]);

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
      const fileName = `member-${member.id}-${Date.now()}.${fileExt}`;
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

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    if (!role.trim()) {
      Alert.alert('Erreur', 'La fonction est obligatoire');
      return;
    }

    setLoading(true);

    try {
      let photoUrl = member.photo_url;

      // Si une nouvelle photo a été sélectionnée et que c'est une URI locale
      if (photoUri && photoUri.startsWith('file://')) {
        const uploadedUrl = await uploadPhoto(photoUri);
        if (!uploadedUrl) {
          Alert.alert('Erreur', 'Impossible d\'uploader la photo');
          setLoading(false);
          return;
        }
        photoUrl = uploadedUrl;
      }

      // Mise à jour du membre
      const { error } = await supabase
        .from('association_members')
        .update({
          name: name.trim(),
          role: role.trim(),
          photo_url: photoUrl,
        })
        .eq('id', member.id);

      if (error) {
        throw error;
      }

      Alert.alert('Succès', 'Membre modifié');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur modification membre:', error);
      Alert.alert('Erreur', error.message || 'Impossible de modifier le membre');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le membre</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !name.trim() || !role.trim()}
              style={[
                styles.saveButton,
                (!name.trim() || !role.trim() || loading) && styles.saveButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    (!name.trim() || !role.trim()) && styles.saveButtonTextDisabled,
                  ]}
                >
                  Enregistrer
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Photo */}
            <View style={styles.photoSection}>
              <Text style={styles.label}>Photo</Text>
              <TouchableOpacity style={styles.photoContainer} onPress={pickImage} activeOpacity={0.8}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Circle cx={12} cy={7} r={4} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
                    </Svg>
                  </View>
                )}
                <View style={styles.photoOverlay}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="#ffffff"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle cx={12} cy={13} r={4} stroke="#ffffff" strokeWidth={2} />
                  </Svg>
                </View>
              </TouchableOpacity>
            </View>

            {/* Nom complet */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Marie Dupont"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            {/* Fonction */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fonction *</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="Ex: Présidente"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7566d9',
  },
  saveButtonDisabled: { backgroundColor: 'rgba(117, 102, 217, 0.3)' },
  saveButtonText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  saveButtonTextDisabled: { opacity: 0.5 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  photoSection: { alignItems: 'center', marginBottom: 32 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: { marginBottom: 24 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
