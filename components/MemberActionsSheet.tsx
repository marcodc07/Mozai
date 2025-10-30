import { LinearGradient } from 'expo-linear-gradient';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface MemberActionsSheetProps {
  visible: boolean;
  memberId: string;
  memberName: string;
  canEdit: boolean;
  canRemove: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export default function MemberActionsSheet({
  visible,
  memberName,
  canEdit,
  canRemove,
  onClose,
  onEdit,
  onRemove,
}: MemberActionsSheetProps) {
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

            <Text style={styles.title}>{memberName}</Text>

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

            {/* Retirer du bureau */}
            {canRemove && (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onClose();
                  onRemove();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, styles.optionIconDanger]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle cx={8.5} cy={7} r={4} stroke="#ef4444" strokeWidth={2} />
                    <Path
                      d="M18 8l5 5M23 8l-5 5"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={[styles.optionText, styles.optionTextDanger]}>
                  Retirer du bureau
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
