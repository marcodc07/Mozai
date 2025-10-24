import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Bienvenue sur Mozaï',
    description: 'Toute ta vie étudiante centralisée en une seule application',
    icon: (
      <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#7566d9" strokeWidth={2} fill="rgba(117, 102, 217, 0.2)" strokeLinejoin="round"/>
        <Path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
  },
  {
    id: '2',
    title: 'Organise ta vie académique',
    description: 'Emploi du temps, to-do list, notes et résumés IA pour réussir tes études',
    icon: (
      <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#7566d9" strokeWidth={2} fill="rgba(117, 102, 217, 0.2)"/>
        <Line x1={16} y1={2} x2={16} y2={6} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
        <Line x1={8} y1={2} x2={8} y2={6} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
        <Line x1={3} y1={10} x2={21} y2={10} stroke="#7566d9" strokeWidth={2}/>
      </Svg>
    ),
  },
  {
    id: '3',
    title: 'Découvre et profite',
    description: 'Événements étudiants, associations et bons plans exclusifs pour toi',
    icon: (
      <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={10} stroke="#7566d9" strokeWidth={2} fill="rgba(117, 102, 217, 0.2)"/>
        <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
        <Line x1={9} y1={9} x2={9.01} y2={9} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
        <Line x1={15} y1={9} x2={15.01} y2={9} stroke="#7566d9" strokeWidth={2} strokeLinecap="round"/>
      </Svg>
    ),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/login');
    }
  };

  const skip = () => {
    router.push('/login');
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>{item.icon}</View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1a1b2e', '#16213e', '#23243b']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar style="light" />

      <TouchableOpacity style={styles.skipButton} onPress={skip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={goToNext}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#7566d9', '#5b4fc9']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#7566d9',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
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
});