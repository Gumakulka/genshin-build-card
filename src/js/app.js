/* Składanie widoku, wyszukiwanie gracza i uruchomienie aplikacji. Ładowany jako ostatni. */
function renderDetail() {
  const box = state.detailBox;
  if (!box || !state.last) return;
  box.textContent = '';
  const { data, store } = state.last;

  if (!data.avatarInfoList || !data.avatarInfoList.length) {
    box.append(el('p', 'hint', t('noDetails')));
    return;
  }
  if (state.selectedId === null || state.selectedId === undefined) {
    box.append(el('p', 'hint', t('pickHint')));
    return;
  }
  const details = findDetails(data, state.selectedId);
  if (!details) {
    box.append(el('p', 'hint', t('noCharacterDetails')));
    return;
  }

  const character = store.characters[details.avatarId];
  const shown = (data.playerInfo.showAvatarInfoList || []).find((a) => String(a.avatarId) === String(details.avatarId));
  const panel = el('div', 'detail');

  const head = el('div', 'detail-head');
  head.append(createImage(getCharacterIcon(character, shown ? shown.costumeId : undefined), ''));
  const title = el('div');
  title.append(el('h4', '', getCharacterName(character, store)));
  const levelValue = details.propMap && details.propMap['4001'] ? details.propMap['4001'].val : (shown ? shown.level : '?');
  const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
  title.append(el('div', 'item-meta', emoji + t('level') + ' ' + levelValue));
  head.append(title);
  const exportButton = el('button', 'action-button push-right', t('exportPng'));
  exportButton.type = 'button';
  exportButton.addEventListener('click', () => exportCard());
  head.append(exportButton);
  panel.append(head);

  const grid = el('div', 'detail-grid');
  const left = el('div', 'column');
  left.append(buildStatsPanel(details), buildExtrasPanel(details, character), buildTargetsPanel());
  const right = el('div', 'column');
  const weapon = buildWeaponPanel(details.equipList || [], store);
  if (weapon) right.append(weapon);
  right.append(buildRvPanel());
  grid.append(left, right);
  panel.append(grid);
  panel.append(guideCharacter(details, character, shown, store));

  const artifacts = buildArtifacts(details.equipList || [], store);
  if (artifacts) {
    panel.append(el('div', 'hint'), artifacts);
  }
  box.append(panel);
}

function render() {
  if (!state.last) return;
  const { data, store } = state.last;
  result.textContent = '';
  if (state.offline) result.append(el('p', 'hint offline-banner', t('offlineBanner') + formatDate(state.offline)));
  result.append(buildProfile(data, store), buildChips(data), buildActions(data));
  const history = buildHistory();
  if (history) result.append(history);

  const namecards = buildNamecards(data.playerInfo, store);
  if (namecards) result.append(namecards);

  const characters = buildCharacters(data, store);
  if (characters) result.append(characters);

  state.detailBox = el('div');
  result.append(state.detailBox);
  renderDetail();
  result.append(buildCompareSection());
}

function renderHero() {
  HERO_CHARACTERS.forEach((character) => {
    heroIcons.append(createImage(character.icon, character.name, 'hero-icon'));
  });
}

async function showPlayer(data) {
  const store = await loadStore();
  state.last = { data, store };
  const shown = data.playerInfo.showAvatarInfoList || [];
  const first = shown.find((a) => findDetails(data, a.avatarId));
  state.selectedId = first ? first.avatarId : null;
  hero.hidden = true;
  render();
}

function showError(error, uid) {
  result.textContent = '';
  result.append(el('p', 'hint', error.network ? t('network') : error.message));
  const retry = el('button', 'action-button', t('retry'));
  retry.type = 'button';
  retry.addEventListener('click', () => search(uid));
  result.append(retry);
}

async function search(uid) {
  if (!/^\d{9}$/.test(uid)) {
    result.textContent = t('uidLength');
    return;
  }
  result.textContent = t('loading');
  state.offline = null;
  try {
    const data = await fetchPlayer(uid);
    state.diff = updateHistory(uid, data.playerInfo);
    await showPlayer(data);
    saveOffline(uid, data);
    rememberPlayer(uid, data.playerInfo.nickname);
    updateUrl(uid);
  } catch (error) {
    console.error(error);
    const saved = error.network ? loadOffline(uid) : null;
    if (saved && saved.data && saved.data.playerInfo) {
      state.offline = saved.savedAt;
      state.diff = null;
      await showPlayer(saved.data);
      return;
    }
    showError(error, uid);
  }
}

langButton.addEventListener('click', () => {
  state.lang = state.lang === 'pl' ? 'en' : 'pl';
  saveSetting('lang', state.lang);
  applyTexts();
  render();
  languageHooks.forEach((hook) => hook());
});

themeButton.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveSetting('theme', state.theme);
  applyTexts();
});

input.addEventListener('input', () => {
  input.value = input.value.replace(/\D/g, '').slice(0, 9);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(input.value.trim());
});

applyTexts();
renderHero();

const urlUid = new URLSearchParams(location.search).get('uid');
if (urlUid && /^\d{9}$/.test(urlUid)) {
  input.value = urlUid;
  search(urlUid);
}
