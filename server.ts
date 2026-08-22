import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure Backend Google Maps Geocoding & Sector Division API
  app.post("/api/geocode", async (req, res) => {
    try {
      let { lat, lng, address, landmark } = req.body;

      const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
      let fullAddress = address || "";
      let area = "";
      let city = "";

      // Forward geocode if address provided without coordinates
      if ((!lat || !lng) && address && address.trim().length > 2) {
        if (mapsKey) {
          try {
            const gForward = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + (landmark ? ' ' + landmark : ''))}&key=${mapsKey}`);
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
          } catch (gfErr) {
            console.warn("Forward Google Geocode warning:", gfErr);
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
          } catch (nomSearchErr) {
            console.warn("Nominatim forward search warning:", nomSearchErr);
          }
        }
      }

      // If lat/lng are still missing, attempt auto IP detection
      if ((!lat || !lng) && !address) {
        try {
          const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
          const ipLookupUrl = clientIp && !clientIp.startsWith('127.') && !clientIp.startsWith('10.') && !clientIp.startsWith('192.168.')
            ? `https://freeipapi.com/api/json/${clientIp}`
            : `https://freeipapi.com/api/json/`;
          
          const ipRes = await fetch(ipLookupUrl, { headers: { 'User-Agent': 'PunchX-Service-App' } });
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
              lat = ipData.latitude;
              lng = ipData.longitude;
              city = ipData.cityName || ipData.regionName || "";
              area = ipData.cityName || "";
            }
          }
        } catch (ipErr) {
          console.warn("IP Geolocation fallback notice:", ipErr);
        }
      }

      // If coordinates are available, attempt Google Maps Reverse Geocode
      if (lat && lng && mapsKey && (!fullAddress || fullAddress.length < 5)) {
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
        } catch (err) {
          console.warn("Backend Google Maps geocoding error, using fallback:", err);
        }
      }

      // OpenStreetMap Nominatim fallback
      if ((!fullAddress || !area) && lat && lng) {
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
          console.warn("Nominatim fallback warning:", e);
        }
      }

      // BigDataCloud client reverse geocode fallback
      if ((!fullAddress || !area) && lat && lng) {
        try {
          const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            if (bdcData) {
              const locality = bdcData.locality || bdcData.principalSubdivision || "";
              city = city || bdcData.city || locality;
              area = area || locality;
              fullAddress = fullAddress || `${locality ? locality + ', ' : ''}${city || ''}, ${bdcData.countryName || ''}`.trim();
            }
          }
        } catch (e) {
          console.warn("BigDataCloud fallback warning:", e);
        }
      }

      // Default fallbacks if address missing
      if (!fullAddress) {
        fullAddress = address || "Indiranagar 100ft Road, Sector 2, Bengaluru, KA 560038";
      }

      // Clean sector calculation logic
      const rawArea = (area || fullAddress.split(',')[0] || "Indiranagar").trim();
      let sectorName = "";

      const lowerStr = (fullAddress + " " + rawArea).toLowerCase();
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

      return res.json({
        address: fullAddress,
        area: rawArea,
        city: city || "Bengaluru",
        sector: sectorName,
        lat: lat || 12.9716,
        lng: lng || 77.5946
      });
    } catch (err: any) {
      console.error("Geocode backend error:", err);
      return res.status(500).json({ error: "Geocoding failed" });
    }
  });

  // Dedicated Registered Services by Location API Endpoint
  app.post("/api/location-services", async (req, res) => {
    try {
      let { lat, lng, address, landmark } = req.body;
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
  });

  // Dedicated Registered Customers by Worker Location API Endpoint
  app.post("/api/worker-location-customers", async (req, res) => {
    try {
      let { lat, lng, address, landmark } = req.body;
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

      // Standardize Sector
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

      // Sector Specific Registered Customer Pool
      const SECTOR_CUSTOMER_DATABASE: Record<string, Array<{
        id: string;
        name: string;
        phoneMasked: string;
        address: string;
        landmark: string;
        serviceNeeded: string;
        urgency: string;
        distanceKm: number;
        verifiedStatus: string;
        totalPreviousBookings: number;
        rating: number;
      }>> = {
        'Sector 2 (Indiranagar)': [
          {
            id: 'CUST-IN-101',
            name: 'Priya Narayanan',
            phoneMasked: '+91 98450 •••••',
            address: 'Flat 304, Royal Palms, 12th Main Road',
            landmark: 'Near 100ft Road Corner, Indiranagar',
            serviceNeeded: 'AC PCB Diagnostic & Gas Refill',
            urgency: '⚡ Immediate Dispatch (within 15m)',
            distanceKm: 0.4,
            verifiedStatus: 'Verified Resident (Premium)',
            totalPreviousBookings: 6,
            rating: 4.9
          },
          {
            id: 'CUST-IN-102',
            name: 'Vikramaditya Rao',
            phoneMasked: '+91 99002 •••••',
            address: 'Villa 18, Defence Colony, 2nd Avenue',
            landmark: 'Near Chinmaya Mission Hospital',
            serviceNeeded: 'MCB Panel Tripping & Heavy Power Cabling',
            urgency: 'Scheduled: Today 4:30 PM',
            distanceKm: 0.8,
            verifiedStatus: 'Verified Resident (Owner)',
            totalPreviousBookings: 3,
            rating: 5.0
          },
          {
            id: 'CUST-IN-103',
            name: 'Ananya Deshmukh',
            phoneMasked: '+91 97411 •••••',
            address: 'Apt 502, Skyline Residency, CMH Road',
            landmark: 'Opposite Metro Pillar 148',
            serviceNeeded: 'Under-Sink Pipe Leak & Tap Valve Replacement',
            urgency: '⚡ Immediate Dispatch (within 20m)',
            distanceKm: 1.1,
            verifiedStatus: 'Verified Citizen',
            totalPreviousBookings: 5,
            rating: 4.8
          },
          {
            id: 'CUST-IN-104',
            name: 'Siddharth Menon',
            phoneMasked: '+91 96321 •••••',
            address: 'House #44, 4th Cross, HAL 2nd Stage',
            landmark: 'Behind BDA Complex',
            serviceNeeded: 'Deep Kitchen Chimney & Tile Degreasing',
            urgency: 'Scheduled: Tomorrow Morning',
            distanceKm: 1.4,
            verifiedStatus: 'Verified Resident',
            totalPreviousBookings: 2,
            rating: 4.9
          }
        ],
        'Sector 1 (HSR Layout)': [
          {
            id: 'CUST-HSR-201',
            name: 'Rahul Kulkarni',
            phoneMasked: '+91 98860 •••••',
            address: 'Plot 82, 27th Main, Sector 1',
            landmark: 'Near NIFT Campus & HSR Club',
            serviceNeeded: 'Dual Split Inverter AC Servicing',
            urgency: '⚡ Immediate Dispatch (within 15m)',
            distanceKm: 0.5,
            verifiedStatus: 'Verified Resident (Gold)',
            totalPreviousBookings: 8,
            rating: 5.0
          },
          {
            id: 'CUST-HSR-202',
            name: 'Meera Nambiar',
            phoneMasked: '+91 98441 •••••',
            address: 'Apt B-201, Green Glen, 14th Main',
            landmark: 'Near Agara Lake Road',
            serviceNeeded: 'Main Line Concealed Drain Unclogging',
            urgency: '⚡ Priority Dispatch (within 20m)',
            distanceKm: 0.9,
            verifiedStatus: 'Verified Resident',
            totalPreviousBookings: 4,
            rating: 4.8
          },
          {
            id: 'CUST-HSR-203',
            name: 'Karthik Balaji',
            phoneMasked: '+91 97312 •••••',
            address: 'House 112, 19th Main, Sector 2',
            landmark: 'Behind CPWD Quarters',
            serviceNeeded: 'Smart Digital Lock Installation & Wood Trim',
            urgency: 'Scheduled: Today 5:00 PM',
            distanceKm: 1.2,
            verifiedStatus: 'Verified Citizen',
            totalPreviousBookings: 3,
            rating: 4.9
          }
        ],
        'Sector 3 (Koramangala)': [
          {
            id: 'CUST-KOR-301',
            name: 'Rohan Singhania',
            phoneMasked: '+91 99160 •••••',
            address: 'Villa 7, 4th Block, 80ft Road',
            landmark: 'Near Sony World Signal',
            serviceNeeded: 'AC Capacitor Repair & Filter Sterilization',
            urgency: '⚡ Immediate Dispatch (within 15m)',
            distanceKm: 0.6,
            verifiedStatus: 'Verified Resident (Premium)',
            totalPreviousBookings: 7,
            rating: 4.9
          },
          {
            id: 'CUST-KOR-302',
            name: 'Tanvi Gokhale',
            phoneMasked: '+91 98800 •••••',
            address: 'Flat 102, Palm Meadows, 5th Block',
            landmark: 'Opposite Jyoti Nivas College',
            serviceNeeded: 'Emergency Kitchen Water Heater Wiring',
            urgency: '⚡ Priority Dispatch (within 25m)',
            distanceKm: 0.8,
            verifiedStatus: 'Verified Resident',
            totalPreviousBookings: 3,
            rating: 4.85
          }
        ]
      };

      // Default or dynamic fallback customers if exact sector key doesn't match default list
      let sectorCustomers = SECTOR_CUSTOMER_DATABASE[sectorName];
      if (!sectorCustomers || sectorCustomers.length === 0) {
        sectorCustomers = [
          {
            id: `CUST-LOC-001`,
            name: 'Aditya Verma',
            phoneMasked: '+91 98451 •••••',
            address: `Main Boulevard, ${rawArea}`,
            landmark: landmark ? `Near ${landmark}` : `Central ${rawArea}`,
            serviceNeeded: 'AC Cooling Diagnostic & General Service',
            urgency: '⚡ Immediate Dispatch (within 15m)',
            distanceKm: 0.5,
            verifiedStatus: 'Verified Resident',
            totalPreviousBookings: 4,
            rating: 4.9
          },
          {
            id: `CUST-LOC-002`,
            name: 'Sneha Kulkarni',
            phoneMasked: '+91 97312 •••••',
            address: `2nd Cross Avenue, ${rawArea}`,
            landmark: `Opposite Community Park, ${rawArea}`,
            serviceNeeded: 'Electrical Distribution Board Inspection',
            urgency: 'Scheduled: Today 4:00 PM',
            distanceKm: 0.9,
            verifiedStatus: 'Verified Citizen',
            totalPreviousBookings: 2,
            rating: 4.8
          },
          {
            id: `CUST-LOC-003`,
            name: 'Rajesh Nair',
            phoneMasked: '+91 96110 •••••',
            address: `Block 4, Palm Residency, ${rawArea}`,
            landmark: `Behind Commercial Hub, ${rawArea}`,
            serviceNeeded: 'Bathroom Fixture & Concealed Pipe Leak Fix',
            urgency: '⚡ Priority Dispatch (within 20m)',
            distanceKm: 1.3,
            verifiedStatus: 'Verified Resident',
            totalPreviousBookings: 5,
            rating: 5.0
          }
        ];
      }

      return res.json({
        success: true,
        address: fullAddress,
        area: rawArea,
        city: city || "Bengaluru",
        sector: sectorName,
        landmark: landmark || "",
        lat: lat || 12.9716,
        lng: lng || 77.5946,
        totalRegisteredCustomersInLocation: sectorCustomers.length,
        coverageMessage: `Service partner visibility active exclusively for registered customers in ${sectorName}`,
        registeredCustomers: sectorCustomers
      });
    } catch (err: any) {
      console.error("Worker location customers backend error:", err);
      return res.status(500).json({ error: "Failed to resolve registered customers for location" });
    }
  });

  // Secure Server-side Gemini API Route
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt parameter is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is missing on server." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      return res.json({ response: response.text || "No response text generated." });
    } catch (err: any) {
      console.error("Server-side Gemini Error:", err);
      return res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  // Vite integration for development & static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PunchX Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
