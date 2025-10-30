import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
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
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [color, setColor] = useState('#7566d9');

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

  // Fonction pour picker une image
  const pickImage = async () => {
    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à tes photos');
      return;
    }

    // Ouvrir le picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Carré
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingImage(true);

      try {
        // Redimensionner l'image à 512x512
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 512, height: 512 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setLogoUri(manipulatedImage.uri);
      } catch (error) {
        console.error('Erreur manipulation image:', error);
        Alert.alert('Erreur', 'Impossible de traiter l\'image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Upload l'image sur Supabase Storage
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      // Générer un nom unique
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `logos/${fileName}`;

      // Lire le fichier en base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Décoder base64 en ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Upload sur Supabase
      const { error: uploadError } = await supabase.storage
        .from('association-logos')
        .upload(filePath, byteArray.buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        return null;
      }

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from('association-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  };

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

    // Upload l'image si elle existe
    let logoUrl: string | null = null;
    if (logoUri) {
      logoUrl = await uploadImage(logoUri);
      if (!logoUrl) {
        setLoading(false);
        Alert.alert('Erreur', 'Impossible d\'uploader le logo');
        return;
      }
    }

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
          profile_photo_url: logoUrl,
          logo_emoji: logoUrl ? null : name.trim().charAt(0).toUpperCase(), // Emoji de fallback
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

    if (assoError) {
      setLoading(false);
      console.error('Erreur création asso:', assoError);
      Alert.alert('Erreur', assoError.message);
      return;
    }

    // Ajouter le créateur comme président dans association_admins
    const { error: adminError } = await supabase
      .from('association_admins')
      .insert([
        {
          association_id: assoData.id,
          user_id: user.id,
          role: 'president',
        },
      ]);

    setLoading(false);

    if (adminError) {
      console.error('Erreur ajout président:', adminError);
      // Ne pas bloquer si erreur, l'asso est déjà créée
    }

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
            setLogoUri(null);
            setColor('#7566d9');

            onSuccess();
            onClose();
          },
        },
      ]
    );
  };

  // Générer l'initiale pour l'avatar
  const getInitial = () => {
    return name.trim().charAt(0).toUpperCase() || 'A';
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
              
              {/* Logo */}
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                style={styles.previewLogo}
              >
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logoImage} />
                ) : (
                  <LinearGradient
                    colors={['#7566d9', '#a7bdd9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                  >
                    <Text style={styles.logoInitial}>{getInitial()}</Text>
                  </LinearGradient>
                )}
                
                {/* Badge "modifier" */}
                <View style={styles.editBadge}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="#ffffff"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                      stroke="#ffffff"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </TouchableOpacity>

              <View style={styles.previewContent}>
                <Text style={styles.previewName}>
                  {name.trim() || 'Nom de l\'association'}
                </Text>
                <Text style={styles.previewDescription}>
                  {shortDescription.trim() || 'Description courte'}
                </Text>
              </View>
            </View>

            {/* Upload hint */}
            <Text style={styles.uploadHint}>
              📷 Clique sur le logo pour ajouter une photo
            </Text>

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

            {/* Couleur */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Couleur principale</Text>
              <View style={styles.colorGrid}>
                {colors.map((colorOption, index) => (
                  <TouchableOpacity
                    key={`color-${index}`}
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
              disabled={loading || uploadingImage}
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
    marginBottom: 16,
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
    borderWidth: 4,
    borderColor: '#23243b',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7566d9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#23243b',
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
  uploadHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
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