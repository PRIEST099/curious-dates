import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Timeline, DebateData, ChatMessage } from '../types';
import { adminService } from './adminService';

const apiKey = process.env.API_KEY || '';
// Initialize the client. We assume API_KEY is available.
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string if Markdown code blocks are present
const cleanJson = (text: string) => {
  return text.replace(/```json\n?|```/g, '').trim();
};

const generateEventImage = async (description: string, isAlternate: boolean): Promise<string | undefined> => {
  try {
    adminService.checkSystemAvailability(); // Check Admin Pause

    const promptPrefix = isAlternate 
      ? "Cinematic digital art, historical style, showing an alternate history scene: " 
      : "Historical illustration, realistic oil painting style, showing: ";

    const model = 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: promptPrefix + description }]
      }
    });

    adminService.trackUsage(model, 'Generate Image'); // Track Usage

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    if (error.message.includes('SYSTEM_PAUSED')) throw error;
    console.warn("Failed to generate image for event:", error);
  }
  return undefined;
};

export const generateAlternateTimeline = async (prompt: string, type: 'historical' | 'alternate'): Promise<Timeline | null> => {
  adminService.checkSystemAvailability(); // Check Admin Pause
  
  const modelId = 'gemini-3-flash-preview'; 

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      events: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["year", "title", "description"]
        }
      }
    },
    required: ["title", "description", "events"]
  };

  const systemInstruction = type === 'alternate'
    ? "You are an expert alternate history author. You create plausible, fascinating timelines based on historical divergences."
    : "You are a rigorous historian. Create an accurate, factual timeline based on the user's topic. Focus on key milestone events.";

  const userPrompt = type === 'alternate'
    ? `Create a detailed historical timeline based on this "What If" premise: "${prompt}". Include 5 to 6 distinct events.`
    : `Create a detailed historical timeline about this topic: "${prompt}". Include 5 to 6 distinct key events.`;

  try {
    // 1. Generate Text Structure
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: systemInstruction
      }
    });

    adminService.trackUsage(modelId, 'Generate Timeline (Text)'); // Track Usage

    const text = response.text;
    if (!text) return null;

    let data;
    try {
      data = JSON.parse(cleanJson(text));
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return null;
    }
    
    if (!data || !data.events || !Array.isArray(data.events)) {
      console.error("Invalid timeline structure received:", data);
      return null;
    }

    // 2. Generate Images in Parallel
    // Note: generateEventImage inside here also calls checkSystemAvailability, 
    // but since we await Promise.all, we should be fine.
    const eventsWithImages = await Promise.all(data.events.map(async (e: any, idx: number) => {
      // Generate image for the event
      const generatedImage = await generateEventImage(e.description, type === 'alternate');
      
      return {
        id: `gen-${idx}-${Date.now()}`,
        year: e.year || "Unknown Date",
        title: e.title || "Untitled Event",
        description: e.description || "No description.",
        // Use generated image, fallback to placeholder if generation fails
        imageUrl: generatedImage || `https://picsum.photos/seed/${idx}${Date.now()}/800/600`
      };
    }));
    
    return {
      id: crypto.randomUUID(),
      title: data.title || "Untitled Timeline",
      description: data.description || "No description available.",
      category: type,
      isGenerated: true,
      events: eventsWithImages
    };
  } catch (error) {
    console.error("Error generating timeline:", error);
    throw error; // Re-throw so UI handles the pause error
  }
};

export const generateDebate = async (eventTitle: string, eventDescription: string): Promise<DebateData | null> => {
  adminService.checkSystemAvailability(); // Check Admin Pause
  
  const modelId = 'gemini-3-pro-preview'; 

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      perspectives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            summary: { type: Type.STRING },
            argument: { type: Type.STRING }
          },
          required: ["name", "role", "summary", "argument"]
        }
      },
      exchanges: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            speaker: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["speaker", "text"]
        }
      },
      questions: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["topic", "perspectives", "exchanges", "questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a historical debate about this event: "${eventTitle}". 
      Context: ${eventDescription}.
      1. Create 2-3 distinct perspectives (e.g., specific historical figures or representative roles).
      2. Create a script of their debate (4-6 exchanges).
      3. Suggest 3 thought-provoking follow-up questions.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: "You are a historical dramatist. You recreate voices from the past to debate pivotal moments with nuance and accuracy."
      }
    });

    adminService.trackUsage(modelId, 'Generate Debate'); // Track Usage

    const text = response.text;
    if (!text) return null;

    let data;
    try {
      data = JSON.parse(cleanJson(text));
    } catch (e) {
      console.error("Failed to parse debate JSON:", text);
      return null;
    }

    if (!data || !Array.isArray(data.perspectives) || !Array.isArray(data.exchanges)) {
      console.error("Invalid debate structure received:", data);
      return null;
    }

    return data as DebateData;
  } catch (error) {
    console.error("Error generating debate:", error);
    throw error;
  }
};

export const askEventSpecificQuestion = async (
  eventTitle: string,
  eventDescription: string,
  question: string
): Promise<string> => {
  try {
    adminService.checkSystemAvailability(); // Check Admin Pause
    
    const modelId = 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Context Event: ${eventTitle}
      Event Description: ${eventDescription}
      
      User Question: ${question}
      
      Answer the user's question directly and concisely based on the event context provided above.`,
    });

    adminService.trackUsage(modelId, 'Ask Question (Event)'); // Track Usage
    
    return response.text || "I couldn't find an answer to that specific question.";
  } catch (error: any) {
    if (error.message.includes('SYSTEM_PAUSED')) return "System is currently paused by admin.";
    console.error("Error answering specific question:", error);
    return "I'm having trouble analyzing this event right now.";
  }
};

export const generateChatResponse = async (
  history: ChatMessage[], 
  currentContext: string,
  userMessage: string
): Promise<string> => {
  try {
    adminService.checkSystemAvailability(); // Check Admin Pause
    
    const modelId = 'gemini-3-flash-preview';

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: `You are a knowledgeable historical assistant for the app "Curious Dates". 
        Use the provided context to answer user questions accurately. 
        Context: ${currentContext || "General History"}.
        Be concise, engaging, and educational.`
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: userMessage });
    
    adminService.trackUsage(modelId, 'Chat'); // Track Usage
    
    return result.text || "I apologize, I couldn't formulate a response at this time.";
  } catch (error: any) {
    if (error.message.includes('SYSTEM_PAUSED')) return "System is currently paused by admin.";
    console.error("Error generating chat response:", error);
    return "I'm having trouble connecting to the history archives right now. Please try again.";
  }
};
