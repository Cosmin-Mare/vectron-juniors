/**
 * Vectron-Juniors - FLL România
 * 6 Jocuri despre descoperirile din regiunea Dej
 * Each game runs on its own page
 */

// Full CIPHER for all letters used in decoder phrases (DACIA, ROMA, CASEIU, DEJ)
const CIPHER = {
  A: '☀', B: '☽', C: '✧', D: '◆', E: '◈', F: '⚜', G: '✠', H: '🜀', I: '☿',
  J: '⭐', M: '◉', O: '○', R: '⟡', S: '◇', U: '▵'
};

const DECODER_PHRASES = ['DACIA', 'ROMA', 'CASEIU', 'DEJ'];

const MAMMOTH_SYMBOLS = ['🦴', '🪵', '❄️', '🌿', '🦣', '⛰️'];
const PUZZLE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PUZZLE_SYMBOLS = ['🜀', '☿', '⚜', '✠', '☀', '☽', '✧', '◆', '◈'];
const PATTERN_COLORS = ['gold', 'bronze', 'copper', 'silver'];
const PATTERN_EMOJI = { gold: '🟡', bronze: '🟤', copper: '🟠', silver: '⚪' };

const QUIZ_QUESTIONS = [
  { q: 'Unde se află Geniusul expus?', options: ['Muzeul Brukenthal din Sibiu', 'Muzeul Municipal Dej', 'Muzeul Național de Istorie'], correct: 1 },
  { q: 'Cine își arăta adorația prin Genius?', options: ['Țăranii locali', 'Soldații romani din castrul de la Cășeiu', 'Măcelarii'], correct: 1 },
  { q: 'Ce reprezenta Geniusul pentru romani?', options: ['Un zeu al muncii', 'Adorația față de împărat', 'Spiritul protectiv al casei'], correct: 1 },
  { q: 'Ce port are Geniusul?', options: ['Port de luptă', 'Port ancestral (la sacrificii sau război)', 'Port de zi cu zi'], correct: 1 }
];

let animId = null;
let timerIntervalId = null;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

/** Start a live timer. Returns stop function. */
function startLiveTimer(container, options) {
  const { countdownFrom = null, startTime = Date.now() } = options || {};
  const el = container.querySelector('.game-timer');
  if (!el) return () => {};

  if (timerIntervalId) clearInterval(timerIntervalId);
  timerIntervalId = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    if (countdownFrom !== null) {
      const left = Math.max(0, countdownFrom - elapsed);
      el.textContent = 'Rămase: ' + formatTime(left);
      if (left <= 0 && timerIntervalId) clearInterval(timerIntervalId);
    } else {
      el.textContent = 'Timp: ' + formatTime(elapsed);
    }
  }, 100);
  return () => { if (timerIntervalId) clearInterval(timerIntervalId); timerIntervalId = null; };
}

function initGame(gameId) {
  const overlay = document.getElementById('education-overlay');
  const startBtn = document.getElementById('startGame');
  const container = document.getElementById('game-container');

  if (overlay && startBtn) {
    startBtn.addEventListener('click', () => {
      overlay.classList.add('hidden');
      const game = GAMES[gameId]();
      if (game && game.render) game.render(container);
    });
  } else {
    // No overlay (direct load) - render game
    const game = GAMES[gameId]();
    if (game && game.render) game.render(container);
  }
}

function showWinOverlay() {
  const winOverlay = document.getElementById('win-overlay');
  if (winOverlay) winOverlay.classList.remove('hidden');
}

function gameWonFallback() {
  const winOverlay = document.getElementById('win-overlay');
  if (winOverlay) winOverlay.classList.remove('hidden');
}

function showGameOverOverlay() {
  const goOverlay = document.getElementById('gameover-overlay');
  if (goOverlay) goOverlay.classList.remove('hidden');
}

