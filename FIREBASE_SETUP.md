# 🔥 Cum să obții cheile Firebase – Ghid pas cu pas

Acest ghid te ia pas cu pas prin obținerea cheilor Firebase necesare pentru clasamentul jocurilor.

---

## Pasul 1: Deschide Firebase Console

1. Mergi la **https://console.firebase.google.com/**
2. Autentifică-te cu contul Google

---

## Pasul 2: Creează un proiect (sau folosește unul existent)

1. Apasă **"Adaugă proiect"** (sau "Create a project")
2. Introdu un nume pentru proiect (ex: `vectron-juniors`)
3. (Opțional) Dezactivează Google Analytics dacă nu ai nevoie
4. Apasă **"Creează proiect"**

---

## Pasul 3: Activează Realtime Database

1. În meniul din stânga, apasă pe **"Build"** (sau pictograma de aplicații)
2. Alege **"Realtime Database"**
3. Apasă **"Create Database"**
4. Alege o regiune (ex: `europe-west1` pentru România)
5. Pentru **development**, alege **"Start in test mode"**
   - În test mode, oricine poate citi/scrie date pentru 30 de zile
   - Pentru producție, vei seta reguli mai stricte mai târziu
6. Apasă **"Enable"**

---

## Pasul 4: Înregistrează aplicația Web

1. Mergi la **Project Settings** (roata din stânga sus, lângă "Project Overview")
2. Derulează până la **"Your apps"**
3. Apasă pe pictograma **</>** (Web)
4. Introdu un nume pentru app (ex: `Vectron Juniors Website`)
5. (Opțional) Bifează "Firebase Hosting" dacă vrei să hostezi acolo
6. Apasă **"Register app"**
7. **Nu copia încă codul** – avem nevoie doar de config
8. Apasă **"Continue to console"**

---

## Pasul 5: Copiază cheile Firebase

1. Rămâi în **Project Settings** (sau mergi din nou la roata ⚙️)
2. Derulează la **"Your apps"** – vei vedea aplicația ta web
3. Sub numele app-ului, apasă pe **"Config"** (sau pe simbolul `</>`)
4. Vei vedea un bloc similar cu:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "vectron-juniors.firebaseapp.com",
  databaseURL: "https://vectron-juniors-default-rtdb.firebaseio.com",
  projectId: "vectron-juniors",
  storageBucket: "vectron-juniors.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. **Copiază** fiecare valoare din acest obiect

---

## Pasul 6: Adaugă cheile în proiectul tău

1. Deschide fișierul **`firebase-config.js`** din proiectul tău
2. Înlocuiește valorile placeholder cu cele din Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",           // ← lipsește din AIza până la sfârșit
  authDomain: "vectron-juniors.firebaseapp.com",
  databaseURL: "https://vectron-juniors-default-rtdb.firebaseio.com",
  projectId: "vectron-juniors",
  storageBucket: "vectron-juniors.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

3. Salvează fișierul

---

## Pasul 7: Verifică că funcționează

1. Pornește site-ul local: `npx serve .`
2. Joacă un joc și câștigă
3. Mergi la **Clasament** – ar trebui să vezi scorul tău
4. În Firebase Console → Realtime Database → vei vedea datele sub `scores/`

---

## Reguli pentru producție (opțional)

După ce testezi, în **Realtime Database** → **Rules**, poți seta:

```json
{
  "rules": {
    "scores": {
      ".read": true,
      "$gameId": {
        ".indexOn": ["score"],
        ".write": true
      }
    }
  }
}
```

`.indexOn` este necesar pentru afișarea corectă a clasamentului (sortare după scor). Fără el, clasamentul poate să nu se încarce.

---

## Probleme frecvente

| Problemă | Soluție |
|----------|---------|
| "Firebase nu este configurat" | Verifică că ai înlocuit **toate** valorile din `firebase-config.js`, inclusiv `apiKey` |
| Nu apar scoruri în clasament | Verifică că ai introdus un nume (la prima vizită) și că ai câștigat jocul |
| Eroare la încărcare | Verifică că `databaseURL` se termină cu `.firebaseio.com` (nu `.googleapis.com`) |

---

**Succes la FLL! 🏆**
