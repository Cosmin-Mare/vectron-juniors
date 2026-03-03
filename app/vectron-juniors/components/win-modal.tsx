import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

interface WinModalProps {
  visible: boolean;
  emoji?: string;
  title: string;
  message: string;
  scoreLabel?: string;
  scoreDisplay?: string;
  onClose: () => void;
}

export function WinModal({
  visible,
  emoji = '🎉',
  title,
  message,
  scoreLabel,
  scoreDisplay,
  onClose,
}: WinModalProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {scoreLabel != null || scoreDisplay != null ? (
            <Text style={styles.score}>
              {scoreLabel} {scoreDisplay}
            </Text>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onClose}
          >
            <Text style={styles.btnText}>Înapoi la jocuri</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnSecondary,
              pressed && styles.btnPressed,
            ]}
            onPress={() => {
              onClose();
              router.push('/(tabs)/leaderboard');
            }}
          >
            <Text style={styles.btnText}>🏆 Vezi clasamentul</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: '#fffbeb',
    borderRadius: 32,
    padding: 36,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: Colors.border,
    shadowColor: '#292524',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 8,
    textAlign: 'center',
  },
  score: {
    fontSize: 14,
    color: '#8a7a6a',
    marginBottom: 24,
  },
  btn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#22c55e',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  btnSecondary: {
    backgroundColor: '#fbbf24',
    shadowColor: '#c2410c',
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});
