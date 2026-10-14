const WORKER_URL = 'https://genshin-proxy.klaun970.workers.dev/uid/';
const STORE_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/b8ac71c2fba62519c905551d741474e8cd6a267b/store/';
const IMG_URL = 'https://enka.network/ui/';

const form = document.getElementById('uid-form');
const input = document.getElementById('uid-input');
const result = document.getElementById('result');
const hero = document.getElementById('hero');
const heroIcons = document.getElementById('hero-icons');
const recentBox = document.getElementById('recent');
const favoritesBox = document.getElementById('favorites');
const langButton = document.getElementById('lang-toggle');
const themeButton = document.getElementById('theme-toggle');

const TEXT = {
  pl: {
    title: 'Genshin Build Card',
    subtitle: 'Wpisz UID gracza, aby zobaczyć jego profil i postacie.',
    placeholder: 'UID (9 cyfr)',
    uidTitle: 'UID składa się z 9 cyfr',
    search: 'Szukaj',
    loading: 'Ładowanie...',
    uidLength: 'UID musi mieć dokładnie 9 cyfr.',
    network: 'Nie udało się połączyć z serwerem (Failed to fetch). Sprawdź konsolę (F12).',
    retry: 'Spróbuj ponownie',
    unknownCharacter: 'Nieznana postać',
    avatarAlt: 'Awatar gracza',
    adventureRank: 'Poziom przygód',
    worldLevel: 'Poziom świata',
    achievements: 'Osiągnięcia',
    abyss: 'Otchłań',
    stygian: 'Stygian',
    maxFriendship: 'Maks. przyjaźń',
    region: 'Region',
    namecards: 'Wizytówki',
    characters: 'Postacie z gabloty',
    recent: 'Ostatnio:',
    favorites: 'Ulubieni:',
    addFavorite: '⭐ Dodaj do ulubionych',
    removeFavorite: '★ Usuń z ulubionych',
    filterPlaceholder: 'Szukaj postaci...',
    weakest: '⚠️ Najsłabszy artefakt',
    stars: 'Gwiazdki Otchłani',
    sinceVisit: 'Od ostatniej wizyty',
    lastVisit: 'Ostatnia wizyta',
    noChanges: 'Bez zmian w statystykach konta.',
    firstVisit: 'To pierwsza wizyta – zapisano stan konta, następnym razem zobaczysz zmiany.',
    offlineBanner: 'Tryb offline – dane zapisane ',
    commonCharacters: 'Wspólne postacie',
    copyLink: '🔗 Kopiuj link',
    linkCopied: '✅ Skopiowano!',
    exportPng: '🖼️ Pobierz kartę PNG',
    exportFail: 'Nie udało się utworzyć obrazka.',
    disclaimer: 'Projekt fanowski, niezwiązany z HoYoverse. Grafiki należą do ich właścicieli.',
    author: 'Autor: Gumakulka',
    traveler: ['Podróżnik', 'Podróżniczka'],
    stats: 'Statystyki',
    targets: 'Cele statystyk',
    talents: 'Talenty',
    talentsValue: 'Atak / Umiejętność / Wybuch',
    weapon: 'Broń',
    artifacts: 'Artefakty',
    sets: 'Zestawy',
    cv: 'Suma CV z substatów',
    rv: 'Suma RV',
    rvTitle: 'Liczone substaty (RV)',
    rvHint: 'RV = jakość rzutów wybranych substatów dla artefaktów 5★ (100% = jeden maksymalny rzut).',
    constellations: 'Konstelacje',
    friendship: 'Poziom przyjaźni',
    level: 'Poziom',
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    em: 'Biegłość żywiołów',
    critRate: 'Szansa kryt.',
    critDmg: 'Obrażenia kryt.',
    er: 'Regen. energii',
    healing: 'Bonus leczenia',
    slots: ['Kwiat', 'Pióro', 'Piaski', 'Puchar', 'Diadem'],
    compareTitle: 'Porównaj z innym graczem',
    comparePlaceholder: 'UID drugiego gracza',
    compareButton: 'Porównaj',
    compareStat: 'Statystyka',
    noDetails: 'Szczegóły postaci są niedostępne. Gablota gracza może być ukryta albo serwer nie zwrócił pełnych danych.',
    noCharacterDetails: 'Brak szczegółów dla tej postaci w danych z serwera.',
    pickHint: 'Kliknij postać, aby zobaczyć broń, artefakty i statystyki.',
    errors: {
      400: 'Nieprawidłowy format UID.',
      403: 'Serwer odrzucił zapytanie z tej strony.',
      404: 'Taki gracz nie istnieje.',
      424: 'Gra jest w trakcie konserwacji. Spróbuj później.',
      429: 'Za dużo zapytań. Odczekaj chwilę.',
      500: 'Błąd serwera Enka.Network.',
      503: 'Serwer Enka.Network jest niedostępny.'
    },
    generic: 'Błąd: '
  },
  en: {
    title: 'Genshin Build Card',
    subtitle: 'Enter a player UID to see their profile and characters.',
    placeholder: 'UID (9 digits)',
    uidTitle: 'A UID has 9 digits',
    search: 'Search',
    loading: 'Loading...',
    uidLength: 'The UID must have exactly 9 digits.',
    network: 'Could not reach the server (Failed to fetch). Check the console (F12).',
    retry: 'Try again',
    unknownCharacter: 'Unknown character',
    avatarAlt: 'Player avatar',
    adventureRank: 'Adventure Rank',
    worldLevel: 'World Level',
    achievements: 'Achievements',
    abyss: 'Abyss',
    stygian: 'Stygian',
    maxFriendship: 'Max friendship',
    region: 'Region',
    namecards: 'Namecards',
    characters: 'Showcase characters',
    recent: 'Recent:',
    favorites: 'Favorites:',
    addFavorite: '⭐ Add to favorites',
    removeFavorite: '★ Remove from favorites',
    filterPlaceholder: 'Search characters...',
    weakest: '⚠️ Weakest artifact',
    stars: 'Abyss stars',
    sinceVisit: 'Since your last visit',
    lastVisit: 'Last visit',
    noChanges: 'No changes in account stats.',
    firstVisit: 'First visit – account state saved, changes will show next time.',
    offlineBanner: 'Offline mode – data saved ',
    commonCharacters: 'Shared characters',
    copyLink: '🔗 Copy link',
    linkCopied: '✅ Copied!',
    exportPng: '🖼️ Download PNG card',
    exportFail: 'Could not create the image.',
    disclaimer: 'Fan project, not affiliated with HoYoverse. Artwork belongs to its owners.',
    author: 'Author: Gumakulka',
    traveler: ['Traveler', 'Traveler'],
    stats: 'Stats',
    targets: 'Stat targets',
    talents: 'Talents',
    talentsValue: 'Attack / Skill / Burst',
    weapon: 'Weapon',
    artifacts: 'Artifacts',
    sets: 'Sets',
    cv: 'Total substat CV',
    rv: 'Total RV',
    rvTitle: 'Counted substats (RV)',
    rvHint: 'RV = roll quality of the selected substats on 5★ artifacts (100% = one maximum roll).',
    constellations: 'Constellations',
    friendship: 'Friendship level',
    level: 'Level',
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    em: 'Elemental Mastery',
    critRate: 'CRIT Rate',
    critDmg: 'CRIT DMG',
    er: 'Energy Recharge',
    healing: 'Healing Bonus',
    slots: ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'],
    compareTitle: 'Compare with another player',
    comparePlaceholder: 'Second player UID',
    compareButton: 'Compare',
    compareStat: 'Stat',
    noDetails: 'Character details are unavailable. The player showcase may be hidden or the server did not return full data.',
    noCharacterDetails: 'No details for this character in the server data.',
    pickHint: 'Click a character to see weapon, artifacts and stats.',
    errors: {
      400: 'Invalid UID format.',
      403: 'The server rejected the request from this page.',
      404: 'This player does not exist.',
      424: 'The game is under maintenance. Try again later.',
      429: 'Too many requests. Please wait a moment.',
      500: 'Enka.Network server error.',
      503: 'Enka.Network server is unavailable.'
    },
    generic: 'Error: '
  }
};

