import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRefinedText = async (draft: string, type: 'kaizen' | 'kudos'): Promise<string> => {
  if (!draft || draft.length < 5) return draft;

  const prompt = type === 'kaizen'
    ? `Rewrite the following problem description for a Kaizen (continuous improvement) proposal. Make it professional, clear, and focused on the impact. Keep it concise (under 50 words). Draft: "${draft}"`
    : `Rewrite the following recognition message to a colleague. Make it warm, encouraging, and enthusiastic. Keep it concise (under 40 words). Draft: "${draft}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || draft;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return draft; // Fallback to original text
  }
};
