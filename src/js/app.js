/* Składanie widoku, wyszukiwanie gracza i uruchomienie aplikacji. Ładowany jako ostatni. */
let searchSequence = 0;
let heroBanner = null;
let heroTrailerFrame = null;
let heroTrailerIndex = 0;

const HERO_TRAILERS = ['TAlKhARUcoY', 'lMdsrZ1otlA'];

function heroTrailerUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id +
    '?autoplay=1&mute=1&loop=1&playlist=' + id +
    '&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3';
}

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

function setHeroBanner(index) {
  const character = HERO_CHARACTERS[index];
  const image = createImage(character.icon, character.name, 'hero-banner-icon');
  const name = el('span', 'hero-banner-name', character.name);

  heroBanner.replaceChildren(image, name);
}

function buildHeroTrailer() {
  const wrapper = el('div', 'hero-trailer');
  heroTrailerFrame = document.createElement('iframe');
  heroTrailerFrame.src = heroTrailerUrl(HERO_TRAILERS[0]);
  heroTrailerFrame.title = 'Genshin Impact official background';
  heroTrailerFrame.allow = 'autoplay; encrypted-media; picture-in-picture';
  heroTrailerFrame.referrerPolicy = 'strict-origin-when-cross-origin';
  heroTrailerFrame.tabIndex = -1;
  heroTrailerFrame.setAttribute('aria-hidden', 'true');
  wrapper.append(heroTrailerFrame);

  return wrapper;
}

function buildPageParticles() {
  const particles = el('div', 'page-particles');
  const symbols = ['✦', '✧', '·', '✦', '✧'];

  for (let index = 0; index < 28; index += 1) {
    const particle = el('span', '', symbols[index % symbols.length]);
    particle.style.left = (Math.random() * 100).toFixed(2) + '%';
    particle.style.animationDelay = (Math.random() * 14).toFixed(2) + 's';
    particle.style.animationDuration = (10 + Math.random() * 10).toFixed(2) + 's';
    particle.style.fontSize = (7 + Math.random() * 13).toFixed(1) + 'px';
    particle.style.color = index % 5 === 0 ? 'var(--accent)' : 'var(--muted)';
    particles.append(particle);
  }

  return particles;
}

function buildHeroParticles() {
  const particles = el('div', 'hero-particles');
  const symbols = ['✦', '✧', '·', '✦', '✧'];

  for (let index = 0; index < 22; index += 1) {
    const particle = el('span', '', symbols[index % symbols.length]);
    particle.style.left = (Math.random() * 100).toFixed(2) + '%';
    particle.style.animationDelay = (Math.random() * 9).toFixed(2) + 's';
    particle.style.animationDuration = (7 + Math.random() * 7).toFixed(2) + 's';
    particle.style.fontSize = (8 + Math.random() * 14).toFixed(1) + 'px';
    particle.style.color = index % 4 === 0 ? 'var(--accent)' : 'var(--muted)';
    particles.append(particle);
  }

  return particles;
}

function renderHero() {
  heroIcons.classList.add('hero-banner');
  heroIcons.replaceChildren();

  hero.prepend(buildHeroTrailer());
  hero.prepend(buildHeroParticles());

  heroBanner = el('div', 'hero-banner-card');
  heroIcons.append(heroBanner);

  let heroIndex = 0;
  setHeroBanner(heroIndex);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  setInterval(() => {
    heroIndex = (heroIndex + 1) % HERO_CHARACTERS.length;

    if (reducedMotion) {
      setHeroBanner(heroIndex);
      return;
    }

    heroBanner.classList.add('hero-banner-leave');

    setTimeout(() => {
      setHeroBanner(heroIndex);
      heroBanner.classList.remove('hero-banner-leave');
      heroBanner.classList.add('hero-banner-enter');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => heroBanner.classList.remove('hero-banner-enter'));
      });
    }, 500);
  }, 4000);

  if (!reducedMotion) {
    setInterval(() => {
      heroTrailerIndex = (heroTrailerIndex + 1) % HERO_TRAILERS.length;
      heroTrailerFrame.src = heroTrailerUrl(HERO_TRAILERS[heroTrailerIndex]);
    }, 60000);
  }

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
document.body.prepend(buildPageParticles());

const urlUid = new URLSearchParams(location.search).get('uid');
if (urlUid && /^\d{9}$/.test(urlUid)) {
  input.value = urlUid;
  search(urlUid);
}
