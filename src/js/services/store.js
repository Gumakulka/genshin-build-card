/* Dane statyczne Enki (postacie, avatary, wizytówki, nazwy) z pamięcią podręczną przeglądarki. */
let storePromise = null;

async function cachedFetch(url) {
  try {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open('genshin-store-v1');
      const hit = await cache.match(url);
      if (hit) return hit;
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response.clone());
      return response;
    }
  } catch (error) {
    console.error(error);
  }
  return fetch(url);
}

function fetchJson(name) {
  return cachedFetch(STORE_URL + name)
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .catch((error) => {
      console.error('Could not load ' + name, error);
      return {};
    });
}

function loadStore() {
  if (!storePromise) {
    storePromise = Promise.all([
      fetchJson('characters.json'),
      fetchJson('pfps.json'),
      fetchJson('namecards.json'),
      fetchJson('loc.json')
    ]).then(([characters, pfps, namecards, loc]) => {
      if (!Object.keys(characters).length || !Object.keys(pfps).length || !Object.keys(namecards).length) {
        storePromise = null;
      }
      return { characters, pfps, namecards, loc };
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
