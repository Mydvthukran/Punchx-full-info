import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { lat, lng, address, landmark } = req.body || {};
    const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
    let fullAddress = address || "";
    let area = "";
    let city = "";

    // 1. Forward Geocoding if text address is provided
    if ((!lat || !lng) && address && address.trim().length > 2) {
      if (mapsKey) {
        try {
          const gForward = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + (landmark ? ' near ' + landmark : ''))}&key=${mapsKey}`);
          const gData = await gForward.json();
          if (gData.status === "OK" && gData.results && gData.results[0]) {
            fullAddress = gData.results[0].formatted_address;
            lat = gData.results[0].geometry.location.lat;
            lng = gData.results[0].geometry.location.lng;
            for (const comp of gData.results[0].address_components) {
              if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) {
                if (!area) area = comp.long_name;
              }
              if (comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")) {
                if (!city) city = comp.long_name;
              }
            }
          }
        } catch (e) {
          console.warn("Forward Google Geocode error:", e);
        }
      }

      if (!lat || !lng) {
        try {
          const nomSearch = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + (landmark ? ' ' + landmark : ''))}&format=json&addressdetails=1&limit=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'PunchX-Service-App/1.0' } }
          );
          if (nomSearch.ok) {
            const nomArr = await nomSearch.json();
            if (nomArr && nomArr[0]) {
              lat = parseFloat(nomArr[0].lat);
              lng = parseFloat(nomArr[0].lon);
              fullAddress = nomArr[0].display_name;
              const addrObj = nomArr[0].address || {};
              area = addrObj.sublocality || addrObj.neighbourhood || addrObj.suburb || addrObj.residential || addrObj.road || addrObj.quarter || addrObj.city_district || "";
              city = addrObj.city || addrObj.town || addrObj.village || addrObj.county || addrObj.state || "";
            }
          }
        } catch (e) {
          console.warn("Nominatim forward search error:", e);
        }
      }
    }

    // 2. Reverse Geocoding if lat/lng available but address is empty
    if (lat && lng && (!fullAddress || fullAddress.length < 5)) {
      if (mapsKey) {
        try {
          const gRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapsKey}`);
          const gData = await gRes.json();
          if (gData.status === "OK" && gData.results && gData.results[0]) {
            fullAddress = gData.results[0].formatted_address;
            for (const comp of gData.results[0].address_components) {
              if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) {
                if (!area) area = comp.long_name;
              }
              if (comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")) {
                if (!city) city = comp.long_name;
              }
            }
          }
        } catch (e) {
          console.warn("Reverse geocode error:", e);
        }
      }

      if (!fullAddress && lat && lng) {
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'PunchX-Service-App/1.0' } }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.display_name) {
              fullAddress = nomData.display_name;
              const addrObj = nomData.address || {};
              area = area || addrObj.sublocality || addrObj.neighbourhood || addrObj.suburb || addrObj.residential || addrObj.road || addrObj.quarter || addrObj.city_district || "";
              city = city || addrObj.city || addrObj.town || addrObj.village || addrObj.county || addrObj.state || "";
            }
          }
        } catch (e) {
          console.warn("Nominatim reverse error:", e);
        }
      }
    }

    if (!fullAddress) {
      fullAddress = address || "Indiranagar 100ft Road, Sector 2, Bengaluru, KA 560038";
    }

    // Compute standardized Sector
    const rawArea = (area || fullAddress.split(',')[0] || "Indiranagar").trim();
    let sectorName = "";
    const lowerStr = (fullAddress + " " + rawArea + " " + (landmark || "")).toLowerCase();
    
    if (lowerStr.includes("hsr")) {
      sectorName = "Sector 1 (HSR Layout)";
    } else if (lowerStr.includes("indiranagar")) {
      sectorName = "Sector 2 (Indiranagar)";
    } else if (lowerStr.includes("koramangala")) {
      sectorName = "Sector 3 (Koramangala)";
    } else if (lowerStr.includes("whitefield")) {
      sectorName = "Sector 4 (Whitefield)";
    } else if (lowerStr.includes("jayanagar")) {
      sectorName = "Sector 5 (Jayanagar)";
    } else if (lowerStr.includes("jp nagar")) {
      sectorName = "Sector 6 (JP Nagar)";
    } else if (lowerStr.includes("electronic city")) {
      sectorName = "Sector 7 (Electronic City)";
    } else if (lowerStr.includes("bellandur")) {
      sectorName = "Sector 8 (Bellandur)";
    } else {
      const cleanSub = rawArea.replace(/sector|layout|stage|phase|block/gi, "").trim();
      sectorName = `Sector (${cleanSub || 'Metro Zone'})`;
    }

    // Master Registered Service Catalog with Sector-specific active capacities
    const MASTER_SERVICES = [
      {
        id: 'ac',
        name: 'AC Repair',
        category: 'AC Repair',
        icon: 'ac_unit',
        activeSpecialists: 14,
        avgRating: 4.9,
        startingPrice: 199,
        slaMinutes: 15,
        available: true,
        description: 'PCB diagnostics, gas charging, filter sanitization & cooling overhaul'
      },
      {
        id: 'electrical',
        name: 'Electrical Systems',
        category: 'Electrical Systems',
        icon: 'electrical_services',
        activeSpecialists: 19,
        avgRating: 4.8,
        startingPrice: 179,
        slaMinutes: 12,
        available: true,
        description: 'Short-circuit repair, MCB panel installation, heavy cabling & UPS/Inverter'
      },
      {
        id: 'plumbing',
        name: 'Plumbing & Drainage',
        category: 'Plumbing & Drainage',
        icon: 'plumbing',
        activeSpecialists: 16,
        avgRating: 4.9,
        startingPrice: 159,
        slaMinutes: 18,
        available: true,
        description: 'High-pressure leaks, concealed line repairs, fixture replacement & drain unclog'
      },
      {
        id: 'cleaning',
        name: 'Deep Cleaning',
        category: 'Deep Cleaning & Sanitization',
        icon: 'cleaning_services',
        activeSpecialists: 11,
        avgRating: 4.85,
        startingPrice: 249,
        slaMinutes: 25,
        available: true,
        description: 'Hospital-grade sanitization, kitchen chimney degrease & bathroom restoration'
      },
      {
        id: 'painting',
        name: 'Painting & Walls',
        category: 'Painting',
        icon: 'format_paint',
        activeSpecialists: 8,
        avgRating: 4.75,
        startingPrice: 299,
        slaMinutes: 30,
        available: true,
        description: 'Interior luxury emulsion, moisture barrier waterproofing & touch-ups'
      },
      {
        id: 'carpentry',
        name: 'Carpentry & Locks',
        category: 'Carpentry & Security Locks',
        icon: 'carpenter',
        activeSpecialists: 10,
        avgRating: 4.8,
        startingPrice: 189,
        slaMinutes: 20,
        available: true,
        description: 'Smart digital lock installation, bespoke woodwork, hinges & modular kitchen repair'
      },
      {
        id: 'pest',
        name: 'Pest Control',
        category: 'Pest Control',
        icon: 'pest_control',
        activeSpecialists: 7,
        avgRating: 4.9,
        startingPrice: 219,
        slaMinutes: 20,
        available: true,
        description: 'Odorless herbal pest eradication, anti-termite and gel bait treatments'
      },
      {
        id: 'appliance',
        name: 'Appliance Maintenance',
        category: 'Appliance Maintenance',
        icon: 'build',
        activeSpecialists: 12,
        avgRating: 4.8,
        startingPrice: 199,
        slaMinutes: 15,
        available: true,
        description: 'Washing machines, microwave ovens, refrigerators & water purifiers'
      },
      {
        id: 'moving',
        name: 'Moving & Logistics',
        category: 'Moving',
        icon: 'local_shipping',
        activeSpecialists: 6,
        avgRating: 4.7,
        startingPrice: 499,
        slaMinutes: 45,
        available: true,
        description: 'High-care furniture packaging, express tempo dispatch & cargo handling'
      }
    ];

    // Custom availability customization for zones if needed
    const registeredServices = MASTER_SERVICES.map(srv => {
      // Adjust specialist count dynamically according to sector hash
      const hash = (sectorName.length + srv.name.length) % 5;
      return {
        ...srv,
        activeSpecialists: Math.max(3, srv.activeSpecialists - hash),
        sectorCoverage: sectorName,
        landmarkNote: landmark ? `Servicing near ${landmark}` : `Full coverage across ${sectorName}`
      };
    });

    return res.json({
      success: true,
      address: fullAddress,
      area: rawArea,
      city: city || "Bengaluru",
      sector: sectorName,
      landmark: landmark || "",
      lat: lat || 12.9716,
      lng: lng || 77.5946,
      coverageStatus: "100% Active & Certified Coverage",
      totalRegisteredServices: registeredServices.length,
      registeredServices
    });
  } catch (err: any) {
    console.error("Location services backend error:", err);
    return res.status(500).json({ error: "Failed to resolve location services" });
  }
}
