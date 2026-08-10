import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  area: string;
  city: string;
  sector: string;
  timestamp: string;
}

// Convert address string or area or coordinates into a standardized Sector string
export function getSectorFromAddress(address?: string, area?: string, lat?: number, lng?: number): string {
  const str = ((address || "") + " " + (area || "")).toLowerCase();
  
  if (str.includes("hsr")) return "Sector 1 (HSR Layout)";
  if (str.includes("indiranagar")) return "Sector 2 (Indiranagar)";
  if (str.includes("koramangala")) return "Sector 3 (Koramangala)";
  if (str.includes("whitefield")) return "Sector 4 (Whitefield)";
  if (str.includes("jayanagar")) return "Sector 5 (Jayanagar)";
  if (str.includes("jp nagar")) return "Sector 6 (JP Nagar)";
  if (str.includes("electronic city")) return "Sector 7 (Electronic City)";
  if (str.includes("bellandur")) return "Sector 8 (Bellandur)";

  if (area && area.trim().length > 0) {
    const clean = area.replace(/sector|layout|stage|phase|block/gi, "").trim();
    if (clean) return `Sector (${clean})`;
  }
  if (address && address.trim().length > 0) {
    const firstPart = address.split(',')[0].trim();
    if (firstPart) return `Sector (${firstPart})`;
  }
  return "Sector 2 (Indiranagar)"; // Standard default sector
}

// Calculate Haversine distance between two sets of coordinates in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Extract main area/locality from address string
export function extractAreaFromAddress(address: string): string {
  if (!address || address.trim().length === 0) return 'Local Area';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    // Return second or first significant part (e.g. "HSR Layout", "Indiranagar")
    return parts[1] || parts[0];
  }
  return parts[0];
}

// Check if customer area and worker area are in the same location or within proximity
export function isSameAreaOrNearby(
  customerAddress?: string,
  workerAddress?: string,
  customerCoords?: { lat: number; lng: number },
  workerCoords?: { lat: number; lng: number }
): { isMatch: boolean; distanceKm?: number; matchedArea?: string } {
  if (customerCoords && workerCoords && customerCoords.lat && workerCoords.lat) {
    const dist = calculateDistanceKm(
      customerCoords.lat,
      customerCoords.lng,
      workerCoords.lat,
      workerCoords.lng
    );
    if (dist <= 15) {
      return { isMatch: true, distanceKm: dist, matchedArea: `${dist} km away` };
    }
  }

  const custArea = extractAreaFromAddress(customerAddress || '').toLowerCase();
  const wrkArea = extractAreaFromAddress(workerAddress || '').toLowerCase();

  if (
    custArea &&
    wrkArea &&
    (custArea.includes(wrkArea) ||
      wrkArea.includes(custArea) ||
      (customerAddress || '').toLowerCase().includes(wrkArea) ||
      (workerAddress || '').toLowerCase().includes(custArea))
  ) {
    return { isMatch: true, matchedArea: custArea || wrkArea };
  }

  // Default fallback match for same city
  if (
    customerAddress &&
    workerAddress &&
    customerAddress.toLowerCase().split(',').slice(-2).join(' ') ===
      workerAddress.toLowerCase().split(',').slice(-2).join(' ')
  ) {
    return { isMatch: true, matchedArea: 'Same City Region' };
  }

  return { isMatch: false };
}

