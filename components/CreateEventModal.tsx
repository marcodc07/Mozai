import AddTicketModal from '@/components/AddTicketModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Ticket {
  name: string;
  available: number;
  price: number;
}

export default function CreateEventModal({ visible, onClose, onSuccess }: CreateEventModalProps) {
  const { user } = useAuth();
  const [myAssociations, setMyAssociations] = useState<any[]>([]);
  const [selectedAssoId, setSelectedAssoId] = useState<string | null>(null);
  const [organizerName, setOrganizerName] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [addTicketModalVisible, setAddTicketModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAssoPicker, setShowAssoPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadMyAssociations();
    }
  }, [visible]);

  const loadMyAssociations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('association_admins')
      .select('association_id, associations(id, name, logo_emoji)')
      .eq('user_id', user.id);

    if (!error && data) {
      const assos = data.map(item => item.associations).filter(Boolean);
      setMyAssociations(assos as any[]);
    }
  };

  const resetForm = () => {
    setSelectedAssoId(null);
    setOrganizerName('');
    setTitle('');
    setDate(new Date());
    setTime(new Date());
    setLocation('');
    setDescription('');
    setCoverImageUri(null);
    setTickets([]);
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
      setCoverImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `event-${Date.now()}.${fileExt}`;
      const filePath = `association-logos/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const { error: uploadError } = await supabase.storage
        .from('association-logos')
        .upload(filePath, byteArray.buffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('association-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  };

  const handleAddTicket = (ticket: Ticket) => {
    setTickets([...tickets, ticket]);
  };

  const handleRemoveTicket = (index: number) => {
    Alert.alert('Supprimer le billet', 'Êtes-vous sûr de vouloir supprimer ce billet ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          const newTickets = tickets.filter((_, i) => i !== index);
          setTickets(newTickets);
        },
      },
    ]);
  };

  const handleCreate = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Erreur', 'Le lieu est obligatoire');
      return;
    }

    if (!selectedAssoId && !organizerName.trim()) {
      Alert.alert('Erreur', 'Vous devez soit choisir une association, soit indiquer le nom de l\'organisateur');
      return;
    }

    if (tickets.length === 0) {
      Alert.alert('Erreur', 'Vous devez ajouter au moins un type de billet');
      return;
    }

    setLoading(true);

    try {
      // Upload de l'image si présente
      let coverImageUrl = null;
      if (coverImageUri && coverImageUri.startsWith('file://')) {
        coverImageUrl = await uploadImage(coverImageUri);
        if (!coverImageUrl) {
          Alert.alert('Erreur', 'Impossible d\'uploader l\'image');
          setLoading(false);
          return;
        }
      }

      // Récupérer l'université de l'utilisateur
      const { data: profileData } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('id', user?.id)
        .single();

      // Créer l'événement
      const eventData: any = {
        title: title.trim(),
        description: description.trim() || null,
        date: date.toISOString().split('T')[0],
        time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:00`,
        location: location.trim(),
        cover_image_url: coverImageUrl,
        association_id: selectedAssoId,
        organizer_name: selectedAssoId ? null : organizerName.trim(),
        university_id: profileData?.university_id,
      };

      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (eventError) throw eventError;

      // Créer les billets
      const ticketInserts = tickets.map(ticket => ({
        event_id: eventResult.id,
        name: ticket.name,
        price: ticket.price,
        available: ticket.available,
      }));

      const { error: ticketsError } = await supabase
        .from('event_ticket_types')
        .insert(ticketInserts);

      if (ticketsError) throw ticketsError;

      Alert.alert('Succès', 'Événement créé avec succès !');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur création événement:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const selectedAsso = myAssociations.find(a => a.id === selectedAssoId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Créer un événement</Text>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading || !title.trim() || !location.trim() || tickets.length === 0}
              style={[
                styles.createButton,
                (loading || !title.trim() || !location.trim() || tickets.length === 0) && styles.createButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.createButtonText,
                    (!title.trim() || !location.trim() || tickets.length === 0) && styles.createButtonTextDisabled,
                  ]}
                >
                  Créer
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Association */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Association</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowAssoPicker(!showAssoPicker)}
                activeOpacity={0.7}
              >
                <View style={styles.pickerButtonContent}>
                  {selectedAsso ? (
                    <>
                      <Text style={styles.pickerButtonEmoji}>{selectedAsso.logo_emoji}</Text>
                      <Text style={styles.pickerButtonText}>{selectedAsso.name}</Text>
                    </>
                  ) : (
                    <Text style={styles.pickerButtonPlaceholder}>Aucune association</Text>
                  )}
                </View>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d={showAssoPicker ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              {showAssoPicker && (
                <View style={styles.picker}>
                  <TouchableOpacity
                    style={styles.pickerOption}
                    onPress={() => {
                      setSelectedAssoId(null);
                      setShowAssoPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerOptionText}>Aucune association</Text>
                  </TouchableOpacity>
                  {myAssociations.length === 0 ? (
                    <View style={styles.emptyPicker}>
                      <Text style={styles.emptyPickerText}>Vous n'êtes admin d'aucune association</Text>
                    </View>
                  ) : (
                    myAssociations.map(asso => (
                      <TouchableOpacity
                        key={asso.id}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSelectedAssoId(asso.id);
                          setShowAssoPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerOptionEmoji}>{asso.logo_emoji}</Text>
                        <Text style={styles.pickerOptionText}>{asso.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* Nom de l'organisateur (si pas d'asso) */}
            {!selectedAssoId && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom de l'organisateur *</Text>
                <TextInput
                  style={styles.input}
                  value={organizerName}
                  onChangeText={setOrganizerName}
                  placeholder="Ex: BDE Assas"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                />
              </View>
            )}

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
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x={3} y={4} width={18} height={18} rx={2} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                  <Line x1={16} y1={2} x2={16} y2={6} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                  <Line x1={8} y1={2} x2={8} y2={6} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                </Svg>
                <Text style={styles.dateButtonText}>
                  {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setDate(selectedDate);
                }}
                minimumDate={new Date()}
              />
            )}

            {/* Heure */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Heure *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={10} stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
                  <Path d="M12 6v6l4 2" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} strokeLinecap="round" />
                </Svg>
                <Text style={styles.dateButtonText}>
                  {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}

            {/* Lieu */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lieu / Adresse *</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Ex: 92 rue d'Assas, 75006 Paris"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>À propos</Text>
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

            {/* Image de couverture */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image de couverture</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} activeOpacity={0.8}>
                {coverImageUri ? (
                  <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                      <Rect x={3} y={3} width={18} height={18} rx={2} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
                      <Circle cx={8.5} cy={8.5} r={1.5} fill="rgba(255, 255, 255, 0.5)" />
                      <Path d="M21 15l-5-5L5 21" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.imagePickerText}>Ajouter une image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Billets */}
            <View style={styles.ticketsSection}>
              <View style={styles.ticketsHeader}>
                <Text style={styles.label}>Billets *</Text>
                <Text style={styles.ticketsCount}>{tickets.length}</Text>
              </View>

              {tickets.map((ticket, index) => (
                <View key={index} style={styles.ticketCard}>
                  <View style={styles.ticketCardLeft}>
                    <Text style={styles.ticketName}>{ticket.name}</Text>
                    <Text style={styles.ticketDetails}>
                      {ticket.available} places • {ticket.price === 0 ? 'Gratuit' : `${ticket.price}€`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveTicket(index)} activeOpacity={0.7}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addTicketButton}
                onPress={() => setAddTicketModalVisible(true)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)']} style={styles.addTicketGradient}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Line x1={12} y1={5} x2={12} y2={19} stroke="#7566d9" strokeWidth={2} strokeLinecap="round" />
                    <Line x1={5} y1={12} x2={19} y2={12} stroke="#7566d9" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                  <Text style={styles.addTicketText}>Ajouter un billet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Modal Ajout Billet */}
      <AddTicketModal
        visible={addTicketModalVisible}
        onClose={() => setAddTicketModalVisible(false)}
        onAdd={handleAddTicket}
      />
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
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7566d9',
  },
  createButtonDisabled: { backgroundColor: 'rgba(117, 102, 217, 0.3)' },
  createButtonText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  createButtonTextDisabled: { opacity: 0.5 },
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerButtonEmoji: { fontSize: 20 },
  pickerButtonText: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  pickerButtonPlaceholder: { fontSize: 16, color: 'rgba(255, 255, 255, 0.4)' },
  picker: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickerOptionEmoji: { fontSize: 18 },
  pickerOptionText: { fontSize: 15, color: '#ffffff', fontWeight: '500' },
  emptyPicker: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyPickerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  dateButton: {
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
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  imagePickerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  imagePickerPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  ticketsSection: {
    marginBottom: 24,
  },
  ticketsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  ticketCardLeft: {
    flex: 1,
  },
  ticketName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  ticketDetails: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  addTicketButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(117, 102, 217, 0.3)',
    marginTop: 8,
  },
  addTicketGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  addTicketText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7566d9',
  },
});
