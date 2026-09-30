/**
 * PunchX Service Catalog
 * Complete catalog for all 50 PunchX service categories.
 *
 * Structure:
 * Category
 *   └── Subcategory
 *         └── Service item
 *               ├── Service
 *               ├── Repair
 *               └── Replacement
 */

export type ServiceUnit =
  | "job"
  | "piece"
  | "hour"
  | "item"
  | "sqft"
  | "kg"
  | "day"
  | "visit";

export type ServiceType =
  | "repair"
  | "replacement"
  | "installation"
  | "cleaning"
  | "inspection"
  | "service"
  | "rental";

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  unit?: ServiceUnit;
  serviceType?: ServiceType;
  material?: string;
  minQuantity?: number;
}

export interface ServicesSubcategory {
  id: string;
  name: string;
  description: string;
  image: string;
  items: ServiceItem[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories: ServicesSubcategory[];
}

/* -------------------------------------------------------
   IMAGE HELPER
------------------------------------------------------- */

const categoryImage = (id: string) =>
  `https://source.unsplash.com/900x600/?${encodeURIComponent(
    id.replace(/-/g, " ")
  )}`;

/* -------------------------------------------------------
   MATERIALS
------------------------------------------------------- */

const materialMap: Record<string, string[]> = {
  plumber: [
    "PVC Pipe",
    "CPVC Pipe",
    "GI Pipe",
    "Brass Fitting",
  ],

  electrician: [
    "Copper Wire",
    "Modular Switch",
    "LED Fixture",
    "MCB/Fuse",
  ],

  carpenter: [
    "Plywood",
    "MDF",
    "Wood",
    "Hardware Fitting",
  ],

  painter: [
    "Interior Emulsion",
    "Primer",
    "Enamel",
    "Texture Finish",
  ],

  mason: [
    "Cement",
    "Sand",
    "Brick",
    "Tile Adhesive",
  ],

  beautician: [
    "Professional Products",
    "Skin Care Products",
    "Wax",
    "Makeup Products",
  ],

  barber: [
    "Hair Care Products",
    "Beard Products",
    "Shampoo",
    "Styling Products",
  ],
};

/* -------------------------------------------------------
   ITEM GENERATOR
------------------------------------------------------- */

const makeItems = (
  categoryId: string,
  subId: string,
  itemName: string,
  description: string,
  price: number,
  index: number
): ServiceItem[] => {
  const materials =
    materialMap[categoryId] ?? [
      "Standard Material",
      "Customer Selected Material",
      "Premium Material",
      "Replacement Material",
    ];

  const material = materials[index % materials.length];

  return [
    {
      id: `${categoryId}-${subId}-standard`,
      name: itemName,
      description,
      price,
      image: categoryImage(categoryId),
      popular: index === 0,
      unit: "job",
      serviceType: "service",
      material,
    },

    {
      id: `${categoryId}-${subId}-repair`,
      name: `${itemName} - Repair`,
      description: `Repair service for ${itemName.toLowerCase()}. Required materials or parts can be selected separately.`,
      price: Math.max(39, Math.round(price * 0.8)),
      image: categoryImage(categoryId),
      unit: "job",
      serviceType: "repair",
      material,
    },

    {
      id: `${categoryId}-${subId}-replacement`,
      name: `${itemName} - Replacement`,
      description: `Replacement service for ${itemName.toLowerCase()}. Required material or part can be selected before ordering.`,
      price: Math.max(49, Math.round(price * 0.9)),
      image: categoryImage(categoryId),
      unit: "item",
      serviceType: "replacement",
      material,
    },
  ];
};

/* -------------------------------------------------------
   SUBCATEGORY GENERATOR
------------------------------------------------------- */

const makeSubcategory = (
  categoryId: string,
  name: string,
  description: string,
  price: number,
  index: number
): ServicesSubcategory => {
  const subId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: `${categoryId}-${subId}`,
    name,
    description,
    image: categoryImage(categoryId),

    items: makeItems(
      categoryId,
      subId,
      name,
      description,
      price,
      index
    ),
  };
};

/* =======================================================
   1. ELECTRICIAN
======================================================= */

const electrician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "electrician",
    "Switch & Socket",
    "Switch and socket installation, repair and replacement",
    39,
    0
  ),

  makeSubcategory(
    "electrician",
    "Fan & Light",
    "Fan, light and fixture installation and repair",
    79,
    1
  ),

  makeSubcategory(
    "electrician",
    "Wiring",
    "House wiring and minor electrical connection work",
    99,
    2
  ),

  makeSubcategory(
    "electrician",
    "MCB & DB",
    "MCB, fuse and distribution-board work",
    129,
    3
  ),
];

/* =======================================================
   2. PLUMBER
======================================================= */

const plumber_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "plumber",
    "Pipe Work",
    "PVC, CPVC, GI pipe installation, repair and replacement",
    39,
    0
  ),

  makeSubcategory(
    "plumber",
    "Tap & Faucet",
    "Tap, mixer and faucet installation and repair",
    49,
    1
  ),

  makeSubcategory(
    "plumber",
    "Drainage",
    "Drain blockage, leakage and drainage work",
    79,
    2
  ),

  makeSubcategory(
    "plumber",
    "Bathroom Fittings",
    "Basin, shower, toilet and sanitary fitting",
    99,
    3
  ),
];

/* =======================================================
   3. CARPENTER
======================================================= */

