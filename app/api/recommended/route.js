import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Mark route as dynamic since it involves database operations
export const dynamic = "force-dynamic";

/**
 * A simple store to track unique recipes based on their IDs.
 * Ensures that duplicate recipes are not included in the response.
 */
class RecipeStore {
  constructor() {
    this.seen = new Set();
  }

  /**
   * Adds a recipe to the store if it's unique.
   * @param {Object} recipe - The recipe object.
   * @returns {boolean} - True if the recipe was added, false if it was a duplicate.
   */
  add(recipe) {
    if (this.seen.has(recipe._id)) {
      return false; // Duplicate recipe
    }
    this.seen.add(recipe._id);
    return true; // Unique recipe
  }

  /**
   * Resets the store, clearing all tracked recipe IDs.
   */
  clear() {
    this.seen.clear();
  }
}

const recipeStore = new RecipeStore();

/**
 * Fetch the top 10 unique rated recipes.
 * Filters duplicate recipes before returning the response.
 *
 * @returns {Promise<NextResponse>} A response containing the top 10 unique rated recipes.
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("devdb");

    // Get recipes sorted by averageRating in descending order
    const rawRecipes = await db
      .collection("recipes")
      .find({ averageRating: { $exists: true, $gt: 0 } })
      .sort({ averageRating: -1 })
      .limit(20) // Fetch more to account for potential duplicates
      .toArray();

    // Filter out duplicates using the store
    const uniqueRecipes = rawRecipes.filter((recipe) => recipeStore.add(recipe));

    // Return only the top 10 unique recipes
    return NextResponse.json({ recipes: uniqueRecipes.slice(0, 10) });
  } catch (error) {
    console.error("Error fetching recommended recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  } finally {
    // Clear the store for future requests
    recipeStore.clear();
  }
}
