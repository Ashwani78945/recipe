import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: { 
            type: Type.STRING,
            description: "The name of the recipe."
        },
        description: { 
            type: Type.STRING,
            description: "A short, appetizing description of the dish."
        },
        prepTime: { 
            type: Type.STRING,
            description: "Preparation time, e.g., '15 minutes'."
        },
        cookTime: { 
            type: Type.STRING,
            description: "Cooking time, e.g., '30 minutes'."
        },
        ingredients: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING,
                description: "A specific ingredient with quantity."
            },
            description: "A list of ingredients required for the recipe, derived from the user's list."
        },
        instructions: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING,
                description: "A single step in the cooking instructions."
            },
            description: "A step-by-step list of instructions to prepare the dish."
        }
    },
    required: ['recipeName', 'description', 'prepTime', 'cookTime', 'ingredients', 'instructions']
};


export async function generateRecipe(userIngredients: string): Promise<Recipe> {
    const prompt = `You are a creative and experienced chef. Your task is to generate a delicious recipe based *only* on the ingredients provided by the user. 
    If the ingredients are not sufficient to create a meaningful recipe, your description should politely state that and suggest adding more items.
    
    User's ingredients: ${userIngredients}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const recipeData = JSON.parse(jsonText);

        return recipeData as Recipe;

    } catch (error) {
        console.error("Error generating recipe:", error);
        throw new Error("Failed to communicate with the recipe AI. Please check your connection and try again.");
    }
}

export async function generateRecipeImage(recipeName: string, recipeDescription: string): Promise<string> {
    const prompt = `A delicious, professionally photographed image of "${recipeName}". ${recipeDescription}. The food should look appetizing and be presented on a clean, modern plate with a blurred background.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in the response.");

    } catch (error) {
        console.error("Error generating recipe image:", error);
        throw new Error("Failed to generate an image for the recipe.");
    }
}

export async function suggestIngredients(currentIngredients: string): Promise<string[]> {
    const prompt = `You are an expert chef's assistant. Based on the user's list of ingredients: "${currentIngredients}", suggest up to 5 common ingredients that would complement them well. Return *only* a comma-separated list of the suggested ingredients. Do not include any introductory text, explanations, or numbering. For example: olive oil, salt, black pepper, onion, garlic`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const suggestionsText = response.text.trim();
        if (!suggestionsText) return [];
        
        // Parse the comma-separated string into an array of trimmed strings
        return suggestionsText.split(',').map(s => s.trim()).filter(Boolean);

    } catch (error) {
        console.error("Error suggesting ingredients:", error);
        throw new Error("Failed to get ingredient suggestions.");
    }
}