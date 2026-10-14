/* Ikony z biblioteki Lucide (licencja ISC) ładowane z jsDelivr. Kolor bierze się z CSS (maska),
   więc ikona dopasowuje się do motywu i do koloru tekstu. Wersja jest przypięta do serii 0.x. */
const ICON_BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@0/icons/';

function icon(name, className) {
  const node = document.createElement('span');
  node.className = className ? 'ico ' + className : 'ico';
  node.setAttribute('aria-hidden', 'true');
  node.style.setProperty('--ico', 'url("' + ICON_BASE + name + '.svg")');
  return node;
}

function setLabel(node, iconName, text) {
  node.replaceChildren(icon(iconName), document.createTextNode(text));
}
