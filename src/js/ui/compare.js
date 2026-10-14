/* Porównanie dwóch graczy i wspólnych postaci. */
function buildCompareTable(first, second) {
  const rows = [
    [t('adventureRank'), (d) => d.playerInfo.level, true],
    [t('worldLevel'), (d) => d.playerInfo.worldLevel, true],
    [t('achievements'), (d) => d.playerInfo.finishAchievementNum, true],
    [t('abyss'), (d) => (d.playerInfo.towerFloorIndex ? d.playerInfo.towerFloorIndex + '-' + d.playerInfo.towerLevelIndex : '-'), false],
    ['⭐ ' + t('abyss'), (d) => d.playerInfo.towerStarIndex || 0, true],
    [t('characters'), (d) => (d.playerInfo.showAvatarInfoList || []).length, true]
  ];
  const table = el('table', 'compare');
  const head = el('tr');
  head.append(el('th', '', t('compareStat')), el('th', '', first.playerInfo.nickname), el('th', '', second.playerInfo.nickname));
  table.append(head);
  rows.forEach(([label, getter, numeric]) => {
    const a = getter(first);
    const b = getter(second);
    const row = el('tr');
    const cellA = el('td', numeric && a > b ? 'better' : '', a);
    const cellB = el('td', numeric && b > a ? 'better' : '', b);
    row.append(el('td', 'stat-name', label), cellA, cellB);
    table.append(row);
  });
  return table;
}

function characterCv(details) {
  let cv = 0;
  getArtifacts(details.equipList || []).forEach((item) => {
    (item.flat.reliquarySubstats || []).forEach((raw) => {
      const stat = statLine(raw);
      if (!stat) return;
      if (stat.prop === 'FIGHT_PROP_CRITICAL') cv += 2 * Number(stat.value);
      if (stat.prop === 'FIGHT_PROP_CRITICAL_HURT') cv += Number(stat.value);
    });
  });
  return cv;
}

function describeCharacter(data, avatar) {
  const details = findDetails(data, avatar.avatarId);
  let text = 'Lv. ' + avatar.level;
  if (data.playerInfo.isShowAvatarTalent) text += ' · C' + (avatar.talentLevel || 0);
  const cv = details ? characterCv(details) : null;
  if (cv !== null) text += ' · CV ' + cv.toFixed(1);
  return { text, cv };
}

function buildCommonCharacters(first, second, store) {
  const listA = first.playerInfo.showAvatarInfoList || [];
  const listB = second.playerInfo.showAvatarInfoList || [];
  const common = listA.filter((x) => listB.some((y) => String(y.avatarId) === String(x.avatarId)));
  if (!common.length) return null;
  const wrapper = el('div');
  wrapper.append(el('h3', 'section-title', t('commonCharacters')));
  const table = el('table', 'compare');
  const head = el('tr');
  head.append(el('th', '', t('characters')), el('th', '', first.playerInfo.nickname), el('th', '', second.playerInfo.nickname));
  table.append(head);
  common.forEach((x) => {
    const y = listB.find((item) => String(item.avatarId) === String(x.avatarId));
    const a = describeCharacter(first, x);
    const b = describeCharacter(second, y);
    let better = '';
    if (a.cv !== null && b.cv !== null) better = a.cv > b.cv ? 'a' : (b.cv > a.cv ? 'b' : '');
    const row = el('tr');
    row.append(
      el('td', 'stat-name', getCharacterName(store.characters[x.avatarId], store)),
      el('td', better === 'a' ? 'better' : '', a.text),
      el('td', better === 'b' ? 'better' : '', b.text)
    );
    table.append(row);
  });
  wrapper.append(table);
  return wrapper;
}

async function runCompare(uid) {
  const box = state.compareBox;
  if (!box || !state.last) return;
  if (!/^\d{9}$/.test(uid)) {
    box.textContent = t('uidLength');
    return;
  }
  box.textContent = t('loading');
  try {
    const other = await fetchPlayer(uid);
    box.textContent = '';
    box.append(buildCompareTable(state.last.data, other));
    const common = buildCommonCharacters(state.last.data, other, state.last.store);
    if (common) box.append(common);
  } catch (error) {
    console.error(error);
    box.textContent = error.network ? t('network') : error.message;
  }
}

function buildCompareSection() {
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('compareTitle')));
  const row = el('form', 'compare-form');
  const field = document.createElement('input');
  field.type = 'text';
  field.inputMode = 'numeric';
  field.maxLength = 9;
  field.placeholder = t('comparePlaceholder');
  field.addEventListener('input', () => {
    field.value = field.value.replace(/\D/g, '').slice(0, 9);
  });
  const button = el('button', 'action-button', t('compareButton'));
  button.type = 'submit';
  row.addEventListener('submit', (event) => {
    event.preventDefault();
    runCompare(field.value.trim());
  });
  row.append(field, button);
  state.compareBox = el('div', 'compare-box');
  wrapper.append(row, state.compareBox);
  return wrapper;
}
