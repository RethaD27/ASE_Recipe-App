import RecipeCard from "./RecipeCard";

/**
 * RecipeGrid Component
 *
 * A React component that displays a grid of recipe cards.
 * It takes a list of recipes and a search query as props
 * and renders each recipe using the RecipeCard component.
 *
 * @component
 * @param {Object} props - Props passed to the component.
 * @param {Array} props.recipes - An array of recipe objects to be displayed.
 * @param {string} props.searchQuery - The current search query for filtering recipes.
 *
 * @example
 * const recipes = [
 *   { _id: '1', name: 'Pasta', ingredients: ['flour', 'tomato'] },
 *   { _id: '2', name: 'Pizza', ingredients: ['cheese', 'bread'] },
 * ];
 * const searchQuery = 'Pasta';
 *
 * <RecipeGrid recipes={recipes} searchQuery={searchQuery} />
 *
 * @returns {JSX.Element} A grid of recipe cards.
 */
export default function RecipeGrid({ recipes, searchQuery }) {
  return (
    <div id="recipes-section" className="pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
