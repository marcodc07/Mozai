import { LinearGradient } from 'expo-linear-gradient';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface EventActionsSheetProps {
  visible: boolean;
  eventId: string;
  isCancelled: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCancel: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCancel: () => void;
}

export default function EventActionsSheet({
  visible,
  isCancelled,
  canEdit,
  canDelete,
  canCancel,
  onClose,
  onEdit,
  onDelete,
  onToggleCancel,
}: EventActionsSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheetContainer}>
          <LinearGradient
            colors={['#23243b', '#1a1b2e']}
            style={styles.sheet}
          >
            <View style={styles.handle} />

            <Text style={styles.title}>Actions</Text>

            {/* Modifier */}
            {canEdit && (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onClose();
                  onEdit();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                      stroke="#7566d9"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.optionText}>Modifier</Text>
              </TouchableOpacity>
            )}

            {/* Annuler/Réactiver */}
            {canCancel && (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onClose();
                  onToggleCancel();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, isCancelled && styles.optionIconSuccess]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    {isCancelled ? (
                      // Icône de check/réactiver
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      // Icône de X/annuler
                      <Path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </Svg>
                </View>
                <Text style={styles.optionText}>
                  {isCancelled ? 'Réactiver l\'événement' : 'Annuler l\'événement'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Supprimer */}
            {canDelete && (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onClose();
                  onDelete();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, styles.optionIconDanger]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={[styles.optionText, styles.optionTextDanger]}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            )}

            {/* Annuler */}
            <TouchableOpacity
              style={styles.cancelOption}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Fermer</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheet: {
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  optionIconSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  optionTextDanger: {
    color: '#ef4444',
  },
  cancelOption: {
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
