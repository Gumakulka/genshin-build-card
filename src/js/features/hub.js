/* Menu główne: nakładka otwierana kliknięciem w nazwę strony. Z niej wybierasz żywioł, widzisz wszystkie
   postacie tego żywiołu (z danych Enki), a po kliknięciu postaci polecany build artefaktów.
   Ten sam panel buildu pojawia się też w szczegółach postaci gracza, razem ze sprawdzeniem głównych statystyk.
   Dane buildu to skrót zestawienia Game8 (wersja 7.1, postacie od A do Se). Pełny poradnik jest pod linkiem. */
const HUB_ELEMENTS = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Wind', 'Rock'];
const HUB_ELEMENT_NAMES = {
  Fire: 'Pyro', Water: 'Hydro', Grass: 'Dendro', Electric: 'Electro', Ice: 'Cryo', Wind: 'Anemo', Rock: 'Geo'
};
const HUB_GAME8_URL = 'https://game8.co/games/Genshin-Impact/archives/530535';
const HUB_GENSHINGG_URL = 'https://genshin.gg/builds/';

const HUB_STATS = {
  AT: ['ATK%', 'ATK%'],
  HP: ['HP%', 'HP%'],
  DF: ['DEF%', 'DEF%'],
  EM: ['Biegłość żywiołów', 'Elemental Mastery'],
  ER: ['Regeneracja energii', 'Energy Recharge'],
  CR: ['Szansa na kryt.', 'CRIT Rate'],
  CD: ['Obrażenia kryt.', 'CRIT DMG'],
  HB: ['Bonus leczenia', 'Healing Bonus'],
  ED: ['Bonus obrażeń żywiołu', 'Elemental DMG Bonus'],
  PD: ['Bonus obrażeń fizycznych', 'Physical DMG Bonus']
};

const HUB_PROPS = {
  AT: 'FIGHT_PROP_ATTACK_PERCENT',
  HP: 'FIGHT_PROP_HP_PERCENT',
  DF: 'FIGHT_PROP_DEFENSE_PERCENT',
  EM: 'FIGHT_PROP_ELEMENT_MASTERY',
  ER: 'FIGHT_PROP_CHARGE_EFFICIENCY',
  CR: 'FIGHT_PROP_CRITICAL',
  CD: 'FIGHT_PROP_CRITICAL_HURT',
  HB: 'FIGHT_PROP_HEAL_ADD',
  PD: 'FIGHT_PROP_PHYSICAL_ADD_HURT'
};

const HUB_ROLES = {
  DPS: ['Główny DPS', 'Main DPS'],
  'Sub-DPS': ['Poboczny DPS', 'Sub-DPS'],
  Support: ['Wsparcie', 'Support']
};

const HUB_SLOTS = [
  ['EQUIP_SHOES', 'Piaski eonu', 'Sands'],
  ['EQUIP_RING', 'Kielich eonu', 'Goblet'],
  ['EQUIP_DRESS', 'Diadem logosu', 'Circlet']
];

/* Format: [rola, zestawy artefaktów, główne statystyki (piaski|kielich|diadem), podstatystyki według ważności].
   Skróty statystyk są w HUB_STATS. */
