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
    stygian: 'Stygian',
    maxFriendship: 'Maks. przyjaźń',
    region: 'Region',
    namecards: 'Wizytówki',
    characters: 'Postacie z gabloty',
    disclaimer: 'Projekt fanowski, niezwiązany z HoYoverse. Grafiki należą do ich właścicieli.',
    author: 'Autor: Gumakulka',
    traveler: ['Podróżnik', 'Podróżniczka'],
    stats: 'Statystyki',
    talents: 'Talenty',
    talentsValue: 'Atak / Umiejętność / Wybuch (bazowe)',
    weapon: 'Broń',
    artifacts: 'Artefakty',
    sets: 'Zestawy',
    cv: 'Suma CV z substatów',
    constellations: 'Konstelacje',
    friendship: 'Poziom przyjaźni',
    level: 'Poziom',
    base: 'Bazowy',
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    em: 'Biegłość żywiołów',
    critRate: 'Szansa kryt.',
    critDmg: 'Obrażenia kryt.',
    er: 'Regen. energii',
    healing: 'Bonus leczenia',
    slots: ['Kwiat', 'Pióro', 'Piaski', 'Puchar', 'Diadem'],
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
    disclaimer: 'Fan project, not affiliated with HoYoverse. Artwork belongs to its owners.',
    author: 'Author: Gumakulka',
    traveler: ['Traveler', 'Traveler'],
    stats: 'Stats',
    talents: 'Talents',
    talentsValue: 'Attack / Skill / Burst (base)',
    weapon: 'Weapon',
    artifacts: 'Artifacts',
    sets: 'Sets',
    cv: 'Total substat CV',
    constellations: 'Constellations',
    friendship: 'Friendship level',
    level: 'Level',
    base: 'Base',
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    em: 'Elemental Mastery',
    critRate: 'CRIT Rate',
    critDmg: 'CRIT DMG',
    er: 'Energy Recharge',
    healing: 'Healing Bonus',
    slots: ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'],
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
  last: null,
  selectedId: null,
  detailBox: null
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

function propName(prop) {
  return PROP_NAMES[state.lang][prop] || prop;
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

function fetchJson(name) {
  return fetch(STORE_URL + name)
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
    ]).then(([characters, pfps, namecards, loc]) => ({ characters, pfps, namecards, loc }));
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
  const response = await fetch(WORKER_URL + uid);
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

function chip(icon, label, value) {
  const wrapper = el('span', 'chip');
  wrapper.append(el('span', '', icon), el('span', 'chip-label', label), el('span', 'chip-value', value));
  return wrapper;
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

  avatars.forEach((avatar) => {
    const character = store.characters[avatar.avatarId];
    const card = el('button', 'character ' + getRarityClass(character));
    card.type = 'button';
    card.dataset.avatarId = String(avatar.avatarId);
    if (String(avatar.avatarId) === String(state.selectedId)) card.classList.add('selected');

    const name = getCharacterName(character, store);
    card.append(createImage(getCharacterIcon(character, avatar.costumeId), name));
    card.append(el('div', 'name', name));
    const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
    let meta = emoji + 'Lv. ' + avatar.level;
    if (info.isShowAvatarTalent) meta += ' · C' + (avatar.talentLevel || 0);
    card.append(el('div', 'meta', meta));

    card.addEventListener('click', () => {
      state.selectedId = avatar.avatarId;
      list.querySelectorAll('.character').forEach((node) => {
        node.classList.toggle('selected', node.dataset.avatarId === String(avatar.avatarId));
      });
      renderDetail();
    });
    list.append(card);
  });

  wrapper.append(list);
  return wrapper;
}

