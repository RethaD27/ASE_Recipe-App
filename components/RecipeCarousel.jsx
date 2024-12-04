"use client";

// Importing necessary React hooks, routing, icons, and animation libraries
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Responsive Recipe Carousel Component
 *
 * Displays a dynamic, animated carousel of recommended recipes
 * with responsive design and loading states.
 *
 * @component
 * @returns {React.ReactElement} Rendered recipe carousel
 */
const ResponsiveRecipeCarousel = () => {
  // State variables to manage recipes, carousel navigation, and UI
  const [recipes, setRecipes] = useState([]); // Stores all fetched recipes
  const [currentIndex, setCurrentIndex] = useState(0); // Current carousel index
  const [visibleRecipes, setVisibleRecipes] = useState([]); // Recipes currently displayed
  const [direction, setDirection] = useState(0); // Carousel navigation direction
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [skeletonCount, setSkeletonCount] = useState(5); // Number of skeleton cards to show
  const [scrollProgress, setScrollProgress] = useState(0); // Scroll progress for custom scrollbar
  const scrollbarRef = useRef(null); // Ref for scrollbar container
  const router = useRouter(); // Next.js router for navigation

  /**
   * Fetch recommended recipes from the API
   * Sets the recipes in state and updates loading status
   *
   * @async
   * @function fetchRecipes
   * @throws {Error} If recipe fetching fails
   */
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Send request to recommended recipes API endpoint
        const response = await fetch("/api/recommended");
        const data = await response.json();
        // Update recipes state with fetched data
        setRecipes(data.recipes);
      } catch (error) {
        // Log any errors during recipe fetching
        console.error("Failed to fetch recipes:", error);
      } finally {
        // Mark loading as complete regardless of success/failure
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []); // Empty dependency array means this runs once on component mount

  /**
   * Navigate to specific recipe details page
   *
   * @param {string} recipeId - Unique identifier of the selected recipe
   */
  const navigateToRecipeDetails = (recipeId) => {
    // Use Next.js router to navigate to recipe details page
    router.push(`/recipes/${recipeId}`);
  };

  /**
   * Move to the next slide in the carousel
   * Cycles through recipes in a circular manner
   */
  const nextSlide = () => {
    // Set direction to forward (1)
    setDirection(1);
    // Update current index, wrapping around to start if at end
    const newIndex = (currentIndex + 1) % recipes.length;
    setCurrentIndex(newIndex);
    updateScrollProgress(newIndex);
  };

  /**
   * Move to the previous slide in the carousel
   * Cycles through recipes in a circular manner
   */
  const prevSlide = () => {
    // Set direction to backward (-1)
    setDirection(-1);
    // Update current index, wrapping around to end if at start
    const newIndex = currentIndex === 0 ? recipes.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    updateScrollProgress(newIndex);
  };

  /**
   * Update scroll progress based on current index
   *
   * @param {number} index - Current carousel index
   */
  const updateScrollProgress = (index) => {
    if (recipes.length > 0) {
      setScrollProgress((index / (recipes.length - 1)) * 100);
    }
  };

  /**
   * Handle manual scrollbar interaction
   *
   * @param {React.MouseEvent} e - Mouse event from scrollbar
   */
  const handleScrollbarClick = (e) => {
    if (scrollbarRef.current) {
      const rect = scrollbarRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newIndex = Math.min(
        Math.max(0, Math.floor(clickPosition * recipes.length)),
        recipes.length - 1
      );
      setCurrentIndex(newIndex);
      updateScrollProgress(newIndex);
      setDirection(newIndex > currentIndex ? 1 : -1);
    }
  };

  /**
   * Dynamically adjust visible recipes based on screen width
   * Updates skeleton count and visible recipes array
   */
  useEffect(() => {
    const handleResize = () => {
      // Determine number of visible recipes based on screen width
      const screenWidth = window.innerWidth;
      let visibleCount = 5; // Default to 5 for large screens

      // Adjust visible count for different screen sizes
      if (screenWidth < 640) visibleCount = 1;
      else if (screenWidth < 768) visibleCount = 2;
      else if (screenWidth < 1024) visibleCount = 3;
      else if (screenWidth < 1280) visibleCount = 4;

      // Update skeleton count to match visible recipes
      setSkeletonCount(visibleCount);

      // Slice recipes to create circular carousel effect
      setVisibleRecipes([
        ...recipes.slice(currentIndex, currentIndex + visibleCount),
        ...recipes.slice(
          0,
          Math.max(0, currentIndex + visibleCount - recipes.length)
        ),
      ]);
    };

    // Add and remove resize event listener
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener("resize", handleResize);
  }, [recipes, currentIndex]); // Re-run when recipes or current index change

  /**
   * Render skeleton loading cards
   *
   * @returns {React.ReactElement[]} Array of skeleton card elements
   */
  const renderSkeletonCards = () => {
    // Create array of skeleton cards based on screen size
    return Array.from({ length: skeletonCount }).map((_, index) => (
      // Animated skeleton card with loading pulse effect
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: index * 0.2, // Staggered animation
        }}
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"
      >
        {/* Skeleton image and text placeholders */}
        <div className="h-48 w-full bg-gray-300 rounded-2xl dark:bg-gray-700"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 w-16"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 w-24 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    ));
  };

  // Animation variants for card entrance/exit
  const cardVariants = {
    initial: (direction) => ({
      scale: 0.8,
      opacity: 0,
      x: direction > 0 ? 100 : -100, // Different initial positions based on direction
    }),
    animate: {
      scale: 1,
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: (direction) => ({
      scale: 0.8,
      opacity: 0,
      x: direction > 0 ? -100 : 100, // Different exit positions
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    }),
  };

  // Container animation variants for staggered child animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2, // Slight delay between child animations
      },
    },
  };

  const StarRating = ({ rating }) => {
    // Ensure rating is between 0 and 5
    const normalizedRating = Math.min(Math.max(rating, 0), 5);

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 transition-colors duration-300 ${
              star <= Math.round(normalizedRating)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {normalizedRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    // Main container with entrance animation
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Animated title with gradient */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-10 dark:text-white text-center tracking-tight text-gray-700 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
      >
        Discover Culinary Inspirations
      </motion.h2>

      <div className="relative">
        {/* Top navigation - now hidden on small screens, visible on larger screens */}
        {recipes.length > visibleRecipes.length && !loading && (
          <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between space-y-4 space-x-6 sm:space-y-0 sm:space-x-6 mb-4">
            {/* Scrollbar for large screens */}
            <div className="w-full sm:flex-grow">
              <div
                ref={scrollbarRef}
                onClick={handleScrollbarClick}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${scrollProgress}%`,
                  }}
                />
              </div>
            </div>
            {/* Navigation buttons for large screens */}
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="bg-teal-700 dark:bg-slate-700 p-2 rounded-full hover:bg-teal-800 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-100 dark:text-gray-200" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="bg-teal-700 dark:bg-slate-700 p-2 rounded-full hover:bg-teal-800 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-100 dark:text-gray-200" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Rest of the component remains the same */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-center">
            {renderSkeletonCards()}
          </div>
        ) : (
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center space-x-6"
            >
              {/* Recipe cards rendering */}
              {visibleRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe._id || index}
                  custom={direction}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 max-w-[220px] w-full"
                >
                  <div className="bg-white border border-teal-50 dark:border-gray-900 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={recipe.images[0]}
                        alt={recipe.title}
                        fill
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 ">
                      <h3 className="text-lg font-semibold mb-4 text-gray-500 dark:text-slate-300 line-clamp-2 h-12">
                        {recipe.title}
                      </h3>
                      <div className="flex-col items-center justify-between">
                        {recipe.averageRating ? (
                          <StarRating rating={recipe.averageRating} />
                        ) : (
                          <span className="text-gray-400 italic">
                            No ratings
                          </span>
                        )}
                        {/* Recipe details navigation button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigateToRecipeDetails(recipe._id)}
                          className="px-8 py-1 mt-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                        >
                          View Recipe
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {/* Bottom navigation buttons - now hidden on larger screens, visible on small screens */}
            <div className="sm:hidden flex space-x-2 justify-center mt-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="bg-teal-700 dark:bg-slate-700 p-2 rounded-full hover:bg-teal-800 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-100 dark:text-gray-200" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="bg-teal-700 dark:bg-slate-700 p-2 rounded-full hover:bg-teal-800 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-100 dark:text-gray-200" />
              </motion.button>
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default ResponsiveRecipeCarousel;
