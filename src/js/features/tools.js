/* Narzędzia w menu głównym: kalkulator talentów oraz żywica z odliczaniem do resetów serwera.
   Dodaje kafelki do ekranu startowego menu i własne widoki. Wszystko liczy się w przeglądarce. Ładowany po hub.js. */
const RESIN_MAX = 200;
const RESIN_MS = 8 * 60 * 1000;
const RESIN_KEY = 'resin';
const SERVER_KEY = 'server';
const SERVERS = [
  ['Europe', 'Europa', 1],
  ['America', 'Ameryka', -5],
  ['Asia', 'Azja', 8],
  ['TW', 'TW, HK, MO', 8]
];

/* Koszt wejścia na dany poziom talentu: [mora, książki, zwykłe materiały, tygodniowe, korona].
   Książki i materiały mają postać [poziom jakości, ilość]. */
const TALENT_COSTS = {
  2: [12500, [1, 3], [1, 6], 0, 0],
  3: [17500, [2, 2], [2, 3], 0, 0],
  4: [25000, [2, 4], [2, 4], 0, 0],
  5: [30000, [2, 6], [2, 6], 0, 0],
  6: [37500, [2, 9], [2, 9], 0, 0],
  7: [120000, [3, 4], [3, 4], 1, 0],
  8: [260000, [3, 6], [3, 6], 1, 0],
  9: [450000, [3, 12], [3, 9], 2, 0],
  10: [700000, [3, 16], [3, 12], 2, 1]
};

const tools = { timer: null, talents: [[1, 10], [1, 10], [1, 10]] };

function talentTotals(ranges) {
  const total = { mora: 0, books: [0, 0, 0], common: [0, 0, 0], weekly: 0, crown: 0 };
  ranges.forEach(([from, to]) => {
    for (let level = from + 1; level <= to; level += 1) {
      const cost = TALENT_COSTS[level];
      total.mora += cost[0];
      total.books[cost[1][0] - 1] += cost[1][1];
      total.common[cost[2][0] - 1] += cost[2][1];
      total.weekly += cost[3];
      total.crown += cost[4];
    }
  });
  return total;
}

function toolsNumber(value) {
  return Number(value).toLocaleString(state.lang === 'pl' ? 'pl-PL' : 'en-GB');
}

function toolsLevelSelect(value) {
  const select = document.createElement('select');
  for (let level = 1; level <= 10; level += 1) {
    const option = document.createElement('option');
    option.value = String(level);
    option.textContent = String(level);
    select.append(option);
  }
  select.value = String(value);
  return select;
}

function renderTalentResult(box) {
  const total = talentTotals(tools.talents);
  box.replaceChildren(el('h5', '', hubText('Potrzebne materiały', 'Materials needed')));
  const rows = [
    [hubText('Mora', 'Mora'), toolsNumber(total.mora)],
    [hubText('Nauki (2★)', 'Teachings (2★)'), toolsNumber(total.books[0])],
    [hubText('Wskazówki (3★)', 'Guides (3★)'), toolsNumber(total.books[1])],
    [hubText('Filozofie (4★)', 'Philosophies (4★)'), toolsNumber(total.books[2])],
    [hubText('Materiały wrogów, poziom 1', 'Enemy drops, tier 1'), toolsNumber(total.common[0])],
    [hubText('Materiały wrogów, poziom 2', 'Enemy drops, tier 2'), toolsNumber(total.common[1])],
    [hubText('Materiały wrogów, poziom 3', 'Enemy drops, tier 3'), toolsNumber(total.common[2])],
    [hubText('Materiał z bossa tygodniowego', 'Weekly boss material'), toolsNumber(total.weekly)],
    [hubText('Korona wiedzy', 'Crown of Insight'), toolsNumber(total.crown)]
  ];
  rows.forEach(([name, value]) => box.append(statRow(name, value)));
}

