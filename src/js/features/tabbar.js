/* Dolny pasek nawigacji na telefonie: szybki dostęp kciukiem do wyszukiwania, karty postaci, narzędzi i mapy.
   Na komputerze jest ukryty w CSS. Ładowany na końcu. */
const tabbar = { nav: null, buttons: [] };

function tabbarText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function tabbarSearch() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  input.focus({ preventScroll: true });
}

function tabbarCard() {
  if (typeof detailTabsShow === 'function') detailTabsShow('card');
  const target = result.querySelector('.sc') || result.querySelector('.characters');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const TABBAR_ITEMS = [
  { id: 'search', icon: 'search', pl: 'Szukaj', en: 'Search', run: tabbarSearch },
  { id: 'card', icon: 'user', pl: 'Postać', en: 'Character', run: tabbarCard, enabled: () => Boolean(state.last) },
  { id: 'tools', icon: 'layout-grid', pl: 'Narzędzia', en: 'Tools', run: () => { if (typeof openHub === 'function') openHub(); } },
  { id: 'map', icon: 'map', pl: 'Mapa', en: 'Map', run: () => {
    if (typeof closeHub === 'function') closeHub();
    if (typeof mapDockOpen === 'function') mapDockOpen();
  } }
];

function tabbarRefresh() {
  tabbar.buttons.forEach(({ item, node }) => {
    if (item.enabled) node.disabled = !item.enabled();
  });
}

function tabbarRender() {
  tabbar.nav.setAttribute('aria-label', tabbarText('Szybka nawigacja', 'Quick navigation'));
  tabbar.buttons.forEach(({ item, node }) => {
    node.replaceChildren(icon(item.icon), el('span', 'tabbar-label', tabbarText(item.pl, item.en)));
  });
}

function buildTabbar() {
  tabbar.nav = el('nav', 'tabbar');

  TABBAR_ITEMS.forEach((item) => {
    const node = el('button', 'tabbar-item');
    node.type = 'button';
    node.addEventListener('click', item.run);
    tabbar.buttons.push({ item, node });
    tabbar.nav.append(node);
  });

  document.body.append(tabbar.nav);
  document.body.classList.add('has-tabbar');

  /* Gdy otwiera się klawiatura ekranowa, pasek znika, żeby nie zasłaniał pola. */
  input.addEventListener('focus', () => document.body.classList.add('typing'));
  input.addEventListener('blur', () => document.body.classList.remove('typing'));

  new MutationObserver(tabbarRefresh).observe(result, { childList: true });
  languageHooks.push(tabbarRender);
  tabbarRender();
  tabbarRefresh();
}

buildTabbar();
