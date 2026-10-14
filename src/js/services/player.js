/* Dane gracza: zapytania, krótka pamięć podręczna, tryb offline i historia konta. */
function getCache(uid) {
  try {
    const raw = localStorage.getItem('player-' + uid);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() < cached.expires) return cached.data;
    localStorage.removeItem('player-' + uid);
    return null;
  } catch (error) {
    localStorage.removeItem('player-' + uid);
    return null;
  }
}

function setCache(uid, data) {
  try {
    const ttl = (data.ttl || 60) * 1000;
    localStorage.setItem('player-' + uid, JSON.stringify({ expires: Date.now() + ttl, data }));
  } catch (error) {
    console.error(error);
  }
}

async function fetchPlayer(uid) {
  const cached = getCache(uid);
  if (cached) return cached;
  let response;
  try {
    response = await fetch(WORKER_URL + uid);
  } catch (error) {
    error.network = true;
    throw error;
  }
  if (!response.ok) {
    throw new Error(t('errors')[response.status] || t('generic') + response.status);
  }
  const data = await response.json();
  setCache(uid, data);
  return data;
}

function saveOffline(uid, data) {
  try {
    localStorage.setItem('offline-' + uid, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (error) {
    console.error(error);
  }
}

function loadOffline(uid) {
  try {
    const raw = localStorage.getItem('offline-' + uid);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function snapshotOf(info) {
  return {
    t: Date.now(),
    level: info.level,
    worldLevel: info.worldLevel,
    achievements: info.finishAchievementNum,
    abyss: info.towerFloorIndex ? info.towerFloorIndex + '-' + info.towerLevelIndex : '-',
    stars: info.towerStarIndex || 0,
    characters: (info.showAvatarInfoList || []).length
  };
}

function updateHistory(uid, info) {
  const key = 'history-' + uid;
  const list = sanitizeList(loadJsonSetting(key, []), []);
  const current = snapshotOf(info);
  const previous = list.length ? list[list.length - 1] : null;
  const changes = [];
  if (previous) {
    [
      ['adventureRank', 'level'],
      ['worldLevel', 'worldLevel'],
      ['achievements', 'achievements'],
      ['abyss', 'abyss'],
      ['stars', 'stars'],
      ['characters', 'characters']
    ].forEach(([label, field]) => {
      if (previous[field] !== current[field]) changes.push({ label, from: previous[field], to: current[field] });
    });
  }
  if (!previous || changes.length) {
    list.push(current);
    saveJsonSetting(key, list.slice(-20));
  }
  return { previous, changes };
}
