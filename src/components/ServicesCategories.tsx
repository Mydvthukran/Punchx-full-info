export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
}

export interface ServiceSubcategory {
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
  subcategories: ServiceSubcategory[];
}

export const SERVICE_CATALOG: ServiceCategory[] = [
  {
    id: "electrician",
    name: "Electrician",
    description: "Electrical repair, installation and replacement",
    image: "/services/electrician.png",

    subcategories: [
      {
        id: "switch-socket",
        name: "Switch & Socket",
        description: "Repair and replace switches, sockets and plugs",
        image: "/services/switch-socket.png",

        items: [
          {
            id: "switch-repair",
            name: "Switch Repair",
            description: "Repair a damaged or faulty switch",
            price: 69,
            image: "/services/switch-repair.png",
            popular: true
          },
          {
            id: "switch-replacement",
            name: "Switch Replacement",
            description: "Replace an existing electrical switch",
            price: 69,
            image: "/services/switch-replacement.png"
          },
          {
            id: "socket-repair",
            name: "Socket Repair",
            description: "Repair a faulty electrical socket",
            price: 79,
            image: "/services/socket-repair.png"
          },
          {
            id: "socket-replacement",
            name: "Socket Replacement",
            description: "Replace an existing socket",
            price: 79,
            image: "/services/socket-replacement.png"
          },
          {
            id: "plug-replacement",
            name: "Plug Replacement",
            description: "Replace a damaged electrical plug",
            price: 69,
            image: "/services/plug-replacement.png"
          }
        ]
      },

      {
        id: "fan",
        name: "Fan",
        description: "Fan installation, repair and removal",
        image: "/services/fan.png",

        items: [
          {
            id: "fan-repair",
            name: "Fan Repair",
            description: "Repair common fan problems",
            price: 99,
            image: "/services/fan-repair.png",
            popular: true
          },
          {
            id: "fan-installation",
            name: "Fan Installation",
            description: "Install a ceiling or wall fan",
            price: 149,
            image: "/services/fan-installation.png"
          },
          {
            id: "fan-removal",
            name: "Fan Removal",
            description: "Safely remove an existing fan",
            price: 79,
            image: "/services/fan-removal.png"
          }
        ]
      },

      {
        id: "light",
        name: "Light",
        description: "Lighting repair and installation",
        image: "/services/light.png",

        items: [
          {
            id: "light-repair",
            name: "Light Repair",
            description: "Repair faulty lighting",
            price: 79,
            image: "/services/light-repair.png"
          },
          {
            id: "light-installation",
            name: "Light Installation",
            description: "Install a new light",
            price: 99,
            image: "/services/light-installation.png",
            popular: true
          },
          {
            id: "led-replacement",
            name: "LED Replacement",
            description: "Replace an existing LED light",
            price: 79,
            image: "/services/led-replacement.png"
          }
        ]
      },

      {
        id: "wiring",
        name: "Wiring",
        description: "Electrical wiring inspection and repair",
        image: "/services/wiring.png",

        items: [
          {
            id: "wiring-repair",
            name: "Wiring Repair",
            description: "Repair minor electrical wiring problems",
            price: 129,
            image: "/services/wiring-repair.png"
          },
          {
            id: "wiring-inspection",
            name: "Wiring Inspection",
            description: "Inspect household electrical wiring",
            price: 99,
            image: "/services/wiring-inspection.png"
          },
          {
            id: "new-electric-point",
            name: "New Electrical Point",
            description: "Install a new switch or socket point",
            price: 149,
            image: "/services/new-electric-point.png"
          }
        ]
      },

      {
        id: "mcb-fuse",
        name: "MCB / Fuse",
        description: "MCB and fuse repair and replacement",
        image: "/services/mcb.png",

        items: [
          {
            id: "mcb-replacement",
            name: "MCB Replacement",
            description: "Replace a faulty MCB",
            price: 99,
            image: "/services/mcb-replacement.png"
          },
          {
            id: "fuse-replacement",
            name: "Fuse Replacement",
            description: "Replace a household fuse",
            price: 69,
            image: "/services/fuse-replacement.png"
          },
          {
            id: "mcb-tripping",
            name: "MCB Tripping Diagnosis",
            description: "Find the reason for repeated MCB tripping",
            price: 129,
            image: "/services/mcb-tripping.png",
            popular: true
          }
        ]
      },

      {
        id: "doorbell-security",
        name: "Doorbell & Security",
        description: "Doorbell and basic security device services",
        image: "/services/doorbell.png",

        items: [
          {
            id: "doorbell-repair",
            name: "Doorbell Repair",
            description: "Repair a faulty doorbell",
            price: 79,
            image: "/services/doorbell-repair.png"
          },
          {
            id: "doorbell-installation",
            name: "Doorbell Installation",
            description: "Install a new doorbell",
            price: 99,
            image: "/services/doorbell-installation.png"
          },
          {
            id: "security-installation",
            name: "Security Device Installation",
            description: "Install a basic electrical security device",
            price: 149,
            image: "/services/security-installation.png"
          }
        ]
      }
    ]
  }
];

export function getServiceCategory(categoryId: string) {
  return SERVICE_CATALOG.find(
    category => category.id === categoryId
  );
}

export function getSubcategory(
  categoryId: string,
  subcategoryId: string
) {
  const category = getServiceCategory(categoryId);

  return category?.subcategories.find(
    subcategory => subcategory.id === subcategoryId
  );
}
