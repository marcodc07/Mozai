import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
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
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AssociationLogo from './AssociationLogo';

interface EditAssociationModalProps {
  visible: boolean;
  association: any;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  '#7566d9', // Violet principal
  '#5b4fc9', // Violet foncé
  '#ec4899', // Rose
  '#f59e0b', // Orange
  '#10b981', // Vert
  '#3b82f6', // Bleu
  '#8b5cf6', // Violet clair
  '#ef4444', // Rouge
];

export default function EditAssociationModal({
  visible,
  association,
  onClose,
  onSuccess,
}: EditAssociationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'admins' | 'recrutement'>('info');

  // Infos de base
  const [name, setName] = useState(association?.name || '');
  const [shortDescription, setShortDescription] = useState(association?.short_description || '');
  const [longDescription, setLongDescription] = useState(association?.long_description || '');
  const [selectedColor, setSelectedColor] = useState(association?.color || '#7566d9');
  const [logoUri, setLogoUri] = useState<string | null>(null);

  // Recrutement
  const [recruitmentVisible, setRecruitmentVisible] = useState(association?.recruitment_visible || false);
  const [recruitmentOpen, setRecruitmentOpen] = useState(association?.recruitment_open || false);
  const [recruitmentDescription, setRecruitmentDescription] = useState(association?.recruitment_description || '');

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
      setLogoUri(result.assets[0].uri);
    }
  };

  const uploadLogo = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${association.id}-${Date.now()}.${fileExt}`;
      const filePath = `association-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload logo:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    if (!shortDescription.trim()) {
      Alert.alert('Erreur', 'La description courte est obligatoire');
      return;
    }

    setLoading(true);

    try {
      let logoUrl = association.profile_photo_url;

      // Upload du nouveau logo si sélectionné
      if (logoUri) {
        const uploadedUrl = await uploadLogo(logoUri);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      // Mise à jour de l'association
      const { error } = await supabase
        .from('associations')
        .update({
          name: name.trim(),
          short_description: shortDescription.trim(),
          long_description: longDescription.trim(),
          description: shortDescription.trim(), // Pour compatibilité
          color: selectedColor,
          profile_photo_url: logoUrl,
          recruitment_visible: recruitmentVisible,
          recruitment_open: recruitmentOpen,
          recruitment_description: recruitmentDescription.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', association.id);

      if (error) throw error;

      Alert.alert('Succès', 'Les modifications ont été enregistrées');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder les modifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier l'association</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.tabActive]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
                Informations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'recrutement' && styles.tabActive]}
              onPress={() => setActiveTab('recrutement')}
            >
              <Text style={[styles.tabText, activeTab === 'recrutement' && styles.tabTextActive]}>
                Recrutement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'admins' && styles.tabActive]}
              onPress={() => setActiveTab('admins')}
            >
              <Text style={[styles.tabText, activeTab === 'admins' && styles.tabTextActive]}>
                Équipe
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* TAB INFORMATIONS */}
              {activeTab === 'info' && (
                <View style={styles.section}>
                  {/* Logo */}
                  <Text style={styles.sectionTitle}>Logo</Text>
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.logoButton}>
                    <AssociationLogo
                      name={name}
                      logoUrl={logoUri || association.profile_photo_url}
                      emoji={association.logo_emoji}
                      size={80}
                    />
                    <View style={styles.logoEditBadge}>
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
                  </TouchableOpacity>

                  {/* Nom */}
                  <Text style={styles.label}>Nom de l'association *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: BDE ISEG"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    maxLength={50}
                  />

                  {/* Description courte */}
                  <Text style={styles.label}>Description courte *</Text>
                  <TextInput
                    style={styles.input}
                    value={shortDescription}
                    onChangeText={setShortDescription}
                    placeholder="Phrase d'accroche (max 100 caractères)"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    maxLength={100}
                  />
                  <Text style={styles.charCount}>{shortDescription.length}/100</Text>

                  {/* Description longue */}
                  <Text style={styles.label}>Description complète</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={longDescription}
                    onChangeText={setLongDescription}
                    placeholder="Description détaillée de l'association, ses missions, ses valeurs..."
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />

                  {/* Couleur */}
                  <Text style={styles.label}>Couleur de l'association</Text>
                  <View style={styles.colorPicker}>
                    {COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setSelectedColor(color)}
                      >
                        {selectedColor === color && (
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
              )}

              {/* TAB RECRUTEMENT */}
              {activeTab === 'recrutement' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Paramètres de recrutement</Text>

                  {/* Afficher le recrutement */}
                  <View style={styles.switchRow}>
                    <View style={styles.switchLeft}>
                      <Text style={styles.switchLabel}>Afficher le recrutement</Text>
                      <Text style={styles.switchSubtext}>
                        Les étudiants pourront voir que vous recrutez
                      </Text>
                    </View>
                    <Switch
                      value={recruitmentVisible}
                      onValueChange={setRecruitmentVisible}
                      trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#7566d9' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {recruitmentVisible && (
                    <>
                      {/* Statut du recrutement */}
                      <View style={styles.switchRow}>
                        <View style={styles.switchLeft}>
                          <Text style={styles.switchLabel}>Recrutement ouvert</Text>
                          <Text style={styles.switchSubtext}>
                            {recruitmentOpen ? 'Les candidatures sont acceptées' : 'Les candidatures sont fermées'}
                          </Text>
                        </View>
                        <Switch
                          value={recruitmentOpen}
                          onValueChange={setRecruitmentOpen}
                          trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10b981' }}
                          thumbColor="#ffffff"
                        />
                      </View>

                      {/* Description du recrutement */}
                      <Text style={styles.label}>Message de recrutement</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={recruitmentDescription}
                        onChangeText={setRecruitmentDescription}
                        placeholder="Décris les postes recherchés, les profils attendus..."
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </>
                  )}
                </View>
              )}

              {/* TAB ÉQUIPE */}
              {activeTab === 'admins' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Gestion de l'équipe</Text>
                  <View style={styles.comingSoon}>
                    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                    <Text style={styles.comingSoonText}>Bientôt disponible</Text>
                    <Text style={styles.comingSoonSubtext}>
                      Tu pourras ajouter des admins et gérer les permissions
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#7566d9',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabTextActive: {
    color: '#7566d9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
  },
  logoButton: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7566d9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#23243b',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    marginTop: 16,
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
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
    textAlign: 'right',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  switchLeft: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});