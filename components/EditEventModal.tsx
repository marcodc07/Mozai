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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface EditEventModalProps {
  visible: boolean;
  event: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEventModal({
  visible,
  event,
  onClose,
  onSuccess,
}: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDate(event.date || '');
      setTime(event.time?.slice(0, 5) || '');
    }
  }, [event]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!date.trim()) {
      Alert.alert('Erreur', 'La date est obligatoire');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Erreur', 'Le lieu est obligatoire');
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim(),
        date: date.trim(),
        updated_at: new Date().toISOString(),
      };

      if (time.trim()) {
        updateData.time = time.trim() + ':00';
      }

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', event.id);

      if (error) throw error;

      Alert.alert('Succès', 'Événement modifié');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur modification événement:', error);
      Alert.alert('Erreur', error.message || 'Impossible de modifier l\'événement');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

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
            <Text style={styles.headerTitle}>Modifier l'événement</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !title.trim() || !date.trim() || !location.trim()}
              style={[
                styles.saveButton,
                (!title.trim() || !date.trim() || !location.trim() || loading) &&
                  styles.saveButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    (!title.trim() || !date.trim() || !location.trim()) &&
                      styles.saveButtonTextDisabled,
                  ]}
                >
                  Enregistrer
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Titre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titre de l'événement *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Soirée de rentrée"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              <View style={styles.inputWithIcon}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x={3}
                    y={4}
                    width={18}
                    height={18}
                    rx={2}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={2}
                  />
                  <Line x1={16} y1={2} x2={16} y2={6} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                  <Line x1={8} y1={2} x2={8} y2={6} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                </Svg>
                <TextInput
                  style={styles.inputText}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                />
              </View>
              <Text style={styles.hint}>Format: 2025-01-15</Text>
            </View>

            {/* Heure */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Heure</Text>
              <View style={styles.inputWithIcon}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={10} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                  <Path d="M12 6v6l4 2" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} strokeLinecap="round" />
                </Svg>
                <TextInput
                  style={styles.inputText}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                />
              </View>
              <Text style={styles.hint}>Format: 20:00</Text>
            </View>

            {/* Lieu */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lieu *</Text>
              <View style={styles.inputWithIcon}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={2}
                  />
                  <Circle cx={12} cy={10} r={3} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                </Svg>
                <TextInput
                  style={styles.inputText}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ex: 92 rue d'Assas"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description de l'événement..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.infoText}>
                Note : Pour modifier les tarifs, contacte l'équipe de développement.
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
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
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
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
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 19,
  },
});
