#!/usr/bin/env node

/**
 * Erases all data from the Firebase Realtime Database (scores + usernames).
 * Run from app/vectron-juniors: node ./scripts/clear-firebase-db.js
 */

const readline = require('readline');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, remove, get } = require('firebase/database');

const GAME_IDS = [
  'mammoth',
  'monoxyl',
  'pazitorul',
  'pietre',
  'bratari',
  'secera',
  'lego',
];

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

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.log('🗑️  Clear Firebase Realtime Database\n');
  console.log('This will permanently delete:');
  console.log('  - All scores (leaderboards)');
  console.log('  - All reserved usernames\n');

  const answer = await prompt('Type "yes" to confirm: ');
  if (answer !== 'yes') {
    console.log('Aborted.');
    process.exit(0);
  }

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  try {
    console.log('\nRemoving scores...');
    for (const gameId of GAME_IDS) {
      await remove(ref(db, `scores/${gameId}`));
    }
    console.log('✓ Scores removed');

    console.log('Removing usernames...');
    const usernamesSnap = await get(ref(db, 'usernames'));
    if (usernamesSnap.exists()) {
      const usernames = usernamesSnap.val();
      for (const key of Object.keys(usernames)) {
        await remove(ref(db, `usernames/${key}`));
      }
    }
    console.log('✓ Usernames removed');

    console.log('\n✅ Database cleared successfully.');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message?.includes('PERMISSION_DENIED')) {
      console.error('\nTip: Check Firebase Realtime Database rules allow write access.');
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
