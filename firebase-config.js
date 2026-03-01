/**
 * Firebase Configuration for Vectron-Juniors Leaderboard
 *
 * Ghid detaliat: vezi FIREBASE_SETUP.md
 *
 * Pe scurt:
 * 1. https://console.firebase.google.com/ → Creează proiect
 * 2. Realtime Database → Create Database (test mode)
 * 3. Project Settings → Your apps → Add web app → Copiază config
 * 4. Înlocuiește valorile de mai jos
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase will be initialized in firebase-db.js after config is set
window.FIREBASE_CONFIG = firebaseConfig;