const PROP_NAMES = {
  en: {
    FIGHT_PROP_HP: 'HP',
    FIGHT_PROP_ATTACK: 'ATK',
    FIGHT_PROP_DEFENSE: 'DEF',
    FIGHT_PROP_HP_PERCENT: 'HP%',
    FIGHT_PROP_ATTACK_PERCENT: 'ATK%',
    FIGHT_PROP_DEFENSE_PERCENT: 'DEF%',
    FIGHT_PROP_CRITICAL: 'CRIT Rate',
    FIGHT_PROP_CRITICAL_HURT: 'CRIT DMG',
    FIGHT_PROP_CHARGE_EFFICIENCY: 'Energy Recharge',
    FIGHT_PROP_HEAL_ADD: 'Healing Bonus',
    FIGHT_PROP_ELEMENT_MASTERY: 'Elemental Mastery',
    FIGHT_PROP_PHYSICAL_ADD_HURT: 'Physical DMG Bonus',
    FIGHT_PROP_FIRE_ADD_HURT: 'Pyro DMG Bonus',
    FIGHT_PROP_ELEC_ADD_HURT: 'Electro DMG Bonus',
    FIGHT_PROP_WATER_ADD_HURT: 'Hydro DMG Bonus',
    FIGHT_PROP_WIND_ADD_HURT: 'Anemo DMG Bonus',
    FIGHT_PROP_ICE_ADD_HURT: 'Cryo DMG Bonus',
    FIGHT_PROP_ROCK_ADD_HURT: 'Geo DMG Bonus',
    FIGHT_PROP_GRASS_ADD_HURT: 'Dendro DMG Bonus',
    FIGHT_PROP_BASE_ATTACK: 'Base ATK'
  },
  pl: {
    FIGHT_PROP_HP: 'HP',
    FIGHT_PROP_ATTACK: 'ATK',
    FIGHT_PROP_DEFENSE: 'DEF',
    FIGHT_PROP_HP_PERCENT: 'HP%',
    FIGHT_PROP_ATTACK_PERCENT: 'ATK%',
    FIGHT_PROP_DEFENSE_PERCENT: 'DEF%',
    FIGHT_PROP_CRITICAL: 'Szansa kryt.',
    FIGHT_PROP_CRITICAL_HURT: 'Obrażenia kryt.',
    FIGHT_PROP_CHARGE_EFFICIENCY: 'Regen. energii',
    FIGHT_PROP_HEAL_ADD: 'Bonus leczenia',
    FIGHT_PROP_ELEMENT_MASTERY: 'Biegłość żywiołów',
    FIGHT_PROP_PHYSICAL_ADD_HURT: 'Bonus obr. fizycznych',
    FIGHT_PROP_FIRE_ADD_HURT: 'Bonus obr. Pyro',
    FIGHT_PROP_ELEC_ADD_HURT: 'Bonus obr. Electro',
    FIGHT_PROP_WATER_ADD_HURT: 'Bonus obr. Hydro',
    FIGHT_PROP_WIND_ADD_HURT: 'Bonus obr. Anemo',
    FIGHT_PROP_ICE_ADD_HURT: 'Bonus obr. Cryo',
    FIGHT_PROP_ROCK_ADD_HURT: 'Bonus obr. Geo',
    FIGHT_PROP_GRASS_ADD_HURT: 'Bonus obr. Dendro',
    FIGHT_PROP_BASE_ATTACK: 'Bazowy ATK'
  }
};

const DMG_PROPS = {
  30: 'FIGHT_PROP_PHYSICAL_ADD_HURT',
  40: 'FIGHT_PROP_FIRE_ADD_HURT',
  41: 'FIGHT_PROP_ELEC_ADD_HURT',
  42: 'FIGHT_PROP_WATER_ADD_HURT',
  43: 'FIGHT_PROP_GRASS_ADD_HURT',
  44: 'FIGHT_PROP_WIND_ADD_HURT',
  45: 'FIGHT_PROP_ROCK_ADD_HURT',
  46: 'FIGHT_PROP_ICE_ADD_HURT'
};

const MAX_ROLLS = {
  FIGHT_PROP_CRITICAL: 3.9,
  FIGHT_PROP_CRITICAL_HURT: 7.8,
  FIGHT_PROP_ATTACK_PERCENT: 5.8,
  FIGHT_PROP_HP_PERCENT: 5.8,
  FIGHT_PROP_DEFENSE_PERCENT: 7.3,
  FIGHT_PROP_CHARGE_EFFICIENCY: 6.5,
  FIGHT_PROP_ELEMENT_MASTERY: 23,
  FIGHT_PROP_ATTACK: 19,
  FIGHT_PROP_HP: 299,
  FIGHT_PROP_DEFENSE: 23
};

