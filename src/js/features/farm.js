/* Plan farmienia: które serie książek do talentów są dziś dostępne w domenach (rotacja tygodniowa).
   Dzień w grze zmienia się o 4:00 czasu serwera; w niedzielę dostępne są wszystkie serie. */
const FARM_WIKI_URL = 'https://genshin-impact.fandom.com/wiki/Character_Talent_Material';
const FARM_RESET_HOUR = 4;
const FARM_SERVERS = [
  { id: 'eu', pl: 'Europa (UTC+1)', en: 'Europe (UTC+1)', offset: 1 },
  { id: 'na', pl: 'Ameryka (UTC-5)', en: 'America (UTC-5)', offset: -5 },
  { id: 'asia', pl: 'Azja (UTC+8)', en: 'Asia (UTC+8)', offset: 8 }
];
const FARM_REGIONS = [
  { name: 'Mondstadt', books: ['Freedom', 'Resistance', 'Ballad'] },
  { name: 'Liyue', books: ['Prosperity', 'Diligence', 'Gold'] },
  { name: 'Inazuma', books: ['Transience', 'Elegance', 'Light'] },
  { name: 'Sumeru', books: ['Admonition', 'Ingenuity', 'Praxis'] },
  { name: 'Fontaine', books: ['Equity', 'Justice', 'Order'] },
  { name: 'Natlan', books: ['Contention', 'Kindling', 'Conflict'] },
  { name: 'Nod-Krai', books: ['Moonlight', 'Elysium', 'Vagrancy'] },
  { name: 'Snezhnaya', books: ['Charity', 'Fortitude', 'Glory'] }
];
const FARM_GROUP_DAYS = [[1, 4], [2, 5], [3, 6]];
const farm = { overlay: null, dialog: null, open: false, server: 'eu' };

function farmText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function farmServer() {
  return FARM_SERVERS.find((item) => item.id === farm.server) || FARM_SERVERS[0];
}

function farmGameDay() {
  const shifted = new Date(Date.now() + (farmServer().offset - FARM_RESET_HOUR) * 3600000);
  return shifted.getUTCDay();
}

function farmGroupOf(day) {
  return FARM_GROUP_DAYS.findIndex((days) => days.includes(day));
}

function farmDayName(day, style) {
  const locale = state.lang === 'pl' ? 'pl-PL' : 'en-GB';
  return new Date(Date.UTC(2024, 0, 7 + day)).toLocaleDateString(locale, { weekday: style, timeZone: 'UTC' });
}

function farmGroupLabel(group) {
  return FARM_GROUP_DAYS[group].map((day) => farmDayName(day, 'short')).join(' / ');
}

function farmTodayLine(day, group) {
  const name = farmDayName(day, 'long');
  if (group === -1) {
    return farmText(
      'Dziś (' + name + ') są dostępne wszystkie serie książek.',
      'Today (' + name + ') every book series is available.'
    );
  }
  const books = FARM_REGIONS.map((region) => region.books[group]).join(', ');
  return farmText('Dziś (' + name + ') farmisz: ', 'Today (' + name + ') you can farm: ') + books + '.';
}

function farmBuildTable(group) {
  const table = el('table', 'farm-table');
  const head = el('tr');
  head.append(el('th', '', farmText('Region', 'Region')));
  FARM_GROUP_DAYS.forEach((days, index) => {
    head.append(el('th', index === group ? 'farm-today' : '', farmGroupLabel(index)));
  });
  table.append(head);
  FARM_REGIONS.forEach((region) => {
    const row = el('tr');
    row.append(el('td', 'stat-name', region.name));
    region.books.forEach((book, index) => {
      row.append(el('td', group === -1 || index === group ? 'farm-today' : '', book));
    });
    table.append(row);
  });
  return table;
}

function farmRender() {
  if (!farm.dialog) return;
  const day = farmGameDay();
  const group = farmGroupOf(day);
  farm.dialog.textContent = '';

  const header = el('div', 'farm-header');
  const title = el('h2', 'farm-title', farmText('📅 Plan farmienia – książki do talentów', '📅 Farming plan – talent books'));
  title.id = 'farm-title';
  const close = el('button', 'dock-close', farmText('Zamknij ✕', 'Close ✕'));
  close.type = 'button';
  close.addEventListener('click', farmClose);
  header.append(title, close);

  const serverRow = el('label', 'farm-server');
  serverRow.append(el('span', 'item-meta', farmText('Serwer gry:', 'Game server:')));
  const select = document.createElement('select');
  FARM_SERVERS.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = farmText(item.pl, item.en);
    option.selected = item.id === farm.server;
    select.append(option);
  });
  select.addEventListener('change', () => {
    farm.server = select.value;
    saveSetting('farmServer', farm.server);
    farmRender();
  });
  serverRow.append(select);

  const today = el('p', 'farm-line', farmTodayLine(day, group));
  const scroller = el('div', 'farm-scroll');
  scroller.append(farmBuildTable(group));
  const note = el('p', 'hint', farmText(
    'Dzień w grze zmienia się o 4:00 czasu serwera. Nazwy serii są po angielsku. Podświetlone komórki to serie dostępne dziś.',
    'The in-game day changes at 4:00 server time. Highlighted cells are the series available today.'
  ));
  const link = el('a', 'guide-link', farmText('↗ Które postacie używają której serii (wiki)', '↗ Which characters use which series (wiki)'));
  link.href = FARM_WIKI_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  farm.dialog.append(header, serverRow, today, scroller, note, link);
  close.focus();
}

function farmClose() {
  farm.open = false;
  farm.overlay.classList.remove('open');
  document.body.classList.remove('farm-open');
}

function farmOpen() {
  if (!farm.overlay) return;
  farm.open = true;
  farmRender();
  farm.overlay.classList.add('open');
  document.body.classList.add('farm-open');
}

function buildFarm() {
  const saved = loadSetting('farmServer', 'eu');
  farm.server = FARM_SERVERS.some((item) => item.id === saved) ? saved : 'eu';

  farm.overlay = el('div', 'farm-overlay');
  farm.dialog = el('div', 'farm-dialog');
  farm.dialog.setAttribute('role', 'dialog');
  farm.dialog.setAttribute('aria-modal', 'true');
  farm.dialog.setAttribute('aria-labelledby', 'farm-title');
  farm.overlay.append(farm.dialog);
  farm.overlay.addEventListener('click', (event) => {
    if (event.target === farm.overlay) farmClose();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && farm.open) farmClose();
  });
  document.body.append(farm.overlay);
  languageHooks.push(() => {
    if (farm.open) farmRender();
  });
}

buildFarm();
