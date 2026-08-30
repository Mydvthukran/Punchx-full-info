export interface ServiceCategoryItem {
  id: string;
  name: string;
  shortDesc: string;
  iconName: string;
  basePrice: number;
  keywords: string[];
}

export const PUNCHX_50_CATEGORIES: ServiceCategoryItem[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    shortDesc: 'Wiring, MCB, switches, short circuits & lighting',
    iconName: 'Zap',
    basePrice: 199,
    keywords: ['electric', 'electrician', 'wire', 'wiring', 'switch', 'light', 'mcb', 'fuse', 'power', 'fan', 'bulb', 'inverter']
  },
  {
    id: 'plumber',
    name: 'Plumber',
    shortDesc: 'Pipe leakages, taps, drainage, bathroom & motor',
    iconName: 'Droplet',
    basePrice: 199,
    keywords: ['plumb', 'plumber', 'pipe', 'leak', 'tap', 'drain', 'flush', 'sink', 'toilet', 'bathroom', 'water', 'motor']
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    shortDesc: 'Furniture repair, hinges, doors, cabinets & wood fitting',
    iconName: 'Hammer',
    basePrice: 249,
    keywords: ['carpent', 'carpenter', 'wood', 'furniture', 'door', 'table', 'chair', 'cabinet', 'hinge', 'lock', 'bed', 'shelf']
  },
  {
    id: 'painter',
    name: 'Painter',
    shortDesc: 'Wall painting, waterproofing, touchups & textures',
    iconName: 'Paintbrush',
    basePrice: 299,
    keywords: ['paint', 'painter', 'wall', 'color', 'polish', 'waterproof', 'primer', 'distemper', 'texture', 'roller']
  },
  {
    id: 'mason',
    name: 'Mason',
    shortDesc: 'Brickwork, tile fixing, plastering & cement repair',
    iconName: 'HardHat',
    basePrice: 349,
    keywords: ['mason', 'brick', 'cement', 'tile', 'plaster', 'wall', 'stone', 'construction', 'flooring', 'grouting']
  },
  {
    id: 'welder',
    name: 'Welder',
    shortDesc: 'Iron grills, gates, metal fabrication & weld fixing',
    iconName: 'Flame',
    basePrice: 299,
    keywords: ['weld', 'welder', 'iron', 'metal', 'gate', 'grill', 'steel', 'fabrication', 'soldering']
  },
  {
    id: 'barber',
    name: 'Barber',
    shortDesc: 'Men haircut, beard trim, styling & grooming at home',
    iconName: 'Scissors',
    basePrice: 149,
    keywords: ['barber', 'haircut', 'shave', 'beard', 'grooming', 'hair', 'trim', 'men haircut', 'salon']
  },
  {
    id: 'hair-stylist',
    name: 'Hair Stylist',
    shortDesc: 'Professional hair cutting, styling, coloring & spa',
    iconName: 'Scissors',
    basePrice: 299,
    keywords: ['hair', 'hair stylist', 'stylist', 'haircut', 'color', 'spa', 'straightening', 'curling', 'blowdry']
  },
  {
    id: 'beautician',
    name: 'Beautician',
    shortDesc: 'Facial, waxing, threading, manicure & skin care',
    iconName: 'Sparkles',
    basePrice: 349,
    keywords: ['beauty', 'beautician', 'facial', 'waxing', 'threading', 'pedicure', 'manicure', 'skin', 'salon', 'makeup']
  },
  {
    id: 'tailor',
    name: 'Tailor',
    shortDesc: 'Clothes alteration, blouse stitching, suits & fitting',
    iconName: 'Scissors',
    basePrice: 149,
    keywords: ['tailor', 'cloth', 'stitch', 'stitching', 'alteration', 'dress', 'suit', 'blouse', 'pants', 'shirt', 'fabric']
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    shortDesc: 'General machinery, engines, generators & tools',
    iconName: 'Wrench',
    basePrice: 249,
    keywords: ['mechanic', 'engine', 'machine', 'generator', 'motor', 'repair', 'tools', 'breakdown']
  },
  {
    id: 'bike-mechanic',
    name: 'Bike Mechanic',
    shortDesc: 'Two-wheeler service, puncture, oil change & tuning',
    iconName: 'Bike',
    basePrice: 199,
    keywords: ['bike', 'motorcycle', 'scooter', 'scooty', 'puncture', 'two wheeler', 'brake', 'engine', 'chain', 'clutch']
  },
  {
    id: 'car-mechanic',
    name: 'Car Mechanic',
    shortDesc: 'Four-wheeler repair, battery jumpstart, inspection & brakes',
    iconName: 'Car',
    basePrice: 399,
    keywords: ['car', 'car mechanic', 'automobile', 'vehicle', 'battery', 'jumpstart', 'tyre', 'brakes', 'four wheeler']
  },
  {
    id: 'ac-technician',
    name: 'AC Technician',
    shortDesc: 'Split/Window AC service, gas filling, PCB & deep jet clean',
    iconName: 'Wind',
    basePrice: 299,
    keywords: ['ac', 'air conditioner', 'ac technician', 'cooling', 'gas', 'jet clean', 'hvac', 'compressor', 'split ac']
  },
  {
    id: 'refrigerator-technician',
    name: 'Refrigerator Technician',
    shortDesc: 'Single/Double door fridge cooling, gas leak & thermostat',
    iconName: 'Snowflake',
    basePrice: 249,
    keywords: ['fridge', 'refrigerator', 'freezer', 'cooling', 'ice', 'compressor', 'defrost', 'thermostat']
  },
  {
    id: 'washing-machine-technician',
    name: 'Washing Machine Technician',
    shortDesc: 'Front/Top load drum repair, motor, spin & drain pipe',
    iconName: 'Waves',
    basePrice: 249,
    keywords: ['washing machine', 'washer', 'dryer', 'drum', 'motor', 'spin', 'drain', 'front load', 'top load']
  },
  {
    id: 'mobile-repair-technician',
    name: 'Mobile Repair Technician',
    shortDesc: 'Screen replacement, battery, charging port & software',
    iconName: 'Smartphone',
    basePrice: 199,
    keywords: ['mobile', 'phone', 'smartphone', 'screen', 'display', 'battery', 'charging', 'iphone', 'android', 'mic']
  },
  {
    id: 'computer-laptop-technician',
    name: 'Computer/Laptop Technician',
    shortDesc: 'OS install, SSD upgrade, slow laptop fix & keyboard',
    iconName: 'Laptop',
    basePrice: 299,
    keywords: ['computer', 'laptop', 'pc', 'macbook', 'desktop', 'windows', 'format', 'ssd', 'ram', 'hardware', 'antivirus']
  },
  {
    id: 'electronics-repair-technician',
    name: 'Electronics Repair Technician',
    shortDesc: 'LED TV, soundbar, microwave, mixer & circuit repair',
    iconName: 'Tv',
    basePrice: 249,
    keywords: ['electronic', 'electronics', 'tv', 'led', 'audio', 'speaker', 'microwave', 'mixer', 'circuit', 'pcb']
  },
  {
    id: 'cctv-technician',
    name: 'CCTV Technician',
    shortDesc: 'Security camera installation, DVR, NVR & mobile sync',
    iconName: 'Video',
    basePrice: 349,
    keywords: ['cctv', 'camera', 'security', 'surveillance', 'dvr', 'nvr', 'ip camera', 'dome', 'bullet', 'night vision']
  },
  {
    id: 'solar-technician',
    name: 'Solar Technician',
    shortDesc: 'Rooftop solar panels, inverter, battery setup & clean',
    iconName: 'Sun',
    basePrice: 399,
    keywords: ['solar', 'solar panel', 'inverter', 'green energy', 'photovoltaic', 'rooftop solar', 'net metering']
  },
  {
    id: 'ro-water-purifier-technician',
    name: 'RO/Water Purifier Technician',
    shortDesc: 'Filter replacement, membrane, TDS tuning & UV candle',
    iconName: 'Droplets',
    basePrice: 199,
    keywords: ['ro', 'water purifier', 'aquaguard', 'kent', 'filter', 'membrane', 'tds', 'pureit', 'water filter']
  },
  {
    id: 'appliance-repair-technician',
    name: 'Appliance Repair Technician',
    shortDesc: 'Geyser, chimney, induction, oven & kitchen appliances',
    iconName: 'Wrench',
    basePrice: 249,
    keywords: ['appliance', 'geyser', 'chimney', 'induction', 'oven', 'otg', 'iron', 'water heater', 'kitchen']
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    shortDesc: 'Key duplication, lock change, door opening & smart locks',
    iconName: 'Key',
    basePrice: 199,
    keywords: ['lock', 'key', 'locksmith', 'door lock', 'duplicate key', 'padlock', 'deadbolt', 'lost key']
  },
  {
    id: 'cleaner-housekeeper',
    name: 'Cleaner/Housekeeper',
    shortDesc: 'Deep home cleaning, kitchen, bathroom, dusting & mopping',
    iconName: 'Sparkles',
    basePrice: 299,
    keywords: ['clean', 'cleaner', 'housekeeping', 'maid', 'deep clean', 'dusting', 'mop', 'bathroom clean', 'kitchen clean']
  },
  {
    id: 'pest-control-worker',
    name: 'Pest Control Worker',
    shortDesc: 'Cockroach gel, termite treatment, bedbugs & mosquito fog',
    iconName: 'Bug',
    basePrice: 399,
    keywords: ['pest', 'pest control', 'termite', 'cockroach', 'bedbug', 'mosquito', 'rat', 'rodent', 'fumigation']
  },
  {
    id: 'gardener',
    name: 'Gardener',
    shortDesc: 'Plant pruning, lawn mowing, repotting & fertilizer care',
    iconName: 'Sprout',
    basePrice: 199,
    keywords: ['garden', 'gardener', 'plant', 'lawn', 'mowing', 'potting', 'fertilizer', 'pruning', 'flowers', 'seeds']
  },
  {
    id: 'cook',
    name: 'Cook',
    shortDesc: 'Daily meals, breakfast, lunch, dinner & special menus',
    iconName: 'Utensils',
    basePrice: 299,
    keywords: ['cook', 'chef', 'food', 'meal', 'dinner', 'lunch', 'breakfast', 'roti', 'curry', 'kitchen']
  },
  {
    id: 'baker',
    name: 'Baker',
    shortDesc: 'Custom birthday cakes, pastries, bread & party desserts',
    iconName: 'Cake',
    basePrice: 349,
    keywords: ['bake', 'baker', 'cake', 'pastry', 'bread', 'bakery', 'birthday cake', 'cupcake', 'cookies', 'dessert']
  },
  {
    id: 'caterer',
    name: 'Caterer',
    shortDesc: 'Event buffet, party food preparation & large gatherings',
    iconName: 'Utensils',
    basePrice: 599,
    keywords: ['cater', 'caterer', 'catering', 'buffet', 'party food', 'function', 'wedding food', 'banquet']
  },
  {
    id: 'tiffin-home-food-provider',
    name: 'Tiffin/Home Food Provider',
    shortDesc: 'Healthy home-cooked daily dabba, thali & subscription',
    iconName: 'Package',
    basePrice: 149,
    keywords: ['tiffin', 'dabba', 'home food', 'thali', 'mess', 'meal box', 'lunch box', 'subscription meal']
  },
  {
    id: 'laundry-dry-cleaner',
    name: 'Laundry/Dry Cleaner',
    shortDesc: 'Doorstep wash, dry cleaning, steam pressing & stain removal',
    iconName: 'Waves',
    basePrice: 149,
    keywords: ['laundry', 'dry clean', 'dry cleaner', 'wash and fold', 'suits', 'curtains', 'stain']
  },
  {
    id: 'ironing-worker',
    name: 'Ironing Worker',
    shortDesc: 'Crisp steam iron, shirt pressing, sarees & daily clothes',
    iconName: 'Sparkles',
    basePrice: 99,
    keywords: ['iron', 'ironing', 'steam iron', 'press', 'clothes press', 'saree iron', 'shirt iron']
  },
  {
    id: 'cobbler-shoe-repairer',
    name: 'Cobbler/Shoe Repairer',
    shortDesc: 'Shoe sole replacement, stitching, heels, bag zips & polish',
    iconName: 'Wrench',
    basePrice: 99,
    keywords: ['cobbler', 'shoe', 'shoe repair', 'sole', 'sandal', 'heel', 'leather', 'boots', 'bag zip']
  },
  {
    id: 'packer-mover',
    name: 'Packer & Mover',
    shortDesc: 'Household relocation, bubble packing, loading & logistics',
    iconName: 'Truck',
    basePrice: 799,
    keywords: ['packer', 'mover', 'packers and movers', 'relocation', 'shifting', 'house shifting', 'moving', 'furniture shifting']
  },
  {
    id: 'delivery-driver',
    name: 'Delivery Driver',
    shortDesc: 'Express city parcel, documents, heavy items & vehicle haul',
    iconName: 'Car',
    basePrice: 199,
    keywords: ['driver', 'delivery', 'delivery driver', 'courier', 'parcel pickup', 'transport', 'cab driver']
  },
  {
    id: 'security-guard',
    name: 'Security Guard',
    shortDesc: 'Residential, event, gate keeping & personal security',
    iconName: 'Shield',
    basePrice: 499,
    keywords: ['security', 'guard', 'security guard', 'gatekeeper', 'bouncer', 'watchman', 'event security']
  },
  {
    id: 'house-painter',
    name: 'House Painter',
    shortDesc: 'Interior/Exterior home painting, stencil & color consulting',
    iconName: 'Paintbrush',
    basePrice: 349,
    keywords: ['house painter', 'painting', 'interior paint', 'exterior paint', 'whitewash', 'distemper', 'texture']
  },
  {
    id: 'pop-false-ceiling-worker',
    name: 'POP/False Ceiling Worker',
    shortDesc: 'Gypsum board ceiling, decorative POP moldings & lights slot',
    iconName: 'Hammer',
    basePrice: 399,
    keywords: ['pop', 'false ceiling', 'gypsum', 'ceiling design', 'cove light', 'plaster of paris', 'moldings']
  },
  {
    id: 'glass-glazier-worker',
    name: 'Glass/Glazier Worker',
    shortDesc: 'Toughened glass partitions, window panes, mirrors & fitting',
    iconName: 'Wrench',
    basePrice: 299,
    keywords: ['glass', 'glazier', 'window glass', 'mirror', 'toughened glass', 'glass partition', 'shower glass']
  },
  {
    id: 'tile-marble-installer',
    name: 'Tile/Marble Installer',
    shortDesc: 'Floor tiling, Italian marble laying, granite cutting & polish',
    iconName: 'HardHat',
    basePrice: 449,
    keywords: ['tile', 'marble', 'granite', 'flooring', 'tiler', 'grout', 'floor polishing', 'countertop']
  },
  {
    id: 'waterproofing-specialist',
    name: 'Waterproofing Specialist',
    shortDesc: 'Roof leakage injection, bathroom seepage & chemical coating',
    iconName: 'Droplets',
    basePrice: 499,
    keywords: ['waterproof', 'waterproofing', 'leakage', 'seepage', 'dampness', 'roof leak', 'chemical coating']
  },
  {
    id: 'fabricator',
    name: 'Fabricator',
    shortDesc: 'Aluminium windows, steel railings, shed & structural metalwork',
    iconName: 'Flame',
    basePrice: 399,
    keywords: ['fabricator', 'fabrication', 'aluminium', 'railing', 'shed', 'steel work', 'iron shed', 'structure']
  },
  {
    id: 'upholstery-sofa-cleaner',
    name: 'Upholstery/Sofa Cleaner',
    shortDesc: 'Sofa shampooing, foam extraction, mattress & rug deep sanitize',
    iconName: 'Sparkles',
    basePrice: 349,
    keywords: ['sofa', 'upholstery', 'sofa clean', 'mattress clean', 'carpet clean', 'shampooing', 'cushion']
  },
  {
    id: 'interior-decorator',
    name: 'Interior Decorator',
    shortDesc: 'Modular kitchen design, wallpaper, lighting & home styling',
    iconName: 'Palette',
    basePrice: 599,
    keywords: ['interior', 'decorator', 'interior design', 'modular kitchen', 'wallpaper', 'home styling', 'wardrobe']
  },
  {
    id: 'event-decorator',
    name: 'Event Decorator',
    shortDesc: 'Stage decoration, flower arch, theme lights & birthday setup',
    iconName: 'Sparkles',
    basePrice: 599,
    keywords: ['event decorator', 'stage decor', 'flowers', 'balloon decor', 'wedding decor', 'party setup', 'lighting']
  },
  {
    id: 'photographer',
    name: 'Photographer',
    shortDesc: 'Portrait photoshoot, events, weddings & product shoots',
    iconName: 'Camera',
    basePrice: 599,
    keywords: ['photo', 'photographer', 'photography', 'shoot', 'portrait', 'wedding', 'event photo', 'camera']
  },
  {
    id: 'videographer',
    name: 'Videographer',
    shortDesc: 'Reels, YouTube recording, wedding cinematography & 4K editing',
    iconName: 'Video',
    basePrice: 699,
    keywords: ['video', 'videographer', 'videography', 'reels', 'youtube', 'shoot', 'cinematography', 'film']
  },
  {
    id: 'dj-sound-technician',
    name: 'DJ/Sound Technician',
    shortDesc: 'Sound setup, DJ party console, PA speakers & stage mic tuning',
    iconName: 'Tv',
    basePrice: 699,
    keywords: ['dj', 'sound', 'sound technician', 'speakers', 'party dj', 'audio console', 'microphones', 'pa system']
  },
  {
    id: 'tutor-home-teacher',
    name: 'Tutor/Home Teacher',
    shortDesc: 'Home tuition for school math, science, languages & competitive exam',
    iconName: 'GraduationCap',
    basePrice: 299,
    keywords: ['tutor', 'teacher', 'home teacher', 'tuition', 'study', 'maths', 'science', 'english', 'coaching']
  }
];