// ============ MAMMOTH MEMORY ============
function createMemoryGame() {
  let cards = [];
  let flipped = [];
  let startTime = 0;

  function init() {
    const symbols = [...MAMMOTH_SYMBOLS, ...MAMMOTH_SYMBOLS];
    cards = symbols.sort(() => Math.random() - 0.5);
  }

  function handleClick(container, index) {
    if (flipped.length >= 2 || flipped.includes(index)) return;
    const card = container.querySelector(`[data-index="${index}"]`);
    if (!card || card.classList.contains('matched')) return;

    if (flipped.length === 0 && startTime === 0) {
      startTime = Date.now();
      startLiveTimer(container, { startTime });
    }

    card.classList.add('flipped');
    card.textContent = cards[index];
    flipped.push(index);

    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a] === cards[b]) {
        container.querySelectorAll(`[data-index="${a}"], [data-index="${b}"]`).forEach(c => c.classList.add('matched'));
        flipped = [];
        const matched = container.querySelectorAll('.memory-card.matched').length;
        if (matched === cards.length) {
          const sec = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => {
            if (typeof gameWon === 'function') gameWon({ gameId: 'mammoth', score: sec, scoreDisplay: sec + ' sec', scoreLabel: 'Timp', scoreType: 'time' });
            else showWinOverlay();
          }, 600);
        }
      } else {
        setTimeout(() => {
          container.querySelectorAll(`[data-index="${a}"], [data-index="${b}"]`).forEach(c => {
            c.classList.remove('flipped');
            c.textContent = '';
          });
          flipped = [];
        }, 700);
      }
    }
  }

  return {
    render(container) {
      init();
      startTime = 0;
      container.innerHTML = `
        <h2 class="game-title">🦣 Memoria Mamutului</h2>
        <p class="game-info">Găsește toate perechile de fragmente fosile! Apasă pe cărți pentru a le întoarce.</p>
        <p class="game-timer">Timp: 0:00</p>
        <div class="memory-grid"></div>
      `;
      const grid = container.querySelector('.memory-grid');
      cards.forEach((_, i) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = i;
        card.addEventListener('click', () => handleClick(container, i));
        grid.appendChild(card);
      });
    }
  };
}

