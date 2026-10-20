/* Rdzeń: elementy strony, ustawienia w przeglądarce, stan aplikacji i tłumaczenia. */
const form = document.getElementById('uid-form');
const input = document.getElementById('uid-input');
const result = document.getElementById('result');
const hero = document.getElementById('hero');
const heroIcons = document.getElementById('hero-icons');
const recentBox = document.getElementById('recent');
const favoritesBox = document.getElementById('favorites');
const langButton = document.getElementById('lang-toggle');
const themeButton = document.getElementById('theme-toggle');
const languageHooks = [];

function sanitizeList(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function sanitizePlayers(value) {
  return sanitizeList(value, []).filter((item) => item && typeof item === 'object' && /^\d{9}$/.test(String(item.uid)));
}

function sanitizeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
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

function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
}

const savedLang = loadSetting('lang', navigator.language && navigator.language.startsWith('pl') ? 'pl' : 'en');
const savedTheme = loadSetting('theme', window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

const state = {
  lang: Object.prototype.hasOwnProperty.call(TEXT, savedLang) ? savedLang : 'en',
  theme: savedTheme === 'light' ? 'light' : 'dark',
  targets: Object.assign({}, DEFAULT_TARGETS, sanitizeObject(loadJsonSetting('targets', {}))),
  rvStats: sanitizeList(loadJsonSetting('rvStats', DEFAULT_RV), DEFAULT_RV),
  recent: sanitizePlayers(loadJsonSetting('recent', [])),
  favorites: sanitizePlayers(loadJsonSetting('favorites', [])),
  diff: null,
  offline: null,
  last: null,
  selectedId: null,
  detailBox: null,
  compareBox: null
};

function t(key) {
  return TEXT[state.lang][key];
}

function propName(prop) {
  return PROP_NAMES[state.lang][prop] || prop;
}

/* Wskaźnik ładowania. Przy wyszukiwaniu gracza pod kółkiem widać też szkielet profilu i karty, przy krótkich ładowaniach tylko kółko. */
function loadingNode(text) {
  const box = document.createElement('div');
  box.className = 'loading loading-skeleton';
  box.setAttribute('role', 'status');

  const line = document.createElement('div');
  line.className = 'loading-line';
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');
  line.append(spinner, document.createTextNode(text));
  box.append(line);

  if (text === t('loading')) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    ['sk-profile', 'sk-row', 'sk-card'].forEach((name) => {
      const block = document.createElement('div');
      block.className = 'sk ' + name;
      skeleton.append(block);
    });
    box.append(skeleton);
  }
  return box;
}

function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
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
  themeButton.replaceChildren(icon(state.theme === 'dark' ? 'sun' : 'moon'));
  themeButton.setAttribute('aria-label', state.lang === 'pl' ? 'Zmień motyw' : 'Toggle theme');
  renderRecent();
  renderFavorites();
}
