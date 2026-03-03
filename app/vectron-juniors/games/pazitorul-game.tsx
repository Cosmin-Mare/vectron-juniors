import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WinModal } from '@/components/win-modal';
import { markGameWon } from '@/lib/storage';
import { submitScore } from '@/lib/firebase';
import { getUserName } from '@/lib/storage';

const PUZZLE_SYMBOLS = ['🜀', '☿', '⚜', '✠', '☀', '☽', '✧', '◆', '◈'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PIECE_SIZE = 76;
const GRID_GAP = 8;
const GRID_PADDING = 16;

export function PazitorulGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const gridSize = 3 * PIECE_SIZE + 2 * GRID_GAP + 2 * GRID_PADDING;
  const scale = Math.min(1, (width - 80) / gridSize);
  const pieceSize = Math.floor(PIECE_SIZE * scale);
  const gap = Math.max(4, Math.floor(GRID_GAP * scale));
  const padding = Math.max(8, Math.floor(GRID_PADDING * scale));

  const [order, setOrder] = React.useState(() => shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);
  const [showWin, setShowWin] = React.useState(false);
  const [finalTime, setFinalTime] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const handlePress = (idx: number) => {
    const val = order[idx];
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }
    const valA = order[selectedIdx];
    const newOrder = [...order];
    const posA = newOrder.indexOf(valA);
    const posB = newOrder.indexOf(val);
    [newOrder[posA], newOrder[posB]] = [newOrder[posB], newOrder[posA]];
    setOrder(newOrder);
    setSelectedIdx(null);

    const allCorrect = newOrder.every((v, i) => v === i + 1);
    if (allCorrect) {
      const sec = Math.round((Date.now() - startTime) / 1000);
      setFinalTime(sec);
      markGameWon('pazitorul');
      getUserName().then((name) => {
        submitScore('pazitorul', -sec, sec + ' sec', name || 'Jucător');
      });
      setShowWin(true);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗿 Puzzle-ul Păzitorului</Text>
      <Text style={styles.info}>
        Trage sau apasă pe două piese pentru a le schimba! Aranjează totul în
        ordine.
      </Text>
      <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
      <View style={[styles.grid, { padding }]}>
        {[0, 1, 2].map((row) => (
          <View
            key={row}
            style={[styles.row, { gap, marginBottom: row < 2 ? gap : 0 }]}
          >
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              const val = order[idx]!;
              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.piece,
                    {
                      width: pieceSize,
                      height: pieceSize,
                      borderRadius: Math.max(12, pieceSize / 5),
                    },
                    selectedIdx === idx && styles.pieceSelected,
                    val === idx + 1 && styles.pieceCorrect,
                  ]}
                  onPress={() => handlePress(idx)}
                >
                  <Text style={[styles.pieceText, { fontSize: pieceSize * 0.32 }]}>
                    {PUZZLE_SYMBOLS[val - 1] ?? '?'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <WinModal
        visible={showWin}
        emoji="🎊"
        title="Felicitări!"
        message="Ai asamblat Păzitorul perfect!"
        scoreLabel="Timp"
        scoreDisplay={finalTime + ' sec'}
        onClose={() => router.replace('/(tabs)')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    color: '#292524',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  info: {
    fontSize: 16,
    color: '#5d4a35',
    marginBottom: 12,
    textAlign: 'center',
  },
  timer: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#292524',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    backgroundColor: '#fde68a',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    marginBottom: 24,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  grid: {
    backgroundColor: '#57534e',
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#292524',
    shadowColor: '#44403c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  piece: {
    backgroundColor: '#e7e5e4',
    borderWidth: 4,
    borderColor: '#292524',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#78716c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pieceSelected: {
    backgroundColor: '#fde68a',
    borderColor: '#f97316',
    borderWidth: 6,
  },
  pieceCorrect: {
    backgroundColor: '#86efac',
    borderColor: '#15803d',
  },
  pieceText: {
    fontSize: 24,
  },
});