// ============ MONOXYL BOAT ============
function createMonoxylGame() {
  const W = 400;
  const H = 300;
  let boatX = W / 2 - 25;
  let score = 0;
  let salt = [];
  let rocks = [];
  let gameOver = false;
  let monoxylStart = Date.now();

  function spawnSalt() {
    if (Math.random() < 0.035) salt.push({ x: Math.random() * (W - 40), y: -20, w: 30, h: 20 });
  }
  function spawnRocks() {
    if (Math.random() < 0.025) rocks.push({ x: Math.random() * (W - 40), y: -30, w: 35, h: 25 });
  }

  function draw(ctx) {
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(30 + i * 90, 40 + Math.sin(Date.now()/300 + i) * 5, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.ellipse(W/2, H + 15, W * 0.6, 40, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const bw = 46; const bh = 28; const r = 10;
    ctx.moveTo(boatX + r, H - 52);
    ctx.lineTo(boatX + bw - r, H - 52);
    ctx.quadraticCurveTo(boatX + bw, H - 52, boatX + bw, H - 52 + r);
    ctx.lineTo(boatX + bw - 8, H - 30);
    ctx.lineTo(boatX + 8, H - 30);
    ctx.lineTo(boatX, H - 52 + r);
    ctx.quadraticCurveTo(boatX, H - 52, boatX + r, H - 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(boatX + 23, H - 38, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    salt.forEach(s => {
      ctx.font = '24px sans-serif';
      ctx.fillText('🧂', s.x, s.y + 22);
    });
    rocks.forEach(r => {
      const cx = r.x + r.w/2, cy = r.y + r.h/2;
      ctx.fillStyle = '#78716c';
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 2, 0, Math.PI);
      ctx.fill();
    });
  }

  function update(container) {
    salt.forEach(s => s.y += 1.8);
    rocks.forEach(r => r.y += 2);
    salt = salt.filter(s => {
      if (s.y > H) return false;
      if (s.x < boatX + 50 && s.x + s.w > boatX && s.y + s.h > H - 55) { score++; return false; }
      return true;
    });
    rocks = rocks.filter(r => {
      if (r.y > H) return false;
      if (r.x + 15 < boatX + 50 && r.x + 30 > boatX && r.y + 25 > H - 55) { gameOver = true; return false; }
      return true;
    });
    spawnSalt();
    spawnRocks();
  }

  function gameLoop(canvas, container) {
    const ctx = canvas.getContext('2d');
    if (gameOver) {
      const scoreEl = document.getElementById('gameover-score');
      if (scoreEl) scoreEl.textContent = score;
      markGameWon('monoxyl');
      if (typeof submitScore === 'function') submitScore('monoxyl', score, score + ' saci');
      showGameOverOverlay();
      return;
    }
    update(container);
    draw(ctx);
    const scoreDisplay = container.querySelector('.score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Sare: ${score} 🧂`;
    const timerEl = container.querySelector('.game-timer');
    if (timerEl) timerEl.textContent = 'Timp: ' + formatTime((Date.now() - monoxylStart) / 1000);
    animId = requestAnimationFrame(() => gameLoop(canvas, container));
  }

  return {
    render(container) {
      gameOver = false;
      score = 0;
      boatX = W / 2 - 25;
      salt = [];
      rocks = [];
      monoxylStart = Date.now();
      container.innerHTML = `
        <h2 class="game-title">🛶 Aventura pe Someș</h2>
        <p class="game-info">Condu monoxila cu săgețile sau butoanele! Strânge sacii de sare 🧂 și evită stâncile!</p>
        <p class="game-stats"><span class="game-timer">Timp: 0:00</span> &nbsp;|&nbsp; <span class="score-display">Sare: 0 🧂</span></p>
        <div class="boat-game">
          <div class="boat-canvas-wrapper">
            <canvas class="boat-canvas" width="${W}" height="${H}"></canvas>
          </div>
          <div class="boat-controls">
            <button class="boat-btn" id="boatLeft">← Stânga</button>
            <button class="boat-btn" id="boatRight">→ Dreapta</button>
          </div>
        </div>
      `;
      const canvas = container.querySelector('canvas');
      container.querySelector('#boatLeft')?.addEventListener('click', () => { boatX = Math.max(0, boatX - 32); });
      container.querySelector('#boatRight')?.addEventListener('click', () => { boatX = Math.min(W - 50, boatX + 32); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') boatX = Math.max(0, boatX - 32);
        if (e.key === 'ArrowRight') boatX = Math.min(W - 50, boatX + 32);
      });

      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) retryBtn.onclick = () => {
        document.getElementById('gameover-overlay')?.classList.add('hidden');
        createMonoxylGame().render(container);
      };

      gameLoop(canvas, container);
    },
    cleanup() { if (animId) cancelAnimationFrame(animId); }
  };
}

// ============ PĂZITORUL PUZZLE ============
function createPuzzleGame() {
  let order = [];
  let startTime = 0;
  let selectedIdx = null;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function checkWin(container) {
    const pieces = container.querySelectorAll('.puzzle-piece');
    let allCorrect = true;
    pieces.forEach((p, i) => {
      const val = parseInt(p.dataset.correct, 10);
      const isCorrect = val === i + 1;
      p.classList.toggle('correct', isCorrect);
      if (!isCorrect) allCorrect = false;
    });
    if (allCorrect) {
      const sec = Math.round((Date.now() - startTime) / 1000);
      setTimeout(() => {
        if (typeof gameWon === 'function') gameWon({ gameId: 'pazitorul', score: sec, scoreDisplay: sec + ' sec', scoreLabel: 'Timp', scoreType: 'time' });
        else showWinOverlay();
      }, 400);
    }
  }

  function handleSwap(container, a, b) {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    [order[idxA], order[idxB]] = [order[idxB], order[idxA]];
    renderPieces(container);
    checkWin(container);
  }

  function renderPieces(container) {
    const grid = container.querySelector('.puzzle-grid');
    if (!grid) return;
    selectedIdx = null;
    grid.innerHTML = '';
    order.forEach((val, idx) => {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.textContent = PUZZLE_SYMBOLS[val - 1] || '?';
      piece.dataset.value = val;
      piece.dataset.correct = val;
      piece.dataset.index = idx;
      piece.draggable = true;
      piece.addEventListener('dragstart', (e) => e.dataTransfer.setData('index', idx));
      piece.addEventListener('dragover', (e) => e.preventDefault());
      piece.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData('index'), 10);
        if (fromIdx !== idx) handleSwap(container, order[fromIdx], order[idx]);
      });
      piece.addEventListener('click', () => {
        if (selectedIdx === null) {
          selectedIdx = idx;
          piece.classList.add('puzzle-piece-selected');
        } else if (selectedIdx === idx) {
          selectedIdx = null;
          piece.classList.remove('puzzle-piece-selected');
        } else {
          container.querySelector('.puzzle-piece-selected')?.classList.remove('puzzle-piece-selected');
          handleSwap(container, order[selectedIdx], order[idx]);
          selectedIdx = null;
        }
      });
      grid.appendChild(piece);
    });
  }

  return {
    render(container) {
      startTime = Date.now();
      order = shuffle(PUZZLE_ORDER);
      container.innerHTML = `
        <h2 class="game-title">🗿 Puzzle-ul Păzitorului</h2>
        <p class="game-info">Trage sau apasă pe două piese pentru a le schimba! Aranjează totul în ordine.</p>
        <p class="game-timer">Timp: 0:00</p>
        <div class="puzzle-container">
          <div class="puzzle-grid"></div>
        </div>
      `;
      startLiveTimer(container, { startTime });
      renderPieces(container);
    }
  };
}

