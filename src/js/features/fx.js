/* Efekty wizualne: delikatne tło, światło pod kursorem, fale po kliknięciu, liczniki i kolejność pojawiania.
   Wszystko wyłącza się przy ustawieniu systemowym „ogranicz ruch”. Na ekranach dotykowych pomijamy
   efekty zależne od kursora i iskry w tle, żeby oszczędzać baterię. */
const fxReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const fxTouch = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
const FX_STAGGER = ['#result', '.characters', '.chips', '.namecards', '.artifacts', '.compare-box', '.recent', '.hero-icons', '.dock-chips', '.dock-tabs', '.guide-list', '.side'];
const FX_SPOTLIGHT = '.panel, .artifact-card, .character, .profile, .guide, .detail';
const FX_RIPPLE = '.action-button, .dock-chip, .dock-tab, .dock-size, .dock-close, .rv-toggle, .controls button, form button, .guide-link, .recent-chip';

function fxIndexChildren(container) {
  Array.from(container.children).forEach((child, index) => child.style.setProperty('--i', String(index)));
}

function fxStagger(root) {
  if (!root || root.nodeType !== 1) return;
  FX_STAGGER.forEach((selector) => {
    if (root.matches && root.matches(selector)) fxIndexChildren(root);
    if (root.querySelectorAll) root.querySelectorAll(selector).forEach(fxIndexChildren);
  });
}

function fxCountUp(root) {
  if (fxReduced || !root || root.nodeType !== 1) return;
  const nodes = [];
  if (root.classList && root.classList.contains('chip-value')) nodes.push(root);
  if (root.querySelectorAll) root.querySelectorAll('.chip-value').forEach((node) => nodes.push(node));
  nodes.forEach((node) => {
    const text = node.textContent;
    if (node.dataset.counted || !/^\d{1,5}$/.test(text)) return;
    node.dataset.counted = '1';
    const target = Number(text);
    const startTime = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - startTime) / 800);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(frame);
      else node.textContent = text;
    };
    requestAnimationFrame(frame);
  });
}

function fxRipple(event) {
  const target = event.target && typeof event.target.closest === 'function' ? event.target.closest(FX_RIPPLE) : null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const dot = document.createElement('span');
  dot.className = 'fx-ripple';
  dot.style.width = size + 'px';
  dot.style.height = size + 'px';
  dot.style.left = event.clientX - rect.left - size / 2 + 'px';
  dot.style.top = event.clientY - rect.top - size / 2 + 'px';
  target.append(dot);
  setTimeout(() => dot.remove(), 800);
}

let fxSpotFrame = 0;
function fxSpotlight(event) {
  const target = event.target && typeof event.target.closest === 'function' ? event.target.closest(FX_SPOTLIGHT) : null;
  if (!target || fxSpotFrame) return;
  fxSpotFrame = requestAnimationFrame(() => {
    fxSpotFrame = 0;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mx', event.clientX - rect.left + 'px');
    target.style.setProperty('--my', event.clientY - rect.top + 'px');
  });
}

function fxAmbient() {
  const box = document.createElement('div');
  box.className = 'fx-ambient';
  box.setAttribute('aria-hidden', 'true');
  for (let i = 1; i <= 3; i += 1) {
    const orb = document.createElement('span');
    orb.className = 'fx-orb fx-orb-' + i;
    box.append(orb);
  }
  const sparks = fxTouch ? 0 : 14;
  for (let i = 0; i < sparks; i += 1) {
    const spark = document.createElement('span');
    spark.className = 'fx-spark';
    spark.style.left = Math.random() * 100 + '%';
    spark.style.setProperty('--size', 2 + Math.random() * 4 + 'px');
    spark.style.setProperty('--dur', 9 + Math.random() * 10 + 's');
    spark.style.setProperty('--delay', -Math.random() * 14 + 's');
    box.append(spark);
  }
  document.body.prepend(box);
}

function fxStart() {
  fxStagger(document.body);
  const observer = new MutationObserver((records) => {
    const roots = new Set();
    records.forEach((record) => {
      if (!record.addedNodes.length) return;
      if (record.target.nodeType === 1) roots.add(record.target);
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && !node.classList.contains('fx-ripple')) roots.add(node);
      });
    });
    roots.forEach((root) => {
      fxStagger(root);
      fxCountUp(root);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  if (fxReduced) return;
  fxAmbient();
  if (!fxTouch) document.addEventListener('pointermove', fxSpotlight, { passive: true });
  document.addEventListener('click', fxRipple);
}

fxStart();