const DEFAULT_RV = ['FIGHT_PROP_CRITICAL', 'FIGHT_PROP_CRITICAL_HURT', 'FIGHT_PROP_ATTACK_PERCENT'];
const DEFAULT_TARGETS = { critRate: 70, critDmg: 140, er: 100 };
const SLOT_ORDER = ['EQUIP_BRACER', 'EQUIP_NECKLACE', 'EQUIP_SHOES', 'EQUIP_RING', 'EQUIP_DRESS'];
const PERCENT_PATTERN = /PERCENT|CRITICAL|CHARGE_EFFICIENCY|HEAL_ADD|ADD_HURT/;

const NAME_FIX = {
  Qin: 'Jean',
  Shougun: 'Raiden Shogun',
  Tohma: 'Thoma',
  Hutao: 'Hu Tao',
  Heizo: 'Shikanoin Heizou',
  Feiyan: 'Yanfei',
  Ambor: 'Amber',
  Itto: 'Arataki Itto',
  Yae: 'Yae Miko',
  Kazuha: 'Kaedehara Kazuha',
  Sara: 'Kujou Sara',
  Ayaka: 'Kamisato Ayaka',
  Ayato: 'Kamisato Ayato',
  Shinobu: 'Kuki Shinobu',
  Baizhuer: 'Baizhu',
  Liuyun: 'Xianyun',
  Alhatham: 'Alhaitham',
  SkirkNew: 'Skirk'
};

const ELEMENT_EMOJI = {
  Fire: '🔥',
  Water: '💧',
  Grass: '🌿',
  Electric: '⚡',
  Ice: '❄️',
  Wind: '🌪️',
  Rock: '🪨'
};

const HERO_CHARACTERS = [
  { icon: 'UI_AvatarIcon_Furina_Circle', name: 'Furina' },
  { icon: 'UI_AvatarIcon_Zhongli_Circle', name: 'Zhongli' },
  { icon: 'UI_AvatarIcon_Nahida_Circle', name: 'Nahida' },
  { icon: 'UI_AvatarIcon_Shougun_Circle', name: 'Raiden Shogun' },
  { icon: 'UI_AvatarIcon_Venti_Circle', name: 'Venti' },
  { icon: 'UI_AvatarIcon_Hutao_Circle', name: 'Hu Tao' }
];

const HANDLED_KEYS = [
  'nickname', 'signature', 'level', 'worldLevel', 'finishAchievementNum',
  'towerFloorIndex', 'towerLevelIndex', 'towerStarIndex', 'nameCardId', 'namecardId',
  'showAvatarInfoList', 'showNameCardIdList', 'profilePicture', 'isShowAvatarTalent',
  'fetterCount', 'stygianIndex', 'stygianSeconds', 'stygianId'
];

const state = {
  lang: loadSetting('lang', navigator.language && navigator.language.startsWith('pl') ? 'pl' : 'en'),
  theme: loadSetting('theme', window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  targets: Object.assign({}, DEFAULT_TARGETS, loadJsonSetting('targets', {})),
  rvStats: sanitizeList(loadJsonSetting('rvStats', DEFAULT_RV), DEFAULT_RV),
  recent: sanitizeList(loadJsonSetting('recent', []), []),
  favorites: sanitizeList(loadJsonSetting('favorites', []), []),
  diff: null,
  offline: null,
  last: null,
  selectedId: null,
  detailBox: null,
  compareBox: null
};

let storePromise = null;

function sanitizeList(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function loadSetting(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function loadJsonSetting(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(error);
  }
}

function saveJsonSetting(key, value) {
  saveSetting(key, JSON.stringify(value));
}

function t(key) {
  return TEXT[state.lang][key];
}

function propName(prop) {
  return PROP_NAMES[state.lang][prop] || prop;
}

function applyTexts() {
  document.documentElement.lang = state.lang;
  document.documentElement.dataset.theme = state.theme;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });
  langButton.textContent = state.lang === 'pl' ? 'EN' : 'PL';
  themeButton.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  renderRecent();
  renderFavorites();
}

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
    .then((r) => r.json())
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

function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function createImage(iconName, alt, className) {
  if (!iconName || !/^[A-Za-z0-9_]+$/.test(iconName)) return document.createTextNode('');
  const img = document.createElement('img');
  img.src = IMG_URL + iconName + '.png';
  img.alt = alt;
  img.loading = 'lazy';
  if (className) img.className = className;
  img.addEventListener('error', () => img.classList.add('missing'));
  return img;
}

function getCharacterIcon(character, costumeId) {
  if (!character || !character.SideIconName) return null;
  const costume = character.Costumes && character.Costumes[costumeId];
  if (costume && costume.icon) return costume.icon;
  return character.SideIconName.replace('_Side', '');
}

function getCharacterName(character, store) {
  if (!character || !character.SideIconName) return t('unknownCharacter');
  const raw = character.SideIconName.replace('UI_AvatarIcon_Side_', '');
  if (raw === 'PlayerBoy') return t('traveler')[0];
  if (raw === 'PlayerGirl') return t('traveler')[1];
  return localized(character.NameTextMapHash, store) || NAME_FIX[raw] || raw;
}

function getRarityClass(character) {
  const quality = character && character.QualityType ? character.QualityType : '';
  if (quality.startsWith('QUALITY_ORANGE')) return 'rarity-5';
  if (quality.startsWith('QUALITY_PURPLE')) return 'rarity-4';
  return '';
}

function getProfileIcon(info, store) {
  const picture = info.profilePicture || {};
  if (picture.id && store.pfps[picture.id] && store.pfps[picture.id].iconPath) {
    return store.pfps[picture.id].iconPath;
  }
  if (picture.avatarId) {
    return getCharacterIcon(store.characters[picture.avatarId], picture.costumeId);
  }
  return null;
}

function getNamecardIcon(id, store) {
  const card = store.namecards[id];
  return card && card.icon ? card.icon : null;
}

function formatStat(prop, value) {
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return PERCENT_PATTERN.test(prop) ? number.toFixed(1) + '%' : String(Math.round(number));
}

function statRow(name, value) {
  const row = el('div', 'stat-row');
  row.append(el('span', 'stat-name', name), el('span', 'stat-value', value));
  return row;
}

function progressRow(name, value, target) {
  const row = el('div', 'stat-bar');
  const top = el('div', 'stat-row');
  top.append(el('span', 'stat-name', name), el('span', 'stat-value', value.toFixed(1) + '% / ' + target + '%'));
  const bar = document.createElement('progress');
  bar.max = 100;
  bar.value = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  row.append(top, bar);
  return row;
}

