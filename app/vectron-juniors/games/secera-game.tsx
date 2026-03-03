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

const W = 400;
const H = 320;
const DURATION_MS = 30000;

interface Wheat {
  x: number;
  y: number;
}

export function SeceraGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 64) / W);

  const [sickleX, setSickleX] = React.useState(W / 2 - 40);
  const [score, setScore] = React.useState(0);
  const [wheat, setWheat] = React.useState<Wheat[]>([]);
  const [showWin, setShowWin] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const endTime = React.useRef(Date.now() + DURATION_MS);
  const sickleXRef = React.useRef(sickleX);
  sickleXRef.current = sickleX;

  const moveLeft = () => setSickleX((x) => Math.max(0, x - 20));
  const moveRight = () => setSickleX((x) => Math.min(W - 80, x + 20));

  React.useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endTime.current - Date.now()) / 1000));
      setTimeLeft(left);

      setWheat((prev) => {
        let next = prev
          .map((w) => ({ ...w, y: w.y + 2.5 }))
          .filter((w) => {
            if (w.y > H) return false;
            if (w.x + 20 > sickleXRef.current && w.x < sickleXRef.current + 80 && w.y + 20 > H - 45) {
              setScore((s) => s + 1);
              return false;
            }
            return true;
          });
        if (Math.random() < 0.03) {
          next.push({
            x: Math.random() * (W - 30),
            y: -25,
          });
        }
        return next;
      });

      if (left <= 0) {
        clearInterval(id);
        markGameWon('secera');
        getUserName().then((name) => {
          submitScore('secera', score, score + ' cereale', name || 'Jucător');
        });
        setShowWin(true);
      }
    }, 50);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌾 Secera cu limbă</Text>
      <Text style={styles.info}>
        Strânge cerealele care cad! 30 secunde. Folosește săgețile sau
        butoanele.
      </Text>
      <View style={styles.stats}>
        <Text style={styles.timer}>Rămase: {formatTime(timeLeft)}</Text>
        <Text style={styles.score}>Cereale: {score}</Text>
      </View>
      <View style={[styles.canvasWrap, { width: W * scale, height: H * scale }]}>
        <View style={[styles.canvas, { transform: [{ scale }] }]}>
          <View style={styles.field}>
            {wheat.map((w, i) => (
              <Text
                key={i}
                style={[styles.wheat, { left: w.x, top: w.y }]}
              >
                🌾
              </Text>
            ))}
            <View
              style={[
                styles.sickle,
                {
                  left: sickleX,
                  top: H - 40,
                },
              ]}
            />
          </View>
        </View>
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.ctrlBtn} onPress={moveLeft}>
          <Text style={styles.ctrlText}>← Stânga</Text>
        </Pressable>
        <Pressable style={styles.ctrlBtn} onPress={moveRight}>
          <Text style={styles.ctrlText}>→ Dreapta</Text>
        </Pressable>
      </View>

      <WinModal
        visible={showWin}
        emoji="🌾"
        title="Felicitări!"
        message="Timpul s-a terminat!"
        scoreLabel="Cereale strânse:"
        scoreDisplay={String(score)}
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
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timer: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fde68a',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  score: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fde68a',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  canvasWrap: {
    overflow: 'hidden',
    backgroundColor: '#87CEEB',
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#292524',
    marginBottom: 24,
    shadowColor: '#0369a1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  canvas: {
    width: W,
    height: H,
  },
  field: {
    width: W,
    height: H,
    backgroundColor: '#87CEEB',
    position: 'relative',
  },
  wheat: {
    position: 'absolute',
    fontSize: 24,
  },
  sickle: {
    position: 'absolute',
    width: 80,
    height: 25,
    backgroundColor: '#5D4E37',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctrlBtn: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    backgroundColor: '#fbbf24',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  ctrlText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
});
