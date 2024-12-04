"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ArrowUpDown, Check } from "lucide-react";

/**
 * Predefined sort options for recipes with labels and descriptions
 * @type {Object.<string, {label: string, description?: string, icon?: React.ComponentType}>}
 */
const sortOptions = {
  "$natural-asc": {
    label: "Default Sort",
    icon: ArrowUpDown,
  },
  "prep-asc": {
    label: "Prep Time: Low to High",
    description: "Sort recipes by shortest preparation time first",
  },
  "prep-desc": {
    label: "Prep Time: High to Low",
    description: "Sort recipes by longest preparation time first",
  },
  "cook-asc": {
    label: "Cook Time: Low to High",
    description: "Quick cooking recipes first",
  },
  "cook-desc": {
    label: "Cook Time: High to Low",
    description: "Slow cooking recipes first",
  },
  "published-asc": {
    label: "Date: Oldest First",
    description: "Sort by publication date, starting with oldest",
  },
  "published-desc": {
    label: "Date: Newest First",
    description: "Sort by publication date, starting with newest",
  },
  "instructionCount-asc": {
    label: "Steps: Fewest First",
    description: "Sort by complexity, simplest recipes first",
  },
  "instructionCount-desc": {
    label: "Steps: Most First",
    description: "Sort by complexity, detailed recipes first",
  },
};

/**
 * SortOrder Component
 * Provides an interactive dropdown for sorting recipes with multiple options
 *
 * @component
 * @param {Object} props - Component properties
 * @param {string} [props.currentSort] - Currently selected sort option
 * @param {string} [props.currentOrder] - Currently selected sort order
 * @returns {React.ReactElement} Rendered sort order dropdown
 */
export default function SortOrder({ currentSort, currentOrder }) {
  // Initialize Next.js router and search parameters
  const router = useRouter(); // Navigation router
  const searchParams = useSearchParams(); // URL search parameters

  // State management for dropdown and sort selection
  const [isOpen, setIsOpen] = useState(false); // Dropdown visibility
  const [selectedSort, setSelectedSort] = useState("$natural-asc"); // Confirmed sort option
  const [tempSort, setTempSort] = useState("$natural-asc"); // Temporary sort selection

  // Synchronize sort option with URL parameters
  useEffect(() => {
    // Extract sort parameters from URL
    const sortBy = searchParams.get("sortBy") || "$natural";
    const order = searchParams.get("order") || "asc";
    const sortKey = `${sortBy}-${order}`;

    // Validate and set sort option
    const finalSort = sortOptions[sortKey] ? sortKey : "$natural-asc";
    setSelectedSort(finalSort);
    setTempSort(finalSort);
  }, [searchParams]);

  /**
   * Handles temporary sort selection
   * @param {string} value - Selected sort option key
   */
  const handleSelect = (value) => {
    setTempSort(value);
  };

  /**
   * Applies selected sort option to URL and updates state
   */
  const handleApply = () => {
    // Split sort key into sortBy and order
    const [sortBy, order] = tempSort.split("-");
    const params = new URLSearchParams(searchParams);

    // Update or remove sort parameters
    if (sortBy && order) {
      params.set("sortBy", sortBy);
      params.set("order", order);
    } else {
      params.delete("sortBy");
      params.delete("order");
    }

    // Reset pagination
    params.delete("page");

    // Update state and navigate
    setSelectedSort(tempSort);
    router.push(`/recipes/?${params.toString()}`);
    setIsOpen(false);
  };

  /**
   * Resets temporary sort selection to default
   */
  const handleClear = () => {
    setTempSort("$natural-asc");
  };

  return (
    <div className="relative">
      {/* Sort dropdown trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 rounded-lg text-teal-900 dark:text-slate-200 shadow-sm hover:border-teal-200 dark:hover:border-slate-600 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/40 focus:border-teal-500"
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span className="font-medium">
            {sortOptions[selectedSort]?.label || "Sort Recipes"}
          </span>
        </div>
        {/* Dropdown chevron with rotation animation */}
        <ChevronDown
          className={`w-4 h-4 text-teal-400 dark:text-teal-300 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full md:w-80 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-teal-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="px-2 py-1.5 text-xs font-medium text-teal-500 dark:text-teal-400 uppercase tracking-wider">
            Sort Options
          </div>

          {/* Sort options list */}
          <div className="mt-1 max-h-64 overflow-auto custom-scrollbar">
            {Object.entries(sortOptions).map(([value, option]) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors duration-150 ${
                  tempSort === value ? "bg-teal-50/50 dark:bg-slate-700/50" : ""
                }`}
              >
                {/* Radio button style selector */}
                <div
                  className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    tempSort === value
                      ? "border-teal-500 bg-teal-500 dark:border-teal-400 dark:bg-teal-400"
                      : "border-teal-200 dark:border-slate-600"
                  }`}
                >
                  {tempSort === value && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                {/* Option details */}
                <div>
                  <div className="font-medium text-teal-900 dark:text-slate-200">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-teal-600 dark:text-slate-400 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-teal-100 dark:border-slate-700 px-3 pb-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
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
