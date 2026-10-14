/* Menu główne (przycisk na pasku u góry): szybkie przejścia, kopia ulubionych i porządki w zapisanych danych.
   Nie zmienia istniejących przycisków języka i motywu. Ładowany po map-dock.js. */
const MENU_GITHUB_URL = 'https://github.com/Gumakulka/genshin-build-card';
const MENU_STORAGE_PREFIXES = ['player-', 'offline-', 'history-'];
const MENU_STORAGE_KEYS = ['recent', 'favorites'];
const MENU_MAX_IMPORT = 200;
const menu = { open: false, button: null, panel: null, entries: [], file: null };

function menuText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function menuHome() {
  if (typeof searchSequence !== 'undefined') searchSequence += 1;
  state.last = null;
  state.selectedId = null;
  result.textContent = '';
  hero.hidden = false;
  input.value = '';
  history.replaceState(null, '', location.pathname);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  input.focus();
}

function menuScrollTo(box) {
  if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function menuClearData() {
  const question = menuText(
    'Usunąć zapisane dane (ostatni i ulubieni gracze, historia, pamięć offline)? Język i motyw zostaną.',
    'Delete saved data (recent and favorite players, history, offline cache)? Language and theme are kept.'
  );
  if (!window.confirm(question)) return;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) keys.push(localStorage.key(i));
    keys.forEach((key) => {
      if (!key) return;
      if (MENU_STORAGE_KEYS.includes(key) || MENU_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error(error);
  }
  state.recent = [];
  state.favorites = [];
  renderRecent();
  renderFavorites();
}

function menuExportFavorites() {
  const payload = { app: 'genshin-build-card', favorites: state.favorites };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'genshin-build-card-favorites.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function menuCleanPlayer(item) {
  const clean = {};
  Object.keys(item).forEach((key) => {
    const value = item[key];
    if (key.length > 30) return;
    if (typeof value === 'string') clean[key] = value.slice(0, 60);
    else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value;
  });
  clean.uid = String(item.uid);
  return clean;
}

async function menuImportFavorites(file) {
  if (!file || file.size > 200000) return;
  try {
    const data = JSON.parse(await file.text());
    const incoming = sanitizePlayers(Array.isArray(data) ? data : data && data.favorites).map(menuCleanPlayer);
    const known = new Set(state.favorites.map((item) => String(item.uid)));
    incoming.forEach((item) => {
      if (known.has(item.uid) || state.favorites.length >= MENU_MAX_IMPORT) return;
      known.add(item.uid);
      state.favorites.push(item);
    });
    saveJsonSetting('favorites', state.favorites);
    renderFavorites();
  } catch (error) {
    console.error(error);
    window.alert(menuText('Nie udało się wczytać pliku z ulubionymi.', 'Could not read the favorites file.'));
  }
}

const MENU_ITEMS = [
  { id: 'home', icon: 'house', pl: 'Start', en: 'Home', run: menuHome },
  { id: 'favorites', icon: 'star', pl: 'Ulubieni gracze', en: 'Favorite players', run: () => menuScrollTo(favoritesBox), enabled: () => state.favorites.length > 0 },
  { id: 'recent', icon: 'history', pl: 'Ostatnio sprawdzani', en: 'Recently checked', run: () => menuScrollTo(recentBox), enabled: () => state.recent.length > 0 },
  { id: 'map', icon: 'map', pl: 'Mapa', en: 'Map', run: () => mapDockOpen() },
  { id: 'farm', icon: 'calendar-days', pl: 'Plan farmienia', en: 'Farming plan', run: () => farmOpen() },
  { id: 'sep1' },
  { id: 'export', icon: 'download', pl: 'Zapisz ulubionych do pliku', en: 'Export favorites', run: menuExportFavorites, enabled: () => state.favorites.length > 0 },
  { id: 'import', icon: 'upload', pl: 'Wczytaj ulubionych z pliku', en: 'Import favorites', run: () => menu.file.click() },
  { id: 'sep2' },
  { id: 'github', icon: 'git-branch', pl: 'Kod na GitHubie', en: 'Source on GitHub', href: MENU_GITHUB_URL },
  { id: 'clear', icon: 'trash-2', pl: 'Wyczyść zapisane dane', en: 'Clear saved data', run: menuClearData, danger: true }
];

function setMenuOpen(open) {
  menu.open = open;
  menu.panel.classList.toggle('open', open);
  menu.button.setAttribute('aria-expanded', String(open));
  if (open) {
    menu.entries.forEach((entry) => {
      if (entry.item.enabled) entry.node.disabled = !entry.item.enabled();
    });
  }
}

function renderMenu() {
  if (!menu.button) return;
  menu.button.title = menuText('Menu', 'Menu');
  menu.button.setAttribute('aria-label', menuText('Menu', 'Menu'));
  menu.entries.forEach((entry) => {
    const badge = el('span', 'menu-icon');
    badge.append(icon(entry.item.icon));
    entry.node.replaceChildren(badge, document.createTextNode(menuText(entry.item.pl, entry.item.en)));
  });
}

function buildMenu() {
  const controls = document.querySelector('.controls');
  if (!controls) return;

  menu.button = el('button', 'menu-button');
  menu.button.type = 'button';
  menu.button.append(icon('menu'));
  menu.button.setAttribute('aria-haspopup', 'true');
  menu.button.setAttribute('aria-expanded', 'false');
  menu.button.setAttribute('aria-controls', 'main-menu');

  menu.panel = el('div', 'menu-panel');
  menu.panel.id = 'main-menu';
  menu.panel.setAttribute('role', 'menu');

  menu.file = document.createElement('input');
  menu.file.type = 'file';
  menu.file.accept = 'application/json,.json';
  menu.file.hidden = true;
  menu.file.addEventListener('change', () => {
    menuImportFavorites(menu.file.files[0]);
    menu.file.value = '';
  });

  MENU_ITEMS.forEach((item) => {
    if (item.id.startsWith('sep')) {
      menu.panel.append(el('div', 'menu-sep'));
      return;
    }
    let node;
    if (item.href) {
      node = el('a', 'menu-item');
      node.href = item.href;
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
      node.addEventListener('click', () => setMenuOpen(false));
    } else {
      node = el('button', item.danger ? 'menu-item danger' : 'menu-item');
      node.type = 'button';
      node.addEventListener('click', () => {
        setMenuOpen(false);
        item.run();
      });
    }
    node.setAttribute('role', 'menuitem');
    menu.entries.push({ item, node });
    menu.panel.append(node);
  });

  menu.button.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuOpen(!menu.open);
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.panel.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      setMenuOpen(false);
      menu.button.focus();
    }
  });

  controls.prepend(menu.button);
  document.body.append(menu.panel, menu.file);
  languageHooks.push(renderMenu);
  renderMenu();
}

buildMenu();
