import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface UsernameModalProps {
  visible: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onClose?: () => void;
}

export function UsernameModal({
  visible,
  currentName,
  onSave,
}: UsernameModalProps) {
  const [name, setName] = React.useState(currentName);
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    setName(currentName);
  }, [currentName, visible]);

  const handleSave = () => {
    const clean = name.trim().substring(0, 20);
    if (clean) {
      onSave(clean);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.center}>
          <View style={styles.popup}>
            <Text style={styles.title}>👋 Cum te cheamă?</Text>
            <Text style={styles.subtitle}>
              Introdu numele tău pentru a apărea în clasament!
            </Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Alex"
              maxLength={20}
              autoFocus
              autoCapitalize="words"
            />
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={handleSave}
            >
              <Text style={styles.btnText}>Începe!</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 31, 20, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    maxWidth: 420,
    width: '100%',
    borderWidth: 5,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 20,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    padding: 16,
    fontSize: 18,
    fontFamily: 'Fredoka_400Regular',
    borderWidth: 5,
    borderColor: Colors.border,
    borderRadius: 18,
    marginBottom: 20,
  },
  btn: {
    width: '100%',
    padding: 18,
    backgroundColor: Colors.orange,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
});
