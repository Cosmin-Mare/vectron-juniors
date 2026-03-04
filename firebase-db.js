/**
 * Firebase Realtime Database - Leaderboard & Scores
 * Works without Firebase (graceful fallback) if config is not set
 */

(function() {
  let db = null;
  let initialized = false;

  function init() {
    if (initialized) return !!db;
    const config = window.FIREBASE_CONFIG;
    if (!config || !config.apiKey || config.apiKey === 'YOUR_API_KEY') {
      console.log('Firebase not configured - leaderboard disabled');
      initialized = true;
      return false;
    }
    try {
      firebase.initializeApp(config);
      db = firebase.database();
      initialized = true;
      return true;
    } catch (e) {
      console.error('Firebase init error:', e);
      initialized = true;
      return false;
    }
  }

  /**
   * Submit a score. For time-based games, pass negative seconds (e.g. -45 for 45 sec)
   * so lower time = higher score when sorted.
   */
  window.submitScore = function(gameId, score, scoreDisplay) {
    const username = (typeof getUserName === 'function' ? getUserName() : '') || 'Jucător';
    if (!init()) return Promise.resolve(null);

    const trimmed = username.substring(0, 20);
    const entry = {
      username: trimmed,
      score: score,
      scoreDisplay: scoreDisplay || String(score),
      timestamp: Date.now()
    };

    const pushPromise = db.ref('scores/' + gameId).push(entry)
      .then(ref => ({ key: ref.key, ...entry }))
      .catch(err => {
        console.error('Score submit failed:', err);
        return null;
      });

    const normalized = (trimmed || '').trim().toLowerCase().substring(0, 20);
    if (normalized) {
      db.ref('usernames/' + normalized).transaction(function(current) {
        return current ? current : trimmed;
      }).catch(function() {});
    }

    return pushPromise;
  };

  const LOWER_IS_BETTER = ['mammoth', 'pazitorul', 'pietre'];

  /**
   * Get top scores for a game. Time games: best = lowest (most negative). Points games: best = highest.
   */
  window.getLeaderboard = function(gameId, limit = 10) {
    if (!init()) return Promise.resolve([]);
    const useLimitFirst = LOWER_IS_BETTER.indexOf(gameId) >= 0;
    const fetchLimit = 50;
    const q = useLimitFirst
      ? db.ref('scores/' + gameId).orderByChild('score').limitToFirst(fetchLimit)
      : db.ref('scores/' + gameId).orderByChild('score').limitToLast(fetchLimit);

    return q.once('value')
      .then(snap => {
        const entries = [];
        snap.forEach(child => {
          entries.push({ key: child.key, ...child.val() });
        });
        if (!useLimitFirst) entries.reverse();
        const byUser = new Map();
        entries.forEach(e => {
          const k = (e.username || '').trim().toLowerCase();
          if (!k) return;
          const existing = byUser.get(k);
          const better = !existing || (useLimitFirst ? e.score < existing.score : e.score > existing.score);
          if (better) byUser.set(k, e);
        });
        return Array.from(byUser.values())
          .sort((a, b) => useLimitFirst ? a.score - b.score : b.score - a.score)
          .slice(0, limit);
      })
      .catch(err => {
        console.error('Leaderboard fetch failed:', err);
        return [];
      });
  };

  /**
   * Get all leaderboards (for leaderboard page)
   */
  window.getAllLeaderboards = function() {
    const games = ['mammoth', 'monoxyl', 'pazitorul', 'pietre', 'bratari', 'secera', 'lego'];
    return Promise.all(games.map(id => getLeaderboard(id, 5))).then(results =>
      games.reduce((acc, id, i) => { acc[id] = results[i]; return acc; }, {})
    );
  };

  /**
   * Reserve username (transaction - only succeeds if not taken).
   * Returns Promise<boolean> - true if reserved, false if already taken.
   */
  window.reserveUsername = function(displayName, currentName) {
    if (!init()) return Promise.resolve(false);
    const normalized = (displayName || '').trim().toLowerCase().substring(0, 20);
    if (!normalized) return Promise.resolve(false);
    if (currentName && (currentName || '').trim().toLowerCase().substring(0, 20) === normalized) {
      return Promise.resolve(true);
    }
    const ref = db.ref('usernames/' + normalized);
    return ref.transaction(function(current) {
      if (current) return undefined;
      return (displayName || '').trim().substring(0, 20);
    }).then(function(result) {
      return result.committed;
    });
  };

  window.isUsernameTaken = function(name, currentName) {
    if (!init()) return Promise.resolve(false);
    const normalized = (name || '').trim().toLowerCase().substring(0, 20);
    if (!normalized) return Promise.resolve(false);
    if (currentName && (currentName || '').trim().toLowerCase().substring(0, 20) === normalized) {
      return Promise.resolve(false);
    }
    return db.ref('usernames/' + normalized).once('value').then(function(snap) {
      return snap.exists();
    });
  };
})();