const carpenter_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "carpenter",
    "Furniture Repair",
    "Chair, table and furniture repair",
    99,
    0
  ),

  makeSubcategory(
    "carpenter",
    "Door Work",
    "Door hinge, handle and alignment work",
    79,
    1
  ),

  makeSubcategory(
    "carpenter",
    "Cabinet Work",
    "Cabinet and shelf repair",
    149,
    2
  ),

  makeSubcategory(
    "carpenter",
    "Custom Woodwork",
    "Small custom woodwork",
    199,
    3
  ),
];

/* =======================================================
   4. PAINTER
======================================================= */

const painter_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "painter",
    "Wall Painting",
    "Room and wall painting",
    299,
    0
  ),

  makeSubcategory(
    "painter",
    "Touch Up",
    "Minor paint touch-up",
    149,
    1
  ),

  makeSubcategory(
    "painter",
    "Door Painting",
    "Door and frame painting",
    199,
    2
  ),

  makeSubcategory(
    "painter",
    "Texture & Design",
    "Decorative wall finish",
    399,
    3
  ),
];

/* =======================================================
   5. MASON
======================================================= */

const mason_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "mason",
    "Plaster Repair",
    "Minor wall and plaster repair",
    149,
    0
  ),

  makeSubcategory(
    "mason",
    "Brick Work",
    "Small brick and masonry work",
    199,
    1
  ),

  makeSubcategory(
    "mason",
    "Cement Work",
    "Minor cement repair",
    149,
    2
  ),

  makeSubcategory(
    "mason",
    "Floor Repair",
    "Small floor and civil repair",
    199,
    3
  ),
];

/* =======================================================
   6. BEAUTICIAN
======================================================= */

const beautician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "beautician",
    "Facial",
    "Basic and premium facial services",
    199,
    0
  ),

  makeSubcategory(
    "beautician",
    "Waxing",
    "Face, hand and leg waxing",
    99,
    1
  ),

  makeSubcategory(
    "beautician",
    "Threading",
    "Eyebrow and facial threading",
    39,
    2
  ),

  makeSubcategory(
    "beautician",
    "Makeup",
    "Party and occasion makeup",
    499,
    3
  ),
];

/* =======================================================
   7. BARBER
======================================================= */

const barber_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "barber",
    "Haircut",
    "Basic and styling haircut",
    39,
    0
  ),

  makeSubcategory(
    "barber",
    "Beard",
    "Beard trimming and styling",
    29,
    1
  ),

  makeSubcategory(
    "barber",
    "Hair Care",
    "Hair wash, spa and treatment",
    99,
    2
  ),

  makeSubcategory(
    "barber",
    "Grooming Combo",
    "Haircut and beard combo",
    59,
    3
  ),
];

/* =======================================================
   8. HAIR STYLIST
======================================================= */

const hair_stylist_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "hair-stylist",
    "Haircut",
    "Professional haircut",
    99,
    0
  ),

  makeSubcategory(
    "hair-stylist",
    "Hair Styling",
    "Blow dry and professional styling",
    149,
    1
  ),

  makeSubcategory(
    "hair-stylist",
    "Hair Treatment",
    "Basic hair treatment and spa",
    199,
    2
  ),

  makeSubcategory(
    "hair-stylist",
    "Hair Colour",
    "Basic hair colouring",
    299,
    3
  ),
];

/* =======================================================
   9. TAILOR
======================================================= */

const tailor_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "tailor",
    "Alteration",
    "Pant, shirt and dress alteration",
    49,
    0
  ),

  makeSubcategory(
    "tailor",
    "Stitching",
    "Basic garment stitching",
    149,
    1
  ),

  makeSubcategory(
    "tailor",
    "Blouse",
    "Blouse stitching and alteration",
    199,
    2
  ),

  makeSubcategory(
    "tailor",
    "Custom Fit",
    "Custom fitting service",
    249,
    3
  ),
];

/* =======================================================
   10. FASHION DESIGNER
======================================================= */

const fashion_designer_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "fashion-designer",
    "Custom Dress",
    "Custom dress design",
    399,
    0
  ),

  makeSubcategory(
    "fashion-designer",
    "Design Consultation",
    "Fashion design consultation",
    199,
    1
  ),

  makeSubcategory(
    "fashion-designer",
    "Embroidery",
    "Basic embroidery work",
    299,
    2
  ),

  makeSubcategory(
    "fashion-designer",
    "Outfit Styling",
    "Outfit styling service",
    299,
    3
  ),
];

/* =======================================================
   11. WELDER
======================================================= */

const welder_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "welder",
    "Gate Repair",
    "Small gate repair",
    199,
    0
  ),

  makeSubcategory(
    "welder",
    "Grill Work",
    "Grill repair and welding",
    199,
    1
  ),

  makeSubcategory(
    "welder",
    "Frame Work",
    "Metal frame repair",
    249,
    2
  ),

  makeSubcategory(
    "welder",
    "Custom Welding",
    "Small custom welding job",
    299,
    3
  ),
];

/* =======================================================
   12. FABRICATOR
======================================================= */

const fabricator_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "fabricator",
    "Metal Frame",
    "Custom frame fabrication",
    299,
    0
  ),

  makeSubcategory(
    "fabricator",
    "Railing",
    "Railing repair and fabrication",
    399,
    1
  ),

  makeSubcategory(
    "fabricator",
    "Shelf/Rack",
    "Metal shelf or rack work",
    399,
    2
  ),

  makeSubcategory(
    "fabricator",
    "Custom Fabrication",
    "Small fabrication job",
    499,
    3
  ),
];

/* =======================================================
   13. AC TECHNICIAN
======================================================= */

