/* Dane statyczne Enki: postacie, awatary, wizytówki i nazwy.
   Dane pochodzą z aktualnego katalogu store/gi w repozytorium EnkaNetwork/API-docs. */
let storePromise = null;

const STORE_CACHE_NAME = 'genshin-store-v2';
const STORE_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

async function cachedFetch(url) {
  if (typeof caches === 'undefined') return fetch(url);

  const cache = await caches.open(STORE_CACHE_NAME);
  const cached = await cache.match(url);

  if (cached) {
    const fetchedAt = Number(cached.headers.get('x-fetched-at') || 0);
    const fresh = fetchedAt && Date.now() - fetchedAt < STORE_CACHE_MAX_AGE;

    if (fresh) return cached;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const copy = response.clone();
        const headers = new Headers(copy.headers);
        headers.set('x-fetched-at', String(Date.now()));
        await cache.put(url, new Response(copy.body, { status: copy.status, statusText: copy.statusText, headers }));
        return response;
      }
    } catch (error) {
      console.warn('Store refresh failed, using cached data:', url, error);
    }

    return cached;
  }

  const response = await fetch(url);
  if (response.ok) {
    const headers = new Headers(response.headers);
    headers.set('x-fetched-at', String(Date.now()));
    await cache.put(url, new Response(response.clone().body, { status: response.status, statusText: response.statusText, headers }));
  }
  return response;
}

function fetchJson(name) {
  return cachedFetch(STORE_URL + name)
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .catch((error) => {
      console.error('Could not load ' + name, error);
      return null;
    });
}

function normIcon(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/^\/ui\//, '').replace(/\.(png|jpg|jpeg|webp)$/i, '');
}

function normalizeCostume(costume) {
  if (!costume) return costume;
  return {
    ...costume,
    sideIconName: costume.sideIconName || normIcon(costume.SideIcon),
    icon: costume.icon || normIcon(costume.Icon),
    art: costume.art || normIcon(costume.Art)
  };
}

function normalizeAvatars(data) {
  const characters = {};

  Object.keys(data || {}).forEach((id) => {
    const source = data[id];
    if (!source || String(id).includes('-')) return;

    const character = {
      ...source,
      SideIconName: source.SideIconName || normIcon(source.SideIcon),
      Icon: source.Icon || normIcon(source.Icon),
      Art: source.Art || normIcon(source.Art),
      Consts: source.Consts || [],
      Skills: source.Skills || [],
      Costumes: (source.Costumes || []).map(normalizeCostume)
    };

    /* Aloy jest dostępna tylko na PlayStation, więc nie pokazujemy jej w menu postaci. */
    if (String(id) === '10000062') delete character.NameTextMapHash;

    characters[id] = character;
  });

  return characters;
}

function normalizePfps(data) {
  const result = {};

  Object.keys(data || {}).forEach((id) => {
    const source = data[id];
    if (!source) return;
    result[id] = {
      ...source,
      iconPath: source.iconPath || normIcon(source.IconPath)
    };
  });

  return result;
}

function normalizeNamecards(data) {
  const result = {};

  Object.keys(data || {}).forEach((id) => {
    const source = data[id];
    if (!source) return;
    result[id] = {
      ...source,
      icon: source.icon || normIcon(source.Icon)
    };
  });

  return result;
}

function loadStore() {
  if (!storePromise) {
    storePromise = Promise.all([
      fetchJson('avatars.json'),
      fetchJson('pfps.json'),
      fetchJson('namecards.json'),
      fetchJson('locs.json')
    ]).then(([avatars, pfps, namecards, locs]) => {
      const characters = normalizeAvatars(avatars);
      const normalizedPfps = normalizePfps(pfps);
      const normalizedNamecards = normalizeNamecards(namecards);

      if (!Object.keys(characters).length || !Object.keys(normalizedPfps).length || !Object.keys(normalizedNamecards).length) {
        storePromise = null;
      }

      return {
        characters,
        pfps: normalizedPfps,
        namecards: normalizedNamecards,
        loc: locs || {}
      };
    });
  }

  return storePromise;
}

function localized(hash, store) {
  if (hash === undefined || hash === null) return null;
  const loc = store.loc || {};
  const table = loc[state.lang] || loc.en || loc;
  const value = table ? table[String(hash)] : null;
  return typeof value === 'string' ? value : null;
}
