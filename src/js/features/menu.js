/* Menu główne (przycisk ☰ na pasku u góry): szybkie przejścia i porządki w zapisanych danych.
   Nie zmienia istniejących przycisków języka i motywu. Ładowany po map-dock.js. */
const MENU_GITHUB_URL = 'https://github.com/Gumakulka/genshin-build-card';
const MENU_STORAGE_PREFIXES = ['player-', 'offline-', 'history-'];
const MENU_STORAGE_KEYS = ['recent', 'favorites'];
const menu = { open: false, button: null, panel: null, entries: [] };

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

const MENU_ITEMS = [
  { id: 'home', icon: '🏠', pl: 'Start', en: 'Home', run: menuHome },
  { id: 'favorites', icon: '⭐', pl: 'Ulubieni gracze', en: 'Favorite players', run: () => menuScrollTo(favoritesBox), enabled: () => state.favorites.length > 0 },
  { id: 'recent', icon: '🕘', pl: 'Ostatnio sprawdzani', en: 'Recently checked', run: () => menuScrollTo(recentBox), enabled: () => state.recent.length > 0 },
  { id: 'map', icon: '🗺️', pl: 'Mapa', en: 'Map', run: () => mapDockOpen() },
  { id: 'sep' },
  { id: 'github', icon: '🔗', pl: 'Kod na GitHubie', en: 'Source on GitHub', href: MENU_GITHUB_URL },
  { id: 'clear', icon: '🗑️', pl: 'Wyczyść zapisane dane', en: 'Clear saved data', run: menuClearData, danger: true }
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
    entry.node.textContent = '';
    entry.node.append(el('span', 'menu-icon', entry.item.icon), document.createTextNode(menuText(entry.item.pl, entry.item.en)));
  });
}

function buildMenu() {
  const controls = document.querySelector('.controls');
  if (!controls) return;

  menu.button = el('button', 'menu-button', '☰');
  menu.button.type = 'button';
  menu.button.setAttribute('aria-haspopup', 'true');
  menu.button.setAttribute('aria-expanded', 'false');
  menu.button.setAttribute('aria-controls', 'main-menu');

  menu.panel = el('div', 'menu-panel');
  menu.panel.id = 'main-menu';
  menu.panel.setAttribute('role', 'menu');

  MENU_ITEMS.forEach((item) => {
    if (item.id === 'sep') {
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
  document.body.append(menu.panel);
  languageHooks.push(renderMenu);
  renderMenu();
}

buildMenu();