function chip(icon, label, value) {
  const wrapper = el('span', 'chip');
  wrapper.append(el('span', '', icon), el('span', 'chip-label', label), el('span', 'chip-value', value));
  return wrapper;
}

function rememberPlayer(uid, nickname) {
  const before = state.recent.map((item) => item.uid);
  state.recent = [{ uid, nickname }].concat(state.recent.filter((item) => item.uid !== uid)).slice(0, 5);
  state.favorites.forEach((item) => {
    if (item.uid === uid) item.nickname = nickname;
  });
  saveJsonSetting('recent', state.recent);
  saveJsonSetting('favorites', state.favorites);
  before.forEach((oldUid) => {
    const keep = state.recent.some((item) => item.uid === oldUid) || isFavorite(oldUid);
    if (!keep) removeKey('offline-' + oldUid);
  });
  renderRecent();
  renderFavorites();
}

function renderRecent() {
  recentBox.textContent = '';
  const items = state.recent.filter((item) => item && /^\d{9}$/.test(String(item.uid)));
  if (!items.length) return;
  recentBox.append(el('span', 'recent-label', t('recent')));
  items.forEach((item) => {
    const button = el('button', 'chip recent-chip', (item.nickname || '?') + ' · ' + item.uid);
    button.type = 'button';
    button.addEventListener('click', () => {
      input.value = item.uid;
      search(item.uid);
    });
    recentBox.append(button);
  });
}

function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(state.lang === 'pl' ? 'pl-PL' : 'en-GB');
}

function isFavorite(uid) {
  return state.favorites.some((item) => item.uid === uid);
}

function toggleFavorite(data) {
  const uid = data.uid;
  if (isFavorite(uid)) {
    state.favorites = state.favorites.filter((item) => item.uid !== uid);
  } else {
    state.favorites = state.favorites.concat({ uid, nickname: data.playerInfo.nickname }).slice(-12);
  }
  saveJsonSetting('favorites', state.favorites);
  renderFavorites();
}

function renderFavorites() {
  favoritesBox.textContent = '';
  const items = state.favorites.filter((item) => item && /^\d{9}$/.test(String(item.uid)));
  if (!items.length) return;
  favoritesBox.append(el('span', 'recent-label', t('favorites')));
  items.forEach((item) => {
    const button = el('button', 'chip recent-chip', '⭐ ' + (item.nickname || '?') + ' · ' + item.uid);
    button.type = 'button';
    button.addEventListener('click', () => {
      input.value = item.uid;
      search(item.uid);
    });
    favoritesBox.append(button);
  });
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

function buildHistory() {
  const diff = state.diff;
  if (!diff) return null;
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('sinceVisit')));
  if (!diff.previous) {
    wrapper.append(el('p', 'hint', t('firstVisit')));
    return wrapper;
  }
  wrapper.append(el('p', 'hint', t('lastVisit') + ': ' + formatDate(diff.previous.t)));
  if (!diff.changes.length) {
    wrapper.append(el('p', 'hint', t('noChanges')));
    return wrapper;
  }
  const chips = el('div', 'chips');
  diff.changes.forEach((change) => {
    chips.append(chip('📈', t(change.label), change.from + ' → ' + change.to));
  });
  wrapper.append(chips);
  return wrapper;
}

function selectCharacter(id) {
  state.selectedId = id;
  result.querySelectorAll('.character').forEach((node) => {
    node.classList.toggle('selected', node.dataset.avatarId === String(id));
  });
  renderDetail();
}

function updateUrl(uid) {
  try {
    history.replaceState(null, '', '?uid=' + uid);
  } catch (error) {
    console.error(error);
  }
}

async function copyLink(uid, button) {
  const url = location.origin + location.pathname + '?uid=' + uid;
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = t('linkCopied');
  } catch (error) {
    button.textContent = url;
  }
  setTimeout(() => {
    button.textContent = t('copyLink');
  }, 2500);
}

function buildProfile(data, store) {
  const info = data.playerInfo;
  const profile = el('section', 'profile');

  const bannerId = info.nameCardId || info.namecardId;
  const bannerIcon = bannerId ? getNamecardIcon(bannerId, store) : null;
  if (bannerIcon) profile.append(createImage(bannerIcon, '', 'banner'));

  const body = el('div', 'profile-body');
  const avatarIcon = getProfileIcon(info, store);
  if (avatarIcon) body.append(createImage(avatarIcon, t('avatarAlt'), 'avatar'));

  const details = el('div');
  details.append(el('h2', '', info.nickname));
  if (info.signature) details.append(el('p', 'signature', info.signature));
  body.append(details);
  profile.append(body);
  return profile;
}

function buildChips(data) {
  const info = data.playerInfo;
  const chips = el('section', 'chips');
  chips.append(chip('🆔', 'UID', data.uid));
  if (data.region) chips.append(chip('🌐', t('region'), data.region));
  chips.append(chip('🎖️', t('adventureRank'), info.level));
  chips.append(chip('🌍', t('worldLevel'), info.worldLevel));
  chips.append(chip('🏆', t('achievements'), info.finishAchievementNum));
  if (info.towerFloorIndex) {
    let abyss = info.towerFloorIndex + '-' + info.towerLevelIndex;
    if (info.towerStarIndex) abyss += ' · ⭐ ' + info.towerStarIndex;
    chips.append(chip('🌀', t('abyss'), abyss));
  }
  if (info.stygianIndex) {
    let stygian = String(info.stygianIndex);
    if (info.stygianSeconds) stygian += ' · ' + info.stygianSeconds + ' s';
    chips.append(chip('⚔️', t('stygian'), stygian));
  }
  if (info.fetterCount) chips.append(chip('🤝', t('maxFriendship'), info.fetterCount));

  Object.keys(info).forEach((key) => {
    if (HANDLED_KEYS.includes(key) || typeof info[key] === 'object') return;
    chips.append(chip('🔹', key, info[key]));
  });
  return chips;
}

function buildActions(data) {
  const actions = el('div', 'actions');
  const copy = el('button', 'action-button', t('copyLink'));
  copy.type = 'button';
  copy.addEventListener('click', () => copyLink(data.uid, copy));
  const favorite = el('button', 'action-button', isFavorite(data.uid) ? t('removeFavorite') : t('addFavorite'));
  favorite.type = 'button';
  favorite.addEventListener('click', () => {
    toggleFavorite(data);
    favorite.textContent = isFavorite(data.uid) ? t('removeFavorite') : t('addFavorite');
  });
  actions.append(copy, favorite);
  return actions;
}

