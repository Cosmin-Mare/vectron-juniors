/**
 * Firebase Realtime Database - Leaderboard for Vectron Juniors
 */
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  limitToFirst,
  get,
  runTransaction,
  onValue,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyADdVAm4elg61EOsG0lix23yi205vXBKWI',
  authDomain: 'vectron-juniors.firebaseapp.com',
  databaseURL:
    'https://vectron-juniors-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'vectron-juniors',
  storageBucket: 'vectron-juniors.firebasestorage.app',
  messagingSenderId: '964428197766',
  appId: '1:964428197766:web:00dabde2492c852a598607',
};

let db: ReturnType<typeof getDatabase> | null = null;

function initDb() {
  if (db) return db;
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    return db;
  } catch (err) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('Firebase init failed:', err);
    }
    return null;
  }
}

export interface LeaderboardEntry {
  key: string;
  username: string;
  score: number;
  scoreDisplay?: string;
  timestamp?: number;
}

export async function submitScore(
  gameId: string,
  score: number,
  scoreDisplay: string,
  username: string
): Promise<LeaderboardEntry | null> {
  const database = initDb();
  if (!database) return null;

  const trimmed = username.substring(0, 20);
  const entry = {
    username: trimmed,
    score,
    scoreDisplay,
    timestamp: Date.now(),
  };

  const refPath = ref(database, `scores/${gameId}`);
  const pushed = await push(refPath, entry);

  const normalized = normalizeUsername(trimmed);
  if (normalized) {
    const usernameRef = ref(database, `usernames/${normalized}`);
    runTransaction(usernameRef, (current) => (current ? current : trimmed)).catch(
      () => {}
    );
  }
  return { key: pushed.key ?? '', ...entry };
}

/**
 * Time games store negative seconds; best = least negative (e.g. -20 beats -60).
 * Points games: best = highest. Both use limitToLast + descending sort for best-first display.
 */
const LOWER_IS_BETTER = new Set<string>();

function processScoreEntries(
  rawEntries: LeaderboardEntry[],
  gameId: string
): LeaderboardEntry[] {
  const bestByUser = new Map<string, LeaderboardEntry>();
  for (const e of rawEntries) {
    const key = (e.username || '').trim().toLowerCase();
    if (!key) continue;
    const existing = bestByUser.get(key);
    const isBetter =
      !existing ||
      (LOWER_IS_BETTER.has(gameId)
        ? e.score < existing.score
        : e.score > existing.score);
    if (isBetter) bestByUser.set(key, e);
  }
  const sorted = Array.from(bestByUser.values()).sort((a, b) =>
    LOWER_IS_BETTER.has(gameId) ? a.score - b.score : b.score - a.score
  );
  return sorted.slice(0, 5);
}

export function subscribeToAllLeaderboards(
  callback: (data: Record<string, LeaderboardEntry[]>) => void,
  onError?: (err: Error) => void
): () => void {
  const database = initDb();
  if (!database) {
    callback({});
    onError?.(new Error('Firebase nu este inițializat.'));
    return () => {};
  }

  const scoresRef = ref(database, 'scores');
  const handler = (snap: { val: () => unknown }) => {
    const data = snap.val();
    const result: Record<string, LeaderboardEntry[]> = {};
    for (const gameId of GAME_IDS) {
      const gameData = data?.[gameId];
      const rawEntries: LeaderboardEntry[] = [];
      if (gameData && typeof gameData === 'object') {
        for (const [key, val] of Object.entries(gameData)) {
          if (val && typeof val === 'object') {
            rawEntries.push({
              key,
              ...(val as Omit<LeaderboardEntry, 'key'>),
            });
          }
        }
      }
      result[gameId] = processScoreEntries(rawEntries, gameId);
    }
    callback(result);
  };

  return onValue(scoresRef, handler, (err) => onError?.(err));
}

export async function getLeaderboard(
  gameId: string,
  limit = 5
): Promise<LeaderboardEntry[]> {
  const database = initDb();
  if (!database) {
    throw new Error('Firebase nu este inițializat.');
  }

  const fetchLimit = 50;
  const refPath = ref(database, `scores/${gameId}`);
  const q = query(
    refPath,
    orderByChild('score'),
    LOWER_IS_BETTER.has(gameId)
      ? limitToFirst(fetchLimit)
      : limitToLast(fetchLimit)
  );

  const snap = await get(q);
  const entries: LeaderboardEntry[] = [];
  snap.forEach((child) => {
    entries.push({ key: child.key ?? '', ...child.val() });
  });
  return processScoreEntries(entries, gameId).slice(0, limit);
}

function normalizeUsername(name: string): string {
  return (name || '').trim().toLowerCase().substring(0, 20);
}

export async function isUsernameTaken(
  name: string,
  currentName?: string
): Promise<boolean> {
  const database = initDb();
  if (!database) return false;
  const normalized = normalizeUsername(name);
  if (!normalized) return false;
  if (currentName && normalizeUsername(currentName) === normalized) return false;
  const refPath = ref(database, `usernames/${normalized}`);
  const snap = await get(refPath);
  return snap.exists();
}

export async function reserveUsername(
  displayName: string,
  currentName?: string
): Promise<boolean> {
  const database = initDb();
  if (!database) return false;
  const normalized = normalizeUsername(displayName);
  if (!normalized) return false;
  if (currentName && normalizeUsername(currentName) === normalized) return true;
  const refPath = ref(database, `usernames/${normalized}`);
  const result = await runTransaction(refPath, (current) => {
    if (current) return undefined;
    return displayName.trim().substring(0, 20);
  });
  return result.committed;
}

const GAME_IDS = [
  'mammoth',
  'monoxyl',
  'pazitorul',
  'pietre',
  'bratari',
  'secera',
  'lego',
];

export async function getAllLeaderboards(): Promise<
  Record<string, LeaderboardEntry[]>
> {
  const results = await Promise.all(
    GAME_IDS.map((id) => getLeaderboard(id, 5))
  );
  return GAME_IDS.reduce(
    (acc, id, i) => {
      acc[id] = results[i];
      return acc;
    },
    {} as Record<string, LeaderboardEntry[]>
  );
}