// ============ GENIUS QUIZ ============
function createGeniusQuiz() {
  let qIndex = 0;
  let correctCount = 0;
  let startTime = 0;

  function showQuestion(container) {
    const q = QUIZ_QUESTIONS[qIndex];
    if (!q) {
      const scoreEl = document.getElementById('quiz-score');
      if (scoreEl) scoreEl.textContent = correctCount;
      const sec = Math.round((Date.now() - startTime) / 1000);
      if (typeof gameWon === 'function') gameWon({ gameId: 'genius', score: sec, scoreDisplay: sec + ' sec', scoreLabel: 'Timp', scoreType: 'time' });
      else showWinOverlay();
      return;
    }
    container.innerHTML = `
      <h2 class="game-title">🏛️ Geniusul Roman</h2>
      <p class="game-info">Întrebarea ${qIndex + 1} din ${QUIZ_QUESTIONS.length}</p>
      <p class="game-timer">Timp: 0:00</p>
      <div class="quiz-container">
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `<div class="quiz-option" data-idx="${i}">${opt}</div>`).join('')}
        </div>
      </div>
    `;
    container.querySelectorAll('.quiz-option').forEach((opt, i) => {
      opt.addEventListener('click', () => {
        if (opt.style.pointerEvents === 'none') return;
        const correct = i === q.correct;
        if (correct) correctCount++;
        opt.classList.add(correct ? 'correct' : 'wrong');
        container.querySelectorAll('.quiz-option').forEach(o => { o.style.pointerEvents = 'none'; });
        setTimeout(() => { qIndex++; showQuestion(container); }, 1200);
      });
    });
  }

  return {
    render(container) {
      qIndex = 0;
      correctCount = 0;
      startTime = Date.now();
      showQuestion(container);
      setTimeout(() => startLiveTimer(container, { startTime }), 0);
    }
  };
}

// ============ DECODER - Engaging stone inscription game ============
const DECODER_FACTS = {
  DACIA: 'Dacia era o regiune antică unde locuiau dacii. Înscrisurile de pe pietrele funerare ne spun povești despre viața lor.',
  ROMA: 'Roma antică a influențat mult regiunea. Simbolurile romane apar pe multe monumente de la Cășeiu.',
  CASEIU: 'Cășeiu este o localitate unde au fost descoperite numeroase vestigii antice, inclusiv pietre funerare.',
  DEJ: 'Dejul are o istorie bogată! Multe descoperiri arheologice din zonă sunt expuse la Muzeul Municipal Dej.'
};

