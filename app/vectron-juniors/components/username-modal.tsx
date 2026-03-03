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
  onSave: (name: string) => void | Promise<void>;
  onClose?: () => void;
}

export function UsernameModal({
  visible,
  currentName,
  onSave,
}: UsernameModalProps) {
  const [name, setName] = React.useState(currentName);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    setName(currentName);
    setError(null);
  }, [currentName, visible]);

  const handleSave = async () => {
    const clean = name.trim().substring(0, 20);
    if (!clean) return;
    setError(null);
    setSaving(true);
    try {
      await onSave(clean);
    } catch (e) {
      setError((e as Error)?.message || 'Numele este deja folosit.');
    } finally {
      setSaving(false);
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
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              placeholder="Ex: Alex"
              maxLength={20}
              autoFocus
              autoCapitalize="words"
              editable={!saving}
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                pressed && styles.btnPressed,
                saving && styles.btnDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.btnText}>
                {saving ? 'Se verifică...' : 'Începe!'}
              </Text>
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
  btnDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  btnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
});
