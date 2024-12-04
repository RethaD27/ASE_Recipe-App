/**
 * API Handlers for Updating and Deleting Shopping Lists
 *
 * @description Provides functionality to update items in a shopping list or delete a shopping list.
 * Both operations include session-based authentication and list ownership verification.
 */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Update the items in a shopping list.
 *
 * @async
 * @function PATCH
 * @param {Request} request - The HTTP request object containing the updated items.
 * @param {Object} context - The context object containing route parameters.
 * @param {string} context.params.id - The ID of the shopping list to update.
 * @returns {NextResponse} - A JSON response indicating success or an error message.
 *
 * @throws {Error} - Returns a 500 error if an unexpected error occurs.
 *
 * @example
 * PATCH /api/shopping_lists/{id}
 * Body: { items: [{ name: "Bread", quantity: 2 }] }
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

/**
 * Delete a shopping list.
 *
 * @async
 * @function DELETE
 * @param {Request} request - The HTTP request object. The body is not used for deletion.
 * @param {Object} context - The context object containing route parameters.
 * @param {string} context.params.id - The ID of the shopping list to delete.
 * @returns {NextResponse} - A JSON response indicating success or an error message.
 *
 * @throws {Error} - Returns a 500 error if an unexpected error occurs.
 *
 * @example
 * DELETE /api/shopping_lists/{id}
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const client = await clientPromise;
    const db = client.db("devdb");

    // Verify list ownership before deletion
    const list = await db.collection("shopping_lists").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const result = await db
      .collection("shopping_lists")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete list" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
