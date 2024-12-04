/**
 * Retrieves the user's profile from the database and returns it as a JSON response.
 *
 * This route is marked as dynamic since it depends on the user's session and headers.
 *
 * @returns {Promise<NextResponse>} - A JSON response with the user's profile or an error message.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables for secure image uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure the route is dynamically rendered for real-time data
export const dynamic = "force-dynamic";

/**
 * GET handler for retrieving user profile
 * @returns {NextResponse} User profile data or error response
 */
export async function GET() {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    // Reject unauthenticated requests
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to MongoDB database
    const client = await clientPromise;
    const db = client.db("devdb");

    // Find user by email, excluding sensitive fields
    const user = await db
      .collection("users")
      .findOne(
        { email: session.user.email },
        { projection: { password: 0, _id: 0 } }
      );

    // Handle case where user is not found
    if (!user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Return user profile data
    return NextResponse.json(user);
  } catch (error) {
    // Log and handle any unexpected errors
    console.error("Profile retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error while retrieving profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating user profile
 * @param {Request} request - Incoming request with form data
 * @returns {NextResponse} Updated profile data or error response
 */
export async function PUT(request) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    // Reject unauthenticated requests
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse incoming form data
    const formData = await request.formData();
    const name = formData.get("name");
    const imageFile = formData.get("image");

    // Validate that at least one update field is provided
    if (!name && !imageFile) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    // Prepare updates object
    const updates = {};

    // Handle image upload if an image is provided
    let imageUrl = null;
    if (imageFile && imageFile instanceof File) {
      // Convert image file to base64 for Cloudinary upload
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");

      // Upload image to Cloudinary with specific configurations
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          `data:${imageFile.type};base64,${base64Image}`,
          {
            folder: "profile_images", // Organize images in a specific folder
            public_id: `${session.user.email}_profile`, // Unique identifier
            overwrite: true, // Replace existing image
            transformation: [
              { width: 500, height: 500, crop: "fill" }, // Standardize image size
              { quality: "auto" }, // Optimize image quality
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      // Store Cloudinary image URL
      imageUrl = uploadResult.secure_url;
      updates.image = imageUrl;
    }

    // Add name to updates if provided
    if (name) {
      updates.name = name;
    }

    // Connect to MongoDB database
    const client = await clientPromise;
    const db = client.db("devdb");

    // Update user profile in the database
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          ...updates,
          updatedAt: new Date(), // Track last update timestamp
        },
      }
    );

    // Handle case where user is not found
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Return successful update response with new data
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        image: imageUrl,
        name: name,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log and handle any unexpected errors
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error while updating profile" },
      { status: 500 }
    );
  }
}
