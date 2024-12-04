import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * Fetches allergens from the database.
 *
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} A JSON response containing allergens or an error message.
 * @description This endpoint connects to the MongoDB database, retrieves allergen data from the
 * 'allergens' collection, and returns it to the frontend. If no allergens are found, it returns
 * a 404 status with an appropriate error message. In case of an internal server error, a 500
 * status is returned.
 *
 * @throws {Error} If there is an issue connecting to the database or fetching data.
 *
 * @example
 * // Example of a successful response:
 * {
 *   "allergens": ["Gluten", "Peanuts", "Dairy"]
 * }
 *
 * @example
 * // Example of an error response (404):
 * {
 *   "error": "Allergen data not found"
 * }
 *
 * @example
 * // Example of an error response (500):
 * {
 *   "error": "Failed to fetch allergens"
 * }
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("devdb");

    // Fetch allergen data from the 'allergens' collection
    const allergensDocument = await db.collection("allergens").findOne({});

    if (!allergensDocument || !allergensDocument.allergens) {
      return NextResponse.json(
        { error: "Allergen data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ allergens: allergensDocument.allergens });
  } catch (error) {
    console.error("Error fetching allergens:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch allergens" },
      { status: 500 }
    );
  }
}