function createDecoderGame() {
  const validPhrases = DECODER_PHRASES.filter(p => p.split('').every(c => CIPHER[c]));
  const phrase = validPhrases[Math.floor(Math.random() * validPhrases.length)];
  const symbols = phrase.split('').map(c => CIPHER[c]);
  const chars = phrase.split('');
  let progress = 0;
  let startTime = 0;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    render(container) {
      progress = 0;
      startTime = Date.now();
      const shuffledOrder = shuffle([...symbols.map((s, i) => ({ s, i }))]);
      const encodedDisplay = symbols.join(' ');
      container.innerHTML = `
        <h2 class="game-title">📜 Decoderul Înscrisurilor</h2>
        <p class="game-info">Pe piatra funerară e o inscripție codată. Apasă simbolurile în ordinea corectă pentru a-o decodifica!</p>
        <p class="game-timer">Timp: 0:00</p>
        <div class="decoder-container">
          <div class="decoder-stone">
            <p class="decoder-stone-label">Inscripția de pe piatra:</p>
            <div class="decoder-encoded">${encodedDisplay}</div>
            <p class="decoder-stone-label">Decodificare:</p>
            <div class="decoder-display" aria-live="polite">${chars.map(() => '_').join(' ')}</div>
          </div>
          <p class="decoder-hint">Alege simbolul care urmează în ordine:</p>
          <div class="decoder-key">
            ${shuffledOrder.map(({ s, i }) => `<button class="decoder-btn" data-idx="${i}" type="button">${s}</button>`).join('')}
          </div>
          <p class="decoder-fact hidden" id="decoder-fact"></p>
        </div>
      `;
      startLiveTimer(container, { startTime });
      const display = container.querySelector('.decoder-display');
      const factEl = container.querySelector('#decoder-fact');
      if (!display) return;

      container.querySelectorAll('.decoder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (isNaN(idx)) return;

          if (idx !== progress) {
            btn.classList.add('decoder-wrong');
            btn.setAttribute('aria-label', 'Incorect! Încearcă din nou.');
            setTimeout(() => btn.classList.remove('decoder-wrong'), 500);
            if (factEl && !factEl.classList.contains('hidden')) factEl.classList.add('hidden');
            return;
          }

          btn.classList.add('decoder-correct');
          setTimeout(() => btn.classList.remove('decoder-correct'), 300);
          const arr = [...chars];
          for (let i = 0; i <= progress; i++) arr[i] = chars[i];
          for (let i = progress + 1; i < chars.length; i++) arr[i] = '_';
          display.textContent = arr.join(' ');
          display.classList.add('decoder-reveal');
          setTimeout(() => display.classList.remove('decoder-reveal'), 400);
          progress++;
          btn.disabled = true;
          btn.classList.add('decoder-used');

          if (progress >= chars.length) {
            const fact = DECODER_FACTS[phrase];
            if (factEl && fact) {
              factEl.textContent = '💡 ' + fact;
              factEl.classList.remove('hidden');
            }
            const sec = Math.round((Date.now() - startTime) / 1000);
            setTimeout(() => {
              if (typeof gameWon === 'function') gameWon({ gameId: 'pietre', score: sec, scoreDisplay: sec + ' sec', scoreLabel: 'Timp', scoreType: 'time' });
              else showWinOverlay();
            }, 800);
          }
        });
      });
    }
  };
}

