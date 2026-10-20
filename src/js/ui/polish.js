/* Poprawki po wydaniu karty postaci: Księga postaci bez głosu, szkielet ładowania i limit pamięci przeglądarki.
   Ładowany po showcase.js. */
const CACHE_KEEP = 10;
const CACHE_MIN_KEEP = 3;
const CACHE_INDEX = 'cache-index';

codexInfo = function (data) {
  const row = el('div', 'chips codex-info');
  const place = data.native || data.region;
  const birthday = codexBirthday(data.birthday);

  if (place) row.append(codexChip('map-pin', codexText('Region', 'Region'), place));
  if (birthday) row.append(codexChip('cake', codexText('Urodziny', 'Birthday'), birthday));
  if (data.food && data.food.name) {
    const food = codexChip('utensils', codexText('Potrawa', 'Special dish'), data.food.name);
    food.prepend(codexIcon(data.food.icon, data.food.name, 'codex-food-icon'));
    row.append(food);
  }
  return row;
};

/* Szkielet ładowania: przy wyszukiwaniu gracza pokazuje zarys profilu i karty, przy krótkich ładowaniach tylko wskaźnik. */
loadingNode = function (text) {
  const box = el('div', 'loading loading-skeleton');
  box.setAttribute('role', 'status');

  const line = el('div', 'loading-line');
  const spinner = el('span', 'spinner');
  spinner.setAttribute('aria-hidden', 'true');
  line.append(spinner, document.createTextNode(text));
  box.append(line);

  if (text === t('loading')) {
    const skeleton = el('div', 'skeleton');
    skeleton.setAttribute('aria-hidden', 'true');
    ['sk-profile', 'sk-row', 'sk-card'].forEach((name) => skeleton.append(el('div', 'sk ' + name)));
    box.append(skeleton);
  }
  return box;
};

/* Pamięć przeglądarki: trzymamy tylko ostatnich graczy, resztę usuwamy, żeby nie zapełnić limitu. */
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

function cacheRetry(key, write) {
  if (loadSetting(key, null)) return;
  const list = sanitizeList(loadJsonSetting(CACHE_INDEX, []), []);
  cacheDrop(list.splice(CACHE_MIN_KEEP));
  saveJsonSetting(CACHE_INDEX, list);
  write();
}

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

const cacheBaseSet = setCache;
setCache = function (uid, data) {
  cacheTouch(uid);
  cacheBaseSet(uid, data);
  cacheRetry('player-' + uid, () => cacheBaseSet(uid, data));
};

const cacheBaseOffline = saveOffline;
saveOffline = function (uid, data) {
  cacheTouch(uid);
  cacheBaseOffline(uid, data);
  cacheRetry('offline-' + uid, () => cacheBaseOffline(uid, data));
};

if (typeof MENU_STORAGE_KEYS !== 'undefined') MENU_STORAGE_KEYS.push(CACHE_INDEX);
cacheMigrate();

if (state.last && state.detailBox) renderDetail();