function renderTalents() {
  hub.title.textContent = hubText('Kalkulator talentów', 'Talent calculator');
  const wrapper = el('div', 'tool');
  wrapper.append(el('p', 'hub-intro', hubText(
    'Wybierz obecny i docelowy poziom każdego talentu. Koszty dotyczą jednej postaci.',
    'Pick the current and target level of each talent. Costs are for one character.'
  )));
  const names = [
    hubText('Atak zwykły', 'Normal attack'),
    hubText('Umiejętność żywiołu', 'Elemental skill'),
    hubText('Wybuch żywiołu', 'Elemental burst')
  ];
  const result = el('div', 'panel');
  const inputs = el('div', 'panel');
  inputs.append(el('h5', '', hubText('Poziomy talentów', 'Talent levels')));
  names.forEach((name, index) => {
    const row = el('div', 'tool-row');
    const from = toolsLevelSelect(tools.talents[index][0]);
    const to = toolsLevelSelect(tools.talents[index][1]);
    const sync = () => {
      tools.talents[index] = [Number(from.value), Math.max(Number(from.value), Number(to.value))];
      to.value = String(tools.talents[index][1]);
      renderTalentResult(result);
    };
    from.addEventListener('change', sync);
    to.addEventListener('change', sync);
    from.setAttribute('aria-label', name + ' ' + hubText('od', 'from'));
    to.setAttribute('aria-label', name + ' ' + hubText('do', 'to'));
    row.append(el('span', 'tool-name', name), from, el('span', 'tool-arrow', '→'), to);
    inputs.append(row);
  });
  renderTalentResult(result);
  wrapper.append(inputs, result);
  hub.body.replaceChildren(wrapper);
}

function resinSaved() {
  const saved = loadJsonSetting(RESIN_KEY, null);
  if (!saved || typeof saved.value !== 'number' || typeof saved.at !== 'number') return null;
  return saved;
}

function resinNow(saved) {
  return Math.min(RESIN_MAX, saved.value + Math.max(0, Math.floor((Date.now() - saved.at) / RESIN_MS)));
}

function resinSet(value) {
  const clean = Math.max(0, Math.min(RESIN_MAX, Math.round(value)));
  saveJsonSetting(RESIN_KEY, { value: clean, at: Date.now() });
}

function resinAdjust(delta) {
  const saved = resinSaved();
  if (!saved) return;
  const current = resinNow(saved);
  const next = Math.max(0, Math.min(RESIN_MAX, current + delta));
  const keepProgress = current < RESIN_MAX && next < RESIN_MAX;
  const at = keepProgress ? Date.now() - ((Date.now() - saved.at) % RESIN_MS) : Date.now();
  saveJsonSetting(RESIN_KEY, { value: next, at });
}

function toolsSpan(ms) {
  const minutes = Math.max(0, Math.ceil(ms / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  const parts = [];
  if (days) parts.push(days + (state.lang === 'pl' ? ' d' : ' d'));
  parts.push(hours + ' h', rest + ' min');
  return parts.join(' ');
}

function toolsNextReset(offsetHours, weekly) {
  const now = Date.now() + offsetHours * 3600000;
  const date = new Date(now);
  let target;
  if (weekly) {
    const ahead = (8 - date.getUTCDay()) % 7;
    target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + ahead, 4);
    if (target <= now) target += 7 * 86400000;
  } else {
    target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 4);
    if (target <= now) target += 86400000;
  }
  return target - now;
}