const ac_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "ac-technician",
    "AC Service",
    "Basic AC service",
    299,
    0
  ),

  makeSubcategory(
    "ac-technician",
    "AC Repair",
    "AC fault diagnosis and repair",
    199,
    1
  ),

  makeSubcategory(
    "ac-technician",
    "Gas Charging",
    "AC gas charging service",
    999,
    2
  ),

  makeSubcategory(
    "ac-technician",
    "Installation",
    "AC installation and uninstallation",
    499,
    3
  ),
];

/* =======================================================
   14. REFRIGERATOR TECHNICIAN
======================================================= */

const refrigerator_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "refrigerator-technician",
    "Diagnosis",
    "Refrigerator inspection",
    149,
    0
  ),

  makeSubcategory(
    "refrigerator-technician",
    "Repair",
    "Basic refrigerator repair",
    199,
    1
  ),

  makeSubcategory(
    "refrigerator-technician",
    "Gas Work",
    "Cooling and gas-related service",
    799,
    2
  ),

  makeSubcategory(
    "refrigerator-technician",
    "Installation",
    "Refrigerator setup and moving support",
    149,
    3
  ),
];

/* =======================================================
   15. WASHING MACHINE TECHNICIAN
======================================================= */

const washing_machine_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "washing-machine-technician",
    "Diagnosis",
    "Washing machine inspection",
    149,
    0
  ),

  makeSubcategory(
    "washing-machine-technician",
    "Repair",
    "Basic washing machine repair",
    199,
    1
  ),

  makeSubcategory(
    "washing-machine-technician",
    "Drain/Pump",
    "Drain and pump service",
    299,
    2
  ),

  makeSubcategory(
    "washing-machine-technician",
    "Installation",
    "Washing machine installation",
    199,
    3
  ),
];

/* =======================================================
   16. MICROWAVE TECHNICIAN
======================================================= */

const microwave_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "microwave-technician",
    "Diagnosis",
    "Microwave inspection",
    149,
    0
  ),

  makeSubcategory(
    "microwave-technician",
    "Repair",
    "Basic microwave repair",
    199,
    1
  ),

  makeSubcategory(
    "microwave-technician",
    "Oven Service",
    "Oven cleaning and service",
    249,
    2
  ),

  makeSubcategory(
    "microwave-technician",
    "Installation",
    "Oven setup service",
    199,
    3
  ),
];

/* =======================================================
   17. RO TECHNICIAN
======================================================= */

const ro_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "ro-technician",
    "RO Service",
    "RO service and cleaning",
    199,
    0
  ),

  makeSubcategory(
    "ro-technician",
    "Filter",
    "Filter replacement labour",
    99,
    1
  ),

  makeSubcategory(
    "ro-technician",
    "Membrane",
    "Membrane replacement labour",
    149,
    2
  ),

  makeSubcategory(
    "ro-technician",
    "Installation",
    "RO installation",
    299,
    3
  ),
];

/* =======================================================
   18. WATER TANK CLEANER
======================================================= */

const water_tank_cleaner_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "water-tank-cleaner",
    "Tank Cleaning",
    "Overhead tank cleaning",
    299,
    0
  ),

  makeSubcategory(
    "water-tank-cleaner",
    "Underground Tank",
    "Underground tank cleaning",
    499,
    1
  ),

  makeSubcategory(
    "water-tank-cleaner",
    "Disinfection",
    "Tank sanitization",
    199,
    2
  ),

  makeSubcategory(
    "water-tank-cleaner",
    "Inspection",
    "Tank condition inspection",
    99,
    3
  ),
];

/* =======================================================
   19. PEST CONTROL
======================================================= */

const pest_control_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "pest-control",
    "Cockroach",
    "Cockroach treatment",
    299,
    0
  ),

  makeSubcategory(
    "pest-control",
    "Ants",
    "Ant treatment",
    199,
    1
  ),

  makeSubcategory(
    "pest-control",
    "Mosquito",
    "Mosquito treatment",
    299,
    2
  ),

  makeSubcategory(
    "pest-control",
    "General Pest",
    "General pest treatment",
    399,
    3
  ),
];

/* =======================================================
   20. CLEANER / HOUSEKEEPER
======================================================= */

const cleaner_housekeeper_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "cleaner-housekeeper",
    "Home Cleaning",
    "Basic home cleaning",
    299,
    0
  ),

  makeSubcategory(
    "cleaner-housekeeper",
    "Kitchen",
    "Kitchen deep cleaning",
    399,
    1
  ),

  makeSubcategory(
    "cleaner-housekeeper",
    "Bathroom",
    "Bathroom deep cleaning",
    199,
    2
  ),

  makeSubcategory(
    "cleaner-housekeeper",
    "Office",
    "Small office cleaning",
    499,
    3
  ),
];

/* =======================================================
   21. COOK
======================================================= */

const cook_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "cook",
    "Daily Cook",
    "Basic daily cooking service",
    299,
    0
  ),

  makeSubcategory(
    "cook",
    "Meal Prep",
    "Meal preparation service",
    249,
    1
  ),

  makeSubcategory(
    "cook",
    "Party Cooking",
    "Small-event cooking",
    699,
    2
  ),

  makeSubcategory(
    "cook",
    "Special Cuisine",
    "Special meal preparation",
    399,
    3
  ),
];

/* =======================================================
   22. BAKER
======================================================= */

const baker_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "baker",
    "Cake",
    "Basic custom cake",
    399,
    0
  ),

  makeSubcategory(
    "baker",
    "Cupcakes",
    "Cupcake order",
    299,
    1
  ),

  makeSubcategory(
    "baker",
    "Cookies",
    "Cookie order",
    249,
    2
  ),

  makeSubcategory(
    "baker",
    "Custom Dessert",
    "Custom dessert order",
    399,
    3
  ),
];

