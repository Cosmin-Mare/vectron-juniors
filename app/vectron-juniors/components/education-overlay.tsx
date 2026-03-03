import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface EducationOverlayProps {
  visible: boolean;
  title: string;
  text: string;
  onStart: () => void;
}

export function EducationOverlay({
  visible,
  title,
  text,
  onStart,
}: EducationOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onStart}
          >
            <Text style={styles.btnText}>Începe jocul!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 31, 20, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: '#fffbeb',
    borderRadius: 28,
    padding: 32,
    maxWidth: 420,
    width: '100%',
    borderWidth: 5,
    borderColor: Colors.border,
    shadowColor: '#292524',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  title: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: Colors.textMuted,
    lineHeight: 24,
    marginBottom: 24,
  },
  btn: {
    width: '100%',
    padding: 18,
    backgroundColor: '#fbbf24',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
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