function renderResin() {
  hub.title.textContent = hubText('Żywica i resety', 'Resin and resets');
  const wrapper = el('div', 'tool');

  const resinPanel = el('div', 'panel');
  resinPanel.append(el('h5', '', hubText('Żywica', 'Resin')));
  const big = el('div', 'tool-big');
  const eta = el('div', 'item-meta');
  const controls = el('div', 'tool-controls');
  const field = document.createElement('input');
  field.type = 'number';
  field.min = '0';
  field.max = String(RESIN_MAX);
  field.inputMode = 'numeric';
  field.placeholder = hubText('Aktualna żywica', 'Current resin');
  const setButton = el('button', 'action-button', hubText('Ustaw', 'Set'));
  setButton.type = 'button';
  controls.append(field, setButton);
  const quick = el('div', 'tool-controls');
  [-20, -40, -60, 60].forEach((delta) => {
    const button = el('button', 'action-button', (delta > 0 ? '+' : '−') + Math.abs(delta));
    button.type = 'button';
    button.addEventListener('click', () => {
      resinAdjust(delta);
      update();
    });
    quick.append(button);
  });
  resinPanel.append(big, eta, controls, quick);

  const resetPanel = el('div', 'panel');
  resetPanel.append(el('h5', '', hubText('Resety serwera', 'Server resets')));
  const select = document.createElement('select');
  SERVERS.forEach(([id, plName, offset]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = state.lang === 'pl' ? plName : id === 'Europe' ? 'Europe' : id === 'America' ? 'America' : id === 'Asia' ? 'Asia' : 'TW, HK, MO';
    option.dataset.offset = String(offset);
    select.append(option);
  });
  select.value = SERVERS.some((server) => server[0] === loadSetting(SERVER_KEY, 'Europe')) ? loadSetting(SERVER_KEY, 'Europe') : 'Europe';
  select.setAttribute('aria-label', hubText('Serwer', 'Server'));
  const daily = el('div');
  const weekly = el('div');
  resetPanel.append(select, daily, weekly);

  function update() {
    const saved = resinSaved();
    if (!saved) {
      big.textContent = '– / ' + RESIN_MAX;
      eta.textContent = hubText('Wpisz aktualną ilość żywicy.', 'Enter your current resin.');
    } else {
      const current = resinNow(saved);
      big.textContent = current + ' / ' + RESIN_MAX;
      if (current >= RESIN_MAX) {
        eta.textContent = hubText('Żywica jest pełna.', 'Resin is full.');
      } else {
        const left = saved.at + (RESIN_MAX - saved.value) * RESIN_MS - Date.now();
        const time = new Date(Date.now() + left).toLocaleTimeString(state.lang === 'pl' ? 'pl-PL' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
        eta.textContent = hubText('Pełna za ', 'Full in ') + toolsSpan(left) + hubText(' (o ', ' (at ') + time + ')';
      }
    }
    const offset = Number(select.selectedOptions[0].dataset.offset);
    daily.textContent = hubText('Reset dzienny za ', 'Daily reset in ') + toolsSpan(toolsNextReset(offset, false));
    weekly.textContent = hubText('Reset tygodniowy za ', 'Weekly reset in ') + toolsSpan(toolsNextReset(offset, true));
  }

  setButton.addEventListener('click', () => {
    if (field.value === '') return;
    resinSet(Number(field.value));
    field.value = '';
    update();
  });
  select.addEventListener('change', () => {
    saveSetting(SERVER_KEY, select.value);
    update();
  });

  wrapper.append(resinPanel, resetPanel);
  hub.body.replaceChildren(wrapper);
  update();
  tools.timer = setInterval(update, 30000);
}

const toolsBaseHome = hubHome;
hubHome = function () {
  toolsBaseHome();
  const tiles = hub.body.querySelector('.hub-tiles');
  if (!tiles) return;
  tiles.append(
    hubButton('hub-tile', hubText('Kalkulator talentów', 'Talent calculator'), 'calculator', () => hubGo({ type: 'tool', id: 'talents' })),
    hubButton('hub-tile', hubText('Żywica i resety', 'Resin and resets'), 'timer', () => hubGo({ type: 'tool', id: 'resin' }))
  );
};

const toolsBaseRender = hubRender;
hubRender = function () {
  clearInterval(tools.timer);
  if (hub.view.type !== 'tool') {
    toolsBaseRender();
    return;
  }
  hub.seq += 1;
  hub.root.removeAttribute('data-element');
  hub.back.hidden = false;
  hub.close.replaceChildren(icon('x'), document.createTextNode(hubText('Zamknij', 'Close')));
  hub.back.replaceChildren(icon('arrow-left'), document.createTextNode(hubText('Wróć', 'Back')));
  if (hub.view.id === 'talents') renderTalents();
  else renderResin();
  hub.body.scrollTop = 0;
};

const toolsBaseClose = closeHub;
closeHub = function () {
  clearInterval(tools.timer);
  toolsBaseClose();
};
