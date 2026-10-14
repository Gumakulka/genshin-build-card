/* Ostatnio sprawdzani i ulubieni gracze. */
function rememberPlayer(uid, nickname) {
  const before = state.recent.map((item) => item.uid);
  state.recent = [{ uid, nickname }].concat(state.recent.filter((item) => item.uid !== uid)).slice(0, 5);
  state.favorites.forEach((item) => {
    if (item.uid === uid) item.nickname = nickname;
  });
  saveJsonSetting('recent', state.recent);
  saveJsonSetting('favorites', state.favorites);
  before.forEach((oldUid) => {
    const keep = state.recent.some((item) => item.uid === oldUid) || isFavorite(oldUid);
    if (!keep) removeKey('offline-' + oldUid);
  });
  renderRecent();
  renderFavorites();
}

function playerChip(item, prefix) {
  const button = el('button', 'chip recent-chip', prefix + (item.nickname || '?') + ' · ' + item.uid);
  button.type = 'button';
  button.addEventListener('click', () => {
    input.value = item.uid;
    search(item.uid);
  });
  return button;
}

function renderRecent() {
  recentBox.textContent = '';
  const items = state.recent.filter((item) => item && /^\d{9}$/.test(String(item.uid)));
  if (!items.length) return;
  recentBox.append(el('span', 'recent-label', t('recent')));
  items.forEach((item) => recentBox.append(playerChip(item, '')));
}

function isFavorite(uid) {
  return state.favorites.some((item) => item.uid === uid);
}

function toggleFavorite(data) {
  const uid = data.uid;
  if (isFavorite(uid)) {
    state.favorites = state.favorites.filter((item) => item.uid !== uid);
  } else {
    state.favorites = state.favorites.concat({ uid, nickname: data.playerInfo.nickname }).slice(-12);
  }
  saveJsonSetting('favorites', state.favorites);
  renderFavorites();
}

function renderFavorites() {
  favoritesBox.textContent = '';
  const items = state.favorites.filter((item) => item && /^\d{9}$/.test(String(item.uid)));
  if (!items.length) return;
  favoritesBox.append(el('span', 'recent-label', t('favorites')));
  items.forEach((item) => favoritesBox.append(playerChip(item, '⭐ ')));
}
