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

const SYMBOLS = ['🦴', '🪵', '❄️', '🌿', '🦣', '⛰️'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MammothGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardSize = Math.min((width - 88) / 4 - 14, 80);
  const gap = 14;

  const [cards] = React.useState(() =>
    shuffle([...SYMBOLS, ...SYMBOLS])
  );
  const [flipped, setFlipped] = React.useState<number[]>([]);
  const [matched, setMatched] = React.useState<Set<number>>(new Set());
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [showWin, setShowWin] = React.useState(false);
  const [finalTime, setFinalTime] = React.useState(0);

  React.useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const handlePress = (index: number) => {
    if (flipped.length >= 2 || flipped.includes(index) || matched.has(index))
      return;
    if (startTime === null) setStartTime(Date.now());
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (cards[a] === cards[b]) {
        setMatched((m) => new Set(m).add(a).add(b));
        setFlipped([]);
        if (matched.size + 2 === cards.length) {
          const sec = Math.round((Date.now() - (startTime ?? Date.now())) / 1000);
          setFinalTime(sec);
          markGameWon('mammoth');
          getUserName().then((name) => {
            submitScore('mammoth', -sec, sec + ' sec', name || 'Jucător');
          });
          setShowWin(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦣 Memoria Mamutului</Text>
      <Text style={styles.info}>
        Găsește toate perechile de fragmente fosile! Apasă pe cărți pentru a le
        întoarce.
      </Text>
      <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
      <View style={[styles.grid, { gap }]}>
        {cards.map((symbol, i) => {
          const isFlipped = flipped.includes(i) || matched.has(i);
          return (
            <Pressable
              key={i}
              style={[
                styles.card,
                { width: cardSize, height: cardSize },
                isFlipped && styles.cardFlipped,
              ]}
              onPress={() => handlePress(i)}
            >
              <Text style={styles.cardText}>{isFlipped ? symbol : ''}</Text>
            </Pressable>
          );
        })}
      </View>

      <WinModal
        visible={showWin}
        emoji="🎉"
        title="Felicitări!"
        message="Ai găsit toate perechile de fragmente de mamut!"
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
    marginBottom: 16,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 460,
  },
  card: {
    backgroundColor: '#a8a29e',
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#292524',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#44403c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardFlipped: {
    backgroundColor: '#fde68a',
    borderColor: '#292524',
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardText: {
    fontSize: 28,
  },
});
