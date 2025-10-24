import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

type CourseModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  courseToEdit?: any;
};

const COURSE_TYPES = ['CM', 'TD', 'TP', 'Online'];
const DAYS = [
  { label: 'Lundi', value: 1 },
  { label: 'Mardi', value: 2 },
  { label: 'Mercredi', value: 3 },
  { label: 'Jeudi', value: 4 },
  { label: 'Vendredi', value: 5 },
  { label: 'Samedi', value: 6 },
  { label: 'Dimanche', value: 0 },
];

const RECURRENCE_OPTIONS = [
  { label: 'Une seule fois', value: 'once' },
  { label: 'Chaque semaine', value: 'weekly' },
  { label: 'Chaque mois', value: 'monthly' },
];

const COLORS = [
  '#7566d9',
  '#a7bdd9',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#6366f1',
];

export default function CourseModal({ visible, onClose, onSave, courseToEdit }: CourseModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);

  const [title, setTitle] = useState(courseToEdit?.title || '');
  const [professor, setProfessor] = useState(courseToEdit?.professor || '');
  const [location, setLocation] = useState(courseToEdit?.location || '');
  const [courseType, setCourseType] = useState(courseToEdit?.course_type || 'CM');
  const [dayOfWeek, setDayOfWeek] = useState(courseToEdit?.day_of_week || 1);
  const [startTime, setStartTime] = useState(courseToEdit?.start_time || '09:00');
  const [endTime, setEndTime] = useState(courseToEdit?.end_time || '11:00');
  const [color, setColor] = useState(courseToEdit?.color || '#7566d9');
  const [recurrenceType, setRecurrenceType] = useState(courseToEdit?.recurrence_type || 'weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(courseToEdit?.recurrence_end_date || '');

  const handleSave = async () => {
    if (!title || !startTime || !endTime) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le titre et les horaires');
      return;
    }

    setLoading(true);

    const courseData = {
      user_id: user?.id,
      title: title.trim(),
      professor: professor.trim() || null,
      location: location.trim() || null,
      course_type: courseType,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      color,
      recurrence_type: recurrenceType,
      recurrence_end_date: recurrenceEndDate || null,
    };

    let error;

    if (courseToEdit) {
      // Modifier un cours existant
      const result = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseToEdit.id);
      error = result.error;
    } else {
      // Créer un nouveau cours
      const result = await supabase.from('courses').insert([courseData]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Succès', courseToEdit ? 'Cours modifié !' : 'Cours ajouté !');
      resetForm();
      onSave();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!courseToEdit) return;

    Alert.alert(
      'Supprimer le cours',
      'Es-tu sûr de vouloir supprimer ce cours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from('courses')
              .delete()
              .eq('id', courseToEdit.id);

            setLoading(false);

            if (error) {
              Alert.alert('Erreur', error.message);
            } else {
              Alert.alert('Succès', 'Cours supprimé !');
              resetForm();
              onSave();
              onClose();
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setTitle('');
    setProfessor('');
    setLocation('');
    setCourseType('CM');
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('11:00');
    setColor('#7566d9');
    setRecurrenceType('weekly');
    setRecurrenceEndDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1b2e', '#16213e', '#23243b']}
            style={styles.modalGradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {courseToEdit ? 'Modifier le cours' : 'Ajouter un cours'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Titre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Matière *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Mathématiques"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>

              {/* Professeur */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Professeur</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Prof. Durand"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={professor}
                    onChangeText={setProfessor}
                  />
                </View>
              </View>

              {/* Salle */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Salle</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Amphi A"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              {/* Type de cours */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type de cours</Text>
                <View style={styles.chipsContainer}>
                  {COURSE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        courseType === type && styles.chipActive,
                      ]}
                      onPress={() => setCourseType(type)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          courseType === type && styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Jour */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jour de la semaine</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.daysScroll}
                >
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayChip,
                        dayOfWeek === day.value && styles.dayChipActive,
                      ]}
                      onPress={() => setDayOfWeek(day.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          dayOfWeek === day.value && styles.dayChipTextActive,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Horaires */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Début *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="09:00"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={startTime}
                      onChangeText={setStartTime}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Fin *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="11:00"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={endTime}
                      onChangeText={setEndTime}
                    />
                  </View>
                </View>
              </View>

              {/* Récurrence */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Récurrence</Text>
                <View style={styles.chipsContainer}>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.chip,
                        recurrenceType === option.value && styles.chipActive,
                      ]}
                      onPress={() => setRecurrenceType(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          recurrenceType === option.value && styles.chipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date de fin (si récurrence) */}
              {recurrenceType !== 'once' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Jusqu'au (optionnel)</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="2024-12-31"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={recurrenceEndDate}
                      onChangeText={setRecurrenceEndDate}
                    />
                  </View>
                  <Text style={styles.hint}>Format: AAAA-MM-JJ</Text>
                </View>
              )}

              {/* Couleur */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.colorsContainer}>
                  {COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        color === c && styles.colorCircleActive,
                      ]}
                      onPress={() => setColor(c)}
                      activeOpacity={0.7}
                    >
                      {color === c && (
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

              {/* Boutons */}
              <View style={styles.buttonsContainer}>
                {courseToEdit && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.saveButton, !courseToEdit && { flex: 1 }]}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#7566d9', '#5b4fc9']}
                    style={styles.saveButtonGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {courseToEdit ? 'Modifier' : 'Ajouter'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: '#7566d9',
    borderColor: '#7566d9',
  },
  chipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  daysScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dayChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayChipActive: {
    backgroundColor: '#7566d9',
    borderColor: '#7566d9',
  },
  dayChipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});