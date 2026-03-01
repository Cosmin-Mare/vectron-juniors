/**
 * App-wide: username modal, win handling, score submission
 */
(function() {
  const LEGO_INTRO_SHOWN_KEY = 'vectron_lego_intro_shown';

  function showLegoIntroModal(name) {
    const overlay = document.createElement('div');
    overlay.id = 'lego-intro-modal';
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="popup-center">
        <div class="education-popup username-popup lego-intro-popup">
          <h3>🧱 Bine ai venit, ${name || 'Explorator'}!</h3>
          <p>Ai un joc bonus special: <strong>Turnul LEGO</strong>! Vezi cărțila cu cărămizile în lista de jocuri.</p>
          <p>Completează toate cele 7 jocuri pentru a-l debloca. Mult succes! 🎉</p>
          <button class="popup-btn" id="lego-intro-ok">Am înțeles!</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#lego-intro-ok').onclick = () => {
      overlay.remove();
      localStorage.setItem(LEGO_INTRO_SHOWN_KEY, '1');
    };
  }

  function showUsernameModal() {
    const existing = document.getElementById('username-modal');
    if (existing) return;
    const overlay = document.createElement('div');
    overlay.id = 'username-modal';
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="popup-center">
        <div class="education-popup username-popup">
          <h3>👋 Cum te cheamă?</h3>
          <p>Introdu numele tău pentru a apărea în clasament!</p>
          <input type="text" id="username-input" maxlength="20" placeholder="Ex: Alex" />
          <button class="popup-btn" id="username-save">Începe!</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#username-input');
    const btn = overlay.querySelector('#username-save');
    input.value = getUserName();
    input.focus();
    const closeAndRefresh = () => {
      overlay.remove();
      const el = document.getElementById('username-display');
      if (el) el.textContent = getUserName() ? 'Salut, ' + getUserName() + '!' : '';
      const changeBtn = document.getElementById('change-name-btn');
      if (changeBtn) changeBtn.style.display = getUserName() ? 'inline-block' : 'none';
    };
    btn.onclick = () => {
      const name = setUserName(input.value);
      if (name) {
        closeAndRefresh();
        if (!localStorage.getItem(LEGO_INTRO_SHOWN_KEY)) {
          showLegoIntroModal(name);
        }
      }
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') btn.click();
    };
  }

  function checkUsername() {
    if (!hasUserName()) showUsernameModal();
  }

  /** Call when a game is won - updates overlay, marks win, submits score */
  window.gameWon = function(options) {
    const { gameId, score, scoreDisplay, scoreLabel } = options || {};
    markGameWon(gameId);

    const scoreEl = document.getElementById('win-score-display');
    const labelEl = document.getElementById('win-score-label');
    if (scoreEl) scoreEl.textContent = scoreDisplay !== undefined ? scoreDisplay : (score !== undefined ? score : '');
    if (labelEl && scoreLabel) labelEl.textContent = scoreLabel;

    if (gameId && score !== undefined && typeof submitScore === 'function') {
      const toSubmit = (options.scoreType === 'time') ? -score : score;
      submitScore(gameId, toSubmit, String(scoreDisplay !== undefined ? scoreDisplay : score));
    }

    showWinOverlay();
  };

  window.checkUsername = checkUsername;
  window.showUsernameModal = showUsernameModal;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('username-check')) checkUsername();
  });
})();
