/**
 * This module exports a dynamic route handler function that retrieves the list of categories from a MongoDB database.
 *
 * The `dynamic` property is set to "force-dynamic" to indicate that this route involves database operations and should be marked as dynamic.
 *
 * The `GET` function is the route handler that is executed when a GET request is made to this route. It performs the following steps:
 *
 * 1. Connects to the MongoDB database using the `clientPromise` function.
 * 2. Retrieves the "categories" collection from the "devdb" database.
 * 3. Fetches the first document from the "categories" collection, projecting only the "categories" field.
 * 4. Returns the "categories" array from the fetched document, or an empty array if no document was found.
 *
 * If an error occurs during the database operation, the function returns a JSON response with the error message and a 500 status code.
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Mark route as dynamic since it involves database operations
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Connect to the MongoDB database
    const client = await clientPromise;
    const db = client.db("devdb");

    // Fetch the categories from the "categories" collection
    const categories = await db
      .collection("categories")
      .findOne({}, { projection: { categories: 1 } });

    // Return the categories array, or an empty array if none were found
    return NextResponse.json(categories?.categories || []);
  } catch (error) {
    // Handle any errors that occur during the database operation
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
