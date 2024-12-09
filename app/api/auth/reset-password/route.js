import { NextResponse } from "next/server"; // Import Next.js response utility
import clientPromise from "@/lib/mongodb"; // Import MongoDB client connection
import bcrypt from "bcryptjs"; // Import password hashing library

/**
 * Handles password reset process for a user
 * @param {Request} request - The incoming HTTP request object
 * @returns {NextResponse} JSON response with reset status or error
 */
export async function POST(request) {
  try {
    // Extract reset token and new password from request body
    const { token, password } = await request.json();

    // Establish MongoDB connection
    const client = await clientPromise;
    const db = client.db("devdb");

    // Find user with a valid reset token that hasn't expired
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Check if token is still valid
    });

    // Validate reset token
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user document: set new password and remove reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword, // Store hashed password
        },
        $unset: {
          resetToken: "", // Remove reset token
          resetTokenExpiry: "", // Remove token expiration
        },
      }
    );

    // Return success response
    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Log and handle any unexpected errors
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
