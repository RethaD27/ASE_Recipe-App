import { NextResponse } from "next/server"; // Import Next.js response utility
import clientPromise from "@/lib/mongodb"; // Import MongoDB client connection
import { randomBytes } from "crypto"; // Import cryptographic random bytes generator
import nodemailer from "nodemailer"; // Import email sending library

/**
 * Handles password reset request for a user
 * @param {Request} request - The incoming HTTP request object
 * @returns {NextResponse} JSON response with reset status or error
 */
export async function POST(request) {
  try {
    // Extract email from request body
    const { email } = await request.json();

    // Validate email input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Establish MongoDB connection
    const client = await clientPromise;
    const db = client.db("devdb");

    // Check if user exists in the database
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Update user document with reset token and expiration
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // Configure email transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP host
      port: 587, // Standard TLS port
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER, // Email username from environment
        pass: process.env.EMAIL_PASS, // Email password from environment
      },
      // Handle potential SSL/TLS connection issues
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Construct password reset URL with token
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Prepare email content with HTML template
    const mailOptions = {
      from: `"Culinary Haven" <${process.env.EMAIL_USER}>`, // Sender details
      to: email, // Recipient email
      subject: "Password Reset for Culinary Haven", // Email subject
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Culinary Haven account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #008080; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    // Attempt to send reset email
    try {
      // Send email and log successful transmission
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info);

      // Return success response
      return NextResponse.json(
        { message: "Password reset link sent" },
        { status: 200 }
      );
    } catch (emailError) {
      // Handle email sending errors
      return NextResponse.json(
        { error: `Failed to send reset link: ${emailError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log and handle any unexpected errors during the process
    console.error("Full password reset error:", error);
    return NextResponse.json(
      { error: `Failed to process reset request: ${error.message}` },
      { status: 500 }
    );
  }
}
