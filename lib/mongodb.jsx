/**
 * This module provides functions to interact with a MongoDB database for a recipe application.
 *
 * It includes the following functionality:
 * - Connecting to the MongoDB database
 * - Initializing and creating indexes for the "recipes" and "favorites" collections
 * - Retrieving a user's favorite recipes
 * - Adding a new favorite recipe for a user
 * - Removing a favorite recipe for a user
 * - Retrieving the number of favorite recipes for a user
 *
 * @module mongodb-client
 */

import { MongoClient } from "mongodb";

// Check if the required environment variable is set
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// Set the MongoDB connection options
const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  retryWrites: true,
  w: "majority",
};

// Declare variables for MongoDB client and its promise
let client;
let clientPromise;

/**
 * Initialize the indexes for the "recipes" and "favorites" collections.
 *
 * @param {MongoClient} client - The MongoDB client instance.
 * @returns {Promise<void>}
 */
async function initializeIndexes(client) {
  const db = client.db("devdb");

  try {
    // Initialize recipe indexes
    const recipes = db.collection("recipes");
    await Promise.all([
      recipes.createIndex(
        { title: "text", description: "text", tags: "text" },
        {
          weights: { title: 10, description: 5, tags: 3 },
          name: "recipe_search_index",
          background: true,
        }
      ),
      recipes.createIndex({ category: 1 }, { background: true }),
      recipes.createIndex({ tags: 1 }, { background: true }),
      recipes.createIndex({ "ingredients.name": 1 }, { background: true }),
      recipes.createIndex({ category: 1, createdAt: -1 }, { background: true }),
      recipes.createIndex({ averageRating: -1 }, { background: true }),
    ]);

    // Initialize favorites indexes
    const favorites = db.collection("favorites");
    await Promise.all([
      favorites.createIndex({ userId: 1, recipeId: 1 }, { unique: true }),
      favorites.createIndex({ userId: 1, createdAt: -1 }),
    ]);

    console.log("Indexes initialized successfully");
  } catch (error) {
    console.error("Index initialization error:", error);
    // Continue even if index creation fails
  }
}

/**
 * Initialize the MongoDB connection and create the necessary indexes.
 *
 * @returns {Promise<MongoClient>} - The connected MongoDB client instance.
 */
async function initializeConnection() {
  try {
    client = new MongoClient(uri, options);
    const connectedClient = await client.connect();

    // Test the connection
    const admin = connectedClient.db("admin");
    await admin.command({ ping: 1 });
    console.log("MongoDB connection established successfully");

    // Initialize indexes
    await initializeIndexes(connectedClient);

    return connectedClient;
  } catch (error) {
    console.error("Failed to initialize MongoDB connection:", error);
    throw error;
  }
}

// Initialize the MongoDB connection and create a shared promise
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = initializeConnection();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = initializeConnection();
}

export default clientPromise;

/**
 * Retrieve a user's favorite recipes, including the recipe details.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<{ _id: string, userId: string, recipeId: string, createdAt: Date, recipe: object }>>} - An array of favorite recipes with their details.
 */
export async function getFavorites(userId) {
  const client = await clientPromise;
  const db = client.db("devdb");

  return db
    .collection("favorites")
    .aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "recipes",
          localField: "recipeId",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      {
        $project: {
          _id: 1,
          userId: 1,
          recipeId: 1,
          createdAt: 1,
          recipe: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();
}

/**
 * Add a new favorite recipe for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} recipeId - The ID of the recipe.
 * @returns {Promise<boolean>} - Returns true if the favorite was added successfully, false if the favorite already exists.
 */
export async function addFavorite(userId, recipeId) {
  const client = await clientPromise;
  const db = client.db("devdb");

  try {
    await db.collection("favorites").insertOne({
      userId,
      recipeId,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    if (error.code === 11000) {
      return false;
    }
    throw error;
  }
}

/**
 * Remove a favorite recipe for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} recipeId - The ID of the recipe.
 * @returns {Promise<boolean>} - Returns true if the favorite was removed successfully, false otherwise.
 */
export async function removeFavorite(userId, recipeId) {
  const client = await clientPromise;
  const db = client.db("devdb");

  const result = await db
    .collection("favorites")
    .deleteOne({ userId, recipeId });
  return result.deletedCount > 0;
}

/**
 * Retrieve the number of favorite recipes for a user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} - The number of favorite recipes for the user.
 */
export async function getFavoritesCount(userId) {
  const client = await clientPromise;
  const db = client.db("devdb");

  return db.collection("favorites").countDocuments({ userId });
}
