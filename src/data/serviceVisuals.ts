const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');

const paletteFor = (term: string) => {
  const t = term.toLowerCase();
  if (t.includes('electric') || t.includes('fan') || t.includes('light') || t.includes('cctv')) return ['#ede9fe', '#6d28d9', '#312e81'];
  if (t.includes('plumb') || t.includes('water') || t.includes('ro') || t.includes('bath')) return ['#e0f2fe', '#0369a1', '#0c4a6e'];
  if (t.includes('carp') || t.includes('wood') || t.includes('furniture') || t.includes('door')) return ['#fef3c7', '#a16207', '#713f12'];
  if (t.includes('paint') || t.includes('decor') || t.includes('beaut') || t.includes('hair')) return ['#fce7f3', '#be185d', '#831843'];
  if (t.includes('clean') || t.includes('pest') || t.includes('garden')) return ['#dcfce7', '#15803d', '#14532d'];
  if (t.includes('bike') || t.includes('car') || t.includes('driver') || t.includes('delivery') || t.includes('mechanic')) return ['#e0e7ff', '#4338ca', '#1e1b4b'];
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

// Curated free-to-use Unsplash photographs. They are wrapped inside a data-SVG so the card
// always has a local visual fallback even if the external photo CDN is unavailable.
const PHOTO_LIBRARY = {
  electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=82',
  plumber: 'https://images.unsplash.com/photo-1749532125405-70950966b0e5?auto=format&fit=crop&w=1200&q=82',
  construction: 'https://images.unsplash.com/photo-1653280668407-50b18ec4ef42?auto=format&fit=crop&w=1200&q=82',
  painter: 'https://images.unsplash.com/photo-1742900280861-32bed068938b?auto=format&fit=crop&w=1200&q=82',
  carpenter: 'https://images.unsplash.com/photo-1575839127400-6b9e36bf97f8?auto=format&fit=crop&w=1200&q=82',
  beauty: 'https://images.unsplash.com/photo-1722935408489-2bf93349c8cb?auto=format&fit=crop&w=1200&q=82',
  food: 'https://images.unsplash.com/photo-1776353744117-9e8595e8092c?auto=format&fit=crop&w=1200&q=82',
} as const;

const photoFor = (term: string) => {
  const t = term.toLowerCase();
  if (t.includes('electric') || t.includes('fan') || t.includes('wiring') || t.includes('switch') || t.includes('mcb') || t.includes('cctv') || t.includes('solar')) return PHOTO_LIBRARY.electrician;
  if (t.includes('plumb') || t.includes('water') || t.includes('tap') || t.includes('bath') || t.includes('drain') || t.includes('ro/')) return PHOTO_LIBRARY.plumber;
  if (t.includes('paint') || t.includes('painter') || t.includes('wall') || t.includes('waterproof')) return PHOTO_LIBRARY.painter;
  if (t.includes('carp') || t.includes('wood') || t.includes('furniture') || t.includes('door') || t.includes('glass') || t.includes('tile') || t.includes('mason') || t.includes('welder') || t.includes('fabricat') || t.includes('ceiling')) return PHOTO_LIBRARY.carpenter;
  if (t.includes('beaut') || t.includes('hair') || t.includes('barber') || t.includes('tailor')) return PHOTO_LIBRARY.beauty;
  if (t.includes('cook') || t.includes('baker') || t.includes('cater') || t.includes('tiffin') || t.includes('food') || t.includes('orchestra') || t.includes('event')) return PHOTO_LIBRARY.food;
  if (t.includes('mechanic') || t.includes('bike') || t.includes('car ') || t.includes('vehicle') || t.includes('driver') || t.includes('delivery')) return PHOTO_LIBRARY.construction;
  if (t.includes('clean') || t.includes('pest') || t.includes('garden') || t.includes('laundry') || t.includes('ironing')) return PHOTO_LIBRARY.construction;
  return PHOTO_LIBRARY.construction;
};

/** Local, dependency-free fallback used inside the same image payload. */
export const serviceImageFallback = (term: string, subtitle = '') => {
  const [bg, accent, dark] = paletteFor(term);
  const label = escapeXml(term.length > 30 ? `${term.slice(0, 29)}…` : term);
  const sub = escapeXml(subtitle.length > 42 ? `${subtitle.slice(0, 41)}…` : subtitle);
  const glyph = escapeXml(glyphFor(term));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><rect width="800" height="520" rx="36" fill="url(#g)"/><circle cx="650" cy="110" r="90" fill="${accent}" opacity=".12"/><circle cx="150" cy="420" r="130" fill="${accent}" opacity=".08"/><rect x="72" y="78" width="150" height="150" rx="34" fill="white" opacity=".9"/><text x="147" y="184" text-anchor="middle" font-family="Arial,sans-serif" font-size="82" fill="${accent}">${glyph}</text><text x="72" y="300" font-family="Arial,sans-serif" font-size="36" font-weight="800" fill="${dark}">${label}</text><text x="72" y="345" font-family="Arial,sans-serif" font-size="19" fill="${accent}">PUNCHX • Verified service</text><text x="72" y="390" font-family="Arial,sans-serif" font-size="17" fill="${dark}" opacity=".72">${sub}</text><rect x="72" y="438" width="250" height="10" rx="5" fill="${accent}" opacity=".25"/><rect x="72" y="438" width="150" height="10" rx="5" fill="${accent}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/**
 * Premium service visual: real web-sourced photo + a guaranteed local fallback layer.
 * The image payload itself is a data URI, so the browser never renders a broken <img> icon.
 */
export const serviceImage = (term: string, subtitle = '') => {
  const [bg, accent] = paletteFor(term);
  const label = escapeXml(term.length > 34 ? `${term.slice(0, 33)}…` : term);
  const sub = escapeXml(subtitle.length > 46 ? `${subtitle.slice(0, 45)}…` : subtitle);
  const photo = escapeXml(photoFor(term));
  const glyph = escapeXml(glyphFor(term));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><defs><linearGradient id="overlay" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#050816" stop-opacity=".06"/><stop offset="1" stop-color="#050816" stop-opacity=".78"/></linearGradient></defs><rect width="800" height="520" rx="36" fill="${bg}"/><image href="${photo}" x="0" y="0" width="800" height="520" preserveAspectRatio="xMidYMid slice"/><rect width="800" height="520" rx="36" fill="url(#overlay)"/><circle cx="710" cy="70" r="48" fill="${accent}" opacity=".85"/><text x="710" y="89" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" fill="#fff">${glyph}</text><rect x="48" y="360" width="704" height="112" rx="24" fill="#050816" opacity=".78"/><text x="76" y="405" font-family="Arial,sans-serif" font-size="29" font-weight="800" fill="#fff">${label}</text><text x="76" y="435" font-family="Arial,sans-serif" font-size="15" fill="#f5d889">PUNCHX • VERIFIED PROFESSIONAL SERVICE</text><text x="76" y="458" font-family="Arial,sans-serif" font-size="13" fill="#d9dde8">${sub}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const materialFor = (category: string, item: string) => {
  const t = `${category} ${item}`.toLowerCase();
  if (t.includes('electric') || t.includes('fan') || t.includes('light') || t.includes('switch') || t.includes('wiring')) return 'Wires, connectors, screws, insulation tape, tester and standard electrical fittings as applicable.';
  if (t.includes('plumb') || t.includes('tap') || t.includes('pipe') || t.includes('toilet') || t.includes('drain')) return 'PTFE tape, sealant, washers, pipe cutters, connectors and standard plumbing fittings as applicable.';
  if (t.includes('carp') || t.includes('wood') || t.includes('furniture') || t.includes('door')) return 'Screws, hinges, handles, drill, measuring tape, adhesive and wood/board components as applicable.';
  if (t.includes('paint') || t.includes('waterproof')) return 'Primer, putty, paint/coating, rollers, brushes, masking tape and surface-preparation materials as applicable.';
  if (t.includes('clean') || t.includes('pest')) return 'Cleaning agents, microfiber cloths, brushes, vacuum equipment and treatment consumables as applicable.';
  if (t.includes('ac') || t.includes('refrigerator') || t.includes('geyser') || t.includes('appliance')) return 'Cleaning consumables, multimeter, fasteners, connectors and replacement parts only when required.';
  if (t.includes('mobile') || t.includes('computer') || t.includes('electronic')) return 'Diagnostic tools, screwdrivers, cleaning materials and replacement component/part only when selected.';
  if (t.includes('bike') || t.includes('car') || t.includes('mechanic')) return 'Wrenches, sockets, lubricants, diagnostic equipment and replacement parts when required.';
  if (t.includes('garden')) return 'Soil, compost, fertilizer, pruning tools, pots and plant supports when required.';
  if (t.includes('food') || t.includes('cook') || t.includes('baker') || t.includes('cater')) return 'Ingredients, cookware, utensils and consumables are quoted according to menu, quantity and customer selection.';
  if (t.includes('beaut') || t.includes('hair') || t.includes('barber')) return 'Professional scissors, combs, brushes, styling tools and hygiene consumables as applicable.';
  return 'Standard professional tools and consumables are included where applicable; customer-approved replacement materials are charged separately.';
};
