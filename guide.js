const GUIDE_CAPS = [20, 40, 50, 60, 70, 80, 90];
const GUIDE_LOW_WEAPON_CAPS = [20, 40, 50, 60, 70];
const GUIDE_ARTIFACT_MAX = { 1: 4, 2: 4, 3: 12, 4: 16, 5: 20 };
const GUIDE_ARTIFACT_EXP = { 3: 52275, 4: 122675, 5: 270475 };
const GUIDE_FODDER_EXP = { 3: 1260, 4: 2520, 5: 3780 };
const GUIDE_MAPS = [
  ['🗺️ HoYoLAB – Interactive Map', 'https://act.hoyolab.com/ys/app/interactive-map/index.html'],
  ['🗺️ Teyvat Interactive Map', 'https://genshin-impact-map.appsample.com/']
];
const GUIDE_SLOT_MAIN = {
  EQUIP_BRACER: ['FIGHT_PROP_HP'],
  EQUIP_NECKLACE: ['FIGHT_PROP_ATTACK'],
  EQUIP_SHOES: ['FIGHT_PROP_HP_PERCENT', 'FIGHT_PROP_ATTACK_PERCENT', 'FIGHT_PROP_DEFENSE_PERCENT', 'FIGHT_PROP_CHARGE_EFFICIENCY', 'FIGHT_PROP_ELEMENT_MASTERY'],
  EQUIP_RING: ['FIGHT_PROP_HP_PERCENT', 'FIGHT_PROP_ATTACK_PERCENT', 'FIGHT_PROP_DEFENSE_PERCENT', 'FIGHT_PROP_ELEMENT_MASTERY', 'DMG'],
  EQUIP_DRESS: ['FIGHT_PROP_HP_PERCENT', 'FIGHT_PROP_ATTACK_PERCENT', 'FIGHT_PROP_DEFENSE_PERCENT', 'FIGHT_PROP_CRITICAL', 'FIGHT_PROP_CRITICAL_HURT', 'FIGHT_PROP_HEAL_ADD', 'FIGHT_PROP_ELEMENT_MASTERY']
};

function gt(pl, en) {
  return state.lang === 'pl' ? pl : en;
}

function gnum(value) {
  return Number(value).toLocaleString(state.lang === 'pl' ? 'pl-PL' : 'en-GB');
}

function guideEnglishName(hash, store) {
  const en = store.loc && store.loc.en;
  const value = en && hash !== undefined ? en[String(hash)] : null;
  return typeof value === 'string' ? value : null;
}

function guideWikiUrl(name) {
  return 'https://genshin-impact.fandom.com/wiki/Special:Search?query=' + encodeURIComponent(name);
}

