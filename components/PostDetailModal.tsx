import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PostDetailModalProps {
  visible: boolean;
  post: any;
  association: any;
  isLiked: boolean;
  onClose: () => void;
  onToggleLike: (postId: string) => void;
  onCommentAdded: () => void;
}

export default function PostDetailModal({
  visible,
  post,
  association,
  isLiked,
  onClose,
  onToggleLike,
  onCommentAdded,
}: PostDetailModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);

  // Animation pour le like
  const likeScale = new Animated.Value(1);

  useEffect(() => {
    if (visible && post) {
      loadComments();
      setLocalLikesCount(post.likes_count || 0);
    }
  }, [visible, post]);

  useEffect(() => {
    if (post) {
      setLocalLikesCount(post.likes_count || 0);
    }
  }, [post?.likes_count]);

  const loadComments = async () => {
    if (!post) return;

    const { data } = await supabase
      .from('post_comments')
      .select(`
        *,
        profile:profiles(first_name, last_name)
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const handleToggleLike = () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour liker');
      return;
    }

    // Animation
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    // Update local count
    setLocalLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    // Call parent function
    onToggleLike(post.id);
  };

  const addComment = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      }]);

    if (error) {
      console.error('Erreur ajout commentaire:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    } else {
      setNewComment('');
      await loadComments();
      onCommentAdded();
    }

    setLoading(false);
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

  if (!post) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Publication</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Post */}
            <View style={styles.postSection}>
              <View style={styles.postHeader}>
                <Text style={styles.postEmoji}>{association?.logo_emoji || '🎉'}</Text>
                <View>
                  <Text style={styles.postAuthorName}>{association?.name || 'Association'}</Text>
                  <Text style={styles.postDate}>{formatPostDate(post.created_at)}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              {post.media_type === 'photo' && post.media_url && (
                <Image source={{ uri: post.media_url }} style={styles.postImage} />
              )}

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleToggleLike}>
                  <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill={isLiked ? '#7566d9' : 'none'}>
                      <Path
                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                        stroke={isLiked ? '#7566d9' : 'rgba(255,255,255,0.6)'}
                        strokeWidth={2}
                      />
                    </Svg>
                  </Animated.View>
                  <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
                    {localLikesCount}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionButton}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth={2}
                    />
                  </Svg>
                  <Text style={styles.actionText}>{comments.length}</Text>
                </View>
              </View>
            </View>

            {/* Commentaires */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>Commentaires ({comments.length})</Text>

              {comments.length === 0 ? (
                <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {comment.profile?.first_name?.[0] || 'U'}
                        </Text>
                      </View>
                      <View style={styles.commentInfo}>
                        <Text style={styles.commentAuthor}>
                          {comment.profile?.first_name} {comment.profile?.last_name}
                        </Text>
                        <Text style={styles.commentDate}>{formatPostDate(comment.created_at)}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))
              )}

              {/* Espace pour éviter que le clavier cache le dernier commentaire */}
              <View style={{ height: 120 }} />
            </View>
          </ScrollView>

          {/* Input commentaire - FIXE EN BAS */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newComment.trim() || loading) && styles.sendButtonDisabled]}
              onPress={addComment}
              disabled={!newComment.trim() || loading}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  scroll: { flex: 1 },

  postSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  postEmoji: { fontSize: 36 },
  postAuthorName: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  postDate: { fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 },
  postContent: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 24, marginBottom: 16 },
  postImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 16 },

  actionsRow: { flexDirection: 'row', gap: 24 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 16, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' },
  actionTextLiked: { color: '#7566d9' },

  commentsSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  commentsTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 16 },
  noComments: { fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', paddingVertical: 30 },

  commentCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 14, padding: 14, marginBottom: 12 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  commentInfo: { flex: 1 },
  commentAuthor: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  commentDate: { fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', marginTop: 2 },
  commentContent: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 20 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    backgroundColor: '#23243b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7566d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});