function buildNamecards(info, store) {
  const ids = info.showNameCardIdList || [];
  if (!ids.length) return null;
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('namecards')));
  const list = el('div', 'namecards');
  ids.forEach((id) => {
    const icon = getNamecardIcon(id, store);
    if (icon) list.append(createImage(icon, 'Namecard ' + id, 'namecard'));
  });
  wrapper.append(list);
  return wrapper;
}

function findDetails(data, avatarId) {
  const list = data.avatarInfoList || [];
  return list.find((item) => String(item.avatarId) === String(avatarId)) || null;
}

function buildCharacters(data, store) {
  const info = data.playerInfo;
  const avatars = info.showAvatarInfoList || [];
  if (!avatars.length) return null;
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('characters')));
  const list = el('div', 'characters');

  if (avatars.length > 4) {
    const filter = document.createElement('input');
    filter.type = 'search';
    filter.className = 'character-filter';
    filter.placeholder = t('filterPlaceholder');
    filter.addEventListener('input', () => {
      const query = filter.value.trim().toLowerCase();
      list.querySelectorAll('.character').forEach((node) => {
        node.hidden = query !== '' && !node.dataset.search.includes(query);
      });
    });
    wrapper.append(filter);
  }

  avatars.forEach((avatar) => {
    const character = store.characters[avatar.avatarId];
    const card = el('button', 'character ' + getRarityClass(character));
    card.type = 'button';
    card.dataset.avatarId = String(avatar.avatarId);
    if (String(avatar.avatarId) === String(state.selectedId)) card.classList.add('selected');

    const name = getCharacterName(character, store);
    card.dataset.search = (name + ' ' + (character && character.Element ? character.Element : '')).toLowerCase();
    card.append(createImage(getCharacterIcon(character, avatar.costumeId), name));
    card.append(el('div', 'name', name));
    const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
    let meta = emoji + 'Lv. ' + avatar.level;
    if (info.isShowAvatarTalent) meta += ' · C' + (avatar.talentLevel || 0);
    card.append(el('div', 'meta', meta));

    card.addEventListener('click', () => selectCharacter(avatar.avatarId));
    list.append(card);
  });

  wrapper.append(list);
  return wrapper;
}

function getStatLines(details) {
  const props = details.fightPropMap || {};
  const lines = [
    { name: t('hp'), text: String(Math.round(props[2000] || 0)) },
    { name: t('atk'), text: String(Math.round(props[2001] || 0)) },
    { name: t('def'), text: String(Math.round(props[2002] || 0)) },
    { name: t('em'), text: String(Math.round(props[28] || 0)) },
    { key: 'critRate', name: t('critRate'), number: (props[20] || 0) * 100 },
    { key: 'critDmg', name: t('critDmg'), number: (props[22] || 0) * 100 },
    { key: 'er', name: t('er'), number: (props[23] || 0) * 100 }
  ];
  if (props[26]) lines.push({ name: t('healing'), number: props[26] * 100 });

  let bestKey = null;
  Object.keys(DMG_PROPS).forEach((key) => {
    if ((props[key] || 0) > 0 && (bestKey === null || props[key] > props[bestKey])) bestKey = key;
  });
  if (bestKey !== null) lines.push({ name: propName(DMG_PROPS[bestKey]), number: props[bestKey] * 100 });

  lines.forEach((line) => {
    if (line.text === undefined) line.text = line.number.toFixed(1) + '%';
  });
  return lines;
}

function buildStatsPanel(details) {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('stats')));
  getStatLines(details).forEach((line) => {
    if (line.key && state.targets[line.key] !== undefined) {
      panel.append(progressRow(line.name, line.number, state.targets[line.key]));
    } else {
      panel.append(statRow(line.name, line.text));
    }
  });
  return panel;
}

function buildTargetsPanel() {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('targets')));
  [['critRate', 'critRate'], ['critDmg', 'critDmg'], ['er', 'er']].forEach(([key, label]) => {
    const row = el('label', 'target-row');
    row.append(el('span', 'stat-name', t(label) + ' (%)'));
    const field = document.createElement('input');
    field.type = 'number';
    field.min = '0';
    field.max = '999';
    field.className = 'target-input';
    field.value = String(state.targets[key]);
    field.addEventListener('change', () => {
      const value = Math.min(999, Math.max(0, Number(field.value) || 0));
      state.targets[key] = value;
      saveJsonSetting('targets', state.targets);
      renderDetail();
    });
    row.append(field);
    panel.append(row);
  });
  return panel;
}

function buildRvPanel() {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('rvTitle')));
  const list = el('div', 'rv-toggles');
  Object.keys(MAX_ROLLS).forEach((prop) => {
    const button = el('button', 'rv-toggle', propName(prop));
    button.type = 'button';
    if (state.rvStats.includes(prop)) button.classList.add('on');
    button.addEventListener('click', () => {
      state.rvStats = state.rvStats.includes(prop)
        ? state.rvStats.filter((item) => item !== prop)
        : state.rvStats.concat(prop);
      saveJsonSetting('rvStats', state.rvStats);
      renderDetail();
    });
    list.append(button);
  });
  panel.append(list, el('div', 'item-meta', t('rvHint')));
  return panel;
}

function buildExtrasPanel(details, character) {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('talents')));
  const order = character && character.SkillOrder ? character.SkillOrder : [];
  const levels = details.skillLevelMap || {};
  const extra = details.proudSkillExtraLevelMap || {};
  const proud = (character && character.ProudMap) || {};
  const values = order.slice(0, 3).map((id) => {
    const base = levels[id];
    if (base === undefined) return '-';
    const bonus = extra[proud[id]] || 0;
    return bonus ? base + ' (+' + bonus + ')' : String(base);
  });
  if (values.length) panel.append(statRow(t('talentsValue'), values.join(' / ')));
  panel.append(statRow(t('constellations'), (details.talentIdList || []).length));
  const friendship = details.fetterInfo && details.fetterInfo.expLevel;
  if (friendship) panel.append(statRow(t('friendship'), friendship));
  return panel;
}

function statLine(stat) {
  if (!stat) return null;
  const prop = stat.appendPropId || stat.appendPropID || stat.mainPropId;
  const value = stat.statValue !== undefined ? stat.statValue : stat.propValue;
  return { prop, value };
}

function findWeapon(items) {
  return items.find((entry) => entry.flat && entry.flat.itemType === 'ITEM_WEAPON') || null;
}

