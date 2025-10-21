import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export default function DealsScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'tech', label: 'Tech' },
    { id: 'food', label: 'Food' },
    { id: 'fashion', label: 'Mode' },
    { id: 'transport', label: 'Transport' },
    { id: 'sport', label: 'Sport' },
  ];

  const featuredDeals = [
    { 
      id: 1, 
      brand: 'Spotify Premium', 
      description: '6 mois offerts pour les nouveaux étudiants inscrits sur Mozaï', 
      discount: '50%', 
      logo: 'S', 
      color: '#1ed760',
      gradient: ['#1ed760', '#1aa34a']
    },
    { 
      id: 2, 
      brand: 'Adobe Creative Cloud', 
      description: 'Suite complète Photoshop, Illustrator, Premiere Pro et plus', 
      discount: '60%', 
      logo: 'A', 
      color: '#ff0000',
      gradient: ['#ff0000', '#cc0000']
    },
    { 
      id: 3, 
      brand: 'Amazon Prime Student', 
      description: 'Livraison gratuite + Prime Video + offres exclusives', 
      discount: '50%', 
      logo: 'P', 
      color: '#ff9900',
      gradient: ['#ff9900', '#e68a00']
    },
  ];

  const deals = {
    streaming: [
      { id: 4, brand: 'Spotify Premium', description: 'Musique illimitée sans pub', discount: '50', type: '%', logo: 'S', color: '#1ed760' },
      { id: 5, brand: 'Apple Music', description: 'Accès à 60M de titres', discount: '5,99', type: '€', logo: 'A', color: '#fa2d48' },
      { id: 6, brand: 'YouTube Premium', description: 'Sans pub + YouTube Music', discount: '30', type: '%', logo: 'Y', color: '#ff0000' },
    ],
    tech: [
      { id: 7, brand: 'Apple Education', description: 'Mac, iPad et accessoires', discount: '10', type: '%', logo: '🍎', color: '#555555' },
      { id: 8, brand: 'Adobe Creative', description: 'Suite complète créative', discount: '60', type: '%', logo: 'A', color: '#ff0000' },
      { id: 9, brand: 'Canva Pro', description: 'Design pro pour étudiants', discount: 'Free', type: '', logo: 'C', color: '#00c4cc' },
      { id: 10, brand: 'Microsoft 365', description: 'Office gratuit', discount: 'Free', type: '', logo: 'M', color: '#0078d4' },
      { id: 11, brand: 'Notion', description: 'Plan Education gratuit', discount: 'Free', type: '', logo: 'N', color: '#000000' },
    ],
    food: [
      { id: 12, brand: "McDonald's", description: 'Menu étudiant', discount: '20', type: '%', logo: 'M', color: '#ffc72c' },
      { id: 13, brand: "Domino's Pizza", description: 'Commande en ligne', discount: '25', type: '%', logo: 'D', color: '#e31837' },
      { id: 14, brand: 'Uber Eats', description: 'Première commande', discount: '10', type: '€', logo: 'U', color: '#06c167' },
    ],
    fashion: [
      { id: 15, brand: 'ASOS', description: 'Mode en ligne', discount: '10', type: '%', logo: 'A', color: '#000000' },
      { id: 16, brand: 'Nike', description: 'Programme étudiant', discount: '10', type: '%', logo: 'N', color: '#ee4d2d' },
      { id: 17, brand: 'Adidas', description: 'Vêtements et chaussures', discount: '15', type: '%', logo: 'A', color: '#000000' },
    ],
    transport: [
      { id: 18, brand: 'SNCF', description: 'Carte Avantage Jeune', discount: '30', type: '%', logo: 'S', color: '#82be00' },
      { id: 19, brand: 'BlaBlaCar', description: 'Premier trajet', discount: '10', type: '€', logo: 'B', color: '#009bdc' },
      { id: 20, brand: 'Uber', description: 'Premiers trajets', discount: '15', type: '€', logo: 'U', color: '#000000' },
    ],
    sport: [
      { id: 21, brand: 'Basic-Fit', description: 'Abonnement salle', discount: '19,99', type: '€', logo: 'B', color: '#ff6600' },
      { id: 22, brand: 'Decathlon', description: 'Carte fidélité', discount: '10', type: '%', logo: 'D', color: '#1e40af' },
      { id: 23, brand: 'Nike Training', description: 'App premium', discount: 'Free', type: '', logo: 'N', color: '#ee4d2d' },
    ],
  };

  const getCategoryIcon = (categoryId: string) => {
    const iconProps = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none" };
    switch (categoryId) {
      case 'streaming':
        return <Svg {...iconProps}><Polygon points="5 3 19 12 5 21 5 3" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
      case 'tech':
        return <Svg {...iconProps}><Rect x={2} y={3} width={20} height={14} rx={2} stroke="#7566d9" strokeWidth={2}/><Line x1={8} y1={21} x2={16} y2={21} stroke="#7566d9" strokeWidth={2}/><Line x1={12} y1={17} x2={12} y2={21} stroke="#7566d9" strokeWidth={2}/></Svg>;
      case 'food':
        return <Svg {...iconProps}><Path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="#7566d9" strokeWidth={2}/><Line x1={6} y1={1} x2={6} y2={4} stroke="#7566d9" strokeWidth={2}/><Line x1={10} y1={1} x2={10} y2={4} stroke="#7566d9" strokeWidth={2}/><Line x1={14} y1={1} x2={14} y2={4} stroke="#7566d9" strokeWidth={2}/></Svg>;
      case 'fashion':
        return <Svg {...iconProps}><Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="#7566d9" strokeWidth={2}/><Line x1={7} y1={7} x2={7.01} y2={7} stroke="#7566d9" strokeWidth={2}/></Svg>;
      case 'transport':
        return <Svg {...iconProps}><Rect x={1} y={3} width={15} height={13} stroke="#7566d9" strokeWidth={2}/><Polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="#7566d9" strokeWidth={2}/><Circle cx={5.5} cy={18.5} r={2.5} stroke="#7566d9" strokeWidth={2}/><Circle cx={18.5} cy={18.5} r={2.5} stroke="#7566d9" strokeWidth={2}/></Svg>;
      case 'sport':
        return <Svg {...iconProps}><Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
      default:
        return null;
    }
  };

  const getFilteredDeals = () => {
    let filtered: any[] = [];
    
    if (activeCategory === 'all') {
      Object.values(deals).forEach(categoryDeals => {
        filtered = [...filtered, ...categoryDeals];
      });
    } else {
      filtered = deals[activeCategory as keyof typeof deals] || [];
    }

    if (searchQuery) {
      filtered = filtered.filter(deal => 
        deal.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const renderDealsByCategory = () => {
    if (searchQuery) {
      const filtered = getFilteredDeals();
      return (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Résultats de recherche</Text>
          {filtered.map(deal => (
            <TouchableOpacity key={deal.id} activeOpacity={0.7}>
              <View style={styles.dealCard}>
                <View style={[styles.dealLogo, { backgroundColor: deal.color }]}>
                  <Text style={styles.dealLogoText}>{deal.logo}</Text>
                </View>
                <View style={styles.dealContent}>
                  <View style={styles.dealHeader}>
                    <Text style={styles.dealBrand}>{deal.brand}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountValue}>{deal.discount}</Text>
                      <Text style={styles.discountType}>{deal.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.dealDescription}>{deal.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (activeCategory === 'all') {
      return Object.entries(deals).map(([categoryId, categoryDeals]) => (
        <View key={categoryId} style={styles.categorySection}>
          <View style={styles.categorySectionHeader}>
            <View style={styles.categoryIconWrapper}>
              {getCategoryIcon(categoryId)}
            </View>
            <Text style={styles.categoryTitle}>
              {categories.find(c => c.id === categoryId)?.label}
            </Text>
          </View>
          {categoryDeals.map(deal => (
            <TouchableOpacity key={deal.id} activeOpacity={0.7}>
              <View style={styles.dealCard}>
                <View style={[styles.dealLogo, { backgroundColor: deal.color }]}>
                  <Text style={styles.dealLogoText}>{deal.logo}</Text>
                </View>
                <View style={styles.dealContent}>
                  <View style={styles.dealHeader}>
                    <Text style={styles.dealBrand}>{deal.brand}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountValue}>{deal.discount}</Text>
                      <Text style={styles.discountType}>{deal.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.dealDescription}>{deal.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ));
    }

    const categoryDeals = deals[activeCategory as keyof typeof deals] || [];
    return (
      <View style={styles.categorySection}>
        <View style={styles.categorySectionHeader}>
          <View style={styles.categoryIconWrapper}>
            {getCategoryIcon(activeCategory)}
          </View>
          <Text style={styles.categoryTitle}>
            {categories.find(c => c.id === activeCategory)?.label}
          </Text>
        </View>
        {categoryDeals.map(deal => (
          <TouchableOpacity key={deal.id} activeOpacity={0.7}>
            <View style={styles.dealCard}>
              <View style={[styles.dealLogo, { backgroundColor: deal.color }]}>
                <Text style={styles.dealLogoText}>{deal.logo}</Text>
              </View>
              <View style={styles.dealContent}>
                <View style={styles.dealHeader}>
                  <Text style={styles.dealBrand}>{deal.brand}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountValue}>{deal.discount}</Text>
                    <Text style={styles.discountType}>{deal.type}</Text>
                  </View>
                </View>
                <Text style={styles.dealDescription}>{deal.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
        {/* Hero Header */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Bons Plans Étudiants</Text>
          <Text style={styles.heroSubtitle}>Des réductions exclusives pour toi</Text>
          
          <View style={styles.searchBar}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={8} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
              <Path d="m21 21-4.35-4.35" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round"/>
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une marque..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.7}
                onPress={() => setActiveCategory(category.id)}
              >
                <View style={[
                  styles.categoryChip,
                  activeCategory === category.id && styles.categoryChipActive
                ]}>
                  <Text style={[
                    styles.categoryChipText,
                    activeCategory === category.id && styles.categoryChipTextActive
                  ]}>
                    {category.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Featured Deals */}
          {activeCategory === 'all' && !searchQuery && (
            <View style={styles.featuredSection}>
              <Text style={styles.featuredTitle}>À la une</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScroll}
              >
                {featuredDeals.map((deal) => (
                  <TouchableOpacity key={deal.id} activeOpacity={0.8}>
                    <LinearGradient
                      colors={deal.gradient}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.featuredCard}
                    >
                      <View style={styles.featuredBadge}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="white">
                          <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </Svg>
                        <Text style={styles.featuredBadgeText}>Exclusif</Text>
                      </View>

                      <View style={styles.featuredLogoWrapper}>
                        <View style={styles.featuredLogo}>
                          <Text style={styles.featuredLogoText}>{deal.logo}</Text>
                        </View>
                      </View>

                      <Text style={styles.featuredBrand}>{deal.brand}</Text>
                      <Text style={styles.featuredDescription}>{deal.description}</Text>

                      <View style={styles.featuredFooter}>
                        <View style={styles.featuredDiscount}>
                          <Text style={styles.featuredDiscountValue}>-{deal.discount}</Text>
                        </View>
                        <View style={styles.featuredButton}>
                          <Text style={styles.featuredButtonText}>Voir l'offre</Text>
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <Polyline points="9 18 15 12 9 6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          </Svg>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Regular Deals */}
          <View style={styles.dealsSection}>
            {renderDealsByCategory()}
          </View>

          <View style={{height: 100}} />
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
  hero: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(117, 102, 217, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  categoriesWrapper: {
    backgroundColor: 'rgba(35, 36, 59, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.25)',
    borderColor: 'rgba(117, 102, 217, 0.5)',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },

  // FEATURED SECTION
  featuredSection: {
    marginBottom: 32,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  featuredScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: 300,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredLogoWrapper: {
    marginBottom: 16,
  },
  featuredLogo: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredLogoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
  },
  featuredBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  featuredDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredDiscount: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  featuredDiscountValue: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },

  // DEALS SECTION
  dealsSection: {
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 28,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  categoryIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  dealCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dealLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealLogoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  dealContent: {
    flex: 1,
    justifyContent: 'center',
  },
  dealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dealBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#a7bdd9',
  },
  discountType: {
    fontSize: 13,
    fontWeight: '800',
    color: '#a7bdd9',
  },
  dealDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
});