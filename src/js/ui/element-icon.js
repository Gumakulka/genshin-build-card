/* Ikony żywiołów z gry (CDN Project Amber). Gdy ikona się nie wczyta, pokazujemy ikonę zastępczą. */
const ELEMENT_ICON_URL = 'https://gi.yatta.moe/assets/UI/UI_Buff_Element_';
const ELEMENT_ORDER = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Wind', 'Rock'];
const SIDE_LEFT = ['Fire', 'sparkle', 'Water', 'sparkle', 'Grass', 'sparkle', 'Electric'];
const SIDE_RIGHT = ['Ice', 'sparkle', 'Wind', 'sparkle', 'Rock', 'sparkle', 'star'];

function isElement(name) {
  return Object.prototype.hasOwnProperty.call(ELEMENT_EMOJI, name);
}

function elementIcon(element) {
  if (!isElement(element)) return document.createTextNode('');
  const img = document.createElement('img');
  img.className = 'element-icon';
  img.alt = element;
  img.src = ELEMENT_ICON_URL + element + '.png';
  img.loading = 'lazy';
  img.addEventListener('error', () => img.replaceWith(icon('sparkle')));
  return img;
}

function renderElementRow() {
  const row = document.getElementById('elements');
  if (!row) return;
  row.textContent = '';
  ELEMENT_ORDER.forEach((element, index) => {
    const node = elementIcon(element);
    if (node.style) node.style.setProperty('--i', String(index));
    row.append(node);
  });
}

function renderSideColumn(id, tokens) {
  const column = document.getElementById(id);
  if (!column) return;
  column.textContent = '';
  tokens.forEach((token) => {
    const slot = el('span');
    slot.append(isElement(token) ? elementIcon(token) : icon(token));
    column.append(slot);
  });
}

function renderSides() {
  renderSideColumn('side-left', SIDE_LEFT);
  renderSideColumn('side-right', SIDE_RIGHT);
}