// ============ BRĂȚĂRI PATTERN ============
function createPatternGame() {
  let sequence = [];
  let playerIndex = 0;
  let isPlaying = false;

  function addToSequence() {
    sequence.push(PATTERN_COLORS[Math.floor(Math.random() * PATTERN_COLORS.length)]);
  }

  function playSequence(container) {
    isPlaying = true;
    const displaySeq = container.querySelector('.pattern-display');
    if (!displaySeq) return;
    displaySeq.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('lit'));
    let i = 0;
    const interval = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(interval);
        isPlaying = false;
        return;
      }
      const color = sequence[i];
      const btn = displaySeq.querySelector(`.pattern-btn.${color}`);
      if (btn) {
        btn.classList.add('lit');
        setTimeout(() => btn.classList.remove('lit'), 450);
      }
      i++;
    }, 650);
  }

  function handlePlayerClick(container, color) {
    if (isPlaying) return;
    if (color !== sequence[playerIndex]) {
      container.querySelector('.game-info').textContent = 'Greșit! Apasă "Începe" pentru a reîncerca.';
      playerIndex = 0;
      return;
    }
    playerIndex++;
    if (playerIndex >= sequence.length) {
      if (sequence.length >= 5) {
        const levelEl = document.getElementById('pattern-level');
        if (levelEl) levelEl.textContent = sequence.length;
        if (typeof gameWon === 'function') gameWon({ gameId: 'bratari', score: sequence.length, scoreDisplay: 'Nivel ' + sequence.length, scoreLabel: 'Nivel atins' });
        else showWinOverlay();
        return;
      }
      addToSequence();
      playerIndex = 0;
      container.querySelector('.game-info').textContent = `Nivel ${sequence.length}! Memorează secvența...`;
      setTimeout(() => playSequence(container), 900);
    }
  }

  return {
    render(container) {
      sequence = [PATTERN_COLORS[Math.floor(Math.random() * PATTERN_COLORS.length)]];
      playerIndex = 0;
      container.innerHTML = `
        <h2 class="game-title">⌚ Modelul Brățărilor</h2>
        <p class="game-info">Memorează secvența și repet-o! Nivel 1</p>
        <p class="game-timer">Timp: 0:00</p>
        <div class="pattern-game">
          <p style="margin: 12px 0; font-weight: 700;">Secvența:</p>
          <div class="pattern-sequence pattern-display">
            ${PATTERN_COLORS.map(c => `<span class="pattern-btn ${c}">${PATTERN_EMOJI[c]}</span>`).join('')}
          </div>
          <button class="start-pattern-btn">Începe</button>
          <p style="margin: 16px 0; font-weight: 700;">Repetă secvența:</p>
          <div class="pattern-input">
            ${PATTERN_COLORS.map(c => `<button class="pattern-btn ${c}" data-color="${c}">${PATTERN_EMOJI[c]}</button>`).join('')}
          </div>
        </div>
      `;
      startLiveTimer(container, { startTime: Date.now() });
      const displaySeq = container.querySelector('.pattern-display');
      if (displaySeq) displaySeq.querySelectorAll('.pattern-btn').forEach(b => { b.style.pointerEvents = 'none'; });
      container.querySelector('.start-pattern-btn')?.addEventListener('click', () => {
        sequence = [PATTERN_COLORS[Math.floor(Math.random() * PATTERN_COLORS.length)]];
        playerIndex = 0;
        container.querySelector('.game-info').textContent = 'Nivel 1! Memorează...';
        playSequence(container);
      });
      container.querySelectorAll('.pattern-input .pattern-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePlayerClick(container, btn.dataset.color));
      });
      setTimeout(() => playSequence(container), 900);
    }
  };
}

