import { cache } from "react";

// Base URL for API endpoints from environment variables
const API_BASE_URL = process.env.API_BASE_URL;

/**
 * Fetches recipes with pagination and filtering options.
 * @param {Object} options - Recipe fetch options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of recipes per page (max 100)
 * @param {string} [options.search=""] - Search query string
 * @param {string} [options.sortBy="$natural"] - Field to sort by
 * @param {string} [options.order="asc"] - Sort order ('asc' or 'desc')
 * @param {string} [options.category=""] - Category filter
 * @param {string[]} [options.tags=[]] - Array of tags to filter by
 * @param {string} [options.tagMatchType="all"] - Tag matching strategy ('all' or 'any')
 * @param {string[]} [options.ingredients=[]] - Array of ingredients to filter by
 * @param {string} [options.ingredientsMatchType="all"] - Ingredient matching strategy ('all' or 'any')
 * @param {number|null} [options.numberOfSteps=null] - Filter by number of steps
 * @returns {Promise<Object>} Paginated recipes with metadata
 * @throws {Error} If the API request fails
 */
export const getRecipes = cache(async function getRecipes({
  page = 1,
  limit = 20,
  search = "",
  sortBy = "$natural",
  order = "asc",
  category = "",
  tags = [],
  tagMatchType = "all",
  ingredients = [],
  ingredientsMatchType = "all",
  numberOfSteps = null,
}) {
  try {
    // Validate and normalize page number
    const validPage = Math.max(1, Number(page) || 1);
    // Validate and cap limit between 1 and 100
    const validLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    // Ensure order is either 'asc' or 'desc'
    const validOrder = ["asc", "desc"].includes(order?.toLowerCase())
      ? order.toLowerCase()
      : "asc";

    // Construct base query parameters
    const params = {
      page: validPage.toString(),
      limit: validLimit.toString(),
      sortBy: sortBy || "$natural",
      order: validOrder,
      ...(search?.trim() && { search: search.trim() }), // Add search if provided
      ...(category?.trim() && { category: category.trim() }), // Add category if provided
      ...(numberOfSteps !== null &&
        !isNaN(numberOfSteps) && {
          numberOfSteps: Math.max(0, parseInt(numberOfSteps)).toString(),
        }), // Add numberOfSteps if valid
    };

    // Create URL parameters object
    const urlParams = new URLSearchParams(params);

    // Add tags to URL parameters if provided
    if (Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag) => {
        if (tag?.trim()) {
          urlParams.append("tags[]", tag.trim());
        }
      });
      urlParams.append("tagMatchType", tagMatchType === "any" ? "any" : "all");
    }

    // Add ingredients to URL parameters if provided
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      ingredients.forEach((ingredient) => {
        if (ingredient?.trim()) {
          urlParams.append("ingredients[]", ingredient.trim());
        }
      });
      urlParams.append(
        "ingredientsMatchType",
        ingredientsMatchType === "any" ? "any" : "all"
      );
    }

    // Fetch recipes with 5-minute cache
    const response = await fetch(`${API_BASE_URL}/api/recipes?${urlParams}`, {
      next: { revalidate: 300 },
    });

    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(
        `Failed to fetch recipes: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Return formatted response with pagination metadata
    return {
      recipes: data.recipes,
      total: data.total || 0,
      totalPages: data.totalPages || Math.ceil((data.total || 0) / validLimit),
      currentPage: validPage,
      limit: validLimit,
      hasNextPage:
        validPage <
        (data.totalPages || Math.ceil((data.total || 0) / validLimit)),
      hasPreviousPage: validPage > 1,
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
});

/**
 * Fetches a single recipe by its ID
 * @param {string} id - Recipe ID
 * @returns {Promise<Object>} Recipe details
 * @throws {Error} If recipe not found or API request fails
 */
export const getRecipeById = cache(async function getRecipeById(id) {
  try {
    // Validate recipe ID
    if (!id?.trim()) throw new Error("Recipe ID is required");

    // Fetch recipe with 5-minute cache
    const response = await fetch(`${API_BASE_URL}/api/recipes/${id.trim()}`, {
      next: { revalidate: 300 },
    });

    // Handle errors
    if (!response.ok) {
      if (response.status === 404) throw new Error("Recipe not found");
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          `Failed to fetch recipe details: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    // Return recipe data with ID
    return {
      ...data,
      _id: id,
    };
  } catch (error) {
    console.error("Error fetching recipe by ID:", error);
    throw error;
  }
});

/**
 * Fetches all available recipe categories
 * @returns {Promise<string[]>} Array of category names
 */
export const getCategories = cache(async function getCategories() {
  try {
    // Fetch categories with 5-minute cache
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`
      );
    }

    const categories = await response.json();
    // Ensure return value is array
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});

/**
 * Fetches all available recipe tags
 * @returns {Promise<string[]>} Array of tag names
 */
export const getTags = cache(async function getTags() {
  try {
    // Fetch tags with 5-minute cache
    const response = await fetch(`${API_BASE_URL}/api/tags`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tags: ${response.status} ${response.statusText}`
      );
    }

    const tags = await response.json();
    // Ensure return value is array
    return Array.isArray(tags) ? tags : [];
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
});

/**
 * Fetches all available recipe ingredients
 * @returns {Promise<string[]>} Array of ingredient names
 */
export const getIngredients = cache(async function getIngredients() {
  try {
    // Fetch ingredients with 5-minute cache
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ingredients: ${response.status} ${response.statusText}`
      );
    }

    const ingredients = await response.json();
    // Ensure return value is array
    return Array.isArray(ingredients) ? ingredients : [];
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return [];
  }
});

/**
 * Updates an existing recipe
 * @param {string} id - Recipe ID
 * @param {Object} updates - Recipe fields to update
 * @returns {Promise<Object>} Updated recipe data
 * @throws {Error} If update fails
 */
export async function updateRecipe(id, updates) {
  try {
    // Send PATCH request to update recipe
    const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update recipe");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }
}

/**
 * Fetches recipe suggestions based on search query
 * @param {string} query - Search query
 * @param {number} [limit=10] - Maximum number of suggestions to return
 * @returns {Promise<string[]>} Array of recipe suggestions
 */
export const getRecipeSuggestions = cache(async function getRecipeSuggestions(
  query,
  limit = 10
) {
  try {
    // Return empty array if no query provided
    if (!query?.trim()) return [];

    // Validate and cap limit
    const validLimit = Math.min(Math.max(1, Number(limit)), 100);
    const params = new URLSearchParams({
      q: query.trim(),
      limit: validLimit.toString(),
    });

    // Fetch suggestions with 5-minute cache
    const response = await fetch(`/api/suggestions?${params}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch suggestions: ${response.status} ${response.statusText}`
      );
    }

    const { suggestions = [] } = await response.json();
    return suggestions;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
});