function getArtifacts(items) {
  return items
    .filter((entry) => entry.flat && entry.flat.itemType === 'ITEM_RELIQUARY')
    .sort((a, b) => SLOT_ORDER.indexOf(a.flat.equipType) - SLOT_ORDER.indexOf(b.flat.equipType));
}

function getWeaponTitle(item, store) {
  const flat = item.flat;
  const name = localized(flat.nameTextMapHash !== undefined ? flat.nameTextMapHash : flat.nameTextHashMap, store);
  const weapon = item.weapon || {};
  const affix = weapon.affixMap ? Object.values(weapon.affixMap)[0] : 0;
  return (name || t('weapon')) + ' · ' + t('level') + ' ' + (weapon.level || '?') + ' · R' + ((affix || 0) + 1);
}

function artifactRv(flat) {
  if (flat.rankLevel !== undefined && flat.rankLevel !== 5) return 0;
  let total = 0;
  (flat.reliquarySubstats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (stat && stat.prop && state.rvStats.includes(stat.prop) && MAX_ROLLS[stat.prop]) {
      total += (Number(stat.value) / MAX_ROLLS[stat.prop]) * 100;
    }
  });
  return total;
}

function buildWeaponPanel(items, store) {
  const item = findWeapon(items);
  if (!item) return null;
  const flat = item.flat;
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('weapon')));

  const row = el('div', 'weapon');
  row.append(createImage(flat.icon, 'Weapon'));
  const text = el('div');
  text.append(el('div', 'item-name', getWeaponTitle(item, store)));
  (flat.weaponStats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (stat && stat.prop) text.append(el('div', 'item-meta', propName(stat.prop) + ': ' + formatStat(stat.prop, stat.value)));
  });
  row.append(text);
  panel.append(row);
  panel.append(guideWeapon(item, store));
  return panel;
}

function buildArtifacts(items, store) {
  const artifacts = getArtifacts(items);
  if (!artifacts.length) return null;

  const wrapper = el('div', 'panel');
  wrapper.append(el('h5', '', t('artifacts')));
  const grid = el('div', 'artifacts');

  const sets = {};
  const cards = [];
  let cv = 0;
  let rvTotal = 0;

  artifacts.forEach((item) => {
    const flat = item.flat;
    const card = el('div', 'artifact-card');
    const row = el('div', 'artifact');
    row.append(createImage(flat.icon, 'Artifact'));

    const text = el('div');
    const slotIndex = SLOT_ORDER.indexOf(flat.equipType);
    const slotName = slotIndex >= 0 ? t('slots')[slotIndex] : '';
    const setHash = flat.setNameTextMapHash !== undefined ? flat.setNameTextMapHash : flat.setNameTextHashMap;
    const setName = localized(setHash, store) || slotName;
    if (setHash !== undefined) sets[setName] = (sets[setName] || 0) + 1;

    text.append(el('div', 'item-name', setName));
    const level = item.reliquary && item.reliquary.level ? item.reliquary.level - 1 : 0;
    text.append(el('div', 'item-meta', slotName + ' · +' + level));

    const main = statLine(flat.reliquaryMainstat);
    if (main && main.prop) {
      text.append(el('div', 'item-name', propName(main.prop) + ' ' + formatStat(main.prop, main.value)));
    }
    row.append(text);
    card.append(row);

    const subs = el('ul', 'substats');
    (flat.reliquarySubstats || []).forEach((raw) => {
      const stat = statLine(raw);
      if (!stat || !stat.prop) return;
      subs.append(el('li', '', propName(stat.prop) + ' ' + formatStat(stat.prop, stat.value)));
      if (stat.prop === 'FIGHT_PROP_CRITICAL') cv += 2 * Number(stat.value);
      if (stat.prop === 'FIGHT_PROP_CRITICAL_HURT') cv += Number(stat.value);
    });
    card.append(subs);

    const rv = artifactRv(flat);
    rvTotal += rv;
    card.append(el('div', 'item-meta rv-line', 'RV ' + rv.toFixed(0) + '%'));
    card.append(guideArtifact(item, store));
    cards.push({ card, rv, eligible: flat.rankLevel === undefined || flat.rankLevel === 5 });
    grid.append(card);
  });

  const eligible = cards.filter((entry) => entry.eligible);
  if (state.rvStats.length && eligible.length >= 2) {
    const weakest = eligible.reduce((min, entry) => (entry.rv < min.rv ? entry : min));
    if (eligible.some((entry) => entry.rv > weakest.rv)) {
      weakest.card.classList.add('weakest');
      weakest.card.append(el('div', 'item-meta weakest-label', t('weakest')));
    }
  }

  const setLines = Object.keys(sets).filter((name) => sets[name] >= 2).map((name) => name + ' (' + sets[name] + ')');
  if (setLines.length) wrapper.append(el('div', 'item-meta', t('sets') + ': ' + setLines.join(', ')));
  wrapper.append(el('div', 'item-meta', t('cv') + ': ' + cv.toFixed(1)));
  wrapper.append(el('div', 'item-meta', t('rv') + ': ' + rvTotal.toFixed(0) + '%'));
  wrapper.append(grid);
  return wrapper;
}

function loadCanvasImage(iconName) {
  return new Promise((resolve) => {
    if (!iconName || !/^[A-Za-z0-9_]+$/.test(iconName)) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = IMG_URL + iconName + '.png';
  });
}

function loadLocalImage(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = path;
  });
}

function drawFitted(ctx, text, x, y, maxWidth, size, bold) {
  let current = size;
  ctx.font = (bold ? 'bold ' : '') + current + 'px system-ui, sans-serif';
  while (current > 10 && ctx.measureText(text).width > maxWidth) {
    current -= 1;
    ctx.font = (bold ? 'bold ' : '') + current + 'px system-ui, sans-serif';
  }
  ctx.fillText(text, x, y);
}

