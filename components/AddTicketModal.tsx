import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AddTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (ticket: {
    name: string;
    available: number;
    price: number;
  }) => void;
}

export default function AddTicketModal({ visible, onClose, onAdd }: AddTicketModalProps) {
  const [name, setName] = useState('');
  const [available, setAvailable] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');

  const resetForm = () => {
    setName('');
    setAvailable('');
    setIsFree(true);
    setPrice('');
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du billet est obligatoire');
      return;
    }

    const availableNum = parseInt(available);
    if (!available || isNaN(availableNum) || availableNum <= 0) {
      Alert.alert('Erreur', 'Le nombre de places doit être supérieur à 0');
      return;
    }

    if (!isFree) {
      const priceNum = parseFloat(price);
      if (!price || isNaN(priceNum) || priceNum <= 0) {
        Alert.alert('Erreur', 'Le prix doit être supérieur à 0');
        return;
      }
    }

    onAdd({
      name: name.trim(),
      available: availableNum,
      price: isFree ? 0 : parseFloat(price),
    });

    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={['#1a1b2e', '#16213e', '#23243b']} style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ajouter un billet</Text>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!name.trim() || !available}
              style={[styles.addButton, (!name.trim() || !available) && styles.addButtonDisabled]}
            >
              <Text style={[styles.addButtonText, (!name.trim() || !available) && styles.addButtonTextDisabled]}>
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Nom du billet */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom du billet *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Standard, VIP, Étudiant..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            {/* Nombre de places */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de places *</Text>
              <TextInput
                style={styles.input}
                value={available}
                onChangeText={setAvailable}
                placeholder="Ex: 50"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="number-pad"
              />
            </View>

            {/* Gratuit/Payant */}
            <View style={styles.switchCard}>
              <View style={styles.switchLeft}>
                <Text style={styles.switchTitle}>Billet gratuit</Text>
                <Text style={styles.switchSubtext}>
                  {isFree ? 'Ce billet est gratuit' : 'Ce billet est payant'}
                </Text>
              </View>
              <Switch
                value={isFree}
                onValueChange={setIsFree}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#7566d9' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Prix (si payant) */}
            {!isFree && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prix (€) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Ex: 15.00"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7566d9',
  },
  addButtonDisabled: { backgroundColor: 'rgba(117, 102, 217, 0.3)' },
  addButtonText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  addButtonTextDisabled: { opacity: 0.5 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  switchLeft: { flex: 1, marginRight: 12 },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
