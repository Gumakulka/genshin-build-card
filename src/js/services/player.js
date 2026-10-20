/* Dane gracza: zapytania, ograniczony cache, tryb offline i historia konta. */
const FETCH_TIMEOUT_MS = 15000;
const MIN_TTL_S = 15;
const MAX_TTL_S = 3600;
const CACHE_KEEP = 10;
const CACHE_MIN_KEEP = 3;
const CACHE_INDEX = 'player-index';
const PLAYER_UID = /^\d{9}$/;

function playerRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasPlayerInfo(data) {
  if (!playerRecord(data) || !playerRecord(data.playerInfo)) return false;
  const info = data.playerInfo;
  if (typeof info.nickname !== 'string' || info.nickname.length > 200) return false;
  if (info.showAvatarInfoList !== undefined && (!Array.isArray(info.showAvatarInfoList) || !info.showAvatarInfoList.every((entry) => playerRecord(entry) && Number.isInteger(entry.avatarId)))) return false;
  if (data.avatarInfoList !== undefined) {
    if (!Array.isArray(data.avatarInfoList)) return false;
    for (const entry of data.avatarInfoList) {
      if (!playerRecord(entry) || !Number.isInteger(entry.avatarId)) return false;
      if (entry.equipList !== undefined && (!Array.isArray(entry.equipList) || !entry.equipList.every((item) => playerRecord(item) && playerRecord(item.flat)))) return false;
    }
  }
  return true;
}

function playerRemove(key) {
  try { localStorage.removeItem(key); } catch (error) { /* Pamięć może być zablokowana. */ }
}

function cacheIndex() {
  return [...new Set(sanitizeList(loadJsonSetting(CACHE_INDEX, []), []).filter((uid) => typeof uid === 'string' && PLAYER_UID.test(uid)))];
}

function cacheDrop(list) {
  list.filter((uid) => typeof uid === 'string' && PLAYER_UID.test(uid)).forEach((uid) => {
    playerRemove('player-' + uid);
    playerRemove('offline-' + uid);
  });
}

function cacheTouch(uid) {
  if (!PLAYER_UID.test(String(uid))) return;
  const list = cacheIndex().filter((item) => item !== String(uid));
  list.unshift(String(uid));
  cacheDrop(list.splice(CACHE_KEEP));
  saveJsonSetting(CACHE_INDEX, list);
}

function cacheMigrate() {
  try {
    if (localStorage.getItem(CACHE_INDEX) !== null) return;
    const found = Object.create(null);
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i) || '';
      const match = /^(?:player|offline)-(\d{9})$/.exec(key);
      if (!match) continue;
      let stamp = 0;
      try {
        const item = JSON.parse(localStorage.getItem(key));
        stamp = Number(item && (item.savedAt || item.expires)) || 0;
      } catch (error) { stamp = 0; }
      found[match[1]] = Math.max(found[match[1]] || 0, stamp);
    }
    const ordered = Object.keys(found).sort((a, b) => found[b] - found[a]);
    cacheDrop(ordered.splice(CACHE_KEEP));
    saveJsonSetting(CACHE_INDEX, ordered);
  } catch (error) { /* Brak pamięci nie blokuje aplikacji. */ }
}

function storeEntry(uid, key, payload) {
  if (!PLAYER_UID.test(String(uid))) return;
  let text;
  try { text = JSON.stringify(payload); } catch (error) { return; }
  cacheTouch(uid);
  try { localStorage.setItem(key, text); return; } catch (error) { /* Jedna próba po sprzątaniu. */ }
  const list = cacheIndex();
  cacheDrop(list.splice(CACHE_MIN_KEEP));
  saveJsonSetting(CACHE_INDEX, list);
  try { localStorage.setItem(key, text); } catch (error) { /* Zapis jest opcjonalny. */ }
}

function getCache(uid) {
  try {
    const raw = localStorage.getItem('player-' + uid);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached && Number.isFinite(cached.expires) && Date.now() < cached.expires && hasPlayerInfo(cached.data)) {
      cacheTouch(uid);
      return cached.data;
    }
  } catch (error) { /* Uszkodzony lub niedostępny cache. */ }
  playerRemove('player-' + uid);
  return null;
}

function setCache(uid, data) {
  const requested = Number(data.ttl);
  const seconds = Number.isFinite(requested) ? requested : 60;
  const ttl = Math.min(MAX_TTL_S, Math.max(MIN_TTL_S, seconds)) * 1000;
  storeEntry(uid, 'player-' + uid, { expires: Date.now() + ttl, data });
}

async function fetchPlayer(uid) {
  if (!PLAYER_UID.test(String(uid))) throw new Error(t('uidLength'));
  const cached = getCache(uid);
  if (cached) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let response;
    try {
      response = await fetch(WORKER_URL + uid, { signal: controller.signal, credentials: 'omit' });
    } catch (error) {
      error.network = true;
      throw error;
    }
    if (!response.ok) throw new Error(t('errors')[response.status] || t('generic') + response.status);
    let data;
    try {
      data = await response.json();
    } catch (error) {
      const failure = new Error(t('generic') + 'JSON');
      failure.network = true;
      throw failure;
    }
    if (!hasPlayerInfo(data)) throw new Error(t('generic') + 'data');
    setCache(uid, data);
    return data;
  } catch (error) {
    if (controller.signal.aborted) error.network = true;
    throw error;
  } finally { clearTimeout(timer); }
}

function saveOffline(uid, data) {
  if (hasPlayerInfo(data)) storeEntry(uid, 'offline-' + uid, { savedAt: Date.now(), data });
}

function loadOffline(uid) {
  try {
    const raw = localStorage.getItem('offline-' + uid);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved && Number.isFinite(saved.savedAt) && hasPlayerInfo(saved.data) ? saved : null;
  } catch (error) { return null; }
}

function snapshotOf(info) {
  return { t: Date.now(), level: info.level, worldLevel: info.worldLevel, achievements: info.finishAchievementNum, abyss: info.towerFloorIndex ? info.towerFloorIndex + '-' + info.towerLevelIndex : '-', stars: info.towerStarIndex || 0, characters: (info.showAvatarInfoList || []).length };
}

function updateHistory(uid, info) {
  const key = 'history-' + uid;
  const list = sanitizeList(loadJsonSetting(key, []), []).filter(playerRecord);
  const current = snapshotOf(info);
  const previous = list.length ? list[list.length - 1] : null;
  const changes = [];
  if (previous) {
    [['adventureRank', 'level'], ['worldLevel', 'worldLevel'], ['achievements', 'achievements'], ['abyss', 'abyss'], ['stars', 'stars'], ['characters', 'characters']].forEach(([label, field]) => {
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
