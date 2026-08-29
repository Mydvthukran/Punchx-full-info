import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "";
  res.json({
    enabled: true,
    hasKey: Boolean(mapsKey),
    apiKey: mapsKey,
    mapId: "PUNCHX_MAP_ID",
    attributionId: "gmp_mcp_codeassist_v1_aistudio",
    defaultCenter: { lat: 12.9716, lng: 77.5946 }, // Bengaluru tech corridor center
    maxRadiusKm: 15.0
  });
}
