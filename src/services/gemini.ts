import { GoogleGenAI } from "@google/genai";

// Initialization helper for server/API side Gemini integration using modern @google/genai SDK
export async function getAIResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_KEY;
  if (!apiKey) {
    return "API Key not configured. Please add GEMINI_API_KEY in Settings > Secrets.";
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userMessage,
    });
    return response.text || "No response received from model.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error calling Gemini: ${error?.message || 'Unknown error'}`;
  }
}
