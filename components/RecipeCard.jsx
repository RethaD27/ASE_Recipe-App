"use client";

import Link from "next/link";
import Gallery from "./Gallery";
import { useState, useEffect } from "react";
import DownloadButton from "./DownloadButton";
import Alert from "./Alert";
import ConfirmationModal from "./ConfirmationModal";
import { DownloadIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Highlights search query text within a given text string
 * @param {string} text - The text to be searched and highlighted
 * @param {string} query - The search query to highlight
 * @returns {Array<string|JSX.Element>} Array of text parts with highlighted matches
 */
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-teal-100 text-teal-800 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/**
 * RecipeCard component displays detailed information about a single recipe
 * @param {Object} props - Component properties
 * @param {Object} props.recipe - The recipe object containing all recipe details
 * @param {string} [props.searchQuery=''] - Optional search query for text highlighting
 * @param {boolean} [props.initialIsFavorited] - Initial favorited state of the recipe
 * @returns {JSX.Element} Rendered recipe card component
 */
export default function RecipeCard({
  recipe,
  searchQuery = "",
  initialIsFavorited = false,
}) {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isHovered, setIsHovered] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Ensure images is an array, defaulting to empty array if undefined
  const images = Array.isArray(recipe?.images) ? recipe.images : [];

  // Check download status on component mount and when recipe changes
  useEffect(() => {
    const checkDownloadStatus = () => {
      const downloadedRecipes = JSON.parse(
        localStorage.getItem("downloadedRecipes") || "[]"
      ).map((r) => (typeof r === "string" ? JSON.parse(r) : r));

      const downloaded = downloadedRecipes.some(
        (savedRecipe) => savedRecipe.id === recipe._id
      );

      setIsDownloaded(downloaded);
    };

    checkDownloadStatus();

    window.addEventListener("recipesDownloaded", checkDownloadStatus);

    return () => {
      window.removeEventListener("recipesDownloaded", checkDownloadStatus);
    };
  }, [recipe]);

  // Check favorite status on component mount
  useEffect(() => {
    const storedFavorite = localStorage.getItem(`favorite_${recipe._id}`);
    if (storedFavorite !== null) {
      setIsFavorited(JSON.parse(storedFavorite));
    }
  }, [recipe._id]);

  /**
   * Handles the favorite toggle action and shows appropriate alert
   * @param {boolean} success - Whether the favorite toggle was successful
   * @param {string} message - Alert message to display
   */
  const handleFavoriteToggle = (success, message) => {
    setAlertMessage(message);
    setAlertType(success ? "success" : "error");
    setShowAlert(true);
  };

  /**
   * Toggles favorite status of the recipe
   * @param {boolean} [forceRemove=false] - Force remove from favorites
   */
  const toggleFavorite = async (forceRemove = false) => {
    // Redirect to signin if no session
    if (!session) {
      router.push("/auth/signin");
      return false;
    }

    try {
      const response = await fetch("/api/favorites", {
        method: forceRemove || isFavorited ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId: recipe._id }),
      });

      if (response.ok) {
        const newFavoritedState = forceRemove ? false : !isFavorited;
        setIsFavorited(newFavoritedState);

        // Dispatch event for global state update
        window.dispatchEvent(new Event("favoritesUpdated"));

        // Show alert based on action
        handleFavoriteToggle(
          true,
          newFavoritedState
            ? "Recipe added to favorites!"
            : "Recipe removed from favorites!"
        );

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      handleFavoriteToggle(false, "Failed to update favorites");
      return false;
    }
  };

  useEffect(() => {
    // Check if recipe is favorited via backend
    const checkFavoriteStatus = async () => {
      if (session) {
        try {
          const response = await fetch(`/api/favorites?recipeId=${recipe._id}`);
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };

    checkFavoriteStatus();
  }, [recipe._id, session]);

  /**
   * Handles favorite click - shows confirmation if already favorited
   */
  const handleFavoriteClick = () => {
    if (isFavorited) {
      setIsConfirmationModalOpen(true);
    } else {
      toggleFavorite();
    }
  };

  /**
   * Handles confirmation of removing from favorites
   */
  const handleConfirmRemoveFavorite = () => {
    toggleFavorite(true);
    setIsConfirmationModalOpen(false);
  };

  return (
    <>
      <div
        className="bg-white border border-teal-50 dark:border-gray-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Downloaded Indicator */}
        {isDownloaded && (
          <div className="absolute top-2 left-2 z-10 bg-teal-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <DownloadIcon className="w-3 h-3 mr-1" />
            Offline
          </div>
        )}

        {/* Image Section with Gallery and Buttons */}
        <div className="relative overflow-hidden max-h-56">
          <Gallery images={images} />

          {/* Favorites and Download Buttons */}
          <div className="absolute top-2 right-1 left-1 z-10 flex justify-between">
            <DownloadButton recipe={recipe} />
            <button
              onClick={handleFavoriteClick}
              className="flex items-center space-x-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all duration-300"
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
            >
              <svg
                className={`w-6 h-6 ${isFavorited ? "text-red-500" : "text-gray-400"}`}
                fill={isFavorited ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Hoverable Description Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-black-opacity-75 text-white text-sm transition-all duration-500 transform ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
          >
            {recipe.description.length > 100 ? (
              <>
                {highlightText(recipe.description.slice(0, 100), searchQuery)}
                <span className="text-sm text-teal-200 cursor-pointer">
                  <Link href={`/recipes/${recipe._id}`}>...read more</Link>
                </span>
              </>
            ) : (
              highlightText(recipe.description, searchQuery)
            )}
          </div>
        </div>

        {/* Recipe Details Section */}
        <div className="p-4 flex-grow flex flex-col justify-between text-center">
          {/* Title */}
          <div>
            <h3 className="font-bold text-lg text-gray-500 dark:text-slate-300 mb-2 line-clamp-2">
              {highlightText(recipe.title, searchQuery)}
            </h3>
          </div>

          {/* Recipe Metadata Icons */}
          <div className="flex justify-center space-x-8 text-xs text-gray-500 mb-4">
            {/* Prep Time */}
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 512 512"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-teal-700 dark:text-teal-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M512,200.388c-0.016-63.431-51.406-114.828-114.845-114.836c-11.782-0.008-23.118,1.952-33.846,5.275
              C338.408,58.998,299.57,38.497,256,38.497c-43.57,0-82.408,20.501-107.309,52.329c-10.737-3.322-22.073-5.283-33.846-5.275
              C51.406,85.56,0.016,136.957,0,200.388c0.008,54.121,37.46,99.352,87.837,111.523c-11.368,35.548-21.594,81.104-21.538,140.848v20.744
              h379.402v-20.744c0.056-59.744-10.169-105.3-21.538-140.848C474.54,299.741,511.984,254.509,512,200.388z M449.023,252.265
              c-13.322,13.297-31.505,21.456-51.803,21.48l-0.51-0.007l-30.524-0.77l10.534,28.66c11.977,32.704,24.464,72.928,27,130.387
              H108.281c2.536-57.459,15.023-97.683,27-130.387l10.534-28.669l-31.043,0.786c-20.29-0.024-38.473-8.184-51.803-21.48
              c-13.305-13.338-21.473-31.546-21.481-51.876c0.008-20.322,8.176-38.53,21.481-51.867c13.346-13.306,31.554-21.473,51.876-21.482
              c11.725,0.008,22.689,2.731,32.493,7.577l17.251,8.54l9.804-16.571C190.956,98.663,221.222,79.977,256,79.985
              c34.778-0.008,65.044,18.678,81.606,46.601l9.796,16.571l17.26-8.54c9.804-4.846,20.761-7.568,32.493-7.577
              c20.322,0.008,38.531,8.176,51.876,21.482c13.305,13.338,21.473,31.545,21.481,51.867
              C470.505,220.719,462.337,238.927,449.023,252.265z"
                />
              </svg>
              <span className="mt-2 font-semibold text-sm dark:text-slate-300">
                Prep:
              </span>
              <span className="dark:text-slate-400">{recipe.prep} mins</span>
            </div>

            {/* Cook Time */}
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 256 256"
                strokeWidth="1.0"
                stroke="currentColor"
                className="w-5 h-5 text-teal-700 dark:text-teal-300"
              >
                <path d="M76,40V16a12,12,0,0,1,24,0V40a12,12,0,0,1-24,0Zm52,12a12,12,0,0,0,12-12V16a12,12,0,0,0-24,0V40A12,12,0,0,0,128,52Zm40,0a12,12,0,0,0,12-12V16a12,12,0,0,0-24,0V40A12,12,0,0,0,168,52Zm83.2002,53.6001L224,126v58a36.04061,36.04061,0,0,1-36,36H68a36.04061,36.04061,0,0,1-36-36V126L4.7998,105.6001A12.0002,12.0002,0,0,1,19.2002,86.3999L32,96V88A20.02229,20.02229,0,0,1,52,68H204a20.02229,20.02229,0,0,1,20,20v8l12.7998-9.6001a12.0002,12.0002,0,0,1,14.4004,19.2002ZM200,92H56v92a12.01375,12.01375,0,0,0,12,12H188a12.01375,12.01375,0,0,0,12-12Z" />
              </svg>
              <span className="mt-2 font-semibold text-sm dark:text-slate-300">
                Cook:
              </span>
              <span className="dark:text-slate-400">{recipe.cook} mins</span>
            </div>

            {/* Servings */}
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64px"
                height="64px"
                viewBox="0 -4.83 52 52"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5 text-teal-700 dark:text-teal-300"
              >
                <g
                  id="Group_49"
                  data-name="Group 49"
                  transform="translate(-788.946 -1785.428)"
                >
                  <path
                    id="Path_131"
                    data-name="Path 131"
                    d="M814.946,1793.095a24,24,0,0,0-24,24h48A24,24,0,0,0,814.946,1793.095Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="5"
                  ></path>
                  <line
                    id="Line_51"
                    data-name="Line 51"
                    x2="48"
                    transform="translate(790.946 1825.761)"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="5"
                  ></line>
                  <line
                    id="Line_52"
                    data-name="Line 52"
                    y2="5.667"
                    transform="translate(814.946 1787.428)"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="5"
                  ></line>
                </g>
              </svg>
              <span className="mt-2 font-semibold text-sm dark:text-slate-300">
                Serves:
              </span>
              <span className="dark:text-slate-400">
                {recipe.servings} people
              </span>
            </div>
          </div>

          {/* View Recipe Button */}
          <Link
            href={`/recipes/${recipe._id}`}
            className="w-[85%] mx-auto block text-center bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold py-2 rounded-full shadow transition-colors mt-auto"
          >
            View Recipe
          </Link>
        </div>
      </div>

      {/* Confirmation Modal for Removing Favorites */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmRemoveFavorite}
        title="Remove from Favorites?"
        message="Are you sure you want to remove this recipe from your favorites?"
      />

      {/* Alert Component for Favorite Actions */}
      <Alert
        message={alertMessage}
        type={alertType}
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
      />
    </>
  );
}
