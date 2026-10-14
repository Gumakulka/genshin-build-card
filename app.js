const WORKER_URL = 'https://genshin-proxy.klaun970.workers.dev/uid/';
const STORE_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/';
const IMG_URL = 'https://enka.network/ui/';

const form = document.getElementById('uid-form');
const input = document.getElementById('uid-input');
const result = document.getElementById('result');
const hero = document.getElementById('hero');
const heroIcons = document.getElementById('hero-icons');
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
    unknownCharacter: 'Nieznana postać',
    avatarAlt: 'Awatar gracza',
    adventureRank: 'Poziom przygód',
    worldLevel: 'Poziom świata',
    achievements: 'Osiągnięcia',
    abyss: 'Otchłań',
    region: 'Region',
    namecards: 'Wizytówki',
    characters: 'Postacie z gabloty',
    otherData: 'Pozostałe dane z API',
    disclaimer: 'Projekt fanowski, niezwiązany z HoYoverse. Dane: Enka.Network. Grafiki należą do ich właścicieli.',
    author: 'Autor: Gumakulka',
    traveler: ['Podróżnik', 'Podróżniczka'],
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
    unknownCharacter: 'Unknown character',
    avatarAlt: 'Player avatar',
    adventureRank: 'Adventure Rank',
    worldLevel: 'World Level',
    achievements: 'Achievements',
    abyss: 'Abyss',
    region: 'Region',
    namecards: 'Namecards',
    characters: 'Showcase characters',
    otherData: 'Other API data',
    disclaimer: 'Fan project, not affiliated with HoYoverse. Data: Enka.Network. Artwork belongs to its owners.',
    author: 'Author: Gumakulka',
    traveler: ['Traveler', 'Traveler'],
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

const KNOWN_KEYS = [
  'nickname', 'signature', 'level', 'worldLevel', 'finishAchievementNum',
  'towerFloorIndex', 'towerLevelIndex', 'nameCardId', 'namecardId',
  'showAvatarInfoList', 'showNameCardIdList', 'profilePicture', 'isShowAvatarTalent'
];

