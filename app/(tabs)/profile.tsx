//import BecomeAdminModal from '@/components/BecomeAdminModal';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export default function ProfileScreen() {
    const [becomeAdminModalVisible, setBecomeAdminModalVisible] = useState(false);
  const { user, profile, signOut: authSignOut } = useAuth();
  const [isPremium, setIsPremium] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifCourses, setNotifCourses] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifGroups, setNotifGroups] = useState(false);
  const [notifDeals, setNotifDeals] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes tes données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient 
        colors={['#1a1b2e', '#16213e', '#23243b']}
        locations={[0, 0.5, 1]}
        style={styles.background}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Profile */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={['#7566d9', '#a7bdd9']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</Text>
            </LinearGradient>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{profile?.full_name || 'Utilisateur'}</Text>
                {isPremium && (
                  <LinearGradient
                    colors={['#fbbf24', '#f59e0b']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.premiumBadge}
                  >
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="white">
                      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </Svg>
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </LinearGradient>
                )}
              </View>
              {(profile?.email || user?.email) && (
  <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
)}
              <View style={styles.schoolRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M6 12v5c3 3 9 3 12 0v-5" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.userSchool}>{'Université'}</Text>
              </View>
              <Text style={styles.userLevel}>{profile?.level || 'Étudiant'}</Text>
            </View>
          </View>

          {/* Section Admin */}
{profile?.is_admin ? (
  <View style={styles.adminSection}>
    <LinearGradient
      colors={['rgba(117, 102, 217, 0.2)', 'rgba(117, 102, 217, 0.1)']}
      style={styles.adminBadge}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          stroke="#7566d9"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
          stroke="#7566d9"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.adminBadgeText}>Mode Admin</Text>
      <View style={styles.adminStatusBadge}>
        <Text style={styles.adminStatusText}>
          {profile?.admin_subscription_status === 'trial' ? 'Essai gratuit' :
           profile?.admin_subscription_status === 'active' ? 'Actif' : 'Expiré'}
        </Text>
      </View>
    </LinearGradient>
    <Text style={styles.adminDescription}>
      Vous pouvez créer et gérer des associations
    </Text>
  </View>
) : (
  <TouchableOpacity
    style={styles.becomeAdminButton}
    onPress={() => setBecomeAdminModalVisible(true)}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.08)']}
      style={styles.becomeAdminButtonGradient}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          stroke="#7566d9"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
          stroke="#7566d9"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.becomeAdminContent}>
        <Text style={styles.becomeAdminTitle}>Devenir Admin</Text>
        <Text style={styles.becomeAdminSubtitle}>
          Créez et gérez vos associations
        </Text>
      </View>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18l6-6-6-6" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </LinearGradient>
  </TouchableOpacity>
)}

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>47</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Groupes</Text>
            </View>
          </View>

          {/* Subscription Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abonnement</Text>
            
            {isPremium ? (
              <View style={styles.subscriptionCard}>
                <LinearGradient
                  colors={['rgba(251, 191, 36, 0.2)', 'rgba(245, 158, 11, 0.2)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.premiumCard}
                >
                  <View style={styles.premiumHeader}>
                    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#fbbf24" strokeWidth={2} fill="#fbbf24"/>
                    </Svg>
                    <View style={styles.premiumTextBlock}>
                      <Text style={styles.premiumTitle}>Mozaï Premium</Text>
                      <Text style={styles.premiumSubtitle}>Actif jusqu'au 12 janvier 2025</Text>
                    </View>
                  </View>

                  <View style={styles.premiumFeatures}>
                    <View style={styles.premiumFeature}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Polyline points="20 6 9 17 4 12" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                      <Text style={styles.premiumFeatureText}>Résumés IA illimités</Text>
                    </View>
                    <View style={styles.premiumFeature}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Polyline points="20 6 9 17 4 12" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                      <Text style={styles.premiumFeatureText}>Message audio quotidien</Text>
                    </View>
                    <View style={styles.premiumFeature}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Polyline points="20 6 9 17 4 12" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                      <Text style={styles.premiumFeatureText}>Accès prioritaire événements</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.managePremiumButton} activeOpacity={0.7}>
                    <Text style={styles.managePremiumText}>Gérer mon abonnement</Text>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <TouchableOpacity style={styles.upgradeCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#7566d9', '#a7bdd9']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.upgradeGradient}
                >
                  <View style={styles.upgradeHeader}>
                    <Text style={styles.upgradeTitle}>Passe à Premium</Text>
                    <Text style={styles.upgradePrice}>6,99€/mois</Text>
                  </View>
                  <Text style={styles.upgradeDescription}>
                    Débloque toutes les fonctionnalités et profite de Mozaï sans limites
                  </Text>
                  <View style={styles.upgradeButton}>
                    <Text style={styles.upgradeButtonText}>Découvrir Premium</Text>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Polyline points="9 18 15 12 9 6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>
            
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(117, 102, 217, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    <Circle cx={12} cy={7} r={4} stroke="#7566d9" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Modifier mon profil</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => {
                console.log('Navigation vers my-events');
                router.push('/my-events');
              }}
>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(124, 72, 19, 0.2)' }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Rect x={2} y={7} width={20} height={14} rx={2} stroke="#b57c26ff" strokeWidth={2}/>
                  <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="#b57c26ff" strokeWidth={2}/>
                </Svg>
              </View>
              <Text style={styles.menuItemText}>Mes événements</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(167, 189, 217, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} stroke="#a7bdd9" strokeWidth={2}/>
                    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#a7bdd9" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Mot de passe et sécurité</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#3b82f6" strokeWidth={2}/>
                    <Polyline points="22,6 12,13 2,6" stroke="#3b82f6" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Adresse email</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Vérifiée</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.notifCard}>
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                  <Text style={styles.menuItemText}>Notifications push</Text>
                </View>
                <Switch
                  value={notifPush}
                  onValueChange={setNotifPush}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#ec4899" strokeWidth={2}/>
                      <Polyline points="22,6 12,13 2,6" stroke="#ec4899" strokeWidth={2}/>
                    </Svg>
                  </View>
                  <Text style={styles.menuItemText}>Notifications par email</Text>
                </View>
                <Switch
                  value={notifEmail}
                  onValueChange={setNotifEmail}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.subSectionTitle}>Par type</Text>

              <View style={styles.subMenuItem}>
                <Text style={styles.subMenuItemText}>Cours et emploi du temps</Text>
                <Switch
                  value={notifCourses}
                  onValueChange={setNotifCourses}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>

              <View style={styles.subMenuItem}>
                <Text style={styles.subMenuItemText}>Événements et soirées</Text>
                <Switch
                  value={notifEvents}
                  onValueChange={setNotifEvents}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>

              <View style={styles.subMenuItem}>
                <Text style={styles.subMenuItemText}>Groupes et notes</Text>
                <Switch
                  value={notifGroups}
                  onValueChange={setNotifGroups}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>

              <View style={styles.subMenuItem}>
                <Text style={styles.subMenuItemText}>Bons plans</Text>
                <Switch
                  value={notifDeals}
                  onValueChange={setNotifDeals}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.subMenuItem}>
                <Text style={styles.subMenuItemText}>Résumé quotidien (8h00)</Text>
                <Switch
                  value={dailySummary}
                  onValueChange={setDailySummary}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#7566d9' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={10} stroke="#8b5cf6" strokeWidth={2}/>
                    <Line x1={2} y1={12} x2={22} y2={12} stroke="#8b5cf6" strokeWidth={2}/>
                    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#8b5cf6" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Langue</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Français</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={5} stroke="#f59e0b" strokeWidth={2}/>
                    <Line x1={12} y1={1} x2={12} y2={3} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={12} y1={21} x2={12} y2={23} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={1} y1={12} x2={3} y2={12} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={21} y1={12} x2={23} y2={12} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Apparence</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Sombre</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </TouchableOpacity>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confidentialité</Text>
            
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#3b82f6" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Données personnelles</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#10b981" strokeWidth={2}/>
                    <Circle cx={12} cy={12} r={3} stroke="#10b981" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Visibilité du profil</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Public</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={10} stroke="#8b5cf6" strokeWidth={2}/>
                    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={12} y1={17} x2={12.01} y2={17} stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round"/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Centre d'aide</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#10b981" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Contacter le support</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#ef4444" strokeWidth={2}/>
                    <Line x1={12} y1={9} x2={12} y2={13} stroke="#ef4444" strokeWidth={2} strokeLinecap="round"/>
                    <Line x1={12} y1={17} x2={12.01} y2={17} stroke="#ef4444" strokeWidth={2} strokeLinecap="round"/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Signaler un problème</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(167, 189, 217, 0.2)' }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#a7bdd9" strokeWidth={2}/>
                    <Polyline points="14 2 14 8 20 8" stroke="#a7bdd9" strokeWidth={2}/>
                    <Line x1={16} y1={13} x2={8} y2={13} stroke="#a7bdd9" strokeWidth={2}/>
                    <Line x1={16} y1={17} x2={8} y2={17} stroke="#a7bdd9" strokeWidth={2}/>
                  </Svg>
                </View>
                <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Polyline points="9 18 15 12 9 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View style={styles.footerInfo}>
            <Text style={styles.versionText}>Mozaï v1.0.0</Text>
            <Text style={styles.memberSinceText}>
  Membre depuis {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'récemment'}
</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              <Polyline points="16 17 21 12 16 7" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              <Line x1={21} y1={12} x2={9} y2={12} stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity 
            style={styles.deleteAccountButton} 
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
        {/* Modal Devenir Admin */}
{/* <BecomeAdminModal
  visible={becomeAdminModalVisible}
  onClose={() => setBecomeAdminModalVisible(false)}
  onSuccess={() => refreshProfile()}
/> */}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userSchool: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userLevel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  subscriptionCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  premiumTextBlock: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  premiumFeatures: {
    gap: 10,
    marginBottom: 16,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  premiumFeatureText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  managePremiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  managePremiumText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upgradeCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  upgradeGradient: {
    padding: 20,
  },
  upgradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  upgradePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  upgradeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  notifCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  subMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  memberSinceText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(239, 68, 68, 0.6)',
    textDecorationLine: 'underline',
  },
  // Styles Admin
  adminSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  adminBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7566d9',
    flex: 1,
  },
  adminStatusBadge: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7566d9',
    textTransform: 'uppercase',
  },
  adminDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 4,
  },

  becomeAdminButton: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  becomeAdminButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  becomeAdminContent: {
    flex: 1,
  },
  becomeAdminTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  becomeAdminSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});