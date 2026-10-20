/* Strona startowa z grafiką: pod tytułem jest baner z pełną grafiką prezentowanej postaci, a kolor całej strony zgodny z jej żywiołem.
   Baner leży w zwykłym układzie strony, więc logo go nie zasłania. Grafika pochodzi z Enki. Gdy jej nie ma, baner wygląda jak dotychczas.
   Ładowany po showcase.js. */
const HERO_ART_BASE = IMG_URL + 'UI_Gacha_AvatarImg_';

function heroArtName(icon) {
  const match = /^UI_AvatarIcon_(?:Side_)?([A-Za-z0-9_]{1,40})$/.exec(icon || '');
  return match ? match[1] : null;
}

function heroArtLayer(name) {
  const layer = el('div', 'hero-art');
  layer.setAttribute('aria-hidden', 'true');
  const image = codexImage([HERO_ART_BASE + name + '.png'], '', 'hero-art-img');
  image.addEventListener('load', () => layer.classList.add('ready'));
  layer.append(image);
  return layer;
}

/* Duże obrazy nie mają sensu na telefonie ani przy włączonym oszczędzaniu danych. */
function heroArtAllowed() {
  const connection = navigator.connection;
  if (connection && connection.saveData) return false;
  return !(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
}

const heroArtBaseSet = setHeroBanner;
setHeroBanner = function () {
  heroArtBaseSet();

  const entry = heroCurrent();
  const name = heroArtName(entry.icon);
  const old = heroIcons.querySelector('.hero-art');
  if (old) old.remove();

  const show = Boolean(name) && heroArtAllowed();
  heroIcons.classList.toggle('has-art', show);
  if (show) heroIcons.prepend(heroArtLayer(name));

  if (!hero.hidden) showcaseSetElement(entry.element);
};

setHeroBanner();