/* =======================================================
   23. CATERER
======================================================= */

const caterer_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "caterer",
    "Small Event",
    "Catering for small gatherings",
    999,
    0
  ),

  makeSubcategory(
    "caterer",
    "Lunch Box",
    "Bulk lunch boxes",
    39,
    1
  ),

  makeSubcategory(
    "caterer",
    "Snacks",
    "Bulk snack service",
    499,
    2
  ),

  makeSubcategory(
    "caterer",
    "Full Catering",
    "Event catering package",
    1499,
    3
  ),
];

/* =======================================================
   24. TIFFIN PROVIDER
======================================================= */

const tiffin_provider_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "tiffin-provider",
    "Daily Tiffin",
    "Single meal tiffin",
    39,
    0
  ),

  makeSubcategory(
    "tiffin-provider",
    "Lunch",
    "Lunch subscription meal",
    39,
    1
  ),

  makeSubcategory(
    "tiffin-provider",
    "Dinner",
    "Dinner subscription meal",
    39,
    2
  ),

  makeSubcategory(
    "tiffin-provider",
    "Monthly Plan",
    "Monthly home-food plan",
    999,
    3
  ),
];

/* =======================================================
   25. LAUNDRY
======================================================= */

const laundry_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "laundry",
    "Wash & Fold",
    "Wash and fold",
    49,
    0
  ),

  makeSubcategory(
    "laundry",
    "Dry Clean",
    "Basic dry-clean item",
    99,
    1
  ),

  makeSubcategory(
    "laundry",
    "Ironing",
    "Ironing per item",
    10,
    2
  ),

  makeSubcategory(
    "laundry",
    "Express",
    "Express laundry service",
    99,
    3
  ),
];

/* =======================================================
   26. IRONING WORKER
======================================================= */

const iron_worker_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "iron-worker",
    "Shirt",
    "Shirt ironing",
    10,
    0
  ),

  makeSubcategory(
    "iron-worker",
    "Trousers",
    "Trouser ironing",
    10,
    1
  ),

  makeSubcategory(
    "iron-worker",
    "Dress",
    "Dress ironing",
    20,
    2
  ),

  makeSubcategory(
    "iron-worker",
    "Bulk Ironing",
    "Bulk clothes ironing",
    99,
    3
  ),
];

/* =======================================================
   27. COBBLER
======================================================= */

const cobbler_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "cobbler",
    "Shoe Repair",
    "Basic shoe repair",
    49,
    0
  ),

  makeSubcategory(
    "cobbler",
    "Sole",
    "Sole repair and replacement labour",
    99,
    1
  ),

  makeSubcategory(
    "cobbler",
    "Polish",
    "Shoe polishing",
    29,
    2
  ),

  makeSubcategory(
    "cobbler",
    "Bag Repair",
    "Basic leather and bag repair",
    79,
    3
  ),
];

/* =======================================================
   28. GARDENER
======================================================= */

const gardener_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "gardener",
    "Garden Cleanup",
    "Garden cleanup",
    199,
    0
  ),

  makeSubcategory(
    "gardener",
    "Plant Care",
    "Plant maintenance",
    99,
    1
  ),

  makeSubcategory(
    "gardener",
    "Trimming",
    "Tree and shrub trimming",
    199,
    2
  ),

  makeSubcategory(
    "gardener",
    "Lawn Care",
    "Lawn maintenance",
    299,
    3
  ),
];

/* =======================================================
   29. SECURITY GUARD
======================================================= */

const security_guard_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "security-guard",
    "Hourly Guard",
    "Short-duration security",
    199,
    0
  ),

  makeSubcategory(
    "security-guard",
    "Event Guard",
    "Event security support",
    499,
    1
  ),

  makeSubcategory(
    "security-guard",
    "Night Guard",
    "Night security shift",
    699,
    2
  ),

  makeSubcategory(
    "security-guard",
    "Gate Duty",
    "Gate and entry security",
    499,
    3
  ),
];

/* =======================================================
   30. DRIVER
======================================================= */

const driver_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "driver",
    "Local Driver",
    "Local driving assistance",
    199,
    0
  ),

  makeSubcategory(
    "driver",
    "Airport Transfer",
    "Airport transfer driving",
    499,
    1
  ),

  makeSubcategory(
    "driver",
    "Outstation",
    "Outstation driving",
    999,
    2
  ),

  makeSubcategory(
    "driver",
    "Hourly Driver",
    "Driver by hour",
    149,
    3
  ),
];

/* =======================================================
   31. BIKE MECHANIC
======================================================= */

const bike_mechanic_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "bike-mechanic",
    "General Service",
    "Bike basic service",
    199,
    0
  ),

  makeSubcategory(
    "bike-mechanic",
    "Brake",
    "Brake adjustment and repair",
    99,
    1
  ),

  makeSubcategory(
    "bike-mechanic",
    "Chain",
    "Chain service",
    99,
    2
  ),

  makeSubcategory(
    "bike-mechanic",
    "Puncture",
    "Puncture repair",
    39,
    3
  ),
];

/* =======================================================
   32. CAR MECHANIC
======================================================= */

const car_mechanic_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "car-mechanic",
    "General Service",
    "Basic car service",
    499,
    0
  ),

  makeSubcategory(
    "car-mechanic",
    "Battery",
    "Battery check and service",
    99,
    1
  ),

  makeSubcategory(
    "car-mechanic",
    "Brake",
    "Brake inspection and repair labour",
    299,
    2
  ),

  makeSubcategory(
    "car-mechanic",
    "Puncture",
    "Car puncture service",
    99,
    3
  ),
];

