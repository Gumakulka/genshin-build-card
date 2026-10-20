/* Karta postaci w stylu gabloty: grafika postaci, konstelacje, talenty, broń, statystyki i artefakty w jednym widoku.
   Kolor całej strony zależy od żywiołu otwartej postaci. Dane z Enki, uzupełniane później grafikami z Project Amber.
   Konstelacje i talenty są przyciskami: dotknięcie pokazuje opis, bo na telefonie nie ma dymków po najechaniu. Ładowany po codex.js. */
const SHOWCASE_SPLASH = IMG_URL + 'UI_Gacha_AvatarImg_';
const SHOWCASE_COMPACT_KEY = 'compact';
const SHOWCASE_ELEMENTS = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Wind', 'Rock'];
const SHOWCASE_PROPS = {
  FIGHT_PROP_HP: 'HP',
  FIGHT_PROP_HP_PERCENT: 'HP%',
  FIGHT_PROP_ATTACK: 'ATK',
  FIGHT_PROP_BASE_ATTACK: 'ATK',
  FIGHT_PROP_ATTACK_PERCENT: 'ATK%',
  FIGHT_PROP_DEFENSE: 'DEF',
  FIGHT_PROP_DEFENSE_PERCENT: 'DEF%',
  FIGHT_PROP_ELEMENT_MASTERY: 'EM',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'ER',
  FIGHT_PROP_CRITICAL: 'CRIT Rate',
  FIGHT_PROP_CRITICAL_HURT: 'CRIT DMG',
  FIGHT_PROP_HEAL_ADD: 'Heal',
  FIGHT_PROP_PHYSICAL_ADD_HURT: 'Phys DMG'
};

