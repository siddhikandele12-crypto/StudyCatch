import { GoogleGenAI, Type } from "@google/genai";
import { Quiz, StudySummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateQuizFromText = async (text: string): Promise<Quiz> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a quiz based on the following text. Return a JSON object with a title and an array of 5-10 questions. Each question should have a question string, 4 options, the index of the correct answer (0-3), and a brief explanation.
    
    Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    id: crypto.randomUUID(),
    title: data.title,
    questions: data.questions.map((q: any) => ({ ...q, id: crypto.randomUUID() })),
    createdAt: Date.now()
  };
};

export const generateSummaryFromInput = async (input: string, type: 'text' | 'video' | 'image'): Promise<StudySummary> => {
  const prompt = type === 'video' 
    ? `Analyze this video link/content and provide a comprehensive 10-minute summary, 5-10 flashcards, and a hierarchical mindmap structure (at least 3 levels deep).
       Video Input: ${input}`
    : `Analyze this content and provide a comprehensive 10-minute summary, 5-10 flashcards, and a hierarchical mindmap structure (at least 3 levels deep).
       Content Input: ${input}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          },
          mindmap: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    children: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ["name"]
          }
        },
        required: ["title", "summary", "flashcards", "mindmap"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    id: crypto.randomUUID(),
    title: data.title,
    summary: data.summary,
    flashcards: data.flashcards.map((f: any) => ({ ...f, id: crypto.randomUUID() })),
    mindmap: data.mindmap,
    createdAt: Date.now()
  };
};
