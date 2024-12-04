import { Suspense } from "react";
import RecipeGrid from "@/components/RecipeGrid";
import Pagination from "@/components/Pagination";
import { getRecipes, getCategories, getTags, getIngredients } from "@/lib/api";
import FilterSection from "@/components/FilterSection";
import Loader from "@/components/Loader";
import ClearFiltersButton from "@/components/ClearFiltersButton";
import RecipeCarousel from "@/components/RecipeCarousel";
import { SearchIcon } from "@/components/Svg";

export const metadata = {
  title: "Culinary Haven: Online Recipes | SA's leading online recipe app",
  description:
    "Browse through our collection of delicious recipes. Find everything from quick weeknight dinners to gourmet dishes.",
  openGraph: {
    title: "Culinary Haven: Online Recipes | SA's leading online recipe app",
    description:
      "Browse through our collection of delicious recipes. Find everything from quick weeknight dinners to gourmet dishes.",
  },
};

/**
 * ResultsSummary component that displays a summary of the filtered results.
 * It shows the total number of matching recipes, and details about any active filters such as tags, ingredients, etc.
 *
 * @param {Object} props - The component's props.
 * @param {number} props.total - The total number of recipes that match the search criteria.
 * @param {Object} props.filters - The active filters applied to the search.
 * @returns {JSX.Element} The rendered component.
 */
function ResultsSummary({ total, filters }) {
  const { tags, numberOfSteps, ingredients, category, search } = filters;

  return (
    <div className="flex items-center gap-2 mt-4 text-gray-600 font-medium">
      <SearchIcon className="w-4 h-4" />
      <span>
        {total.toLocaleString()} matching {total === 1 ? "recipe" : "recipes"}
        {tags?.length > 0 && (
          <span className="ml-2">
            (filtered by {tags.length}
            {tags.length === 1 ? " tag" : " tags"})
          </span>
        )}
        {numberOfSteps && (
          <span className="ml-2">(with {numberOfSteps} steps)</span>
        )}
        {ingredients?.length > 0 && (
          <span className="ml-2">
            (filtered by {ingredients.length}
            {ingredients.length === 1 ? " ingredient" : " ingredients"})
          </span>
        )}
        {category && <span className="ml-2">(in {category})</span>}
        {search && <span className="ml-2">(matching {search})</span>}
      </span>
    </div>
  );
}

/**
 * NoResults component that displays a message when no recipes match the search filters.
 * It also includes a button to clear the current filters.
 *
 * @param {Object} props - The component's props.
 * @param {boolean} props.hasFilters - A flag indicating whether filters are applied.
 * @returns {JSX.Element} The rendered component.
 */
function NoResults({ hasFilters }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">
        No recipes found
        {hasFilters && " matching the selected filters"}.
      </p>
      <ClearFiltersButton />
    </div>
  );
}

/**
 * Home component that renders the main recipe search page.
 * This component handles the search functionality, filters, and pagination
 * for the recipe listings. It fetches the necessary data, including recipes, categories, tags, and ingredients,
 * and displays the results in a grid layout. It also includes a recipe carousel and pagination controls.
 *
 * @param {Object} props - The component's props.
 * @param {Object} props.searchParams - The query parameters for the search, passed as an object.
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * // Example of using the Home component with query parameters
 * <Home searchParams={{ page: 1, limit: 20, search: "pasta", category: "Italian" }} />
 */
export default async function Home({ searchParams: rawSearchParams }) {
  // Wait for searchParams to be ready
  const searchParams = await Promise.resolve(rawSearchParams);

  // Parse query parameters with proper type handling
  const params = {
    page: parseInt(searchParams.page || "1", 10),
    limit: parseInt(searchParams.limit || "20", 10),
    sortBy: searchParams.sortBy || "$natural",
    order: searchParams.order || "asc",
    search: searchParams.search || "",
    category: searchParams.category || "",
    numberOfSteps: searchParams.numberOfSteps
      ? parseInt(searchParams.numberOfSteps, 10)
      : null,
    tagMatchType: searchParams.tagMatchType || "all",
    ingredientMatchType: searchParams.ingredientMatchType || "all",
  };

  // Handle array parameters
  const tags = Array.isArray(searchParams["tags[]"])
    ? searchParams["tags[]"]
    : searchParams["tags[]"]
      ? [searchParams["tags[]"]]
      : [];

  const ingredients = Array.isArray(searchParams["ingredients[]"])
    ? searchParams["ingredients[]"]
    : searchParams["ingredients[]"]
      ? [searchParams["ingredients[]"]]
      : [];

  // Fetch all data concurrently
  const [recipesData, categories, availableTags, availableIngredients] =
    await Promise.all([
      getRecipes({
        ...params,
        tags,
        ingredients,
      }),
      getCategories(),
      getTags(),
      getIngredients(),
    ]);

  const {
    recipes,
    total,
    totalPages,
    currentPage,
    limit: resultLimit,
    error,
  } = recipesData;

  const filters = {
    tags,
    numberOfSteps: params.numberOfSteps,
    ingredients,
    category: params.category,
    search: params.search,
  };

  const hasFilters =
    tags.length > 0 ||
    params.numberOfSteps ||
    ingredients.length > 0 ||
    params.category ||
    params.search;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg">
          <FilterSection
            categories={categories}
            initialCategory={params.category}
            initialSort={params.sortBy}
            initialOrder={params.order}
            availableTags={availableTags}
            availableIngredients={availableIngredients}
          />

          <RecipeCarousel />

          {error ? (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
              <ClearFiltersButton />
            </div>
          ) : (
            <>
              {total > 0 && <ResultsSummary total={total} filters={filters} />}

              <Suspense fallback={<Loader />}>
                <RecipeGrid recipes={recipes} searchQuery={params.search} />
              </Suspense>

              {recipes.length > 0 ? (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={total}
                    resultsPerPage={resultLimit}
                  />
                </div>
              ) : (
                <NoResults hasFilters={hasFilters} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