function showcaseText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function showcaseCompact() {
  const saved = loadSetting(SHOWCASE_COMPACT_KEY, '');
  if (saved) return saved === '1';
  return Boolean(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
}

function showcaseProp(prop) {
  if (SHOWCASE_PROPS[prop]) return SHOWCASE_PROPS[prop];
  return /_ADD_HURT$/.test(prop) ? 'DMG' : propName(prop);
}

function showcaseSetElement(element) {
  const root = document.documentElement;
  if (SHOWCASE_ELEMENTS.includes(element)) root.dataset.element = element;
  else delete root.dataset.element;
}

function showcaseArtName(character) {
  const match = /^UI_AvatarIcon_Side_([A-Za-z0-9_]{1,40})$/.exec((character && character.SideIconName) || '');
  return match ? match[1] : null;
}

function showcaseLevel(details, shown) {
  const props = details.propMap || {};
  const level = Number(props['4001'] && props['4001'].val) || (shown ? Number(shown.level) : 0);
  const phase = Number(props['1002'] && props['1002'].val);
  return { level, cap: Number.isFinite(phase) ? GUIDE_CAPS[Math.min(phase, GUIDE_CAPS.length - 1)] : 90 };
}

function showcaseHeader(details, character, store, data, refs) {
  const shown = (data.playerInfo.showAvatarInfoList || []).find((item) => String(item.avatarId) === String(details.avatarId));
  const { level, cap } = showcaseLevel(details, shown);
  const head = el('div', 'sc-head');
  head.append(el('h4', 'sc-name', getCharacterName(character, store)));
  refs.title = el('div', 'sc-title');
  head.append(refs.title, el('div', 'sc-level', 'Lv. ' + level + ' / ' + cap));

  const friendship = details.fetterInfo && details.fetterInfo.expLevel;
  if (friendship) {
    const friend = el('div', 'sc-friend');
    friend.title = showcaseText('Poziom przyjaźni', 'Friendship level');
    friend.append(icon('heart'), document.createTextNode(String(friendship)));
    head.append(friend);
  }
  return head;
}

function showcaseButton(className, label, info, refs) {
  const node = el('button', className);
  node.type = 'button';
  node.title = label;
  node.setAttribute('aria-label', label);
  node.info = info;
  node.addEventListener('click', () => showcaseShowInfo(refs, node));
  return node;
}

function showcaseShowInfo(refs, node) {
  const wasActive = node.classList.contains('active');
  refs.consts.concat(refs.talents).forEach((other) => other.classList.remove('active'));

  if (wasActive) {
    refs.info.hidden = true;
    return;
  }

  node.classList.add('active');
  const info = node.info || {};
  const head = el('div', 'sc-info-head');
  head.append(el('strong', '', info.title || ''), el('span', 'sc-info-meta', info.meta || ''));
  const body = el('div', 'sc-info-body');

  if (info.rows && info.rows.length) {
    const table = el('div', 'sc-info-rows');
    info.rows.forEach(([label, value]) => {
      const row = el('div', 'sc-info-row');
      row.append(el('span', '', label), el('b', '', value));
      table.append(row);
    });
    body.append(table);
  }

  if (info.text) {
    const text = el('div', 'sc-info-text');
    text.append(codexMarkup(info.text));
    body.append(text);
  }

  refs.info.replaceChildren(head, body);
  refs.info.hidden = false;
}

function showcaseConsts(unlocked, refs) {
  const column = el('div', 'sc-consts');
  refs.consts = [];
  for (let index = 0; index < 6; index += 1) {
    const open = index < unlocked;
    const status = open ? showcaseText('odblokowana', 'unlocked') : showcaseText('zablokowana', 'locked');
    const node = showcaseButton('sc-const' + (open ? ' on' : ''), 'C' + (index + 1) + ' (' + status + ')', { title: 'C' + (index + 1), meta: status, text: '', rows: [] }, refs);
    node.append(icon(open ? 'sparkles' : 'lock'));
    refs.consts.push(node);
    column.append(node);
  }
  return column;
}

function showcaseTalents(details, character, refs) {
  const column = el('div', 'sc-talents');
  const order = (character && character.SkillOrder) || [];
  const levels = details.skillLevelMap || {};
  const proud = (character && character.ProudMap) || {};
  const extra = details.proudSkillExtraLevelMap || {};
  refs.talents = [];

  order.slice(0, 3).forEach((id) => {
    const base = Number(levels[id]);
    if (!Number.isFinite(base)) return;
    const bonus = Number(extra[proud[id]]) || 0;
    const label = 'Lv. ' + (base + bonus) + (bonus ? ' (' + base + '+' + bonus + ')' : '');
    const node = showcaseButton('sc-talent' + (bonus ? ' boosted' : ''), label, { title: showcaseText('Talent', 'Talent'), meta: label, text: '', rows: [] }, refs);
    node.append(el('span', 'sc-talent-level', String(base + bonus)));
    refs.talents.push(node);
    column.append(node);
  });
  return column;
}

function showcaseWeapon(items, store) {
  const item = findWeapon(items);
  if (!item) return null;

  const flat = item.flat;
  const weapon = item.weapon || {};
  const rarity = flat.rankLevel || 3;
  const caps = rarity <= 2 ? GUIDE_LOW_WEAPON_CAPS : GUIDE_CAPS;
  const cap = caps[Math.min(Number(weapon.promoteLevel) || 0, caps.length - 1)];
  const affix = weapon.affixMap ? Object.values(weapon.affixMap)[0] : 0;
  const hash = flat.nameTextMapHash !== undefined ? flat.nameTextMapHash : flat.nameTextHashMap;

  const box = el('div', 'sc-weapon');
  box.append(createImage(flat.icon, 'Weapon', 'sc-weapon-icon'));
  const info = el('div', 'sc-weapon-info');
  info.append(el('div', 'sc-weapon-name', localized(hash, store) || t('weapon')));
  const chips = el('div', 'sc-chips');
  (flat.weaponStats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (stat && stat.prop) chips.append(el('span', 'sc-chip', showcaseProp(stat.prop) + ' ' + formatStat(stat.prop, stat.value)));
  });
  chips.append(el('span', 'sc-chip gold', 'R' + ((affix || 0) + 1)), el('span', 'sc-chip', 'Lv. ' + (weapon.level || '?') + ' / ' + cap));
  info.append(chips);
  box.append(info);
  return box;
}

function showcaseStats(details) {
  const props = details.fightPropMap || {};
  const bases = [1, 4, 7];
  const list = el('div', 'sc-stats');

  getStatLines(details).forEach((line, index) => {
    const row = el('div', 'sc-stat');
    row.append(el('span', 'sc-stat-name', line.name));
    const value = el('span', 'sc-stat-value', line.text);
    if (index < 3) {
      const base = Math.round(props[bases[index]] || 0);
      const total = Math.round(props[[2000, 2001, 2002][index]] || 0);
      if (base && total >= base) value.append(el('small', 'sc-base', base + ' +' + (total - base)));
    }
    row.append(value);
    list.append(row);
  });
  return list;
}

function showcaseSets(items, store) {
  const counts = {};
  getArtifacts(items).forEach((item) => {
    const hash = item.flat.setNameTextMapHash !== undefined ? item.flat.setNameTextMapHash : item.flat.setNameTextHashMap;
    const name = localized(hash, store);
    if (name) counts[name] = (counts[name] || 0) + 1;
  });

  const box = el('div', 'sc-sets');
  Object.keys(counts).filter((name) => counts[name] >= 2).forEach((name) => {
    const chip = el('span', 'sc-set');
    chip.append(el('span', 'sc-set-name', name), el('span', 'sc-set-count', String(counts[name])));
    box.append(chip);
  });
  return box;
}

