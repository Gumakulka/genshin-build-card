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
  if (typeof value !== 'string') return '';
  return value.replace(/^\/ui\//i, '').replace(/\.(png|jpe?g|webp)$/i, '');
}

function normalizeCostume(costume) {
  if (!costume) return null;

  return {
    ...costume,
    sideIconName: normIcon(costume.sideIconName || costume.SideIcon),
    icon: normIcon(costume.icon || costume.Icon),
    art: normIcon(costume.art || costume.Art)
  };
}

function normalizeCostumes(value) {
  if (Array.isArray(value)) return value.map(normalizeCostume).filter(Boolean);

  if (value && typeof value === 'object') {
    return Object.entries(value).map(([id, costume]) => normalizeCostume({ ...costume, id })).filter(Boolean);
  }

  return [];
}

function normalizeAvatars(data) {
  const characters = {};

  Object.keys(data || {}).forEach((id) => {
    const source = data[id];
    if (!source || String(id).includes('-')) return;

    const character = {
      ...source,
      SideIconName: normIcon(source.SideIconName || source.SideIcon),
      Icon: normIcon(source.Icon || source.icon),
      Art: normIcon(source.Art || source.art),
      Consts: source.Consts || [],
      Skills: source.Skills || [],
      Costumes: normalizeCostumes(source.Costumes)
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
      iconPath: normIcon(source.iconPath || source.IconPath)
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
      icon: normIcon(source.icon || source.Icon)
    };
  });

  return result;
}

function emptyStore() {
  return {
    characters: {},
    pfps: {},
    namecards: {},
    loc: {}
  };
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
  const value = table ? table[String(hash)] : null;

  return typeof value === 'string' ? value : null;
}
