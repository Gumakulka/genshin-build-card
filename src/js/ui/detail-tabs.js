/* Zakładki szczegółów: rozpoznawanie treści, jawne panele i obsługa klawiatury. */
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

function detailTabsText(pl, en) { return state.lang === 'pl' ? pl : en; }

function detailTabsSplit(panel) {
  const groups = { card: [], talents: [], analysis: [], artifacts: [] };
  Array.from(panel.children).forEach((node) => {
    const classes = node.classList;
    if (!classes || classes.contains('detail-head') || classes.contains('detail-tabs') || classes.contains('swipe-hint')) return;
    if (classes.contains('hint') && !node.textContent.trim()) { node.remove(); return; }
    const declared = node.dataset.section;
    const id = Object.prototype.hasOwnProperty.call(groups, declared) ? declared
      : classes.contains('sc') ? 'card'
      : classes.contains('codex') ? 'talents'
      : (classes.contains('artifacts') || node.querySelector('.artifacts')) ? 'artifacts' : 'analysis';
    node.dataset.section = id;
    groups[id].push(node);
  });
  return groups;
}

function detailTabsApply() {
  if (!detailGroups) return;
  const available = DETAIL_TABS.filter((tab) => detailGroups[tab.id].length);
  const current = available.some((tab) => tab.id === detailTab) ? detailTab : available[0]?.id;
  Object.keys(detailGroups).forEach((id) => detailGroups[id].forEach((node) => { node.hidden = id !== current; }));
  detailButtons.forEach((button) => {
    const active = button.dataset.tab === current;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
}

function detailTabsShow(id) {
  if (!DETAIL_TABS.some((tab) => tab.id === id)) return;
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
  bar.setAttribute('aria-label', detailTabsText('Szczegóły postaci', 'Character details'));
  DETAIL_TABS.filter((tab) => detailGroups[tab.id].length).forEach((tab) => {
    const button = el('button', 'detail-tab', detailTabsText(tab.pl, tab.en));
    button.type = 'button';
    button.dataset.tab = tab.id;
    button.id = 'detail-tab-' + tab.id;
    button.setAttribute('role', 'tab');
    const content = el('section', 'detail-tab-panel');
    content.id = 'detail-panel-' + tab.id;
    content.dataset.section = tab.id;
    content.setAttribute('role', 'tabpanel');
    content.setAttribute('aria-labelledby', button.id);
    content.tabIndex = 0;
    button.setAttribute('aria-controls', content.id);
    const nodes = detailGroups[tab.id];
    nodes[0].before(content);
    nodes.forEach((node) => content.append(node));
    detailGroups[tab.id] = [content];
    button.addEventListener('click', () => detailTabsShow(tab.id));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = detailButtons.indexOf(button);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? detailButtons.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + detailButtons.length) % detailButtons.length;
      detailTabsShow(detailButtons[next].dataset.tab);
      detailButtons[next].focus();
    });
    detailButtons.push(button);
    bar.append(button);
  });
  head.after(bar);
  detailTabsApply();
}

const detailTabsBaseRender = renderDetail;
renderDetail = function () { detailTabsBaseRender(); detailTabsAttach(); };
if (state.last && state.detailBox) renderDetail();