/* Liczba kropek to szacunek, z ilu ulepszeń składa się podstatystyka (wartość podzielona przez największe możliwe ulepszenie). */
function showcasePips(prop, value) {
  const max = typeof MAX_ROLLS !== 'undefined' ? MAX_ROLLS[prop] : 0;
  const box = el('span', 'sc-pips');
  if (!max) return box;
  const count = Math.max(1, Math.min(6, Math.ceil(Number(value) / max - 0.02)));
  box.title = '\u2248 ' + count + showcaseText(' ulepszeń', ' rolls');
  for (let index = 0; index < count; index += 1) box.append(el('i'));
  return box;
}

function showcaseCritValue(items) {
  let total = 0;
  getArtifacts(items).forEach((item) => {
    (item.flat.reliquarySubstats || []).forEach((raw) => {
      const stat = statLine(raw);
      if (!stat) return;
      if (stat.prop === 'FIGHT_PROP_CRITICAL') total += 2 * Number(stat.value);
      else if (stat.prop === 'FIGHT_PROP_CRITICAL_HURT') total += Number(stat.value);
    });
  });
  return total;
}

function showcaseArtifacts(items) {
  const wrapper = el('div', 'sc-arts');
  const pieces = getArtifacts(items);
  const scores = pieces.map((item) => artifactRv(item.flat));
  const top = Math.max(...scores);
  const bottom = Math.min(...scores);
  const ranked = pieces.length >= 3 && top > bottom;

  pieces.forEach((item, position) => {
    const flat = item.flat;
    const row = el('div', 'sc-art');
    if (ranked && scores[position] === top) {
      row.classList.add('best');
      row.append(el('span', 'sc-tag', showcaseText('Najlepszy', 'Best')));
    } else if (ranked && scores[position] === bottom) {
      row.classList.add('weak');
      row.append(el('span', 'sc-tag', showcaseText('Do poprawy', 'Weakest')));
    }

    const left = el('div', 'sc-art-left');
    const picture = el('div', 'sc-art-icon');
    picture.append(createImage(flat.icon, 'Artifact', 'sc-art-img'), el('span', 'sc-art-level', '+' + (item.reliquary && item.reliquary.level ? item.reliquary.level - 1 : 0)));
    left.append(picture);

    const main = statLine(flat.reliquaryMainstat);
    if (main && main.prop) {
      left.append(el('div', 'sc-main-value', formatStat(main.prop, main.value)), el('div', 'sc-main-label', showcaseProp(main.prop)));
    }
    left.append(el('div', 'sc-stars', '\u2605'.repeat(flat.rankLevel || 5)), el('div', 'sc-rv', 'RV ' + scores[position].toFixed(0) + '%'));

    const subs = el('div', 'sc-subs');
    (flat.reliquarySubstats || []).forEach((raw) => {
      const stat = statLine(raw);
      if (!stat || !stat.prop) return;
      const crit = stat.prop === 'FIGHT_PROP_CRITICAL' || stat.prop === 'FIGHT_PROP_CRITICAL_HURT';
      const cell = el('div', 'sc-sub' + (crit ? ' crit' : ''));
      const label = el('span', 'sc-sub-label', showcaseProp(stat.prop));
      label.append(showcasePips(stat.prop, stat.value));
      cell.append(label, el('span', 'sc-sub-value', '+' + formatStat(stat.prop, stat.value)));
      subs.append(cell);
    });

    row.append(left, subs);
    wrapper.append(row);
  });
  return wrapper;
}