// ============ SECERA (Secret Game) ============
function createSeceraGame() {
  const W = 400;
  const H = 320;
  let sickleX = W / 2 - 40;
  let score = 0;
  let wheat = [];
  let gameOver = false;
  let endTime = 0;
  let seceraAnimId;

  function spawnWheat() {
    if (Math.random() < 0.03) wheat.push({ x: Math.random() * (W - 30), y: -25, w: 25, h: 25 });
  }

  function draw(ctx) {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = '#DAA520';
    wheat.forEach(w => ctx.fillText('🌾', w.x, w.y + 22));
    ctx.fillStyle = '#5D4E37';
    ctx.beginPath();
    ctx.moveTo(sickleX, H - 35);
    ctx.lineTo(sickleX + 80, H - 35);
    ctx.lineTo(sickleX + 70, H - 15);
    ctx.lineTo(sickleX + 10, H - 15);
    ctx.closePath();
    ctx.fill();
  }

  function update(container) {
    wheat.forEach(w => w.y += 2.5);
    wheat = wheat.filter(w => {
      if (w.y > H) return false;
      if (w.x + 20 > sickleX && w.x < sickleX + 80 && w.y + 20 > H - 45) { score++; return false; }
      return true;
    });
    spawnWheat();
  }

  function gameLoop(canvas, container) {
    const ctx = canvas.getContext('2d');
    if (gameOver || Date.now() > endTime) {
      const scoreEl = document.getElementById('secera-final-score');
      if (scoreEl) scoreEl.textContent = score;
      if (typeof gameWon === 'function') gameWon({ gameId: 'secera', score, scoreDisplay: score + ' cereale', scoreLabel: 'Cereale strânse' });
      else showWinOverlay();
      return;
    }
    update(container);
    draw(ctx);
    const disp = container.querySelector('.secera-score');
    if (disp) disp.textContent = `Cereale: ${score}`;
    const timerEl = container.querySelector('.game-timer');
    if (timerEl) timerEl.textContent = 'Rămase: ' + formatTime(Math.max(0, (endTime - Date.now()) / 1000));
    seceraAnimId = requestAnimationFrame(() => gameLoop(canvas, container));
  }

  return {
    render(container) {
      gameOver = false;
      score = 0;
      sickleX = W / 2 - 40;
      wheat = [];
      endTime = Date.now() + 30000;
      const seceraStart = Date.now();
      container.innerHTML = `
        <h2 class="game-title">🌾 Secera cu limbă</h2>
        <p class="game-info">Strânge cerealele care cad! 30 secunde. Folosește săgețile sau butoanele.</p>
        <p class="game-stats"><span class="game-timer">Rămase: 0:30</span> &nbsp;|&nbsp; <span class="secera-score">Cereale: 0</span></p>
        <div class="boat-game">
          <div class="boat-canvas-wrapper">
            <canvas class="boat-canvas" width="${W}" height="${H}"></canvas>
          </div>
          <div class="boat-controls">
            <button class="boat-btn" id="seceraLeft">← Stânga</button>
            <button class="boat-btn" id="seceraRight">→ Dreapta</button>
          </div>
        </div>
      `;
      const canvas = container.querySelector('canvas');
      container.querySelector('#seceraLeft')?.addEventListener('click', () => { sickleX = Math.max(0, sickleX - 20); });
      container.querySelector('#seceraRight')?.addEventListener('click', () => { sickleX = Math.min(W - 80, sickleX + 20); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') sickleX = Math.max(0, sickleX - 20);
        if (e.key === 'ArrowRight') sickleX = Math.min(W - 80, sickleX + 20);
      });
      gameLoop(canvas, container);
    }
  };
}

// ============ LEGO BRICK STACK (Bonus - unlock after all 7 games) ============
const LEGO_COLORS = [
  { fill: '#e63946', stroke: '#c1121f' },
  { fill: '#1d3557', stroke: '#0d1b2a' },
  { fill: '#f4a261', stroke: '#e76f51' },
  { fill: '#2a9d8f', stroke: '#1d6b63' },
  { fill: '#e9c46a', stroke: '#d4a84b' },
  { fill: '#9b59b6', stroke: '#7d3c98' }
];

