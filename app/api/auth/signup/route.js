import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

// Mark this route as dynamic since it involves database operations
export const dynamic = "force-dynamic";

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} Whether the email format is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} Validation result and message
 */
const isValidPassword = (password) => {
  // Implement password validation rules
  // This function returns an object with isValid and message properties
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Handles POST requests for user signup
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} JSON response with signup status
 */
export async function POST(request) {
  try {
    // Parse and sanitize input
    const { name, email, password } = await request.json();
    const sanitizedName = name?.trim();
    const sanitizedEmail = email?.trim().toLowerCase();

    // Validate required fields
    if (!sanitizedName || !sanitizedEmail || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate name length
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("devdb");

    try {
      // Ensure users collection exists with proper indexes
      await db.createCollection("users").catch(() => {
        // Collection might already exist, continue
      });

      await db
        .collection("users")
        .createIndex({ email: 1 }, { unique: true, background: true });

      // Additional helpful indexes
      await db
        .collection("users")
        .createIndex({ createdAt: 1 }, { background: true });
    } catch (error) {
      // Log index creation errors but don't fail the request
      console.error("Index creation error:", error);
    }

    // Check for existing user
    const existingUser = await db.collection("users").findOne(
      {
        email: sanitizedEmail,
      },
      {
        projection: { _id: 1 },
      }
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Email address is already registered" },
        { status: 409 }
      );
    }

    // Hash password with appropriate cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document
    const result = await db.collection("users").insertOne({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "user",
    });

    // Remove sensitive data from response
    return NextResponse.json(
      {
        message: "User registration successful",
        userId: result.insertedId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Signup error:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email address is already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
