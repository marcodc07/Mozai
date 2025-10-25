import { LinearGradient } from 'expo-linear-gradient';
import {
    Alert,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface TicketDetailModalProps {
  visible: boolean;
  ticket: any;
  onClose: () => void;
}

export default function TicketDetailModal({
  visible,
  ticket,
  onClose,
}: TicketDetailModalProps) {
  if (!ticket) return null;

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mon billet pour ${ticket.event?.title}\n\nDate : ${formatEventDate(ticket.event?.date)}\nLieu : ${ticket.event?.location}\n\nCode : ${ticket.qr_code}`,
        title: `Billet - ${ticket.event?.title}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleCancel = () => {
    if (!ticket.event?.cancellation_allowed) {
      Alert.alert('Annulation impossible', 'Ce billet ne peut pas être annulé');
      return;
    }

    Alert.alert(
      'Annuler le billet',
      `Es-tu sûr de vouloir annuler ton billet pour "${ticket.event?.title}" ?\n\n${ticket.event?.refund_policy || 'Politique d\'annulation non spécifiée'}`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter l'annulation
            Alert.alert('Bientôt disponible', 'L\'annulation sera disponible prochainement');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#1a1b2e', '#16213e', '#23243b']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon billet</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={18} cy={5} r={3} stroke="rgba(255,255,255,0.8)" strokeWidth={2}/>
              <Circle cx={6} cy={12} r={3} stroke="rgba(255,255,255,0.8)" strokeWidth={2}/>
              <Circle cx={18} cy={19} r={3} stroke="rgba(255,255,255,0.8)" strokeWidth={2}/>
              <Line x1={8.59} y1={13.51} x2={15.42} y2={17.49} stroke="rgba(255,255,255,0.8)" strokeWidth={2}/>
              <Line x1={15.41} y1={6.51} x2={8.59} y2={10.49} stroke="rgba(255,255,255,0.8)" strokeWidth={2}/>
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Carte du billet */}
          <View style={styles.ticketCard}>
            <LinearGradient
              colors={['rgba(117, 102, 217, 0.2)', 'rgba(117, 102, 217, 0.05)']}
              style={styles.ticketGradient}
            >
              {/* En-tête */}
              <View style={styles.ticketHeader}>
                <View style={styles.eventEmoji}>
                  <Text style={styles.emojiText}>
                    {ticket.event?.association?.logo_emoji || '🎉'}
                  </Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {ticket.event?.title}
                  </Text>
                  <Text style={styles.assoName}>
                    {ticket.event?.association?.name}
                  </Text>
                </View>
              </View>

              {/* QR Code */}
              <View style={styles.qrSection}>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={ticket.qr_code}
                    size={200}
                    backgroundColor="white"
                    color="#7566d9"
                  />
                </View>
                <Text style={styles.qrLabel}>Présente ce code à l'entrée</Text>
                <Text style={styles.qrCode}>{ticket.qr_code}</Text>
              </View>

              {/* Infos événement */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} stroke="#7566d9" strokeWidth={2}/>
                    <Line x1={16} y1={2} x2={16} y2={6} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={8} y1={2} x2={8} y2={6} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                  </Svg>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>
                      {formatEventDate(ticket.event?.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={10} stroke="#7566d9" strokeWidth={2}/>
                    <Path d="M12 6v6l4 2" stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                  </Svg>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Heure</Text>
                    <Text style={styles.infoValue}>
                      {ticket.event?.time?.slice(0, 5)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#7566d9" strokeWidth={2}/>
                    <Circle cx={12} cy={10} r={3} stroke="#7566d9" strokeWidth={2}/>
                  </Svg>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Lieu</Text>
                    <Text style={styles.infoValue}>
                      {ticket.event?.location}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Infos participant */}
              <View style={styles.attendeeSection}>
                <Text style={styles.sectionTitle}>Informations du participant</Text>
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeLabel}>Nom</Text>
                  <Text style={styles.attendeeValue}>
                    {ticket.attendee_first_name} {ticket.attendee_last_name}
                  </Text>
                </View>
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeLabel}>Email</Text>
                  <Text style={styles.attendeeValue}>
                    {ticket.attendee_email}
                  </Text>
                </View>
                {ticket.attendee_phone && (
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeLabel}>Téléphone</Text>
                    <Text style={styles.attendeeValue}>
                      {ticket.attendee_phone}
                    </Text>
                  </View>
                )}
              </View>

              {/* Tarif */}
              <View style={styles.priceSection}>
                <Text style={styles.ticketType}>{ticket.ticket_type?.name}</Text>
                <Text style={styles.price}>
                  {ticket.ticket_type?.price === 0 
                    ? 'Gratuit' 
                    : `${ticket.ticket_type?.price}€`
                  }
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Bouton d'annulation */}
          {ticket.event?.cancellation_allowed && ticket.status === 'valid' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annuler ce billet</Text>
            </TouchableOpacity>
          )}

          {/* Note importante */}
          <View style={styles.noteCard}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
              <Path d="M12 16v-4M12 8h.01" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round"/>
            </Svg>
            <Text style={styles.noteText}>
              Ce billet est personnel et non transférable. Il doit être présenté à l'entrée de l'événement.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ticketCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.4)',
    marginBottom: 20,
  },
  ticketGradient: {
    padding: 24,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  eventEmoji: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 30,
  },
  headerInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  assoName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  qrCode: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  attendeeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attendeeInfo: {
    marginBottom: 12,
  },
  attendeeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  attendeeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ticketType: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7566d9',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  noteCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
});