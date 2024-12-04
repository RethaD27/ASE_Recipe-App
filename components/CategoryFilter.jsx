"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ChevronDown, Check, FolderTree, X } from "lucide-react";

/**
 * CategoryFilter Component
 *
 * A sophisticated dropdown component for filtering items by category with
 * URL-based state management and smooth user interaction.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {string[]} props.categories - Array of available category options
 * @param {string} [props.currentCategory=""] - Currently selected category
 * @returns {React.ReactElement} Rendered category filter dropdown
 */
export default function CategoryFilter({ categories, currentCategory }) {
  // Initialize Next.js router and search parameters hooks
  const router = useRouter(); // Next.js router for navigation
  const searchParams = useSearchParams(); // Access URL search parameters

  // State management for dropdown and category selection
  const [isOpen, setIsOpen] = useState(false); // Controls dropdown visibility
  const [selectedCategory, setSelectedCategory] = useState(currentCategory); // Confirmed selected category
  const [tempCategory, setTempCategory] = useState(currentCategory); // Temporary selection before applying

  // Synchronize category with URL search parameters
  useEffect(() => {
    // Retrieve category from URL, defaulting to empty string
    const categoryFromUrl = searchParams.get("category") || "";

    // Update both selected and temporary categories
    setSelectedCategory(categoryFromUrl);
    setTempCategory(categoryFromUrl);
  }, [searchParams]);

  /**
   * Handles category selection in the dropdown
   * @param {string} category - Selected category
   */
  const handleSelect = (category) => {
    setTempCategory(category);
  };

  /**
   * Applies the selected category to URL and updates state
   * Manages URL parameters and navigation
   */
  const handleApply = () => {
    // Create a new URLSearchParams object from current parameters
    const params = new URLSearchParams(searchParams.toString());

    // Set or delete category parameter based on selection
    if (tempCategory && tempCategory !== "All Categories") {
      params.set("category", tempCategory);
    } else {
      params.delete("category");
    }

    // Reset pagination when changing category
    params.delete("page");

    // Update selected category and navigate
    setSelectedCategory(tempCategory);
    router.push(`/recipes/?${params.toString()}`);

    // Close dropdown
    setIsOpen(false);
  };

  /**
   * Clears temporary category selection
   */
  const handleClear = () => {
    setTempCategory("");
  };

  /**
   * Completely clears category selection
   * @param {React.MouseEvent} e - Mouse event
   */
  const clearSelection = (e) => {
    // Prevent event propagation to avoid toggling dropdown
    e.stopPropagation();

    // Reset category states
    setSelectedCategory("");
    setTempCategory("");

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("page");

    // Navigate to clean URL
    router.push(`/recipes/?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Main dropdown trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full  px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 rounded-lg text-teal-900 dark:text-slate-200 shadow-sm hover:border-teal-200 dark:hover:border-slate-600 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/40 focus:border-teal-500"
      >
        {/* Category display and icons */}
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span className="font-medium truncate">
            {selectedCategory || "All Categories"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear selection button (conditionally rendered) */}
          {selectedCategory && (
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-teal-400 dark:text-slate-400" />
            </button>
          )}
          {/* Dropdown chevron with rotation animation */}
          <ChevronDown
            className={`w-4 h-4 text-teal-400 dark:text-teal-300 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown menu (rendered when isOpen is true) */}
      {isOpen && (
        <div className="absolute z-50 w-full md:w-72 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-teal-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="px-2 py-1.5 text-xs font-medium text-teal-500 dark:text-teal-400 uppercase tracking-wider">
            Select Category
          </div>

          {/* Category selection list */}
          <div className="mt-1 max-h-64 overflow-auto custom-scrollbar">
            {/* All Categories option */}
            <button
              onClick={() => handleSelect("")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors duration-150 ${
                !tempCategory ? "bg-teal-50/50 dark:bg-slate-700/50" : ""
              }`}
            >
              {/* Radio button style selector */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  !tempCategory
                    ? "border-teal-500 bg-teal-500 dark:border-teal-400 dark:bg-teal-400"
                    : "border-teal-200 dark:border-slate-600"
                }`}
              >
                {!tempCategory && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="font-medium text-teal-900 dark:text-slate-200">
                All Categories
              </span>
            </button>

            {/* Dynamic category options */}
            {categories?.map((category) => (
              <button
                key={category}
                onClick={() => handleSelect(category)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors duration-150 ${
                  tempCategory === category
                    ? "bg-teal-50/50 dark:bg-slate-700/50"
                    : ""
                }`}
              >
                {/* Radio button style selector */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    tempCategory === category
                      ? "border-teal-500 bg-teal-500 dark:border-teal-400 dark:bg-teal-400"
                      : "border-teal-200 dark:border-slate-600"
                  }`}
                >
                  {tempCategory === category && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="font-medium text-teal-900 dark:text-slate-200">
                  {category}
                </span>
              </button>
            ))}
          </div>

          {/* Dropdown action buttons */}
          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-teal-100 dark:border-slate-700 px-3 pb-3">
            {/* Reset button */}
            <button
              onClick={handleClear}
              className="px-4 py-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
            {/* Apply button */}
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-teal-600 text-white dark:bg-teal-500 rounded-lg transition-all duration-300 hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-800"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
