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
import Svg, { Line } from 'react-native-svg';

interface ReservationModalProps {
  visible: boolean;
  event: any;
  ticketType: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function ReservationModal({
  visible,
  event,
  ticketType,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [participants, setParticipants] = useState<ParticipantData[]>([
    { firstName: '', lastName: '', email: '', phone: '' }
  ]);
  const [loading, setLoading] = useState(false);

  // Réinitialiser quand on ouvre le modal
  const handleOpen = () => {
    setQuantity(1);
    setCurrentParticipantIndex(0);
    setParticipants([{ firstName: '', lastName: '', email: '', phone: '' }]);
  };

  // Mettre à jour le nombre de participants
  const updateQuantity = (newQuantity: number) => {
    setQuantity(newQuantity);
    
    // Ajuster le tableau de participants
    const newParticipants = [...participants];
    if (newQuantity > participants.length) {
      // Ajouter des participants vides
      for (let i = participants.length; i < newQuantity; i++) {
        newParticipants.push({ firstName: '', lastName: '', email: '', phone: '' });
      }
    } else {
      // Retirer des participants
      newParticipants.splice(newQuantity);
    }
    setParticipants(newParticipants);
    
    // Ajuster l'index si nécessaire
    if (currentParticipantIndex >= newQuantity) {
      setCurrentParticipantIndex(newQuantity - 1);
    }
  };

  // Mettre les infos du user connecté
 const useMyInfo = async () => {
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  setParticipants(prevParticipants => {
    const newParticipants = [...prevParticipants];
    newParticipants[currentParticipantIndex] = {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: user.email || '',
      phone: prevParticipants[currentParticipantIndex].phone,
    };
    return newParticipants;
  });
};

  // Mettre à jour un participant
const updateParticipant = (field: keyof ParticipantData, value: string) => {
  setParticipants(prevParticipants => {
    const newParticipants = [...prevParticipants];
    newParticipants[currentParticipantIndex] = {
      ...newParticipants[currentParticipantIndex],
      [field]: value,
    };
    return newParticipants;
  });
};

  // Valider les données d'un participant
  const validateParticipant = (participant: ParticipantData): boolean => {
    if (!participant.firstName || !participant.lastName || !participant.email) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participant.email)) {
      return false;
    }

    return true;
  };

  // Passer au participant suivant ou réserver
  const handleNext = () => {
    const currentParticipant = participants[currentParticipantIndex];

    if (!validateParticipant(currentParticipant)) {
      Alert.alert('Informations incomplètes', 'Veuillez remplir tous les champs obligatoires avec des informations valides.');
      return;
    }

    if (currentParticipantIndex < quantity - 1) {
      // Passer au suivant
      setCurrentParticipantIndex(currentParticipantIndex + 1);
    } else {
      // C'est le dernier, on réserve
      handleReserve();
    }
  };

  // Revenir au participant précédent
  const handlePrevious = () => {
    if (currentParticipantIndex > 0) {
      setCurrentParticipantIndex(currentParticipantIndex - 1);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Tu dois être connecté pour réserver');
      return;
    }

    // Vérifier tous les participants
    for (let i = 0; i < participants.length; i++) {
      if (!validateParticipant(participants[i])) {
        Alert.alert('Erreur', `Les informations du participant ${i + 1} sont incomplètes ou invalides.`);
        setCurrentParticipantIndex(i);
        return;
      }
    }

    if (quantity > ticketType.available) {
      Alert.alert('Erreur', `Seulement ${ticketType.available} place(s) disponible(s)`);
      return;
    }

    setLoading(true);

    // Créer les réservations
    const reservations = participants.map((participant, index) => {
      const qrCode = `MOZAI-${event.id}-${user.id}-${Date.now()}-${index}`;
      return {
        user_id: user.id,
        event_id: event.id,
        ticket_type_id: ticketType.id,
        amount_paid: ticketType.price,
        qr_code: qrCode,
        attendee_first_name: participant.firstName,
        attendee_last_name: participant.lastName,
        attendee_email: participant.email,
        attendee_phone: participant.phone || null,
      };
    });

    const { data, error } = await supabase
      .from('event_registrations')
      .insert(reservations)
      .select();

    if (error) {
      setLoading(false);
      Alert.alert('Erreur', error.message);
      return;
    }

    // Décrémenter le nombre de places disponibles
    await supabase
      .from('event_ticket_types')
      .update({ available: ticketType.available - quantity })
      .eq('id', ticketType.id);

    // Incrémenter le nombre de participants
    await supabase
      .from('events')
      .update({ participants_count: event.participants_count + quantity })
      .eq('id', event.id);

    setLoading(false);

    Alert.alert(
      'Réservation confirmée ! 🎉',
      `${quantity} billet(s) réservé(s) pour ${ticketType.price > 0 ? `${ticketType.price * quantity}€` : 'gratuit'}. Vous recevrez un email de confirmation.`,
      [
        {
          text: 'OK',
          onPress: () => {
            onClose();
            onSuccess();
            // Reset
            handleOpen();
          },
        },
      ]
    );
  };

