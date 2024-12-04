/**
 * Imports necessary dependencies and components for the RecipeDetail page.
 *
 * @module RecipeDetail
 */
import { getRecipeById } from "../../../lib/api";
import ImageSelector from "../../../components/ImageSelector.jsx";
import BackButton from "../../../components/BackButton";
import ReviewSection from "@/components/ReviewSection";
import RecipeEdit from "@/components/RecipeEdit";
import Link from "next/link";
import {
  TimeIcon,
  TotalTime,
  ServingsIcon,
  CookIcon,
  NutritionIcon,
  allergenSVGs,
  Instructions
} from "@/components/Svg";
import TextToSpeech from "@/components/TextToSpeech";
import ShoppingList from "@/components/ShoppingList";
import AddRecipeToListButton from "@/components/AddRecipeToListButton";
import { getIngredientUnit } from "@/components/IngredientUnit";

/**
 * Generates metadata for the recipe detail page, including SEO attributes and OpenGraph tags.
 *
 * @async
 * @param {Object} params - The parameters object.
 * @param {string} params.id - The ID of the recipe.
 * @returns {Promise<Object>} Metadata for the recipe or a fallback in case of errors.
 */
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const recipe = await getRecipeById(id);

    if (!recipe) {
      return {
        title: "Recipe Not Found",
        description: "The requested recipe could not be found.",
      };
    }

    const ingredients = Object.keys(recipe.ingredients).join(", ");

    return {
      title: recipe.title,
      description: `${recipe.description.slice(0, 155)}...`,
      keywords: [
        ...recipe.tags,
        "recipe",
        "cooking",
        "food",
        ...ingredients.split(", "),
      ],
      openGraph: {
        title: recipe.title,
        description: recipe.description,
        images: recipe.images.map((image) => ({
          url: image,
          width: 1200,
          height: 630,
          alt: `${recipe.title} - Recipe Image`,
        })),
        type: "article",
        article: {
          publishedTime: recipe.publishedDate,
          modifiedTime: recipe.updatedDate,
          tags: recipe.tags,
        },
      },
      twitter: {
        card: "summary_large_image",
        title: recipe.title,
        description: recipe.description,
        images: recipe.images[0],
      },
      other: {
        "prep-time": recipe.prep,
        "cook-time": recipe.cook,
        "total-time": `${
          parseInt(recipe.prep) + parseInt(recipe.cook)
        } minutes`, // Corrected
        "recipe-yield": recipe.servings,
      },
    };
  } catch (error) {
    return {
      title: "Error Loading Recipe",
      description: "There was an error loading the recipe.",
    };
  }
}

/**
 * Formats nutrition data into a structured array.
 *
 * @param {Object|Array} nutrition - The raw nutrition data.
 * @returns {Array|null} A formatted array of nutrition facts, or null if invalid.
 */

const formatNutritionData = (nutrition) => {
  // If nutrition is already an array, return it
  if (Array.isArray(nutrition)) {
    return nutrition;
  }

  // If nutrition is an object, convert it to array format
  if (nutrition && typeof nutrition === "object") {
    return Object.entries(nutrition).map(([label, value]) => {
      // Handle cases where value might be a string with unit
      if (typeof value === "string") {
        const match = value.match(/(\d+(?:\.\d+)?)\s*(\w+)?/);
        if (match) {
          return {
            label,
            value: match[1],
            unit: match[2] || "",
          };
        }
      }
      // Handle cases where value is a number
      return {
        label,
        value: value.toString(),
        unit: "",
      };
    });
  }

  // If nutrition is not in a valid format, return null
  return null;
};

// Define addToShoppingList outside try-catch block
// const { addToShoppingList } = useShoppingList();

/**
 * Fetches allergens associated with a recipe by its ID.
 *
 * @async
 * @param {string} recipeId - The ID of the recipe.
 * @returns {Promise<Array>} A list of allergens or an empty array in case of errors.
 */

async function getAllergensByRecipeId(recipeId) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  console.log("API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

  try {
    const response = await fetch(`${API_BASE_URL}/api/allergens/${recipeId}`);
    const data = await response.json();
    return data.allergens || [];
  } catch (error) {
    console.error("Error fetching allergens:", error);
    return [];
  }
}

