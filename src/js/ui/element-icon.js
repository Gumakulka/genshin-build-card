/* Ikony żywiołów z gry (CDN Project Amber) zamiast emoji. Gdy ikona się nie wczyta, wraca emoji. */
const ELEMENT_ICON_URL = 'https://gi.yatta.moe/assets/UI/UI_Buff_Element_';
const ELEMENT_ORDER = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Wind', 'Rock'];
const SIDE_LEFT = ['Fire', '✨', 'Water', '✨', 'Grass', '✨', 'Electric'];
const SIDE_RIGHT = ['Ice', '✨', 'Wind', '✨', 'Rock', '✨', '⭐'];

function isElement(name) {
  return Object.prototype.hasOwnProperty.call(ELEMENT_EMOJI, name);
}

function elementIcon(element) {
  if (!isElement(element)) return document.createTextNode('');
  const emoji = ELEMENT_EMOJI[element];
  const img = document.createElement('img');
  img.className = 'element-icon';
  img.alt = emoji;
  img.src = ELEMENT_ICON_URL + element + '.png';
  img.loading = 'lazy';
  img.addEventListener('error', () => img.replaceWith(document.createTextNode(emoji)));
  return img;
}

function renderElementRow() {
  const row = document.getElementById('elements');
  if (!row) return;
  row.textContent = '';
  ELEMENT_ORDER.forEach((element, index) => {
    const icon = elementIcon(element);
    icon.style.setProperty('--i', String(index));
    row.append(icon);
  });
}

function renderSideColumn(id, tokens) {
  const column = document.getElementById(id);
  if (!column) return;
  column.textContent = '';
  tokens.forEach((token) => {
    const slot = el('span');
    if (isElement(token)) slot.append(elementIcon(token));
    else slot.textContent = token;
    column.append(slot);
  });
}

function renderSides() {
  renderSideColumn('side-left', SIDE_LEFT);
  renderSideColumn('side-right', SIDE_RIGHT);
}
