/* Dane statyczne z Project Amber (gi.yatta.moe) przez Workera: opisy, talenty, konstelacje, materiały i grafiki.
   Dane są sprawdzane przed użyciem i trafiają do strony wyłącznie przez textContent. Nazwy obrazków przechodzą przez filtr znaków. */
const AMBER_ASSETS = 'https://gi.yatta.moe/assets/UI/';
const AMBER_NAMECARDS = AMBER_ASSETS + 'namecard/';
const CODEX_URL = WORKER_URL.replace(/\/uid\/$/, '/character/');
const CODEX_LANG = 'en';
const CODEX_TIMEOUT_MS = 15000;
const CODEX_RETRY_MS = 60000;
const codexCache = new Map();
const codexPending = new Map();
const codexFailed = new Map();

function codexValid(data) {
  return Boolean(data) && typeof data === 'object' && Number.isFinite(data.id) &&
    Array.isArray(data.talents) && Array.isArray(data.constellations) &&
    Boolean(data.items) && typeof data.items === 'object' && Array.isArray(data.promote);
}

function loadCodex(avatarId) {
  const id = String(avatarId);
  if (!/^\d{5,9}$/.test(id)) return Promise.resolve(null);
  if (codexCache.has(id)) return Promise.resolve(codexCache.get(id));
  if (codexPending.has(id)) return codexPending.get(id);
  if (Date.now() - (codexFailed.get(id) || 0) < CODEX_RETRY_MS) return Promise.resolve(null);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CODEX_TIMEOUT_MS);
  const request = fetch(CODEX_URL + id + '?lang=' + CODEX_LANG, { signal: controller.signal, credentials: 'omit' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (codexValid(data)) {
        codexCache.set(id, data);
        return data;
      }
      codexFailed.set(id, Date.now());
      return null;
    })
    .catch(() => {
      codexFailed.set(id, Date.now());
      return null;
    })
    .finally(() => {
      clearTimeout(timer);
      codexPending.delete(id);
    });

  codexPending.set(id, request);
  return request;
}

function codexIconUrl(name) {
  return /^[A-Za-z0-9_]{1,80}$/.test(name || '') ? AMBER_ASSETS + name + '.png' : null;
}

/* Baner: najpierw duży obraz wizytówki (_P), a gdy go nie ma, mała ikona wizytówki. */
function codexNamecardUrls(icon) {
  if (!/^UI_NameCardIcon_[A-Za-z0-9_]{1,60}$/.test(icon || '')) return [];
  return [
    AMBER_NAMECARDS + 'UI_NameCardPic_' + icon.replace('UI_NameCardIcon_', '') + '_P.png',
    AMBER_NAMECARDS + icon + '.png'
  ];
}

function codexImage(urls, alt, className) {
  const list = (urls || []).filter(Boolean);
  const img = document.createElement('img');
  let index = 0;

  img.alt = alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';
  if (className) img.className = className;

  img.addEventListener('error', () => {
    index += 1;
    if (index < list.length) img.src = list[index];
    else img.classList.add('missing');
  });

  if (list.length) img.src = list[0];
  else img.classList.add('missing');
  return img;
}

function codexIcon(name, alt, className) {
  return codexImage([codexIconUrl(name)], alt, className);
}
