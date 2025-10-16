import React, { useState } from 'react';
import { generateRecipe, generateRecipeImage, suggestIngredients } from './services/geminiService';
import { Recipe } from './types';
import RecipeDisplay from './components/RecipeDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const ChefIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5,1.5C10.74,1.5 9.16,2.44 8.25,3.85C8.13,3.64 7.9,3.5 7.5,3.5C6.67,3.5 6,4.17 6,5C6,5.34 6.13,5.64 6.33,5.88C4.9,6.5 4,7.86 4,9.5C4,11.43 5.57,13 7.5,13C7.9,13 8.28,12.93 8.63,12.82C9.5,14.18 10.9,15 12.5,15C14.1,15 15.5,14.18 16.37,12.82C16.72,12.93 17.1,13 17.5,13C19.43,13 21,11.43 21,9.5C21,7.86 20.1,6.5 18.67,5.88C18.87,5.64 19,5.34 19,5C19,4.17 18.33,3.5 17.5,3.5C17.1,3.5 16.87,3.64 16.75,3.85C15.84,2.44 14.26,1.5 12.5,1.5M12.5,3C13.43,3 14.29,3.5 14.8,4.28L15.2,4.84L15.79,4.41C16.19,4.12 16.78,4 17.5,4C17.78,4 18,4.22 18,4.5C18,4.71 17.88,4.89 17.72,4.97L17.2,5.28L17.44,5.85C17.79,6.67 18.5,7.55 18.5,8.5C18.5,9.88 17.38,11 16,11C15.2,11 14.5,10.55 14.13,10L13.5,9.08L12.87,10C12.5,10.55 11.8,11 11,11C9.62,11 8.5,9.88 8.5,8.5C8.5,7.55 9.21,6.67 9.56,5.85L9.8,5.28L9.28,4.97C9.12,4.89 9,4.71 9,4.5C9,4.22 9.22,4 9.5,4C10.22,4 10.81,4.12 11.21,4.41L11.8,4.84L12.2,4.28C12.71,3.5 13.57,3 12.5,3M7.5,15C4.46,15 2,17.24 2,20V22H10A6,6 0 0,1 4.18,17.37C5.45,16.5 6.6,15.82 7.5,15.31V15M17.5,15V15.31C18.4,15.82 19.55,16.5 20.82,17.37A6,6 0 0,1 15,22H23V20C23,17.24 20.54,15 17.5,15Z" />
    </svg>
);


const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setRecipeImage(null);
    setSuggestions([]);
    setSuggestionError(null);

    try {
      const generatedRecipe = await generateRecipe(ingredients);
      setRecipe(generatedRecipe);

      setIsImageLoading(true);
      try {
        const imageUrl = await generateRecipeImage(generatedRecipe.recipeName, generatedRecipe.description);
        setRecipeImage(imageUrl);
      } catch (imgErr: any) {
        console.error("Image generation failed:", imgErr.message);
      } finally {
        setIsImageLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestIngredients = async () => {
    if (!ingredients.trim()) {
      setSuggestionError('Please enter at least one ingredient to get suggestions.');
      return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestions([]);
    try {
      const newSuggestions = await suggestIngredients(ingredients);
      setSuggestions(newSuggestions);
    } catch (err: any) {
      setSuggestionError('Could not get suggestions. Please try again.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSuggestionToIngredients = (suggestion: string) => {
    setIngredients(prev => {
        const trimmedPrev = prev.trim();
        if (trimmedPrev === '') return suggestion;
        if (trimmedPrev.endsWith(',')) return `${trimmedPrev} ${suggestion}`;
        return `${trimmedPrev}, ${suggestion}`;
    });
    setSuggestions(currentSuggestions => currentSuggestions.filter(s => s !== suggestion));
  };


  return (
    <div className="min-h-screen bg-orange-50/50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        <div className="w-full max-w-3xl text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
                <ChefIcon className="w-16 h-16 text-orange-500" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Recipe Generator</h1>
            </div>
            <p className="text-lg text-gray-600 mb-8">
            Got ingredients? Let's turn them into a delicious meal!
            </p>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <label htmlFor="ingredients" className="block text-left text-lg font-semibold mb-2 text-gray-700">
                    Your Available Ingredients
                </label>
                <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="e.g., chicken breast, broccoli, garlic, olive oil, lemon"
                    className="w-full p-3 bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
                    rows={4}
                    disabled={isLoading || isSuggesting}
                />
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleSuggestIngredients}
                        disabled={isLoading || isSuggesting}
                        className="w-full sm:w-auto bg-white border-2 border-orange-500 text-orange-500 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out hover:bg-orange-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                    >
                        {isSuggesting ? 'Thinking...' : 'Suggest Ingredients'}
                    </button>
                    <button
                        onClick={handleGenerateRecipe}
                        disabled={isLoading || isSuggesting}
                        className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Thinking...' : 'Generate Recipe'}
                    </button>
                </div>
                <div className="mt-4 min-h-[4rem]">
                    {suggestionError && <ErrorMessage message={suggestionError} />}
                    {suggestions.length > 0 && !isSuggesting && (
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2 text-left">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => addSuggestionToIngredients(suggestion)}
                                        className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-orange-200 transition"
                                        aria-label={`Add ${suggestion} to ingredients`}
                                    >
                                        + {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="w-full max-w-4xl mt-8">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {recipe && <RecipeDisplay recipe={recipe} imageUrl={recipeImage} isImageLoading={isImageLoading} />}
            {!isLoading && !error && !recipe && (
                <div className="text-center p-8 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl text-gray-500">Your recipe will appear here.</h3>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;