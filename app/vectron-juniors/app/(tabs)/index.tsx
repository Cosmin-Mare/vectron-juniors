import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { GameCard } from '@/components/game-card';
import { UsernameModal } from '@/components/username-modal';
import { GAMES } from '@/constants/theme';
import {
  getUserName,
  setUserName,
  hasUserName,
  isGameWon,
  hasUnlockedLegoGame,
  getLegoProgress,
  getLegoIntroShown,
  setLegoIntroShown,
} from '@/lib/storage';
import { reserveUsername } from '@/lib/firebase';

const CARD_WIDTH = (Dimensions.get('window').width - 48 - 24) / 2;
const isSmallScreen = Dimensions.get('window').width < 500;

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsernameState] = React.useState('');
  const [showNameModal, setShowNameModal] = React.useState(false);
  const [gameStatus, setGameStatus] = React.useState<
    Record<string, { won: boolean; legoUnlocked: boolean; legoProgress: number }>
  >({});

  const refresh = React.useCallback(async () => {
    const name = await getUserName();
    setUsernameState(name);
    const legoUnlocked = await hasUnlockedLegoGame();
    const legoProgress = await getLegoProgress();
    const status: Record<string, { won: boolean; legoUnlocked: boolean; legoProgress: number }> = {};
    for (const g of GAMES) {
      if (g.id === 'lego') continue;
      status[g.id] = {
        won: await isGameWon(g.id),
        legoUnlocked,
        legoProgress,
      };
    }
    status.lego = {
      won: await isGameWon('lego'),
      legoUnlocked,
      legoProgress,
    };
    setGameStatus(status);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  React.useEffect(() => {
    const check = async () => {
      if (!(await hasUserName())) {
        setShowNameModal(true);
      }
    };
    check();
  }, []);

  const handleSaveName = async (name: string) => {
    const ok = await reserveUsername(name, username);
    if (!ok) {
      throw new Error('Numele este deja folosit. Alege alt nume.');
    }
    await setUserName(name);
    setUsernameState(name);
    setShowNameModal(false);
    const introShown = await getLegoIntroShown();
    if (!introShown) {
      await setLegoIntroShown();
    }
  };

  const legoData = gameStatus.lego;
  const legoUnlocked = legoData?.legoUnlocked ?? false;
  const legoProgress = legoData?.legoProgress ?? 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FLL România • Vectron-Juniors</Text>
        </View>
        <Text style={styles.h1}>Descoperiri de la Dej</Text>
        <Text style={styles.subtitle}>Joacă și învață despre trecutul nostru!</Text>
        <Text style={styles.intro}>
          Alege un joc și descoperă fragmente de mamut, monoxila medievală,
          Păzitorul, Geniusul roman, pietrele funerare și brățările antice!
        </Text>
        <View style={styles.actions}>
          {username ? (
            <>
              <Text style={styles.username}>Salut, {username}!</Text>
              <Pressable onPress={() => setShowNameModal(true)}>
                <Text style={styles.changeName}>Schimbă numele</Text>
              </Pressable>
            </>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.leaderboardBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/leaderboard')}
          >
            <Text style={styles.leaderboardText}>🏆 Clasament</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.unlockHint}>
        <Text style={styles.unlockText}>
          Completează toate cele 7 jocuri pentru a debloca Turnul LEGO! 🧱
        </Text>
      </View>

      <View style={[styles.grid, isSmallScreen && styles.gridSingle]}>
        {GAMES.map((game) => {
          const isLego = game.id === 'lego';
          const won = gameStatus[game.id]?.won ?? (isLego ? gameStatus.lego?.won : false);
          const status = won ? 'done' : 'todo';
          const progress = isLego && !legoUnlocked
            ? `${legoProgress} / 7 jocuri complete`
            : undefined;

          return (
            <View
              key={game.id}
              style={[styles.cardWrap, isSmallScreen && styles.cardWrapFull]}
            >
              <GameCard
                gameId={game.id}
                icon={game.icon}
                title={isLego ? `🏆 ${game.title}` : game.title}
                desc={isLego && !legoUnlocked ? game.desc : isLego ? 'Construiește turnul de cărămizi LEGO!' : game.desc}
                status={status}
                progress={progress}
                locked={isLego && !legoUnlocked}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Proiect FLL Nationals România • Vectron-Juniors
        </Text>
        {(() => {
          const url = Constants.expoConfig?.extra?.privacyPolicyUrl;
          if (url && url.startsWith('https://')) {
            return (
              <Pressable
                onPress={() => Linking.openURL(url)}
                style={{ marginTop: 12 }}
              >
                <Text style={styles.privacyLink}>Politică de confidențialitate</Text>
              </Pressable>
            );
          }
          return null;
        })()}
      </View>

      <UsernameModal
        visible={showNameModal}
        currentName={username}
        onSave={handleSaveName}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  badge: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#292524',
  },
  badgeText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
  },
  h1: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 32,
    color: '#292524',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#5d4a35',
    marginBottom: 16,
    fontWeight: '700',
  },
  intro: {
    fontSize: 16,
    color: '#6b5b4a',
    maxWidth: 620,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  username: {
    fontWeight: '700',
    color: '#5d4a35',
  },
  changeName: {
    color: '#ea580c',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  leaderboardBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f97316',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#292524',
  },
  leaderboardText: {
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
    fontSize: 16,
  },
  btnPressed: {
    opacity: 0.9,
  },
  unlockHint: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#292524',
    maxWidth: 520,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#57534e',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  gridSingle: {
    flexDirection: 'column',
  },
  cardWrap: {
    width: 280,
  },
  cardWrapFull: {
    width: '100%',
  },
  footer: {
    marginTop: 56,
    alignItems: 'center',
  },
  footerText: {
    color: '#8a7a6a',
    fontSize: 14,
  },
  privacyLink: {
    color: '#ea580c',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
