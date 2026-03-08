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
          <p>Ai un joc bonus special: <strong>Turnul LEGO</strong>. Completează toate cele 6 jocuri pentru a-l debloca.</p>
          <p><strong>Vino la standul Vectron Juniors pentru a primi un premiu!</strong> 🎁</p>
          <p>Mult succes! 🎉</p>
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
          <p id="username-error" style="color:#c62828;font-size:14px;margin-top:8px;text-align:center;display:none;"></p>
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
    btn.onclick = async () => {
      const raw = (input.value || '').trim().substring(0, 20);
      if (!raw) return;
      const errEl = overlay.querySelector('#username-error');
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      const current = getUserName();
      if (typeof reserveUsername === 'function') {
        const ok = await reserveUsername(raw, current);
        if (!ok) {
          if (errEl) { errEl.textContent = 'Numele este deja folosit. Alege alt nume.'; errEl.style.display = 'block'; }
          return;
        }
      }
      setUserName(raw);
      closeAndRefresh();
      if (!localStorage.getItem(LEGO_INTRO_SHOWN_KEY)) {
        showLegoIntroModal(raw);
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