async function exportCard() {
  if (!state.last) return;
  const { data, store } = state.last;
  const details = findDetails(data, state.selectedId);
  if (!details) return;

  const character = store.characters[details.avatarId];
  const items = details.equipList || [];
  const weapon = findWeapon(items);
  const artifacts = getArtifacts(items);
  const shown = (data.playerInfo.showAvatarInfoList || []).find((a) => String(a.avatarId) === String(details.avatarId));
  const dark = state.theme === 'dark';
  const colors = dark
    ? { bg: '#0b0b0f', card: '#16161d', fg: '#f2f2f5', muted: '#9a9aa8', accent: '#e8c872' }
    : { bg: '#ffffff', card: '#f4f4f7', fg: '#111114', muted: '#666672', accent: '#d9a93f' };

  const images = await Promise.all([
    loadCanvasImage(getCharacterIcon(character, shown ? shown.costumeId : undefined)),
    loadCanvasImage(weapon ? weapon.flat.icon : null)
  ].concat(artifacts.map((item) => loadCanvasImage(item.flat.icon))));

  const logoImage = await loadLocalImage('build/logo.jpg');

  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colors.card;
  ctx.fillRect(20, 20, 920, 600);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 920, 600);

  const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
  const levelValue = details.propMap && details.propMap['4001'] ? details.propMap['4001'].val : (shown ? shown.level : '?');
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = colors.fg;
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(getCharacterName(character, store), 50, 78);
  ctx.fillStyle = colors.muted;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(emoji + t('level') + ' ' + levelValue + ' · C' + (details.talentIdList || []).length, 50, 106);

  if (images[0]) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(860, 80, 48, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(images[0], 812, 32, 96, 96);
    ctx.restore();
  }

  ctx.font = '18px system-ui, sans-serif';
  let y = 160;
  getStatLines(details).forEach((line) => {
    ctx.fillStyle = colors.muted;
    ctx.fillText(line.name, 50, y);
    ctx.fillStyle = colors.fg;
    ctx.fillText(line.text, 230, y);
    y += 30;
  });

  if (weapon) {
    y += 20;
    if (images[1]) ctx.drawImage(images[1], 50, y - 20, 56, 56);
    ctx.fillStyle = colors.fg;
    drawFitted(ctx, getWeaponTitle(weapon, store), 118, y + 8, 200, 16, true);
  }

  artifacts.forEach((item, index) => {
    const top = 140 + index * 90;
    const flat = item.flat;
    if (images[2 + index]) ctx.drawImage(images[2 + index], 340, top, 64, 64);
    const setHash = flat.setNameTextMapHash !== undefined ? flat.setNameTextMapHash : flat.setNameTextHashMap;
    ctx.fillStyle = colors.fg;
    drawFitted(ctx, localized(setHash, store) || '', 416, top + 16, 480, 16, true);
    const main = statLine(flat.reliquaryMainstat);
    if (main && main.prop) {
      ctx.fillStyle = colors.accent;
      drawFitted(ctx, propName(main.prop) + ' ' + formatStat(main.prop, main.value) + '  ·  RV ' + artifactRv(flat).toFixed(0) + '%', 416, top + 38, 480, 16, false);
    }
    const subs = (flat.reliquarySubstats || []).map((raw) => {
      const stat = statLine(raw);
      return stat && stat.prop ? propName(stat.prop) + ' ' + formatStat(stat.prop, stat.value) : '';
    }).filter(Boolean).join('  |  ');
    ctx.fillStyle = colors.muted;
    drawFitted(ctx, subs, 416, top + 60, 500, 14, false);
  });

  ctx.fillStyle = colors.muted;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Genshin Build Card · UID ' + data.uid + ' · ' + t('author'), 50, 600);
  if (logoImage) ctx.drawImage(logoImage, 885, 572, 44, 44);

  canvas.toBlob((blob) => {
    if (!blob) {
      alert(t('exportFail'));
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'genshin-card-' + data.uid + '-' + details.avatarId + '.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  }, 'image/png');
}

function buildCompareTable(first, second) {
  const rows = [
    [t('adventureRank'), (d) => d.playerInfo.level, true],
    [t('worldLevel'), (d) => d.playerInfo.worldLevel, true],
    [t('achievements'), (d) => d.playerInfo.finishAchievementNum, true],
    [t('abyss'), (d) => (d.playerInfo.towerFloorIndex ? d.playerInfo.towerFloorIndex + '-' + d.playerInfo.towerLevelIndex : '-'), false],
    ['⭐ ' + t('abyss'), (d) => d.playerInfo.towerStarIndex || 0, true],
    [t('characters'), (d) => (d.playerInfo.showAvatarInfoList || []).length, true]
  ];
  const table = el('table', 'compare');
  const head = el('tr');
  head.append(el('th', '', t('compareStat')), el('th', '', first.playerInfo.nickname), el('th', '', second.playerInfo.nickname));
  table.append(head);
  rows.forEach(([label, getter, numeric]) => {
    const a = getter(first);
    const b = getter(second);
    const row = el('tr');
    const cellA = el('td', numeric && a > b ? 'better' : '', a);
    const cellB = el('td', numeric && b > a ? 'better' : '', b);
    row.append(el('td', 'stat-name', label), cellA, cellB);
    table.append(row);
  });
  return table;
}

function characterCv(details) {
  let cv = 0;
  getArtifacts(details.equipList || []).forEach((item) => {
    (item.flat.reliquarySubstats || []).forEach((raw) => {
      const stat = statLine(raw);
      if (!stat) return;
      if (stat.prop === 'FIGHT_PROP_CRITICAL') cv += 2 * Number(stat.value);
      if (stat.prop === 'FIGHT_PROP_CRITICAL_HURT') cv += Number(stat.value);
    });
  });
  return cv;
}

function describeCharacter(data, avatar) {
  const details = findDetails(data, avatar.avatarId);
  let text = 'Lv. ' + avatar.level;
  if (data.playerInfo.isShowAvatarTalent) text += ' · C' + (avatar.talentLevel || 0);
  const cv = details ? characterCv(details) : null;
  if (cv !== null) text += ' · CV ' + cv.toFixed(1);
  return { text, cv };
}

function buildCommonCharacters(first, second, store) {
  const listA = first.playerInfo.showAvatarInfoList || [];
  const listB = second.playerInfo.showAvatarInfoList || [];
  const common = listA.filter((x) => listB.some((y) => String(y.avatarId) === String(x.avatarId)));
  if (!common.length) return null;
  const wrapper = el('div');
  wrapper.append(el('h3', 'section-title', t('commonCharacters')));
  const table = el('table', 'compare');
  const head = el('tr');
  head.append(el('th', '', t('characters')), el('th', '', first.playerInfo.nickname), el('th', '', second.playerInfo.nickname));
  table.append(head);
  common.forEach((x) => {
    const y = listB.find((item) => String(item.avatarId) === String(x.avatarId));
    const a = describeCharacter(first, x);
    const b = describeCharacter(second, y);
    let better = '';
    if (a.cv !== null && b.cv !== null) better = a.cv > b.cv ? 'a' : (b.cv > a.cv ? 'b' : '');
    const row = el('tr');
    row.append(
      el('td', 'stat-name', getCharacterName(store.characters[x.avatarId], store)),
      el('td', better === 'a' ? 'better' : '', a.text),
      el('td', better === 'b' ? 'better' : '', b.text)
    );
    table.append(row);
  });
  wrapper.append(table);
  return wrapper;
}

async function runCompare(uid) {
  const box = state.compareBox;
  if (!box || !state.last) return;
  if (!/^\d{9}$/.test(uid)) {
    box.textContent = t('uidLength');
    return;
  }
  box.textContent = t('loading');
  try {
    const other = await fetchPlayer(uid);
    box.textContent = '';
    box.append(buildCompareTable(state.last.data, other));
    const common = buildCommonCharacters(state.last.data, other, state.last.store);
    if (common) box.append(common);
  } catch (error) {
    console.error(error);
    box.textContent = error.network ? t('network') : error.message;
  }
}

function buildCompareSection() {
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('compareTitle')));
  const row = el('form', 'compare-form');
  const field = document.createElement('input');
  field.type = 'text';
  field.inputMode = 'numeric';
  field.maxLength = 9;
  field.placeholder = t('comparePlaceholder');
  field.addEventListener('input', () => {
    field.value = field.value.replace(/\D/g, '').slice(0, 9);
  });
  const button = el('button', 'action-button', t('compareButton'));
  button.type = 'submit';
  row.addEventListener('submit', (event) => {
    event.preventDefault();
    runCompare(field.value.trim());
  });
  row.append(field, button);
  state.compareBox = el('div', 'compare-box');
  wrapper.append(row, state.compareBox);
  return wrapper;
}

