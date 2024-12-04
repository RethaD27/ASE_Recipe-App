"use client";

/** @requires next/navigation for routing and URL parameter handling */
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/** @requires react for state management and memoization */
import { useState, useMemo } from "react";

/** @requires framer-motion for animations */
import { motion, AnimatePresence } from "framer-motion";

/** @requires lucide-react for icons */
import { Filter, X, RefreshCcw, Sliders, CheckCircle2 } from "lucide-react";

/** @requires Custom filter components */
import TagFilter from "@/components/TagFilters";
import NumberOfStepsFilter from "@/components/NumberOfStepsFilter";
import IngredientsFilter from "@/components/IngredientsFilter";
import CategoryFilter from "@/components/CategoryFilter";
import SortOrder from "@/components/SortOrder";

/**
 * Default filter values object that defines the initial state of all filters
 * @constant {Object} DEFAULT_VALUES
 * @property {string} category - The recipe category filter
 * @property {string} sortBy - The sorting field
 * @property {string} order - The sort order (ascending/descending)
 * @property {string} search - The search query
 * @property {string} numberOfSteps - Filter for number of recipe steps
 * @property {Array} tags - Array of selected tags
 * @property {string} tagMatchType - Type of tag matching ("all" or "any")
 */
const DEFAULT_VALUES = {
  category: "",
  sortBy: "$natural",
  order: "asc",
  search: "",
  numberOfSteps: "",
  tags: [],
  tagMatchType: "all",
};

/**
 * FilterSection component that provides a comprehensive filtering interface for recipes
 * @component
 * @param {Object} props - Component props
 * @param {Array} [props.categories=[]] - Available recipe categories
 * @param {string} [props.initialCategory=DEFAULT_VALUES.category] - Initial category selection
 * @param {string} [props.initialSort=DEFAULT_VALUES.sortBy] - Initial sort field
 * @param {string} [props.initialOrder=DEFAULT_VALUES.order] - Initial sort order
 * @param {Array} [props.availableTags=[]] - Available tags for filtering
 * @param {Array} [props.availableIngredients=[]] - Available ingredients for filtering
 * @returns {JSX.Element} Rendered FilterSection component
 */
export default function FilterSection({
  categories = [],
  initialCategory = DEFAULT_VALUES.category,
  initialSort = DEFAULT_VALUES.sortBy,
  initialOrder = DEFAULT_VALUES.order,
  availableTags = [],
  availableIngredients = [],
}) {
  /** @const {Object} router - Next.js router instance for navigation */
  const router = useRouter();

  /** @const {string} pathname - Current URL pathname */
  const pathname = usePathname();

  /** @const {URLSearchParams} searchParams - Current URL search parameters */
  const searchParams = useSearchParams();

  /** @const {[boolean, Function]} State for panel visibility */
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /** @const {[boolean, Function]} State for advanced filters visibility */
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  /** @const {[Object, Function]} State for filter values */
  const [filterState, setFilterState] = useState({
    category: initialCategory,
    sortBy: initialSort,
    order: initialOrder,
    search: "",
    numberOfSteps: "",
  });

  /**
   * Updates URL parameters based on filter changes
   * @function updateUrl
   * @param {Object} newParams - New parameters to update in the URL
   */
  const updateUrl = (newParams) => {
    // Create a new URLSearchParams instance from current search params
    const params = new URLSearchParams(searchParams.toString());

    // Process each new parameter
    Object.entries(newParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For array values, remove existing and append all new values
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else if (value === DEFAULT_VALUES[key]) {
        // If value matches default, remove the parameter
        params.delete(key);
      } else if (value) {
        // If value exists, set the parameter
        params.set(key, value);
      } else {
        // If no value, remove the parameter
        params.delete(key);
      }
    });

    // Navigate to the updated URL
    router.push(`${pathname}?${params.toString()}`);
  };

  /**
   * Resets all filters to their default values
   * @function handleResetFilters
   */
  const handleResetFilters = () => {
    setFilterState({
      category: DEFAULT_VALUES.category,
      sortBy: DEFAULT_VALUES.sortBy,
      order: DEFAULT_VALUES.order,
      search: DEFAULT_VALUES.search,
      numberOfSteps: DEFAULT_VALUES.numberOfSteps,
    });
    router.push(pathname);
  };

  /**
   * Determines if any filters are currently active
   * @function isFilterActive
   * @returns {boolean} True if any filters are applied
   */
  const isFilterActive = useMemo(() => {
    return (
      Object.entries(filterState).some(
        ([key, value]) => value !== DEFAULT_VALUES[key]
      ) || searchParams.toString() !== ""
    );
  }, [filterState, searchParams]);

  // Render the filter section
  return (
    <>
      {/* Trigger Button - Fixed on the left side */}
      <motion.button
        onClick={() => setIsPanelOpen(true)}
        className="fixed left-0 -translate-y-[3rem] bg-teal-600 dark:bg-teal-700 text-white p-3 rounded-r-lg shadow-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors z-40 group"
      >
        <Filter className="w-5 h-5" />
        <span className="absolute left-full top-1/2 -translate-y-1/2 bg-teal-600 dark:bg-teal-700 text-white px-2 py-1 rounded-r-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-0.5">
          Open Filters
        </span>
      </motion.button>

      {/* Overlay Background */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPanelOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Panel Header */}
            <div className="px-4 py-4 bg-gradient-to-r from-teal-50 to-slate-100 dark:from-slate-800 dark:to-teal-900 border-b border-neutral-100 dark:border-slate-700 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Filter className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-base font-semibold text-teal-800 dark:text-teal-300">
                    Recipe Filters
                  </h2>
                  {isFilterActive && (
                    <span className="ml-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <motion.button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Reset Filters Button */}
              {isFilterActive && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm w-full justify-center"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Reset All</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-4">
              {/* Advanced Filters Toggle */}
              <motion.button
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                className="flex items-center space-x-2 bg-white dark:bg-slate-700 border border-neutral-200 dark:border-slate-600 px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-600 transition-colors w-full justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sliders className="w-4 h-4" />
                <span>
                  {isAdvancedFiltersOpen
                    ? "Hide Advanced Filters"
                    : "Show Advanced Filters"}
                </span>
              </motion.button>

              {/* Advanced Filters Section */}
              <AnimatePresence>
                {isAdvancedFiltersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-3">
                      <NumberOfStepsFilter
                        searchParams={searchParams}
                        updateUrl={updateUrl}
                      />
                      <TagFilter
                        availableTags={availableTags}
                        searchParams={searchParams}
                        updateUrl={updateUrl}
                      />
                      <IngredientsFilter
                        availableIngredients={availableIngredients}
                        searchParams={searchParams}
                        updateUrl={updateUrl}
                      />
                      {!isFilterActive && (
                        <div className="text-gray-500 dark:text-slate-400 text-sm italic mt-4">
                          No filter applied
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category and Sort Order Section */}
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <CategoryFilter
                  categories={categories}
                  currentCategory={filterState.category}
                />
                <SortOrder
                  currentSort={filterState.sortBy}
                  currentOrder={filterState.order}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