const state = {
  lang: loadSetting('lang', navigator.language && navigator.language.startsWith('pl') ? 'pl' : 'en'),
  theme: loadSetting('theme', window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  last: null
};

let storePromise = null;

function loadSetting(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
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

function t(key) {
  return TEXT[state.lang][key];
}

function applyTexts() {
  document.documentElement.lang = state.lang;
  document.documentElement.dataset.theme = state.theme;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  langButton.textContent = state.lang === 'pl' ? 'EN' : 'PL';
  themeButton.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

function loadStore() {
  if (!storePromise) {
    storePromise = Promise.all([
      fetch(STORE_URL + 'characters.json').then((r) => r.json()),
      fetch(STORE_URL + 'pfps.json').then((r) => r.json()),
      fetch(STORE_URL + 'namecards.json').then((r) => r.json())
    ])
      .then(([characters, pfps, namecards]) => ({ characters, pfps, namecards }))
      .catch((error) => {
        console.error('Could not load character data', error);
        storePromise = null;
        return { characters: {}, pfps: {}, namecards: {} };
      });
  }
  return storePromise;
}

function getCache(uid) {
  try {
    const raw = localStorage.getItem('player-' + uid);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    return Date.now() < cached.expires ? cached.data : null;
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
  const response = await fetch(WORKER_URL + uid);
  if (!response.ok) {
    throw new Error(t('errors')[response.status] || t('generic') + response.status);
  }
  const data = await response.json();
  setCache(uid, data);
  return data;
}

function createImage(iconName, alt, className) {
  if (!/^[A-Za-z0-9_]+$/.test(iconName)) return document.createTextNode('');
  const img = document.createElement('img');
  img.src = IMG_URL + iconName + '.png';
  img.alt = alt;
  img.loading = 'lazy';
  if (className) img.className = className;
  img.addEventListener('error', () => img.classList.add('missing'));
  return img;
}

function createText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function getCharacterIcon(character, costumeId) {
  if (!character || !character.SideIconName) return null;
  const costume = character.Costumes && character.Costumes[costumeId];
  if (costume && costume.icon) return costume.icon;
  return character.SideIconName.replace('_Side', '');
}

function getCharacterName(character) {
  if (!character || !character.SideIconName) return t('unknownCharacter');
  const raw = character.SideIconName.replace('UI_AvatarIcon_Side_', '');
  if (raw === 'PlayerBoy') return t('traveler')[0];
  if (raw === 'PlayerGirl') return t('traveler')[1];
  return NAME_FIX[raw] || raw;
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

function buildProfile(data, store) {
  const info = data.playerInfo;
  const profile = document.createElement('section');
  profile.className = 'profile';

  const bannerId = info.nameCardId || info.namecardId;
  const bannerIcon = bannerId ? getNamecardIcon(bannerId, store) : null;
  if (bannerIcon) profile.append(createImage(bannerIcon, '', 'banner'));

  const body = document.createElement('div');
  body.className = 'profile-body';

  const avatarIcon = getProfileIcon(info, store);
  if (avatarIcon) body.append(createImage(avatarIcon, t('avatarAlt'), 'avatar'));

  const details = document.createElement('div');
  details.append(createText('h2', '', info.nickname));
  if (info.signature) details.append(createText('p', 'signature', info.signature));

  const stats = document.createElement('ul');
  stats.className = 'stats';
  stats.append(createText('li', '', 'UID: ' + data.uid));
  if (data.region) stats.append(createText('li', '', t('region') + ': ' + data.region));
  stats.append(createText('li', '', t('adventureRank') + ': ' + info.level));
  stats.append(createText('li', '', t('worldLevel') + ': ' + info.worldLevel));
  stats.append(createText('li', '', t('achievements') + ': ' + info.finishAchievementNum));
  if (info.towerFloorIndex) {
    stats.append(createText('li', '', t('abyss') + ': ' + info.towerFloorIndex + '-' + info.towerLevelIndex));
  }
  details.append(stats);

  body.append(details);
  profile.append(body);
  return profile;
}

function buildNamecards(info, store) {
  const ids = info.showNameCardIdList || [];
  if (!ids.length) return null;
  const wrapper = document.createElement('section');
  wrapper.append(createText('h3', 'section-title', t('namecards')));
  const list = document.createElement('div');
  list.className = 'namecards';
  ids.forEach((id) => {
    const icon = getNamecardIcon(id, store);
    if (icon) list.append(createImage(icon, 'Namecard ' + id, 'namecard'));
  });
  wrapper.append(list);
  return wrapper;
}

function buildCharacters(info, store) {
  const avatars = info.showAvatarInfoList || [];
  if (!avatars.length) return null;
  const wrapper = document.createElement('section');
  wrapper.append(createText('h3', 'section-title', t('characters')));
  const list = document.createElement('div');
  list.className = 'characters';

  avatars.forEach((avatar) => {
    const character = store.characters[avatar.avatarId];
    const card = document.createElement('div');
    card.className = 'character ' + getRarityClass(character);

    const iconName = getCharacterIcon(character, avatar.costumeId);
    const name = getCharacterName(character);
    if (iconName) card.append(createImage(iconName, name));

    card.append(createText('div', 'name', name));
    const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
    let meta = emoji + 'Lv. ' + avatar.level;
    if (info.isShowAvatarTalent) meta += ' · C' + (avatar.talentLevel || 0);
    card.append(createText('div', 'meta', meta));
    list.append(card);
  });

  wrapper.append(list);
  return wrapper;
}

function buildOther(info) {
  const entries = Object.keys(info).filter((key) => {
    return !KNOWN_KEYS.includes(key) && typeof info[key] !== 'object';
  });
  if (!entries.length) return null;
  const wrapper = document.createElement('section');
  wrapper.append(createText('h3', 'section-title', t('otherData')));
  const list = document.createElement('ul');
  list.className = 'other';
  entries.forEach((key) => {
    list.append(createText('li', '', key + ': ' + info[key]));
  });
  wrapper.append(list);
  return wrapper;
}

function render() {
  if (!state.last) return;
  const { data, store } = state.last;
  result.textContent = '';
  [
    buildProfile(data, store),
    buildNamecards(data.playerInfo, store),
    buildCharacters(data.playerInfo, store),
    buildOther(data.playerInfo)
  ].forEach((block) => {
    if (block) result.append(block);
  });
}

function renderHero() {
  HERO_CHARACTERS.forEach((character) => {
    heroIcons.append(createImage(character.icon, character.name, 'hero-icon'));
  });
}

async function showPlayer(data) {
  const store = await loadStore();
  state.last = { data, store };
  hero.hidden = true;
  render();
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

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const uid = input.value.trim();
  if (uid.length !== 9) {
    result.textContent = t('uidLength');
    return;
  }
  result.textContent = t('loading');
  try {
    const data = await fetchPlayer(uid);
    await showPlayer(data);
  } catch (error) {
    console.error(error);
    if (error instanceof TypeError) {
      result.textContent = t('network');
    } else {
      result.textContent = error.message;
    }
  }
});

applyTexts();
renderHero();
