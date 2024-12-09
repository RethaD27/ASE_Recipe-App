/**
 * @file DownloadedRecipesPage Component
 * @description A React component for managing and displaying a list of downloaded recipes with search, pagination, and delete functionality. The component utilizes offline storage to cache recipes and notify users about offline status.
 */

"use client";

import { useState, useMemo } from "react";
import RecipeCard from "@/components/RecipeCard";
import Pagination from "@/components/Pagination";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { useOfflineStorage } from "@/app/hooks/useOfflineStorage";

/**
 * DownloadedRecipesPage Component
 * @returns {JSX.Element} The main page for managing downloaded recipes.
 */
const DownloadedRecipesPage = () => {
  const {
    data: recipes,
    setData: setRecipes,
    filterData,
    isOffline,
  } = useOfflineStorage("downloadedRecipes", []);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    recipeId: null,
  });

  /**
   * Process recipes to apply search filtering and pagination.
   * @returns {Object} Processed recipes and total pages.
   */
  const processedRecipes = useMemo(() => {
    // Filter recipes based on the search term.
    const filteredRecipes = filterData(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(recipe.ingredients) &&
          recipe.ingredients.some((ing) =>
            ing.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );

    // Paginate the filtered recipes.
    const recipesPerPage = 6;
    const startIndex = (currentPage - 1) * recipesPerPage;
    const paginatedRecipes = filteredRecipes.slice(
      startIndex,
      startIndex + recipesPerPage
    );

    return {
      recipes: paginatedRecipes,
      totalPages: Math.ceil(filteredRecipes.length / recipesPerPage),
    };
  }, [recipes, searchTerm, currentPage]);

  /**
   * Handle the deletion of a recipe.
   * @param {string} recipeId - The ID of the recipe to delete.
   */
  const handleDelete = (recipeId) => {
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
    setRecipes(updatedRecipes);
    toast.success("Recipe deleted successfully");
    setDeleteConfirmation({ isOpen: false, recipeId: null });
  };

  return (
    <div className="max-w-6xl mx-auto container px-4 py-8 min-h-screen">
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, recipeId: null })}
        onConfirm={() => handleDelete(deleteConfirmation.recipeId)}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Confirm"
        confirmClassName="bg-teal-500 hover:bg-teal-600 text-white"
      />

      <div className="fixed top-4 -left-20 z-50">
        <BackButton className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-2 hover:bg-white transition-colors dark:bg-gray-800 dark:hover:bg-gray-700" />
      </div>

      <h1 className="text-4xl font-bold mb-10 dark:text-white text-center tracking-tight text-gray-700 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        My Downloaded Recipes
      </h1>

      {isOffline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            You are currently offline. Showing cached recipes.
          </p>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 dark:text-black"
        />
      </div>

      {processedRecipes.recipes.length === 0 ? (
        <div className="text-center py-12 px-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No recipes match your search"
              : "You haven't downloaded any recipes yet. Start by downloading one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {processedRecipes.recipes.map((recipe) => (
            <div key={recipe.id} className="relative group">
              <RecipeCard recipe={recipe} />
              <button
                onClick={() =>
                  setDeleteConfirmation({
                    isOpen: true,
                    recipeId: recipe.id,
                  })
                }
                className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 will-change-opacity transition-opacity duration-150 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {processedRecipes.recipes.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={processedRecipes.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default DownloadedRecipesPage;
