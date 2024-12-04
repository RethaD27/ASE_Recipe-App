/**
 * Fetches and displays detailed information about a specific recipe.
 * Handles errors and displays fallback content if the recipe is not found or there is an error.
 *
 * @async
 * @param {Object} params - The parameters object.
 * @param {string} params.id - The ID of the recipe.
 * @returns {JSX.Element} A rendered recipe detail page.
 */

// Function to determine appropriate unit for an ingredient
export const getIngredientUnit = (ingredient) => {
  // Comprehensive and detailed unit mappings
  const unitMappings = {
    // Liquids
    liquid: {
      units: "l", // Changed from 'l' to milliliters for more precise measurements
      keywords: [
        "milk",
        "water",
        "oil",
        "cream",
        "broth",
        "stock",
        "juice",
        "wine",
        "coconut milk",
        "almond milk",
        "soy milk",
        "vegetable broth",
        "chicken broth",
        "beef broth",
        "marinade",
        "vinegar",
        "syrup",
        "liqueur",
        "beer",
        "spirits",
        "rum",
        "vodka",
        "whiskey",
      ],
    },

    // Dry ingredients
    dry: {
      units: "g",
      keywords: [
        "flour",
        "sugar",
        "salt",
        "pepper",
        "spices",
        "herbs",
        "cocoa",
        "baking powder",
        "baking soda",
        "cornstarch",
        "powdered sugar",
        "yeast",
        "breadcrumbs",
        "nutritional yeast",
        "matcha",
        "dried herbs",
        "ground spices",
        "curry powder",
        "chili powder",
        "paprika",
      ],
    },

    // New category for granular ingredients
    granules: {
      units: "g",
      keywords: [
        "coffee",
        "ground coffee",
        "instant coffee",
        "tea leaves",
        "loose tea",
        "matcha powder",
        "protein powder",
        "cocoa powder",
        "ground cinnamon",
        "ground nutmeg",
        "ground ginger",
        "ground turmeric",
        "ground cloves",
        "ground allspice",
        "powdered milk",
        "powdered sugar",
        "ground vanilla bean",
        "espresso powder",
      ],
    },

    // Produce
    produce: {
      units: {
        default: "pc",
        leafy: "cup",
        small: "pc",
        minced: "tbsp",
        chopped: "cup",
      },
      keywords: {
        default: [
          "onion",
          "garlic",
          "tomato",
          "potato",
          "carrot",
          "lettuce",
          "bell pepper",
          "chili",
          "cucumber",
          "zucchini",
          "eggplant",
          "radish",
          "turnip",
          "beetroot",
        ],
        leafy: [
          "spinach",
          "kale",
          "arugula",
          "swiss chard",
          "collard greens",
          "mixed greens",
          "basil leaves",
          "mint leaves",
          "parsley",
        ],
        small: ["shallot", "scallion", "green onion", "leek", "pearl onion"],
        minced: ["ginger", "fresh herbs", "parsley", "cilantro", "chives"],
        chopped: ["cabbage", "cauliflower", "broccoli", "brussels sprouts"],
      },
    },

    // Proteins
    protein: {
      units: {
        default: "g",
        whole: "pc",
        ground: "g",
      },
      keywords: {
        default: [
          "chicken",
          "beef",
          "pork",
          "fish",
          "tofu",
          "tempeh",
          "seitan",
          "turkey",
          "lamb",
          "duck",
          "shrimp",
          "scallops",
          "crab",
          "salmon",
          "cod",
          "tuna",
        ],
        ground: [
          "ground beef",
          "ground turkey",
          "ground pork",
          "ground chicken",
        ],
        whole: [
          "egg",
          "salmon fillet",
          "chicken breast",
          "duck breast",
          "whole fish",
          "pork chop",
          "steak",
        ],
      },
    },

    // Dairy
    dairy: {
      units: {
        weight: "g",
        volume: "l",
        pieces: "pc",
      },
      keywords: {
        weight: [
          "cheese",
          "butter",
          "cream cheese",
          "feta",
          "parmesan",
          "mozzarella",
          "cheddar",
          "blue cheese",
          "goat cheese",
        ],
        volume: [
          "yogurt",
          "sour cream",
          "heavy cream",
          "half and half",
          "buttermilk",
        ],
        pieces: ["cheese slice", "cottage cheese"],
      },
    },

    // Grains
    grains: {
      units: {
        weight: "g",
        volume: "cup",
      },
      keywords: {
        weight: ["pasta", "noodles", "quinoa raw", "couscous", "bulgur raw"],
        volume: [
          "rice",
          "oats",
          "quinoa cooked",
          "bulgur cooked",
          "wild rice",
          "basmati rice",
          "brown rice",
        ],
      },
    },

    // Canned/Packaged
    packaged: {
      units: {
        default: "can",
        weight: "g",
      },
      keywords: {
        default: [
          "beans",
          "corn",
          "tomato sauce",
          "chickpeas",
          "lentils",
          "black beans",
          "kidney beans",
          "tuna can",
          "sardines",
        ],
        weight: ["canned tomatoes", "canned salmon", "canned tuna"],
      },
    },

    // Nuts and Seeds
    nuts: {
      units: "g",
      keywords: [
        "almonds",
        "walnuts",
        "pecans",
        "cashews",
        "pistachios",
        "seeds",
        "sunflower seeds",
        "pumpkin seeds",
        "chia seeds",
        "flax seeds",
        "sesame seeds",
        "pine nuts",
        "macadamia nuts",
      ],
    },

    // Condiments and Sauces
    condiments: {
      units: "ml", // Changed to ml for more precise liquid measurements
      keywords: [
        "ketchup",
        "mustard",
        "mayonnaise",
        "soy sauce",
        "hot sauce",
        "worcestershire sauce",
        "tahini",
        "honey",
        "maple syrup",
        "bbq sauce",
        "teriyaki sauce",
        "fish sauce",
        "oyster sauce",
      ],
    },
  };

  // Convert ingredient to lowercase for case-insensitive matching
  const lowercaseIngredient = ingredient.toLowerCase().trim();

  // Comprehensive matching function
  const findUnit = () => {
    // Check through each category
    for (const [category, categoryData] of Object.entries(unitMappings)) {
      // Handle different structure for produce and protein with nested keywords
      if (
        typeof categoryData.keywords === "object" &&
        !Array.isArray(categoryData.keywords)
      ) {
        // Check nested keyword groups
        for (const [subType, keywords] of Object.entries(
          categoryData.keywords
        )) {
          if (
            keywords.some((keyword) => lowercaseIngredient.includes(keyword))
          ) {
            // Return specific unit for subcategory if it exists
            return categoryData.units[subType] || categoryData.units.default;
          }
        }
      } else {
        // Simple array of keywords
        if (
          categoryData.keywords.some((keyword) =>
            lowercaseIngredient.includes(keyword)
          )
        ) {
          return categoryData.units;
        }
      }
    }

    // Special handling for size-based ingredients
    if (/\b(small|large|medium)\b/.test(lowercaseIngredient)) {
      return "pc";
    }

    // More precise default units
    if (/liquid/i.test(lowercaseIngredient)) {
      return "ml";
    }

    if (/solid/i.test(lowercaseIngredient)) {
      return "g";
    }

    // Fallback to default empty string if no match
    return "";
  };

  return findUnit();
};
