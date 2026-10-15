/* Panel mapy: osobna karta z pełną mapą i osobna karta do szukania znaczników.
   Mapa główna nie zmienia się po wyszukaniu np. Jueyun Chili. */
const MAP_HOME = 'https://genshin-impact-map.appsample.com/';
const MAP_BASE = MAP_HOME + 'location?names=';
const MAP_OTHER = [
  ['HoYoLAB', 'https://act.hoyolab.com/ys/app/interactive-map/index.html'],
  ['Kongying Tavern', 'https://yuanshen.site/'],
  ['AppSample', MAP_HOME]
];

const SPECIALTY_NAMES = [
  'Jueyun Chili', 'Calla Lily', 'Qingxin', 'Small Lamp Grass', 'Violetgrass', 'Cecilia', 'Silk Flower',
  'Dandelion Seed', 'Glaze Lily', 'Philanemo Mushroom', 'Cor Lapis', 'Wolfhook', 'Noctilucous Jade',
  'Windwheel Aster', 'Valberry', 'Starconch', 'Crystal Marrow', 'Sea Ganoderma', 'Naku Weed', 'Dendrobium',
  'Sakura Bloom', 'Amakumo Fruit', 'Sango Pearl', 'Onikabuto', 'Fluorescent Fungus', 'Lumenspar',
  'Nilotpala Lotus', 'Kalpalata Lotus', 'Rukkhashava Mushroom', 'Padisarah', 'Viparyas', 'Zaytun Peach',
  'Sumeru Rose', 'Mist Flower Corolla', 'Flaming Flower Stamen', 'Electro Crystal', 'Starsilver',
  'Strange Tooth', 'Crimson Agate', 'Scarlet Quartz', 'Amethyst Lump', 'Ores', 'Iron Chunk',
  'White Iron Chunk', 'Crystal Chunk', 'Magical Crystal Chunk'
];

const dock = {
  open: false,
  wide: false,
  mode: 'home',
  searchNames: '',
  loadedHome: false,
  loadedSearch: '',
  timer: null,
  built: false
};

const dockNodes = {};

function mapUrl(names) {
  return names ? MAP_BASE + encodeURIComponent(names) : MAP_HOME;
}

