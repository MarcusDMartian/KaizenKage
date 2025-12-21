import { GoogleGenAI } from "@google/genai";

// Initialize AI client lazily to avoid crashes when API key is missing
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) return ai;

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key not configured. AI features will be disabled.");
    return null;
  }

  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
    return null;
  }
};

export const generateRefinedText = async (draft: string, type: 'kaizen' | 'kudos'): Promise<string> => {
  if (!draft || draft.length < 5) return draft;

  const aiClient = getAI();
  if (!aiClient) {
    // AI not available, return original text
    return draft;
  }

  const prompt = type === 'kaizen'
    ? `Rewrite the following problem description for a Kaizen (continuous improvement) proposal. Make it professional, clear, and focused on the impact. Keep it concise (under 50 words). Draft: "${draft}"`
    : `Rewrite the following recognition message to a colleague. Make it warm, encouraging, and enthusiastic. Keep it concise (under 40 words). Draft: "${draft}"`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text?.trim() || draft;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return draft; // Fallback to original text
  }
};
