/* Eksport karty postaci do obrazka PNG. */
function loadCanvasImage(iconName) {
  return new Promise((resolve) => {
    if (!iconName || !/^[A-Za-z0-9_]+$/.test(iconName)) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = IMG_URL + iconName + '.png';
  });
}

function loadLocalImage(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = path;
  });
}

function drawFitted(ctx, text, x, y, maxWidth, size, bold) {
  let current = size;
  ctx.font = (bold ? 'bold ' : '') + current + 'px system-ui, sans-serif';
  while (current > 10 && ctx.measureText(text).width > maxWidth) {
    current -= 1;
    ctx.font = (bold ? 'bold ' : '') + current + 'px system-ui, sans-serif';
  }
  ctx.fillText(text, x, y);
}

function drawCardArtifacts(ctx, artifacts, images, store, colors) {
  artifacts.forEach((item, index) => {
    const top = 140 + index * 90;
    const flat = item.flat;
    if (images[2 + index]) ctx.drawImage(images[2 + index], 340, top, 64, 64);
    const setHash = flat.setNameTextMapHash !== undefined ? flat.setNameTextMapHash : flat.setNameTextHashMap;
    ctx.fillStyle = colors.fg;
    drawFitted(ctx, localized(setHash, store) || '', 416, top + 16, 480, 16, true);
    const main = statLine(flat.reliquaryMainstat);
    if (main && main.prop) {
      ctx.fillStyle = colors.accent;
      drawFitted(ctx, propName(main.prop) + ' ' + formatStat(main.prop, main.value) + '  ·  RV ' + artifactRv(flat).toFixed(0) + '%', 416, top + 38, 480, 16, false);
    }
    const subs = (flat.reliquarySubstats || []).map((raw) => {
      const stat = statLine(raw);
      return stat && stat.prop ? propName(stat.prop) + ' ' + formatStat(stat.prop, stat.value) : '';
    }).filter(Boolean).join('  |  ');
    ctx.fillStyle = colors.muted;
    drawFitted(ctx, subs, 416, top + 60, 500, 14, false);
  });
}

async function exportCard() {
  if (!state.last) return;
  const { data, store } = state.last;
  const details = findDetails(data, state.selectedId);
  if (!details) return;

  const character = store.characters[details.avatarId];
  const items = details.equipList || [];
  const weapon = findWeapon(items);
  const artifacts = getArtifacts(items);
  const shown = (data.playerInfo.showAvatarInfoList || []).find((a) => String(a.avatarId) === String(details.avatarId));
  const dark = state.theme === 'dark';
  const colors = dark
    ? { bg: '#0b0b0f', card: '#16161d', fg: '#f2f2f5', muted: '#9a9aa8', accent: '#e8c872' }
    : { bg: '#ffffff', card: '#f4f4f7', fg: '#111114', muted: '#666672', accent: '#d9a93f' };

  const images = await Promise.all([
    loadCanvasImage(getCharacterIcon(character, shown ? shown.costumeId : undefined)),
    loadCanvasImage(weapon ? weapon.flat.icon : null)
  ].concat(artifacts.map((item) => loadCanvasImage(item.flat.icon))));

  const logoImage = await loadLocalImage('build/logo.jpg');

  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colors.card;
  ctx.fillRect(20, 20, 920, 600);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 920, 600);

  const emoji = character && ELEMENT_EMOJI[character.Element] ? ELEMENT_EMOJI[character.Element] + ' ' : '';
  const levelValue = details.propMap && details.propMap['4001'] ? details.propMap['4001'].val : (shown ? shown.level : '?');
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = colors.fg;
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(getCharacterName(character, store), 50, 78);
  ctx.fillStyle = colors.muted;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(emoji + t('level') + ' ' + levelValue + ' · C' + (details.talentIdList || []).length, 50, 106);

  if (images[0]) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(860, 80, 48, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(images[0], 812, 32, 96, 96);
    ctx.restore();
  }

  ctx.font = '18px system-ui, sans-serif';
  let y = 160;
  getStatLines(details).forEach((line) => {
    ctx.fillStyle = colors.muted;
    ctx.fillText(line.name, 50, y);
    ctx.fillStyle = colors.fg;
    ctx.fillText(line.text, 230, y);
    y += 30;
  });

  if (weapon) {
    y += 20;
    if (images[1]) ctx.drawImage(images[1], 50, y - 20, 56, 56);
    ctx.fillStyle = colors.fg;
    drawFitted(ctx, getWeaponTitle(weapon, store), 118, y + 8, 200, 16, true);
  }

  drawCardArtifacts(ctx, artifacts, images, store, colors);

  ctx.fillStyle = colors.muted;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Genshin Build Card · UID ' + data.uid + ' · ' + t('author'), 50, 600);
  if (logoImage) ctx.drawImage(logoImage, 885, 572, 44, 44);

  canvas.toBlob((blob) => {
    if (!blob) {
      alert(t('exportFail'));
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'genshin-card-' + data.uid + '-' + details.avatarId + '.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  }, 'image/png');
}
