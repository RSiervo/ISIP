
import { GoogleGenAI, Type } from "@google/genai";

// Access the injected API Key. 
// Vite will replace 'process.env.API_KEY' with the actual string during build.
const API_KEY = process.env.API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeSuggestion(message: string): Promise<{ category: string, sentiment: string }> {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. Analysis skipped.");
    return { category: "General", sentiment: "Neutral" };
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following employee suggestion for 'ISIP'. 
      Categorize it (e.g., Workplace Environment, IT/Systems, Operations, Benefits, Culture) 
      and determine the sentiment (Positive, Neutral, Negative, or Urgent).
      
      Suggestion: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            sentiment: { type: Type.STRING }
          },
          required: ["category", "sentiment"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"category": "General", "sentiment": "Neutral"}');
    return result;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return { category: "General", sentiment: "Neutral" };
  }
}

export async function evaluateIdea(title: string, description: string, complexity: string, painPoint: string): Promise<{ impactScore: number, feasibilityScore: number }> {
  if (!API_KEY) {
    return { impactScore: 5, feasibilityScore: 5 };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert innovation consultant for TIM (Total Information Management). 
      Evaluate the following employee suggestion based on its title, description, complexity, and pain point.
      
      Assign two scores from 1 to 10:
      1. Impact Score: How much will this improve productivity, cost, or experience?
      2. Feasibility Score: How realistic is it to implement given the complexity level?
      
      Title: "${title}"
      Description: "${description}"
      Pain Point: "${painPoint}"
      Stated Complexity: "${complexity}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            impactScore: { type: Type.NUMBER, description: "1-10 score for potential impact" },
            feasibilityScore: { type: Type.NUMBER, description: "1-10 score for ease of implementation" }
          },
          required: ["impactScore", "feasibilityScore"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"impactScore": 5, "feasibilityScore": 5}');
    // Clamp values to 1-10 just in case
    return {
      impactScore: Math.min(10, Math.max(1, Math.round(result.impactScore))),
      feasibilityScore: Math.min(10, Math.max(1, Math.round(result.feasibilityScore)))
    };
  } catch (error) {
    console.error("Gemini evaluation failed:", error);
    return { impactScore: 5, feasibilityScore: 5 };
  }
}

export async function getComplexityReasoning(title: string, description: string, complexity: string): Promise<string> {
  if (!API_KEY) return "Complexity evaluation currently unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an innovation architect, analyze this idea and explain why it is classified as "${complexity}" complexity. 
      Identify potential technical dependencies, cross-departmental coordination, or resource requirements.
      Keep the explanation concise (2-3 sentences max) and professional.
      
      Title: "${title}"
      Description: "${description}"`,
    });
    return response.text?.trim() || "Complexity is based on estimated implementation time and required cross-unit coordination.";
  } catch (error) {
    console.error("Gemini complexity reasoning failed:", error);
    return "Standard evaluation based on historical data for similar process improvements.";
  }
}
