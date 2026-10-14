/* Profil gracza: nagłówek, statystyki konta, akcje, wizytówki i historia zmian. */
function updateUrl(uid) {
  try {
    history.replaceState(null, '', '?uid=' + uid);
  } catch (error) {
    console.error(error);
  }
}

async function copyLink(uid, button) {
  const url = location.origin + location.pathname + '?uid=' + uid;
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = t('linkCopied');
  } catch (error) {
    button.textContent = url;
  }
  setTimeout(() => {
    button.textContent = t('copyLink');
  }, 2500);
}

function buildProfile(data, store) {
  const info = data.playerInfo;
  const profile = el('section', 'profile');

  const bannerId = info.nameCardId || info.namecardId;
  const bannerIcon = bannerId ? getNamecardIcon(bannerId, store) : null;
  if (bannerIcon) profile.append(createImage(bannerIcon, '', 'banner'));

  const body = el('div', 'profile-body');
  const avatarIcon = getProfileIcon(info, store);
  if (avatarIcon) body.append(createImage(avatarIcon, t('avatarAlt'), 'avatar'));

  const details = el('div');
  details.append(el('h2', '', info.nickname));
  if (info.signature) details.append(el('p', 'signature', info.signature));
  body.append(details);
  profile.append(body);
  return profile;
}

function buildChips(data) {
  const info = data.playerInfo;
  const chips = el('section', 'chips');
  chips.append(chip('🆔', 'UID', data.uid));
  if (data.region) chips.append(chip('🌐', t('region'), data.region));
  chips.append(chip('🎖️', t('adventureRank'), info.level));
  chips.append(chip('🌍', t('worldLevel'), info.worldLevel));
  chips.append(chip('🏆', t('achievements'), info.finishAchievementNum));
  if (info.towerFloorIndex) {
    let abyss = info.towerFloorIndex + '-' + info.towerLevelIndex;
    if (info.towerStarIndex) abyss += ' · ⭐ ' + info.towerStarIndex;
    chips.append(chip('🌀', t('abyss'), abyss));
  }
  if (info.stygianIndex) {
    let stygian = String(info.stygianIndex);
    if (info.stygianSeconds) stygian += ' · ' + info.stygianSeconds + ' s';
    chips.append(chip('⚔️', t('stygian'), stygian));
  }
  if (info.fetterCount) chips.append(chip('🤝', t('maxFriendship'), info.fetterCount));

  Object.keys(info).forEach((key) => {
    if (HANDLED_KEYS.includes(key) || typeof info[key] === 'object') return;
    chips.append(chip('🔹', key, info[key]));
  });
  return chips;
}

function buildActions(data) {
  const actions = el('div', 'actions');
  const copy = el('button', 'action-button', t('copyLink'));
  copy.type = 'button';
  copy.addEventListener('click', () => copyLink(data.uid, copy));
  const favorite = el('button', 'action-button', isFavorite(data.uid) ? t('removeFavorite') : t('addFavorite'));
  favorite.type = 'button';
  favorite.addEventListener('click', () => {
    toggleFavorite(data);
    favorite.textContent = isFavorite(data.uid) ? t('removeFavorite') : t('addFavorite');
  });
  actions.append(copy, favorite);
  return actions;
}

function buildNamecards(info, store) {
  const ids = info.showNameCardIdList || [];
  if (!ids.length) return null;
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('namecards')));
  const list = el('div', 'namecards');
  ids.forEach((id) => {
    const icon = getNamecardIcon(id, store);
    if (icon) list.append(createImage(icon, 'Namecard ' + id, 'namecard'));
  });
  wrapper.append(list);
  return wrapper;
}

function buildHistory() {
  const diff = state.diff;
  if (!diff) return null;
  const wrapper = el('section');
  wrapper.append(el('h3', 'section-title', t('sinceVisit')));
  if (!diff.previous) {
    wrapper.append(el('p', 'hint', t('firstVisit')));
    return wrapper;
  }
  wrapper.append(el('p', 'hint', t('lastVisit') + ': ' + formatDate(diff.previous.t)));
  if (!diff.changes.length) {
    wrapper.append(el('p', 'hint', t('noChanges')));
    return wrapper;
  }
  const chips = el('div', 'chips');
  diff.changes.forEach((change) => {
    chips.append(chip('📈', t(change.label), change.from + ' → ' + change.to));
  });
  wrapper.append(chips);
  return wrapper;
}
