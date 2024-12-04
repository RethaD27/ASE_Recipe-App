import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// Mark route as dynamic since it involves database operations
export const dynamic = "force-dynamic";

/**
 * Generate a unique MongoDB ObjectId as a string.
 * @returns {string} A unique MongoDB ObjectId as a string.
 */
function generateId() {
  return new ObjectId().toString();
}

/**
 * Validate the review data.
 * @param {Object} review - The review object to validate.
 * @param {number} review.rating - The rating of the review (1-5).
 * @param {string} [review.comment] - The comment of the review.
 * @returns {Object} An object with a `valid` property indicating if the review is valid, and an `error` property with the error message if not valid.
 */
function validateReview(review) {
  const { rating, comment } = review;

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return { valid: false, error: "Invalid rating" };
  }

  if (comment && typeof comment !== "string") {
    return { valid: false, error: "Invalid comment format" };
  }

  return { valid: true };
}

/**
 * Update the average rating and review count for a recipe.
 * @param {Object} db - The MongoDB database instance.
 * @param {string} recipeId - The ID of the recipe to update.
 */
async function updateRecipeRating(db, recipeId) {
  const recipe = await db.collection("recipes").findOne({ _id: recipeId });
  if (recipe && recipe.reviews) {
    const totalRating = recipe.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      recipe.reviews.length > 0
        ? Number((totalRating / recipe.reviews.length).toFixed(1))
        : 0;

    await db
      .collection("recipes")
      .updateOne(
        { _id: recipeId },
        { $set: { averageRating, reviewCount: recipe.reviews.length } }
      );
  }
}

// GET all reviews for a recipe
/**
 * Fetch all reviews for a given recipe.
 * @param {Object} request - The HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the recipe.
 * @returns {Promise<NextResponse>} A response containing the reviews, total reviews, average rating, review count, and the current user.
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db("devdb");

    const recipe = await db.collection("recipes").findOne({ _id: params.id });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    let reviews = recipe.reviews || [];

    // Add isOwner flag to each review based on userId or username
    const reviewsWithOwnership = reviews.map((review) => ({
      ...review,
      isOwner:
        session?.user?.id === review.userId ||
        session?.user?.name === review.username,
    }));

    return NextResponse.json({
      reviews: reviewsWithOwnership,
      totalReviews: reviews.length,
      averageRating: recipe.averageRating || 0,
      reviewCount: recipe.reviewCount || 0,
      currentUser: session
        ? {
            id: session.user.id,
            name: session.user.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Error fetching reviews" },
      { status: 500 }
    );
  }
}

// POST a new review
/**
 * Create a new review for a recipe.
 * @param {Object} request - The HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the recipe.
 * @returns {Promise<NextResponse>} A response containing the newly created review.
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateReview(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("devdb");

    // Ensure userId is properly set
    const review = {
      _id: generateId(),
      userId: session.user.id || generateId(), // Generate ID if not provided
      username: session.user.name,
      rating: body.rating,
      comment: body.comment?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if user already has a review
    const existingReview = await db.collection("recipes").findOne({
      _id: params.id,
      "reviews.userId": review.userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this recipe" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("recipes")
      .updateOne({ _id: params.id }, { $push: { reviews: review } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    await updateRecipeRating(db, params.id);

    return NextResponse.json({
      review: {
        ...review,
        isOwner: true,
      },
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Error adding review" }, { status: 500 });
  }
}

// PUT to update an existing review
/**
 * Update an existing review for a recipe.
 * @param {Object} request - The HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the recipe.
 * @returns {Promise<NextResponse>} A response indicating the success of the update.
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateReview(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("devdb");

    // First find the review to verify ownership
    const recipe = await db.collection("recipes").findOne({
      _id: params.id,
      "reviews._id": body.reviewId,
    });

    const review = recipe?.reviews?.find((r) => r._id === body.reviewId);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check ownership by userId or username
    if (
      review.userId !== session.user.id &&
      review.username !== session.user.name
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.collection("recipes").updateOne(
      {
        _id: params.id,
        "reviews._id": body.reviewId,
      },
      {
        $set: {
          "reviews.$.rating": body.rating,
          "reviews.$.comment": body.comment?.trim() || "",
          "reviews.$.updatedAt": new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await updateRecipeRating(db, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Error updating review" },
      { status: 500 }
    );
  }
}

// DELETE a review
/**
 * Delete an existing review for a recipe.
 * @param {Object} request - The HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the recipe.
 * @returns {Promise<NextResponse>} A response indicating the success of the deletion.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("devdb");

    // First find the review to verify ownership
    const recipe = await db.collection("recipes").findOne({
      _id: params.id,
      "reviews._id": reviewId,
    });

    const review = recipe?.reviews?.find((r) => r._id === reviewId);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check ownership by userId or username
    if (
      review.userId !== session.user.id &&
      review.username !== session.user.name
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .collection("recipes")
      .updateOne({ _id: params.id }, { $pull: { reviews: { _id: reviewId } } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await updateRecipeRating(db, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Error deleting review" },
      { status: 500 }
    );
  }
}
