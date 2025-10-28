import AssociationLogo from '@/components/AssociationLogo';
import CreateAssociationModal from '@/components/CreateAssociationModal';
import EditAssociationModal from '@/components/EditAssociationModal';
import EventDetailModal from '@/components/EventDetailModal';
import TicketDetailModal from '@/components/TicketDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';


export default function SocialScreen() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [followedAssos, setFollowedAssos] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [createAssociationModalVisible, setCreateAssociationModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myAssociations, setMyAssociations] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
const [selectedAssoToEdit, setSelectedAssoToEdit] = useState<any>(null);

  // Charger les événements
  const loadEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('events')
      .select(`
        *,
        association:associations(name, logo_emoji)
      `)
      .order('date', { ascending: true });

    if (profileData?.university_id) {
      query = query.eq('university_id', profileData.university_id);
    }

    const { data, error } = await query;

    setLoading(false);

    if (error) {
      console.error('Erreur chargement événements:', error);
    } else {
      setEvents(data || []);
    }
  };

  // Charger les associations
  const loadAssociations = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('associations')
.select('*')      .order('followers_count', { ascending: false });

    if (profileData?.university_id) {
      query = query.eq('university_id', profileData.university_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur chargement associations:', error);
    } else {
      setAssociations(data || []);
    }
  };

  // Charger les associations créées par l'utilisateur
