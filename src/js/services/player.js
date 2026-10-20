/* Dane gracza: zapytania, krótka pamięć podręczna, tryb offline i historia konta. */
const FETCH_TIMEOUT_MS = 15000;
const MIN_TTL_S = 15;
const MAX_TTL_S = 3600;
const CACHE_KEEP = 10;
const CACHE_MIN_KEEP = 3;
/* Klucz zaczyna się od „player-”, więc „Wyczyść zapisane dane” w menu usuwa go razem z resztą. */
const CACHE_INDEX = 'player-index';

function hasPlayerInfo(data) {
  return Boolean(data) && typeof data === 'object' && Boolean(data.playerInfo) && typeof data.playerInfo === 'object';
}

/* Pamięć przeglądarki ma limit, więc trzymamy dane tylko ostatnich graczy. Indeks zapisuje kolejność od najnowszego. */
function cacheDrop(list) {
  list.forEach((uid) => {
    removeKey('player-' + uid);
    removeKey('offline-' + uid);
  });
}

function cacheTouch(uid) {
  const list = sanitizeList(loadJsonSetting(CACHE_INDEX, []), []).filter((item) => typeof item === 'string' && item !== uid);
  list.unshift(uid);
  cacheDrop(list.splice(CACHE_KEEP));
  saveJsonSetting(CACHE_INDEX, list);
}

/* Jednorazowe sprzątanie wpisów zapisanych przed wprowadzeniem indeksu. */
function cacheMigrate() {
  try {
    if (localStorage.getItem(CACHE_INDEX) !== null) return;
    const found = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const match = /^(?:player|offline)-(\d{9})$/.exec(localStorage.key(i) || '');
      if (!match) continue;
      let stamp = 0;
      try {
        const item = JSON.parse(localStorage.getItem(match[0]));
        stamp = Number(item && (item.savedAt || item.expires)) || 0;
      } catch (error) {
        stamp = 0;
      }
      found[match[1]] = Math.max(found[match[1]] || 0, stamp);
    }

    const ordered = Object.keys(found).sort((a, b) => found[b] - found[a]);
    cacheDrop(ordered.splice(CACHE_KEEP));
    saveJsonSetting(CACHE_INDEX, ordered);
  } catch (error) {
    console.error(error);
  }
}

/* Zapis z jedną ponowną próbą: gdy zabraknie miejsca, zostawiamy tylko kilku ostatnich graczy. */
function storeEntry(uid, key, payload) {
  cacheTouch(uid);
  const text = JSON.stringify(payload);

  try {
    localStorage.setItem(key, text);
    return;
  } catch (error) {
    const list = sanitizeList(loadJsonSetting(CACHE_INDEX, []), []);
    cacheDrop(list.splice(CACHE_MIN_KEEP));
    saveJsonSetting(CACHE_INDEX, list);
  }

  try {
    localStorage.setItem(key, text);
  } catch (error) {
    console.error(error);
  }
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
  const requested = Number(data.ttl);
  const seconds = Number.isFinite(requested) ? requested : 60;
  const ttl = Math.min(MAX_TTL_S, Math.max(MIN_TTL_S, seconds)) * 1000;
  storeEntry(uid, 'player-' + uid, { expires: Date.now() + ttl, data });
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
  storeEntry(uid, 'offline-' + uid, { savedAt: Date.now(), data });
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

cacheMigrate();