function buildStatsPanel(details) {
  const props = details.fightPropMap || {};
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('stats')));
  panel.append(statRow(t('hp'), Math.round(props[2000] || 0)));
  panel.append(statRow(t('atk'), Math.round(props[2001] || 0)));
  panel.append(statRow(t('def'), Math.round(props[2002] || 0)));
  panel.append(statRow(t('em'), Math.round(props[28] || 0)));
  panel.append(statRow(t('critRate'), ((props[20] || 0) * 100).toFixed(1) + '%'));
  panel.append(statRow(t('critDmg'), ((props[22] || 0) * 100).toFixed(1) + '%'));
  panel.append(statRow(t('er'), ((props[23] || 0) * 100).toFixed(1) + '%'));
  if (props[26]) panel.append(statRow(t('healing'), (props[26] * 100).toFixed(1) + '%'));

  let bestKey = null;
  Object.keys(DMG_PROPS).forEach((key) => {
    if ((props[key] || 0) > 0 && (bestKey === null || props[key] > props[bestKey])) bestKey = key;
  });
  if (bestKey !== null) {
    panel.append(statRow(propName(DMG_PROPS[bestKey]), (props[bestKey] * 100).toFixed(1) + '%'));
  }
  return panel;
}

function buildExtrasPanel(details, character) {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('talents')));
  const order = character && character.SkillOrder ? character.SkillOrder : [];
  const levels = details.skillLevelMap || {};
  const values = order.slice(0, 3).map((id) => levels[id] || '-');
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

function buildWeaponPanel(items, store) {
  const item = items.find((entry) => entry.flat && entry.flat.itemType === 'ITEM_WEAPON');
  if (!item) return null;
  const flat = item.flat;
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('weapon')));

  const row = el('div', 'weapon');
  row.append(createImage(flat.icon, 'Weapon'));
  const text = el('div');
  const name = localized(flat.nameTextMapHash !== undefined ? flat.nameTextMapHash : flat.nameTextHashMap, store);
  text.append(el('div', 'item-name', name || t('weapon')));

  const weapon = item.weapon || {};
  const affix = weapon.affixMap ? Object.values(weapon.affixMap)[0] : 0;
  text.append(el('div', 'item-meta', t('level') + ' ' + (weapon.level || '?') + ' · R' + ((affix || 0) + 1)));

  (flat.weaponStats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (stat && stat.prop) text.append(el('div', 'item-meta', propName(stat.prop) + ': ' + formatStat(stat.prop, stat.value)));
  });
  row.append(text);
  panel.append(row);
  return panel;
}

function buildArtifacts(items, store) {
  const artifacts = items.filter((entry) => entry.flat && entry.flat.itemType === 'ITEM_RELIQUARY');
  if (!artifacts.length) return null;
  artifacts.sort((a, b) => SLOT_ORDER.indexOf(a.flat.equipType) - SLOT_ORDER.indexOf(b.flat.equipType));

  const wrapper = el('div', 'panel');
  wrapper.append(el('h5', '', t('artifacts')));
  const grid = el('div', 'artifacts');

  const sets = {};
  let cv = 0;

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
    grid.append(card);
  });

  const setLines = Object.keys(sets).filter((name) => sets[name] >= 2).map((name) => name + ' (' + sets[name] + ')');
  if (setLines.length) wrapper.append(el('div', 'item-meta', t('sets') + ': ' + setLines.join(', ')));
  wrapper.append(el('div', 'item-meta', t('cv') + ': ' + cv.toFixed(1)));
  wrapper.append(grid);
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
  panel.append(head);

  const grid = el('div', 'detail-grid');
  const left = el('div');
  left.append(buildStatsPanel(details));
  left.append(el('div', 'hint'));
  left.append(buildExtrasPanel(details, character));
  const right = el('div');
  const weapon = buildWeaponPanel(details.equipList || [], store);
  if (weapon) right.append(weapon);
  grid.append(left, right);
  panel.append(grid);

  const artifacts = buildArtifacts(details.equipList || [], store);
  if (artifacts) {
    const spacer = el('div', 'hint');
    panel.append(spacer, artifacts);
  }
  box.append(panel);
}

function render() {
  if (!state.last) return;
  const { data, store } = state.last;
  result.textContent = '';
  result.append(buildProfile(data, store), buildChips(data));

  const namecards = buildNamecards(data.playerInfo, store);
  if (namecards) result.append(namecards);

  const characters = buildCharacters(data, store);
  if (characters) result.append(characters);

  state.detailBox = el('div');
  result.append(state.detailBox);
  renderDetail();
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
