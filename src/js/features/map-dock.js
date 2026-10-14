/* Panel mapy: dosuwa się z prawej strony (na wąskich ekranach od dołu) i przesuwa resztę strony,
   zamiast ją zasłaniać. Pokazuje oficjalnie osadzalną mapę AppSample z wyszukiwarką znaczników. */
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

const dock = { open: false, wide: false, names: '', loaded: null, timer: null, iframe: null, built: false };
const dockNodes = {};

function mapUrl(names) {
  return names ? MAP_BASE + encodeURIComponent(names) : MAP_HOME;
}

function cleanSearch(value) {
  return String(value).replace(/[^A-Za-z0-9 ,'\-().:+&!]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function renderDock() {
  if (!dock.built) return;
  dockNodes.title.textContent = gt('🗺️ Mapa', '🗺️ Map');
  dockNodes.close.textContent = gt('Zamknij ✕', 'Close ✕');
  dockNodes.size.textContent = dock.wide ? '⇥' : '⇤';
  dockNodes.size.title = dock.wide ? gt('Węższy panel', 'Narrower panel') : gt('Szerszy panel', 'Wider panel');
  dockNodes.launcher.textContent = gt('🗺️ Mapa', '🗺️ Map');

  dockNodes.hint.textContent = gt(
    'Wyszukaj znacznik po angielskiej nazwie, np. Cecilia. Puste pole pokazuje całą mapę. Kliknij znacznik, aby zobaczyć szczegóły.',
    'Search a marker by its English name, e.g. Cecilia. An empty field shows the whole map. Click a marker for details.'
  );
  dockNodes.input.placeholder = gt('Szukaj na mapie, np. Cecilia', 'Search the map, e.g. Cecilia');
  dockNodes.searchButton.textContent = gt('Szukaj', 'Search');
  dockNodes.skeleton.textContent = gt('Ładowanie mapy...', 'Loading the map...');
  dockNodes.note.textContent = gt(
    'Mapa pochodzi z AppSample. Znaczniki w bazie kończą się na Sumeru – nowsze regiony mogą nie mieć ich wcale. Jeśli mapa się nie pokazuje, otwórz ją w nowej karcie.',
    'The map comes from AppSample. The marker database ends at Sumeru – newer regions may have no markers. If the map does not show, open it in a new tab.'
  );
  dockNodes.open.textContent = gt('↗ Otwórz w nowej karcie', '↗ Open in a new tab');
  dockNodes.open.href = mapUrl(dock.names);
}

function setDockNames(names) {
  dock.names = names;
  renderDock();
  if (dock.open) loadDockMap();
}

function loadDockMap() {
  if (dock.loaded === dock.names) return;
  dock.loaded = dock.names;
  dockNodes.frame.classList.remove('ready');
  dockNodes.note.classList.remove('warn');
  clearTimeout(dock.timer);

  if (!dock.iframe) {
    const frame = document.createElement('iframe');
    frame.title = 'Genshin map';
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    frame.addEventListener('load', () => {
      dockNodes.frame.classList.add('ready');
      clearTimeout(dock.timer);
    });
    dockNodes.frame.append(frame);
    dock.iframe = frame;
  }
  dock.iframe.src = mapUrl(dock.names);
  dock.timer = setTimeout(() => {
    if (!dockNodes.frame.classList.contains('ready')) dockNodes.note.classList.add('warn');
  }, 12000);
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
  renderDock();
  loadDockMap();
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
  dockNodes.title = el('span');
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
    setDockNames(cleanSearch(dockNodes.input.value));
  });
  dockNodes.searchForm.append(dockNodes.input, dockNodes.searchButton, datalist);
  body.append(dockNodes.hint, dockNodes.searchForm);
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
  const panel = el('aside', 'map-dock');
  panel.setAttribute('aria-label', 'Map');
  panel.setAttribute('aria-hidden', 'true');

  dockNodes.frame = el('div', 'dock-frame');
  dockNodes.skeleton = el('div', 'map-skeleton');
  dockNodes.frame.append(el('div', 'dock-loader'), dockNodes.skeleton);

  panel.append(buildDockHeader(), buildDockBody(), dockNodes.frame, buildDockFooter());
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
