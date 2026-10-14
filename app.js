const WORKER_URL = 'https://genshin-proxy.klaun970.workers.dev/uid/';
const STORE_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/';
const IMG_URL = 'https://enka.network/ui/';

const form = document.getElementById('uid-form');
const input = document.getElementById('uid-input');
const result = document.getElementById('result');

const ERRORS = {
  400: 'Nieprawidłowy format UID.',
  403: 'Serwer odrzucił zapytanie z tej strony.',
  404: 'Taki gracz nie istnieje.',
  424: 'Gra jest w trakcie konserwacji. Spróbuj później.',
  429: 'Za dużo zapytań. Odczekaj chwilę.',
  500: 'Błąd serwera Enka.Network.',
  503: 'Serwer Enka.Network jest niedostępny.'
};

const NAME_FIX = {
  PlayerBoy: 'Podróżnik',
  PlayerGirl: 'Podróżniczka',
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

let storePromise = null;

function loadStore() {
  if (!storePromise) {
    storePromise = Promise.all([
      fetch(STORE_URL + 'characters.json').then((r) => r.json()),
      fetch(STORE_URL + 'pfps.json').then((r) => r.json())
    ])
      .then(([characters, pfps]) => ({ characters, pfps }))
      .catch((error) => {
        console.error('Nie udało się pobrać danych postaci', error);
        storePromise = null;
        return { characters: {}, pfps: {} };
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
    console.error('Nie udało się zapisać cache', error);
  }
}

async function fetchPlayer(uid) {
  const cached = getCache(uid);
  if (cached) return cached;
  const response = await fetch(WORKER_URL + uid);
  if (!response.ok) {
    throw new Error(ERRORS[response.status] || 'Błąd: ' + response.status);
  }
  const data = await response.json();
  setCache(uid, data);
  return data;
}

function createImage(iconName, alt) {
  if (!/^[A-Za-z0-9_]+$/.test(iconName)) return document.createTextNode('');
  const img = document.createElement('img');
  img.src = IMG_URL + iconName + '.png';
  img.alt = alt;
  img.loading = 'lazy';
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
  if (!character || !character.SideIconName) return 'Nieznana postać';
  const raw = character.SideIconName.replace('UI_AvatarIcon_Side_', '');
  return NAME_FIX[raw] || raw;
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

function buildProfile(info, store) {
  const profile = document.createElement('section');
  profile.className = 'profile';

  const iconName = getProfileIcon(info, store);
  if (iconName) profile.append(createImage(iconName, 'Awatar gracza'));

  const details = document.createElement('div');
  details.append(createText('h2', '', info.nickname));
  if (info.signature) details.append(createText('p', 'signature', info.signature));

  const stats = document.createElement('ul');
  stats.className = 'stats';
  stats.append(createText('li', '', 'Poziom przygód: ' + info.level));
  stats.append(createText('li', '', 'Poziom świata: ' + info.worldLevel));
  stats.append(createText('li', '', 'Osiągnięcia: ' + info.finishAchievementNum));
  if (info.towerFloorIndex) {
    stats.append(createText('li', '', 'Otchłań: ' + info.towerFloorIndex + '-' + info.towerLevelIndex));
  }
  details.append(stats);

  profile.append(details);
  return profile;
}

function buildCharacters(info, store) {
  const list = document.createElement('section');
  list.className = 'characters';
  const avatars = info.showAvatarInfoList || [];

  avatars.forEach((avatar) => {
    const character = store.characters[avatar.avatarId];
    const card = document.createElement('div');
    card.className = 'character';

    const iconName = getCharacterIcon(character, avatar.costumeId);
    const name = getCharacterName(character);
    if (iconName) card.append(createImage(iconName, name));

    card.append(createText('div', 'name', name));
    let meta = 'Lv. ' + avatar.level;
    if (info.isShowAvatarTalent) meta += ' · C' + (avatar.talentLevel || 0);
    card.append(createText('div', 'meta', meta));
    list.append(card);
  });

  return list;
}

async function showPlayer(data) {
  const info = data.playerInfo;
  const store = await loadStore();
  result.textContent = '';
  result.append(buildProfile(info, store));
  result.append(buildCharacters(info, store));
}

input.addEventListener('input', () => {
  input.value = input.value.replace(/\D/g, '').slice(0, 9);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const uid = input.value.trim();
  if (uid.length !== 9) {
    result.textContent = 'UID musi mieć dokładnie 9 cyfr.';
    return;
  }
  result.textContent = 'Ładowanie...';
  try {
    const data = await fetchPlayer(uid);
    await showPlayer(data);
  } catch (error) {
    console.error(error);
    if (error instanceof TypeError) {
      result.textContent = 'Nie udało się połączyć z serwerem (Failed to fetch). Sprawdź konsolę (F12).';
    } else {
      result.textContent = error.message;
    }
  }
});
