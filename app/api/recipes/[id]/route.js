import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as webpush from "web-push";

// Mark route as dynamic since it involves database operations
export const dynamic = "force-dynamic";

// Ensure VAPID keys are set up
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";

// Configure web push keys once
if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:asegroupa@gmail.com",
    publicVapidKey,
    privateVapidKey
  );
}

/**
 * Fetch a recipe by its ID.
 * @param {Object} request - The HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the recipe to fetch.
 * @returns {Promise<NextResponse>} A response containing the recipe data, or an error if the recipe is not found.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db("devdb");

    const recipe = await db.collection("recipes").findOne({ _id: id });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Update a recipe's description and version history.
 * @param {Object} request - The HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the recipe to update.
 * @returns {Promise<NextResponse>} A response containing the updated recipe data, or an error if the recipe is not found or the description is invalid.
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { description, userName } = await request.json();

    // Validate description
    if (
      !description ||
      typeof description !== "string" ||
      description.length < 10
    ) {
      return NextResponse.json(
        { error: "Invalid description. Must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("devdb");
    const now = new Date();

    // Update recipe with new description and version history
    const updateResult = await db.collection("recipes").updateOne(
      { _id: id },
      {
        $set: {
          description: description,
          lastModified: now,
          [`userVersions.${now.getTime()}`]: {
            userName: userName,
            description: description,
            lastModified: now,
          },
        },
        $inc: { updateCount: 1 },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Find users who have favorited this recipe
    const favoritedUsers = await db
      .collection("favorites")
      .find({ recipeId: id })
      .toArray();

    // Send push notifications for favorited users
    if (favoritedUsers.length > 0 && publicVapidKey && privateVapidKey) {
      const pushSubscriptions = await db
        .collection("push_subscriptions")
        .find({
          userEmail: {
            $in: favoritedUsers.map((fav) => fav.userEmail),
          },
        })
        .toArray();

      // Send notifications to each subscribed user
      const notificationPromises = pushSubscriptions.map(
        async (subscription) => {
          try {
            await webpush.sendNotification(
              JSON.parse(subscription.subscription),
              JSON.stringify({
                title: "Recipe Update",
                type: "recipe-update",
                recipeId: id,
                recipeTitle: description.slice(0, 30),
                userName: userName,
                message: `Recipe "${description.slice(0, 30)}..." has been updated by ${userName}`,
                url: `/recipes/${id}`,
              })
            );
          } catch (error) {
            // Handle subscription errors (e.g., subscription is no longer valid)
            console.error(
              `Failed to send notification to ${subscription.userEmail}:`,
              error
            );

            // Optionally remove invalid subscriptions
            if (error.statusCode === 404 || error.statusCode === 410) {
              await db.collection("push_subscriptions").deleteOne({
                _id: subscription._id,
              });
            }
          }
        }
      );

      // Wait for all notifications to be processed
      await Promise.allSettled(notificationPromises);
    }

    // Fetch and return the updated recipe
    const updatedRecipe = await db.collection("recipes").findOne({ _id: id });

    return NextResponse.json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe,
      notificationsSent: favoritedUsers.length,
    });
  } catch (error) {
    console.error("Error updating recipe:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
