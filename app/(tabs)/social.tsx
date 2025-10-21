import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState('events');
  const [followedAssos, setFollowedAssos] = useState<number[]>([1]);

  const events = [
    {
      id: 1,
      title: 'Soirée BDE Rentrée 2024',
      date: 'Samedi 12 octobre',
      time: '20h00',
      location: 'Campus Bar',
      participants: 247,
      organizer: 'Bureau Des Étudiants',
      organizerAvatar: 'BDE',
      type: 'Ce soir',
      color: '#ec4899',
      price: 'Réserver ma place',
    },
    {
      id: 2,
      title: 'Conférence Tech & Innovation',
      date: 'Mardi 15 octobre',
      time: '18h30',
      location: 'Amphi A',
      participants: 89,
      organizer: 'Tech & Innovation Club',
      organizerAvatar: 'TI',
      type: 'Dans 3 jours',
      color: '#5b5c8a',
      price: 'Réserver (Gratuit)',
    },
    {
      id: 3,
      title: 'Afterwork Réseau Alumni',
      date: 'Jeudi 17 octobre',
      time: '19h00',
      location: 'Rooftop Campus',
      participants: 45,
      organizer: 'Association Alumni',
      organizerAvatar: 'AL',
      type: 'La semaine prochaine',
      color: '#10b981',
      price: 'Réserver ma place',
    },
  ];

  const associations = [
    {
      id: 1,
      name: 'Bureau Des Étudiants',
      description: "L'association étudiante de référence ! Organisation de soirées, événements sportifs et culturels.",
      followers: 1200,
      events: 24,
      posts: 156,
      emoji: '🎉',
      color: '#5b5c8a',
    },
    {
      id: 2,
      name: 'Arts & Culture',
      description: 'Ateliers créatifs, expositions, concerts et spectacles. L\'art sous toutes ses formes au cœur du campus.',
      followers: 892,
      events: 18,
      posts: 124,
      emoji: '🎨',
      color: '#f59e0b',
    },
    {
      id: 3,
      name: 'Green Campus',
      description: 'Association écologique dédiée au développement durable. Actions concrètes pour un campus plus vert.',
      followers: 567,
      events: 12,
      posts: 89,
      emoji: '♻️',
      color: '#10b981',
    },
    {
      id: 4,
      name: 'Aide aux Devoirs',
      description: 'Soutien scolaire et tutorat entre étudiants. Entraide et partage de connaissances.',
      followers: 234,
      events: 8,
      posts: 45,
      emoji: '🎓',
      color: '#5b5c8a',
    },
    {
      id: 5,
      name: 'Bureau Des Sports',
      description: 'Tournois, compétitions inter-campus et activités sportives pour tous les niveaux.',
      followers: 423,
      events: 15,
      posts: 67,
      emoji: '⚽',
      color: '#ef4444',
    },
    {
      id: 6,
      name: 'Club Théâtre',
      description: 'Improvisation, spectacles et ateliers d\'art dramatique. Venez exprimer votre créativité !',
      followers: 189,
      events: 6,
      posts: 34,
      emoji: '🎭',
      color: '#8b5cf6',
    },
  ];

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
    {
      id: 2,
      name: 'Marketing Digital',
      members: 8,
      notes: 32,
      topContributors: [
        { name: 'Marco (Toi)', points: 89, avatar: 'M', isYou: true },
        { name: 'Laura', points: 76, avatar: 'L' },
        { name: 'Antoine', points: 68, avatar: 'A' },
      ],
      color: '#ec4899',
    },
    {
      id: 3,
      name: 'Data Analytics',
      members: 15,
      notes: 61,
      topContributors: [
        { name: 'Paul', points: 201, avatar: 'P' },
        { name: 'Clara', points: 187, avatar: 'C' },
        { name: 'Marco (Toi)', points: 164, avatar: 'M', isYou: true },
      ],
      color: '#3b82f6',
    },
  ];

  const toggleFollow = (assoId: number) => {
    setFollowedAssos(prev =>
      prev.includes(assoId)
        ? prev.filter(id => id !== assoId)
        : [...prev, assoId]
    );
  };

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
        >
          {/* ÉVÉNEMENTS TAB */}
          {activeTab === 'events' && (
            <View style={styles.section}>
              {/* My Tickets Section */}
              <View style={styles.glassCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Mes billets</Text>
                  <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>Voir tout</Text>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.ticketPreview} activeOpacity={0.7}>
                  <View style={styles.ticketQR}>
                    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                      <Rect x={3} y={3} width={7} height={7} stroke="#23243b" strokeWidth={2}/>
                      <Rect x={14} y={3} width={7} height={7} stroke="#23243b" strokeWidth={2}/>
                      <Rect x={3} y={14} width={7} height={7} stroke="#23243b" strokeWidth={2}/>
                      <Rect x={14} y={14} width={7} height={7} stroke="#23243b" strokeWidth={2}/>
                    </Svg>
                  </View>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketEventName}>Soirée BDE Rentrée</Text>
                    <Text style={styles.ticketEventDate}>Ce soir • 20h00</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Events List */}
              {events.map((event) => (
                <TouchableOpacity key={event.id} activeOpacity={0.7}>
                  <View style={styles.eventCard}>
                    <View style={[styles.eventImage, { backgroundColor: event.color }]}>
                      <View style={styles.eventBadge}>
                        <Text style={styles.eventBadgeText}>{event.type}</Text>
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
                        <Text style={styles.eventDate}>{event.date} • {event.time}</Text>
                      </View>

                      <Text style={styles.eventTitle}>{event.title}</Text>

                      <View style={styles.eventHost}>
                        <LinearGradient
                          colors={['#23243b', '#2d2e4f']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.eventHostAvatar}
                        >
                          <Text style={styles.eventHostAvatarText}>{event.organizerAvatar}</Text>
                        </LinearGradient>
                        <Text style={styles.eventHostName}>{event.organizer}</Text>
                      </View>

                      <View style={styles.eventStats}>
                        <View style={styles.eventStat}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <Circle cx={9} cy={7} r={4} stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                            <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          </Svg>
                          <Text style={styles.eventStatText}>{event.participants} inscrits</Text>
                        </View>
                        <View style={styles.eventStat}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                            <Circle cx={12} cy={10} r={3} stroke="rgba(255,255,255,0.7)" strokeWidth={2}/>
                          </Svg>
                          <Text style={styles.eventStatText}>{event.location}</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.ticketButton} activeOpacity={0.8}>
                        <LinearGradient
                          colors={['#23243b', '#2d2e4f']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={styles.ticketButtonGradient}
                        >
                          <Text style={styles.ticketButtonText}>{event.price}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={{height: 40}} />
            </View>
          )}

          {/* ASSOCIATIONS TAB */}
          {activeTab === 'assos' && (
            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>Les plus populaires</Text>

              {associations.slice(0, 3).map((asso) => (
                <View key={asso.id} style={styles.assoCard}>
                  <View style={[styles.assoHeader, { backgroundColor: asso.color }]} />
                  <View style={styles.assoLogo}>
                    <Text style={styles.assoEmoji}>{asso.emoji}</Text>
                  </View>
                  <View style={styles.assoContent}>
                    <Text style={styles.assoName}>{asso.name}</Text>
                    <Text style={styles.assoDescription}>{asso.description}</Text>
                    
                    <View style={styles.assoStats}>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.followers}</Text>
                        <Text style={styles.assoStatLabel}>Followers</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.events}</Text>
                        <Text style={styles.assoStatLabel}>Événements</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.posts}</Text>
                        <Text style={styles.assoStatLabel}>Publications</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleFollow(asso.id)}
                      activeOpacity={0.8}
                      style={styles.followButtonWrapper}
                    >
                      {followedAssos.includes(asso.id) ? (
                        <LinearGradient
                          colors={['#23243b', '#2d2e4f']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={styles.followButtonGradient}
                        >
                          <Text style={styles.followButtonText}>Abonné</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.followButtonInactive}>
                          <Text style={styles.followButtonText}>Suivre</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.registerAssoBtn} activeOpacity={0.7}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Line x1={12} y1={5} x2={12} y2={19} stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round"/>
                  <Line x1={5} y1={12} x2={19} y2={12} stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round"/>
                </Svg>
                <Text style={styles.registerAssoBtnText}>Je veux enregistrer mon association</Text>
              </TouchableOpacity>

              <Text style={styles.sectionSubtitle}>Toutes les associations</Text>

              {associations.slice(3).map((asso) => (
                <View key={asso.id} style={styles.assoCard}>
                  <View style={[styles.assoHeader, { backgroundColor: asso.color }]} />
                  <View style={styles.assoLogo}>
                    <Text style={styles.assoEmoji}>{asso.emoji}</Text>
                  </View>
                  <View style={styles.assoContent}>
                    <Text style={styles.assoName}>{asso.name}</Text>
                    <Text style={styles.assoDescription}>{asso.description}</Text>
                    
                    <View style={styles.assoStats}>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.followers}</Text>
                        <Text style={styles.assoStatLabel}>Followers</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.events}</Text>
                        <Text style={styles.assoStatLabel}>Événements</Text>
                      </View>
                      <View style={styles.assoStat}>
                        <Text style={styles.assoStatValue}>{asso.posts}</Text>
                        <Text style={styles.assoStatLabel}>Publications</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleFollow(asso.id)}
                      activeOpacity={0.8}
                      style={styles.followButtonWrapper}
                    >
                      {followedAssos.includes(asso.id) ? (
                        <LinearGradient
                          colors={['#23243b', '#2d2e4f']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={styles.followButtonGradient}
                        >
                          <Text style={styles.followButtonText}>Abonné</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.followButtonInactive}>
                          <Text style={styles.followButtonText}>Suivre</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={{height: 40}} />
            </View>
          )}

          {/* GROUPES TAB */}
          {activeTab === 'groups' && (
            <View style={styles.section}>
              {groups.map((group) => (
                <TouchableOpacity key={group.id} activeOpacity={0.7}>
                  <View style={styles.groupCard}>
                    <View style={styles.groupHeader}>
                      <View style={[styles.groupIcon, { backgroundColor: `${group.color}30` }]}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={group.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          <Circle cx={9} cy={7} r={4} stroke={group.color} strokeWidth={2}/>
                          <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={group.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupMeta}>{group.members} membres • {group.notes} notes</Text>
                      </View>
                    </View>

                    <View style={styles.groupRanking}>
                      <Text style={styles.rankingTitle}>Top contributeurs</Text>
                      <View style={styles.rankingList}>
                        {group.topContributors.map((contributor, index) => (
                          <View key={index} style={styles.rankingItem}>
                            <View style={[styles.rankingPosition, index === 0 && styles.rankingPositionTop]}>
                              <Text style={[styles.rankingPositionText, index === 0 && styles.rankingPositionTextTop]}>
                                {index + 1}
                              </Text>
                            </View>
                            <LinearGradient
                              colors={contributor.isYou ? ['#23243b', '#2d2e4f'] : ['#ec4899', '#a7bdd9']}
                              start={{x: 0, y: 0}}
                              end={{x: 1, y: 1}}
                              style={styles.rankingAvatar}
                            >
                              <Text style={styles.rankingAvatarText}>{contributor.avatar}</Text>
                            </LinearGradient>
                            <View style={styles.rankingUser}>
                              <Text style={styles.rankingUserName}>{contributor.name}</Text>
                            </View>
                            <View style={styles.rankingPoints}>
                              <Text style={styles.rankingPointsText}>{contributor.points} pts</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="white" strokeWidth={2}/>
                        <Polyline points="16 6 12 2 8 6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        <Line x1={12} y1={2} x2={12} y2={15} stroke="white" strokeWidth={2} strokeLinecap="round"/>
                      </Svg>
                      <Text style={styles.shareButtonText}>Partager une note</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={{height: 40}} />
            </View>
          )}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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

  // GLASS CARD
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ticketPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ticketQR: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketEventName: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  ticketEventDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // EVENT CARD
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
    position: 'relative',
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
    fontSize: 12,
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

  // ASSO STYLES
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
    top: 50,
    left: 16,
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  assoEmoji: {
    fontSize: 32,
  },
  assoContent: {
    padding: 16,
    paddingTop: 45,
  },
  assoName: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  assoDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  assoStats: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  assoStat: {
    flexDirection: 'column',
    gap: 2,
  },
  assoStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  assoStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  followButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  followButtonGradient: {
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
  },
  followButtonInactive: {
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  registerAssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 24,
  },
  registerAssoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // GROUP STYLES
  groupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 14,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  groupRanking: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  rankingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
  },
  rankingList: {
    gap: 10,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankingPosition: {
    width: 26,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingPositionTop: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  rankingPositionText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
  },
  rankingPositionTextTop: {
    color: '#fbbf24',
  },
  rankingAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  rankingUser: {
    flex: 1,
  },
  rankingUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  rankingPoints: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(167, 189, 217, 0.2)',
  },
  rankingPointsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#a7bdd9',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 14,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});