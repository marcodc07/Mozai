import EventDetailModal from '@/components/EventDetailModal';
import PostDetailModal from '@/components/PostDetailModal';
import AssociationLogo from '@/components/AssociationLogo';
import EditAssociationModal from '@/components/EditAssociationModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export default function AssociationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [association, setAssociation] = useState<any>(null);
  const [pinnedPosts, setPinnedPosts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showMediaGrid, setShowMediaGrid] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [isOwner, setIsOwner] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const followButtonScale = new Animated.Value(1);

  useEffect(() => {
    loadAssociationData();
  }, [id]);

  const loadAssociationData = async () => {
    if (!id) return;
    setLoading(true);

    const { data: assoData } = await supabase
      .from('associations')
      .select('*')
      .eq('id', id)
      .single();

    if (!assoData) {
      setLoading(false);
      return;
    }

    setAssociation(assoData);

    // Vérifier si l'utilisateur est le créateur
    if (user) {
      setIsOwner(assoData.created_by === user.id);
    }

    const { data: pinnedData } = await supabase
      .from('association_posts')
      .select('*')
      .eq('association_id', id)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(3);

    setPinnedPosts(pinnedData || []);

    const { data: postsData } = await supabase
      .from('association_posts')
      .select('*')
      .eq('association_id', id)
      .order('created_at', { ascending: false });

    setPosts(postsData || []);

    // Charger les likes de l'utilisateur
    if (user && postsData) {
      const postIds = postsData.map(p => p.id);
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set((likesData || []).map(l => l.post_id));
      setUserLikes(likedPostIds);
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { data: eventsData } = await supabase
      .from('events')
      .select(`
        *,
        association:associations(name, logo_emoji)
      `)
      .eq('association_id', id)
      .order('date', { ascending: true });

    setEvents(eventsData || []);
    
    const upcoming = (eventsData || []).filter((e: any) => e.date >= today);
    setUpcomingEventsCount(upcoming.length);

    const { data: membersData } = await supabase
      .from('association_members')
      .select('*')
      .eq('association_id', id)
      .order('display_order', { ascending: true });

    setMembers(membersData || []);

    if (user) {
      const { data: followData } = await supabase
        .from('association_followers')
        .select('id')
        .eq('user_id', user.id)
        .eq('association_id', id)
        .single();

      setIsFollowing(!!followData);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssociationData();
    setRefreshing(false);
  };

  const toggleFollow = async () => {
    if (!user) return;

    Animated.sequence([
      Animated.timing(followButtonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(followButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);

    if (!newFollowState) {
      await supabase
        .from('association_followers')
        .delete()
        .eq('user_id', user.id)
        .eq('association_id', id);

      setAssociation((prev: any) => ({ ...prev, followers_count: prev.followers_count - 1 }));
    } else {
      await supabase
        .from('association_followers')
        .insert([{ user_id: user.id, association_id: id }]);

      setAssociation((prev: any) => ({ ...prev, followers_count: prev.followers_count + 1 }));
    }
  };

  const toggleLike = async (postId: string, e?: any) => {
    if (e) e.stopPropagation();
    if (!user) return;

    const isCurrentlyLiked = userLikes.has(postId);
    const newLikedState = !isCurrentlyLiked;

    // Update local state immediately
    const newUserLikes = new Set(userLikes);
    if (newLikedState) {
      newUserLikes.add(postId);
    } else {
      newUserLikes.delete(postId);
    }
    setUserLikes(newUserLikes);

    // Update posts count immediately
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, likes_count: newLikedState ? p.likes_count + 1 : p.likes_count - 1 }
          : p
      )
    );

    setPinnedPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, likes_count: newLikedState ? p.likes_count + 1 : p.likes_count - 1 }
          : p
      )
    );

    // Update database
    if (newLikedState) {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
    } else {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    }
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
  };

  const getFilteredEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    if (showPastEvents) {
      return events.filter(e => e.date < today);
    }
    return events.filter(e => e.date >= today);
  };

  const getMediaPosts = () => {
    return posts.filter(p => p.media_type === 'photo' && p.media_url);
  };

  const openPostDetail = (post: any) => {
    setSelectedPost(post);
    setPostModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.loadingBackground}>
          <ActivityIndicator size="large" color="#7566d9" />
        </LinearGradient>
      </View>
    );
  }

  if (!association) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.loadingBackground}>
          <Text style={styles.errorText}>Association introuvable</Text>
        </LinearGradient>
      </View>
    );
  }

  const renderPost = (post: any, isPinned: boolean = false) => {
    const isLiked = userLikes.has(post.id);

    return (
      <TouchableOpacity key={post.id} activeOpacity={0.9} onPress={() => openPostDetail(post)}>
        <View style={[styles.postCard, isPinned && styles.pinnedPostCard]}>
          <LinearGradient
            colors={isPinned ? ['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)'] : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
            style={styles.postGradient}
          >
            {isPinned && (
              <View style={styles.pinnedBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#7566d9" />
                </Svg>
                <Text style={styles.pinnedText}>Épinglé</Text>
              </View>
            )}

            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <Text style={styles.postEmoji}>{association.logo_emoji}</Text>
                <View>
                  <Text style={styles.postAuthorName}>{association.name}</Text>
                  <Text style={styles.postDate}>{formatPostDate(post.created_at)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {post.media_type === 'photo' && post.media_url && (
              <Image source={{ uri: post.media_url }} style={styles.postImage} />
            )}

            {post.media_type === 'link' && (
              <View style={styles.linkCard}>
                <Text style={styles.linkTitle}>{post.link_title || 'Lien externe'}</Text>
                <Text style={styles.linkUrl}>{post.link_url}</Text>
              </View>
            )}

            <View style={styles.postFooter}>
              <TouchableOpacity
                style={styles.postAction}
                onPress={(e) => toggleLike(post.id, e)}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill={isLiked ? '#7566d9' : 'none'}>
                  <Path
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                    stroke={isLiked ? '#7566d9' : 'rgba(255,255,255,0.6)'}
                    strokeWidth={2}
                  />
                </Svg>
                <Text style={[styles.postStatText, isLiked && styles.postStatTextLiked]}>{post.likes_count}</Text>
              </TouchableOpacity>

              <View style={styles.postAction}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={2}
                  />
                </Svg>
                <Text style={styles.postStatText}>{post.comments_count}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7566d9" />}
        >
          {/* HEADER */}
          <View style={styles.coverContainer}>
            <LinearGradient
              colors={[association.color || '#7566d9', '#5b4fc9']}
              style={styles.cover}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <View style={styles.backButtonInner}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <AssociationLogo
                name={association.name}
                logoUrl={association.profile_photo_url}
                emoji={association.logo_emoji}
                size={90}
                style={{
                  borderWidth: 5,
                  borderColor: '#23243b',
                }}
              />
              </View>
            </View>
          </View>

          {/* INFOS PRINCIPALES */}
          <View style={styles.mainInfo}>
            <Text style={styles.assoName}>{association.name}</Text>
            <Text style={styles.shortDescription}>{association.short_description}</Text>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{association.followers_count}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{upcomingEventsCount}</Text>
                <Text style={styles.statLabel}>Événements</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{posts.length}</Text>
                <Text style={styles.statLabel}>Publications</Text>
              </View>
            </View>

            {isOwner ? (
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                activeOpacity={0.8}
                style={styles.followButtonWrapper}
              >
                <LinearGradient
                  colors={['rgba(117, 102, 217, 0.3)', 'rgba(117, 102, 217, 0.15)']}
                  style={styles.followButton}
                >
                  <Text style={styles.followButtonText}>Modifier</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ transform: [{ scale: followButtonScale }] }}>
              <TouchableOpacity onPress={toggleFollow} activeOpacity={0.8} style={styles.followButtonWrapper}>
                <LinearGradient
                  colors={isFollowing ? ['rgba(117, 102, 217, 0.3)', 'rgba(117, 102, 217, 0.15)'] : ['#7566d9', '#5b4fc9']}
                  style={styles.followButton}
                >
                  <Text style={styles.followButtonText}>{isFollowing ? '✓ Suivi' : 'Suivre'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            )}
          </View>

          {/* TABS */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { setActiveTab('posts'); setShowMediaGrid(false); }}
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Publications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { setActiveTab('about'); setShowMediaGrid(false); }}
              style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>À propos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { setActiveTab('events'); setShowMediaGrid(false); }}
              style={[styles.tab, activeTab === 'events' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Événements</Text>
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View style={styles.content}>
            {/* PUBLICATIONS */}
            {activeTab === 'posts' && !showMediaGrid && (
              <View>
                {pinnedPosts.length > 0 && (
                  <View style={styles.featuredSection}>
                    <Text style={styles.featuredTitle}>À la une</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                      {pinnedPosts.map(post => (
                        <TouchableOpacity key={post.id} style={styles.featuredCard} activeOpacity={0.9} onPress={() => openPostDetail(post)}>
                          {post.media_url && (
                            <Image source={{ uri: post.media_url }} style={styles.featuredImage} />
                          )}
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.featuredOverlay}
                          >
                            <Text style={styles.featuredContent} numberOfLines={2}>{post.content}</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.postsHeader}>
                  <Text style={styles.postsTitle}>Publications</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {isOwner && (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                          Alert.alert('Bientôt disponible', 'La création de post arrive bientôt !');
                        }}
                        activeOpacity={0.8}
                      >
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                          <Path d="M12 5v14M5 12h14" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" />
                        </Svg>
                      </TouchableOpacity>
                    )}
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={() => setShowMediaGrid(true)}
                    activeOpacity={0.8}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Rect x={3} y={3} width={7} height={7} stroke="#7566d9" strokeWidth={2} />
                      <Rect x={14} y={3} width={7} height={7} stroke="#7566d9" strokeWidth={2} />
                      <Rect x={3} y={14} width={7} height={7} stroke="#7566d9" strokeWidth={2} />
                      <Rect x={14} y={14} width={7} height={7} stroke="#7566d9" strokeWidth={2} />
                    </Svg>
                    <Text style={styles.mediaButtonText}>Médias</Text>
                  </TouchableOpacity>
                </View>

                {posts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aucune publication</Text>
                  </View>
                ) : (
                  posts.map(post => renderPost(post, false))
                )}
              </View>
            )}

            {/* GRILLE MÉDIAS */}
            {activeTab === 'posts' && showMediaGrid && (
              <View>
                <TouchableOpacity
                  style={styles.backToFeedButton}
                  onPress={() => setShowMediaGrid(false)}
                  activeOpacity={0.8}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                  <Text style={styles.backToFeedText}>Retour au fil</Text>
                </TouchableOpacity>

                <View style={styles.mediaGrid}>
                  {getMediaPosts().map(post => (
                    <TouchableOpacity key={post.id} style={styles.mediaGridItem} activeOpacity={0.9} onPress={() => openPostDetail(post)}>
                      <Image source={{ uri: post.media_url }} style={styles.mediaGridImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* À PROPOS */}
            {activeTab === 'about' && (
              <View>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z" stroke="#7566d9" strokeWidth={2} />
                    </Svg>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Type</Text>
                      <Text style={styles.infoValue}>{association.type || 'Association étudiante'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#7566d9" strokeWidth={2} />
                    </Svg>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Établissement</Text>
                      <Text style={styles.infoValue}>Université Panthéon-Assas</Text>
                    </View>
                  </View>

                  {association.year_founded && (
                    <View style={styles.infoRow}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#7566d9" strokeWidth={2} />
                        <Line x1={16} y1={2} x2={16} y2={6} stroke="#7566d9" strokeWidth={2} />
                        <Line x1={8} y1={2} x2={8} y2={6} stroke="#7566d9" strokeWidth={2} />
                      </Svg>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Année de création</Text>
                        <Text style={styles.infoValue}>{association.year_founded}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {association.long_description && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>À propos</Text>
                    <Text style={styles.longDescription}>{association.long_description}</Text>
                  </View>
                )}

                {members.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Membres du bureau</Text>
                    <View style={styles.membersList}>
                      {members.map(member => (
                        <View key={member.id} style={styles.memberCard}>
                          {member.photo_url ? (
                            <Image source={{ uri: member.photo_url }} style={styles.memberPhoto} />
                          ) : (
                            <View style={styles.memberPhotoPlaceholder}>
                              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#7566d9" strokeWidth={2} />
                                <Circle cx={12} cy={7} r={4} stroke="#7566d9" strokeWidth={2} />
                              </Svg>
                            </View>
                          )}
                          <Text style={styles.memberName}>{member.name}</Text>
                          <Text style={styles.memberRole}>{member.role}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Rejoindre l'association</Text>
                  <View style={[styles.recruitmentCard, association.recruitment_status === 'open' && styles.recruitmentCardOpen]}>
                    <View style={styles.recruitmentHeader}>
                      <View style={[styles.statusBadge, association.recruitment_status === 'open' ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
                        <Text style={styles.statusText}>
                          {association.recruitment_status === 'open' ? '✓ Ouvert' : '✕ Fermé'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recruitmentMessage}>
                      {association.recruitment_status === 'open' 
                        ? association.recruitment_message 
                        : 'Les recrutements sont actuellement fermés. Suivez-nous pour être informé de la prochaine session !'}
                    </Text>
                  </View>
                </View>

                {(association.email || association.instagram || association.website) && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <View style={styles.contactCard}>
                      {association.email && (
                        <TouchableOpacity style={styles.contactRow}>
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#7566d9" strokeWidth={2} />
                            <Path d="M22 6l-10 7L2 6" stroke="#7566d9" strokeWidth={2} />
                          </Svg>
                          <Text style={styles.contactText}>{association.email}</Text>
                        </TouchableOpacity>
                      )}

                      {association.instagram && (
                        <TouchableOpacity style={styles.contactRow}>
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Rect x={2} y={2} width={20} height={20} rx={5} stroke="#7566d9" strokeWidth={2} />
                            <Path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="#7566d9" strokeWidth={2} />
                          </Svg>
                          <Text style={styles.contactText}>{association.instagram}</Text>
                        </TouchableOpacity>
                      )}

                      {association.website && (
                        <TouchableOpacity style={styles.contactRow}>
                          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Circle cx={12} cy={12} r={10} stroke="#7566d9" strokeWidth={2} />
                            <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="#7566d9" strokeWidth={2} />
                          </Svg>
                          <Text style={styles.contactText}>{association.website}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ÉVÉNEMENTS */}
            {activeTab === 'events' && (
              <View>
                <Text style={styles.eventsTitle}>
                  {showPastEvents ? 'Événements passés' : 'Événements à venir'}
                </Text>

                {getFilteredEvents().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      {showPastEvents ? 'Aucun événement passé' : 'Aucun événement à venir'}
                    </Text>
                  </View>
                ) : (
                  getFilteredEvents().map(event => (
                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedEvent(event);
                        setEventModalVisible(true);
                      }}
                    >
                      <View style={styles.eventCardNew}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)']}
                          style={styles.eventGradientNew}
                        >
                          <View style={styles.eventTopRow}>
                            <LinearGradient
                              colors={event.is_cancelled ? ['#ef4444', '#dc2626'] : ['#7566d9', '#5b5c8a']}
                              style={styles.eventBadgeNew}
                            >
                              <Text style={styles.eventBadgeText}>
                                {event.is_cancelled
                                  ? 'Annulé'
                                  : new Date(event.date) > new Date()
                                  ? 'À venir'
                                  : 'Passé'}
                              </Text>
                            </LinearGradient>
                          </View>

                          <View style={styles.eventContentNew}>
                            <View style={styles.eventDateRow}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Rect
                                  x={3}
                                  y={4}
                                  width={18}
                                  height={18}
                                  rx={2}
                                  ry={2}
                                  stroke="rgba(255,255,255,0.7)"
                                  strokeWidth={2}
                                />
                                <Line
                                  x1={16}
                                  y1={2}
                                  x2={16}
                                  y2={6}
                                  stroke="rgba(255,255,255,0.7)"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                />
                                <Line
                                  x1={8}
                                  y1={2}
                                  x2={8}
                                  y2={6}
                                  stroke="rgba(255,255,255,0.7)"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                />
                                <Line
                                  x1={3}
                                  y1={10}
                                  x2={21}
                                  y2={10}
                                  stroke="rgba(255,255,255,0.7)"
                                  strokeWidth={2}
                                />
                              </Svg>
                              <Text style={styles.eventDate}>
                                {formatEventDate(event.date)} • {event.time?.slice(0, 5) || ''}
                              </Text>
                            </View>

                            <Text style={styles.eventTitleNew}>{event.title}</Text>

                            <View style={styles.eventHost}>
                              <LinearGradient
                                colors={['#23243b', '#2d2e4f']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.eventHostAvatar}
                              >
                                <Text style={styles.eventHostAvatarText}>{association.logo_emoji}</Text>
                              </LinearGradient>
                              <Text style={styles.eventHostName}>{association.name}</Text>
                            </View>

                            <View style={styles.eventStats}>
                              <View style={styles.eventStat}>
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                  <Path
                                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <Circle
                                    cx={9}
                                    cy={7}
                                    r={4}
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth={2}
                                  />
                                  <Path
                                    d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </Svg>
                                <Text style={styles.eventStatText}>
                                  {event.participants_count} participants
                                </Text>
                              </View>
                              <View style={styles.eventStat}>
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                  <Path
                                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth={2}
                                  />
                                  <Circle
                                    cx={12}
                                    cy={10}
                                    r={3}
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth={2}
                                  />
                                </Svg>
                                <Text style={styles.eventStatText}>{event.location}</Text>
                              </View>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                {events.filter(e =>
                  showPastEvents
                    ? e.date >= new Date().toISOString().split('T')[0]
                    : e.date < new Date().toISOString().split('T')[0]
                ).length > 0 && (
                  <TouchableOpacity
                    style={styles.toggleEventsButton}
                    onPress={() => setShowPastEvents(!showPastEvents)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.toggleEventsText}>
                      {showPastEvents
                        ? '← Voir les événements à venir'
                        : 'Afficher les événements passés →'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modals */}
      <PostDetailModal
        visible={postModalVisible}
        post={selectedPost}
        association={association}
        isLiked={selectedPost ? userLikes.has(selectedPost.id) : false}
        onClose={() => {
          setPostModalVisible(false);
          setSelectedPost(null);
        }}
        onToggleLike={(postId) => toggleLike(postId)}
        onCommentAdded={loadAssociationData}
      />

      <EventDetailModal
        visible={eventModalVisible}
        event={selectedEvent}
        onClose={() => {
          setEventModalVisible(false);
          setSelectedEvent(null);
        }}
        onReserve={() => {
          loadAssociationData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  loadingContainer: { flex: 1 },
  loadingBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' },
  
  coverContainer: { position: 'relative', height: 200 },
  cover: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: { position: 'absolute', bottom: -40, left: 20 },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#23243b',
  },
  logoEmoji: { fontSize: 48 },

  mainInfo: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  assoName: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  shortDescription: { fontSize: 15, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 22, marginBottom: 20 },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 20,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  statLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },

  followButtonWrapper: { borderRadius: 16, overflow: 'hidden' },
  followButton: { paddingVertical: 16, alignItems: 'center' },
  followButtonText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)' },
  tabTextActive: { color: '#ffffff' },

  content: { paddingHorizontal: 20, paddingBottom: 40 },

  featuredSection: { marginBottom: 28 },
  featuredTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 14 },
  featuredScroll: { gap: 12, paddingRight: 20 },
  featuredCard: {
    width: 280,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  featuredContent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 20,
  },

  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  postsTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },

  postCard: { marginBottom: 16, borderRadius: 18, overflow: 'hidden' },
  pinnedPostCard: { borderWidth: 2, borderColor: 'rgba(117, 102, 217, 0.4)' },
  postGradient: { padding: 18 },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pinnedText: { fontSize: 12, fontWeight: '700', color: '#7566d9', textTransform: 'uppercase' },
  postHeader: { marginBottom: 14 },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postEmoji: { fontSize: 32 },
  postAuthorName: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  postDate: { fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 },
  postContent: { fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 22, marginBottom: 14 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 14 },
  linkCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  linkTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  linkUrl: { fontSize: 12, color: '#7566d9' },
  postFooter: { flexDirection: 'row', gap: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postStatText: { fontSize: 14, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' },
  postStatTextLiked: { color: '#7566d9' },

  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  mediaButtonText: { fontSize: 13, fontWeight: '700', color: '#7566d9' },
  
  backToFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backToFeedText: { fontSize: 14, fontWeight: '700', color: '#7566d9' },

  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  mediaGridItem: { width: '32.5%', aspectRatio: 1 },
  mediaGridImage: { width: '100%', height: '100%', borderRadius: 6 },

  infoCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 18, padding: 20, gap: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#ffffff' },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 14 },
  longDescription: { fontSize: 15, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 24 },

  membersList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memberCard: { width: '31%', alignItems: 'center' },
  memberPhoto: { width: 60, height: 60, borderRadius: 14, marginBottom: 8 },
  memberPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: { fontSize: 13, fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: 2 },
  memberRole: { fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' },

  recruitmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recruitmentCardOpen: { borderColor: 'rgba(117, 102, 217, 0.4)' },
  recruitmentHeader: { marginBottom: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  statusBadgeOpen: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  statusBadgeClosed: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  statusText: { fontSize: 12, fontWeight: '800', color: '#ffffff' },
  recruitmentMessage: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 22 },

  contactCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 18, gap: 14 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactText: { fontSize: 14, fontWeight: '600', color: '#7566d9' },

  eventsTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 16 },
  
  eventCardNew: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventGradientNew: {
    padding: 20,
  },
  eventTopRow: {
    marginBottom: 14,
  },
  eventBadgeNew: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventContentNew: {
    gap: 12,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  eventTitleNew: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 26,
  },
  eventHost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  toggleEventsButton: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleEventsText: { fontSize: 14, fontWeight: '700', color: '#7566d9' },

  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, color: 'rgba(255, 255, 255, 0.5)' },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  addMemberCard: {
    borderWidth: 2,
    borderColor: 'rgba(117, 102, 217, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(117, 102, 217, 0.05)',
  },
  addMemberAvatar: {
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
  },
});