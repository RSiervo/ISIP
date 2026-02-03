import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client using the required pattern.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Standardized on 'gemini-3-flash-preview' for high-speed performance.
const TEXT_MODEL = "gemini-3-flash-preview";

export async function analyzeSuggestion(message: string): Promise<{ category: string, sentiment: string }> {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
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
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
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
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `As an innovation architect, analyze this idea and explain why it is classified as "${complexity}" complexity. 
      Identify potential technical dependencies, cross-departmental coordination, or resource requirements.
      Keep the explanation concise (2-3 sentences max) and professional.
      
      Title: "${title}"
      Description: "${description}"`,
    });
    return (response.text?.trim() || "Complexity is based on estimated implementation time and required cross-unit coordination.").replace(/[\*#_~`]/g, '');
  } catch (error) {
    console.error("Gemini complexity reasoning failed:", error);
    return "Standard evaluation based on historical data for similar process improvements.";
  }
}

/**
 * OCD AI Agent logic
 */
export async function getOCDAIResponse(userMessage: string, history: {role: 'user' | 'model', parts: [{text: string}]}[]): Promise<string> {
  try {
    const systemInstruction = `You are "OCD AI", a professional and helpful virtual assistant for the I.S.I.P. (Innovation Suggestion & Improvement Portal) at Total Information Management Corp (TIM).
    
    Your goal is to answer all questions about how the system works.
    System Knowledge:
    - ISIP is managed by the Organizational Capability & Design (OCD) team.
    - Key team members: Jas Faith Negru (Cultural shifts & high impact) and Ivy Cua (Process optimization & scaling).
    - Submission process: Identity -> Proposition -> Strategic Impact -> Feasibility -> Confirmation.
    - Anonymity: Users can choose to hide their identity.
    - Tracking: Every submission gets a token like ISIP-XXXXXX.
    - Lifecycle: Review (initial OCD check) -> Pilot (testing) -> Implemented (full rollout).
    - Framework pillars: Productivity, Quality, Experience, Efficiency, Capability, Ways of Working.
    - Review timeline: Typically 14 business days.
    
    CONSTRAINTS:
    - Strictly DO NOT use markdown symbols like asterisks (*) or hashtags (#). Use plain text only.
    - Keep responses concise, clean, and conversational.
    - Always remain professional and supportive of innovation.
    - If you don't know an answer, suggest they contact ocd@tim.com.`;

    const chat = ai.chats.create({
      model: TEXT_MODEL,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history.length > 0 ? history : undefined
    });

    const result = await chat.sendMessage({ message: userMessage });
    
    // Clean all markdown symbols from the response text
    const cleanText = (result.text || "I'm sorry, I encountered an issue processing your request. Please try again or contact the OCD team.")
      .replace(/[\*#_~`]/g, '')
      .replace(/\n\s*\n/g, '\n') // Remove excessive empty lines
      .trim();
      
    return cleanText;
  } catch (error) {
    console.error("OCD AI failed:", error);
    return "The OCD AI node is currently undergoing maintenance. Please reach out to ocd@tim.com for urgent inquiries.";
  }
}