const form = document.getElementById('uid-form');
const input = document.getElementById('uid-input');
const result = document.getElementById('result');

const ERRORS = {
  400: 'Nieprawidlowy format UID.',
  404: 'Taki gracz nie istnieje.',
  424: 'Gra jest w trakcie konserwacji. Sprobuj pozniej.',
  429: 'Za duzo zapytan. Odczekaj chwile.',
  500: 'Blad serwera Enka.Network.',
  503: 'Serwer Enka.Network jest niedostepny.'
};

function getCache(uid) {
  const raw = localStorage.getItem('player-' + uid);
  if (!raw) return null;
  const cached = JSON.parse(raw);
  return Date.now() < cached.expires ? cached.data : null;
}

function setCache(uid, data) {
  const ttl = (data.ttl || 60) * 1000;
  localStorage.setItem('player-' + uid, JSON.stringify({ expires: Date.now() + ttl, data }));
}

async function fetchPlayer(uid) {
  const cached = getCache(uid);
  if (cached) return cached;
  const response = await fetch('https://enka.network/api/uid/' + uid + '/?info');
  if (!response.ok) {
    throw new Error(ERRORS[response.status] || 'Blad: ' + response.status);
  }
  const data = await response.json();
  setCache(uid, data);
  return data;
}

function showPlayer(data) {
  const info = data.playerInfo;
  result.textContent = '';
  const title = document.createElement('h2');
  title.textContent = info.nickname;
  const level = document.createElement('p');
  level.textContent = 'Poziom przygod: ' + info.level;
  result.append(title, level);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const uid = input.value.trim();
  result.textContent = 'Ladowanie...';
  try {
    const data = await fetchPlayer(uid);
    showPlayer(data);
  } catch (error) {
    result.textContent = error.message;
  }
});