/* =======================================================
   33. MOBILE REPAIR
======================================================= */

const mobile_repair_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "mobile-repair",
    "Screen",
    "Screen replacement labour",
    199,
    0
  ),

  makeSubcategory(
    "mobile-repair",
    "Battery",
    "Battery replacement labour",
    149,
    1
  ),

  makeSubcategory(
    "mobile-repair",
    "Charging Port",
    "Charging port repair",
    199,
    2
  ),

  makeSubcategory(
    "mobile-repair",
    "Software",
    "Software and reset service",
    99,
    3
  ),
];

/* =======================================================
   34. COMPUTER REPAIR
======================================================= */

const computer_repair_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "computer-repair",
    "Diagnosis",
    "PC and laptop diagnosis",
    99,
    0
  ),

  makeSubcategory(
    "computer-repair",
    "OS & Software",
    "OS and software installation",
    199,
    1
  ),

  makeSubcategory(
    "computer-repair",
    "Hardware",
    "Hardware repair labour",
    249,
    2
  ),

  makeSubcategory(
    "computer-repair",
    "Cleaning",
    "Internal cleaning service",
    149,
    3
  ),
];

/* =======================================================
   35. ELECTRONICS REPAIR
======================================================= */

const electronics_repair_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "electronics-repair",
    "TV",
    "TV diagnosis and repair",
    199,
    0
  ),

  makeSubcategory(
    "electronics-repair",
    "Speaker",
    "Speaker repair",
    149,
    1
  ),

  makeSubcategory(
    "electronics-repair",
    "Inverter",
    "Inverter service",
    199,
    2
  ),

  makeSubcategory(
    "electronics-repair",
    "General Electronics",
    "Other electronics repair",
    199,
    3
  ),
];

/* =======================================================
   36. CCTV TECHNICIAN
======================================================= */

const cctv_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "cctv-technician",
    "Installation",
    "CCTV installation",
    299,
    0
  ),

  makeSubcategory(
    "cctv-technician",
    "Maintenance",
    "CCTV maintenance",
    199,
    1
  ),

  makeSubcategory(
    "cctv-technician",
    "Camera Replacement",
    "Camera replacement labour",
    199,
    2
  ),

  makeSubcategory(
    "cctv-technician",
    "DVR/NVR",
    "DVR and NVR setup",
    299,
    3
  ),
];

/* =======================================================
   37. SOLAR TECHNICIAN
======================================================= */

const solar_technician_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "solar-technician",
    "Panel Cleaning",
    "Solar panel cleaning",
    199,
    0
  ),

  makeSubcategory(
    "solar-technician",
    "Inspection",
    "Solar system inspection",
    149,
    1
  ),

  makeSubcategory(
    "solar-technician",
    "Inverter",
    "Solar inverter service",
    299,
    2
  ),

  makeSubcategory(
    "solar-technician",
    "Installation",
    "Small solar installation labour",
    499,
    3
  ),
];

/* =======================================================
   38. LOCKSMITH
======================================================= */

const locksmith_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "locksmith",
    "Lock Repair",
    "Lock repair",
    99,
    0
  ),

  makeSubcategory(
    "locksmith",
    "Lock Replacement",
    "Lock replacement labour",
    149,
    1
  ),

  makeSubcategory(
    "locksmith",
    "Key Service",
    "Key duplication and service",
    49,
    2
  ),

  makeSubcategory(
    "locksmith",
    "Emergency Unlock",
    "Emergency lock service",
    199,
    3
  ),
];

/* =======================================================
   39. GLASS WORKER
======================================================= */

const glass_worker_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "glass-worker",
    "Glass Fitting",
    "Glass fitting labour",
    199,
    0
  ),

  makeSubcategory(
    "glass-worker",
    "Glass Replacement",
    "Glass replacement labour",
    249,
    1
  ),

  makeSubcategory(
    "glass-worker",
    "Window Glass",
    "Window glass work",
    299,
    2
  ),

  makeSubcategory(
    "glass-worker",
    "Mirror",
    "Mirror fitting",
    199,
    3
  ),
];

/* =======================================================
   40. TILE WORKER
======================================================= */

const tile_worker_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "tile-worker",
    "Tile Repair",
    "Small tile repair",
    149,
    0
  ),

  makeSubcategory(
    "tile-worker",
    "Tile Installation",
    "Tile installation labour",
    299,
    1
  ),

  makeSubcategory(
    "tile-worker",
    "Marble",
    "Marble fitting and repair",
    399,
    2
  ),

  makeSubcategory(
    "tile-worker",
    "Grouting",
    "Grouting service",
    199,
    3
  ),
];

/* =======================================================
   41. WATERPROOFING
======================================================= */

const waterproofing_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "waterproofing",
    "Bathroom",
    "Bathroom waterproofing repair",
    399,
    0
  ),

  makeSubcategory(
    "waterproofing",
    "Roof",
    "Roof waterproofing service",
    499,
    1
  ),

  makeSubcategory(
    "waterproofing",
    "Wall",
    "Wall damp-proof treatment",
    399,
    2
  ),

  makeSubcategory(
    "waterproofing",
    "Leakage",
    "Leakage inspection and repair",
    199,
    3
  ),
];

/* =======================================================
   42. FALSE CEILING
======================================================= */

