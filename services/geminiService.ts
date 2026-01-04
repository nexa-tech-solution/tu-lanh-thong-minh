
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, Recipe, Language } from "../types";

export const generateRecipes = async (expiringItems: FoodItem[], allItems: FoodItem[], lang: Language): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const listExpiring = expiringItems.length > 0 ? expiringItems.map(i => i.name).join(', ') : "None";
  const listOthers = allItems.filter(i => !expiringItems.find(e => e.id === i.id)).slice(0, 10).map(i => i.name).join(', ');

  const languageMap: Record<Language, string> = {
    vi: "Vietnamese (Tiếng Việt)",
    en: "English",
    ja: "Japanese (日本語)",
    ko: "Korean (한국어)",
    zh: "Chinese (中文)"
  };

  const prompt = `You are a world-class home chef and nutritionist. 
  CRITICAL REQUIREMENT: You MUST respond entirely in the ${languageMap[lang]} language. 
  
  Fridge Content:
  - Priority items (Use these first): ${listExpiring}
  - Supporting items: ${listOthers}
  
  TASK: Suggest EXACTLY 2 delicious recipes. NO MORE, NO LESS.
  Estimate the total calories (kcal) for one serving of each recipe.
  
  Format your response ONLY as a JSON array of 2 objects:
  [
    {
      "id": "recipe1",
      "name": "Recipe Name in ${languageMap[lang]}",
      "ingredients": ["List in ${languageMap[lang]}"],
      "instructions": ["Step-by-step in ${languageMap[lang]}"],
      "reason": "Why this is good in ${languageMap[lang]}",
      "calories": 450
    },
    {
      "id": "recipe2",
      "name": "Recipe Name in ${languageMap[lang]}",
      "ingredients": ["List in ${languageMap[lang]}"],
      "instructions": ["Step-by-step in ${languageMap[lang]}"],
      "reason": "Why this is good in ${languageMap[lang]}",
      "calories": 520
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
        responseSchema: {
          type: Type.ARRAY,
          minItems: 2,
          maxItems: 2,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              reason: { type: Type.STRING },
              calories: { type: Type.INTEGER }
            },
            required: ["id", "name", "ingredients", "instructions", "reason", "calories"]
          }
        }
      }
    });

    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
