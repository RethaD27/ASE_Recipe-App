/**
 * API Handlers for Creating, Retrieving, and Updating Shopping Lists
 *
 * @description Provides functionality to create, retrieve, and update shopping lists for authenticated users.
 * Each operation involves session-based authentication and list ownership verification.
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Create a new shopping list.
 *
 * @async
 * @function POST
 * @param {Request} request - The HTTP request object containing the items to add to the shopping list.
 * @returns {NextResponse} - A JSON response containing the newly created list's ID, or an error message.
 * 
 * @throws {Error} - Returns a 500 error if an unexpected error occurs.
 *
 * @example
 * POST /api/shopping_lists
 * Body: { items: [{ name: "Milk", quantity: 2 }] }
 * Response: { id: "newly_generated_list_id" }
 */

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, name } = await request.json();
    const client = await clientPromise;
    const db = client.db("devdb");

    const shoppingList = {
      userId: session.user.id,
      name: name || `Shopping List ${new Date().toLocaleDateString()}`, // Use provided name or default
      items: items.map((item) => ({
        ...item,
        purchased: false,
        addedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("shopping_lists")
      .insertOne(shoppingList);
    return NextResponse.json({ id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Retrieve all shopping lists for the authenticated user.
 *
 * @async
 * @function GET
 * @returns {NextResponse} - A JSON response containing an array of shopping lists, or an error message.
 *
 * @throws {Error} - Returns a 500 error if an unexpected error occurs.
 *
 * @example
 * GET /api/shopping_lists
 * Response: [{ id: "list1", items: [{ name: "Milk", quantity: 2 }] }, { id: "list2", items: [...] }]
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("devdb");

    const lists = await db
      .collection("shopping_lists")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(lists);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update the items in an existing shopping list.
 *
 * @async
 * @function PATCH
 * @param {Request} request - The HTTP request object containing the updated items for the shopping list.
 * @param {Object} context - The context object containing route parameters.
 * @param {string} context.params.listId - The ID of the shopping list to update.
 * @returns {NextResponse} - A JSON response indicating success or an error message.
 *
 * @throws {Error} - Returns a 500 error if an unexpected error occurs.
 *
 * @example
 * PATCH /api/shopping_lists/{listId}
 * Body: { items: [{ name: "Bread", quantity: 3 }] }
 * Response: { success: true }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { items } = await request.json();

    const client = await clientPromise;
    const db = client.db("devdb");

    // Verify list ownership
    const list = await db.collection("shopping_lists").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Update the list
    const result = await db.collection("shopping_lists").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update list" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
