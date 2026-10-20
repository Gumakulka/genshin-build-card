/* Dane statyczne Enki. Błąd pamięci podręcznej nie blokuje pobierania z sieci. */
let storePromise = null;
const STORE_CACHE_NAME = 'genshin-store-v2';
const STORE_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const STORE_TIMEOUT_MS = 15000;
const STORE_ID = /^\d{1,12}$/;

function storeRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function storeNetwork(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STORE_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
    const body = await response.arrayBuffer();
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
  } finally {
    clearTimeout(timer);
  }
}

async function cachedFetch(url) {
  let cache = null;
  let cached = null;
  try {
    if (typeof caches !== 'undefined') {
      cache = await caches.open(STORE_CACHE_NAME);
      cached = await cache.match(url);
    }
  } catch (error) {
    console.warn('Store cache unavailable:', error);
  }
  if (cached) {
    const fetchedAt = Number(cached.headers.get('x-fetched-at') || 0);
    if (fetchedAt > 0 && Date.now() - fetchedAt < STORE_CACHE_MAX_AGE) return cached;
  }
  let response;
  try {
    response = await storeNetwork(url);
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
  if (!response.ok) return cached || response;
  if (cache) {
    try {
      const copy = response.clone();
      const headers = new Headers(copy.headers);
      headers.set('x-fetched-at', String(Date.now()));
      await cache.put(url, new Response(copy.body, { status: copy.status, statusText: copy.statusText, headers }));
    } catch (error) {
      console.warn('Store cache write skipped:', error);
    }
  }
  return response;
}

async function fetchJson(name) {
  try {
    const response = await cachedFetch(STORE_URL + name);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    return storeRecord(data) ? data : null;
  } catch (error) {
    console.error('Could not load ' + name, error);
    return null;
  }
}

function normIcon(value) {
  if (typeof value !== 'string') return '';
  const name = value.replace(/^\/ui\//i, '').replace(/\.(png|jpe?g|webp)$/i, '');
  return /^[A-Za-z0-9_]{1,120}$/.test(name) ? name : '';
}

function normalizeCostume(costume) {
  if (!storeRecord(costume)) return null;
  return { ...costume, sideIconName: normIcon(costume.sideIconName || costume.SideIcon), icon: normIcon(costume.icon || costume.Icon), art: normIcon(costume.art || costume.Art) };
}

function normalizeCostumes(value) {
  const result = Object.create(null);
  if (Array.isArray(value)) {
    value.forEach((costume, index) => {
      const id = String(costume && costume.id !== undefined ? costume.id : index);
      const normalized = normalizeCostume(costume);
      if (STORE_ID.test(id) && normalized) result[id] = normalized;
    });
  } else if (storeRecord(value)) {
    Object.keys(value).forEach((id) => {
      if (!STORE_ID.test(id)) return;
      const normalized = normalizeCostume(value[id]);
      if (normalized) result[id] = normalized;
    });
  }
  return result;
}

function normalizeAvatars(data) {
  const characters = Object.create(null);
  Object.keys(storeRecord(data) ? data : {}).forEach((id) => {
    const source = data[id];
    if (!STORE_ID.test(id) || !storeRecord(source)) return;
    const character = { ...source, SideIconName: normIcon(source.SideIconName || source.SideIcon), Icon: normIcon(source.Icon || source.icon), Art: normIcon(source.Art || source.art), Consts: source.Consts || [], Skills: source.Skills || [], Costumes: normalizeCostumes(source.Costumes) };
    if (id === '10000062') delete character.NameTextMapHash;
    characters[id] = character;
  });
  return characters;
}

function normalizePfps(data) {
  const result = Object.create(null);
  Object.keys(storeRecord(data) ? data : {}).forEach((id) => {
    const source = data[id];
    if (STORE_ID.test(id) && storeRecord(source)) result[id] = { ...source, iconPath: normIcon(source.iconPath || source.IconPath) };
  });
  return result;
}

function normalizeNamecards(data) {
  const result = Object.create(null);
  Object.keys(storeRecord(data) ? data : {}).forEach((id) => {
    const source = data[id];
    if (STORE_ID.test(id) && storeRecord(source)) result[id] = { ...source, icon: normIcon(source.icon || source.Icon) };
  });
  return result;
}

function emptyStore() {
  return { characters: Object.create(null), pfps: Object.create(null), namecards: Object.create(null), loc: {} };
}

function loadStore() {
  if (!storePromise) {
    storePromise = Promise.all(['avatars.json', 'pfps.json', 'namecards.json', 'locs.json'].map(fetchJson)).then(([avatars, pfps, namecards, locs]) => {
      const characters = normalizeAvatars(avatars);
      const normalizedPfps = normalizePfps(pfps);
      const normalizedNamecards = normalizeNamecards(namecards);
      if (!Object.keys(characters).length || !Object.keys(normalizedPfps).length || !Object.keys(normalizedNamecards).length || !locs) storePromise = null;
      return { characters, pfps: normalizedPfps, namecards: normalizedNamecards, loc: locs || {} };
    }).catch((error) => {
      console.error('Could not load Enka store', error);
      storePromise = null;
      return emptyStore();
    });
  }
  return storePromise;
}

function localized(hash, store) {
  if (hash === undefined || hash === null) return null;
  const loc = store.loc || {};
  const table = loc[state.lang] || loc.en || loc;
  const key = String(hash);
  const value = table && Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
  return typeof value === 'string' ? value : null;
}