const HUB_BUILDS = {
  Aino: ['Support', `Silken Moon's Serenade`, 'EM|EM|CR/CD/EM', 'EM,CR,CD,ER'],
  Albedo: ['Sub-DPS', 'Husk of Opulent Dreams', 'DF|ED|CR/CD', 'DF,CR,CD'],
  Alhaitham: ['DPS', 'Gilded Dreams', 'EM|ED|CR/CD', 'EM,ER,CR,CD,AT'],
  Aloy: ['DPS', `Wanderer's Troupe (2) + Blizzard Strayer (2)`, 'AT|ED|CR/CD', 'AT,ER,CD,CR'],
  Alyosha: ['Support', 'Noblesse Oblige', 'AT/ER|AT|AT/CR', 'ER,AT,CR'],
  Amber: ['DPS', `Wanderer's Troupe`, 'AT/EM|ED|CR/CD', 'AT,CR,CD,ER'],
  Arlecchino: ['DPS', 'Fragment of Harmonic Whimsy', 'AT|ED|CR/CD', 'CR,CD,ER,AT'],
  Ayaka: ['DPS', 'Blizzard Strayer', 'AT|ED|CD', 'CD,ER,AT,CR'],
  Ayato: ['DPS', 'Echoes of an Offering', 'AT|ED|CR/CD', 'ER,CR,CD,AT,HP'],
  Baizhu: ['Support', 'Deepwood Memories', 'HP/ER|HP|HP', 'ER,HP'],
  Barbara: ['Support', 'Ocean-Hued Clam', 'HP|HP|HP/HB', 'HP'],
  Beidou: ['Sub-DPS', 'Emblem of Severed Fate', 'AT/ER|ED/AT/HP|CR/CD', 'AT,CR,CD,ER'],
  Bennett: ['Support', 'Noblesse Oblige', 'ER/AT|ED|CR/CD', 'ER,CR,CD,AT'],
  Candace: ['Sub-DPS', 'Scroll of the Hero of Cinder City', 'ER/HP|HP/ED|HP/CR/CD', 'HP,ER,CR,CD,EM'],
  Charlotte: ['Sub-DPS', 'Golden Troupe', 'AT/ER|AT/ED|CD', 'CD,AT,ER,CR'],
  Chasca: ['DPS', 'Obsidian Codex', 'AT|AT/ED|CD/CR', 'CD,CR,AT,EM'],
  Chevreuse: ['Support', 'Noblesse Oblige', 'HP/ER|HP|HP/HB', 'HP,ER'],
  Chiori: ['Sub-DPS', 'Golden Troupe', 'DF/AT|ED|CR/CD', 'CR,CD,DF,AT'],
  Chongyun: ['Sub-DPS', 'Emblem of Severed Fate', 'AT/ER|ED|CR/CD', 'ER,CR,CD,AT,EM'],
  Citlali: ['Support', 'Scroll of the Hero of Cinder City', 'EM|EM|EM', 'EM,ER'],
  Clorinde: ['DPS', 'Fragment of Harmonic Whimsy', 'AT/EM|ED|CR/CD', 'CR,CD,ER,AT'],
  Collei: ['Sub-DPS', 'Deepwood Memories', 'ER/AT/EM|ED|CR/CD', 'ER,CR,CD,AT,EM'],
  Columbina: ['Sub-DPS', 'Aubade of Morningstar and Moon', 'HP/ER|HP/ED|CR/CD', 'HP,ER,CR,CD,EM'],
  Cyno: ['DPS', 'Disenchantment in Deep Shadows', 'EM|ED|CR/CD', 'ER,CR,CD,EM,AT'],
  Dahlia: ['Support', 'Noblesse Oblige', 'HP/ER|HP|HP/CR', 'ER,HP'],
  Dehya: ['Sub-DPS', 'Scroll of the Hero of Cinder City', 'HP/EM|HP/EM|HP/EM', 'HP,EM'],
  Diluc: ['DPS', 'Crimson Witch of Flames', 'AT/EM|ED|CR/CD', 'CD,CR,AT,EM'],
  Diona: ['Support', 'Noblesse Oblige', 'ER/HP|HP|HB/HP', 'ER,HP'],
  Dori: ['Support', 'Noblesse Oblige', 'ER/HP|HP|HP/HB', 'ER,HP,AT,CR'],
  Durin: ['Sub-DPS', 'A Day Carved from Rising Winds', 'AT|AT/ED|CD/CR', 'AT,EM,CR,CD'],
  Emilie: ['Sub-DPS', 'Unfinished Reverie', 'AT|ED|CR/CD', 'AT,CR,CD,ER'],
  Escoffier: ['Sub-DPS', 'Golden Troupe', 'AT/ER|ED/AT|CR/CD', 'CR,CD,AT,ER'],
  Eula: ['DPS', 'Pale Flame', 'AT|PD|CR/CD', 'ER,CD,CR,AT'],
  Faruzan: ['Support', 'Viridescent Venerer', 'ER|ED|CR/CD', 'ER,CR,CD'],
  Fischl: ['Sub-DPS', 'Golden Troupe', 'AT/EM|ED|CR/CD', 'CR,CD,AT'],
  Flins: ['DPS', `Night of the Sky's Unveiling`, 'AT|AT|CR/CD', 'AT,CR,CD,ER'],
  Freminet: ['DPS', 'Pale Flame', 'AT|PD|CR/CD', 'AT,CR,CD'],
  Furina: ['Sub-DPS', 'Golden Troupe', 'HP/ER|HP/ED|CR/CD', 'ER,CD,CR,HP,EM'],
  Gaming: ['DPS', 'Marechaussee Hunter', 'EM/AT|ED|CD', 'CD,ER,EM,CR,AT'],
  Ganyu: ['DPS', 'Blizzard Strayer', 'AT|ED|CD/CR', 'AT,CD,CR,EM'],
  Gorou: ['Support', 'Husk of Opulent Dreams (2) + Emblem of Severed Fate (2)', 'DF/ER|DF/ED|DF', 'DF,ER,CR'],
  Heizou: ['Support', 'Viridescent Venerer', 'EM|EM|EM', 'EM,AT,CR,CD'],
  'Hu Tao': ['DPS', 'Crimson Witch of Flames', 'HP|ED|CD/CR', 'CR,CD,HP,EM'],
  Iansan: ['Support', 'Scroll of the Hero of Cinder City', 'AT/ER|AT|AT', 'ER,AT'],
  Ifa: ['Support', 'Viridescent Venerer', 'EM|EM|EM', 'EM,ER'],
  Illuga: ['Support', `Silken Moon's Serenade`, 'EM|EM|EM', 'EM,ER,DF'],
  Ineffa: ['Sub-DPS', 'Aubade of Morningstar and Moon', 'AT/EM|AT/EM|CR/CD', 'CR,CD,AT,EM,ER'],
  Itto: ['DPS', 'Husk of Opulent Dreams', 'DF|ED|CR/CD', 'DF,CD,CR,ER'],
  Jahoda: ['Support', 'Viridescent Venerer', 'ER/AT|AT|AT/HB/CR', 'ER,AT,CR,CD,EM'],
  Jean: ['Support', 'Viridescent Venerer', 'AT/ER|ED|CR/HB', 'AT,ER,CR,CD'],
  Kachina: ['Sub-DPS', 'Scroll of the Hero of Cinder City', 'DF|ED|CR/CD', 'CD,CR,DF,ER'],
  Kaeya: ['DPS', 'Blizzard Strayer', 'AT/ER|ED|CD/CR', 'AT,CD,CR'],
  Kaveh: ['Support', 'Deepwood Memories', 'EM|EM|EM', 'ER,EM,CR,CD,AT'],
  Kazuha: ['Sub-DPS', 'Viridescent Venerer', 'EM/AT|EM/ED|EM/CR/CD', 'EM,ER,CD,CR,AT'],
  Keqing: ['DPS', 'Thundering Fury', 'AT/EM|ED|CR/CD', 'CR,CD,AT,EM'],
  Kinich: ['DPS', 'Obsidian Codex', 'AT|ED|CR/CD', 'CD,CR,AT,ER,EM'],
  Kirara: ['Support', 'Tenacity of the Millelith (2) + Vourukasha\'s Glow (2)', 'HP/ER|HP|HP', 'HP,ER'],
  Klee: ['DPS', 'A Day Carved from Rising Winds', 'AT|ED|CR/CD', 'CD,CR,AT,EM'],
  Kokomi: ['Support', 'Ocean-Hued Clam', 'HP|ED|HB/HP', 'HP,ER,EM'],
  'Lan Yan': ['Support', 'Viridescent Venerer', 'AT/ER|AT|AT', 'AT,ER,EM'],
  Lauma: ['Support', 'Deepwood Memories', 'EM|EM|EM/CR/CD', 'EM,CR,CD,ER'],
  Layla: ['Support', 'Tenacity of the Millelith', 'HP|HP/ED|HP/CR/CD', 'HP,CR,CD,ER'],
  Linnea: ['Sub-DPS', 'Aubade of Morningstar and Moon', 'DF|DF|CR/CD', 'CR,CD,DF,EM,ER'],
  Lisa: ['Sub-DPS', 'Gilded Dreams', 'AT/EM|ED/EM|CR/CD/EM', 'ER,EM,CR,CD'],
  Lohen: ['DPS', 'A Day Carved from Rising Winds', 'AT|ED|CD/CR', 'CD,CR,AT,ER'],
  Lynette: ['Support', 'Viridescent Venerer', 'EM/ER|EM/ED|EM/CR/CD', 'EM,ER,CR,CD,AT,HP'],
  Lyney: ['DPS', 'Marechaussee Hunter', 'AT|ED|CD', 'CD,ER,CR,AT'],
  Mavuika: ['DPS', 'Obsidian Codex', 'AT/EM|ED|CR/CD', 'CD,CR,AT,EM'],
  Mika: ['Support', 'Noblesse Oblige', 'ER/HP|HP|HP/HB/CR', 'ER,HP,CR'],
  Mizuki: ['Support', 'Viridescent Venerer', 'EM/ER|EM|EM', 'EM,ER'],
  Mona: ['Sub-DPS', 'Emblem of Severed Fate', 'AT|ED|CR/CD', 'ER,CD,CR,AT'],
  Mualani: ['DPS', 'Obsidian Codex', 'HP/EM|ED/HP|CD', 'CD,HP,EM,CR,ER'],
  Nahida: ['Sub-DPS', 'Deepwood Memories', 'EM|EM/ED|EM/CR/CD', 'EM,CR,CD,ER'],
  Navia: ['DPS', 'Nighttime Whispers in the Echoing Woods', 'AT|ED|CR/CD', 'CD,CR,ER,AT'],
  Nefer: ['DPS', 'Obsidian Codex', 'EM|EM|CD/CR', 'EM,CR,CD'],
  Neuvillette: ['DPS', 'Marechaussee Hunter', 'HP|ED/HP|CR/CD', 'HP,CR,CD,ER,EM'],
  Nicole: ['Support', 'Celestial Gift', 'AT/ER|AT|AT', 'AT,ER'],
  Nilou: ['Support', 'Tenacity of the Millelith (2) + Vourukasha\'s Glow (2)', 'HP/ER|HP|HP', 'HP,ER,EM'],
  Ningguang: ['DPS', 'Nighttime Whispers in the Echoing Woods', 'AT|ED|CR/CD', 'CR,CD,AT'],
  Noelle: ['DPS', 'Marechaussee Hunter', 'DF|ED|CR/CD', 'DF,CD,CR,AT'],
  Odette: ['Sub-DPS', 'Heart of the Furnace', 'AT|AT|CR/CD', 'CD,CR,AT,EM'],
  Ororon: ['Sub-DPS', 'Scroll of the Hero of Cinder City', 'AT/ER|ED|CD/CR', 'AT,CR,CD,ER'],
  Prune: ['Sub-DPS', 'Viridescent Venerer', 'AT/ER|AT|AT', 'AT,ER'],
  Qiqi: ['Support', 'Disenchantment in Deep Shadows', 'AT/ER|AT|AT/HB', 'AT,ER'],
  Raiden: ['DPS', 'Emblem of Severed Fate', 'ER/AT|AT/ED|CR/CD', 'CD,CR,ER,AT'],
  Razor: ['DPS', 'A Day Carved from Rising Winds', 'AT|ED|CD/CR', 'AT,CR,CD,ER'],
  Rosaria: ['Sub-DPS', 'Unfinished Reverie', 'EM/AT|ED|CR/CD', 'AT,CR,CD,EM'],
  Sandrone: ['DPS', 'Disenchantment in Deep Shadows', 'AT|AT|CD/CR', 'ER,CD,CR,AT,EM'],
  Sara: ['Sub-DPS', 'Emblem of Severed Fate', 'ER/AT|ED|CR/CD', 'AT,ER,CR,CD'],
  Sayu: ['Support', 'Viridescent Venerer', 'ER/EM|EM|EM', 'ER,AT,EM']
};

