const MAP_SOURCES = [
  { label: 'Teyvat Interactive Map', url: 'https://genshin-impact-map.appsample.com/' },
  { label: 'HoYoLAB', url: 'https://act.hoyolab.com/ys/app/interactive-map/index.html' },
  { label: 'Kongying Tavern', url: 'https://yuanshen.site/' }
];

const mapState = { open: false, current: 0, loaded: -1, timer: null, iframe: null };
const mapNodes = {};

function mapText(pl, en) {
  return gt(pl, en);
}

function applyMapTexts() {
  if (!mapNodes.title) return;
  mapNodes.title.textContent = mapText('Mapa Teyvatu – zasoby, domeny, skrzynie', 'Teyvat map – resources, domains, chests');
  mapNodes.hint.textContent = mapText(
    'To zewnętrzna mapa społeczności osadzona w ramce. Ładuje się dopiero po rozwinięciu i może pokazywać własne reklamy. Wybierz źródło poniżej.',
    'This is an external community map embedded in a frame. It only loads once expanded and may show its own ads. Pick a source below.'
  );
  mapNodes.skeleton.textContent = mapText('Ładowanie mapy...', 'Loading the map...');
  mapNodes.open.textContent = mapText('↗ Otwórz w nowej karcie', '↗ Open in a new tab');
  mapNodes.note.textContent = mapText(
    'Jeśli mapa się nie wyświetla, strona mogła zablokować osadzanie – użyj przycisku „Otwórz w nowej karcie” albo wybierz inne źródło.',
    'If the map does not show up, the site may block embedding – use the “Open in a new tab” button or pick another source.'
  );
}

function loadMapFrame() {
  const index = mapState.current;
  if (mapState.loaded === index) return;
  const source = MAP_SOURCES[index];
  mapNodes.frame.classList.remove('ready');
  mapNodes.note.classList.remove('warn');
  clearTimeout(mapState.timer);
  if (mapState.iframe) mapState.iframe.remove();

  const frame = document.createElement('iframe');
  frame.title = source.label;
  frame.referrerPolicy = 'no-referrer';
  frame.loading = 'lazy';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
  frame.addEventListener('load', () => {
    mapNodes.frame.classList.add('ready');
    clearTimeout(mapState.timer);
  });
  frame.src = source.url;
  mapNodes.frame.append(frame);
  mapState.iframe = frame;
  mapState.loaded = index;
  mapState.timer = setTimeout(() => {
    if (!mapNodes.frame.classList.contains('ready')) mapNodes.note.classList.add('warn');
  }, 12000);
}

function selectMapSource(index) {
  mapState.current = index;
  mapNodes.tabs.forEach((tab, tabIndex) => {
    tab.classList.toggle('active', tabIndex === index);
  });
  mapNodes.open.href = MAP_SOURCES[index].url;
  if (mapState.open) loadMapFrame();
}

function toggleMap() {
  mapState.open = !mapState.open;
  mapNodes.section.classList.toggle('open', mapState.open);
  mapNodes.toggle.setAttribute('aria-expanded', String(mapState.open));
  if (mapState.open) loadMapFrame();
}

function buildMapSection() {
  const section = document.getElementById('map-section');
  if (!section) return;
  mapNodes.section = section;

  const toggle = el('button', 'map-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  const label = el('span');
  label.append(el('span', 'map-pin', '📍'));
  mapNodes.title = el('span');
  label.append(mapNodes.title);
  toggle.append(label, el('span', 'map-chevron', '▾'));
  toggle.addEventListener('click', toggleMap);
  mapNodes.toggle = toggle;

  const body = el('div', 'map-body');
  const inner = el('div', 'map-body-inner');
  mapNodes.hint = el('p', 'map-note');
  inner.append(mapNodes.hint);

  const tabs = el('div', 'map-tabs');
  mapNodes.tabs = MAP_SOURCES.map((source, index) => {
    const tab = el('button', index === 0 ? 'map-tab active' : 'map-tab', source.label);
    tab.type = 'button';
    tab.addEventListener('click', () => selectMapSource(index));
    tabs.append(tab);
    return tab;
  });
  inner.append(tabs);

  const actions = el('div', 'map-actions');
  mapNodes.open = el('a', 'guide-link');
  mapNodes.open.href = MAP_SOURCES[0].url;
  mapNodes.open.target = '_blank';
  mapNodes.open.rel = 'noopener noreferrer';
  actions.append(mapNodes.open);
  inner.append(actions);

  mapNodes.frame = el('div', 'map-frame');
  mapNodes.skeleton = el('div', 'map-skeleton');
  mapNodes.frame.append(mapNodes.skeleton);
  inner.append(mapNodes.frame);

  mapNodes.note = el('p', 'map-note');
  inner.append(mapNodes.note);

  body.append(inner);
  section.append(toggle, body);
  applyMapTexts();
}

const mapLangButton = document.getElementById('lang-toggle');
if (mapLangButton) mapLangButton.addEventListener('click', applyMapTexts);
buildMapSection();
