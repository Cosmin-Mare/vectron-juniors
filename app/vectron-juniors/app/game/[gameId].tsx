import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GAMES } from '@/constants/theme';
import { hasUnlockedLegoGame } from '@/lib/storage';
import { EducationOverlay } from '@/components/education-overlay';
import { MammothGame } from '@/games/mammoth-game';
import { PazitorulGame } from '@/games/pazitorul-game';
import { GeniusGame } from '@/games/genius-game';
import { PietreGame } from '@/games/pietre-game';
import { BratariGame } from '@/games/bratari-game';
import { MonoxylGame } from '@/games/monoxyl-game';
import { SeceraGame } from '@/games/secera-game';
import { LegoGame } from '@/games/lego-game';

const GAME_COMPONENTS: Record<string, React.ComponentType<object>> = {
  mammoth: MammothGame,
  monoxyl: MonoxylGame,
  pazitorul: PazitorulGame,
  genius: GeniusGame,
  pietre: PietreGame,
  bratari: BratariGame,
  secera: SeceraGame,
  lego: LegoGame,
};

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const [showEducation, setShowEducation] = React.useState(true);

  React.useEffect(() => {
    if (gameId === 'lego') {
      hasUnlockedLegoGame().then((unlocked) => {
        if (!unlocked) router.replace('/(tabs)');
      });
    }
  }, [gameId, router]);

  if (!gameId || !GAME_COMPONENTS[gameId]) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Joc necunoscut</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </Pressable>
      </View>
    );
  }

  const gameInfo = GAMES.find((g) => g.id === gameId);
  const GameComponent = GAME_COMPONENTS[gameId];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>← Înapoi</Text>
        </Pressable>
        {!showEducation && (
          <View style={styles.gameContainer}>
            <GameComponent />
          </View>
        )}
      </ScrollView>

      {gameInfo && (
        <EducationOverlay
          visible={showEducation}
          title={gameInfo.education.title}
          text={gameInfo.education.text}
          onStart={() => setShowEducation(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a5f3fc',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#fffbeb',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#292524',
    marginBottom: 20,
    shadowColor: '#292524',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  backBtnText: {
    fontFamily: 'Fredoka_700Bold',
    color: '#292524',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.9,
  },
  gameContainer: {
    minHeight: 450,
    backgroundColor: '#fffbeb',
    borderRadius: 28,
    padding: 32,
    borderWidth: 5,
    borderColor: '#292524',
    shadowColor: '#292524',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  error: {
    fontSize: 18,
    color: '#292524',
    marginBottom: 16,
  },
});
