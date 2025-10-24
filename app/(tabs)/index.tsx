import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Icônes
function ArrowRightIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// Onde sonore moderne et animée
function ModernSoundWave() {
  const bars = 40;
  const animatedValues = useRef(
    Array(bars).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 30),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      );
    });
    Animated.stagger(50, animations).start();
  }, []);

  return (
    <View style={styles.modernWave}>
      {animatedValues.map((animatedValue, index) => {
        const height = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [4, index % 3 === 0 ? 48 : index % 2 === 0 ? 36 : 24],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.modernBar,
              {
                height,
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Shimmer effect component
function ShimmerEffect() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  return (
    <Animated.View
      style={[
        styles.shimmerOverlay,
        {
          transform: [{ translateX }],
        },
      ]}
    />
  );
}

// FAB avec pulse
function ScanFAB() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.fabContainer}>
      <Animated.View style={[styles.fabGlow, { opacity: glowOpacity }]} />
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient colors={['#7566d9', '#a7bdd9']} style={styles.fabGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              <Circle cx={12} cy={13} r={4} stroke="#ffffff" strokeWidth={2}/>
            </Svg>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const { signOut } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient 
        colors={['#1a1b2e', '#16213e', '#23243b']}
        style={styles.background}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View>
              <Text style={styles.greeting}>Salut Marco 👋</Text>
              <Text style={styles.subtitle}>Mardi 14 octobre</Text>
            </View>
            <View style={styles.premiumWrapper}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
                style={styles.premiumBadge}
              >
                <Text style={styles.premiumText}>💎</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Good Morning Card */}
          <View style={styles.section}>
            <View style={styles.heroCard}>
              <ShimmerEffect />
              <LinearGradient
                colors={['rgba(117, 102, 217, 0.1)', 'rgba(167, 189, 217, 0.05)']}
                style={styles.heroGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.heroTitle}>Good Morning</Text>
                    <Text style={styles.heroSubtitle}>Ton briefing quotidien</Text>
                  </View>
                  <Text style={styles.heroEmoji}>🌅</Text>
                </View>
                
                <View style={styles.audioPlayerContainer}>
                  <TouchableOpacity style={styles.playButton} activeOpacity={0.7}>
                    <LinearGradient 
                      colors={['#7566d9', '#a7bdd9']} 
                      style={styles.playGradient}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                    >
                      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                        <Path d="M8 5v14l11-7L8 5z" fill="#ffffff" />
                      </Svg>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <ModernSoundWave />
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.08)', 'rgba(167, 189, 217, 0.04)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>Cours aujourd'hui</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.08)', 'rgba(220, 38, 38, 0.04)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>2</Text>
                  <Text style={styles.statLabel}>Tâches urgentes</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.04)']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>1</Text>
                  <Text style={styles.statLabel}>Événement</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Ta journée */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À venir</Text>
            
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.itemCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={styles.itemGradient}
                >
                  <View style={styles.itemContent}>
                    <View style={[styles.itemIcon, {backgroundColor: 'rgba(117, 102, 217, 0.15)'}]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                        <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
                      </Svg>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemLabel}>14:00 - 16:00</Text>
                      <Text style={styles.itemTitle}>Mathématiques</Text>
                      <Text style={styles.itemDetail}>Amphi A • Prof. Durand</Text>
                    </View>
                  </View>
                  <ArrowRightIcon />
                </LinearGradient>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.itemCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={styles.itemGradient}
                >
                  <View style={styles.itemContent}>
                    <View style={[styles.itemIcon, {backgroundColor: 'rgba(239, 68, 68, 0.15)'}]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M9 11l3 3L22 4" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemLabel}>URGENT</Text>
                      <Text style={styles.itemTitle}>Rendu projet React</Text>
                      <Text style={styles.itemDetail}>Deadline : Demain 23h59</Text>
                    </View>
                  </View>
                  <ArrowRightIcon />
                </LinearGradient>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.itemCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={styles.itemGradient}
                >
                  <View style={styles.itemContent}>
                    <View style={[styles.itemIcon, {backgroundColor: 'rgba(236, 72, 153, 0.15)'}]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#ec4899" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        <Circle cx={9} cy={7} r={4} stroke="#ec4899" strokeWidth={2}/>
                        <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#ec4899" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemLabel}>20:00</Text>
                      <Text style={styles.itemTitle}>Soirée BDE</Text>
                      <Text style={styles.itemDetail}>Foyer étudiant • 50 participants</Text>
                    </View>
                  </View>
                  <ArrowRightIcon />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>

          {/* Actions rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.1)', 'rgba(167, 189, 217, 0.05)']}
                  style={styles.actionGradient}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5v14M5 12h14" stroke="#a7bdd9" strokeWidth={2.5} strokeLinecap="round"/>
                  </Svg>
                  <Text style={styles.actionText}>Nouvelle tâche</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.1)', 'rgba(167, 189, 217, 0.05)']}
                  style={styles.actionGradient}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="#a7bdd9" strokeWidth={2} strokeLinecap="round"/>
                    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#a7bdd9" strokeWidth={2} strokeLinecap="round"/>
                  </Svg>
                  <Text style={styles.actionText}>Voir emploi du temps</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feed */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pour toi</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Voir tout →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.feedScroll}
            >
              <View style={styles.feedCard}>
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.08)', 'rgba(167, 189, 217, 0.04)']}
                  style={styles.feedGradient}
                >
                  <View style={styles.feedIcon}>
                    <Text style={{fontSize: 32}}>💡</Text>
                  </View>
                  <Text style={styles.feedCategory}>TIP DU JOUR</Text>
                  <Text style={styles.feedTitle}>Technique Pomodoro</Text>
                  <Text style={styles.feedText}>25 min focus, 5 min pause</Text>
                </LinearGradient>
              </View>

              <View style={styles.feedCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.04)']}
                  style={styles.feedGradient}
                >
                  <View style={styles.feedIcon}>
                    <Text style={{fontSize: 32}}>🏷️</Text>
                  </View>
                  <Text style={styles.feedCategory}>BON PLAN</Text>
                  <Text style={styles.feedTitle}>Spotify Premium</Text>
                  <Text style={styles.feedText}>-50% pour les étudiants</Text>
                </LinearGradient>
              </View>

              <View style={styles.feedCard}>
                <LinearGradient
                  colors={['rgba(236, 72, 153, 0.08)', 'rgba(219, 39, 119, 0.04)']}
                  style={styles.feedGradient}
                >
                  <View style={styles.feedIcon}>
                    <Text style={{fontSize: 32}}>🎭</Text>
                  </View>
                  <Text style={styles.feedCategory}>ÉVÉNEMENT</Text>
                  <Text style={styles.feedTitle}>BDE Party</Text>
                  <Text style={styles.feedText}>Vendredi 20h au foyer</Text>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>

          <View style={{height: 140}} />
        </ScrollView>

        <ScanFAB />
      </LinearGradient>
      {/* Bouton déconnexion temporaire */}
<TouchableOpacity
  style={{
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  }}
  onPress={async () => {
    await signOut();
  }}
  activeOpacity={0.7}
>
  <Text style={{ color: '#ffffff', fontWeight: '600' }}>
    Déconnexion
  </Text>
</TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  premiumWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  premiumBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  premiumText: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a7bdd9',
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    transform: [{ skewX: '-20deg' }],
  },
  heroGradient: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  heroEmoji: {
    fontSize: 32,
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  playGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7566d9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modernWave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 64,
  },
  modernBar: {
    width: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  itemCard: {
    marginBottom: 10,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  itemDetail: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionsGrid: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.15)',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  feedScroll: {
    paddingRight: 20,
  },
  feedCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedGradient: {
    padding: 20,
  },
  feedIcon: {
    marginBottom: 12,
  },
  feedCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  feedText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 18,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7566d9',
    top: -2,
    left: -2,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7566d9',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
});