/* Składanie widoku, wyszukiwanie gracza i uruchomienie aplikacji. Ładowany jako ostatni. */
let searchSequence = 0;

const HERO_INTERVAL_MS = 4000;
const HERO_LEAVE_MS = 450;
const HERO_ELEMENT_COLORS = {
  Fire: '#ff7a45', Water: '#4cc2ff', Grass: '#7bd84b', Electric: '#b985ff',
  Ice: '#9fe8ff', Wind: '#5fe0b8', Rock: '#f0b53a'
};
const HERO_FALLBACK_ELEMENTS = {
  Furina: 'Water', Zhongli: 'Rock', Nahida: 'Grass', 'Raiden Shogun': 'Electric',
  Venti: 'Wind', 'Hu Tao': 'Fire'
};
const heroReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let heroBanner = null;
let heroBar = null;
let heroIndex = 0;
let heroStore = null;
let heroIds = [];

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
  const levelLine = el('div', 'item-meta');
  levelLine.append(elementIcon(character && character.Element), document.createTextNode(t('level') + ' ' + levelValue));
  title.append(levelLine);
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
  const advice = buildAdvicePanel(character, store, details);
  if (advice) right.append(advice);
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

function heroShuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function heroIdsFromStore(store) {
  return heroShuffle(Object.keys((store && store.characters) || {}).filter((id) => {
    const character = store.characters[id];
    return Boolean(character) && Boolean(character.SideIconName) && character.NameTextMapHash !== undefined &&
      !/PlayerBoy|PlayerGirl/.test(character.SideIconName) && getRarityClass(character) === 'rarity-5';
  }));
}

function heroCurrent() {
  if (heroStore && heroIds.length) {
    const character = heroStore.characters[heroIds[heroIndex % heroIds.length]];
    return { icon: getCharacterIcon(character), name: getCharacterName(character, heroStore), element: character.Element || null };
  }
  const fallback = HERO_CHARACTERS[heroIndex % HERO_CHARACTERS.length];
  return { icon: fallback.icon, name: fallback.name, element: HERO_FALLBACK_ELEMENTS[fallback.name] || null };
}

function setHeroBanner() {
  const entry = heroCurrent();
  heroIcons.style.setProperty('--el', HERO_ELEMENT_COLORS[entry.element] || 'var(--accent)');

  const meta = el('span', 'hero-banner-meta');
  meta.append(el('span', 'hero-banner-name', entry.name));
  if (entry.element && HUB_ELEMENT_NAMES[entry.element]) {
    const badge = el('span', 'hero-banner-element');
    badge.append(elementIcon(entry.element), document.createTextNode(HUB_ELEMENT_NAMES[entry.element]));
    meta.append(badge);
  }

  heroBanner.replaceChildren(createImage(entry.icon, entry.name, 'hero-banner-icon'), meta);
  heroBar.replaceChildren(el('span'));
}

function heroNext() {
  if (hero.hidden || document.hidden || heroBanner.matches(':hover')) return;
  const total = heroStore && heroIds.length ? heroIds.length : HERO_CHARACTERS.length;
  heroIndex = (heroIndex + 1) % total;

  if (heroReduced) {
    setHeroBanner();
    return;
  }

  heroBanner.classList.add('hero-banner-leave');
  setTimeout(() => {
    heroBanner.style.transition = 'none';
    heroBanner.classList.remove('hero-banner-leave');
    heroBanner.classList.add('hero-banner-enter');
    setHeroBanner();
    void heroBanner.offsetWidth;
    heroBanner.style.transition = '';
    heroBanner.classList.remove('hero-banner-enter');
  }, HERO_LEAVE_MS);
}

function renderHero() {
  heroIcons.classList.add('hero-banner');
  heroIcons.replaceChildren();

  heroBanner = el('div', 'hero-banner-card');
  heroBar = el('div', 'hero-banner-bar');
  heroBar.setAttribute('aria-hidden', 'true');
  heroIcons.append(heroBanner, heroBar);
  setHeroBanner();

  setInterval(heroNext, HERO_INTERVAL_MS);
  languageHooks.push(() => setHeroBanner());

  loadStore().then((store) => {
    const ids = heroIdsFromStore(store);
    if (!ids.length) return;
    heroStore = store;
    heroIds = ids;
    heroIndex = 0;
    setHeroBanner();
  });

  renderElementRow();
  renderSides();
}

async function showPlayer(data, loadedStore) {
  const store = loadedStore || await loadStore();
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
    searchSequence += 1;
    result.textContent = t('uidLength');
    return;
  }
  const requestId = ++searchSequence;
  const isCurrent = () => requestId === searchSequence;
  result.replaceChildren(loadingNode(t('loading')));
  state.offline = null;
  try {
    const [data, store] = await Promise.all([fetchPlayer(uid), loadStore()]);
    if (!isCurrent()) return;
    state.diff = updateHistory(uid, data.playerInfo);
    await showPlayer(data, store);
    saveOffline(uid, data);
    rememberPlayer(uid, data.playerInfo.nickname);
    updateUrl(uid);
  } catch (error) {
    if (!isCurrent()) return;
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
