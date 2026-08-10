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
      const { lat, lng, address } = req.body;

      const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
      let fullAddress = address || "";
      let area = "";
      let city = "";

      if (lat && lng && mapsKey) {
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

      // OpenStreetMap Nominatim fallback if no Google result
      if ((!fullAddress || !area) && lat && lng) {
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'PunchX-Service-App' } }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.display_name) {
              fullAddress = fullAddress || nomData.display_name;
              const addrObj = nomData.address || {};
              area = area || addrObj.sublocality || addrObj.neighbourhood || addrObj.suburb || addrObj.residential || addrObj.road || addrObj.city_district || "";
              city = city || addrObj.city || addrObj.town || addrObj.village || addrObj.county || "Bengaluru";
            }
          }
        } catch (e) {
          console.warn("Nominatim fallback warning:", e);
        }
      }

      // Default fallbacks if address missing
      if (!fullAddress) {
        fullAddress = address || "Indiranagar 100ft Road, Bengaluru, KA 560038";
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
        // Dynamic Sector assignment based on area name or lat/lng
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
