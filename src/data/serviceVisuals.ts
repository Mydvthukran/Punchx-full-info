const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const paletteFor = (term: string) => {
  const t = term.toLowerCase();
  if (t.includes('electric') || t.includes('fan') || t.includes('light') || t.includes('cctv')) return ['#ede9fe', '#6d28d9', '#312e81'];
  if (t.includes('plumb') || t.includes('water') || t.includes('ro') || t.includes('bath')) return ['#e0f2fe', '#0369a1', '#0c4a6e'];
  if (t.includes('carp') || t.includes('wood') || t.includes('furniture') || t.includes('door')) return ['#fef3c7', '#a16207', '#713f12'];
  if (t.includes('paint') || t.includes('decor') || t.includes('beaut') || t.includes('hair')) return ['#fce7f3', '#be185d', '#831843'];
  if (t.includes('clean') || t.includes('pest') || t.includes('garden')) return ['#dcfce7', '#15803d', '#14532d'];
  if (t.includes('bike') || t.includes('car') || t.includes('driver') || t.includes('delivery')) return ['#e0e7ff', '#4338ca', '#1e1b4b'];
  if (t.includes('computer') || t.includes('mobile') || t.includes('electronic') || t.includes('technician')) return ['#e0f2fe', '#0f766e', '#134e4a'];
  if (t.includes('food') || t.includes('cook') || t.includes('baker') || t.includes('cater')) return ['#ffedd5', '#c2410c', '#7c2d12'];
  return ['#f3f4f6', '#4b5563', '#1f2937'];
};

const glyphFor = (term: string) => {
  const t = term.toLowerCase();
  if (t.includes('fan')) return '✣';
  if (t.includes('light') || t.includes('bulb')) return '◉';
  if (t.includes('water') || t.includes('plumb') || t.includes('tap')) return '💧';
  if (t.includes('carp') || t.includes('wood') || t.includes('furniture')) return '⌂';
  if (t.includes('clean')) return '✦';
  if (t.includes('paint')) return '◒';
  if (t.includes('camera') || t.includes('cctv')) return '◉';
  if (t.includes('phone') || t.includes('mobile')) return '▣';
  if (t.includes('computer') || t.includes('laptop')) return '▤';
  if (t.includes('car') || t.includes('bike') || t.includes('vehicle')) return '▰';
  if (t.includes('food') || t.includes('cook') || t.includes('baker')) return '◈';
  if (t.includes('garden') || t.includes('plant')) return '✿';
  if (t.includes('lock') || t.includes('key')) return '◆';
  if (t.includes('paint') || t.includes('beaut')) return '✿';
  return '●';
};

/** Stable, dependency-free illustration used for every catalogue category, subcategory and item. */
export const serviceImage = (term: string, subtitle = '') => {
  const [bg, accent, dark] = paletteFor(term);
  const label = escapeXml(term.length > 30 ? `${term.slice(0, 29)}…` : term);
  const sub = escapeXml(subtitle.length > 42 ? `${subtitle.slice(0, 41)}…` : subtitle);
  const glyph = escapeXml(glyphFor(term));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><rect width="800" height="520" rx="36" fill="${bg}"/><circle cx="650" cy="110" r="90" fill="${accent}" opacity=".12"/><circle cx="150" cy="420" r="130" fill="${accent}" opacity=".08"/><rect x="72" y="78" width="150" height="150" rx="34" fill="white" opacity=".9"/><text x="147" y="184" text-anchor="middle" font-family="Arial,sans-serif" font-size="82" fill="${accent}">${glyph}</text><text x="72" y="300" font-family="Arial,sans-serif" font-size="36" font-weight="800" fill="${dark}">${label}</text><text x="72" y="345" font-family="Arial,sans-serif" font-size="19" fill="${accent}">PUNCHX • Verified service</text><text x="72" y="390" font-family="Arial,sans-serif" font-size="17" fill="${dark}" opacity=".72">${sub}</text><rect x="72" y="438" width="250" height="10" rx="5" fill="${accent}" opacity=".25"/><rect x="72" y="438" width="150" height="10" rx="5" fill="${accent}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const materialFor = (category: string, item: string) => {
  const t = `${category} ${item}`.toLowerCase();
  if (t.includes('electric') || t.includes('fan') || t.includes('light') || t.includes('switch') || t.includes('wiring')) return 'Wires, connectors, screws, insulation tape and standard electrical fittings as applicable.';
  if (t.includes('plumb') || t.includes('tap') || t.includes('pipe') || t.includes('toilet') || t.includes('drain')) return 'PTFE tape, sealant, washers, connectors and standard plumbing fittings as applicable.';
  if (t.includes('carp') || t.includes('wood') || t.includes('furniture') || t.includes('door')) return 'Screws, hinges, handles, adhesive and wood/board components as applicable.';
  if (t.includes('paint') || t.includes('waterproof')) return 'Primer, putty, paint/coating, rollers, brushes and masking materials as applicable.';
  if (t.includes('clean') || t.includes('pest')) return 'Cleaning agents, microfiber cloths, brushes and treatment consumables as applicable.';
  if (t.includes('ac') || t.includes('refrigerator') || t.includes('geyser') || t.includes('appliance')) return 'Cleaning consumables, fasteners, connectors and replacement parts only when required.';
  if (t.includes('mobile') || t.includes('computer') || t.includes('electronic')) return 'Replacement component/part only when selected; standard diagnostic and installation consumables as applicable.';
  if (t.includes('bike') || t.includes('car') || t.includes('mechanic')) return 'Lubricants, fasteners, cleaning consumables and replacement parts when required.';
  if (t.includes('garden')) return 'Soil, compost, fertilizer, pruning consumables and plant supports when required.';
  if (t.includes('food') || t.includes('cook') || t.includes('baker') || t.includes('cater')) return 'Ingredients and consumables are quoted according to menu, quantity and customer selection.';
  return 'Standard tools and consumables are included where applicable; customer-approved replacement materials are charged separately.';
};
