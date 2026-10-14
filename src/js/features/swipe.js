/* Przesuwanie palcem w lewo i w prawo po panelu szczegółów zmienia wybraną postać (telefon, tablet).
   Na komputerze nic się nie zmienia. */
const SWIPE_MIN_DISTANCE = 60;
const SWIPE_MAX_MS = 800;
const SWIPE_IGNORED = 'input, textarea, select, table, .compare-box, .guide, .rv-toggles';
let swipeStart = null;

function swipeText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function swipeOrder() {
  if (!state.last) return [];
  const data = state.last.data;
  return (data.playerInfo.showAvatarInfoList || [])
    .map((avatar) => avatar.avatarId)
    .filter((id) => findDetails(data, id));
}

function swipeStep(direction) {
  const order = swipeOrder();
  if (order.length < 2) return;
  const current = order.findIndex((id) => String(id) === String(state.selectedId));
  const next = (current + direction + order.length) % order.length;
  selectCharacter(order[next]);
  const card = result.querySelector('.character.selected');
  if (card) card.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}

function swipeAddHint(detail) {
  if (detail.querySelector('.swipe-hint') || swipeOrder().length < 2) return;
  const hint = el('p', 'hint swipe-hint', swipeText(
    'Przesuń palcem w lewo lub w prawo, aby zmienić postać.',
    'Swipe left or right to change the character.'
  ));
  const head = detail.querySelector('.detail-head');
  if (head) head.after(hint);
}

document.addEventListener('touchstart', (event) => {
  swipeStart = null;
  if (event.touches.length !== 1) return;
  const target = event.target;
  if (!target || typeof target.closest !== 'function' || !target.closest('.detail') || target.closest(SWIPE_IGNORED)) return;
  const touch = event.touches[0];
  swipeStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
}, { passive: true });

document.addEventListener('touchend', (event) => {
  const start = swipeStart;
  swipeStart = null;
  if (!start || !event.changedTouches.length) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - start.x;
  const dy = touch.clientY - start.y;
  if (Date.now() - start.time > SWIPE_MAX_MS) return;
  if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * 0.6) return;
  swipeStep(dx < 0 ? 1 : -1);
}, { passive: true });

document.addEventListener('touchcancel', () => {
  swipeStart = null;
}, { passive: true });

new MutationObserver((records) => {
  records.forEach((record) => {
    record.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.classList.contains('detail')) swipeAddHint(node);
    });
  });
}).observe(result, { childList: true, subtree: true });