  if (!event || !ticketType) return null;

  const totalPrice = ticketType.price * quantity;
  const currentParticipant = participants[currentParticipantIndex];
  const isLastParticipant = currentParticipantIndex === quantity - 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1b2e', '#16213e', '#23243b']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Réservation</Text>
                <Text style={styles.headerSubtitle}>
                  {ticketType.name} • {event.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Line x1={18} y1={6} x2={6} y2={18} stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round"/>
                  <Line x1={6} y1={6} x2={18} y2={18} stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round"/>
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Nombre de billets */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nombre de billets</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => updateQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <Text style={styles.quantityMax}>max {ticketType.max_per_person}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      (quantity >= ticketType.max_per_person || quantity >= ticketType.available) && styles.quantityButtonDisabled
                    ]}
                    onPress={() => updateQuantity(Math.min(ticketType.max_per_person, ticketType.available, quantity + 1))}
                    disabled={quantity >= ticketType.max_per_person || quantity >= ticketType.available}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.availableText}>
                  {ticketType.available} place{ticketType.available > 1 ? 's' : ''} disponible{ticketType.available > 1 ? 's' : ''}
                </Text>
              </View>

              {/* Indicateur de progression */}
              {quantity > 1 && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressTitle}>
                    Participant {currentParticipantIndex + 1} sur {quantity}
                  </Text>
                  <View style={styles.progressBar}>
                    {Array.from({ length: quantity }).map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.progressDot,
                          index <= currentParticipantIndex && styles.progressDotActive,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Formulaire du participant actuel */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    {quantity > 1 ? `Participant ${currentParticipantIndex + 1}` : 'Informations personnelles'}
                  </Text>
                  <TouchableOpacity
                    style={styles.useMyInfoButton}
                    onPress={useMyInfo}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.useMyInfoText}>Utiliser mes infos</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Prénom *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={currentParticipant.firstName}
                      onChangeText={(text) => updateParticipant('firstName', text)}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Nom *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={currentParticipant.lastName}
                      onChangeText={(text) => updateParticipant('lastName', text)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="john.doe@example.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={currentParticipant.email}
                    onChangeText={(text) => updateParticipant('email', text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Téléphone (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+33 6 12 34 56 78"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={currentParticipant.phone}
                    onChangeText={(text) => updateParticipant('phone', text)}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>
              </View>

              {/* Résumé */}
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)']}
                  style={styles.summaryGradient}
                >
                  <Text style={styles.summaryTitle}>Résumé</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{ticketType.name}</Text>
                    <Text style={styles.summaryValue}>
                      {ticketType.price === 0 ? 'Gratuit' : `${ticketType.price}€`}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Quantité</Text>
                    <Text style={styles.summaryValue}>× {quantity}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotal}>Total</Text>
                    <Text style={styles.summaryTotalValue}>
                      {totalPrice === 0 ? 'Gratuit' : `${totalPrice.toFixed(2)}€`}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </ScrollView>

            {/* Footer avec boutons de navigation */}
            <View style={styles.footer}>
              <View style={styles.navigationButtons}>
                {currentParticipantIndex > 0 && (
                  <TouchableOpacity
                    style={styles.previousButton}
                    onPress={handlePrevious}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.previousButtonText}>← Précédent</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.nextButton, currentParticipantIndex === 0 && { flex: 1 }]}
                  onPress={handleNext}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7566d9', '#5b4fc9']}
                    style={styles.nextButtonGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.nextButtonText}>
                        {isLastParticipant 
                          ? (totalPrice === 0 ? 'Réserver gratuitement' : `Payer ${totalPrice.toFixed(2)}€`)
                          : 'Suivant →'
                        }
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    maxHeight: 450,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  useMyInfoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  useMyInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7566d9',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7566d9',
  },
  quantityDisplay: {
    alignItems: 'center',
    minWidth: 60,
  },
  quantityText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  quantityMax: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  availableText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#7566d9',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  summaryCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
    marginBottom: 8,
  },
  summaryGradient: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7566d9',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  nextButton: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
});