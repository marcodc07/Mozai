import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import TicketDetailModal from '../components/TicketDetailModal';

export default function MyEventsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingTickets, setUpcomingTickets] = useState<any[]>([]);
  const [pastTickets, setPastTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
  if (!user) return;

  setLoading(true);

  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

  // Événements à venir
  const { data: upcoming, error: upcomingError } = await supabase
    .from('event_registrations')
    .select(`
      *,
      event:events!inner(
        *,
        association:associations(name, logo_emoji)
      ),
      ticket_type:event_ticket_types(name, price)
    `)
    .eq('user_id', user.id)
    .eq('status', 'valid')
    .gte('events.date', today)
    .order('registered_at', { ascending: false });

  // Événements passés
  const { data: past, error: pastError } = await supabase
    .from('event_registrations')
    .select(`
      *,
      event:events!inner(
        *,
        association:associations(name, logo_emoji)
      ),
      ticket_type:event_ticket_types(name, price)
    `)
    .eq('user_id', user.id)
    .lt('events.date', today)
    .order('registered_at', { ascending: false });

  setLoading(false);

  if (upcomingError) {
    console.error('Erreur chargement événements à venir:', upcomingError);
  } else {
    // Filtrer côté client pour être sûr
    const filtered = (upcoming || []).filter(
      (ticket: any) => ticket.event && new Date(ticket.event.date) >= new Date(today)
    );
    setUpcomingTickets(filtered);
  }

  if (pastError) {
    console.error('Erreur chargement événements passés:', pastError);
  } else {
    // Filtrer côté client pour être sûr
    const filtered = (past || []).filter(
      (ticket: any) => ticket.event && new Date(ticket.event.date) < new Date(today)
    );
    setPastTickets(filtered);
  }
};

  const handleCancelTicket = async (ticketId: string, eventTitle: string) => {
    Alert.alert(
      'Annuler le billet',
      `Es-tu sûr de vouloir annuler ton billet pour "${eventTitle}" ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('event_registrations')
              .update({ 
                status: 'cancelled',
                cancelled_at: new Date().toISOString()
              })
              .eq('id', ticketId);

            if (error) {
              Alert.alert('Erreur', error.message);
            } else {
              Alert.alert('Billet annulé', 'Ton billet a été annulé avec succès');
              loadTickets();
            }
          },
        },
      ]
    );
  };

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

  const renderTicketCard = (ticket: any) => {
    const isPast = activeTab === 'past';
    
      return (
  <TouchableOpacity 
    key={ticket.id} 
    activeOpacity={0.8}
    onPress={() => {
      setSelectedTicket(ticket);
      setTicketModalVisible(true);
    }}
  >
    <View style={styles.ticketCard}>
        <LinearGradient
          colors={
            isPast
              ? ['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']
              : ['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)']
          }
          style={styles.ticketGradient}
        >
          {/* Header avec emoji et QR */}
<View style={styles.ticketHeader}>
  {/* Badge Annulé si événement annulé */}
  {ticket.event?.is_cancelled && (
    <View style={styles.cancelledBadge}>
      <Text style={styles.cancelledBadgeText}>Événement annulé</Text>
    </View>
  )}

  <View style={styles.ticketHeaderLeft}>
    <View style={styles.ticketEmoji}>
                <Text style={styles.ticketEmojiText}>
                  {ticket.event?.association?.logo_emoji || '🎉'}
                </Text>
              </View>
              <View style={styles.ticketHeaderInfo}>
                <Text style={styles.ticketEventTitle} numberOfLines={2}>
                  {ticket.event?.title}
                </Text>
                <Text style={styles.ticketAsso}>
                  {ticket.event?.association?.name || 'Organisation'}
                </Text>
              </View>
            </View>

            {!isPast && (
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={ticket.qr_code}
                  size={80}
                  backgroundColor="white"
                  color="#7566d9"
                />
              </View>
            )}
          </View>

          {/* Infos événement */}
          <View style={styles.ticketInfos}>
            <View style={styles.ticketInfoRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} stroke="rgba(255,255,255,0.6)" strokeWidth={2}/>
                <Line x1={16} y1={2} x2={16} y2={6} stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round"/>
                <Line x1={8} y1={2} x2={8} y2={6} stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round"/>
              </Svg>
              <Text style={styles.ticketInfoText}>
                {formatEventDate(ticket.event?.date)}
              </Text>
            </View>

            <View style={styles.ticketInfoRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.6)" strokeWidth={2}/>
                <Path d="M12 6v6l4 2" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round"/>
              </Svg>
              <Text style={styles.ticketInfoText}>
                {ticket.event?.time?.slice(0, 5)}
              </Text>
            </View>

            <View style={styles.ticketInfoRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="rgba(255,255,255,0.6)" strokeWidth={2}/>
                <Circle cx={12} cy={10} r={3} stroke="rgba(255,255,255,0.6)" strokeWidth={2}/>
              </Svg>
              <Text style={styles.ticketInfoText}>
                {ticket.event?.location}
              </Text>
            </View>
          </View>

          {/* Footer avec prix et actions */}
          <View style={styles.ticketFooter}>
            <View style={styles.ticketPrice}>
              <Text style={styles.ticketTypeText}>{ticket.ticket_type?.name}</Text>
              <Text style={styles.ticketPriceText}>
                {ticket.ticket_type?.price === 0 ? 'Gratuit' : `${ticket.ticket_type?.price}€`}
              </Text>
            </View>

            {!isPast && ticket.event?.cancellation_allowed && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelTicket(ticket.id, ticket.event?.title)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            )}

            {isPast && ticket.checked_in_at && (
              <View style={styles.checkedInBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={10} stroke="#10b981" strokeWidth={2}/>
                  <Path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth={2} strokeLinecap="round"/>
                </Svg>
                <Text style={styles.checkedInText}>Validé</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient 
        colors={['#1a1b2e', '#16213e', '#23243b']}
        style={styles.background}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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
          <Text style={styles.headerTitle}>Mes événements</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('upcoming')}
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              À venir ({upcomingTickets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('past')}
            style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
              Passés ({pastTickets.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#7566d9" size="large" />
            </View>
          ) : (
            <>
              {activeTab === 'upcoming' && (
                <>
                  {upcomingTickets.length > 0 ? (
                    upcomingTickets.map(renderTicketCard)
                  ) : (
                    <View style={styles.emptyState}>
                      <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                        <Rect x={2} y={7} width={20} height={14} rx={2} stroke="rgba(255,255,255,0.3)" strokeWidth={2}/>
                        <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="rgba(255,255,255,0.3)" strokeWidth={2}/>
                      </Svg>
                      <Text style={styles.emptyTitle}>Aucun événement à venir</Text>
                      <Text style={styles.emptyText}>
                        Réserve des billets pour tes événements préférés !
                      </Text>
                      <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#7566d9', '#5b4fc9']}
                          style={styles.exploreButtonGradient}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                        >
                          <Text style={styles.exploreButtonText}>Explorer les événements</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {activeTab === 'past' && (
                <>
                  {pastTickets.length > 0 ? (
                    pastTickets.map(renderTicketCard)
                  ) : (
                    <View style={styles.emptyState}>
                      <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                        <Circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.3)" strokeWidth={2}/>
                        <Path d="M12 6v6l4 2" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeLinecap="round"/>
                      </Svg>
                      <Text style={styles.emptyTitle}>Aucun événement passé</Text>
                      <Text style={styles.emptyText}>
                        Tes événements passés apparaîtront ici
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
        {/* Modal détail du billet */}
      <TicketDetailModal
        visible={ticketModalVisible}
        ticket={selectedTicket}
        onClose={() => {
          setTicketModalVisible(false);
          setSelectedTicket(null);
        }}
        />
      </LinearGradient>
    </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  ticketCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  ticketGradient: {
    padding: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ticketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  ticketEmoji: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketEmojiText: {
    fontSize: 24,
  },
  ticketHeaderInfo: {
    flex: 1,
  },
  ticketEventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  ticketAsso: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  qrCodeContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  ticketInfos: {
    gap: 12,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ticketPrice: {
    flex: 1,
  },
  ticketTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  ticketPriceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7566d9',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  checkedInText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
    cancelledBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelledBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
