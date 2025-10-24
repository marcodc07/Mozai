import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function SelectUniversityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erreur chargement universités:', error);
    } else {
      setUniversities(data || []);
    }
  };

  const handleSelectUniversity = async () => {
    if (!selectedUniversity) {
      Alert.alert('Erreur', 'Veuillez sélectionner une université');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ university_id: selectedUniversity })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
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
        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Quelle est ton université ?</Text>
            <Text style={styles.subtitle}>
              Sélectionne ton établissement pour découvrir les événements et associations de ton campus
            </Text>
          </View>

          <View style={styles.universitiesList}>
            {universities.map((uni) => (
              <TouchableOpacity
                key={uni.id}
                style={[
                  styles.universityCard,
                  selectedUniversity === uni.id && styles.universityCardSelected
                ]}
                onPress={() => setSelectedUniversity(uni.id)}
                activeOpacity={0.7}
              >
                <View style={styles.universityContent}>
                  <View style={styles.universityIcon}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <Path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke={selectedUniversity === uni.id ? '#7566d9' : 'rgba(255,255,255,0.5)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M6 12v5c3 3 9 3 12 0v-5" stroke={selectedUniversity === uni.id ? '#7566d9' : 'rgba(255,255,255,0.5)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                  <View style={styles.universityInfo}>
                    <Text style={[
                      styles.universityName,
                      selectedUniversity === uni.id && styles.universityNameSelected
                    ]}>
                      {uni.name}
                    </Text>
                    <Text style={styles.universityCity}>{uni.city}</Text>
                  </View>
                  {selectedUniversity === uni.id && (
                    <View style={styles.checkmark}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Circle cx={12} cy={12} r={10} fill="#7566d9"/>
                        <Path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.notListedButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.notListedText}>Mon université n'est pas listée</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, !selectedUniversity && styles.continueButtonDisabled]}
            onPress={handleSelectUniversity}
            disabled={!selectedUniversity || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedUniversity ? ['#7566d9', '#5b4fc9'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.continueButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={[
                styles.continueButtonText,
                !selectedUniversity && styles.continueButtonTextDisabled
              ]}>
                {loading ? 'Chargement...' : 'Continuer'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Passer cette étape</Text>
          </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  universitiesList: {
    gap: 12,
    marginBottom: 24,
  },
  universityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  universityCardSelected: {
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    borderColor: 'rgba(117, 102, 217, 0.4)',
  },
  universityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  universityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  universityNameSelected: {
    color: '#ffffff',
  },
  universityCity: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  checkmark: {
    marginLeft: 8,
  },
  notListedButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  notListedText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'underline',
  },
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  continueButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});