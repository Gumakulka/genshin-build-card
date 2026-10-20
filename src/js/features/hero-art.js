/* Strona startowa z grafiką: tło z pełną grafiką prezentowanej postaci, a kolor całej strony zgodny z jej żywiołem.
   Grafika pochodzi z Enki. Gdy jej nie ma, tło po prostu się nie pokazuje. Ładowany po showcase.js. */
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
  const old = hero.querySelector('.hero-art');
  if (old) old.remove();
  if (name && heroArtAllowed()) hero.prepend(heroArtLayer(name));

  if (!hero.hidden) showcaseSetElement(entry.element);
};

setHeroBanner();
