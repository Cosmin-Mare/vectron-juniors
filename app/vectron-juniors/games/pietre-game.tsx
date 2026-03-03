import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WinModal } from '@/components/win-modal';
import { markGameWon } from '@/lib/storage';
import { submitScore } from '@/lib/firebase';
import { getUserName } from '@/lib/storage';

const CIPHER: Record<string, string> = {
  A: '☀',
  B: '☽',
  C: '✧',
  D: '◆',
  E: '◈',
  F: '⚜',
  G: '✠',
  H: '🜀',
  I: '☿',
  J: '⭐',
  M: '◉',
  O: '○',
  R: '⟡',
  S: '◇',
  U: '▵',
};

const PHRASES = ['DACIA', 'ROMA', 'CASEIU', 'DEJ'];
const DECODER_FACTS: Record<string, string> = {
  DACIA:
    'Dacia era o regiune antică unde locuiau dacii. Înscrisurile de pe pietrele funerare ne spun povești despre viața lor.',
  ROMA: 'Roma antică a influențat mult regiunea. Simbolurile romane apar pe multe monumente de la Cășeiu.',
  CASEIU: 'Cășeiu este o localitate unde au fost descoperite numeroase vestigii antice, inclusiv pietre funerare.',
  DEJ: 'Dejul are o istorie bogată! Multe descoperiri arheologice din zonă sunt expuse la Muzeul Municipal Dej.',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PietreGame() {
  const router = useRouter();
  const [phrase] = React.useState(() => {
    const valid = PHRASES.filter((p) =>
      p.split('').every((c) => CIPHER[c])
    );
    return valid[Math.floor(Math.random() * valid.length)]!;
  });
  const [symbols] = React.useState(() =>
    phrase.split('').map((c) => CIPHER[c]!)
  );
  const [chars] = React.useState(() => phrase.split(''));
  const [keyOrder, setKeyOrder] = React.useState(() =>
    shuffle(symbols.map((s, i) => ({ s, i })))
  );
  const [progress, setProgress] = React.useState(0);
  const [display, setDisplay] = React.useState(
    chars.map(() => '_').join(' ')
  );
  const [startTime] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);
  const [showWin, setShowWin] = React.useState(false);
  const [finalTime, setFinalTime] = React.useState(0);
  const [used, setUsed] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [startTime]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;

  const handlePress = (idx: number) => {
    if (used.has(idx)) return;
    if (idx !== progress) return; // wrong
    const newUsed = new Set(used).add(idx);
    setUsed(newUsed);
    const nextProgress = progress + 1;
    const arr = [...chars];
    for (let i = 0; i < nextProgress; i++) arr[i] = chars[i]!;
    for (let i = nextProgress; i < chars.length; i++) arr[i] = '_';
    setDisplay(arr.join(' '));
    setProgress(nextProgress);

    // Reshuffle key after each correct press - buttons move so you must find the next symbol
    const allKeys = symbols.map((s, i) => ({ s, i }));
    setKeyOrder(shuffle(allKeys));

    if (nextProgress >= chars.length) {
      const sec = Math.round((Date.now() - startTime) / 1000);
      setFinalTime(sec);
      markGameWon('pietre');
      getUserName().then((name) => {
        submitScore('pietre', -sec, sec + ' sec', name || 'Jucător');
      });
      setShowWin(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Decoderul Înscrisurilor</Text>
      <Text style={styles.info}>
        Pe piatra funerară e o inscripție codată. Apasă simbolurile în ordinea
        corectă pentru a-o decodifica!
      </Text>
      <Text style={styles.timer}>Timp: {formatTime(elapsed)}</Text>
      <View style={styles.stone}>
        <Text style={styles.stoneLabel}>Inscripția de pe piatra:</Text>
        <Text style={styles.encoded}>{symbols.join(' ')}</Text>
        <Text style={styles.stoneLabel}>Decodificare:</Text>
        <Text style={styles.display}>{display}</Text>
      </View>
      <Text style={styles.hint}>Alege simbolul care urmează în ordine:</Text>
      <View style={styles.key}>
        {keyOrder.map(({ s, i }) => (
          <Pressable
            key={i}
            style={[
              styles.keyBtn,
              used.has(i) && styles.keyBtnUsed,
            ]}
            onPress={() => handlePress(i)}
            disabled={used.has(i)}
          >
            <Text style={styles.keyText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      {progress >= chars.length && DECODER_FACTS[phrase] ? (
        <Text style={styles.fact}>💡 {DECODER_FACTS[phrase]}</Text>
      ) : null}

      <WinModal
        visible={showWin}
        emoji="📜"
        title="Felicitări!"
        message="Ai decodificat inscripția!"
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
    marginBottom: 20,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  stone: {
    backgroundColor: '#57534e',
    padding: 24,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 5,
    borderColor: '#292524',
    width: '100%',
    shadowColor: '#44403c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  stoneLabel: {
    fontSize: 14,
    color: 'rgba(255,248,231,0.8)',
    marginBottom: 8,
  },
  encoded: {
    fontSize: 20,
    letterSpacing: 8,
    color: '#fff8e7',
    marginVertical: 12,
  },
  display: {
    fontSize: 20,
    letterSpacing: 6,
    color: '#ffd93d',
    textAlign: 'center',
    minHeight: 32,
  },
  hint: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5d4a35',
    marginBottom: 16,
  },
  key: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  keyBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#fbbf24',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#292524',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  keyBtnUsed: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 24,
    color: '#fff',
  },
  fact: {
    fontSize: 14,
    color: '#44403c',
    lineHeight: 22,
    padding: 16,
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
});