function renderDetail() {
  const box = state.detailBox;
  if (!box || !state.last) return;
  box.textContent = '';
  const { data, store } = state.last;

  if (!data.avatarInfoList || !data.avatarInfoList.length) {
    box.append(el('p', 'hint', t('noDetails')));
    return;
  }
  if (state.selectedId === null || state.selectedId === undefined) {
    box.append(el('p', 'hint', t('pickHint')));
    return;
  }
  const details = findDetails(data, state.selectedId);
  if (!details) {
    box.append(el('p', 'hint', t('noCharacterDetails')));
    return;
  }

  const character = store.characters[details.avatarId];
  const shown = (data.playerInfo.showAvatarInfoList || []).find((a) => String(a.avatarId) === String(details.avatarId));
  const panel = el('div', 'detail');

  const head = el('div', 'detail-head');
  head.append(createImage(getCharacterIcon(character, shown ? shown.costumeId : undefined), ''));
  const title = el('div');
  title.append(el('h4', '', getCharacterName(character, store)));
  const levelValue = details.propMap && details.propMap['4001'] ? details.propMap['4001'].val : (shown ? shown.level : '?');
  const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
  title.append(el('div', 'item-meta', emoji + t('level') + ' ' + levelValue));
  head.append(title);
  const exportButton = el('button', 'action-button push-right', t('exportPng'));
  exportButton.type = 'button';
  exportButton.addEventListener('click', () => exportCard());
  head.append(exportButton);
  panel.append(head);

  const grid = el('div', 'detail-grid');
  const left = el('div', 'column');
  left.append(buildStatsPanel(details), buildExtrasPanel(details, character), buildTargetsPanel());
  const right = el('div', 'column');
  const weapon = buildWeaponPanel(details.equipList || [], store);
  if (weapon) right.append(weapon);
  right.append(buildRvPanel());
  grid.append(left, right);
  panel.append(grid);
  panel.append(guideCharacter(details, character, shown, store));

  const artifacts = buildArtifacts(details.equipList || [], store);
  if (artifacts) {
    panel.append(el('div', 'hint'), artifacts);
  }
  box.append(panel);
}

function render() {
  if (!state.last) return;
  const { data, store } = state.last;
  result.textContent = '';
  if (state.offline) result.append(el('p', 'hint offline-banner', t('offlineBanner') + formatDate(state.offline)));
  result.append(buildProfile(data, store), buildChips(data), buildActions(data));
  const history = buildHistory();
  if (history) result.append(history);

  const namecards = buildNamecards(data.playerInfo, store);
  if (namecards) result.append(namecards);

  const characters = buildCharacters(data, store);
  if (characters) result.append(characters);

  state.detailBox = el('div');
  result.append(state.detailBox);
  renderDetail();
  result.append(buildCompareSection());
}

function renderHero() {
  HERO_CHARACTERS.forEach((character) => {
    heroIcons.append(createImage(character.icon, character.name, 'hero-icon'));
  });
}

async function showPlayer(data) {
  const store = await loadStore();
  state.last = { data, store };
  const shown = data.playerInfo.showAvatarInfoList || [];
  const first = shown.find((a) => findDetails(data, a.avatarId));
  state.selectedId = first ? first.avatarId : null;
  hero.hidden = true;
  render();
}

function showError(error, uid) {
  result.textContent = '';
  result.append(el('p', 'hint', error.network ? t('network') : error.message));
  const retry = el('button', 'action-button', t('retry'));
  retry.type = 'button';
  retry.addEventListener('click', () => search(uid));
  result.append(retry);
}

async function search(uid) {
  if (!/^\d{9}$/.test(uid)) {
    result.textContent = t('uidLength');
    return;
  }
  result.textContent = t('loading');
  state.offline = null;
  try {
    const data = await fetchPlayer(uid);
    state.diff = updateHistory(uid, data.playerInfo);
    await showPlayer(data);
    saveOffline(uid, data);
    rememberPlayer(uid, data.playerInfo.nickname);
    updateUrl(uid);
  } catch (error) {
    console.error(error);
    const saved = error.network ? loadOffline(uid) : null;
    if (saved && saved.data && saved.data.playerInfo) {
      state.offline = saved.savedAt;
      state.diff = null;
      await showPlayer(saved.data);
      return;
    }
    showError(error, uid);
  }
}

langButton.addEventListener('click', () => {
  state.lang = state.lang === 'pl' ? 'en' : 'pl';
  saveSetting('lang', state.lang);
  applyTexts();
  render();
});

themeButton.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveSetting('theme', state.theme);
  applyTexts();
});

input.addEventListener('input', () => {
  input.value = input.value.replace(/\D/g, '').slice(0, 9);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(input.value.trim());
});

applyTexts();
renderHero();

const urlUid = new URLSearchParams(location.search).get('uid');
if (urlUid && /^\d{9}$/.test(urlUid)) {
  input.value = urlUid;
  search(urlUid);
}
