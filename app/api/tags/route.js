/**
 * This file contains a Next.js API route handler function that fetches all unique tags from the "recipes" collection in a MongoDB database.
 *
 * @module api/tags
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Mark route as dynamic since it involves database operations
export const dynamic = "force-dynamic";

/**
 * Next.js API route handler function for handling GET requests to the /api/tags endpoint.
 *
 * @returns {Promise<import("next/server").NextResponse>} The response object with the list of unique tags.
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("devdb");
    const tags = await db.collection("recipes").distinct("tags");
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Error fetching tags" }, { status: 500 });
  }
}
