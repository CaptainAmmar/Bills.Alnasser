import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatStream(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are Nexus AI, a sophisticated workspace assistant. Provide concise, expert-level advice on productivity, coding, and strategic planning. Use markdown for structure. Keep responses punchy and highly professional.",
      }
    });

    return responseStream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
