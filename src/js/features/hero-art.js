/* Baner startowy: grafika z danych Enki i zapasowa ścieżka wyprowadzona z nazwy ikony. */
const HERO_ART_BASE = IMG_URL + 'UI_Gacha_AvatarImg_';

function heroArtName(icon) {
  const clean = String(icon || '').replace(/_Circle$/, '');
  const match = /^UI_AvatarIcon_(?:Side_)?([A-Za-z0-9_]{1,40})$/.exec(clean);
  return match ? match[1] : null;
}

function heroArtAllowed() {
  if (navigator.connection && navigator.connection.saveData) return false;
  return !(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
}

function heroArtLayer(urls) {
  const layer = el('div', 'hero-art');
  layer.setAttribute('aria-hidden', 'true');
  const image = codexImage(urls, '', 'hero-art-img');
  image.addEventListener('load', () => layer.classList.add('ready'));
  image.addEventListener('error', () => {
    if (!image.classList.contains('missing')) return;
    layer.remove();
    if (!heroIcons.querySelector('.hero-art')) heroIcons.classList.remove('has-art');
  });
  layer.append(image);
  return layer;
}

const heroArtBaseSet = setHeroBanner;
setHeroBanner = function () {
  heroArtBaseSet();
  const entry = heroCurrent();
  const name = heroArtName(entry.icon);
  const old = heroIcons.querySelector('.hero-art');
  if (old) old.remove();
  const urls = [];
  if (typeof heroStore !== 'undefined' && heroStore && heroIds.length) {
    const character = heroStore.characters[heroIds[heroIndex % heroIds.length]];
    if (character && /^[A-Za-z0-9_]{1,120}$/.test(character.Art || '')) urls.push(IMG_URL + character.Art + '.png');
  }
  if (name) urls.push(HERO_ART_BASE + name + '.png');
  const show = urls.length > 0 && heroArtAllowed() && !hero.hidden;
  heroIcons.classList.toggle('has-art', show);
  if (show) heroIcons.prepend(heroArtLayer([...new Set(urls)]));
  if (!hero.hidden) showcaseSetElement(entry.element);
};
setHeroBanner();