const hub = { open: false, root: null, body: null, title: null, back: null, view: { type: 'home' }, seq: 0 };

function hubText(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function hubStatName(token) {
  const pair = HUB_STATS[token];
  return pair ? hubText(pair[0], pair[1]) : token;
}

function hubStatList(group, joiner) {
  return group.split('/').map(hubStatName).join(joiner);
}

function hubEnglishName(character, store) {
  const table = store && store.loc ? store.loc.en : null;
  const value = table ? table[String(character.NameTextMapHash)] : null;
  return typeof value === 'string' ? value : null;
}

function hubFindBuild(character, store) {
  if (!character) return null;
  const name = hubEnglishName(character, store);
  if (!name) return null;
  const key = Object.keys(HUB_BUILDS).find((candidate) => name === candidate || name.endsWith(' ' + candidate) || name.startsWith(candidate + ' '));
  return key ? HUB_BUILDS[key] : null;
}

function hubTokenMatches(token, propId) {
  if (token === 'ED') return /_ADD_HURT$/.test(propId) && propId !== HUB_PROPS.PD;
  return HUB_PROPS[token] === propId;
}

function hubPropLabel(propId) {
  const token = Object.keys(HUB_PROPS).find((key) => HUB_PROPS[key] === propId);
  if (token) return hubStatName(token);
  if (/_ADD_HURT$/.test(propId)) return hubStatName('ED');
  return propId;
}

function hubEquippedMain(equipList, equipType) {
  const item = (equipList || []).find((entry) => entry && entry.flat && entry.flat.equipType === equipType && entry.flat.reliquaryMainstat);
  return item ? item.flat.reliquaryMainstat.mainPropId : null;
}

function hubRow(label, value) {
  const row = el('div', 'advice-row');
  row.append(el('span', 'advice-label', label), el('span', 'advice-value', value));
  return row;
}

function hubSourceNote() {
  const note = el('p', 'advice-note');
  note.append(document.createTextNode(hubText('Skrót zestawienia Game8 (wersja 7.1). Pełny poradnik: ', 'Condensed from the Game8 list (version 7.1). Full guide: ')));
  [['Game8', HUB_GAME8_URL], ['genshin.gg', HUB_GENSHINGG_URL]].forEach(([label, url], index) => {
    if (index) note.append(document.createTextNode(', '));
    const link = el('a', '', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    note.append(link);
  });
  return note;
}

function buildAdvicePanel(character, store, details) {
  if (!character) return null;
  const panel = el('div', 'panel advice');
  panel.append(el('h5', '', hubText('Polecany build artefaktów', 'Recommended artifact build')));
  const build = hubFindBuild(character, store);

  if (!build) {
    panel.append(el('p', 'hint', hubText(
      'Tej postaci nie ma jeszcze w zestawieniu. Ogólna zasada: DPS buduj pod ATK% (lub HP%/DEF%/EM, zależnie od skalowania), bonus obrażeń żywiołu i CRIT w proporcji około 1:2, a wsparcie pod regenerację energii.',
      'This character is not in the list yet. Rule of thumb: build damage dealers around their scaling stat (ATK%, HP%, DEF% or EM), element DMG and CRIT at about 1:2, and supports around Energy Recharge.'
    )));
    panel.append(hubSourceNote());
    return panel;
  }

  const [role, sets, mains, subs] = build;
  const [sands, goblet, circlet] = mains.split('|');
  const scaling = sands.split('/')[0];
  const tags = el('div', 'advice-tags');
  tags.append(el('span', 'advice-tag', hubText(HUB_ROLES[role][0], HUB_ROLES[role][1])));
  tags.append(el('span', 'advice-tag', hubText('Skaluje się z: ', 'Scales with: ') + hubStatName(scaling === 'ER' ? 'ER' : scaling)));
  panel.append(tags);
  panel.append(hubRow(hubText('Zestaw', 'Set'), sets));
  panel.append(hubRow(hubText('Piaski', 'Sands'), hubStatList(sands, hubText(' lub ', ' or '))));
  panel.append(hubRow(hubText('Kielich', 'Goblet'), hubStatList(goblet, hubText(' lub ', ' or '))));
  panel.append(hubRow(hubText('Diadem', 'Circlet'), hubStatList(circlet, hubText(' lub ', ' or '))));
  panel.append(hubRow(hubText('Podstatystyki', 'Substats'), subs.split(',').map(hubStatName).join(' > ')));

  if (details && details.equipList) {
    const wanted = [sands, goblet, circlet];
    const check = el('div', 'advice-check');
    check.append(el('div', 'item-meta', hubText('Twoje główne statystyki', 'Your main stats')));
    HUB_SLOTS.forEach((slot, index) => {
      const equipped = hubEquippedMain(details.equipList, slot[0]);
      const row = el('div', 'advice-row');
      row.append(el('span', 'advice-label', hubText(slot[1], slot[2])));
      const value = el('span', 'advice-value');
      if (!equipped) {
        value.textContent = hubText('brak artefaktu', 'nothing equipped');
      } else {
        const ok = wanted[index].split('/').some((token) => hubTokenMatches(token, equipped));
        value.className = 'advice-value ' + (ok ? 'match-ok' : 'match-bad');
        value.append(icon(ok ? 'check' : 'x'), document.createTextNode(' ' + hubPropLabel(equipped)));
      }
      row.append(value);
      check.append(row);
    });
    panel.append(check);
  }
  panel.append(hubSourceNote());
  return panel;
}

function hubButton(className, label, iconName, onClick) {
  const button = el('button', className);
  button.type = 'button';
  if (iconName) button.append(icon(iconName));
  button.append(document.createTextNode(label));
  button.addEventListener('click', onClick);
  return button;
}

function hubCharactersOf(element, store) {
  const seen = new Set();
  const list = [];
  Object.keys(store.characters || {}).forEach((id) => {
    const character = store.characters[id];
    if (!character || character.Element !== element || !character.SideIconName || !character.QualityType) return;
    if (character.NameTextMapHash === undefined || /PlayerBoy|PlayerGirl/.test(character.SideIconName)) return;
    const name = getCharacterName(character, store);
    if (seen.has(name)) return;
    seen.add(name);
    list.push({ id, character, name, five: getRarityClass(character) === 'rarity-5' });
  });
  const locale = state.lang === 'pl' ? 'pl' : 'en';
  return list.sort((a, b) => (a.five === b.five ? a.name.localeCompare(b.name, locale) : a.five ? -1 : 1));
}

function hubHome() {
  hub.root.removeAttribute('data-element');
  hub.title.textContent = hubText('Menu główne', 'Main menu');
  hub.back.hidden = true;
  const wrapper = el('div');
  wrapper.append(el('p', 'hub-intro', hubText(
    'Wybierz żywioł, żeby zobaczyć wszystkie postacie i polecane buildy artefaktów.',
    'Pick an element to see every character and recommended artifact builds.'
  )));
  const grid = el('div', 'hub-elements');
  HUB_ELEMENTS.forEach((element, index) => {
    const button = el('button', 'hub-element');
    button.type = 'button';
    button.dataset.element = element;
    button.style.setProperty('--i', String(index));
    button.append(elementIcon(element), el('span', '', HUB_ELEMENT_NAMES[element]));
    button.addEventListener('click', () => hubGo({ type: 'element', element }));
    grid.append(button);
  });
  const tiles = el('div', 'hub-tiles');
  tiles.append(
    hubButton('hub-tile', hubText('Szukaj gracza', 'Find a player'), 'search', () => { closeHub(); menuHome(); }),
    hubButton('hub-tile', hubText('Mapa', 'Map'), 'map', () => { closeHub(); mapDockOpen(); }),
    hubButton('hub-tile', hubText('Plan farmienia', 'Farming plan'), 'calendar-days', () => { closeHub(); farmOpen(); })
  );
  const favorites = hubButton('hub-tile', hubText('Ulubieni gracze', 'Favorite players'), 'star', () => { closeHub(); menuScrollTo(favoritesBox); });
  favorites.disabled = state.favorites.length === 0;
  tiles.append(favorites);
  wrapper.append(grid, tiles);
  hub.body.replaceChildren(wrapper);
}

async function hubElement(element, seq) {
  hub.root.dataset.element = element;
  hub.title.textContent = HUB_ELEMENT_NAMES[element];
  hub.back.hidden = false;
  hub.body.replaceChildren(loadingNode(hubText('Ładowanie postaci...', 'Loading characters...')));
  const store = await loadStore();
  if (seq !== hub.seq) return;
  const list = hubCharactersOf(element, store);
  if (!list.length) {
    hub.body.replaceChildren(el('p', 'hint', hubText('Nie udało się pobrać listy postaci. Spróbuj ponownie za chwilę.', 'Could not load the character list. Try again in a moment.')));
    return;
  }
  const wrapper = el('div');
  wrapper.append(el('h3', 'hub-section', hubText('Postacie: ', 'Characters: ') + list.length));
  const grid = el('div', 'hub-chars');
  list.forEach((entry, index) => {
    const button = el('button', 'character ' + getRarityClass(entry.character));
    button.type = 'button';
    button.style.setProperty('--i', String(index));
    button.append(createImage(getCharacterIcon(entry.character), entry.name));
    button.append(el('div', 'name', entry.name));
    const build = hubFindBuild(entry.character, store);
    button.append(el('div', 'meta', build ? hubText(HUB_ROLES[build[0]][0], HUB_ROLES[build[0]][1]) : ''));
    button.addEventListener('click', () => hubGo({ type: 'character', element, id: entry.id }));
    grid.append(button);
  });
  wrapper.append(grid);
  hub.body.replaceChildren(wrapper);
}

async function hubCharacter(element, id, seq) {
  hub.root.dataset.element = element;
  hub.back.hidden = false;
  const store = await loadStore();
  if (seq !== hub.seq) return;
  const character = store.characters ? store.characters[id] : null;
  if (!character) {
    hubGo({ type: 'element', element });
    return;
  }
  const name = getCharacterName(character, store);
  hub.title.textContent = name;
  const wrapper = el('div');
  const head = el('div', 'hub-char-head');
  head.append(createImage(getCharacterIcon(character), name, 'portrait'));
  const text = el('div');
  text.append(el('h3', '', name));
  const meta = el('div', 'item-meta');
  meta.append(elementIcon(character.Element), document.createTextNode(HUB_ELEMENT_NAMES[character.Element] || ''));
  text.append(meta);
  head.append(text);
  wrapper.append(head, buildAdvicePanel(character, store, null));
  hub.body.replaceChildren(wrapper);
}

function hubRender() {
  hub.seq += 1;
  const seq = hub.seq;
  const view = hub.view;
  if (view.type === 'element') hubElement(view.element, seq);
  else if (view.type === 'character') hubCharacter(view.element, view.id, seq);
  else hubHome();
  hub.body.scrollTop = 0;
  hub.close.replaceChildren(icon('x'), document.createTextNode(hubText('Zamknij', 'Close')));
  hub.back.replaceChildren(icon('arrow-left'), document.createTextNode(hubText('Wróć', 'Back')));
}

function hubGo(view) {
  hub.view = view;
  hubRender();
}

function hubBack() {
  if (hub.view.type === 'character') hubGo({ type: 'element', element: hub.view.element });
  else hubGo({ type: 'home' });
}

function openHub() {
  hub.open = true;
  hub.view = { type: 'home' };
  hub.root.classList.add('open');
  hub.root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('hub-open');
  hubRender();
  hub.close.focus();
}

function closeHub() {
  if (!hub.open) return;
  hub.open = false;
  hub.seq += 1;
  hub.root.classList.remove('open');
  hub.root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('hub-open');
}

function buildHub() {
  const brand = document.querySelector('.brand');
  if (!brand) return;

  hub.root = el('div', 'hub');
  hub.root.setAttribute('role', 'dialog');
  hub.root.setAttribute('aria-modal', 'true');
  hub.root.setAttribute('aria-hidden', 'true');
  hub.root.setAttribute('aria-label', 'Menu');

  const header = el('div', 'hub-header');
  hub.back = el('button', 'hub-back');
  hub.back.type = 'button';
  hub.back.hidden = true;
  hub.back.addEventListener('click', hubBack);
  hub.title = el('h2', 'hub-title');
  hub.close = el('button', 'hub-close');
  hub.close.type = 'button';
  hub.close.addEventListener('click', closeHub);
  header.append(hub.back, hub.title, hub.close);

  hub.body = el('div', 'hub-body');
  hub.root.append(header, hub.body);
  hub.root.addEventListener('click', (event) => {
    if (event.target === hub.root) closeHub();
  });
  document.body.append(hub.root);

  brand.setAttribute('role', 'button');
  brand.setAttribute('tabindex', '0');
  brand.setAttribute('aria-label', 'Menu');
  brand.addEventListener('click', openHub);
  brand.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openHub();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && hub.open) {
      closeHub();
      brand.focus();
    }
  });

  languageHooks.push(() => {
    if (hub.open) hubRender();
  });
}

buildHub();