function cleanSearch(value) {
  return String(value).replace(/[^A-Za-z0-9 ,'\-().:+&!]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function createMapFrame(title) {
  const frame = document.createElement('iframe');
  frame.title = title;
  frame.referrerPolicy = 'no-referrer';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
  return frame;
}

function markFrameReady(container) {
  container.classList.add('ready');
  clearTimeout(dock.timer);
}

function loadHomeMap() {
  if (dock.loadedHome) return;
  dock.loadedHome = true;

  dockNodes.homeFrame.classList.remove('ready');
  dockNodes.homeIframe.src = MAP_HOME;

  dock.timer = setTimeout(() => {
    if (!dockNodes.homeFrame.classList.contains('ready')) dockNodes.note.classList.add('warn');
  }, 12000);
}

function loadSearchMap() {
  if (dock.loadedSearch === dock.searchNames) return;
  dock.loadedSearch = dock.searchNames;

  dockNodes.searchFrame.classList.remove('ready');
  dockNodes.searchIframe.src = mapUrl(dock.searchNames);

  dock.timer = setTimeout(() => {
    if (!dockNodes.searchFrame.classList.contains('ready')) dockNodes.note.classList.add('warn');
  }, 12000);
}

function setMapMode(mode) {
  dock.mode = mode;
  renderDock();

  dockNodes.homeFrame.classList.toggle('active', mode === 'home');
  dockNodes.searchFrame.classList.toggle('active', mode === 'search');
  dockNodes.homeTab.classList.toggle('active', mode === 'home');
  dockNodes.searchTab.classList.toggle('active', mode === 'search');

  if (mode === 'home') loadHomeMap();
  else loadSearchMap();
}

function renderDock() {
  if (!dock.built) return;

  setLabel(dockNodes.title, 'map', gt('Mapa', 'Map'));
  setLabel(dockNodes.close, 'x', gt('Zamknij', 'Close'));
  dockNodes.size.replaceChildren(icon(dock.wide ? 'minimize-2' : 'maximize-2'));
  dockNodes.size.title = dock.wide ? gt('Węższy panel', 'Narrower panel') : gt('Szerszy panel', 'Wider panel');
  setLabel(dockNodes.launcher, 'map', gt('Mapa', 'Map'));

  dockNodes.homeTab.textContent = gt('Mapa', 'Map');
  dockNodes.searchTab.textContent = gt('Szukaj', 'Search');

  if (dock.mode === 'home') {
    dockNodes.hint.textContent = gt('Pełna mapa Teyvatu. Wyszukiwanie znaczników znajdziesz w karcie „Szukaj”.', 'Full Teyvat map. Marker search is available in the “Search” tab.');
    dockNodes.input.placeholder = gt('Przejdź do karty „Szukaj”', 'Switch to the “Search” tab');
    dockNodes.note.textContent = gt('Mapa pochodzi z AppSample. Jeśli się nie pokazuje, otwórz ją w nowej karcie.', 'The map comes from AppSample. If it does not show, open it in a new tab.');
    dockNodes.open.href = MAP_HOME;
  } else {
    dockNodes.hint.textContent = gt('Wyszukaj znacznik po angielskiej nazwie, np. Jueyun Chili. Wynik otworzy się na osobnej mapie.', 'Search a marker by its English name, e.g. Jueyun Chili. The result opens on a separate map.');
    dockNodes.input.placeholder = gt('Szukaj znacznika, np. Jueyun Chili', 'Search a marker, e.g. Jueyun Chili');
    dockNodes.note.textContent = gt('Wyniki wyszukiwania pochodzą z AppSample. Baza znaczników kończy się na Sumeru.', 'Search results come from AppSample. The marker database ends at Sumeru.');
    dockNodes.open.href = mapUrl(dock.searchNames);
  }

  dockNodes.searchButton.textContent = gt('Szukaj', 'Search');
  dockNodes.homeSkeleton.textContent = gt('Ładowanie mapy...', 'Loading the map...');
  dockNodes.searchSkeleton.textContent = gt('Ładowanie wyników...', 'Loading results...');
  setLabel(dockNodes.open, 'external-link', gt('Otwórz w nowej karcie', 'Open in a new tab'));
}

function setDockOpen(open) {
  dock.open = open;
  dockNodes.dock.classList.toggle('open', open);
  dockNodes.launcher.classList.toggle('hidden', open);
  dockNodes.dock.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('map-open', open);
}

function mapDockOpen() {
  if (!dock.built) return;
  setDockOpen(true);
  setMapMode('home');
}

function closeDock() {
  setDockOpen(false);
}

function toggleDockWidth() {
  dock.wide = !dock.wide;
  saveSetting('dockWide', dock.wide ? '1' : '0');
  document.body.classList.toggle('map-wide', dock.wide);
  renderDock();
}

function buildDockHeader() {
  const header = el('div', 'dock-header');
  dockNodes.title = el('span', 'dock-title');

  const actions = el('div', 'dock-actions');
  dockNodes.size = el('button', 'dock-size');
  dockNodes.size.type = 'button';
  dockNodes.size.addEventListener('click', toggleDockWidth);

  dockNodes.close = el('button', 'dock-close');
  dockNodes.close.type = 'button';
  dockNodes.close.addEventListener('click', closeDock);

  actions.append(dockNodes.size, dockNodes.close);
  header.append(dockNodes.title, actions);
  return header;
}

function buildMapTabs() {
  const tabs = el('div', 'map-tabs');

  dockNodes.homeTab = el('button', 'map-tab active');
  dockNodes.homeTab.type = 'button';
  dockNodes.homeTab.addEventListener('click', () => setMapMode('home'));

  dockNodes.searchTab = el('button', 'map-tab');
  dockNodes.searchTab.type = 'button';
  dockNodes.searchTab.addEventListener('click', () => setMapMode('search'));

  tabs.append(dockNodes.homeTab, dockNodes.searchTab);
  return tabs;
}

function buildDockBody() {
  const body = el('div', 'dock-body');
  dockNodes.hint = el('p', 'dock-hint');

  dockNodes.searchForm = el('form', 'dock-search');
  dockNodes.input = document.createElement('input');
  dockNodes.input.type = 'text';
  dockNodes.input.maxLength = 80;
  dockNodes.input.setAttribute('list', 'dock-names');

  const datalist = document.createElement('datalist');
  datalist.id = 'dock-names';
  SPECIALTY_NAMES.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    datalist.append(option);
  });

  dockNodes.searchButton = el('button', 'action-button');
  dockNodes.searchButton.type = 'submit';

  dockNodes.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    dock.searchNames = cleanSearch(dockNodes.input.value);
    renderDock();
    setMapMode('search');
  });

  dockNodes.searchForm.append(dockNodes.input, dockNodes.searchButton, datalist);
  body.append(buildMapTabs(), dockNodes.hint, dockNodes.searchForm);
  return body;
}

