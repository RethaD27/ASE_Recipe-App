import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import webpush from "web-push";

/**
 * Ensures the push subscriptions collection exists in the database
 * @param {Object} db - MongoDB database instance
 * @async
 * @private
 */
async function ensurePushSubscriptionsCollection(db) {
  const collections = await db
    .listCollections({ name: "push_subscriptions" })
    .toArray();
  if (collections.length === 0) {
    await db.createCollection("push_subscriptions");
    await db
      .collection("push_subscriptions")
      .createIndex({ userEmail: 1 }, { unique: false });
  }
}

// Configure web push with VAPID details
webpush.setVapidDetails(
  "mailto:asegroupa@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Handles POST request to save push notification subscription
 * @param {Request} request - Incoming HTTP request
 * @returns {NextResponse} JSON response indicating subscription status
 * @throws {Error} If unauthorized or subscription saving fails
 */
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();
    const userEmail = session.user.email;

    const client = await clientPromise;
    const db = client.db("devdb");
    await ensurePushSubscriptionsCollection(db);

    // Save or update subscription in database
    await db
      .collection("push_subscriptions")
      .updateOne(
        { userEmail },
        { $set: { subscription, updatedAt: new Date() } },
        { upsert: true }
      );

    return NextResponse.json({ message: "Subscription saved" });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Error saving push subscription" },
      { status: 500 }
    );
  }
}

/**
 * Handles GET request to send push notifications
 * @param {Request} request - Incoming HTTP request
 * @returns {NextResponse} JSON response with notification statistics
 * @throws {Error} If unauthorized or notification sending fails
 */
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("devdb");

    // Retrieve user-specific subscriptions and favorites
    const userEmail = session.user.email;
    const subscriptions = await db
      .collection("push_subscriptions")
      .find({ userEmail })
      .toArray();

    const favorites = await db
      .collection("favorites")
      .find({ userEmail })
      .toArray();

    const recipeIds = favorites.map((fav) => fav.recipeId);

    // Find popular recipes among user's favorites
    const popularRecipes = await db
      .collection("recipes")
      .find({
        _id: { $in: recipeIds },
        rating: { $gt: 4.5 },
      })
      .toArray();

    // Find recently updated recipes
    const recentUpdates = await db
      .collection("recipes")
      .find({
        _id: { $in: recipeIds },
        lastModified: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
      .toArray();

    // Send notifications to user's subscribed endpoints
    for (const sub of subscriptions) {
      if (popularRecipes.length) {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: "Popular Recipes Alert",
            type: "popular-recipe",
            count: popularRecipes.length,
            message: `${popularRecipes.length} of your favorite recipes are trending!`,
            url: "/recipes/popular",
          })
        );
      }

      if (recentUpdates.length) {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: "Recipe Updates",
            type: "offline-update",
            count: recentUpdates.length,
            message: `${recentUpdates.length} of your favorite recipes have been updated`,
            url: "/favorites",
          })
        );
      }
    }

    return NextResponse.json({
      popularRecipes: popularRecipes.length,
      recentUpdates: recentUpdates.length,
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return NextResponse.json(
      { error: "Error sending push notifications" },
      { status: 500 }
    );
  }
}