function buildShowcase(details, character, data, store) {
  const refs = {};
  const card = el('section', 'sc');
  const items = details.equipList || [];
  const artName = showcaseArtName(character);

  refs.background = el('div', 'sc-bg');
  const left = el('div', 'sc-left');
  const art = el('div', 'sc-splash');
  const urls = artName ? [SHOWCASE_SPLASH + artName + '.png', IMG_URL + 'UI_AvatarIcon_' + artName + '.png'] : [];
  art.append(codexImage(urls, '', 'sc-splash-img'));
  const bottom = el('div', 'sc-bottom');
  bottom.append(showcaseConsts((details.talentIdList || []).length, refs), showcaseTalents(details, character, refs));
  const player = el('div', 'sc-player', (data.playerInfo.nickname || '') + ' \u00b7 ' + data.uid);
  left.append(art, showcaseHeader(details, character, store, data, refs), bottom, player);

  const middle = el('div', 'sc-mid');
  const weapon = showcaseWeapon(items, store);
  if (weapon) middle.append(weapon);
  const critValue = el('div', 'sc-cv');
  critValue.title = showcaseText('2 \u00d7 CRIT Rate + CRIT DMG z podstatystyk artefakt\u00f3w', '2 \u00d7 CRIT Rate + CRIT DMG from artifact substats');
  critValue.append(el('span', '', 'Crit Value'), el('b', '', showcaseCritValue(items).toFixed(1)));
  middle.append(showcaseStats(details), showcaseSets(items, store), critValue);

  refs.info = el('div', 'sc-info');
  refs.info.hidden = true;
  refs.info.setAttribute('aria-live', 'polite');

  const toggle = el('button', 'sc-toggle');
  toggle.type = 'button';
  const applyCompact = (compact) => {
    card.classList.toggle('compact', compact);
    toggle.textContent = compact ? showcaseText('Pełny widok', 'Full view') : showcaseText('Widok skrócony', 'Compact view');
    toggle.setAttribute('aria-pressed', String(compact));
  };
  applyCompact(showcaseCompact());
  toggle.addEventListener('click', () => {
    const next = !card.classList.contains('compact');
    saveSetting(SHOWCASE_COMPACT_KEY, next ? '1' : '0');
    applyCompact(next);
  });
  left.append(toggle);

  card.append(refs.background, left, middle, showcaseArtifacts(items), refs.info);
  card.setAttribute('aria-label', getCharacterName(character, store));
  return { card, refs };
}

function showcaseEnrich(built, details, character) {
  loadCodex(details.avatarId).then((data) => {
    if (!data || !built.card.isConnected) return;
    const urls = codexNamecardUrls(data.namecard && data.namecard.icon);
    if (urls.length) built.refs.background.replaceChildren(codexImage(urls, '', 'sc-bg-img'));
    if (data.title) built.refs.title.textContent = data.title;

    const unlocked = (details.talentIdList || []).length;
    data.constellations.slice(0, 6).forEach((entry, index) => {
      const node = built.refs.consts[index];
      if (!node) return;
      const locked = index >= unlocked;
      node.title = 'C' + (index + 1) + ': ' + entry.name;
      node.setAttribute('aria-label', node.title);
      node.info = {
        title: 'C' + (index + 1) + ' \u00b7 ' + entry.name,
        meta: locked ? showcaseText('zablokowana', 'locked') : showcaseText('odblokowana', 'unlocked'),
        text: entry.description,
        rows: []
      };
      node.replaceChildren(codexIcon(entry.icon, entry.name));
      if (locked) node.classList.add('locked');
    });

    codexLevels(data, details, character).slice(0, 3).forEach((entry, index) => {
      const node = built.refs.talents[index];
      if (!node) return;
      node.prepend(codexIcon(entry.talent.icon, entry.talent.name));
      const total = entry.base === null ? null : Math.min(CODEX_MAX_LEVEL, entry.base + entry.bonus);
      node.setAttribute('aria-label', entry.talent.name + (total === null ? '' : ' Lv. ' + total));
      node.info = {
        title: entry.talent.name,
        meta: total === null ? '' : 'Lv. ' + total,
        text: entry.talent.description,
        rows: total === null ? [] : codexRows(entry.talent, total)
      };
    });
  });
}

function showcaseAttach() {
  const box = state.detailBox;
  if (!box || !state.last) return;

  const panel = box.querySelector('.detail');
  const head = box.querySelector('.detail-head');
  const details = findDetails(state.last.data, state.selectedId);
  if (!panel || !head || !details) {
    showcaseSetElement(null);
    return;
  }

  const { data, store } = state.last;
  const character = store.characters[details.avatarId];
  showcaseSetElement(character && character.Element);

  const built = buildShowcase(details, character, data, store);
  head.after(built.card);

  const grid = Array.from(panel.children).find((node) => node.classList && node.classList.contains('detail-grid'));
  if (grid) grid.before(el('h3', 'section-title', showcaseText('Analiza buildu', 'Build analysis')));
  showcaseEnrich(built, details, character);
}

const showcaseBaseRenderDetail = renderDetail;
renderDetail = function () {
  showcaseBaseRenderDetail();
  showcaseAttach();
};

if (typeof menuHome === 'function') {
  const showcaseBaseHome = menuHome;
  menuHome = function () {
    showcaseSetElement(null);
    showcaseBaseHome();
  };
}

if (state.last && state.detailBox) renderDetail();