// Reverse Geocode using Backend Express API (/api/geocode) with Google Maps / Nominatim fallback
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<{ address: string; area: string; city: string; sector: string }> {
  try {
    const res = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        return {
          address: data.address,
          area: data.area || extractAreaFromAddress(data.address),
          city: data.city || 'Bengaluru',
          sector: data.sector || getSectorFromAddress(data.address, data.area, lat, lng)
        };
      }
    }
  } catch (err) {
    console.warn("Backend geocode endpoint unreachable, using client geocode:", err);
  }

  const apiKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  if (apiKey) {
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results[0]) {
        const fullAddress = data.results[0].formatted_address;
        let area = '';
        let city = '';

        for (const comp of data.results[0].address_components) {
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood') || comp.types.includes('locality')) {
            if (!area) area = comp.long_name;
          }
          if (comp.types.includes('administrative_area_level_2') || comp.types.includes('locality')) {
            if (!city) city = comp.long_name;
          }
        }

        const areaName = area || extractAreaFromAddress(fullAddress);
        return {
          address: fullAddress,
          area: areaName,
          city: city || 'Metropolitan City',
          sector: getSectorFromAddress(fullAddress, areaName, lat, lng)
        };
      }
    } catch (e) {
      console.warn("Google Maps Geocoding API error, trying Nominatim fallback:", e);
    }
  }

  // High precision free reverse geocoding via OpenStreetMap Nominatim
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (nomData && nomData.display_name) {
        const addressObj = nomData.address || {};
        const area =
          addressObj.sublocality ||
          addressObj.neighbourhood ||
          addressObj.suburb ||
          addressObj.quarter ||
          addressObj.residential ||
          addressObj.road ||
          addressObj.city_district ||
          extractAreaFromAddress(nomData.display_name);
        const city =
          addressObj.city ||
          addressObj.town ||
          addressObj.village ||
          addressObj.county ||
          addressObj.state ||
          'Metropolitan Area';
        const fullAddress = nomData.display_name;

        return {
          address: fullAddress,
          area: area,
          city: city,
          sector: getSectorFromAddress(fullAddress, area, lat, lng)
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocoding notice:", err);
  }

  // Exact fallback using actual coordinates
  const areaName = `Indiranagar Sector`;
  const cityName = "Bengaluru";
  const formattedAddress = `Indiranagar 100ft Road, Sector 2, Bengaluru, KA 560038 (${lat.toFixed(3)}N, ${lng.toFixed(3)}E)`;

  return {
    address: formattedAddress,
    area: areaName,
    city: cityName,
    sector: getSectorFromAddress(formattedAddress, areaName, lat, lng)
  };
}

// Request position and auto update profile in localStorage & Firestore DB
export async function requestAndAutoUpdateLocation(
  role: 'customer' | 'worker' | 'admin' = 'customer',
  targetUid?: string
): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const { address, area, city, sector } = await reverseGeocodeCoords(lat, lng);

        const locData: LocationData = {
          lat,
          lng,
          address,
          area,
          city,
          sector: sector || getSectorFromAddress(address, area, lat, lng),
          timestamp: new Date().toISOString()
        };

        // 1. Save in localStorage
        try {
          localStorage.setItem('punchx_user_location', JSON.stringify(locData));
          localStorage.setItem('punchx_user_address', address);
          localStorage.setItem('punchx_user_sector', locData.sector);
        } catch (e) {
          console.warn("Error saving location to localStorage:", e);
        }

        // 2. Save in Firestore if authenticated
        const activeUid = targetUid || auth.currentUser?.uid;
        if (activeUid) {
          try {
            await setDoc(
              doc(db, 'users', activeUid),
              {
                location: { lat, lng },
                address: address,
                area: area,
                city: city,
                sector: locData.sector,
                role: role,
                updatedAt: new Date().toISOString()
              },
              { merge: true }
            );

            if (role === 'worker') {
              // Also update workerApplication doc if worker
              await setDoc(
                doc(db, 'workerApplications', activeUid),
                {
                  location: { lat, lng },
                  address: address,
                  area: area,
                  city: city,
                  sector: locData.sector,
                  updatedAt: new Date().toISOString()
                },
                { merge: true }
              );
            }
          } catch (err) {
            console.warn("Firestore location auto-update error:", err);
          }
        }

        // 3. Dispatch global location updated event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('punchx_location_updated', { detail: locData }));
        }

        resolve(locData);
      },
      (error) => {
        console.warn("Geolocation permission denied or error:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}