function createLegoGame() {
  const W = 400;
  const H = 400;
  const BRICK_W = 50;
  const BRICK_H = 24;
  const PLATFORM_W = 80;
  const PLATFORM_H = 20;
  const TARGET = 20;
  let platformX = W / 2 - PLATFORM_W / 2;
  let score = 0;
  let bricks = [];
  let gameOver = false;
  let legoStart = Date.now();
  let legoAnimId;

  function spawnBrick() {
    if (bricks.length > 0) return;
    if (Math.random() < 0.04) {
      const color = LEGO_COLORS[Math.floor(Math.random() * LEGO_COLORS.length)];
      bricks.push({
        x: Math.random() * (W - BRICK_W),
        y: -BRICK_H,
        w: BRICK_W,
        h: BRICK_H,
        color
      });
    }
  }

  function drawBrick(ctx, b) {
    ctx.fillStyle = b.color.fill;
    ctx.strokeStyle = b.color.stroke;
    ctx.lineWidth = 2;
    ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(b.x + 4, b.y + 4, 8, 8);
  }

  function draw(ctx) {
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#7dd3fc';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(50 + i * 110, 50 + Math.sin(Date.now()/400 + i) * 8, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
    bricks.forEach(b => drawBrick(ctx, b));
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = '#c1121f';
    ctx.lineWidth = 4;
    const px = platformX, py = H - PLATFORM_H - 10, pw = PLATFORM_W, ph = PLATFORM_H, r = 8;
    ctx.beginPath();
    ctx.moveTo(px + r, py);
    ctx.lineTo(px + pw - r, py);
    ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
    ctx.lineTo(px + r, py + ph);
    ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
    ctx.lineTo(px, py + r);
    ctx.quadraticCurveTo(px, py, px + r, py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function update(container) {
    bricks.forEach(b => b.y += 1.5);
    bricks = bricks.filter(b => {
      if (b.y > H) {
        gameOver = true;
        return false;
      }
      if (b.x + b.w > platformX && b.x < platformX + PLATFORM_W &&
          b.y + b.h > H - PLATFORM_H - 15 && b.y + b.h < H - 5) {
        score++;
        return false;
      }
      return true;
    });
    spawnBrick();
  }

  function gameLoop(canvas, container) {
    const ctx = canvas.getContext('2d');
    if (gameOver) {
      const scoreEl = document.getElementById('gameover-score');
      if (scoreEl) scoreEl.textContent = score;
      markGameWon('lego');
      if (typeof submitScore === 'function') submitScore('lego', score, score + ' cărămizi');
      showGameOverOverlay();
      return;
    }
    if (score >= TARGET) {
      const sec = Math.round((Date.now() - legoStart) / 1000);
      if (typeof gameWon === 'function') gameWon({ gameId: 'lego', score, scoreDisplay: score + ' cărămizi în ' + formatTime(sec), scoreLabel: 'Rezultat', scoreType: 'points' });
      else showWinOverlay();
      return;
    }
    update(container);
    draw(ctx);
    const scoreDisplay = container.querySelector('.score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Cărămizi: ${score} / ${TARGET} 🧱`;
    const timerEl = container.querySelector('.game-timer');
    if (timerEl) timerEl.textContent = 'Timp: ' + formatTime((Date.now() - legoStart) / 1000);
    legoAnimId = requestAnimationFrame(() => gameLoop(canvas, container));
  }

  return {
    render(container) {
      gameOver = false;
      score = 0;
      platformX = W / 2 - PLATFORM_W / 2;
      bricks = [];
      legoStart = Date.now();
      container.innerHTML = `
        <h2 class="game-title">🧱 Turnul LEGO</h2>
        <p class="game-info">Prinde cărămizile care cad! Construiește ${TARGET} cărămizi pentru a câștiga. Dacă ratezi una, jocul se termină!</p>
        <p class="game-stats"><span class="game-timer">Timp: 0:00</span> &nbsp;|&nbsp; <span class="score-display">Cărămizi: 0 / ${TARGET} 🧱</span></p>
        <div class="boat-game lego-game">
          <div class="boat-canvas-wrapper lego-canvas-wrapper">
            <canvas class="boat-canvas lego-canvas" width="${W}" height="${H}"></canvas>
          </div>
          <div class="boat-controls">
            <button class="boat-btn" id="legoLeft">← Stânga</button>
            <button class="boat-btn" id="legoRight">→ Dreapta</button>
          </div>
        </div>
      `;
      const canvas = container.querySelector('canvas');
      container.querySelector('#legoLeft')?.addEventListener('click', () => { platformX = Math.max(0, platformX - 28); });
      container.querySelector('#legoRight')?.addEventListener('click', () => { platformX = Math.min(W - PLATFORM_W, platformX + 28); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') platformX = Math.max(0, platformX - 28);
        if (e.key === 'ArrowRight') platformX = Math.min(W - PLATFORM_W, platformX + 28);
      });
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) retryBtn.onclick = () => {
        document.getElementById('gameover-overlay')?.classList.add('hidden');
        createLegoGame().render(container);
      };
      gameLoop(canvas, container);
    }
  };
}

const GAMES = {
  mammoth: createMemoryGame,
  monoxyl: createMonoxylGame,
  pazitorul: createPuzzleGame,
  genius: createGeniusQuiz,
  pietre: createDecoderGame,
  bratari: createPatternGame,
  secera: createSeceraGame,
  lego: createLegoGame
};
