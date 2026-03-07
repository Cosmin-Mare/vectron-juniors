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

const BEAD_COLORS = ['gold', 'bronze', 'copper', 'silver', 'turquoise', 'amber'] as const;
const BEAD_STYLES: Record<string, { bg: string }> = {
  gold: { bg: '#fbbf24' },
  bronze: { bg: '#ea580c' },
  copper: { bg: '#f97316' },
  silver: { bg: '#a8a29e' },
  turquoise: { bg: '#14b8a6' },
  amber: { bg: '#f59e0b' },
};
const ROUNDS = 5;

function createNewRound() {
  const colors = [...BEAD_COLORS].sort(() => Math.random() - 0.5);
  const pos = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
  return { normalColor: colors[0]!, oddColor: colors[1]!, positions: pos, oddPos: pos[0]! };
}

export function BratariGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const size = Math.min(70, (width - 80) / 5 - 12);

  const [round, setRound] = React.useState(0);
  const [roundData, setRoundData] = React.useState(() => createNewRound());
  const [showWin, setShowWin] = React.useState(false);
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);

  const newRound = React.useCallback(() => setRoundData(createNewRound()), []);

  React.useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  const handlePress = (index: number) => {
    if (index === roundData.oddPos) {
      const next = round + 1;
      setRound(next);
      if (next >= ROUNDS) {
        const sec = Math.round((Date.now() - startTime) / 1000);
        markGameWon('bratari');
        getUserName().then((name) => {
          submitScore('bratari', -sec, sec + ' sec', name || 'Jucător');
        });
        setShowWin(true);
        return;
      }
      newRound();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📿 Mărgeaua Diferită</Text>
      <Text style={styles.info}>
        Pe brățara antică, găsește mărgeaua de culoare diferită! Runda {round + 1} din {ROUNDS}
      </Text>
      <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
      <Text style={styles.secLabel}>Care mărgea e de altă culoare?</Text>
      <View style={[styles.grid, { gap: 16 }]}>
        {roundData.positions.map((_, i) => {
          const color = i === roundData.oddPos ? roundData.oddColor : roundData.normalColor;
          const s = BEAD_STYLES[color] || BEAD_STYLES.gold;
          return (
            <Pressable
              key={i}
              style={[
                styles.bead,
                { width: size, height: size, borderRadius: size / 2, backgroundColor: s.bg },
              ]}
              onPress={() => handlePress(i)}
            />
          );
        })}
      </View>
      <Pressable
        style={({ pressed }) => [styles.retryBtn, pressed && styles.btnPressed]}
        onPress={() => {
          setRound(0);
          newRound();
        }}
      >
        <Text style={styles.retryBtnText}>Reîncearcă</Text>
      </Pressable>

      <WinModal
        visible={showWin}
        emoji="📿"
        title="Felicitări!"
        message="Ai găsit toate mărgelele diferite!"
        scoreLabel="Timp"
        scoreDisplay={formatTime(Math.round((Date.now() - startTime) / 1000)) + ' sec'}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 24,
  },
  bead: {
    borderWidth: 5,
    borderColor: '#292524',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  retryBtn: {
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
  retryBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  btnPressed: {
    opacity: 0.9,
  },
});
