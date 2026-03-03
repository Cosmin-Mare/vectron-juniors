/**
 * Firebase Realtime Database - Leaderboard for Vectron Juniors
 */
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, query, orderByChild, limitToLast, get } from 'firebase/database';

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
  } catch {
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

  const entry = {
    username: username.substring(0, 20),
    score,
    scoreDisplay,
    timestamp: Date.now(),
  };

  const refPath = ref(database, `scores/${gameId}`);
  const pushed = await push(refPath, entry);
  return { key: pushed.key ?? '', ...entry };
}

export async function getLeaderboard(
  gameId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const database = initDb();
  if (!database) return [];

  const refPath = ref(database, `scores/${gameId}`);
  const q = query(
    refPath,
    orderByChild('score'),
    limitToLast(limit)
  );

  const snap = await get(q);
  const entries: LeaderboardEntry[] = [];
  snap.forEach((child) => {
    entries.push({ key: child.key ?? '', ...child.val() });
  });
  return entries.reverse();
}

const GAME_IDS = [
  'mammoth',
  'monoxyl',
  'pazitorul',
  'genius',
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
