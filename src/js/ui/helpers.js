/* Małe, wspólne elementy interfejsu i funkcje pomocnicze. */
function createImage(iconName, alt, className) {
  if (!iconName || !/^[A-Za-z0-9_]+$/.test(iconName)) return document.createTextNode('');
  const img = document.createElement('img');
  img.src = IMG_URL + iconName + '.png';
  img.alt = alt;
  img.loading = 'lazy';
  if (className) img.className = className;
  img.addEventListener('error', () => img.classList.add('missing'));
  return img;
}

function getCharacterIcon(character, costumeId) {
  if (!character || !character.SideIconName) return null;
  const costume = character.Costumes && character.Costumes[costumeId];
  if (costume && costume.icon) return costume.icon;
  return character.SideIconName.replace('_Side', '');
}

function getCharacterName(character, store) {
  if (!character || !character.SideIconName) return t('unknownCharacter');
  const raw = character.SideIconName.replace('UI_AvatarIcon_Side_', '');
  if (raw === 'PlayerBoy') return t('traveler')[0];
  if (raw === 'PlayerGirl') return t('traveler')[1];
  return localized(character.NameTextMapHash, store) || NAME_FIX[raw] || raw;
}

function getRarityClass(character) {
  const quality = character && character.QualityType ? character.QualityType : '';
  if (quality.startsWith('QUALITY_ORANGE')) return 'rarity-5';
  if (quality.startsWith('QUALITY_PURPLE')) return 'rarity-4';
  return '';
}

function getProfileIcon(info, store) {
  const picture = info.profilePicture || {};
  if (picture.id && store.pfps[picture.id] && store.pfps[picture.id].iconPath) {
    return store.pfps[picture.id].iconPath;
  }
  if (picture.avatarId) {
    return getCharacterIcon(store.characters[picture.avatarId], picture.costumeId);
  }
  return null;
}

function getNamecardIcon(id, store) {
  const card = store.namecards[id];
  return card && card.icon ? card.icon : null;
}

function formatStat(prop, value) {
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return PERCENT_PATTERN.test(prop) ? number.toFixed(1) + '%' : String(Math.round(number));
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(state.lang === 'pl' ? 'pl-PL' : 'en-GB');
}

function statRow(name, value) {
  const row = el('div', 'stat-row');
  row.append(el('span', 'stat-name', name), el('span', 'stat-value', value));
  return row;
}

function progressRow(name, value, target) {
  const row = el('div', 'stat-bar');
  const top = el('div', 'stat-row');
  top.append(el('span', 'stat-name', name), el('span', 'stat-value', value.toFixed(1) + '% / ' + target + '%'));
  const bar = document.createElement('progress');
  bar.max = 100;
  bar.value = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  row.append(top, bar);
  return row;
}

function chip(icon, label, value) {
  const wrapper = el('span', 'chip');
  wrapper.append(el('span', '', icon), el('span', 'chip-label', label), el('span', 'chip-value', value));
  return wrapper;
}