export const SEARCH_CATEGORY_LIST = PUNCHX_50_CATEGORIES;

/**
 * Filter categories instantly as user types.
 * Matches category name, ID, and comprehensive keyword aliases.
 */
export function filterCategories(query: string): ServiceCategoryItem[] {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) {
    return PUNCHX_50_CATEGORIES;
  }

  return PUNCHX_50_CATEGORIES.filter((cat) => {
    if (cat.name.toLowerCase().includes(cleanQuery)) return true;
    if (cat.shortDesc.toLowerCase().includes(cleanQuery)) return true;
    if (cat.id.toLowerCase().includes(cleanQuery)) return true;
    return cat.keywords.some((k) => k.includes(cleanQuery) || cleanQuery.includes(k));
  });
}

/**
 * Checks if a worker's provided category/skill matches a citizen's target category.
 */
export function isCategoryMatching(
  workerSkills: string[] | string | undefined,
  targetCategory: string
): boolean {
  if (!targetCategory || targetCategory.toLowerCase() === 'all' || targetCategory.toLowerCase() === 'all specialties') {
    return true;
  }
  if (!workerSkills) return false;

  const target = targetCategory.toLowerCase().trim();

  let skillsArray: string[] = [];
  if (Array.isArray(workerSkills)) {
    skillsArray = workerSkills;
  } else if (typeof workerSkills === 'string') {
    skillsArray = workerSkills.split(/[,&/|]/).map((s) => s.trim());
  }

  return skillsArray.some((skill) => {
    const s = skill.toLowerCase().trim();
    if (s === target) return true;
    if (s.includes(target) || target.includes(s)) return true;
    
    // Check keyword synonym matching
    const catItem = PUNCHX_50_CATEGORIES.find(c => c.name.toLowerCase() === target || c.id === target);
    if (catItem) {
      if (catItem.keywords.some(kw => s.includes(kw) || kw.includes(s))) return true;
    }
    return false;
  });
}
