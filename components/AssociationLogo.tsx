import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AssociationLogoProps {
  name: string;
  logoUrl?: string | null;
  emoji?: string | null;
  size?: number;
  style?: ViewStyle;
}

export default function AssociationLogo({
  name,
  logoUrl,
  emoji,
  size = 70,
  style,
}: AssociationLogoProps) {
  const getInitial = () => {
    return name.trim().charAt(0).toUpperCase() || 'A';
  };

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.26 }, style]}>
      {logoUrl ? (
        // Photo uploadée
        <Image source={{ uri: logoUrl }} style={styles.image} />
      ) : emoji ? (
        // Emoji (ancien système)
        <View style={styles.emojiContainer}>
          <Text style={[styles.emoji, { fontSize: size * 0.45 }]}>{emoji}</Text>
        </View>
      ) : (
        // Initiale avec gradient (par défaut)
        <LinearGradient
          colors={['#7566d9', '#a7bdd9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{getInitial()}</Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emojiContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  emoji: {
    fontWeight: '800',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: '800',
    color: '#ffffff',
  },
});