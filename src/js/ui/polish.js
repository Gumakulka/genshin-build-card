/* Drobne poprawki po wydaniu karty postaci: Księga postaci bez pola „Głos”. Ładowany po showcase.js. */
codexInfo = function (data) {
  const row = el('div', 'chips codex-info');
  const place = data.native || data.region;
  const birthday = codexBirthday(data.birthday);

  if (place) row.append(codexChip('map-pin', codexText('Region', 'Region'), place));
  if (birthday) row.append(codexChip('cake', codexText('Urodziny', 'Birthday'), birthday));
  if (data.food && data.food.name) {
    const food = codexChip('utensils', codexText('Potrawa', 'Special dish'), data.food.name);
    food.prepend(codexIcon(data.food.icon, data.food.name, 'codex-food-icon'));
    row.append(food);
  }
  return row;
};

if (state.last && state.detailBox) renderDetail();
