/**
 * Vectron Juniors - FLL România theme (Cartoon Kid Style)
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#f97316',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#f97316',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
  earth: '#a16207',
  bronze: '#ea580c',
  river: '#0ea5e9',
  mammoth: '#fcd34d',
  gold: '#fbbf24',
  cream: '#fffbeb',
  bark: '#78716c',
  stone: '#d6d3d1',
  sun: '#fde047',
  grass: '#22c55e',
  sky: '#38bdf8',
  text: '#292524',
  textMuted: '#5d4a35',
  textLight: '#6b5b4a',
  white: '#fff',
  border: '#292524',
  success: '#15803d',
  error: '#b91c1c',
  orange: '#f97316',
  orangeDark: '#c2410c',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Fredoka', 'SF Pro Rounded', sans-serif",
    mono: "'Courier New', monospace",
  },
});

export const GAMES = [
  {
    id: 'lego',
    icon: '🧱',
    title: 'Turnul LEGO',
    desc: 'Completează toate cele 6 jocuri pentru a debloca!',
    locked: true,
    education: {
      title: '🧱 Turnul LEGO',
      text: 'Felicitări! FLL folosește LEGO pentru a construi roboți. Prinde cărămizile care cad și construiește cel mai înalt turn!',
    },
  },
  {
    id: 'mammoth',
    icon: '🦣',
    title: 'Memoria Mamutului',
    desc: 'Găsește perechile de fragmente fosile',
    education: {
      title: '🦣 Fragmentele de mamut',
      text: 'La aproximativ 12 km de Dej, în zona Nireș, au fost descoperite fragmente fosile de mamut – un animal uriaș din perioada preistorică. Aceste descoperiri arată că clima și natura din această zonă erau complet diferite acum mii de ani.',
    },
  },
  {
    id: 'monoxyl',
    icon: '🛶',
    title: 'Aventura pe Someș',
    desc: 'Condu barca cu sarea pe râu',
    education: {
      title: '🛶 Monoxila',
      text: 'Monoxila este o barcă făcută dintr-un singur trunchi de copac. Pe Someș transportau sare – o resursă prețioasă în antichitate.',
    },
  },
  {
    id: 'pazitorul',
    icon: '🗿',
    title: 'Puzzle-ul Păzitorului',
    desc: 'Asamblează statuia misterioasă',
    education: {
      title: '🗿 Păzitorul',
      text: 'Păzitorul este o statuie care sugerează existența unor monumente cu rol simbolic sau religios. Ne arată că oamenii din trecut aveau credințe, artă și nevoie de protecție spirituală.',
    },
  },
  {
    id: 'pietre',
    icon: '📜',
    title: 'Decoderul Înscrisurilor',
    desc: 'Decodifică simbolurile de pe pietrele funerare',
    education: {
      title: '📜 Pietrele funerare',
      text: 'Pietrele funerare din regiune conțin inscripții codate. Decodifică simbolurile pentru a descoperi povești despre viața din antichitate.',
    },
  },
  {
    id: 'bratari',
    icon: '📿',
    title: 'Mărgeaua Diferită',
    desc: 'Găsește mărgeaua de culoare diferită pe brățara antică',
    education: {
      title: '📿 Brățările antice',
      text: 'Brățările antice aveau mărgele de culori diverse. Găsește mărgeaua care are o culoare diferită de celelalte!',
    },
  },
  {
    id: 'secera',
    icon: '🌾',
    title: 'Secera cu limbă',
    desc: 'Strânge cerealele în timp limitat',
    education: {
      title: '🌾 Secera',
      text: 'Secera cu limbă era folosită pentru strângerea cerealelor. Strânge cât mai multe cereale în 30 de secunde!',
    },
  },
] as const;
