import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  subscribeToAllLeaderboards,
  LeaderboardEntry,
} from '@/lib/firebase';

const GAME_NAMES: Record<string, string> = {
  mammoth: '🦣 Memoria Mamutului (timp)',
  monoxyl: '🛶 Aventura pe Someș (saci)',
  pazitorul: '🗿 Puzzle Păzitorul (timp)',
  pietre: '📜 Decoder (timp)',
  bratari: '📿 Mărgeaua Diferită (sec)',
  secera: '🌾 Secera (cereale)',
  lego: '🧱 Turnul LEGO (cărămizi)',
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [leaderboards, setLeaderboards] = React.useState<
    Record<string, LeaderboardEntry[]> | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAllLeaderboards(
      (data) => {
        setLeaderboards(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(
          err?.message?.includes('PERMISSION_DENIED')
            ? 'Nu ai permisiunea de a citi clasamentul.'
            : 'Nu s-au putut încărca clasamentele.'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [retryKey]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: 24 + insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FLL România • Vectron-Juniors</Text>
        </View>
        <Text style={styles.h1}>🏆 Clasament</Text>
        <Text style={styles.subtitle}>Cele mai bune scoruri!</Text>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.loading}>Se încarcă...</Text>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => setRetryKey((k) => k + 1)}
          >
            <Text style={styles.retryBtnText}>Încearcă din nou</Text>
          </Pressable>
        </View>
      ) : leaderboards ? (
        <View style={styles.cards}>
          {Object.entries(leaderboards).map(([gameId, entries]) => (
            <View key={gameId} style={styles.card}>
              <Text style={styles.cardTitle}>
                {GAME_NAMES[gameId] ?? gameId}
              </Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, styles.headerCell]}>#</Text>
                  <Text style={[styles.cell, styles.headerCell]}>Nume</Text>
                  <Text style={[styles.cell, styles.headerCell]}>Scor</Text>
                </View>
                {entries.length === 0 ? (
                  <View style={styles.tableRow}>
                    <Text style={styles.emptyCell}>Niciun scor încă</Text>
                  </View>
                ) : (
                  entries.map((e, i) => (
                    <View key={e.key} style={styles.tableRow}>
                      <Text style={styles.cell}>{i + 1}</Text>
                      <Text style={styles.cell}>{e.username || 'Anonim'}</Text>
                      <Text style={styles.cell}>
                        {e.scoreDisplay ?? String(e.score)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {leaderboards &&
        Object.values(leaderboards).every((arr) => arr.length === 0) && (
          <Text style={styles.error}>
            Niciun scor încă. Joacă și salvează scorul!
          </Text>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#292524',
  },
  badgeText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
  },
  h1: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: '#292524',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#5d4a35',
    marginBottom: 16,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
  },
  backBtnText: {
    fontFamily: 'Fredoka_700Bold',
    color: '#292524',
    fontSize: 16,
  },
  btnPressed: {
    opacity: 0.9,
  },
  loading: {
    textAlign: 'center',
    padding: 40,
    color: '#6b5b4a',
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  error: {
    textAlign: 'center',
    color: '#c62828',
    maxWidth: 500,
    fontSize: 16,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f97316',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#292524',
  },
  retryBtnText: {
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
    fontSize: 16,
  },
  cards: {
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    borderWidth: 5,
    borderColor: '#292524',
  },
  cardTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    marginBottom: 16,
    color: '#2d1f14',
  },
  table: {},
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8f0e3',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  headerCell: {
    fontWeight: '700',
  },
  emptyCell: {
    flex: 1,
    fontSize: 14,
    color: '#8a7a6a',
  },
});
