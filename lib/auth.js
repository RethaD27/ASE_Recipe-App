/**
 * @fileoverview Authentication configuration for NextAuth.js including Google OAuth and email/password authentication
 * @requires next-auth/providers/google
 * @requires next-auth/providers/credentials
 * @requires bcryptjs
 * @requires ./mongodb
 */

// Import required authentication providers and utilities
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "./mongodb";

/**
 * @type {import('next-auth').AuthOptions}
 * Main authentication configuration object
 */
export const authOptions = {
  providers: [
    // Configure Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    /**
     * Configure email/password authentication provider
     * @param {Object} credentials - User login credentials
     * @param {string} credentials.email - User's email address
     * @param {string} credentials.password - User's password
     * @returns {Promise<Object>} Authenticated user object
     * @throws {Error} If credentials are invalid or user is not found
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate that both email and password are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Connect to MongoDB and get user collection
        const client = await clientPromise;
        const db = client.db("devdb");
        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        // Check if user exists in database
        if (!user) {
          throw new Error("User not found");
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // Throw error if password is invalid
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Return user object if authentication successful
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  /**
   * Authentication callback functions
   */
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      session.callbackUrl = token.callbackUrl || "/recipes"; // Add callbackUrl to the session
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.callbackUrl = account.callbackUrl || "/recipes";
      }
      return token;
    },

    /**
     * Handle sign-in process
     * @param {Object} params - Sign-in parameters
     * @param {Object} params.user - User object
     * @param {Object} params.account - Provider account details
     * @returns {Promise<boolean>} Success status of sign-in
     */
    async signIn({ user, account }) {
      // Handle Google sign-in
      if (account?.provider === "google") {
        const client = await clientPromise;
        const db = client.db("devdb");

        // Check if user already exists in database
        const existingUser = await db.collection("users").findOne({
          email: user.email,
        });

        if (!existingUser) {
          // Create new user if they don't exist
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            googleId: user.id,
            image: user.image,
            createdAt: new Date(),
          });
        } else if (!existingUser.googleId) {
          // Update existing user with Google ID if not present
          await db
            .collection("users")
            .updateOne({ email: user.email }, { $set: { googleId: user.id } });
        }
      }
      return true;
    },

  },

  // Custom page routes for authentication
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    error: "/auth/error", // Custom error page
  },

  // Session configuration
  session: {
    strategy: "jwt", // Use JWT for session handling
  },
};
