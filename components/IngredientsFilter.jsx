"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Filter } from "lucide-react";

/**
 * A React component for filtering ingredients with dynamic URL updates
 * @param {Object} props - Component properties
 * @param {string[]} [props.availableIngredients=[]] - List of ingredients that can be filtered
 * @param {URLSearchParams} props.searchParams - Current URL search parameters
 * @param {function} props.updateUrl - Function to update URL with new parameters
 * @param {Object} [props.defaultValues] - Default filter configuration
 * @returns {JSX.Element} Ingredient filter component
 */
export default function IngredientsFilter({
  availableIngredients = [], // Default to empty array if no ingredients provided
  searchParams, // Current URL search parameters
  updateUrl, // Function to update URL parameters
  defaultValues = { ingredients: [], ingredientMatchType: "all" }, // Default filter configuration
}) {
  // State to control the visibility of the ingredient filter modal
  const [isIngredientFilterOpen, setIsIngredientFilterOpen] = useState(false);

  // Get currently selected ingredients from URL search params
  const currentIngredients = searchParams.getAll("ingredients[]");

  // Get current match type, defaulting to the default value if not specified
  const currentMatchType =
    searchParams.get("ingredientMatchType") ||
    defaultValues.ingredientMatchType;

  /**
   * Handles click events on ingredient buttons, toggling their selection
   * @param {string} ingredient - The ingredient to toggle
   */
  const handleIngredientClick = (ingredient) => {
    // Determine new list of ingredients: add or remove based on current state
    const newIngredients = currentIngredients.includes(ingredient)
      ? currentIngredients.filter((i) => i !== ingredient)
      : [...currentIngredients, ingredient];

    // Prepare updates for URL parameters
    const updates = {
      "ingredients[]": newIngredients, // Updated ingredient list
      ingredientMatchType:
        currentMatchType !== defaultValues.ingredientMatchType
          ? currentMatchType
          : null, // Preserve match type if non-default
    };

    // If no ingredients are selected, reset match type
    if (newIngredients.length === 0) {
      updates.ingredientMatchType = null;
    }

    // Update URL with new parameters
    updateUrl(updates);
  };

  /**
   * Updates the ingredient matching type (all or any)
   * @param {string} newMatchType - The new matching type to apply
   */
  const handleMatchTypeChange = (newMatchType) => {
    // Only update if ingredients are selected or match type differs from default
    if (
      currentIngredients.length > 0 ||
      newMatchType !== defaultValues.ingredientMatchType
    ) {
      updateUrl({
        "ingredients[]": currentIngredients,
        ingredientMatchType: newMatchType,
      });
    }
  };

  /**
   * Clears all selected ingredients and resets match type
   */
  const clearAllIngredients = () => {
    updateUrl({
      "ingredients[]": defaultValues.ingredients,
      ingredientMatchType: null,
    });
  };

  // Check if any ingredients are currently selected
  const isIngredientFilterActive = currentIngredients.length > 0;

  // Render the ingredient filter component
  return (
    <div className="w-full max-w-sm">
      <label
        htmlFor="ingredientFilter"
        className="block mb-2 text-sm font-medium text-teal-700 dark:text-teal-300"
      >
        Ingredient Filters
      </label>
      <div className="relative">
        <button
          id="ingredientFilter"
          onClick={() => setIsIngredientFilterOpen(true)}
          className="w-full px-4 py-2.5 
            rounded-xl border 
            border-teal-300 
            bg-white 
            dark:bg-slate-800
            text-teal-800 
            dark:border-slate-700
            placeholder-teal-600 
            dark:text-teal-300
            focus:outline-none 
            focus:ring-2 
            focus:ring-teal-500 
            focus:border-transparent 
            transition-all 
            duration-300 
            ease-in-out 
            hover:shadow-md 
            hover:border-teal-500
            flex items-center justify-between
            dark:focus:ring-teal-500/40
            dark:hover:border-slate-600"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Ingredient Filters</span>
          </div>
          {isIngredientFilterActive && (
            <span className="ml-2 px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs rounded-full flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {currentIngredients.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isIngredientFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIngredientFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="px-4 py-4 bg-gradient-to-r from-teal-50 to-slate-100 dark:from-slate-800 dark:to-teal-900 border-b border-neutral-100 dark:border-slate-700 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
                    <h2 className="text-base font-semibold text-teal-800 dark:text-emerald-300">
                      Ingredient Filters
                    </h2>
                    {isIngredientFilterActive && (
                      <span className="ml-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                  <motion.button
                    onClick={() => setIsIngredientFilterOpen(false)}
                    className="text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-emerald-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {isIngredientFilterActive && (
                  <motion.div
                    className="mt-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={clearAllIngredients}
                      className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm w-full justify-center"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear All Ingredients</span>
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
                    Ingredient Matching
                  </p>
                  <div className="flex gap-4">
                    {["all", "any"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="ingredientMatchType"
                          value={type}
                          checked={currentMatchType === type}
                          onChange={(e) =>
                            handleMatchTypeChange(e.target.value)
                          }
                          className="w-4 h-4 text-teal-600 border-neutral-300 focus:ring-teal-500 rounded-full"
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 capitalize transition-colors duration-200">
                          {type} ingredients
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
                    Available Ingredients
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableIngredients.map((ingredient) => (
                      <button
                        key={ingredient}
                        onClick={() => handleIngredientClick(ingredient)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${
                            currentIngredients.includes(ingredient)
                              ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800"
                              : "bg-neutral-100 dark:bg-gray-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        {ingredient}
                        {currentIngredients.includes(ingredient) && (
                          <span className="ml-2 text-teal-600 dark:text-teal-400">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