function guideLink(label, url) {
  const link = el('a', 'guide-link', label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function guideBox(lines, tips, links) {
  const box = el('details', 'guide');
  box.append(el('summary', '', gt('ℹ️ Gdzie zdobyć, koszty i wskazówki', 'ℹ️ Where to get, costs and tips')));
  const list = el('ul', 'guide-list');
  lines.forEach((line) => list.append(el('li', '', line)));
  box.append(list);
  if (tips.length) {
    box.append(el('div', 'guide-title', gt('Wskazówki', 'Tips')));
    const tipList = el('ul', 'guide-list');
    tips.forEach((tip) => tipList.append(el('li', '', tip)));
    box.append(tipList);
  }
  const row = el('div', 'guide-links');
  links.forEach(([label, url]) => row.append(guideLink(label, url)));
  box.append(row);
  return box;
}

function guideLinks(englishName) {
  const links = [];
  if (englishName) links.push([gt('📖 Wiki: ', '📖 Wiki: ') + englishName, guideWikiUrl(englishName)]);
  return links.concat(GUIDE_MAPS);
}

function guideSlotMain(slot) {
  const options = GUIDE_SLOT_MAIN[slot] || [];
  return options.map((prop) => {
    if (prop === 'DMG') return gt('bonus obrażeń żywiołu lub fizycznych', 'Elemental or Physical DMG Bonus');
    return propName(prop);
  }).join(', ');
}

function guideArtifact(item, store) {
  const flat = item.flat;
  const rarity = flat.rankLevel || 5;
  const max = GUIDE_ARTIFACT_MAX[rarity] || 20;
  const level = item.reliquary && item.reliquary.level ? item.reliquary.level - 1 : 0;
  const setHash = flat.setNameTextMapHash !== undefined ? flat.setNameTextMapHash : flat.setNameTextHashMap;
  const lines = [];
  const tips = [];

  lines.push(gt(
    'Rzadkość ' + rarity + '★, poziom +' + level + ' z maksymalnych +' + max + '.',
    rarity + '★ artifact, level +' + level + ' of a maximum of +' + max + '.'
  ));
  lines.push(gt(
    'Ulepszenia substatów: ' + Math.floor(level / 4) + ' z ' + Math.floor(max / 4) + ' (jedno co 4 poziomy).',
    'Substat upgrades: ' + Math.floor(level / 4) + ' of ' + Math.floor(max / 4) + ' (one every 4 levels).'
  ));
  if (GUIDE_ARTIFACT_EXP[rarity]) {
    lines.push(gt(
      'Pełne ulepszenie do +' + max + ' kosztuje łącznie ' + gnum(GUIDE_ARTIFACT_EXP[rarity]) + ' EXP artefaktów i tyle samo Mory (1 EXP = 1 Mora).',
      'Leveling to +' + max + ' costs ' + gnum(GUIDE_ARTIFACT_EXP[rarity]) + ' artifact EXP in total and the same amount of Mora (1 EXP = 1 Mora).'
    ));
  }
  if (GUIDE_FODDER_EXP[rarity]) {
    lines.push(gt(
      'Jako materiał do ulepszania daje bazowo ' + gnum(GUIDE_FODDER_EXP[rarity]) + ' EXP plus 80% EXP, które już w niego włożono.',
      'Used as fodder it gives ' + gnum(GUIDE_FODDER_EXP[rarity]) + ' base EXP plus 80% of the EXP already invested in it.'
    ));
  }
  if (rarity === 5) {
    const rolls = [];
    (flat.reliquarySubstats || []).forEach((raw) => {
      const stat = statLine(raw);
      if (stat && stat.prop && MAX_ROLLS[stat.prop]) rolls.push(propName(stat.prop) + ' ' + formatStat(stat.prop, MAX_ROLLS[stat.prop]));
    });
    if (rolls.length) {
      lines.push(gt('Maksymalny pojedynczy rzut Twoich substatów (5★): ', 'Maximum single roll of your substats (5★): ') + rolls.join(', ') + '.');
    }
  }
  const mains = guideSlotMain(flat.equipType);
  if (mains) lines.push(gt('Możliwe statystyki główne tego slotu: ', 'Possible main stats for this slot: ') + mains + '.');
  lines.push(gt(
    'Gdzie zdobyć: w domenach artefaktów (Domains of Blessing) – jedno przejście kosztuje 20 żywicy, a domena zwykle daje do wyboru dwa zestawy. Artefakty wypadają też z elitarnych wrogów i bossów, ze skrzyń oraz z wydarzeń i sklepów.',
    'Where to get: artifact domains (Domains of Blessing) – one run costs 20 resin and a domain usually offers two sets. Artifacts also drop from elite enemies and bosses, chests, events and shops.'
  ));

  if (level < max) {
    tips.push(gt(
      'Brakuje ' + (max - level) + ' poziomów do maksimum – dopiero po pełnym ulepszeniu widać prawdziwe substaty.',
      (max - level) + ' levels to go – you only see the final substats after a full upgrade.'
    ));
  }
  if (rarity < 5) {
    tips.push(gt('To artefakt ' + rarity + '★ – 5★ mają wyższy poziom maksymalny i mocniejsze statystyki.', 'This is a ' + rarity + '★ artifact – 5★ ones have a higher level cap and stronger stats.'));
  }
  const flatSubs = (flat.reliquarySubstats || []).filter((raw) => {
    const stat = statLine(raw);
    return stat && ['FIGHT_PROP_HP', 'FIGHT_PROP_ATTACK', 'FIGHT_PROP_DEFENSE', 'FIGHT_PROP_DEFENSE_PERCENT'].includes(stat.prop);
  });
  if (flatSubs.length) {
    tips.push(gt('Płaskie HP, ATK, DEF i DEF% to zwykle słabe substaty (wyjątkiem są postacie skalujące się z HP lub DEF).', 'Flat HP, ATK, DEF and DEF% are usually weak substats (except for characters that scale with HP or DEF).'));
  }

  const english = guideEnglishName(setHash, store);
  return guideBox(lines, tips, guideLinks(english));
}

function guideWeapon(item, store) {
  const flat = item.flat;
  const weapon = item.weapon || {};
  const rarity = flat.rankLevel || 3;
  const caps = rarity <= 2 ? GUIDE_LOW_WEAPON_CAPS : GUIDE_CAPS;
  const promote = Number(weapon.promoteLevel) || 0;
  const cap = caps[Math.min(promote, caps.length - 1)];
  const maxLevel = caps[caps.length - 1];
  const level = Number(weapon.level) || 0;
  const affix = weapon.affixMap ? Object.values(weapon.affixMap)[0] : 0;
  const lines = [];
  const tips = [];

  lines.push(gt(
    'Rzadkość ' + rarity + '★, poziom ' + level + ' z limitu ' + cap + ' (wzniesienie ' + promote + '/' + (caps.length - 1) + '), maksimum ' + maxLevel + '.',
    rarity + '★ weapon, level ' + level + ' of the current cap ' + cap + ' (ascension ' + promote + '/' + (caps.length - 1) + '), maximum ' + maxLevel + '.'
  ));
  lines.push(gt(
    'Rafinacja R' + ((affix || 0) + 1) + ' z R5 – wzmacnia pasywną umiejętność broni. Zwykle wymaga kopii tej samej broni, a broń specjalna lub z wydarzeń może potrzebować innego materiału.',
    'Refinement R' + ((affix || 0) + 1) + ' of R5 – it strengthens the weapon passive. It usually needs duplicates of the same weapon; special or event weapons may need another material.'
  ));
  lines.push(gt(
    'Ulepszanie poziomu: 10 EXP broni kosztuje 1 Morę. Wzniesienia wymagają materiałów z domen broni, dropu z wrogów i Mory.',
    'Leveling: 10 weapon EXP costs 1 Mora. Ascensions need weapon domain materials, enemy drops and Mora.'
  ));
  if (rarity === 5) {
    lines.push(gt('Same wzniesienia 5★ broni od poziomu 1 do 80 kosztują około 225 000 Mory.', 'The ascensions of a 5★ weapon from level 1 to 80 cost around 225,000 Mora.'));
  }
  if (rarity === 5) {
    lines.push(gt(
      'Gdzie zdobyć: zwykle z życzeń (Wish) – baner broni lub standardowy; część broni 5★ pochodzi z innych źródeł (np. wydarzenia, Battle Pass), więc dokładne źródło sprawdź na wiki.',
      'Where to get: usually Wishes – the weapon or standard banner; some 5★ weapons come from other sources (events, Battle Pass), so check the wiki for the exact source.'
    ));
  } else if (rarity === 4) {
    lines.push(gt(
      'Gdzie zdobyć: z życzeń, wydarzeń lub sklepów, a część wykuwasz u kowala – zależy od broni, dokładne źródło sprawdź na wiki.',
      'Where to get: Wishes, events or shops, and some can be forged at a blacksmith – it depends on the weapon, check the wiki for the exact source.'
    ));
  } else {
    lines.push(gt(
      'Gdzie zdobyć: zwykle ze skrzyń, od wrogów, z kowala lub z życzeń – to proste do zdobycia bronie.',
      'Where to get: usually chests, enemy drops, the blacksmith or Wishes – these are easy to obtain.'
    ));
  }

  if (level < cap) {
    tips.push(gt('Poziom ' + level + ' z limitu ' + cap + ' – możesz go podnieść bez wzniesienia.', 'Level ' + level + ' of the cap ' + cap + ' – you can raise it without ascending.'));
  } else if (cap < maxLevel) {
    tips.push(gt('Broń jest na limicie ' + cap + ' – aby iść dalej, trzeba ją wznieść.', 'The weapon is at its ' + cap + ' cap – ascend it to level further.'));
  }
  if (rarity <= 3) {
    tips.push(gt('Broń ' + rarity + '★ ma niską bazową siłę – 4★ i 5★ zwykle dają znacznie więcej.', 'A ' + rarity + '★ weapon has a low base attack – 4★ and 5★ weapons usually give much more.'));
  }

  const english = guideEnglishName(flat.nameTextMapHash !== undefined ? flat.nameTextMapHash : flat.nameTextHashMap, store);
  return guideBox(lines, tips, guideLinks(english));
}

function guideCharacter(details, character, shown, store) {
  const props = details.propMap || {};
  const level = Number(props['4001'] && props['4001'].val) || (shown ? Number(shown.level) : 0);
  const ascensionRaw = props['1002'] && props['1002'].val;
  const ascension = ascensionRaw !== undefined ? Number(ascensionRaw) : null;
  const cap = ascension !== null ? GUIDE_CAPS[Math.min(ascension, 6)] : null;
  const stats = details.fightPropMap || {};
  const quality = character && character.QualityType ? character.QualityType : '';
  const raw = character && character.SideIconName ? character.SideIconName.replace('UI_AvatarIcon_Side_', '') : '';
  const lines = [];
  const tips = [];

  if (cap) {
    lines.push(gt(
      'Poziom ' + level + ' z limitu ' + cap + ' (wzniesienie ' + ascension + '/6), maksimum w grze: 90.',
      'Level ' + level + ' of the cap ' + cap + ' (ascension ' + ascension + '/6), in-game maximum: 90.'
    ));
  } else {
    lines.push(gt('Poziom ' + level + ', maksimum w grze: 90.', 'Level ' + level + ', in-game maximum: 90.'));
  }
  lines.push(gt(
    'Koszt do poziomu 90: wzniesienia to około 420 000 Mory, a sam EXP od 1 do 90 to około 419 Mądrości Bohatera i około 1,67 mln Mory.',
    'Cost to level 90: ascensions are about 420,000 Mora, and the EXP from 1 to 90 is about 419 Hero\'s Wit and about 1.67 million Mora.'
  ));

  const order = character && character.SkillOrder ? character.SkillOrder : [];
  const skillLevels = details.skillLevelMap || {};
  const baseTalents = order.slice(0, 3).map((id) => skillLevels[id]).filter((value) => value !== undefined);
  if (baseTalents.length) {
    lines.push(gt(
      'Talenty (podstawowe): ' + baseTalents.join(' / ') + ', maksimum 10 – konstelacje mogą dodać +3 do poziomu. Książki talentów wypadają z domen talentów (otwarte w określone dni tygodnia), a poziom 10 wymaga też materiału z bossa tygodniowego i Korony Wglądu.',
      'Talents (base): ' + baseTalents.join(' / ') + ', maximum 10 – constellations can add +3 to the level. Talent books drop from talent domains (open on set weekdays), and level 10 also needs a weekly boss material and a Crown of Insight.'
    ));
  }
  const constellations = (details.talentIdList || []).length;
  lines.push(gt(
    'Konstelacje: ' + constellations + '/6 – kolejne zdobywasz, wyciągając duplikaty tej postaci.',
    'Constellations: ' + constellations + '/6 – you unlock more by getting duplicates of this character.'
  ));
  if (raw === 'PlayerBoy' || raw === 'PlayerGirl') {
    lines.push(gt('Gdzie zdobyć: Podróżnik jest dostępny od początku gry.', 'Where to get: the Traveler is available from the start of the game.'));
  } else if (quality.startsWith('QUALITY_ORANGE')) {
    lines.push(gt(
      'Gdzie zdobyć: postać 5★ – zwykle z życzeń (baner postaci lub standardowy, zależnie od postaci). Dokładne źródło sprawdź na wiki.',
      'Where to get: a 5★ character – usually from Wishes (character event or standard banner, depending on the character). Check the wiki for the exact source.'
    ));
  } else {
    lines.push(gt(
      'Gdzie zdobyć: postać 4★ – z życzeń, a część także z fabuły, wydarzeń lub sklepów (zależnie od postaci). Dokładne źródło sprawdź na wiki.',
      'Where to get: a 4★ character – from Wishes, and some also from the story, events or shops (depending on the character). Check the wiki for the exact source.'
    ));
  }
  lines.push(gt(
    'Materiały do rozwoju (lokalne specjalności, boss, drop z wrogów) znajdziesz na mapie poniżej.',
    'Ascension materials (local specialties, bosses, enemy drops) can be found on the maps below.'
  ));

  if (cap && level < cap) tips.push(gt('Postać jest na poziomie ' + level + ' z limitu ' + cap + ' – możesz ją jeszcze podnieść bez wzniesienia.', 'The character is level ' + level + ' of the cap ' + cap + ' – you can still level without ascending.'));
  if (cap && level === cap && cap < 90) tips.push(gt('Postać stoi na limicie ' + cap + ' – żeby iść dalej, trzeba ją wznieść.', 'The character is at the ' + cap + ' cap – ascend to level further.'));
  const lowTalents = baseTalents.filter((value) => value < 10).length;
  if (lowTalents) tips.push(gt('Masz ' + lowTalents + ' z 3 talentów poniżej poziomu 10.', lowTalents + ' of 3 talents are below level 10.'));
  const critRate = (stats[20] || 0) * 100;
  const critDmg = (stats[22] || 0) * 100;
  if (critRate > 0) {
    tips.push(gt(
      'Stosunek kryt.: obrażenia kryt. / szansa kryt. wynosi ' + (critDmg / critRate).toFixed(1) + ' (przyjęta zasada kciuka to około 2:1; ma sens głównie dla postaci opartych na krytach).',
      'Crit ratio: CRIT DMG / CRIT Rate is ' + (critDmg / critRate).toFixed(1) + ' (the usual rule of thumb is about 2:1; it mainly matters for crit-based characters).'
    ));
  }
  const recharge = (stats[23] || 0) * 100;
  if (state.targets.er && recharge < state.targets.er) {
    tips.push(gt('Regeneracja energii ' + recharge.toFixed(0) + '% jest poniżej Twojego celu ' + state.targets.er + '%.', 'Energy Recharge ' + recharge.toFixed(0) + '% is below your target of ' + state.targets.er + '%.'));
  }

  const artifacts = getArtifacts(details.equipList || []);
  if (artifacts.length < 5) tips.push(gt('Założonych artefaktów: ' + artifacts.length + ' z 5.', 'Equipped artifacts: ' + artifacts.length + ' of 5.'));
  const notMax = artifacts.filter((item) => {
    const rarity = item.flat.rankLevel || 5;
    const artifactLevel = item.reliquary && item.reliquary.level ? item.reliquary.level - 1 : 0;
    return artifactLevel < (GUIDE_ARTIFACT_MAX[rarity] || 20);
  }).length;
  if (notMax) tips.push(gt(notMax + ' artefaktów nie ma maksymalnego poziomu.', notMax + ' artifact(s) are not at the maximum level.'));
  const lowRarity = artifacts.filter((item) => (item.flat.rankLevel || 5) < 5).length;
  if (lowRarity) tips.push(gt(lowRarity + ' artefaktów ma mniej niż 5★.', lowRarity + ' artifact(s) are below 5★.'));
  const setCounts = {};
  artifacts.forEach((item) => {
    const hash = item.flat.setNameTextMapHash !== undefined ? item.flat.setNameTextMapHash : item.flat.setNameTextHashMap;
    if (hash !== undefined) setCounts[hash] = (setCounts[hash] || 0) + 1;
  });
  if (artifacts.length && !Object.keys(setCounts).some((hash) => setCounts[hash] >= 2)) {
    tips.push(gt('Żadne dwa artefakty nie tworzą zestawu, więc nie działają bonusy 2 ani 4 elementów.', 'No two artifacts share a set, so no 2-piece or 4-piece bonus is active.'));
  }

  let english = character ? guideEnglishName(character.NameTextMapHash, store) : null;
  if (!english && raw) english = NAME_FIX[raw] || raw;
  return guideBox(lines, tips, guideLinks(english));
}
