import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

interface GameCardProps {
  gameId: string;
  icon: string;
  title: string;
  desc: string;
  status: 'done' | 'todo' | 'locked';
  progress?: string;
  locked?: boolean;
}

export function GameCard({
  gameId,
  icon,
  title,
  desc,
  status,
  progress,
  locked,
}: GameCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (locked) return;
    router.push(`/game/${gameId}` as const);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        locked && styles.cardLocked,
        pressed && !locked && styles.cardPressed,
      ]}
      onPress={handlePress}
      disabled={locked}
    >
      <Text style={[styles.status, status === 'done' && styles.statusDone]}>
        {locked ? '' : status === 'done' ? '✓ Complet!' : 'De jucat'}
      </Text>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
      {progress ? (
        <Text style={styles.progress}>{progress}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    borderWidth: 5,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLocked: {
    opacity: 0.85,
    backgroundColor: '#e7e5e4',
    borderColor: Colors.bark,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.bark,
    textTransform: 'uppercase',
  },
  statusDone: {
    color: Colors.success,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },
  progress: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.bark,
    marginTop: 8,
  },
});
