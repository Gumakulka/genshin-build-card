/* Zakładki w szczegółach postaci: Karta, Talenty i materiały, Analiza, Artefakty.
   Zamiast jednej bardzo długiej strony widać naraz jedną część, a wybrana zakładka jest zapamiętywana. Ładowany po showcase.js. */
const DETAIL_TABS = [
  { id: 'card', pl: 'Karta', en: 'Card' },
  { id: 'talents', pl: 'Talenty i materiały', en: 'Talents and materials' },
  { id: 'analysis', pl: 'Analiza', en: 'Analysis' },
  { id: 'artifacts', pl: 'Artefakty', en: 'Artifacts' }
];
const DETAIL_TAB_KEY = 'detailTab';
let detailTab = loadSetting(DETAIL_TAB_KEY, 'card');
let detailGroups = null;
let detailButtons = [];

function detailTabsText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

/* Dzieli bezpośrednie elementy panelu na części: karta, księga postaci, analiza (od nagłówka „Analiza buildu”) i artefakty (od pustej podpowiedzi przed nimi). */
function detailTabsSplit(panel) {
  const groups = { card: [], talents: [], analysis: [], artifacts: [] };
  let zone = 'analysis';

  Array.from(panel.children).forEach((node) => {
    const classes = node.classList;
    if (!classes || classes.contains('detail-head') || classes.contains('detail-tabs') || classes.contains('swipe-hint')) return;
    if (classes.contains('sc')) {
      groups.card.push(node);
      return;
    }
    if (classes.contains('codex')) {
      groups.talents.push(node);
      return;
    }
    if (node.className === 'hint') zone = 'artifacts';
    groups[zone].push(node);
  });
  return groups;
}

function detailTabsApply() {
  if (!detailGroups) return;
  const available = DETAIL_TABS.filter((tab) => detailGroups[tab.id].length);
  const current = available.some((tab) => tab.id === detailTab) ? detailTab : 'card';

  Object.keys(detailGroups).forEach((id) => {
    detailGroups[id].forEach((node) => {
      node.hidden = id !== current;
    });
  });
  detailButtons.forEach((button) => {
    const active = button.dataset.tab === current;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
}

function detailTabsShow(id) {
  detailTab = id;
  saveSetting(DETAIL_TAB_KEY, id);
  detailTabsApply();
}

function detailTabsAttach() {
  detailGroups = null;
  detailButtons = [];
  const box = state.detailBox;
  if (!box) return;

  const panel = box.querySelector('.detail');
  const head = box.querySelector('.detail-head');
  if (!panel || !head || !box.querySelector('.sc')) return;

  detailGroups = detailTabsSplit(panel);
  const bar = el('div', 'detail-tabs');
  bar.setAttribute('role', 'tablist');

  DETAIL_TABS.filter((tab) => detailGroups[tab.id].length).forEach((tab) => {
    const button = el('button', 'detail-tab', detailTabsText(tab.pl, tab.en));
    button.type = 'button';
    button.dataset.tab = tab.id;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => detailTabsShow(tab.id));
    detailButtons.push(button);
    bar.append(button);
  });

  head.after(bar);
  detailTabsApply();
}

const detailTabsBaseRender = renderDetail;
renderDetail = function () {
  detailTabsBaseRender();
  detailTabsAttach();
};

if (state.last && state.detailBox) renderDetail();
