"use client";

import { DownloadIcon, CheckIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

/**
 * Represents a recipe object with download and version information.
 * @typedef {Object} Recipe
 * @property {string} id - Unique identifier for the recipe
 * @property {string} [version] - Version of the recipe
 * @property {string} [downloadedAt] - Timestamp of download
 */

/**
 * A button component for downloading and saving recipes to local storage
 * @component
 * @param {Object} props - Component properties
 * @param {Recipe} props.recipe - The recipe to be downloaded
 * @returns {JSX.Element|null} Download button or null if no recipe is provided
 */
export default function DownloadButton({ recipe }) {
  /**
   * Tracks whether the recipe has been downloaded
   * @type {[boolean, function]}
   */
  const [isDownloaded, setIsDownloaded] = useState(false);

  /**
   * Tracks the syncing state during download process
   * @type {[boolean, function]}
   */
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Check for existing downloaded recipes on component mount
   */
  useEffect(() => {
    // Check if the recipe is already downloaded when component mounts
    if (recipe) {
      const downloadedRecipes = JSON.parse(
        localStorage.getItem("downloadedRecipes") || "[]"
      ).map((r) => (typeof r === "string" ? JSON.parse(r) : r));

      const existingRecipe = downloadedRecipes.find(
        (savedRecipe) => savedRecipe.id === recipe.id
      );

      setIsDownloaded(!!existingRecipe);
    }
  }, [recipe]);

  /**
   * Handles the recipe download process
   * - Validates recipe data
   * - Manages local storage of downloaded recipes
   * - Provides user feedback via toast notifications
   * @async
   */
  const handleDownload = async () => {
    // Early validation check
    if (!recipe) {
      toast.error("No recipe data available");
      return;
    }

    setIsSyncing(true);

    try {
      // Prepare recipe for saving with additional metadata
      const recipeToSave = {
        ...recipe,
        id: recipe.id || Date.now().toString(),
        downloadedAt: new Date().toISOString(),
        version: recipe.version || "1.0",
      };

      // Retrieve existing downloaded recipes
      const downloadedRecipes = JSON.parse(
        localStorage.getItem("downloadedRecipes") || "[]"
      ).map((r) => (typeof r === "string" ? JSON.parse(r) : r));

      // Find existing recipe index
      const existingRecipeIndex = downloadedRecipes.findIndex(
        (savedRecipe) => savedRecipe.id === recipeToSave.id
      );

      if (existingRecipeIndex !== -1) {
        // Update existing recipe if versions differ
        if (
          downloadedRecipes[existingRecipeIndex].version !==
          recipeToSave.version
        ) {
          downloadedRecipes[existingRecipeIndex] = recipeToSave;
          toast.info("Recipe updated to latest version");
        } else {
          toast.warning("Recipe already saved!");
          setIsSyncing(false);
          return;
        }
      } else {
        // Add new recipe
        downloadedRecipes.push(recipeToSave);
        toast.success("Recipe saved successfully!");
      }

      // Save updated recipes to local storage
      localStorage.setItem(
        "downloadedRecipes",
        JSON.stringify(downloadedRecipes)
      );

      // Update downloaded state
      setIsDownloaded(true);

      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Dispatch event for other components
      window.dispatchEvent(new Event("recipesDownloaded"));
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't render if no recipe is provided
  if (!recipe) return null;

  return (
    <button
      onClick={handleDownload}
      className="relative bg-[#f5f5dcb2] hover:bg-[#F5F5DC] rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out group"
      disabled={isSyncing}
      title={isDownloaded ? "Recipe Downloaded" : "Download Recipe"}
    >
      {isSyncing ? (
        <CheckIcon className="w-6 h-6 text-teal-600 animate-pulse" />
      ) : (
        <DownloadIcon className="w-6 h-6 text-[#DB8C28] group-hover:text-[#0C3B2E] dark:text-teal-700 dark:group-hover:text-teal-500 transition-colors" />
      )}
      {isDownloaded && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-800 rounded-full animate-ping"></span>
      )}
    </button>
  );
}
