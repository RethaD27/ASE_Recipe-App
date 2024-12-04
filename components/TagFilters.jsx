"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Filter } from "lucide-react";

/**
 * A flexible tag filtering component with dynamic URL updating and matching options.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {string[]} [props.availableTags=[]] - List of tags that can be filtered
 * @param {URLSearchParams} props.searchParams - Current URL search parameters
 * @param {Function} props.updateUrl - Function to update URL with new search parameters
 * @param {Object} [props.defaultValues={tags: [], tagMatchType: "all"}] - Default filter settings
 * @returns {React.ReactElement} Rendered tag filter component
 */
export default function TagFilter({
  availableTags = [], // Default empty array of available tags
  searchParams, // URL search parameters
  updateUrl, // Function to update URL
  defaultValues = { tags: [], tagMatchType: "all" }, // Default configuration
}) {
  // State to control tag filter modal visibility
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

  // Extract current tags and match type from search parameters
  const currentTags = searchParams.getAll("tags[]"); // Get all current tag values
  const currentMatchType =
    searchParams.get("tagMatchType") || defaultValues.tagMatchType; // Determine current match type

  /**
   * Handles tag selection/deselection
   *
   * @param {string} tag - The tag being clicked
   */
  const handleTagClick = (tag) => {
    // Toggle tag in current tags list
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag) // Remove tag if already present
      : [...currentTags, tag]; // Add tag if not present

    // Prepare updates for URL
    const updates = {
      "tags[]": newTags, // Update tags array
      tagMatchType:
        currentMatchType !== defaultValues.tagMatchType
          ? currentMatchType
          : null, // Preserve match type if different from default
    };

    // Clear match type if no tags are selected
    if (newTags.length === 0) {
      updates.tagMatchType = null;
    }

    // Update URL with new parameters
    updateUrl(updates);
  };

  /**
   * Changes the tag matching type (all/any)
   *
   * @param {string} newMatchType - New match type to apply
   */
  const handleMatchTypeChange = (newMatchType) => {
    // Only update if tags exist or match type differs from default
    if (currentTags.length > 0 || newMatchType !== defaultValues.tagMatchType) {
      updateUrl({
        "tags[]": currentTags,
        tagMatchType: newMatchType,
      });
    }
  };

  /**
   * Clears all selected tags
   */
  const clearAllTags = () => {
    // Reset to default state
    updateUrl({
      "tags[]": defaultValues.tags,
      tagMatchType: null,
    });
  };

  // Check if any tags are currently selected
  const isTagFilterActive = currentTags.length > 0;

  return (
    <div className="w-full max-w-sm">
      {/* Tag filter label */}
      <label
        htmlFor="tagFilter"
        className="block mb-2 text-sm font-medium text-teal-700 dark:text-teal-300"
      >
        Tag Filters
      </label>

      <div className="relative">
        {/* Main filter button */}
        <button
          id="tagFilter"
          onClick={() => setIsTagFilterOpen(true)} // Open filter modal
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
          {/* Filter button content */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Tag Filters</span>
          </div>

          {/* Active tag count indicator */}
          {isTagFilterActive && (
            <span className="ml-2 px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs rounded-full flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {currentTags.length}
            </span>
          )}
        </button>
      </div>

      {/* Animated filter modal */}
      <AnimatePresence>
        {isTagFilterOpen && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTagFilterOpen(false)} // Close modal on backdrop click
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Filter modal sliding panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Modal header */}
              <div className="px-4 py-4 bg-gradient-to-r from-teal-50 to-slate-100 dark:from-slate-800 dark:to-teal-900 border-b border-neutral-100 dark:border-slate-700 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  {/* Modal title and active indicator */}
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
                    <h2 className="text-base font-semibold text-teal-800 dark:text-emerald-300">
                      Tag Filters
                    </h2>
                    {isTagFilterActive && (
                      <span className="ml-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Close modal button */}
                  <motion.button
                    onClick={() => setIsTagFilterOpen(false)}
                    className="text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-emerald-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Clear all tags button (shown when tags are active) */}
                {isTagFilterActive && (
                  <motion.div
                    className="mt-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={clearAllTags}
                      className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm w-full justify-center"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear All Tags</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Modal content */}
              <div className="p-4 space-y-4">
                {/* Tag matching type selection */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
                    Tag Matching
                  </p>
                  <div className="flex gap-4">
                    {["all", "any"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        {/* Radio button for match type */}
                        <input
                          type="radio"
                          name="tagMatchType"
                          value={type}
                          checked={currentMatchType === type}
                          onChange={(e) =>
                            handleMatchTypeChange(e.target.value)
                          }
                          className="w-4 h-4 text-teal-600 border-neutral-300 focus:ring-teal-500 rounded-full"
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 capitalize transition-colors duration-200">
                          {type} tags
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Available tags grid */}
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
                    Available Tags
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Render each available tag as a button */}
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${
                            currentTags.includes(tag)
                              ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800"
                              : "bg-neutral-100 dark:bg-gray-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        {tag}
                        {/* Show checkmark for selected tags */}
                        {currentTags.includes(tag) && (
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