function buildDockFooter() {
  const footer = el('div', 'dock-footer');
  dockNodes.note = el('p', 'map-note');

  dockNodes.open = el('a', 'guide-link');
  dockNodes.open.target = '_blank';
  dockNodes.open.rel = 'noopener noreferrer';

  footer.append(dockNodes.note, dockNodes.open);

  MAP_OTHER.forEach(([label, url]) => {
    const link = el('a', 'guide-link', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    footer.append(link);
  });

  return footer;
}

function buildDock() {
  const style = document.createElement('style');
  style.textContent = `
    .map-tabs { display: flex; gap: 8px; margin-bottom: 10px; }
    .map-tab { flex: 1; padding: 8px 10px; border: 1px solid var(--line, #444); border-radius: 10px; background: transparent; color: inherit; cursor: pointer; }
    .map-tab.active { background: var(--accent, #4a90e2); color: white; border-color: var(--accent, #4a90e2); }
    .dock-frame { display: none; }
    .dock-frame.active { display: block; }
  `;
  document.head.append(style);

  const panel = el('aside', 'map-dock');
  panel.setAttribute('aria-label', 'Map');
  panel.setAttribute('aria-hidden', 'true');

  dockNodes.homeFrame = el('div', 'dock-frame active');
  dockNodes.homeSkeleton = el('div', 'map-skeleton');
  dockNodes.homeIframe = createMapFrame('Genshin Impact map');
  dockNodes.homeIframe.addEventListener('load', () => markFrameReady(dockNodes.homeFrame));
  dockNodes.homeFrame.append(el('div', 'dock-loader'), dockNodes.homeSkeleton, dockNodes.homeIframe);

  dockNodes.searchFrame = el('div', 'dock-frame');
  dockNodes.searchSkeleton = el('div', 'map-skeleton');
  dockNodes.searchIframe = createMapFrame('Genshin Impact marker search');
  dockNodes.searchIframe.addEventListener('load', () => markFrameReady(dockNodes.searchFrame));
  dockNodes.searchFrame.append(el('div', 'dock-loader'), dockNodes.searchSkeleton, dockNodes.searchIframe);

  panel.append(buildDockHeader(), buildDockBody(), dockNodes.homeFrame, dockNodes.searchFrame, buildDockFooter());
  dockNodes.dock = panel;

  dockNodes.launcher = el('button', 'map-launcher');
  dockNodes.launcher.type = 'button';
  dockNodes.launcher.addEventListener('click', () => mapDockOpen());

  document.body.append(panel, dockNodes.launcher);

  dock.wide = loadSetting('dockWide', '0') === '1';
  document.body.classList.toggle('map-wide', dock.wide);
  dock.built = true;
  renderDock();
}

languageHooks.push(renderDock);
buildDock();
