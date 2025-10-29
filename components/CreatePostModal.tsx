import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface CreatePostModalProps {
  visible: boolean;
  associationId: string;
  associationName: string;
  associationEmoji: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CHARACTERS = 500;

export default function CreatePostModal({
  visible,
  associationId,
  associationName,
  associationEmoji,
  onClose,
  onSuccess,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setContent('');
    setIsPinned(false);
    setImageUri(null);
  };

  const handleClose = () => {
    if (content.trim() || imageUri) {
      Alert.alert(
        'Abandonner la publication ?',
        'Ton contenu sera perdu',
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
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${associationId}-${Date.now()}.${fileExt}`;
      const filePath = `association-posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Erreur', 'Écris quelque chose ou ajoute une image');
      return;
    }

    if (content.length > MAX_CHARACTERS) {
      Alert.alert('Erreur', `Le texte ne peut pas dépasser ${MAX_CHARACTERS} caractères`);
      return;
    }

    setLoading(true);

    try {
      let mediaUrl: string | null = null;

      // Upload de l'image si présente
      if (imageUri) {
        mediaUrl = await uploadImage(imageUri);
      }

      // Création du post
      const postData: any = {
        association_id: associationId,
        author_id: user?.id,
        content: content.trim(),
        is_pinned: isPinned,
      };

      // Ajouter media_url seulement si présent
      if (mediaUrl) {
        postData.media_url = mediaUrl;
      }

      const { error } = await supabase
        .from('association_posts')
        .insert([postData]);

      if (error) throw error;

      Alert.alert('Succès', 'Publication créée avec succès');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur création post:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la publication');
    } finally {
      setLoading(false);
    }
  };

  const canPublish = (content.trim() || imageUri) && content.length <= MAX_CHARACTERS && !loading;

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
            <Text style={styles.headerTitle}>Nouvelle publication</Text>
            <TouchableOpacity
              onPress={handlePublish}
              disabled={!canPublish}
              style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.publishButtonText, !canPublish && styles.publishButtonTextDisabled]}>
                  Publier
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Association info */}
            <View style={styles.associationHeader}>
              <Text style={styles.associationEmoji}>{associationEmoji}</Text>
              <View>
                <Text style={styles.associationName}>{associationName}</Text>
                <Text style={styles.associationSubtext}>Publication publique</Text>
              </View>
            </View>

            {/* Text input */}
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Quoi de neuf ?"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              textAlignVertical="top"
              autoFocus
              maxLength={MAX_CHARACTERS}
            />

            {/* Character counter */}
            <View style={styles.counterRow}>
              <Text style={[
                styles.charCounter,
                content.length > MAX_CHARACTERS * 0.9 && styles.charCounterWarning,
                content.length >= MAX_CHARACTERS && styles.charCounterError,
              ]}>
                {content.length}/{MAX_CHARACTERS}
              </Text>
            </View>

            {/* Image preview */}
            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                  activeOpacity={0.8}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={10} fill="#000000" opacity={0.6} />
                    <Path d="M15 9l-6 6M9 9l6 6" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)']}
                  style={styles.actionGradient}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="#7566d9"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.actionText}>
                    {imageUri ? 'Changer l\'image' : 'Ajouter une image'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Pin option */}
            <View style={styles.optionCard}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill={isPinned ? "#7566d9" : "none"}
                      stroke="#7566d9"
                      strokeWidth={2}
                    />
                  </Svg>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Épingler la publication</Text>
                  <Text style={styles.optionSubtext}>
                    Afficher en haut de ton profil d'association
                  </Text>
                </View>
              </View>
              <Switch
                value={isPinned}
                onValueChange={setIsPinned}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#7566d9' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Info card */}
            <View style={styles.infoCard}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
                <Path d="M12 16v-4M12 8h.01" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.infoText}>
                Ta publication sera visible par tous les followers de l'association
              </Text>
            </View>

            {/* Spacing for keyboard */}
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
  publishButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7566d9',
  },
  publishButtonDisabled: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  publishButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  associationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  associationEmoji: {
    fontSize: 48,
  },
  associationName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  associationSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  textInput: {
    fontSize: 17,
    color: '#ffffff',
    lineHeight: 26,
    minHeight: 150,
    marginBottom: 12,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  charCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  charCounterWarning: {
    color: '#f59e0b',
  },
  charCounterError: {
    color: '#ef4444',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7566d9',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
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
