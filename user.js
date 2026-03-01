/**
 * Username management - stored in localStorage
 */
const USERNAME_KEY = 'vectron_username';
const WINS_KEY = 'vectron_wins';

function getUserName() {
  return localStorage.getItem(USERNAME_KEY) || '';
}

function setUserName(name) {
  const clean = (name || '').trim().substring(0, 20);
  if (clean) localStorage.setItem(USERNAME_KEY, clean);
  return clean;
}

function hasUserName() {
  return !!getUserName();
}

/** Mark a game as won - for unlocking secret game */
function markGameWon(gameId) {
  const wins = JSON.parse(localStorage.getItem(WINS_KEY) || '{}');
  wins[gameId] = true;
  localStorage.setItem(WINS_KEY, JSON.stringify(wins));
}

/** Check if a specific game has been won */
function isGameWon(gameId) {
  const wins = JSON.parse(localStorage.getItem(WINS_KEY) || '{}');
  return !!wins[gameId];
}

/** Check if all 6 main games are won (legacy - no longer used for secera) */
function hasUnlockedSecretGame() {
  const wins = JSON.parse(localStorage.getItem(WINS_KEY) || '{}');
  const required = ['mammoth', 'monoxyl', 'pazitorul', 'genius', 'pietre', 'bratari'];
  return required.every(id => wins[id]);
}

/** Check if all 7 games are won (for Lego bonus game) */
function hasUnlockedLegoGame() {
  const wins = JSON.parse(localStorage.getItem(WINS_KEY) || '{}');
  const required = ['mammoth', 'monoxyl', 'pazitorul', 'genius', 'pietre', 'bratari', 'secera'];
  return required.every(id => wins[id]);
}

/** Get progress (how many of 6 main games won) */
function getWinsProgress() {
  const wins = JSON.parse(localStorage.getItem(WINS_KEY) || '{}');
  const required = ['mammoth', 'monoxyl', 'pazitorul', 'genius', 'pietre', 'bratari'];
  return required.filter(id => wins[id]).length;
}

/** Get progress toward Lego unlock (X of 7) */
function getLegoProgress() {
  const wins = JSON.parse(localStorage.getItem(WINS_KEY) || '{}');
  const required = ['mammoth', 'monoxyl', 'pazitorul', 'genius', 'pietre', 'bratari', 'secera'];
  return required.filter(id => wins[id]).length;
}

window.getUserName = getUserName;
window.setUserName = setUserName;
window.hasUserName = hasUserName;
window.markGameWon = markGameWon;
window.isGameWon = isGameWon;
window.hasUnlockedSecretGame = hasUnlockedSecretGame;
window.hasUnlockedLegoGame = hasUnlockedLegoGame;
window.getWinsProgress = getWinsProgress;
window.getLegoProgress = getLegoProgress;
