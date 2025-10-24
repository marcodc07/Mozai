import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setLoading(false);
      Alert.alert('Erreur d\'inscription', authError.message);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email.trim(),
            full_name: fullName,
            is_premium: false,
          },
        ]);

      setLoading(false);

      if (profileError) {
        console.error('Erreur création profil:', profileError);
      }

      Alert.alert(
        'Compte créé !',
        'Vérifie ton email pour confirmer ton inscription.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } else {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1b2e', '#16213e', '#23243b']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoins la communauté Mozaï</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                <Path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Circle cx={12} cy={7} r={4} stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                <Path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                />
                <Path d="M22 6l-10 7L2 6" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder="Email étudiant"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                <Rect
                  x={3}
                  y={11}
                  width={18}
                  height={11}
                  rx={2}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                />
                <Path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                <Rect
                  x={3}
                  y={11}
                  width={18}
                  height={11}
                  rx={2}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                />
                <Path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <Text style={styles.terms}>
              En créant un compte, tu acceptes nos{' '}
              <Text style={styles.termsLink}>Conditions d'utilisation</Text>
            </Text>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#7566d9', '#5b4fc9']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>S'inscrire</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>
                Déjà un compte ?{' '}
                <Text style={styles.loginTextBold}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 18,
  },
  terms: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  termsLink: {
    color: '#7566d9',
    fontWeight: '600',
  },
  signupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  loginTextBold: {
    color: '#7566d9',
    fontWeight: '700',
  },
});