import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import Svg, { Path } from 'react-native-svg';

interface EditPostModalProps {
  visible: boolean;
  post: any;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CHARACTERS = 500;

export default function EditPostModal({
  visible,
  post,
  onClose,
  onSuccess,
}: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setIsPinned(post.is_pinned || false);
    }
  }, [post]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Le contenu ne peut pas être vide');
      return;
    }

    if (content.length > MAX_CHARACTERS) {
      Alert.alert('Erreur', `Le texte ne peut pas dépasser ${MAX_CHARACTERS} caractères`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('association_posts')
        .update({
          content: content.trim(),
          is_pinned: isPinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (error) throw error;

      Alert.alert('Succès', 'Publication modifiée');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur modification post:', error);
      Alert.alert('Erreur', error.message || 'Impossible de modifier la publication');
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

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
            <Text style={styles.headerTitle}>Modifier la publication</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !content.trim()}
              style={[styles.saveButton, (!content.trim() || loading) && styles.saveButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.saveButtonText, !content.trim() && styles.saveButtonTextDisabled]}>
                  Enregistrer
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Text input */}
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Contenu de la publication"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              textAlignVertical="top"
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
                    Afficher en haut du profil (max 3)
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

            {/* Note */}
            <View style={styles.infoCard}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.infoText}>
                Note : Les images ne peuvent pas être modifiées. Pour changer l'image, supprime cette publication et crée-en une nouvelle.
              </Text>
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
  content: { flex: 1, paddingHorizontal: 20 },
  textInput: {
    fontSize: 17,
    color: '#ffffff',
    lineHeight: 26,
    minHeight: 200,
    marginTop: 20,
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
  charCounterWarning: { color: '#f59e0b' },
  charCounterError: { color: '#ef4444' },
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
  optionTextContainer: { flex: 1 },
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
