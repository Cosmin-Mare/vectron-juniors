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

    const entry = {
      username: username.substring(0, 20),
      score: score,
      scoreDisplay: scoreDisplay || String(score),
      timestamp: Date.now()
    };

    return db.ref('scores/' + gameId).push(entry)
      .then(ref => ({ key: ref.key, ...entry }))
      .catch(err => {
        console.error('Score submit failed:', err);
        return null;
      });
  };

  /**
   * Get top 10 scores for a game. Scores are sorted desc (best time = most negative, best points = highest)
   */
  window.getLeaderboard = function(gameId, limit = 10) {
    if (!init()) return Promise.resolve([]);

    return db.ref('scores/' + gameId)
      .orderByChild('score')
      .limitToLast(limit)
      .once('value')
      .then(snap => {
        const entries = [];
        snap.forEach(child => {
          entries.push({ key: child.key, ...child.val() });
        });
        return entries.reverse(); // Best first
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
    const games = ['mammoth', 'monoxyl', 'pazitorul', 'genius', 'pietre', 'bratari', 'secera', 'lego'];
    return Promise.all(games.map(id => getLeaderboard(id, 5))).then(results =>
      games.reduce((acc, id, i) => { acc[id] = results[i]; return acc; }, {})
    );
  };
})();