const false_ceiling_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "false-ceiling",
    "POP Repair",
    "POP repair",
    199,
    0
  ),

  makeSubcategory(
    "false-ceiling",
    "Gypsum",
    "Gypsum ceiling repair",
    299,
    1
  ),

  makeSubcategory(
    "false-ceiling",
    "Ceiling Installation",
    "Small ceiling installation labour",
    499,
    2
  ),

  makeSubcategory(
    "false-ceiling",
    "Design",
    "Decorative ceiling work",
    599,
    3
  ),
];

/* =======================================================
   43. SOFA CLEANER
======================================================= */

const sofa_cleaner_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "sofa-cleaner",
    "Sofa",
    "Sofa cleaning",
    299,
    0
  ),

  makeSubcategory(
    "sofa-cleaner",
    "Carpet",
    "Carpet cleaning",
    199,
    1
  ),

  makeSubcategory(
    "sofa-cleaner",
    "Mattress",
    "Mattress cleaning",
    249,
    2
  ),

  makeSubcategory(
    "sofa-cleaner",
    "Chair",
    "Chair and upholstery cleaning",
    99,
    3
  ),
];

/* =======================================================
   44. INTERIOR DECORATOR
======================================================= */

const interior_decorator_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "interior-decorator",
    "Room Decor",
    "Room decoration consultation",
    299,
    0
  ),

  makeSubcategory(
    "interior-decorator",
    "Furniture Layout",
    "Furniture and layout planning",
    199,
    1
  ),

  makeSubcategory(
    "interior-decorator",
    "Wall Decor",
    "Wall decor setup",
    299,
    2
  ),

  makeSubcategory(
    "interior-decorator",
    "Full Interior",
    "Small-space interior service",
    999,
    3
  ),
];

/* =======================================================
   45. EVENT DECORATOR
======================================================= */

const event_decorator_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "event-decorator",
    "Birthday",
    "Birthday decoration",
    499,
    0
  ),

  makeSubcategory(
    "event-decorator",
    "Wedding",
    "Small wedding decoration",
    1499,
    1
  ),

  makeSubcategory(
    "event-decorator",
    "Balloon Decor",
    "Balloon decoration",
    399,
    2
  ),

  makeSubcategory(
    "event-decorator",
    "Stage Decor",
    "Small stage decoration",
    999,
    3
  ),
];

/* =======================================================
   46. PHOTOGRAPHER
======================================================= */

const photographer_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "photographer",
    "Portrait",
    "Portrait photography",
    499,
    0
  ),

  makeSubcategory(
    "photographer",
    "Product",
    "Product photography",
    299,
    1
  ),

  makeSubcategory(
    "photographer",
    "Event",
    "Small-event photography",
    999,
    2
  ),

  makeSubcategory(
    "photographer",
    "Photo Session",
    "Basic photo session",
    699,
    3
  ),
];

/* =======================================================
   47. VIDEOGRAPHER
======================================================= */

const videographer_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "videographer",
    "Event Video",
    "Small-event videography",
    1499,
    0
  ),

  makeSubcategory(
    "videographer",
    "Product Video",
    "Product video shoot",
    699,
    1
  ),

  makeSubcategory(
    "videographer",
    "Short Video",
    "Short-form video shoot",
    499,
    2
  ),

  makeSubcategory(
    "videographer",
    "Editing",
    "Basic video editing",
    299,
    3
  ),
];

/* =======================================================
   48. DJ / SOUND
======================================================= */

const dj_sound_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "dj-sound",
    "DJ",
    "DJ service",
    999,
    0
  ),

  makeSubcategory(
    "dj-sound",
    "Speaker Setup",
    "Speaker setup",
    499,
    1
  ),

  makeSubcategory(
    "dj-sound",
    "Mic Setup",
    "Microphone setup",
    199,
    2
  ),

  makeSubcategory(
    "dj-sound",
    "Sound Package",
    "Small-event sound package",
    1499,
    3
  ),
];

/* =======================================================
   49. ORCHESTRA TEAM
======================================================= */

const orchestra_team_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "orchestra-team",
    "Live Band",
    "Small live-band performance",
    2999,
    0
  ),

  makeSubcategory(
    "orchestra-team",
    "Acoustic",
    "Acoustic music performance",
    1999,
    1
  ),

  makeSubcategory(
    "orchestra-team",
    "Event Performance",
    "Event music performance",
    2499,
    2
  ),

  makeSubcategory(
    "orchestra-team",
    "Full Team",
    "Full orchestra team package",
    4999,
    3
  ),
];

/* =======================================================
   50. PACKER & MOVER
======================================================= */

const packer_mover_subcategories: ServicesSubcategory[] = [
  makeSubcategory(
    "packer-mover",
    "Packing",
    "Household packing service",
    299,
    0
  ),

  makeSubcategory(
    "packer-mover",
    "Loading",
    "Loading and unloading assistance",
    399,
    1
  ),

  makeSubcategory(
    "packer-mover",
    "Local Shifting",
    "Local household shifting",
    999,
    2
  ),

  makeSubcategory(
    "packer-mover",
    "Office Shifting",
    "Small office shifting",
    1499,
    3
  ),
];

/* =======================================================
   COMPLETE PUNCHX CATALOG
======================================================= */

