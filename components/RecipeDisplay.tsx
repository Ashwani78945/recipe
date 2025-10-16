import React from 'react';
import { Recipe } from '../types';

interface RecipeDisplayProps {
  recipe: Recipe;
  imageUrl: string | null;
  isImageLoading: boolean;
}

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ImagePlaceholder: React.FC = () => (
    <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center text-gray-500" aria-label="Loading image">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-lg font-medium">Creating a delicious visual...</span>
    </div>
);


const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, imageUrl, isImageLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in mt-8 w-full">
      {isImageLoading && <ImagePlaceholder />}
      {imageUrl && !isImageLoading && (
        <img src={imageUrl} alt={recipe.recipeName} className="w-full h-64 object-cover" />
      )}
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{recipe.recipeName}</h2>
        <p className="text-gray-600 mb-6">{recipe.description}</p>

        <div className="flex flex-wrap gap-4 md:gap-8 mb-6 border-t border-b border-gray-200 py-4">
            <div className="flex items-center">
                <ClockIcon />
                <div>
                    <span className="font-semibold text-gray-700">Prep time</span>
                    <p className="text-gray-600">{recipe.prepTime}</p>
                </div>
            </div>
             <div className="flex items-center">
                <ClockIcon />
                <div>
                    <span className="font-semibold text-gray-700">Cook time</span>
                    <p className="text-gray-600">{recipe.cookTime}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-orange-400 pb-2">Ingredients</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-orange-400 pb-2">Instructions</h3>
                <ol className="space-y-4 text-gray-700">
                    {recipe.instructions.map((step, index) => (
                        <li key={index} className="flex items-start">
                           <span className="flex-shrink-0 bg-orange-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-4">{index + 1}</span>
                           <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;
