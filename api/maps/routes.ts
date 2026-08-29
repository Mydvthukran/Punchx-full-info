import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { origin, destination, travelMode = "DRIVE" } = req.body || {};
    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and Destination coordinates are required" });
    }

    const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "";
    
    const originLat = typeof origin.lat === 'number' ? origin.lat : 12.9716;
    const originLng = typeof origin.lng === 'number' ? origin.lng : 77.5946;
    const destLat = typeof destination.lat === 'number' ? destination.lat : 12.9610;
    const destLng = typeof destination.lng === 'number' ? destination.lng : 77.5850;

    // Geodesic distance calculation as baseline (Earth radius = 6371km)
    const dLat = ((destLat - originLat) * Math.PI) / 180;
    const dLon = ((destLng - originLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((originLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const directKm = Math.round(6371 * c * 10) / 10;

    let routeDistanceKm = directKm > 0 ? Math.round(directKm * 1.25 * 10) / 10 : 2.5; // driving route has ~1.25 road curvature factor
    let durationMinutes = Math.max(3, Math.round(routeDistanceKm * 3.5)); // ~17 km/h urban speed in Bengaluru
    let polylinePoints: { lat: number; lng: number }[] = [];
    let isLiveGoogleRoute = false;

    // If Google Maps API key is configured, query official Google Maps Directions API
    if (mapsKey) {
      try {
        const gDirRes = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&key=${mapsKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`
        );
        const gDirData = await gDirRes.json();
        if (gDirData.status === "OK" && gDirData.routes && gDirData.routes[0]) {
          const route = gDirData.routes[0];
          const leg = route.legs[0];
          if (leg) {
            routeDistanceKm = Math.round((leg.distance.value / 1000) * 10) / 10;
            durationMinutes = Math.ceil(leg.duration.value / 60);
            isLiveGoogleRoute = true;
            
            if (leg.steps && Array.isArray(leg.steps)) {
              polylinePoints = leg.steps.map((step: any) => ({
                lat: step.end_location.lat,
                lng: step.end_location.lng
              }));
            }
          }
        }
      } catch (gDirErr) {
        console.warn("Google Maps Directions API error:", gDirErr);
      }
    }

    // Generate intermediate smooth interpolation points if polyline empty
    if (polylinePoints.length === 0) {
      const stepsCount = 6;
      for (let i = 0; i <= stepsCount; i++) {
        const fraction = i / stepsCount;
        // Add slight natural road curvature
        const curveOffset = Math.sin(fraction * Math.PI) * 0.003;
        polylinePoints.push({
          lat: originLat + (destLat - originLat) * fraction + curveOffset,
          lng: originLng + (destLng - originLng) * fraction - curveOffset * 0.5
        });
      }
    }

    return res.json({
      success: true,
      distanceKm: routeDistanceKm,
      directDistanceKm: directKm,
      durationMinutes: durationMinutes,
      etaText: `${durationMinutes} mins`,
      isWithin15Km: routeDistanceKm <= 15.0,
      isLiveGoogleRoute,
      waypoints: polylinePoints,
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destLat, lng: destLng }
    });
  } catch (err: any) {
    console.error("Maps routes error:", err);
    return res.status(500).json({ error: "Failed to compute route", message: err?.message });
  }
}