export const serviceCatalogs: ServiceCategory[] = [
  {
    id: "electrician",
    name: "Electrician",
    description:
      "Electrical installation, repair and replacement",
    image: categoryImage("electrician"),
    subcategories: electrician_subcategories,
  },

  {
    id: "plumber",
    name: "Plumber",
    description:
      "Pipes, taps, drainage and bathroom plumbing",
    image: categoryImage("plumber"),
    subcategories: plumber_subcategories,
  },

  {
    id: "carpenter",
    name: "Carpenter",
    description:
      "Furniture, doors, cabinets and woodwork",
    image: categoryImage("carpenter"),
    subcategories: carpenter_subcategories,
  },

  {
    id: "painter",
    name: "Painter",
    description:
      "Interior, exterior and decorative painting",
    image: categoryImage("painter"),
    subcategories: painter_subcategories,
  },

  {
    id: "mason",
    name: "Mason",
    description:
      "Masonry, plastering and civil repair",
    image: categoryImage("mason"),
    subcategories: mason_subcategories,
  },

  {
    id: "beautician",
    name: "Beautician",
    description:
      "Beauty, grooming and salon-at-home services",
    image: categoryImage("beautician"),
    subcategories: beautician_subcategories,
  },

  {
    id: "barber",
    name: "Barber",
    description:
      "Haircut, beard and grooming services",
    image: categoryImage("barber"),
    subcategories: barber_subcategories,
  },

  {
    id: "hair-stylist",
    name: "Hair Stylist",
    description:
      "Hair styling, treatment and grooming",
    image: categoryImage("hair-stylist"),
    subcategories: hair_stylist_subcategories,
  },

  {
    id: "tailor",
    name: "Tailor",
    description:
      "Stitching, alteration and custom tailoring",
    image: categoryImage("tailor"),
    subcategories: tailor_subcategories,
  },

  {
    id: "fashion-designer",
    name: "Fashion Designer",
    description:
      "Custom fashion and design services",
    image: categoryImage("fashion-designer"),
    subcategories: fashion_designer_subcategories,
  },

  {
    id: "welder",
    name: "Welder",
    description:
      "Metal welding, fabrication and repair",
    image: categoryImage("welder"),
    subcategories: welder_subcategories,
  },

  {
    id: "fabricator",
    name: "Fabricator",
    description:
      "Custom metal structures and fabrication",
    image: categoryImage("fabricator"),
    subcategories: fabricator_subcategories,
  },

  {
    id: "ac-technician",
    name: "AC Technician",
    description:
      "AC service, repair and installation",
    image: categoryImage("ac-technician"),
    subcategories: ac_technician_subcategories,
  },

  {
    id: "refrigerator-technician",
    name: "Refrigerator Technician",
    description:
      "Refrigerator service and repair",
    image: categoryImage("refrigerator-technician"),
    subcategories: refrigerator_technician_subcategories,
  },

  {
    id: "washing-machine-technician",
    name: "Washing Machine Technician",
    description:
      "Washing machine service and repair",
    image: categoryImage("washing-machine-technician"),
    subcategories: washing_machine_technician_subcategories,
  },

  {
    id: "microwave-technician",
    name: "Microwave Technician",
    description:
      "Microwave and oven repair",
    image: categoryImage("microwave-technician"),
    subcategories: microwave_technician_subcategories,
  },

  {
    id: "ro-technician",
    name: "RO/Water Purifier Technician",
    description:
      "RO service, filter and installation",
    image: categoryImage("ro-technician"),
    subcategories: ro_technician_subcategories,
  },

  {
    id: "water-tank-cleaner",
    name: "Water Tank Cleaner",
    description:
      "Residential and commercial tank cleaning",
    image: categoryImage("water-tank-cleaner"),
    subcategories: water_tank_cleaner_subcategories,
  },

  {
    id: "pest-control",
    name: "Pest Control",
    description:
      "Home and commercial pest treatment",
    image: categoryImage("pest-control"),
    subcategories: pest_control_subcategories,
  },

  {
    id: "cleaner-housekeeper",
    name: "Cleaner/Housekeeper",
    description:
      "Home and office cleaning",
    image: categoryImage("cleaner-housekeeper"),
    subcategories: cleaner_housekeeper_subcategories,
  },

  {
    id: "cook",
    name: "Cook",
    description:
      "Home cooking and meal preparation",
    image: categoryImage("cook"),
    subcategories: cook_subcategories,
  },

  {
    id: "baker",
    name: "Baker",
    description:
      "Custom baking and cake services",
    image: categoryImage("baker"),
    subcategories: baker_subcategories,
  },

  {
    id: "caterer",
    name: "Caterer",
    description:
      "Small-event and bulk catering",
    image: categoryImage("caterer"),
    subcategories: caterer_subcategories,
  },

  {
    id: "tiffin-provider",
    name: "Tiffin Provider",
    description:
      "Home-cooked meal subscriptions",
    image: categoryImage("tiffin-provider"),
    subcategories: tiffin_provider_subcategories,
  },

  {
    id: "laundry",
    name: "Laundry/Dry Cleaner",
    description:
      "Wash, dry-clean and ironing",
    image: categoryImage("laundry"),
    subcategories: laundry_subcategories,
  },

  {
    id: "iron-worker",
    name: "Ironing Worker",
    description:
      "Clothes ironing and pressing",
    image: categoryImage("iron-worker"),
    subcategories: iron_worker_subcategories,
  },

  {
    id: "cobbler",
    name: "Cobbler/Shoe Repair",
    description:
      "Shoe and leather repair",
    image: categoryImage("cobbler"),
    subcategories: cobbler_subcategories,
  },

  {
    id: "gardener",
    name: "Gardener",
    description:
      "Garden maintenance and plant care",
    image: categoryImage("gardener"),
    subcategories: gardener_subcategories,
  },

  {
    id: "security-guard",
    name: "Security Guard",
    description:
      "Residential and event security",
    image: categoryImage("security-guard"),
    subcategories: security_guard_subcategories,
  },

  {
    id: "driver",
    name: "Driver",
    description:
      "Local driving and vehicle support",
    image: categoryImage("driver"),
    subcategories: driver_subcategories,
  },

  {
    id: "bike-mechanic",
    name: "Bike Mechanic",
    description:
      "Two-wheeler servicing and repair",
    image: categoryImage("bike-mechanic"),
    subcategories: bike_mechanic_subcategories,
  },

  {
    id: "car-mechanic",
    name: "Car Mechanic",
    description:
      "Car servicing and repair",
    image: categoryImage("car-mechanic"),
    subcategories: car_mechanic_subcategories,
  },

  {
    id: "mobile-repair",
    name: "Mobile Repair Technician",
    description:
      "Smartphone repair and replacement",
    image: categoryImage("mobile-repair"),
    subcategories: mobile_repair_subcategories,
  },

  {
    id: "computer-repair",
    name: "Computer/Laptop Technician",
    description:
      "Computer and laptop repair",
    image: categoryImage("computer-repair"),
    subcategories: computer_repair_subcategories,
  },

  {
    id: "electronics-repair",
    name: "Electronics Repair Technician",
    description:
      "TV, speaker and electronics repair",
    image: categoryImage("electronics-repair"),
    subcategories: electronics_repair_subcategories,
  },

  {
    id: "cctv-technician",
    name: "CCTV Technician",
    description:
      "CCTV installation and maintenance",
    image: categoryImage("cctv-technician"),
    subcategories: cctv_technician_subcategories,
  },

  {
    id: "solar-technician",
    name: "Solar Technician",
    description:
      "Solar panel and inverter services",
    image: categoryImage("solar-technician"),
    subcategories: solar_technician_subcategories,
  },

  {
    id: "locksmith",
    name: "Locksmith",
    description:
      "Lock, key and door-lock services",
    image: categoryImage("locksmith"),
    subcategories: locksmith_subcategories,
  },

  {
    id: "glass-worker",
    name: "Glass/Glazier Worker",
    description:
      "Glass cutting, fitting and replacement",
    image: categoryImage("glass-worker"),
    subcategories: glass_worker_subcategories,
  },

  {
    id: "tile-worker",
    name: "Tile/Marble Installer",
    description:
      "Tile, marble and flooring work",
    image: categoryImage("tile-worker"),
    subcategories: tile_worker_subcategories,
  },

  {
    id: "waterproofing",
    name: "Waterproofing Specialist",
    description:
      "Roof, wall and bathroom waterproofing",
    image: categoryImage("waterproofing"),
    subcategories: waterproofing_subcategories,
  },

  {
    id: "false-ceiling",
    name: "POP/False Ceiling Worker",
    description:
      "POP, gypsum and false-ceiling work",
    image: categoryImage("false-ceiling"),
    subcategories: false_ceiling_subcategories,
  },

  {
    id: "sofa-cleaner",
    name: "Upholstery/Sofa Cleaner",
    description:
      "Sofa, carpet and upholstery cleaning",
    image: categoryImage("sofa-cleaner"),
    subcategories: sofa_cleaner_subcategories,
  },

  {
    id: "interior-decorator",
    name: "Interior Decorator",
    description:
      "Home and office interior decoration",
    image: categoryImage("interior-decorator"),
    subcategories: interior_decorator_subcategories,
  },

  {
    id: "event-decorator",
    name: "Event Decorator",
    description:
      "Birthday, wedding and event decoration",
    image: categoryImage("event-decorator"),
    subcategories: event_decorator_subcategories,
  },

  {
    id: "photographer",
    name: "Photographer",
    description:
      "Portrait, product and event photography",
    image: categoryImage("photographer"),
    subcategories: photographer_subcategories,
  },

  {
    id: "videographer",
    name: "Videographer",
    description:
      "Event, product and promotional video",
    image: categoryImage("videographer"),
    subcategories: videographer_subcategories,
  },

  {
    id: "dj-sound",
    name: "DJ/Sound Technician",
    description:
      "DJ, speakers and sound setup",
    image: categoryImage("dj-sound"),
    subcategories: dj_sound_subcategories,
  },

  {
    id: "orchestra-team",
    name: "Orchestra Team",
    description:
      "Live music and event performance",
    image: categoryImage("orchestra-team"),
    subcategories: orchestra_team_subcategories,
  },

  {
    id: "packer-mover",
    name: "Packer & Mover",
    description:
      "Packing, loading, shifting and moving assistance",
    image: categoryImage("packer-mover"),
    subcategories: packer_mover_subcategories,
  },
];

/* =======================================================
   COMPATIBILITY ALIASES
======================================================= */

export const serviceCategories = serviceCatalogs;

export const SERVICE_CATEGORIES = serviceCatalogs;

/* =======================================================
   HELPER FUNCTIONS
======================================================= */

export const getServiceCategory = (
  categoryId: string
): ServiceCategory | undefined => {
  return serviceCatalogs.find(
    (category) => category.id === categoryId
  );
};

export const getServiceSubcategory = (
  categoryId: string,
  subcategoryId: string
): ServicesSubcategory | undefined => {
  return getServiceCategory(categoryId)?.subcategories.find(
    (subcategory) => subcategory.id === subcategoryId
  );
};

export const getServiceItems = (
  categoryId: string,
  subcategoryId: string
): ServiceItem[] => {
  return (
    getServiceSubcategory(
      categoryId,
      subcategoryId
    )?.items ?? []
  );
};

export default serviceCatalogs;
