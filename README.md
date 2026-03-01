# Vectron-Juniors - Descoperiri de la Dej

Website interactiv cu 6 jocuri educaționale + un joc secret deblocabil. Proiect pentru **FLL Nationals România**.

## Jocuri

1. **Memoria Mamutului** – Memory (timp)
2. **Aventura pe Someș** – Barcă, puncte (sare)
3. **Puzzle-ul Păzitorului** – Puzzle (timp)
4. **Geniusul Roman** – Quiz (timp)
5. **Decoderul Înscrisurilor** – Decodare (timp)
6. **Modelul Brățărilor** – Simon Says (nivel)
7. **Secera cu limbă** – Joc secret (cereale strânse)

## Leaderboard & Firebase

### Configurare Firebase

1. Mergi la [Firebase Console](https://console.firebase.google.com/)
2. Creează un proiect nou (sau folosește unul existent)
3. Activează **Realtime Database**:
   - În meniu: Build > Realtime Database > Create Database
   - Alege regiunea (europe-west1 pentru România)
   - Pentru development: Start in **test mode** (date read/write pentru toți)
4. Adaugă o aplicație Web:
   - Project Settings (roata) > General > Your apps > Add app > Web
   - Copiază obiectul `firebaseConfig`
5. Deschide `firebase-config.js` și înlocuiește valorile:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "proiectul-tau.firebaseapp.com",
  databaseURL: "https://proiectul-tau-default-rtdb.firebaseio.com",
  projectId: "proiectul-tau",
  storageBucket: "proiectul-tau.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};
```

### Reguli Database (producție)

Pentru producție, în Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "scores": {
      ".read": true,
      "$gameId": {
        ".write": true
      }
    }
  }
}
```

## Username

La prima vizită, utilizatorul introduce un nume (max 20 caractere). Este salvat în `localStorage` și folosit pentru leaderboard.

## Jocul secret

După ce câștigi toate cele 6 jocuri principale, se deblochează **Secera cu limbă** – un joc de strâns cereale.

## Rulare

```bash
npx serve .
# sau
python -m http.server 8000
```

Deschide `http://localhost:3000` (sau portul afișat).

## Structură proiect

```
├── index.html          # Pagina principală + username
├── leaderboard.html    # Clasament
├── mammoth.html        # Joc 1
├── monoxyl.html        # Joc 2
├── pazitorul.html      # Joc 3
├── genius.html         # Joc 4
├── pietre.html         # Joc 5
├── bratari.html        # Joc 6
├── secera.html         # Joc secret
├── firebase-config.js # Config (adăugează cheile tale)
├── firebase-db.js      # Logică leaderboard
├── user.js             # Username & progres
├── games.js            # Logică jocuri
└── styles.css
```

---

**Vectron-Juniors** – FLL România
