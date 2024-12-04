"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRecipeSuggestions } from "@/lib/api";

/**
 * Metadata for the recipe search page
 * @type {Object}
 */
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
 * SearchBar component for recipe search functionality
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Determines if search bar is visible
 * @param {Function} props.onToggle - Function to toggle search bar visibility
 * @returns {React.ReactElement} Rendered SearchBar component
 */
const SearchBar = ({ isVisible, onToggle }) => {
  // Router and search params hooks for navigation and URL management
  const router = useRouter(); // Next.js router for programmatic navigation
  const searchParams = useSearchParams(); // Access to current URL search parameters

  // State management hooks
  const [search, setSearch] = useState(searchParams.get("search") || ""); // Current search term
  const [suggestions, setSuggestions] = useState([]); // API suggestions
  const [searchHistory, setSearchHistory] = useState([]); // User's search history
  const [loading, setLoading] = useState(false); // Loading state for suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // Control suggestions dropdown
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Keyboard navigation index

  // Refs for DOM elements and timeouts
  const searchInputRef = useRef(null); // Reference to search input element
  const suggestionsRef = useRef(null); // Reference to suggestions dropdown
  const searchTimeoutRef = useRef(null); // Debounce timeout for search suggestions
  const urlUpdateTimeoutRef = useRef(null); // Debounce timeout for URL updates

  // Load search history from localStorage when component mounts
  useEffect(() => {
    // Retrieve saved search history from browser's local storage
    const savedHistory = localStorage.getItem("recipeSearchHistory");
    if (savedHistory) {
      // Parse and set search history if it exists
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    // Store updated search history in local storage
    localStorage.setItem("recipeSearchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  /**
   * Highlights matching search term in text
   * @param {string} text - Full text to highlight
   * @param {string} searchTerm - Term to highlight
   * @returns {React.ReactElement} Text with highlighted search term
   */
  const highlightMatch = (text, searchTerm) => {
    // If no search term, return original text
    if (!searchTerm) return text;
    try {
      // Split text into parts matching search term (case-insensitive)
      const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
      return (
        <>
          {parts.map((part, index) =>
            // Highlight matching parts
            part.toLowerCase() === searchTerm.toLowerCase() ? (
              <span
                key={index}
                className="text-teal-400 dark:text-teal-300 text-[1.0rem] font-semibold"
              >
                {part}
              </span>
            ) : (
              part
            )
          )}
        </>
      );
    } catch (e) {
      // Fallback to original text if regex fails
      return text;
    }
  };

  /**
   * Updates URL search parameters
   * @param {string} searchTerm - Current search term
   */
  const updateURL = useCallback(
    (searchTerm) => {
      // Clear any existing URL update timeout
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }

      // Debounce URL update to reduce unnecessary navigation
      urlUpdateTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
          // Add search term to URL parameters
          params.set("search", searchTerm);
        } else {
          // Remove search parameter if term is empty
          params.delete("search");
        }
        // Reset page parameter
        params.delete("page");
        // Update URL with new parameters
        router.push(`/recipes/?${params.toString()}`);
      }, 500);
    },
    [searchParams, router]
  );

  /**
   * Fetches recipe suggestions based on search term
   * @param {string} value - Search input value
   */
  const fetchSuggestions = useCallback(async (value) => {
    // Ignore short or empty search terms
    if (!value.trim() || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set loading state
    setLoading(true);
    try {
      // Fetch suggestions from API
      const results = await getRecipeSuggestions(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      // Log and clear suggestions on error
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  }, []);

  /**
   * Handles search input changes
   * @param {React.ChangeEvent} e - Input change event
   */
  const handleSearch = (e) => {
    const value = e.target.value;
    // Update search state
    setSearch(value);
    // Reset highlighted index
    setHighlightedIndex(-1);

    // Clear existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Fetch suggestions for longer search terms
    if (value.length >= 2) {
      setShowSuggestions(true);
      fetchSuggestions(value);
    } else {
      // Hide suggestions for short inputs
      setShowSuggestions(false);
      setSuggestions([]);
    }

    // Update URL with search term
    updateURL(value);
  };

  /**
   * Handles selection of a suggestion
   * @param {Object|string} suggestion - Selected suggestion
   */
  const handleSuggestionClick = (suggestion) => {
    // Extract search term from suggestion
    const searchTerm = suggestion.title || suggestion;
    setSearch(searchTerm);

    // Update search history
    setSearchHistory((prev) => {
      // Remove existing instances to avoid duplicates
      const newHistory = prev.filter((item) => item !== searchTerm);
      // Add new search term to start, limit to 10 items
      return [searchTerm, ...newHistory].slice(0, 10);
    });

    // Hide suggestions
    setShowSuggestions(false);

    // Clear any existing URL update timeout
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    // Update URL with selected suggestion
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", searchTerm);
    params.delete("page");
    router.push(`/recipes/?${params.toString()}`);
  };

  /**
   * Resets search state and URL
   */
  const resetSearch = () => {
    // Clear all search-related states
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    // Toggle search bar visibility
    onToggle();

    // Clear URL update timeout
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    // Remove search parameters from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/recipes/?${params.toString()}`);
  };

  /**
   * Clears entire search history
   */
  const clearSearchHistory = () => {
    // Remove search history from state and local storage
    setSearchHistory([]);
    localStorage.removeItem("recipeSearchHistory");
  };

  /**
   * Handles keyboard navigation for suggestions
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    // Ignore if suggestions are not shown
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        // Navigate down suggestions list
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        // Navigate up suggestions list
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        // Select highlighted suggestion or submit search
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          setShowSuggestions(false);
          updateURL(search);
        }
        break;
      case "Escape":
        // Hide suggestions
        setShowSuggestions(false);
        break;
    }
  };

  // Focus search input when component becomes visible
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  // Handle clicks outside of suggestions to close dropdown
  useEffect(() => {
    /**
     * Closes suggestions if clicked outside
     * @param {MouseEvent} event - Click event
     */
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    // Add and remove event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Determines what to display in suggestions dropdown
   * @returns {React.ReactElement} Suggestions content
   */
  const displaySuggestions = () => {
    // Show loading indicator
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="w-4 h-4 border-2 border-teal-600 dark:border-teal-400 rounded-full animate-spin border-t-transparent"></div>
        </div>
      );
    }

    // Show search history when input is empty
    if (!search && searchHistory.length > 0) {
      return (
        <>
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-slate-800 text-sm">
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              Recent Searches
            </span>
            <button
              onClick={clearSearchHistory}
              className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
            >
              Clear
            </button>
          </div>
          {searchHistory.map((historyItem, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(historyItem)}
              className={`px-4 py-3 cursor-pointer text-sm transition-colors duration-150 ease-in-out ${
                index === highlightedIndex
                  ? "bg-teal-50 dark:bg-slate-700 text-teal-900 dark:text-teal-200"
                  : "text-gray-700 dark:text-gray-300 hover:bg-teal-50/50 dark:hover:bg-slate-700/50"
              }`}
            >
              {historyItem}
            </div>
          ))}
        </>
      );
    }

    // Show API suggestions when typing
    if (suggestions.length > 0) {
      return suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id}
          onClick={() => handleSuggestionClick(suggestion)}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`px-4 py-3 cursor-pointer text-sm transition-colors duration-150 ease-in-out first:rounded-t-1xl last:rounded-b-2xl ${
            index === highlightedIndex
              ? "bg-teal-50 dark:bg-slate-700 text-teal-900 dark:text-teal-200"
              : "text-gray-700 dark:text-gray-300 hover:bg-teal-50/50 dark:hover:bg-slate-700/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium ">
                {highlightMatch(suggestion.title, search)}
              </div>
              {suggestion.category && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  in {highlightMatch(suggestion.category, search)}
                </div>
              )}
            </div>
          </div>
        </div>
      ));
    }

    // Show no results message if no suggestions
    return (
      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        No matching suggestions found
      </div>
    );
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
      <div className="flex items-center justify-end">
        <div
          className={`
            relative overflow-hidden
            transition-all duration-300 ease-in-out
            ${isVisible ? "w-full" : "w-10"}
          `}
        >
          <input
            ref={searchInputRef}
            id="search"
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!search && searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="
              w-full px-3 py-2
              bg-white dark:bg-gray-800
              text-gray-800 dark:text-gray-200
              border border-gray-300 dark:border-gray-600
              rounded-3xl shadow-sm
              outline-none focus:outline-none dark:focus:outline-none
            "
          />
          <button
            type="button"
            onClick={onToggle}
            className={`
              absolute right-0 top-0
              flex items-center justify-center w-10 h-full
              text-teal-700 dark:text-teal-400
              bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700
              focus:outline-none dark:focus:outline-none outline-none
              transition-all duration-300 ease-in-out
              border border-gray-300 dark:border-gray-600
              ${
                isVisible
                  ? "rounded-r-full border border-l-0 border-gray-300 dark:border-slate-600"
                  : "rounded-full"
              }
            `}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isVisible ? "rotate-90" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Toggle search</span>
          </button>
        </div>
      </div>

      {search && isVisible && (
        <button
          type="button"
          onClick={resetSearch}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          <span className="sr-only">Clear search</span>
        </button>
      )}

      {showSuggestions && isVisible && (
        <div
          ref={suggestionsRef}
          className="absolute right-0 z-50 w-full mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg max-h-80 overflow-y-auto border border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700 custom-scrollbar"
        >
          {displaySuggestions()}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
