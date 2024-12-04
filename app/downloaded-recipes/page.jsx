"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import RecipeCard from "@/components/RecipeCard";
import Pagination from "@/components/Pagination";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const DownloadedRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    recipeId: null
  });

  // Memoized function to load recipes
  const loadRecipes = useCallback(() => {
    try {
      setLoading(true);
      const storedRecipes = JSON.parse(
        localStorage.getItem("downloadedRecipes") || "[]"
      ).map((recipe) =>
        typeof recipe === "string" ? JSON.parse(recipe) : recipe
      );

      const recipesPerPage = 6;
      const startIndex = (currentPage - 1) * recipesPerPage;
      const paginatedRecipes = storedRecipes.slice(
        startIndex,
        startIndex + recipesPerPage
      );
      const totalPageCount = Math.ceil(storedRecipes.length / recipesPerPage);

      setRecipes(paginatedRecipes);
      setTotalPages(totalPageCount);

    } catch (err) {
      setError("Error loading recipes: " + err.message);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadRecipes(); 
  }, [loadRecipes]);

  // Memoized delete handler
  const handleDelete = useCallback(() => {
    if (!deleteConfirmation.recipeId) return;

    try {
      const storedRecipes = JSON.parse(
        localStorage.getItem("downloadedRecipes") || "[]"
      ).map((recipe) =>
        typeof recipe === "string" ? JSON.parse(recipe) : recipe
      );

      const updatedRecipes = storedRecipes.filter(
        (recipe) => recipe.id !== deleteConfirmation.recipeId
      );

      localStorage.setItem("downloadedRecipes", JSON.stringify(updatedRecipes));

      loadRecipes();
      toast.success("Recipe deleted successfully");
      
      setDeleteConfirmation({ isOpen: false, recipeId: null });
    } catch (err) {
      setError("Error deleting recipe: " + err.message);
      toast.error("Failed to delete recipe");
    }
  }, [deleteConfirmation.recipeId, loadRecipes]);

  // Prevent propagation and flickering
  const openDeleteConfirmation = useCallback((recipeId) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmation({ 
      isOpen: true, 
      recipeId: recipeId 
    });
  }, []);

  // Close delete confirmation modal
  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({ 
      isOpen: false, 
      recipeId: null 
    });
  }, []);

  // Handle page change for pagination
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="max-w-6xl mx-auto container px-4 py-8 min-h-screen">
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleDelete}
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

      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading recipes...</p>
        </div>
      )}

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {recipes.length === 0 ? (
            <div className="text-center py-12 px-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                You haven't downloaded any recipes yet. Start by downloading
                one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="relative group">
                  <RecipeCard recipe={recipe} />
                  <button
                    onMouseDown={openDeleteConfirmation(recipe.id)}
                    className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 will-change-opacity transition-opacity duration-150 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {recipes.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DownloadedRecipesPage;