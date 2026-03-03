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
  apiKey: "AIzaSyADdVAm4elg61EOsG0lix23yi205vXBKWI",
  authDomain: "vectron-juniors.firebaseapp.com",
  databaseURL: "https://vectron-juniors-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vectron-juniors",
  storageBucket: "vectron-juniors.firebasestorage.app",
  messagingSenderId: "964428197766",
  appId: "1:964428197766:web:00dabde2492c852a598607"
};

// Firebase will be initialized in firebase-db.js after config is set
window.FIREBASE_CONFIG = firebaseConfig;
