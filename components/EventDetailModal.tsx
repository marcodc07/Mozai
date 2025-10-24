import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface EventDetailModalProps {
  visible: boolean;
  event: any;
  onClose: () => void;
  onReserve?: () => void;
}

export default function EventDetailModal({
  visible,
  event,
  onClose,
  onReserve,
}: EventDetailModalProps) {
  const { user } = useAuth();
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (visible && event) {
      loadTicketTypes();
    }
  }, [visible, event]);

  const loadTicketTypes = async () => {
    if (!event) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('event_ticket_types')
      .select('*')
      .eq('event_id', event.id)
      .order('price', { ascending: true });

    setLoading(false);

    if (error) {
      console.error('Erreur chargement tarifs:', error);
    } else {
      setTicketTypes(data || []);
    }
  };

  const handleReserve = async (ticketType: any) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connecte-toi pour réserver un billet');
      return;
    }

    if (ticketType.available <= 0) {
      Alert.alert('Complet', 'Ce tarif est complet');
      return;
    }

    setReserving(true);

    // Pour l'instant on crée juste la réservation sans paiement
    // On intégrera Stripe après
    const qrCode = `MOZAI-${event.id}-${user.id}-${Date.now()}`;

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([
        {
          user_id: user.id,
          event_id: event.id,
          ticket_type_id: ticketType.id,
          amount_paid: ticketType.price,
          qr_code: qrCode,
        },
      ])
      .select()
      .single();

    if (error) {
      setReserving(false);
      if (error.code === '23505') {
        Alert.alert('Déjà réservé', 'Tu as déjà réservé un billet pour cet événement');
      } else {
        Alert.alert('Erreur', error.message);
      }
      return;
    }

    // Décrémenter le nombre de places disponibles
    await supabase
      .from('event_ticket_types')
      .update({ available: ticketType.available - 1 })
      .eq('id', ticketType.id);

    // Incrémenter le nombre de participants
    await supabase
      .from('events')
      .update({ participants_count: event.participants_count + 1 })
      .eq('id', event.id);

    setReserving(false);

    Alert.alert(
      'Réservation confirmée ! 🎉',
      ticketType.price > 0
        ? `Tu as réservé ton billet pour ${ticketType.price}€. Tu recevras un email de confirmation.`
        : 'Tu as réservé ton billet gratuit. Tu recevras un email de confirmation.',
      [
        {
          text: 'OK',
          onPress: () => {
            onClose();
            if (onReserve) onReserve();
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  if (!event) return null;

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
          <Text style={styles.headerTitle}>Détails de l'événement</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image de l'événement */}
          <View style={[styles.eventImage, { backgroundColor: event.association?.logo_emoji ? '#5b5c8a' : '#ec4899' }]}>
            <Text style={styles.eventImageEmoji}>{event.association?.logo_emoji || '🎉'}</Text>
          </View>

          {/* Titre */}
          <View style={styles.section}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            {/* Organisateur */}
            <View style={styles.organizer}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerEmoji}>{event.association?.logo_emoji || '🎉'}</Text>
              </View>
              <Text style={styles.organizerName}>Organisé par {event.association?.name || 'Organisation'}</Text>
            </View>
          </View>

          {/* Infos principales */}
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
              style={styles.infoGradient}
            >
              <View style={styles.infoRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} stroke="#7566d9" strokeWidth={2}/>
                  <Line x1={16} y1={2} x2={16} y2={6} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                  <Line x1={8} y1={2} x2={8} y2={6} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                  <Line x1={3} y1={10} x2={21} y2={10} stroke="#7566d9" strokeWidth={2}/>
                </Svg>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
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
                  <Text style={styles.infoValue}>{event.time?.slice(0, 5)}</Text>
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
                  <Text style={styles.infoValue}>{event.location}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  <Circle cx={9} cy={7} r={4} stroke="#7566d9" strokeWidth={2}/>
                  <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Participants</Text>
                  <Text style={styles.infoValue}>{event.participants_count} / {event.capacity}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Politique d'annulation */}
          {event.cancellation_allowed && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Politique d'annulation</Text>
              <View style={styles.policyCard}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={10} stroke="#10b981" strokeWidth={2}/>
                  <Path d="M12 16v-4M12 8h.01" stroke="#10b981" strokeWidth={2} strokeLinecap="round"/>
                </Svg>
                <Text style={styles.policyText}>
                  {event.refund_policy || 'Annulation autorisée'}
                </Text>
              </View>
            </View>
          )}

          {/* Tarifs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billets disponibles</Text>

            {loading ? (
              <ActivityIndicator color="#7566d9" style={{ marginTop: 20 }} />
            ) : ticketTypes.length > 0 ? (
              ticketTypes.map((ticketType) => {
                const isAvailable = ticketType.available > 0;
                const isSoldOut = ticketType.available === 0;

                return (
                  <View key={ticketType.id} style={styles.ticketCard}>
                    <LinearGradient
                      colors={
                        isSoldOut
                          ? ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.01)']
                          : ['rgba(117, 102, 217, 0.1)', 'rgba(117, 102, 217, 0.05)']
                      }
                      style={styles.ticketGradient}
                    >
                      <View style={styles.ticketInfo}>
                        <View>
                          <Text style={[styles.ticketName, isSoldOut && styles.ticketNameSoldOut]}>
                            {ticketType.name}
                          </Text>
                          <Text style={styles.ticketAvailable}>
                            {isSoldOut ? 'Complet' : `${ticketType.available} place${ticketType.available > 1 ? 's' : ''} restante${ticketType.available > 1 ? 's' : ''}`}
                          </Text>
                        </View>
                        <View style={styles.ticketRight}>
                          <Text style={[styles.ticketPrice, isSoldOut && styles.ticketPriceSoldOut]}>
                            {ticketType.price === 0 ? 'Gratuit' : `${ticketType.price}€`}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.reserveButton,
                              (!isAvailable || reserving) && styles.reserveButtonDisabled,
                            ]}
                            onPress={() => handleReserve(ticketType)}
                            disabled={!isAvailable || reserving}
                            activeOpacity={0.7}
                          >
                            <LinearGradient
                              colors={
                                !isAvailable || reserving
                                  ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                                  : ['#7566d9', '#5b4fc9']
                              }
                              style={styles.reserveButtonGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            >
                              {reserving ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                              ) : (
                                <Text
                                  style={[
                                    styles.reserveButtonText,
                                    !isAvailable && styles.reserveButtonTextDisabled,
                                  ]}
                                >
                                  {isSoldOut ? 'Complet' : 'Réserver'}
                                </Text>
                              )}
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noTickets}>Aucun tarif disponible pour cet événement</Text>
            )}
          </View>

          <View style={{ height: 40 }} />
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
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  eventImage: {
    height: 200,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  eventImageEmoji: {
    fontSize: 80,
  },
  section: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 34,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerEmoji: {
    fontSize: 20,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  infoGradient: {
    padding: 20,
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
    fontSize: 13,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  policyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    flex: 1,
  },
  ticketCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.2)',
  },
  ticketGradient: {
    padding: 16,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  ticketNameSoldOut: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  ticketAvailable: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ticketRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  ticketPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7566d9',
  },
  ticketPriceSoldOut: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  reserveButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  reserveButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  reserveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  reserveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  noTickets: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
});