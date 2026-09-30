import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "";
  res.json({
    enabled: Boolean(mapsKey),
    hasKey: Boolean(mapsKey),
    apiKey: mapsKey,
    mapId: process.env.PUNCHX_MAP_ID || "",
    attributionId: "gmp_mcp_codeassist_v1_aistudio",
    // PunchX MVP launch city: Kolkata. User coordinates should override this center.
    defaultCenter: { lat: 22.5726, lng: 88.3639 },
    maxRadiusKm: 15.0
  });
}