const loadMyAssociations = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur chargement mes associations:', error);
  } else {
    setMyAssociations(data || []);
  }
};

  // Charger les follows de l'utilisateur
  const loadFollows = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('association_followers')
      .select('association_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur chargement follows:', error);
    } else {
      setFollowedAssos(data?.map(f => f.association_id) || []);
    }
  };

  // Charger les billets de l'utilisateur
  const loadMyTickets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(
          *,
          association:associations(name, logo_emoji)
        ),
        ticket_type:event_ticket_types(name, price)
      `)
      .eq('user_id', user.id)
      .eq('status', 'valid')
      .order('registered_at', { ascending: false })
      .limit(2);

    if (error) {
      console.error('Erreur chargement billets:', error);
    } else {
      setMyTickets(data || []);
    }
  };

  // Charger le statut admin
const loadAdminStatus = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!error && data) {
    setIsAdmin(data.is_admin || false);
  }
};

  useEffect(() => {
    loadEvents();
    loadAssociations();
    loadFollows();
    loadMyTickets();
    loadAdminStatus(); // ← AJOUTE CETTE LIGNE
    loadMyAssociations(); 
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadEvents(), loadAssociations(), loadFollows(), loadMyTickets(), loadMyAssociations()]);
    setRefreshing(false);
  };

  // Toggle follow/unfollow
  const toggleFollow = async (assoId: string) => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    const isFollowing = followedAssos.includes(assoId);

    if (isFollowing) {
      const { error } = await supabase
        .from('association_followers')
        .delete()
        .eq('user_id', user.id)
        .eq('association_id', assoId);

      if (error) {
        Alert.alert('Erreur', error.message);
      } else {
        setFollowedAssos(prev => prev.filter(id => id !== assoId));
      }
    } else {
      const { error } = await supabase
        .from('association_followers')
        .insert([{ user_id: user.id, association_id: assoId }]);

      if (error) {
        Alert.alert('Erreur', error.message);
      } else {
        setFollowedAssos(prev => [...prev, assoId]);
      }
    }
  };

  // Formater la date
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Calculer le badge de l'événement
  const getEventBadge = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    return 'À venir';
  };

  const groups = [
    {
      id: 1,
      name: 'L3 Économie',
      members: 12,
      notes: 47,
      topContributors: [
        { name: 'Sophie', points: 156, avatar: 'S' },
        { name: 'Marco (Toi)', points: 142, avatar: 'M', isYou: true },
        { name: 'Thomas', points: 128, avatar: 'T' },
      ],
      color: '#5b5c8a',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient 
        colors={['#23243b', '#16213e', '#23243b']}
        locations={[0, 0.5, 1]}
        style={styles.background}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
{/* Header */}
        <View style={styles.header}>
  <Text style={styles.headerTitle}>Social</Text>
  
  {/* Bouton Créer Association - Visible uniquement pour les admins */}
  {isAdmin && (
    <TouchableOpacity
      onPress={() => setCreateAssociationModalVisible(true)}
      activeOpacity={0.8}
      style={styles.createButton}
    >
      <LinearGradient
        colors={['#7566d9', '#5b4fc9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.createButtonGradient}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5v14M5 12h14"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.createButtonText}>Créer</Text>
      </LinearGradient>
    </TouchableOpacity>
  )}
</View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('events')}
            style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
              Événements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('assos')}
            style={[styles.tab, activeTab === 'assos' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'assos' && styles.tabTextActive]}>
              Associations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('groups')}
            style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
              Groupes
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7566d9" />
          }
        >
          {/* ÉVÉNEMENTS TAB */}
          {activeTab === 'events' && (
            <View style={styles.section}>
              {/* Mes Billets - Aperçu */}
              {myTickets.length > 0 && (
                <View style={styles.myTicketsSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.myTicketsTitle}>Mes billets</Text>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => {
                        Alert.alert('Bientôt disponible', 'La page complète arrive !');
                      }}
                    >
                      <Text style={styles.seeAllLink}>Voir tout</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.ticketsScroll}
                  >
                    {myTickets.map((ticket) => (
                      <TouchableOpacity 
                        key={ticket.id} 
                        style={styles.ticketPreviewCard}
                        activeOpacity={0.8}
                        onPress={() => {
      setSelectedTicket(ticket);
      setTicketModalVisible(true);
                        }}
                      >
                        <LinearGradient
                          colors={['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)']}
                          style={styles.ticketPreviewGradient}
                        >
                          <View style={styles.ticketPreviewHeader}>
                            <View style={styles.ticketPreviewEmoji}>
                              <Text style={styles.ticketPreviewEmojiText}>
                                {ticket.event?.association?.logo_emoji || '🎉'}
                              </Text>
                            </View>
                            <View style={styles.ticketPreviewQR}>
                              <View style={styles.qrPlaceholder}>
                                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                                  <Rect x={3} y={3} width={8} height={8} rx={1} fill="#7566d9"/>
                                  <Rect x={13} y={3} width={8} height={8} rx={1} fill="#7566d9"/>
                                  <Rect x={3} y={13} width={8} height={8} rx={1} fill="#7566d9"/>
                                  <Rect x={16} y={16} width={2} height={2} fill="#7566d9"/>
                                  <Rect x={19} y={16} width={2} height={2} fill="#7566d9"/>
                                  <Rect x={16} y={19} width={2} height={2} fill="#7566d9"/>
                                  <Rect x={19} y={19} width={2} height={2} fill="#7566d9"/>
                                </Svg>
                              </View>
                            </View>
                          </View>
                          <Text style={styles.ticketPreviewTitle} numberOfLines={2}>
                            {ticket.event?.title}
                          </Text>
                          <View style={styles.ticketPreviewInfo}>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                              <Line x1={16} y1={2} x2={16} y2={6} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round"/>
                              <Line x1={8} y1={2} x2={8} y2={6} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round"/>
                            </Svg>
                            <Text style={styles.ticketPreviewDate}>
                              {new Date(ticket.event?.date).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </Text>
                          </View>
                          <View style={styles.ticketPreviewPrice}>
                            <Text style={styles.ticketPreviewPriceText}>
                              {ticket.ticket_type?.price === 0 ? 'Gratuit' : `${ticket.ticket_type?.price}€`}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Liste des événements */}
              {events.map((event) => (
                <TouchableOpacity 
                  key={event.id} 
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedEvent(event);
                    setEventModalVisible(true);
                  }}
                >
                  <View style={styles.eventCard}>
                    <View style={[styles.eventImage, { backgroundColor: event.association?.logo_emoji ? '#5b5c8a' : '#ec4899' }]}>
                      <View style={styles.eventBadge}>
                        <Text style={styles.eventBadgeText}>{getEventBadge(event.date)}</Text>
                      </View>
                    </View>

                    <View style={styles.eventContent}>
                      <View style={styles.eventDateRow}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                          <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                          <Line x1={16} y1={2} x2={16} y2={6} stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round"/>
                          <Line x1={8} y1={2} x2={8} y2={6} stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round"/>
                          <Line x1={3} y1={10} x2={21} y2={10} stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                        </Svg>
                        <Text style={styles.eventDate}>
                          {formatEventDate(event.date)} • {event.time.slice(0, 5)}
                        </Text>
                      </View>

                      <Text style={styles.eventTitle}>{event.title}</Text>

                      <View style={styles.eventHost}>
                        <LinearGradient
                          colors={['#23243b', '#2d2e4f']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.eventHostAvatar}
                        >
                          <Text style={styles.eventHostAvatarText}>
                            {event.association?.logo_emoji || '🎉'}
                          </Text>
                        </LinearGradient>
                        <Text style={styles.eventHostName}>{event.association?.name || 'Organisation'}</Text>
                      </View>

                      <View style={styles.eventStats}>
                        <View style={styles.eventStat}>
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <Circle cx={9} cy={7} r={4} stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          </Svg>
                          <Text style={styles.eventStatText}>{event.participants_count} participants</Text>
                        </View>
                        <View style={styles.eventStat}>
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                            <Circle cx={12} cy={10} r={3} stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                          </Svg>
                          <Text style={styles.eventStatText}>{event.location}</Text>
                        </View>
                      </View>

                      <TouchableOpacity 
  style={styles.ticketButton} 
  activeOpacity={0.8}
  onPress={(e) => {
    e.stopPropagation(); // Empêche d'ouvrir le modal détail
    setSelectedEvent(event);
    setEventModalVisible(true);
  }}
>
  <LinearGradient
    colors={['#7566d9', '#5b4fc9']}
    style={styles.ticketButtonGradient}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
  >
    <Text style={styles.ticketButtonText}>
      Voir les billets
    </Text>
  </LinearGradient>
</TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          


          {/* ASSOCIATIONS TAB */}
          {activeTab === 'assos' && (
            <View style={styles.section}>

                        {/* MES ASSOCIATIONS */}
{isAdmin && myAssociations.length > 0 && (
  <>
    <View style={styles.myAssosHeader}>
      <View style={styles.myAssosHeaderLeft}>
        <Text style={styles.sectionSubtitle}>Mes Associations</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      </View>
      <Text style={styles.myAssosCount}>{myAssociations.length}</Text>
    </View>

    {myAssociations.map((asso) => (
      <TouchableOpacity
        key={asso.id}
        activeOpacity={0.9}
        onPress={() => router.push(`/association-detail?id=${asso.id}`)}
      >
        <View style={styles.assoCard}>
          <View style={[styles.assoHeader, { backgroundColor: asso.color }]} />
          <View style={styles.assoLogo}>
            <AssociationLogo
              name={asso.name}
              logoUrl={asso.profile_photo_url}
              emoji={asso.logo_emoji}
              size={70}
            />
          </View>
          <View style={styles.assoContent}>
            <View style={styles.myAssoNameRow}>
              <Text style={styles.assoName}>{asso.name}</Text>
              <View style={styles.ownerBadge}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="#fbbf24"
                  />
                </Svg>
                <Text style={styles.ownerBadgeText}>Propriétaire</Text>
              </View>
            </View>
            
            <Text style={styles.assoDescription}>
              {asso.short_description || asso.description}
            </Text>
            
            <View style={styles.assoStats}>
              <View style={styles.assoStat}>
                <Text style={styles.assoStatValue}>{asso.followers_count || 0}</Text>
                <Text style={styles.assoStatLabel}>Followers</Text>
              </View>
              <View style={styles.assoStat}>
                <Text style={styles.assoStatValue}>{asso.events_count || 0}</Text>
                <Text style={styles.assoStatLabel}>Événements</Text>
              </View>
              <View style={styles.assoStat}>
                <Text style={styles.assoStatValue}>{asso.posts_count || 0}</Text>
                <Text style={styles.assoStatLabel}>Publications</Text>
              </View>
            </View>

            <View style={styles.myAssoButtons}>
  <TouchableOpacity
    onPress={() => router.push(`/association-detail?id=${asso.id}`)}
    activeOpacity={0.8}
    style={styles.viewPageButton}
  >
    <Text style={styles.viewPageText}>Voir la page</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
  setSelectedAssoToEdit(asso);
  setEditModalVisible(true);
}}
    activeOpacity={0.8}
    style={styles.modifyButton}
  >
    <Text style={styles.modifyButtonText}>Modifier</Text>
  </TouchableOpacity>
</View>
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </>
)}

              <Text style={styles.sectionSubtitle}>Associations suivies</Text>

              {associations.filter(a => followedAssos.includes(a.id)).map((asso) => (
  <TouchableOpacity
    key={asso.id}
    activeOpacity={0.9}
    onPress={() => router.push(`/association-detail?id=${asso.id}`)}
  >
    <View style={styles.assoCard}>
                  <View style={[styles.assoHeader, { backgroundColor: asso.color }]} />
                  <AssociationLogo
  name={asso.name}
  logoUrl={asso.profile_photo_url}
  emoji={asso.logo_emoji}
  size={70}
  style={{
    position: 'absolute',
    top: 40,
    left: 20,
    borderWidth: 4,
    borderColor: '#23243b',
  }}
/>
                  <View style={styles.assoContent}>
                    <Text style={styles.assoName}>{asso.name}</Text>
                    <Text style={styles.assoDescription}>{asso.description}</Text>
                    
                    <View style={styles.assoStats}>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.followers_count}</Text>
                        <Text style={styles.assoStatLabel}>Followers</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.events_count}</Text>
                        <Text style={styles.assoStatLabel}>Événements</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.posts_count}</Text>
                        <Text style={styles.assoStatLabel}>Publications</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleFollow(asso.id)}
                      activeOpacity={0.8}
                      style={styles.followButtonWrapper}
                    >
                      <LinearGradient
                        colors={followedAssos.includes(asso.id) ? ['#2d2e4f', '#23243b'] : ['#7566d9', '#5b4fc9']}
                        style={styles.followButton}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                      >
                        <Text style={styles.followButtonText}>
                          {followedAssos.includes(asso.id) ? 'Suivi ✓' : 'Suivre'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
                </TouchableOpacity>
              ))}

              <Text style={styles.sectionSubtitle}>Toutes les associations</Text>

              {associations.filter(a => !followedAssos.includes(a.id)).map((asso) => (
  <TouchableOpacity
    key={asso.id}
    activeOpacity={0.9}
    onPress={() => router.push(`/association-detail?id=${asso.id}`)}
  >
    <View style={styles.assoCard}>
                  <View style={[styles.assoHeader, { backgroundColor: asso.color }]} />
                  <AssociationLogo
  name={asso.name}
  logoUrl={asso.profile_photo_url}
  emoji={asso.logo_emoji}
  size={70}
  style={{
    position: 'absolute',
    top: 40,
    left: 20,
    borderWidth: 4,
    borderColor: '#23243b',
  }}
/>
                  <View style={styles.assoContent}>
                    <Text style={styles.assoName}>{asso.name}</Text>
                    <Text style={styles.assoDescription}>{asso.description}</Text>
                    
                    <View style={styles.assoStats}>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.followers_count}</Text>
                        <Text style={styles.assoStatLabel}>Followers</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.events_count}</Text>
                        <Text style={styles.assoStatLabel}>Événements</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.posts_count}</Text>
                        <Text style={styles.assoStatLabel}>Publications</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleFollow(asso.id)}
                      activeOpacity={0.8}
                      style={styles.followButtonWrapper}
                    >
                      <LinearGradient
                        colors={['#7566d9', '#5b4fc9']}
                        style={styles.followButton}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                      >
                        <Text style={styles.followButtonText}>Suivre</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* GROUPES TAB */}
          {activeTab === 'groups' && (
            <View style={styles.section}>
              {groups.map((group) => (
                <View key={group.id} style={styles.groupCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.groupGradient}
                  >
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <View style={styles.groupBadge}>
                        <Text style={styles.groupBadgeText}>{group.members} membres</Text>
                      </View>
                    </View>

                    <View style={styles.groupStats}>
                      <View style={styles.groupStat}>
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#7566d9" strokeWidth={2}/>
                          <Path d="M14 2v6h6" stroke="#7566d9" strokeWidth={2}/>
                        </Svg>
                        <Text style={styles.groupStatText}>{group.notes} notes partagées</Text>
                      </View>
                    </View>

                    <Text style={styles.topContributorsTitle}>Top contributeurs</Text>
                    <View style={styles.contributorsList}>
                      {group.topContributors.map((contributor, idx) => (
                        <View key={idx} style={styles.contributorRow}>
                          <View style={styles.contributorLeft}>
                            <View style={[styles.contributorAvatar, contributor.isYou && styles.contributorAvatarYou]}>
                              <Text style={styles.contributorAvatarText}>{contributor.avatar}</Text>
                            </View>
                            <Text style={styles.contributorName}>{contributor.name}</Text>
                          </View>
                          <Text style={styles.contributorPoints}>{contributor.points} pts</Text>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        
        {/* Modal Modification Association */}
      {selectedAssoToEdit && (
        <EditAssociationModal
          visible={editModalVisible}
          association={selectedAssoToEdit}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedAssoToEdit(null);
          }}
          onSuccess={() => {
            loadMyAssociations();
            loadAssociations();
          }}
        />
      )}

      </LinearGradient>
       {/* Modal Détail du Billet */}
      <TicketDetailModal
        visible={ticketModalVisible}
        ticket={selectedTicket}
        onClose={() => {
          setTicketModalVisible(false);
          setSelectedTicket(null);
        }}
      />

      {/* Modal Détail Événement */}
      <EventDetailModal
        visible={eventModalVisible}
        event={selectedEvent}
        onClose={() => {
          setEventModalVisible(false);
          setSelectedEvent(null);
        }}
        onReserve={() => {
          loadEvents();
          loadMyTickets();
        }}
        />
        {/* Modal Create Association */}
<CreateAssociationModal
  visible={createAssociationModalVisible}
  onClose={() => setCreateAssociationModalVisible(false)}
  onSuccess={() => {
    // Recharger les associations
    loadAssociations();
  }}
/>
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
  paddingHorizontal: 20,
  paddingTop: 60,
  paddingBottom: 20,
},
  headerTitle: {
    fontSize: 34,
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
    fontSize: 13,
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
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
  },
  // MES BILLETS
  myTicketsSection: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  myTicketsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7566d9',
  },
  ticketsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  ticketPreviewCard: {
    width: 180,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  ticketPreviewGradient: {
    padding: 14,
  },
  ticketPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketPreviewEmoji: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketPreviewEmojiText: {
    fontSize: 20,
  },
  ticketPreviewQR: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketPreviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    height: 40,
  },
  ticketPreviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ticketPreviewDate: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ticketPreviewPrice: {
    marginTop: 4,
  },
  ticketPreviewPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7566d9',
  },
  // EVENTS
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventImage: {
    width: '100%',
    height: 140,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 12,
  },
  eventBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'white',
  },
  eventContent: {
    padding: 16,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  eventHost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eventHostAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventHostAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
  },
  eventHostName: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  eventStats: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  eventStat: {
    flexDirection: 'row',
    alignItems:'center',
    gap: 6,
  },
  eventStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ticketButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ticketButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ticketButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  // ASSOCIATIONS
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  assoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'visible',
    marginBottom: 16,
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  assoHeader: {
    height: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  assoLogo: {
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
  assoEmoji: {
    fontSize: 32,
  },
  assoContent: {
    padding: 20,
    paddingTop: 50,
  },
  assoName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  assoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  assoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  assoStat: {
    alignItems: 'center',
  },
  assoStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  assoStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  followButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  followButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  // GROUPS
  groupCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  groupGradient: {
    padding: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  groupBadge: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  groupStats: {
    marginBottom: 20,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupStatText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  topContributorsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  contributorsList: {
    gap: 12,
  },
  contributorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contributorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contributorAvatarYou: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
  },
  contributorAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  contributorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  contributorPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7566d9',
  },
  // Bouton Créer Association
  createAssociationButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createAssociationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createAssociationButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

createButton: {
  borderRadius: 12,
  overflow: 'hidden',
},
createButtonGradient: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 16,
  paddingVertical: 10,
},
createButtonText: {
  fontSize: 15,
  fontWeight: '800',
  color: '#ffffff',
},
// Mes Associations
myAssosHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  marginTop: 24,
},
myAssosHeaderLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
adminBadge: {
  backgroundColor: 'rgba(117, 102, 217, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: 'rgba(117, 102, 217, 0.4)',
},
adminBadgeText: {
  fontSize: 10,
  fontWeight: '800',
  color: '#7566d9',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
myAssosCount: {
  fontSize: 14,
  fontWeight: '700',
  color: 'rgba(255, 255, 255, 0.4)',
},
myAssoNameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 8,
},
ownerBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 3,
  backgroundColor: 'rgba(251, 191, 36, 0.15)',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 5,
},
ownerBadgeText: {
  fontSize: 9,
  fontWeight: '700',
  color: '#fbbf24',
},
// Boutons Mes Associations
myAssoButtons: {
  flexDirection: 'row',
  gap: 10,
},
viewPageButton: {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
},
viewPageText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#ffffff',
},
modifyButton: {
  flex: 1,
  backgroundColor: 'rgba(117, 102, 217, 0.2)',
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(117, 102, 217, 0.4)',
},
modifyButtonText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#7566d9',
},

});