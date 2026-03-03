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
const H = 300;
const BOAT_W = 50;
const BOAT_H = 30;

interface Salt {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Rock {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function MonoxylGame() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 64) / W);

  const [boatX, setBoatX] = React.useState(W / 2 - BOAT_W / 2);
  const boatXRef = React.useRef(boatX);
  boatXRef.current = boatX;
  const [score, setScore] = React.useState(0);
  const [salt, setSalt] = React.useState<Salt[]>([]);
  const [rocks, setRocks] = React.useState<Rock[]>([]);
  const [gameOver, setGameOver] = React.useState(false);
  const [showWin, setShowWin] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const startTime = React.useRef(Date.now());
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const moveLeft = () =>
    setBoatX((x) => Math.max(0, x - 18));
  const moveRight = () =>
    setBoatX((x) => Math.min(W - BOAT_W, x + 18));

  React.useEffect(() => {
    if (gameOver) return;
    intervalRef.current = setInterval(() => {
      const bx = boatXRef.current;
      const now = Date.now();
      setElapsed(Math.floor((now - startTime.current) / 1000));

      setSalt((prev) => {
        let next = prev
          .map((s) => ({ ...s, y: s.y + 3.2 }))
          .filter((s) => {
            if (s.y > H) return false;
            if (s.x + s.w > bx && s.x < bx + BOAT_W && s.y + s.h > H - 55) {
              setScore((sc) => sc + 1);
              return false;
            }
            return true;
          });
        if (Math.random() < 0.065) {
          next.push({
            x: Math.random() * (W - 40),
            y: -20,
            w: 30,
            h: 20,
          });
        }
        return next;
      });

      setRocks((prev) => {
        const next = prev
          .map((r) => ({ ...r, y: r.y + 3.5 }))
          .filter((r) => {
            if (r.y > H) return false;
            if (r.x + 15 < bx + BOAT_W && r.x + 30 > bx && r.y + 25 > H - 55) {
              setGameOver(true);
              return false;
            }
            return true;
          });
        if (Math.random() < 0.048) {
          next.push({
            x: Math.random() * (W - 40),
            y: -30,
            w: 35,
            h: 25,
          });
        }
        return next;
      });
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameOver]);

  React.useEffect(() => {
    if (gameOver) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      markGameWon('monoxyl');
      getUserName().then((name) => {
        submitScore('monoxyl', score, score + ' saci', name || 'Jucător');
      });
      setShowWin(true);
    }
  }, [gameOver, score]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛶 Aventura pe Someș</Text>
      <Text style={styles.info}>
        Condu monoxila cu săgețile sau butoanele! Strânge sacii de sare 🧂 și
        evită stâncile!
      </Text>
      <View style={styles.stats}>
        <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
        <Text style={styles.score}>Sare: {score} 🧂</Text>
      </View>
      <View style={[styles.canvasWrap, { width: W * scale, height: H * scale }]}>
        <View style={[styles.canvas, { transform: [{ scale }] }]}>
          <View style={styles.river}>
            {salt.map((s, i) => (
              <Text
                key={i}
                style={[
                  styles.salt,
                  {
                    left: s.x,
                    top: s.y,
                  },
                ]}
              >
                🧂
              </Text>
            ))}
            {rocks.map((r, i) => (
              <View
                key={i}
                style={[
                  styles.rock,
                  {
                    left: r.x,
                    top: r.y,
                    width: 35,
                    height: 25,
                  },
                ]}
              />
            ))}
            <View
              style={[
                styles.boat,
                {
                  left: boatX,
                  top: H - 55,
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
        emoji="😅"
        title="Ups!"
        message="Ai lovit o stâncă!"
        scoreLabel="Saci strânși:"
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
    width: W,
    height: H,
    position: 'relative',
  },
  river: {
    width: W,
    height: H,
    backgroundColor: '#38bdf8',
    position: 'relative',
  },
  salt: {
    position: 'absolute',
    fontSize: 24,
  },
  rock: {
    position: 'absolute',
    backgroundColor: '#78716c',
    borderRadius: 8,
  },
  boat: {
    position: 'absolute',
    width: BOAT_W,
    height: BOAT_H,
    backgroundColor: '#d97706',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#92400e',
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
