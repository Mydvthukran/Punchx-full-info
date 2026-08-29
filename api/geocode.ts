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
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
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
}
