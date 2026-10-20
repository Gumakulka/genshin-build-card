/* Księga postaci: dane z Project Amber, talenty z realnymi mnożnikami, konstelacje i brakujące materiały.
   Wszystkie teksty trafiają do strony przez textContent, a znaczniki opisów są zamieniane na bezpieczne klasy. Ładowany po app.js. */
const CODEX_MAX_LEVEL = 15;
const CODEX_TARGET_LEVEL = 10;
const CODEX_KEY_COLOR = 'FFD780';
const CODEX_SOURCE_URL = 'https://gi.yatta.moe/';

function codexText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function codexNumber(value) {
  return Number(value).toLocaleString(state.lang === 'pl' ? 'pl-PL' : 'en-GB');
}

/* Szablony w stylu „1-Hit DMG|{param1:F1P}”: numer parametru liczony od 1, F2 to dwa miejsca po przecinku, P to procent, I to liczba całkowita. */
function codexFormat(template, params) {
  return String(template).replace(/\{param(\d+):([A-Za-z0-9]+)\}/g, (match, index, format) => {
    const value = (params || [])[Number(index) - 1];
    if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
    if (format === 'I') return String(Math.round(value));
    const percent = /P$/.test(format);
    const digits = /^F(\d)/.exec(format);
    const places = digits ? Number(digits[1]) : (percent ? 0 : 1);
    return (percent ? value * 100 : value).toFixed(places) + (percent ? '%' : '');
  });
}

function codexRows(talent, level) {
  const entry = talent.levels && talent.levels[String(level)];
  if (!entry) return [];
  return (talent.labels || []).map((line) => {
    const cut = line.indexOf('|');
    return cut < 0 ? null : [line.slice(0, cut), codexFormat(line.slice(cut + 1), entry.p)];
  }).filter((row) => row && row[0]);
}

function codexPlain(text) {
  return String(text || '').replace(/\\n/g, '\n').replace(/<[^>]*>/g, '');
}

function codexMarkup(text) {
  const fragment = document.createDocumentFragment();
  const stack = [];
  String(text || '').replace(/\\n/g, '\n').split(/(<color=#[0-9A-Fa-f]{6,8}>|<\/color>|<i>|<\/i>)/).forEach((part) => {
    if (!part) return;
    const color = /^<color=#([0-9A-Fa-f]{6})/.exec(part);
    if (color) {
      stack.push(color[1].toUpperCase() === CODEX_KEY_COLOR ? 'codex-key' : 'codex-elem');
      return;
    }
    if (part === '<i>') {
      stack.push('codex-lore');
      return;
    }
    if (part === '</color>' || part === '</i>') {
      stack.pop();
      return;
    }
    const clean = part.replace(/<[^>]*>/g, '');
    if (clean) fragment.append(el('span', stack.join(' '), clean));
  });
  return fragment;
}

