import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import Svg, { Path } from 'react-native-svg';

interface CreateAssociationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAssociationModal({
  visible,
  onClose,
  onSuccess,
}: CreateAssociationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [emoji, setEmoji] = useState('🎉');
  const [color, setColor] = useState('#7566d9');

  // Emojis populaires pour associations
  const popularEmojis = [
    '🎉', '🎭', '🎨', '🎵', '⚽', '🏀', '🎮', '📚',
    '🧪', '💡', '🌍', '🎬', '📷', '🎤', '🎸', '🏆',
    '🚀', '💻', '🎓', '🔬', '🎪', '🎨', '🏛️', '🌟',
  ];

  // Couleurs prédéfinies
  const colors = [
    { name: 'Violet', value: '#7566d9' },
    { name: 'Bleu', value: '#3b82f6' },
    { name: 'Vert', value: '#10b981' },
    { name: 'Rouge', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Indigo', value: '#6366f1' },
  ];

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Tu dois être connecté');
      return;
    }

    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'association est requis');
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 3 caractères');
      return;
    }

    if (!shortDescription.trim()) {
      Alert.alert('Erreur', 'La description courte est requise');
      return;
    }

    setLoading(true);

    // Récupérer l'university_id du user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de récupérer ton profil');
      return;
    }

    // Créer l'association
    const { data: assoData, error: assoError } = await supabase
      .from('associations')
      .insert([
        {
          name: name.trim(),
          short_description: shortDescription.trim(),
          long_description: longDescription.trim() || shortDescription.trim(),
          logo_emoji: emoji,
          color: color,
          university_id: profileData.university_id,
          created_by: user.id,
          recruitment_status: 'closed',
          comments_enabled: true,
          likes_enabled: true,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (assoError) {
      console.error('Erreur création asso:', assoError);
      Alert.alert('Erreur', assoError.message);
    } else {
      Alert.alert(
        '🎉 Association créée !',
        `${name} est maintenant en ligne. Tu peux commencer à la gérer !`,
        [
          {
            text: 'Super !',
            onPress: () => {
              // Reset form
              setName('');
              setShortDescription('');
              setLongDescription('');
              setEmoji('🎉');
              setColor('#7566d9');
              
              onSuccess();
              onClose();
            },
          },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#1a1b2e', '#16213e', '#23243b']}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Créer une association</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Preview Card */}
            <View style={styles.previewCard}>
              <View style={[styles.previewHeader, { backgroundColor: color }]} />
              <View style={styles.previewLogo}>
                <Text style={styles.previewEmoji}>{emoji}</Text>
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewName}>
                  {name.trim() || 'Nom de l\'association'}
                </Text>
                <Text style={styles.previewDescription}>
                  {shortDescription.trim() || 'Description courte'}
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations principales</Text>

              {/* Nom */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Nom de l'association <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: BDE, Bureau des Sports..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={name}
                  onChangeText={setName}
                  maxLength={50}
                  autoCapitalize="words"
                />
                <Text style={styles.charCount}>{name.length}/50</Text>
              </View>

              {/* Description courte */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Description courte <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Décris ton association en quelques mots..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={shortDescription}
                  onChangeText={setShortDescription}
                  maxLength={100}
                  multiline
                  numberOfLines={2}
                />
                <Text style={styles.charCount}>{shortDescription.length}/100</Text>
              </View>

              {/* Description longue */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description complète (optionnel)</Text>
                <TextInput
                  style={[styles.input, styles.textAreaLarge]}
                  placeholder="Explique la mission, les objectifs, les activités..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={longDescription}
                  onChangeText={setLongDescription}
                  maxLength={500}
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.charCount}>{longDescription.length}/500</Text>
              </View>
            </View>

            {/* Emoji */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Logo (emoji)</Text>
              <View style={styles.emojiGrid}>
                {popularEmojis.map((emojiOption) => (
                  <TouchableOpacity
                    key={emojiOption}
                    onPress={() => setEmoji(emojiOption)}
                    activeOpacity={0.7}
                    style={[
                      styles.emojiButton,
                      emoji === emojiOption && styles.emojiButtonActive,
                    ]}
                  >
                    <Text style={styles.emojiButtonText}>{emojiOption}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Couleur */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Couleur principale</Text>
              <View style={styles.colorGrid}>
                {colors.map((colorOption) => (
                  <TouchableOpacity
                    key={colorOption.value}
                    onPress={() => setColor(colorOption.value)}
                    activeOpacity={0.7}
                    style={[
                      styles.colorButton,
                      { backgroundColor: colorOption.value },
                      color === colorOption.value && styles.colorButtonActive,
                    ]}
                  >
                    {color === colorOption.value && (
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke="#ffffff"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.ctaButton}
            >
              <LinearGradient
                colors={['#7566d9', '#5b4fc9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Créer mon association</Text>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="#ffffff"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'visible',
    marginBottom: 24,
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewHeader: {
    height: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  previewLogo: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#23243b',
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewContent: {
    padding: 20,
    paddingTop: 50,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 6,
    textAlign: 'right',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    borderColor: '#7566d9',
  },
  emojiButtonText: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: '#ffffff',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
});