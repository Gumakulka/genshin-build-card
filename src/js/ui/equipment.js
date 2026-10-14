/* Broń i artefakty: odczyt danych, RV i panele. */
function statLine(stat) {
  if (!stat) return null;
  const prop = stat.appendPropId || stat.appendPropID || stat.mainPropId;
  const value = stat.statValue !== undefined ? stat.statValue : stat.propValue;
  return { prop, value };
}

function findWeapon(items) {
  return items.find((entry) => entry.flat && entry.flat.itemType === 'ITEM_WEAPON') || null;
}

function getArtifacts(items) {
  return items
    .filter((entry) => entry.flat && entry.flat.itemType === 'ITEM_RELIQUARY')
    .sort((a, b) => SLOT_ORDER.indexOf(a.flat.equipType) - SLOT_ORDER.indexOf(b.flat.equipType));
}

function getWeaponTitle(item, store) {
  const flat = item.flat;
  const name = localized(flat.nameTextMapHash !== undefined ? flat.nameTextMapHash : flat.nameTextHashMap, store);
  const weapon = item.weapon || {};
  const affix = weapon.affixMap ? Object.values(weapon.affixMap)[0] : 0;
  return (name || t('weapon')) + ' · ' + t('level') + ' ' + (weapon.level || '?') + ' · R' + ((affix || 0) + 1);
}

function artifactRv(flat) {
  if (flat.rankLevel !== undefined && flat.rankLevel !== 5) return 0;
  let total = 0;
  (flat.reliquarySubstats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (stat && stat.prop && state.rvStats.includes(stat.prop) && MAX_ROLLS[stat.prop]) {
      total += (Number(stat.value) / MAX_ROLLS[stat.prop]) * 100;
    }
  });
  return total;
}

function buildWeaponPanel(items, store) {
  const item = findWeapon(items);
  if (!item) return null;
  const flat = item.flat;
  const panel = el('div', 'panel');
  panel.append(el('h5', '', t('weapon')));

  const row = el('div', 'weapon');
  row.append(createImage(flat.icon, 'Weapon'));
  const text = el('div');
  text.append(el('div', 'item-name', getWeaponTitle(item, store)));
  (flat.weaponStats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (stat && stat.prop) text.append(el('div', 'item-meta', propName(stat.prop) + ': ' + formatStat(stat.prop, stat.value)));
  });
  row.append(text);
  panel.append(row);
  panel.append(guideWeapon(item, store));
  return panel;
}

function buildArtifactCard(item, store, totals) {
  const flat = item.flat;
  const card = el('div', 'artifact-card');
  const row = el('div', 'artifact');
  row.append(createImage(flat.icon, 'Artifact'));

  const text = el('div');
  const slotIndex = SLOT_ORDER.indexOf(flat.equipType);
  const slotName = slotIndex >= 0 ? t('slots')[slotIndex] : '';
  const setHash = flat.setNameTextMapHash !== undefined ? flat.setNameTextMapHash : flat.setNameTextHashMap;
  const setName = localized(setHash, store) || slotName;
  if (setHash !== undefined) totals.sets[setName] = (totals.sets[setName] || 0) + 1;

  text.append(el('div', 'item-name', setName));
  const level = item.reliquary && item.reliquary.level ? item.reliquary.level - 1 : 0;
  text.append(el('div', 'item-meta', slotName + ' · +' + level));

  const main = statLine(flat.reliquaryMainstat);
  if (main && main.prop) {
    text.append(el('div', 'item-name', propName(main.prop) + ' ' + formatStat(main.prop, main.value)));
  }
  row.append(text);
  card.append(row);

  const subs = el('ul', 'substats');
  (flat.reliquarySubstats || []).forEach((raw) => {
    const stat = statLine(raw);
    if (!stat || !stat.prop) return;
    subs.append(el('li', '', propName(stat.prop) + ' ' + formatStat(stat.prop, stat.value)));
    if (stat.prop === 'FIGHT_PROP_CRITICAL') totals.cv += 2 * Number(stat.value);
    if (stat.prop === 'FIGHT_PROP_CRITICAL_HURT') totals.cv += Number(stat.value);
  });
  card.append(subs);

  const rv = artifactRv(flat);
  totals.rv += rv;
  card.append(el('div', 'item-meta rv-line', 'RV ' + rv.toFixed(0) + '%'));
  card.append(guideArtifact(item, store));
  return { card, rv, eligible: flat.rankLevel === undefined || flat.rankLevel === 5 };
}

function markWeakestArtifact(entries) {
  const eligible = entries.filter((entry) => entry.eligible);
  if (!state.rvStats.length || eligible.length < 2) return;
  const weakest = eligible.reduce((min, entry) => (entry.rv < min.rv ? entry : min));
  if (!eligible.some((entry) => entry.rv > weakest.rv)) return;
  weakest.card.classList.add('weakest');
  weakest.card.append(el('div', 'item-meta weakest-label', t('weakest')));
}

function buildArtifacts(items, store) {
  const artifacts = getArtifacts(items);
  if (!artifacts.length) return null;

  const wrapper = el('div', 'panel');
  wrapper.append(el('h5', '', t('artifacts')));
  const grid = el('div', 'artifacts');
  const totals = { sets: {}, cv: 0, rv: 0 };

  const entries = artifacts.map((item) => {
    const entry = buildArtifactCard(item, store, totals);
    grid.append(entry.card);
    return entry;
  });
  markWeakestArtifact(entries);

  const setLines = Object.keys(totals.sets)
    .filter((name) => totals.sets[name] >= 2)
    .map((name) => name + ' (' + totals.sets[name] + ')');
  if (setLines.length) wrapper.append(el('div', 'item-meta', t('sets') + ': ' + setLines.join(', ')));
  wrapper.append(el('div', 'item-meta', t('cv') + ': ' + totals.cv.toFixed(1)));
  wrapper.append(el('div', 'item-meta', t('rv') + ': ' + totals.rv.toFixed(0) + '%'));
  wrapper.append(grid);
  return wrapper;
}
