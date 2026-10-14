/* Panel mapy: dosuwa się z prawej strony (na wąskich ekranach od dołu) i przesuwa resztę strony,
   zamiast ją zasłaniać. Pokazuje oficjalnie osadzalną mapę AppSample z filtrem typów znaczników. */
const MAP_BASE = 'https://genshin-impact-map.appsample.com/location?names=';
const MAP_OTHER = [
  ['HoYoLAB', 'https://act.hoyolab.com/ys/app/interactive-map/index.html'],
  ['Kongying Tavern', 'https://yuanshen.site/'],
  ['AppSample', 'https://genshin-impact-map.appsample.com/']
];

const BOSS_NAMES = [
  'Anemo Hypostasis', 'Cryo Regisvine', 'Electro Hypostasis', 'Oceanid', 'Pyro Regisvine', 'Geo Hypostasis',
  'Cryo Hypostasis', 'Maguu Kenki', 'Pyro Hypostasis', 'Primo Geovishap', 'Perpetual Mechanical Array',
  'Hydro Hypostasis', 'Thunder Manifestation', 'Electro Regisvine', 'Jadeplume Terrorshroom',
  'Dendro Hypostasis', 'Aeonblight Drake', 'Setekh Wenut'
].join(',');

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

const DOCK_CONTEXTS = {
  character: {
    icon: '🧑',
    pl: 'Postać',
    en: 'Character',
    hintPl: 'Domeny talentów i wzniesień oraz bossowie, z których wypadają materiały postaci. Lokalną specjalność wyszukaj po nazwie.',
    hintEn: 'Talent and ascension domains and the bosses that drop character materials. Search a local specialty by name.',
    presets: [
      { pl: 'Domeny', en: 'Domains', names: 'Domain' },
      { pl: 'Bossowie', en: 'Bosses', names: BOSS_NAMES }
    ],
    search: true
  },
  weapon: {
    icon: '⚔️',
    pl: 'Broń',
    en: 'Weapon',
    hintPl: 'Materiały do wzniesień broni wypadają z domen broni i od wrogów. Kliknij znacznik, aby zobaczyć szczegóły.',
    hintEn: 'Weapon ascension materials drop from weapon domains and enemies. Click a marker for details.',
    presets: [
      { pl: 'Domeny', en: 'Domains', names: 'Domain' },
      { pl: 'Broń w świecie', en: 'Weapons in the world', names: 'Weapon' }
    ],
    search: true
  },
  artifact: {
    icon: '🏺',
    pl: 'Artefakty',
    en: 'Artifacts',
    hintPl: 'Artefakty zdobywasz w domenach artefaktów (20 żywicy za przejście). Kliknij znacznik, aby zobaczyć, co daje dana domena.',
    hintEn: 'You get artifacts in artifact domains (20 resin per run). Click a marker to see what a domain offers.',
    presets: [
      { pl: 'Domeny', en: 'Domains', names: 'Domain' },
      { pl: 'Artefakty w świecie', en: 'Artifacts in the world', names: 'Artifact' }
    ],
    search: false
  }
};

const dock = { open: false, wide: false, context: 'character', names: 'Domain', loaded: '', timer: null, iframe: null, built: false };
const dockNodes = {};

function mapUrl(names) {
  return MAP_BASE + encodeURIComponent(names);
}

function cleanSearch(value) {
  return String(value).replace(/[^A-Za-z0-9 ,'\-().:+&!]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function renderDock() {
  if (!dock.built) return;
  const context = DOCK_CONTEXTS[dock.context];
  dockNodes.title.textContent = gt('🗺️ Mapa – gdzie to zdobyć', '🗺️ Map – where to get it');
  dockNodes.close.textContent = gt('Zamknij ✕', 'Close ✕');
  dockNodes.size.textContent = dock.wide ? '⇥' : '⇤';
  dockNodes.size.title = dock.wide ? gt('Węższy panel', 'Narrower panel') : gt('Szerszy panel', 'Wider panel');
  dockNodes.launcher.textContent = gt('🗺️ Mapa', '🗺️ Map');

  dockNodes.tabs.forEach((tab) => {
    const key = tab.dataset.context;
    tab.classList.toggle('active', key === dock.context);
    tab.textContent = DOCK_CONTEXTS[key].icon + ' ' + gt(DOCK_CONTEXTS[key].pl, DOCK_CONTEXTS[key].en);
  });

  dockNodes.hint.textContent = gt(context.hintPl, context.hintEn);
  dockNodes.chips.textContent = '';
  context.presets.forEach((preset) => {
    const chipNode = el('button', preset.names === dock.names ? 'dock-chip active' : 'dock-chip', gt(preset.pl, preset.en));
    chipNode.type = 'button';
    chipNode.addEventListener('click', () => setDockNames(preset.names));
    dockNodes.chips.append(chipNode);
  });

  dockNodes.searchForm.hidden = !context.search;
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

function mapDockOpen(contextKey) {
  if (!dock.built) return;
  if (contextKey && DOCK_CONTEXTS[contextKey] && contextKey !== dock.context) {
    dock.context = contextKey;
    dock.names = DOCK_CONTEXTS[contextKey].presets[0].names;
  }
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

function buildDockTabs() {
  const tabs = el('div', 'dock-tabs');
  dockNodes.tabs = Object.keys(DOCK_CONTEXTS).map((key) => {
    const tab = el('button', 'dock-tab');
    tab.type = 'button';
    tab.dataset.context = key;
    tab.addEventListener('click', () => mapDockOpen(key));
    tabs.append(tab);
    return tab;
  });
  return tabs;
}

function buildDockBody() {
  const body = el('div', 'dock-body');
  dockNodes.hint = el('p', 'dock-hint');
  dockNodes.chips = el('div', 'dock-chips');

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
    const value = cleanSearch(dockNodes.input.value);
    if (value) setDockNames(value);
  });
  dockNodes.searchForm.append(dockNodes.input, dockNodes.searchButton, datalist);
  body.append(dockNodes.hint, dockNodes.chips, dockNodes.searchForm);
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

  panel.append(buildDockHeader(), buildDockTabs(), buildDockBody(), dockNodes.frame, buildDockFooter());
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

const dockResult = document.getElementById('result');
if (dockResult) {
  dockResult.addEventListener('click', (event) => {
    const target = event.target;
    const card = target && typeof target.closest === 'function' ? target.closest('.character') : null;
    if (card) mapDockOpen('character');
  });
}

languageHooks.push(renderDock);
buildDock();
