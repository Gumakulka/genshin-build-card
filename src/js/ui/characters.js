/* Lista postaci z gabloty oraz panele szczegółów wybranej postaci. */
function findDetails(data, avatarId) {
  const list = data.avatarInfoList || [];
  return list.find((item) => String(item.avatarId) === String(avatarId)) || null;
}

function selectCharacter(id) {
  state.selectedId = id;
  result.querySelectorAll('.character').forEach((node) => {
    node.classList.toggle('selected', node.dataset.avatarId === String(id));
  });
  renderDetail();
}

function buildCharacters(data, store) {
  const info = data.playerInfo;
  const avatars = info.showAvatarInfoList || [];
  if (!avatars.length) return null;
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('characters')));
  const list = el('div', 'characters');

  if (avatars.length > 4) {
    const filter = document.createElement('input');
    filter.type = 'search';
    filter.className = 'character-filter';
    filter.placeholder = t('filterPlaceholder');
    filter.addEventListener('input', () => {
      const query = filter.value.trim().toLowerCase();
      list.querySelectorAll('.character').forEach((node) => {
        node.hidden = query !== '' && !node.dataset.search.includes(query);
      });
    });
    wrapper.append(filter);
  }

  avatars.forEach((avatar) => {
    const character = store.characters[avatar.avatarId];
    const card = el('button', 'character ' + getRarityClass(character));
    card.type = 'button';
    card.dataset.avatarId = String(avatar.avatarId);
    if (String(avatar.avatarId) === String(state.selectedId)) card.classList.add('selected');

    const name = getCharacterName(character, store);
    card.dataset.search = (name + ' ' + (character && character.Element ? character.Element : '')).toLowerCase();
    card.append(createImage(getCharacterIcon(character, avatar.costumeId), name));
    card.append(el('div', 'name', name));
    let meta = 'Lv. ' + avatar.level;
    if (info.isShowAvatarTalent) meta += ' · C' + (avatar.talentLevel || 0);
    const metaRow = el('div', 'meta');
    metaRow.append(elementIcon(character && character.Element), document.createTextNode(meta));
    card.append(metaRow);

    card.addEventListener('click', () => selectCharacter(avatar.avatarId));
    list.append(card);
  });

  wrapper.append(list);
  return wrapper;
}

function getStatLines(details) {
  const props = details.fightPropMap || {};
  const lines = [
    { name: t('hp'), text: String(Math.round(props[2000] || 0)) },
    { name: t('atk'), text: String(Math.round(props[2001] || 0)) },
    { name: t('def'), text: String(Math.round(props[2002] || 0)) },
    { name: t('em'), text: String(Math.round(props[28] || 0)) },
    { key: 'critRate', name: t('critRate'), number: (props[20] || 0) * 100 },
    { key: 'critDmg', name: t('critDmg'), number: (props[22] || 0) * 100 },
    { key: 'er', name: t('er'), number: (props[23] || 0) * 100 }
  ];
  if (props[26]) lines.push({ name: t('healing'), number: props[26] * 100 });

  let bestKey = null;
  Object.keys(DMG_PROPS).forEach((key) => {
    if ((props[key] || 0) > 0 && (bestKey === null || props[key] > props[bestKey])) bestKey = key;
  });
  if (bestKey !== null) lines.push({ name: propName(DMG_PROPS[bestKey]), number: props[bestKey] * 100 });

  lines.forEach((line) => {
    if (line.text === undefined) line.text = line.number.toFixed(1) + '%';
  });
  return lines;
}

function buildStatsPanel(details) {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('stats')));
  getStatLines(details).forEach((line) => {
    if (line.key && state.targets[line.key] !== undefined) {
      panel.append(progressRow(line.name, line.number, state.targets[line.key]));
    } else {
      panel.append(statRow(line.name, line.text));
    }
  });
  return panel;
}

function buildTargetsPanel() {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('targets')));
  [['critRate', 'critRate'], ['critDmg', 'critDmg'], ['er', 'er']].forEach(([key, label]) => {
    const row = el('label', 'target-row');
    row.append(el('span', 'stat-name', t(label) + ' (%)'));
    const field = document.createElement('input');
    field.type = 'number';
    field.min = '0';
    field.max = '999';
    field.className = 'target-input';
    field.value = String(state.targets[key]);
    field.addEventListener('change', () => {
      const value = Math.min(999, Math.max(0, Number(field.value) || 0));
      state.targets[key] = value;
      saveJsonSetting('targets', state.targets);
      renderDetail();
    });
    row.append(field);
    panel.append(row);
  });
  return panel;
}

function buildRvPanel() {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('rvTitle')));
  const list = el('div', 'rv-toggles');
  Object.keys(MAX_ROLLS).forEach((prop) => {
    const button = el('button', 'rv-toggle', propName(prop));
    button.type = 'button';
    if (state.rvStats.includes(prop)) button.classList.add('on');
    button.addEventListener('click', () => {
      state.rvStats = state.rvStats.includes(prop)
        ? state.rvStats.filter((item) => item !== prop)
        : state.rvStats.concat(prop);
      saveJsonSetting('rvStats', state.rvStats);
      renderDetail();
    });
    list.append(button);
  });
  panel.append(list, el('div', 'item-meta', t('rvHint')));
  return panel;
}

function buildExtrasPanel(details, character) {
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('talents')));
  const order = character && character.SkillOrder ? character.SkillOrder : [];
  const levels = details.skillLevelMap || {};
  const extra = details.proudSkillExtraLevelMap || {};
  const proud = (character && character.ProudMap) || {};
  const values = order.slice(0, 3).map((id) => {
    const base = levels[id];
    if (base === undefined) return '-';
    const bonus = extra[proud[id]] || 0;
    return bonus ? base + ' (+' + bonus + ')' : String(base);
  });
  if (values.length) panel.append(statRow(t('talentsValue'), values.join(' / ')));
  panel.append(statRow(t('constellations'), (details.talentIdList || []).length));
  const friendship = details.fetterInfo && details.fetterInfo.expLevel;
  if (friendship) panel.append(statRow(t('friendship'), friendship));
  return panel;
}