function codexBirthday(birthday) {
  if (!Array.isArray(birthday) || !birthday[0] || !birthday[1]) return '';
  return new Date(2000, birthday[0] - 1, birthday[1]).toLocaleDateString(state.lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long' });
}

function codexChip(iconName, label, value) {
  const node = el('span', 'chip');
  node.append(icon(iconName), el('span', 'chip-label', label), el('span', 'chip-value', value));
  return node;
}

/* Poziom talentu z gabloty: poziom bazowy plus bonus z konstelacji (te same dane, których używa panel „Talenty”). */
function codexLevels(data, details, character) {
  const levels = details.skillLevelMap || {};
  const order = (character && character.SkillOrder) || [];
  const proud = (character && character.ProudMap) || {};
  const extra = details.proudSkillExtraLevelMap || {};
  const active = data.talents.filter((talent) => talent.active).sort((a, b) => Number(a.key) - Number(b.key));

  return active.map((talent, index) => {
    const id = levels[talent.skillId] !== undefined ? talent.skillId : order[index];
    const base = Number(levels[id]);
    const bonus = Number(extra[proud[id]]) || 0;
    return { talent, base: Number.isFinite(base) && base > 0 ? base : null, bonus };
  });
}

function codexAdd(target, cost) {
  Object.keys(cost || {}).forEach((id) => {
    target[id] = (target[id] || 0) + cost[id];
  });
}

/* Brakujące materiały: wzniesienia postaci powyżej obecnego etapu oraz talenty od poziomu bazowego do 10. */
function codexMissing(data, details, entries) {
  const ascension = { items: {}, mora: 0 };
  const talents = { items: {}, mora: 0 };
  const phase = Number(details.propMap && details.propMap['1002'] && details.propMap['1002'].val);

  if (Number.isFinite(phase)) {
    data.promote.forEach((step) => {
      if (step.level > phase) {
        codexAdd(ascension.items, step.c);
        ascension.mora += step.m || 0;
      }
    });
  }

  entries.forEach((entry) => {
    if (entry.base === null) return;
    for (let level = entry.base + 1; level <= CODEX_TARGET_LEVEL; level += 1) {
      const step = entry.talent.levels[String(level)];
      if (!step) continue;
      codexAdd(talents.items, step.c);
      talents.mora += step.m || 0;
    }
  });

  return { ascension, talents };
}

/* Region, urodziny i ulubiona potrawa. */
function codexInfo(data) {
  const row = el('div', 'chips codex-info');
  const place = data.native || data.region;
  const birthday = codexBirthday(data.birthday);

  if (place) row.append(codexChip('map-pin', codexText('Region', 'Region'), place));
  if (birthday) row.append(codexChip('cake', codexText('Urodziny', 'Birthday'), birthday));
  if (data.food && data.food.name) {
    const food = codexChip('utensils', codexText('Potrawa', 'Special dish'), data.food.name);
    food.prepend(codexIcon(data.food.icon, data.food.name, 'codex-food-icon'));
    row.append(food);
  }
  return row;
}

function codexTalentBlock(entry) {
  const { talent, base, bonus } = entry;
  const block = el('details', 'codex-talent');
  const head = el('summary', 'codex-talent-head');
  head.append(codexIcon(talent.icon, talent.name, 'codex-talent-icon'), el('span', 'codex-talent-name', talent.name));

  let total = null;
  if (base !== null) {
    total = Math.min(CODEX_MAX_LEVEL, base + bonus);
    head.append(el('span', 'codex-level', 'Lv. ' + total + (bonus ? ' (' + base + '+' + bonus + ')' : '')));
  }
  block.append(head);

  const body = el('div', 'codex-body');
  const rows = total === null ? [] : codexRows(talent, total);
  if (rows.length) {
    const table = el('table', 'codex-table');
    rows.forEach(([label, value]) => {
      const row = el('tr');
      row.append(el('td', '', label), el('td', '', value));
      table.append(row);
    });
    body.append(table);
  }
  const description = el('div', 'codex-desc');
  description.append(codexMarkup(talent.description));
  body.append(description);
  block.append(body);
  return block;
}

function codexConstellations(data, unlocked) {
  const wrapper = el('div');
  const row = el('div', 'codex-consts');
  const detail = el('div', 'codex-const-detail');
  const buttons = [];

  data.constellations.forEach((entry, index) => {
    const button = el('button', 'codex-const' + (index < unlocked ? '' : ' locked'));
    button.type = 'button';
    button.title = entry.name + ' - ' + codexPlain(entry.description).slice(0, 280);
    button.setAttribute('aria-label', 'C' + (index + 1) + ': ' + entry.name);
    button.append(codexIcon(entry.icon, entry.name));
    button.addEventListener('click', () => {
      buttons.forEach((node) => node.classList.remove('active'));
      button.classList.add('active');
      const description = el('div', 'codex-desc');
      description.append(codexMarkup(entry.description));
      detail.replaceChildren(el('div', 'codex-const-name', 'C' + (index + 1) + ' \u00b7 ' + entry.name), description);
    });
    buttons.push(button);
    row.append(button);
  });

  wrapper.append(row, detail);
  return wrapper;
}

function codexMaterials(group, data) {
  const ids = Object.keys(group.items).sort((a, b) => Number(a) - Number(b));
  if (!ids.length && !group.mora) return el('p', 'hint', codexText('Nic nie brakuje.', 'Nothing missing.'));

  const wrapper = el('div');
  const grid = el('div', 'codex-mats');
  ids.forEach((id) => {
    const item = data.items[id] || { name: id, icon: '' };
    const cell = el('div', 'codex-mat');
    cell.title = item.name;
    cell.append(codexIcon(item.icon, item.name), el('span', 'codex-mat-count', '\u00d7' + codexNumber(group.items[id])));
    grid.append(cell);
  });
  wrapper.append(grid);

  if (group.mora) {
    const mora = el('div', 'codex-mora');
    if (data.items['202']) mora.append(codexIcon(data.items['202'].icon, 'Mora'));
    mora.append(el('span', '', codexNumber(group.mora) + ' Mora'));
    wrapper.append(mora);
  }
  return wrapper;
}

function codexRender(box, data, details, character) {
  const entries = codexLevels(data, details, character);
  const missing = codexMissing(data, details, entries);
  const unlocked = (details.talentIdList || []).length;

  const talents = el('div', 'panel');
  talents.append(el('h5', '', codexText('Talenty i ich wartości', 'Talents and their values')));
  entries.forEach((entry) => talents.append(codexTalentBlock(entry)));

  const consts = el('div', 'panel');
  consts.append(el('h5', '', codexText('Konstelacje', 'Constellations')), codexConstellations(data, unlocked));

  const mats = el('div', 'panel');
  mats.append(
    el('h5', '', codexText('Brakujące materiały', 'Missing materials')),
    el('div', 'codex-sub', codexText('Wzniesienie postaci', 'Character ascension')),
    codexMaterials(missing.ascension, data),
    el('div', 'codex-sub', codexText('Talenty do poziomu 10', 'Talents to level 10')),
    codexMaterials(missing.talents, data)
  );

  const grid = el('div', 'detail-grid');
  const left = el('div', 'column');
  const right = el('div', 'column');
  left.append(talents);
  right.append(consts, mats);
  grid.append(left, right);

  const source = el('p', 'codex-source');
  const link = el('a', '', 'Project Amber');
  link.href = CODEX_SOURCE_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  source.append(document.createTextNode(codexText('Opisy i grafiki: ', 'Descriptions and art: ')), link);

  box.replaceChildren(codexInfo(data), grid, source);
}

function buildCodexPanel(details, character) {
  const box = el('section', 'codex');
  const cached = codexCache.get(String(details.avatarId));

  if (cached) {
    codexRender(box, cached, details, character);
    return box;
  }

  box.append(loadingNode(codexText('Ładowanie księgi postaci...', 'Loading character codex...')));
  loadCodex(details.avatarId).then((data) => {
    if (data) codexRender(box, data, details, character);
    else box.replaceChildren(el('p', 'hint', codexText('Brak dodatkowych danych dla tej postaci.', 'No extra data for this character.')));
  });
  return box;
}

function codexAttach() {
  const box = state.detailBox;
  if (!box || !state.last) return;
  const head = box.querySelector('.detail-head');
  const details = findDetails(state.last.data, state.selectedId);
  if (!head || !details) return;
  head.after(buildCodexPanel(details, state.last.store.characters[details.avatarId]));
}

const codexBaseRenderDetail = renderDetail;
renderDetail = function () {
  codexBaseRenderDetail();
  codexAttach();
};

if (state.last && state.detailBox) renderDetail();
