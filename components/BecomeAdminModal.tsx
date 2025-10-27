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
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

interface BecomeAdminModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BecomeAdminModal({
  visible,
  onClose,
  onSuccess,
}: BecomeAdminModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBecomeAdmin = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Tu dois être connecté');
      return;
    }

    setLoading(true);

    // Mettre à jour le profil pour activer le mode admin
    const { error } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        admin_subscription_status: 'trial', // Essai gratuit pour l'instant
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert(
        '🎉 Félicitations !',
        'Tu es maintenant Admin ! Tu peux créer et gérer tes associations.',
        [
          {
            text: 'Super !',
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1b2e', '#16213e', '#23243b']}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Devenir Admin</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(117, 102, 217, 0.3)', 'rgba(117, 102, 217, 0.1)']}
                style={styles.iconCircle}
              >
                <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
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
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.title}>Prends les commandes</Text>
            <Text style={styles.subtitle}>
              Crée et gère tes propres associations étudiantes
            </Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle
                      cx={9}
                      cy={7}
                      r={4}
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Path
                      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Crée ton association</Text>
                  <Text style={styles.featureDescription}>
                    Lance ton projet associatif et rassemble ta communauté
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Organise des événements</Text>
                  <Text style={styles.featureDescription}>
                    Crée et gère tes soirées, conférences et activités
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      stroke="#ec4899"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Communique avec ta commu</Text>
                  <Text style={styles.featureDescription}>
                    Publie des posts, gère les commentaires et les likes
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle
                      cx={8.5}
                      cy={7}
                      r={4}
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Polyline
                      points="17 11 19 13 23 9"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Gère ton équipe</Text>
                  <Text style={styles.featureDescription}>
                    Ajoute des admins et modérateurs pour t'aider
                  </Text>
                </View>
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.pricingCard}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                style={styles.pricingGradient}
              >
                <View style={styles.pricingBadge}>
                  <Text style={styles.pricingBadgeText}>ESSAI GRATUIT</Text>
                </View>
                <Text style={styles.pricingTitle}>Accès complet pendant 30 jours</Text>
                <Text style={styles.pricingSubtitle}>
                  Teste toutes les fonctionnalités gratuitement
                </Text>
                <View style={styles.pricingFeatures}>
                  <View style={styles.pricingFeature}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Polyline
                        points="20 6 9 17 4 12"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.pricingFeatureText}>Associations illimitées</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Polyline
                        points="20 6 9 17 4 12"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.pricingFeatureText}>Événements illimités</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Polyline
                        points="20 6 9 17 4 12"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.pricingFeatureText}>Gestion complète</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleBecomeAdmin}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.ctaButton}
            >
              <LinearGradient
                colors={['#7566d9', '#5b4fc9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Activer le mode Admin</Text>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="#ffffff"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Pas de carte bancaire requise • Annule à tout moment
            </Text>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  pricingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pricingGradient: {
    padding: 24,
  },
  pricingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  pricingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  pricingFeatures: {
    gap: 12,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pricingFeatureText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  disclaimer: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 20,
  },
});