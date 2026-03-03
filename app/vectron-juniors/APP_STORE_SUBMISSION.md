# Ghid pentru trimiterea aplicației pe App Store

## Ce am pregătit pentru tine

- ✅ **Politică de confidențialitate** – `PRIVACY_POLICY.md` (trebuie hostată online)
- ✅ **Link politică în app** – se afișează când pui URL-ul în `app.json` → `extra.privacyPolicyUrl`
- ✅ **Bundle ID** – `com.vectronjuniors.vectronjuniors`
- ✅ Fără permisiuni sensibile (cameră, locație, etc.)

---

## Pasul 1: Hostează politica de confidențialitate

Apple **cere** un URL public către politica de confidențialitate când colectezi date (nume, scoruri).

**Opțiuni:**
- **GitHub Pages**: Pune `PRIVACY_POLICY.md` în un repo, activează Pages, URL: `https://username.github.io/repo-name/PRIVACY_POLICY` (sau convertește MD → HTML)
- **Site propriu**: Încarcă conținutul pe pagina `/privacy` sau `/politica-confidentialitate`
- **Serviciu gratuit**: Notion, Google Sites, etc. – publică o pagină și copiază linkul

Apoi actualizează în `app.json`:
```json
"extra": {
  "privacyPolicyUrl": "https://URL-ul-tau-real.ro/privacy"
}
```

---

## Pasul 2: Creează aplicația în App Store Connect

1. Mergi la [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Completează:
   - **Platform**: iOS
   - **Name**: Descoperiri de la Dej (sau Vectron Juniors)
   - **Primary Language**: Romanian
   - **Bundle ID**: Alege `com.vectronjuniors.vectronjuniors` – dacă nu există, creează-l în [developer.apple.com](https://developer.apple.com/account) → Certificates, Identifiers & Profiles → Identifiers → **+** → App IDs
   - **SKU**: ex. `vectronjuniors001`

---

## Pasul 3: Regénerează proiectul iOS

```bash
cd app/vectron-juniors
npx expo prebuild --platform ios --clean
```

---

## Pasul 4: Configurează semnarea în Xcode

1. Deschide `ios/vectronjuniors.xcworkspace` în Xcode
2. Selectează proiectul (albastru) din navigator
3. Tab **Signing & Capabilities**:
   - **Team**: Contul tău Apple Developer
   - Bifează **Automatically manage signing**
   - **Bundle Identifier**: `com.vectronjuniors.vectronjuniors`

---

## Pasul 5: Creează arhiva (Archive)

1. În Xcode, selectează **Any iOS Device (arm64)** ca destinație
2. Meniu: **Product** → **Archive**
3. Așteaptă finalizarea (poate dura câteva minute)
4. Se deschide **Organizer** (sau **Window** → **Organizer**)

---

## Pasul 6: Încarcă pe App Store Connect

1. În Organizer, selectează arhiva nouă
2. **Distribute App**
3. **App Store Connect** → **Upload**
4. Lasă opțiunile implicite (App Thinning, etc.)
5. **Upload**
6. Așteaptă procesarea (de obicei 5–15 minute)

---

## Pasul 7: Completează metadata în App Store Connect

În app-ul tău din App Store Connect:

### Informații generale
- **Name**: Descoperiri de la Dej
- **Subtitle** (opțional): Joacă și învață despre trecutul din Dej
- **Privacy Policy URL**: linkul la politica de confidențialitate
- **Category**: Education sau Games
- **Age Rating**: Completează chestionarul – probabil **4+** (fără conținut pentru adulți)

### Screenshots (obligatorii)

Ai nevoie de imagini pentru:
- **6.5"** (iPhone 14 Pro Max): 1284 x 2778 px
- **5.5"** (iPhone 8 Plus): 1242 x 2208 px

**Sugestie**: Rulează app-ul pe simulator, apasă **Cmd + S** pentru screenshot, apoi încarcă în App Store Connect.

### Descriere

Exemplu:
```
Descoperiri de la Dej – jocuri educative despre istoria și descoperirile din zona Dej, România. Alege din 8 jocuri: fragmente de mamut, monoxila, Păzitorul, Geniusul roman, pietrele funerare, brățările antice, secera și turnul LEGO. Proiect FLL România – Vectron-Juniors.
```

### Cuvinte cheie

Ex: `educație, istorie, Dej, FLL, jocuri, România`

### App Privacy (eticheta de confidențialitate)

În **App Privacy** → **Get Started**:
- **Do you or your third-party partners collect data?** → **Yes**
- **Data types**:
  - **Name** (sau „User ID”) – folosit pentru clasament
  - **Game Content** – scoruri
- **Is this data used to track users?** → **No**
- **Is this data linked to the user's identity?** → Poate **Yes** pentru nume

---

## Pasul 8: Export Compliance

La întrebarea „Does your app use encryption?”:
- **No** – dacă folosești doar HTTPS standard (Firebase, etc.)

---

## Pasul 9: Trimite pentru revizuire

1. În App Store Connect, asigură-te că ai completat toate câmpurile obligatorii
2. Alege build-ul încărcat
3. Click **Submit for Review**
4. Răspunde la întrebări (export, ads, etc.)
5. **Submit**

---

## Timp de așteptare

- Procesare build: ~5–15 minute
- Revizuire Apple: de obicei **24–48 ore**

---

## Verificare Firebase (producție)

În [Firebase Console](https://console.firebase.google.com) → Realtime Database → **Rules**:
- Nu lăsa reguli de tip `".read": true` pentru toți
- Folosește reguli care permit doar citire/scriere autorizată pentru scoruri

Exemplu minim pentru leaderboard:
```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```
(Firebase Anonymous Auth dacă vrei write fără login – sau lasă write pentru toți doar pentru scoruri, cu limitări în cod)

---

## Checklist rapid

- [ ] Politica de confidențialitate hostată + URL în app.json
- [ ] App creată în App Store Connect
- [ ] Bundle ID creat în Developer Portal
- [ ] Archive creat în Xcode
- [ ] Build încărcat
- [ ] Screenshots adăugate
- [ ] Descriere, cuvinte cheie, categorie
- [ ] App Privacy completat
- [ ] Submit for Review