export default async function RecipeDetail({ params }) {
  const { id } = params;

  let recipe;
  try {
    recipe = await getRecipeById(id);

    const allergens = await getAllergensByRecipeId(id);

    recipe.allergens = allergens;
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-4 dark:bg-gray-700">
          <p className="text-red-500 font-medium dark:text-red-400">
            Error: {error.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg transition-colors hover:bg-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-teal-400 dark:hover:bg-teal-500"
            >
              Retry
            </button>
            <Link href="/">
              <button className="px-6 py-2 bg-teal-500 text-white rounded-lg transition-colors hover:bg-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-teal-400 dark:hover:bg-teal-500">
                Return to HomePage
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="bg-white p-8 rounded-2xl shadow-lg dark:bg-gray-700">
          <p className="text-gray-700 font-medium dark:text-gray-300">
            Recipe not found
          </p>
        </div>
      </div>
    );
  }

  // Fetch allergens data
  let allergensData;
  try {
    const response = await fetch("http://localhost:3000/api/allergens");
    const data = await response.json();
    allergensData = data.allergens;
  } catch (error) {
    console.error("Error fetching allergens:", error);
    allergensData = [];
  }

  // Check for allergens in the recipe ingredients
  const recipeIngredients = Object.keys(recipe.ingredients);
  const presentAllergens = allergensData.filter((allergen) =>
    recipeIngredients.some((ingredient) =>
      ingredient.toLowerCase().includes(allergen.toLowerCase())
    )
  );

  // Calculate total time
  const prepTime = parseInt(recipe.prep) || 0;
  const cookTime = parseInt(recipe.cook) || 0;
  const totalTime = prepTime + cookTime;

  // Format nutrition data
  const nutritionData = formatNutritionData(recipe.nutrition);

  return (
    <div className="font-sans pt-16 min-h-screen dark:bg-gray-900">
      {/* Fixed position back button */}
      <div className="absolute top-2 -left-[5rem] z-10">
        <BackButton className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-2 hover:bg-white transition-colors dark:bg-gray-800 dark:hover:bg-gray-700" />
      </div>
      <div className="px-4 py-8 lg:py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Image Gallery Section */}
          <div className="w-full lg:h-fit lg:sticky lg:top-20 lg:self-start">
            <div className="group relative bg-white rounded-2xl p-2 shadow-sm overflow-hidden dark:bg-gray-800">
              <ImageSelector images={recipe.images} />
            </div>
          </div>
          {/* Recipe Details Section */}
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm dark:bg-gray-700">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
                {recipe.title}
              </h1>
              <p className="text-gray-600 leading-relaxed dark:text-gray-300">
                {recipe.description}
              </p>

              {/* Recipe Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 max-w-3xl mx-auto px-2 sm:px-0">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                  <TimeIcon />
                  <span className="text-sm text-gray-500 font-medium mt-2 dark:text-gray-400">
                    Prep: {recipe.prep}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                  <ServingsIcon />
                  <span className="text-sm text-gray-500 font-medium mt-2 dark:text-gray-400">
                    Serves: {recipe.servings}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                  <CookIcon />
                  <span className="text-sm text-gray-500 font-medium mt-2 dark:text-gray-400">
                    Cook: {recipe.cook}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                  <TotalTime />
                  <span className="text-sm text-gray-500 font-medium mt-2 dark:text-gray-400">
                    Total: {totalTime} min
                  </span>
                </div>
              </div>
            </div>

            {/* Nutrition Section */}
            {nutritionData && nutritionData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <NutritionIcon />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Nutrition Facts
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {nutritionData.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors  dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      <div className="text-lg font-semibold text-teal-700 dark:text-teal-400">
                        {item.value}
                        <span className="text-sm ml-1 text-teal-600 dark:text-teal-300">
                          {item.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display Allergens Section */}
            {presentAllergens.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Allergens
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {presentAllergens.map((allergen, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      {/* Render the allergen SVG if available */}
                      {allergenSVGs[allergen.toLowerCase()] || (
                        <span>No SVG Available</span>
                      )}
                      <div className="text-sm text-gray-500 font-medium mt-2 dark:text-gray-400">
                        {allergen}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm dark:bg-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Ingredients
                </h2>
                <AddRecipeToListButton
                  ingredients={recipe.ingredients}
                  shoppingListId="your-shopping-list-id"
                  recipeName={recipe.title}
                />
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(recipe.ingredients).map(
                  ([ingredient, amount], index) => {
                    const unit = getIngredientUnit(ingredient);
                    return (
                      <li
                        key={index}
                        className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                      >
                        <span className="w-2 h-2 bg-teal-500 rounded-full mr-3 dark:bg-teal-400"></span>
                        <span className="font-medium">
                          {amount} {unit ? `${unit}` : ""}
                        </span>
                        <span className="mx-2">·</span>
                        <span>{ingredient}</span>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>

            {/* Shopping List Section */}
            <div className="mt-8">
              <ShoppingList ingredients={recipe.ingredients} />
            </div>

            {/* Instructions Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm dark:bg-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <TextToSpeech instructions={recipe.instructions} />
              <ol className="mt-4 space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li
                    key={index}
                    className="flex bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-medium mr-4 flex-shrink-0 dark:bg-teal-700 dark:text-teal-300">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-700 leading-relaxed dark:text-gray-300">
                        {step}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Review Section */}
            <div className="mt-8">
              <ReviewSection recipeId={id} />
            </div>

            {/*Decription Editting  */}
            <div className="mt-8">
              <RecipeEdit recipe={recipe} />
            </div>

            {/* Recipe Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm dark:bg-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-3">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-teal-100 text-teal-800 text-sm px-4 py-2 rounded-full dark:bg-teal-700 dark:text-teal-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
