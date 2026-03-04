/**
 * Storage for Vectron Juniors - AsyncStorage on native, localStorage on web
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERNAME_KEY = 'vectron_username';
const WINS_KEY = 'vectron_wins';
const LEGO_INTRO_KEY = 'vectron_lego_intro_shown';

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (isWeb && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }
}

export async function getUserName(): Promise<string> {
  return (await getItem(USERNAME_KEY)) || '';
}

export async function setUserName(name: string): Promise<string> {
  const clean = (name || '').trim().substring(0, 20);
  if (clean) await setItem(USERNAME_KEY, clean);
  return clean;
}

export async function hasUserName(): Promise<boolean> {
  const name = await getUserName();
  return !!name;
}

export async function markGameWon(gameId: string): Promise<void> {
  const wins = await getWins();
  wins[gameId] = true;
  await setItem(WINS_KEY, JSON.stringify(wins));
}

export async function isGameWon(gameId: string): Promise<boolean> {
  const wins = await getWins();
  return !!wins[gameId];
}

async function getWins(): Promise<Record<string, boolean>> {
  const raw = await getItem(WINS_KEY);
  return raw ? JSON.parse(raw) : {};
}

const LEGO_REQUIRED = [
  'mammoth',
  'monoxyl',
  'pazitorul',
  'pietre',
  'bratari',
  'secera',
];

export async function hasUnlockedLegoGame(): Promise<boolean> {
  const wins = await getWins();
  return LEGO_REQUIRED.every((id) => wins[id]);
}

export async function getLegoProgress(): Promise<number> {
  const wins = await getWins();
  return LEGO_REQUIRED.filter((id) => wins[id]).length;
}

export async function getLegoIntroShown(): Promise<boolean> {
  return (await getItem(LEGO_INTRO_KEY)) === '1';
}

export async function setLegoIntroShown(): Promise<void> {
  await setItem(LEGO_INTRO_KEY, '1');
}
