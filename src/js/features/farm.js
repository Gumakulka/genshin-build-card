/* Plan farmienia: które serie książek do talentów są dziś dostępne w domenach (rotacja tygodniowa).
   Dzień w grze zmienia się o 4:00 czasu serwera; w niedzielę dostępne są wszystkie serie. Style są w farm.css. */
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

function farmChip(region, book, index) {
  const chip = el('span', 'farm-chip');
  chip.style.setProperty('--i', String(index));
  chip.append(el('small', '', region), el('b', '', book));
  return chip;
}

/* Karta „dziś”: nazwa dnia i po jednej serii z każdego regionu. W niedzielę nie ma listy, bo dostępne jest wszystko. */
function farmTodayCard(day, group) {
  const card = el('div', 'farm-today-card');
  const head = el('div', 'farm-today-head');
  const label = el('div');
  label.append(
    el('div', 'farm-today-day', farmDayName(day, 'long')),
    el('div', 'farm-today-sub', group === -1
      ? farmText('Dziś dostępne są wszystkie serie książek.', 'Every book series is available today.')
      : farmText('Dziś farmisz te serie książek:', 'You can farm these book series today:'))
  );
  head.append(icon('book-open'), label);
  card.append(head);

  if (group !== -1) {
    const chips = el('div', 'farm-chips');
    FARM_REGIONS.forEach((region, index) => chips.append(farmChip(region.name, region.books[group], index)));
    card.append(chips);
  }
  return card;
}

function farmBuildTable(group) {
  const table = el('table', 'farm-table');
  const head = el('tr');
  head.append(el('th', '', farmText('Region', 'Region')));
  FARM_GROUP_DAYS.forEach((days, index) => {
    const cell = el('th', index === group ? 'farm-today' : '', farmGroupLabel(index));
    if (index === group) cell.append(el('span', 'farm-badge', farmText('dziś', 'today')));
    head.append(cell);
  });
  table.append(head);
  FARM_REGIONS.forEach((region, regionIndex) => {
    const row = el('tr');
    row.style.setProperty('--i', String(regionIndex));
    row.append(el('td', 'farm-region', region.name));
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
  const title = el('h2', 'farm-title');
  title.id = 'farm-title';
  title.append(icon('calendar-days'), document.createTextNode(farmText('Plan farmienia', 'Farming plan')));
  const close = el('button', 'farm-close');
  close.type = 'button';
  close.append(icon('x'), document.createTextNode(farmText('Zamknij', 'Close')));
  close.addEventListener('click', farmClose);
  header.append(title, close);

  const sub = el('p', 'farm-subtitle', farmText('Książki do talentów w domenach', 'Talent books in domains'));

  const serverRow = el('label', 'farm-server');
  serverRow.append(icon('server'), el('span', '', farmText('Serwer gry', 'Game server')));
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

  const scroller = el('div', 'farm-scroll');
  scroller.append(farmBuildTable(group));
  const note = el('p', 'farm-note', farmText(
    'Dzień w grze zmienia się o 4:00 czasu serwera. Nazwy serii są po angielsku. Podświetlone komórki to serie dostępne dziś.',
    'The in-game day changes at 4:00 server time. Highlighted cells are the series available today.'
  ));
  const link = el('a', 'guide-link');
  link.append(icon('external-link'), document.createTextNode(farmText('Które postacie używają której serii (wiki)', 'Which characters use which series (wiki)')));
  link.href = FARM_WIKI_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  farm.dialog.append(header, sub, serverRow, farmTodayCard(day, group), scroller, note, link);
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
