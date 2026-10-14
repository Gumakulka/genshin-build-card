/* Dane gracza: zapytania, krótka pamięć podręczna, tryb offline i historia konta. */
const FETCH_TIMEOUT_MS = 15000;
const MIN_TTL_S = 15;
const MAX_TTL_S = 3600;

function hasPlayerInfo(data) {
  return Boolean(data) && typeof data === 'object' && Boolean(data.playerInfo) && typeof data.playerInfo === 'object';
}

function getCache(uid) {
  try {
    const raw = localStorage.getItem('player-' + uid);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached && typeof cached.expires === 'number' && Date.now() < cached.expires && hasPlayerInfo(cached.data)) {
      return cached.data;
    }
    localStorage.removeItem('player-' + uid);
    return null;
  } catch (error) {
    localStorage.removeItem('player-' + uid);
    return null;
  }
}

function setCache(uid, data) {
  try {
    const requested = Number(data.ttl);
    const seconds = Number.isFinite(requested) ? requested : 60;
    const ttl = Math.min(MAX_TTL_S, Math.max(MIN_TTL_S, seconds)) * 1000;
    localStorage.setItem('player-' + uid, JSON.stringify({ expires: Date.now() + ttl, data }));
  } catch (error) {
    console.error(error);
  }
}

async function fetchPlayer(uid) {
  const cached = getCache(uid);
  if (cached) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(WORKER_URL + uid, { signal: controller.signal });
  } catch (error) {
    clearTimeout(timer);
    error.network = true;
    throw error;
  }
  try {
    if (!response.ok) {
      throw new Error(t('errors')[response.status] || t('generic') + response.status);
    }
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(t('generic') + 'JSON');
    }
    if (!hasPlayerInfo(data)) throw new Error(t('generic') + 'data');
    setCache(uid, data);
    return data;
  } catch (error) {
    if (controller.signal.aborted) error.network = true;
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved && typeof saved.savedAt === 'number' && hasPlayerInfo(saved.data) ? saved : null;
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
