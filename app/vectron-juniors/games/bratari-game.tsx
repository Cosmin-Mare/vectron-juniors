import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WinModal } from '@/components/win-modal';
import { markGameWon } from '@/lib/storage';
import { submitScore } from '@/lib/firebase';
import { getUserName } from '@/lib/storage';

const COLORS = ['gold', 'bronze', 'copper', 'silver'] as const;
const EMOJI: Record<string, string> = {
  gold: '🟡',
  bronze: '🟤',
  copper: '🟠',
  silver: '⚪',
};

const MIN_CIRCLE = 52;
const MAX_CIRCLE = 80;
const MIN_GAP = 8;

export function BratariGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const rowWidth = 4 * MAX_CIRCLE + 3 * 20;
  const scale = Math.min(1, (width - 48) / rowWidth);
  const circleSize = Math.max(MIN_CIRCLE, Math.floor(MAX_CIRCLE * scale));
  const gap = Math.max(MIN_GAP, Math.floor(20 * scale));

  const [sequence, setSequence] = React.useState<string[]>([]);
  const [playerIndex, setPlayerIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [info, setInfo] = React.useState('Nivel 1! Memorează secvența...');
  const [showWin, setShowWin] = React.useState(false);
  const [showLose, setShowLose] = React.useState(false);
  const [loseLevel, setLoseLevel] = React.useState(0);
  const [litColor, setLitColor] = React.useState<string | null>(null);
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  const playSequence = React.useCallback((seq: string[]) => {
    setIsPlaying(true);
    setInfo(`Nivel ${seq.length}! Memorează secvența...`);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(interval);
        setIsPlaying(false);
        setLitColor(null);
        setInfo('Repetă secvența!');
        return;
      }
      setLitColor(seq[i]!);
      setTimeout(() => setLitColor(null), 450);
      i++;
    }, 650);
  }, []);

  const handleStart = () => {
    const init = [COLORS[Math.floor(Math.random() * COLORS.length)]!];
    setSequence(init);
    setPlayerIndex(0);
    setInfo('Nivel 1! Memorează secvența...');
    setTimeout(() => playSequence(init), 100);
  };

  const handleColorPress = (color: string) => {
    if (isPlaying) return;
    if (color !== sequence[playerIndex]) {
      setLoseLevel(sequence.length);
      markGameWon('bratari');
      getUserName().then((name) => {
        submitScore('bratari', sequence.length, 'Nivel ' + sequence.length, name || 'Jucător');
      });
      setShowLose(true);
      return;
    }
    const next = playerIndex + 1;
    setPlayerIndex(next);
    if (next >= sequence.length) {
      if (sequence.length >= 5) {
        markGameWon('bratari');
        getUserName().then((name) => {
          submitScore('bratari', sequence.length, 'Nivel ' + sequence.length, name || 'Jucător');
        });
        setShowWin(true);
        return;
      }
      const newSeq = [
        ...sequence,
        COLORS[Math.floor(Math.random() * COLORS.length)]!,
      ];
      setSequence(newSeq);
      setPlayerIndex(0);
      setTimeout(() => playSequence(newSeq), 900);
    }
  };

  const circleStyle = (color: string) => [
    styles.circle,
    { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
    color === 'gold' && styles.circleGold,
    color === 'bronze' && styles.circleBronze,
    color === 'copper' && styles.circleCopper,
    color === 'silver' && styles.circleSilver,
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>⌚ Modelul Brățărilor</Text>
        <Text style={styles.info}>{info}</Text>
        <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
        <Text style={styles.secLabel}>Secvența:</Text>
        <View style={[styles.sequence, { gap }]}>
          {COLORS.map((c) => (
            <View
              key={c}
              style={[
                ...circleStyle(c),
                litColor === c && styles.circleLit,
              ]}
            >
              <Text style={[styles.circleText, { fontSize: circleSize * 0.35 }]}>
                {EMOJI[c]}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.startBtn, pressed && styles.btnPressed]}
          onPress={handleStart}
        >
          <Text style={styles.startBtnText}>Începe</Text>
        </Pressable>
        <Text style={styles.secLabel}>Repetă secvența:</Text>
        <View style={[styles.input, { gap }]}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              style={({ pressed }) => [
                ...circleStyle(c),
                pressed && styles.circlePressed,
              ]}
              onPress={() => handleColorPress(c)}
            >
              <Text style={[styles.circleText, { fontSize: circleSize * 0.35 }]}>
                {EMOJI[c]}
              </Text>
            </Pressable>
          ))}
        </View>

        <WinModal
          visible={showWin}
          emoji="⌚"
          title="Felicitări!"
          message="Ai atins nivelul 5!"
          scoreLabel="Nivel atins"
          scoreDisplay={'Nivel ' + sequence.length}
          onClose={() => router.replace('/(tabs)')}
        />
        <WinModal
          visible={showLose}
          emoji="😅"
          title="Ai greșit secvența!"
          message="Dar ai făcut-o bine până acum – jocul e complet!"
          scoreLabel="Nivel atins"
          scoreDisplay={'Nivel ' + loseLevel}
          onClose={() => {
            setShowLose(false);
            router.replace('/(tabs)');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
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
    backgroundColor: '#fde68a',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  secLabel: {
    fontWeight: '700',
    marginVertical: 12,
    color: '#292524',
  },
  sequence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  circle: {
    borderWidth: 5,
    borderColor: '#292524',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGold: {
    backgroundColor: '#fde047',
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  circleBronze: {
    backgroundColor: '#f97316',
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  circleCopper: {
    backgroundColor: '#fb923c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  circleSilver: {
    backgroundColor: '#a8a29e',
    shadowColor: '#78716c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  circleLit: {
    transform: [{ scale: 1.25 }],
    shadowColor: '#fde047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  circlePressed: {
    opacity: 0.9,
  },
  circleText: {
    fontSize: 28,
  },
  startBtn: {
    paddingVertical: 18,
    paddingHorizontal: 44,
    backgroundColor: '#fbbf24',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    marginVertical: 20,
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  startBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  btnPressed: {
    opacity: 0.9,
  },
});
