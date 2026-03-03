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

const W = 360;
const H = 300;
const BRICK_W = 44;
const BRICK_H = 20;
const PLATFORM_W = 72;
const PLATFORM_H = 18;
const FLOOR_H = 24;
const TARGET = 20;

const LEGO_COLORS = [
  { fill: '#e63946' },
  { fill: '#1d3557' },
  { fill: '#f4a261' },
  { fill: '#2a9d8f' },
  { fill: '#e9c46a' },
  { fill: '#9b59b6' },
];

interface Brick {
  x: number;
  y: number;
  color: { fill: string };
}

export function LegoGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const canvasWidth = Math.min(W, width - 64);
  const scale = canvasWidth / W;

  const [platformX, setPlatformX] = React.useState(W / 2 - PLATFORM_W / 2);
  const [score, setScore] = React.useState(0);
  const [bricks, setBricks] = React.useState<Brick[]>([]);
  const [gameOver, setGameOver] = React.useState(false);
  const [showWin, setShowWin] = React.useState(false);
  const [showGameOver, setShowGameOver] = React.useState(false);
  const wonRef = React.useRef(false);
  const [elapsed, setElapsed] = React.useState(0);
  const startTime = React.useRef(Date.now());
  const platformXRef = React.useRef(platformX);
  platformXRef.current = platformX;

  const moveLeft = () => setPlatformX((x) => Math.max(0, x - 48));
  const moveRight = () => setPlatformX((x) => Math.min(W - PLATFORM_W, x + 48));

  React.useEffect(() => {
    if (gameOver || wonRef.current) return;
    const id = setInterval(() => {
      if (wonRef.current) {
        clearInterval(id);
        return;
      }
      const px = platformXRef.current;
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));

      setBricks((prev) => {
        const platformTop = H - FLOOR_H - PLATFORM_H - 8;
        let next = prev
          .map((b) => ({ ...b, y: b.y + 5.5 }))
          .filter((b) => {
            if (b.y + BRICK_H > H - FLOOR_H) {
              setGameOver(true);
              return false;
            }
            if (
              b.x + BRICK_W > px &&
              b.x < px + PLATFORM_W &&
              b.y + BRICK_H > platformTop &&
              b.y + BRICK_H < platformTop + PLATFORM_H + 10
            ) {
              setScore((s) => {
                const next = s + 1;
                if (next >= TARGET) {
                  wonRef.current = true;
                  markGameWon('lego');
                  getUserName().then((name) => {
                    submitScore('lego', next, next + ' cărămizi', name || 'Jucător');
                  });
                  setShowWin(true);
                }
                return next;
              });
              return false;
            }
            return true;
          });
        if (next.length === 0 && Math.random() < 0.14) {
          next.push({
            x: Math.random() * (W - BRICK_W),
            y: -BRICK_H,
            color: LEGO_COLORS[Math.floor(Math.random() * LEGO_COLORS.length)]!,
          });
        }
        return next;
      });

      // Win is handled in setScore when we catch the TARGET-th brick
    }, 50);
    return () => clearInterval(id);
  }, [gameOver, score]);

  React.useEffect(() => {
    if (gameOver && !showWin) {
      setShowGameOver(true);
      getUserName().then((name) => {
        submitScore('lego', score, score + ' cărămizi', name || 'Jucător');
      });
    }
  }, [gameOver, score, showWin]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧱 Turnul LEGO</Text>
      <Text style={styles.info}>
        Prinde cărămizile care cad! Construiește {TARGET} cărămizi pentru a
        câștiga. Dacă ratezi una, jocul se termină!
      </Text>
      <View style={styles.stats}>
        <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
        <Text style={styles.score}>
          Cărămizi: {score} / {TARGET} 🧱
        </Text>
      </View>
      <View style={[styles.canvasWrap, { width: canvasWidth, height: H * scale }]}>
        <View
          style={[
            styles.canvas,
            {
              width: W,
              height: H,
              transform: [{ scale }],
              transformOrigin: 'left top',
            },
          ]}
        >
          <View style={[styles.sky, { width: W, height: H }]}>
            {bricks.map((b, i) => (
              <View
                key={i}
                style={[
                  styles.brick,
                  {
                    left: b.x,
                    top: b.y,
                    width: BRICK_W - 4,
                    height: BRICK_H - 4,
                    backgroundColor: b.color.fill,
                  },
                ]}
              />
            ))}
            <View style={[styles.floor, { height: FLOOR_H }]} />
            <View
              style={[
                styles.platform,
                {
                  left: platformX,
                  top: H - FLOOR_H - PLATFORM_H - 8,
                  width: PLATFORM_W,
                  height: PLATFORM_H,
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
        emoji="🧱"
        title="Turn complet!"
        message={`Ai construit ${score} cărămizi!`}
        onClose={() => router.replace('/(tabs)')}
      />

      <WinModal
        visible={showGameOver}
        emoji="😅"
        title="Ups!"
        message="Ai ratat o cărămiză!"
        scoreLabel="Ai construit"
        scoreDisplay={score + ' cărămizi'}
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
    minWidth: 120,
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
    minWidth: 140,
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
    backgroundColor: '#7dd3fc',
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
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sky: {
    position: 'relative',
    backgroundColor: '#0ea5e9',
  },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#57534e',
    borderTopWidth: 4,
    borderTopColor: '#292524',
  },
  brick: {
    position: 'absolute',
    borderRadius: 4,
    margin: 2,
  },
  platform: {
    position: 'absolute',
    backgroundColor: '#e63946',
    borderRadius: 10,
    borderWidth: 5,
    borderColor: '#292524',
    shadowColor: '#c1121f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
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
