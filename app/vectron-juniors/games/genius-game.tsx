import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WinModal } from '@/components/win-modal';
import { markGameWon } from '@/lib/storage';
import { submitScore } from '@/lib/firebase';
import { getUserName } from '@/lib/storage';

const QUIZ_QUESTIONS = [
  {
    q: 'Unde se află Geniusul expus?',
    options: [
      'Muzeul Brukenthal din Sibiu',
      'Muzeul Municipal Dej',
      'Muzeul Național de Istorie',
    ],
    correct: 1,
  },
  {
    q: 'Cine își arăta adorația prin Genius?',
    options: ['Țăranii locali', 'Soldații romani din castrul de la Cășeiu', 'Măcelarii'],
    correct: 1,
  },
  {
    q: 'Ce reprezenta Geniusul pentru romani?',
    options: [
      'Un zeu al muncii',
      'Adorația față de împărat',
      'Spiritul protectiv al casei',
    ],
    correct: 1,
  },
  {
    q: 'Ce port are Geniusul?',
    options: [
      'Port de luptă',
      'Port ancestral (la sacrificii sau război)',
      'Port de zi cu zi',
    ],
    correct: 1,
  },
];

export function GeniusGame() {
  const router = useRouter();
  const [qIndex, setQIndex] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);
  const [showWin, setShowWin] = React.useState(false);
  const [finalTime, setFinalTime] = React.useState(0);
  const [disabled, setDisabled] = React.useState(false);
  const [answeredIdx, setAnsweredIdx] = React.useState<number | null>(null);
  const answeringRef = React.useRef(false);

  React.useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const q = QUIZ_QUESTIONS[qIndex];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  const handleAnswer = (idx: number) => {
    if (disabled || answeringRef.current) return;
    answeringRef.current = true;
    setDisabled(true);
    setAnsweredIdx(idx);
    const correctIdx = q.correct;
    const isCorrect = idx === correctIdx;
    if (isCorrect) setCorrectCount((c) => c + 1);
    const currentQIndex = qIndex;
    setTimeout(() => {
      answeringRef.current = false;
      if (currentQIndex + 1 >= QUIZ_QUESTIONS.length) {
        const sec = Math.round((Date.now() - startTime) / 1000);
        setFinalTime(sec);
        markGameWon('genius');
        getUserName().then((name) => {
          submitScore('genius', -sec, sec + ' sec', name || 'Jucător');
        });
        setShowWin(true);
      } else {
        setQIndex((i) => i + 1);
        setDisabled(false);
        setAnsweredIdx(null);
      }
    }, 1200);
  };

  if (!q) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏛️ Geniusul Roman</Text>
      <Text style={styles.info}>
        Întrebarea {qIndex + 1} din {QUIZ_QUESTIONS.length}
      </Text>
      <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
      <Text style={styles.question}>{q.q}</Text>
      <View style={styles.options}>
        {q.options.map((opt, i) => (
          <Pressable
            key={`${qIndex}-${i}`}
            style={({ pressed }) => [
              styles.option,
              pressed && !disabled && styles.optionPressed,
              answeredIdx === i && i === q.correct && styles.optionCorrect,
              answeredIdx === i && i !== q.correct && styles.optionWrong,
            ]}
            onPress={() => handleAnswer(i)}
            disabled={disabled}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <WinModal
        visible={showWin}
        emoji="🏛️"
        title="Felicitări!"
        message="Ai răspuns corect la toate întrebările!"
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
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d1f14',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 28,
  },
  options: {
    width: '100%',
    gap: 16,
  },
  option: {
    padding: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fef3c7',
    borderRadius: 18,
    borderWidth: 5,
    borderColor: '#292524',
    shadowColor: '#44403c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionCorrect: {
    backgroundColor: '#86efac',
    borderColor: '#15803d',
    shadowColor: '#15803d',
  },
  optionWrong: {
    backgroundColor: '#fca5a5',
    borderColor: '#b91c1c',
    shadowColor: '#991b1b',
  },
  optionText: {
    fontSize: 15,
    color: '#292524',
  },
});
