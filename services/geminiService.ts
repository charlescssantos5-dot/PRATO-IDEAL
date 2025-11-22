import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyDiet, DailyWorkout } from "../types";

const apiKey = process.env.API_KEY || ''; 
// Note: In a real production app, backend proxy is recommended. 
// For this blueprint, we assume the environment variable is injected.

const ai = new GoogleGenAI({ apiKey });

export const generatePlans = async (profile: UserProfile): Promise<{ diet: DailyDiet[], workout: DailyWorkout[] }> => {
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is missing. Please configure process.env.API_KEY");
  }

  const prompt = `
    Generate a 3-day sample diet and workout plan for a user with the following profile:
    Name: ${profile.name}
    Age: ${profile.age}
    Gender: ${profile.gender}
    Weight: ${profile.weight}kg
    Height: ${profile.height}cm
    Goal: ${profile.goal}
    Activity Level: ${profile.activityLevel}

    Language: Portuguese (Brazil).
    
    Requirements:
    - 3 days of diet (Cafe da manha, almoco, jantar, lanche).
    - 3 days of workout routines.
    - Provide specific quantities (grams, units).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diet: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  breakfast: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.STRING },
                      carbs: { type: Type.STRING },
                      fats: { type: Type.STRING },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  lunch: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.STRING },
                      carbs: { type: Type.STRING },
                      fats: { type: Type.STRING },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  dinner: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.STRING },
                      carbs: { type: Type.STRING },
                      fats: { type: Type.STRING },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  snack: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.STRING },
                      carbs: { type: Type.STRING },
                      fats: { type: Type.STRING },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            },
            workout: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return { diet: result.diet, workout: result.workout };
    }
    throw new Error("Failed to generate JSON");

  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback or rethrow
    throw error;
  }
};
