/**
 * Configures the NextAuth.js authentication options for a Next.js application.
 * It sets up Google and Credentials authentication providers, and defines various callback functions
 * to handle user sign-in, JWT token management, and session management.
 *
 * @module authOptions
 * @type {Object}
 * @property {Object[]} providers - An array of authentication providers to be used by NextAuth.js.
 * @property {Function} callbacks.signIn - A callback function that is called when a user signs in.
 * @property {Function} callbacks.jwt - A callback function that is called to update the JWT token.
 * @property {Function} callbacks.session - A callback function that is called to update the session.
 * @property {Object} pages - An object defining the sign-in and sign-up pages.
 * @property {Object} session - An object defining the session strategy.
 */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorizes a user based on provided email and password credentials.
       *
       * @async
       * @param {Object} credentials - An object containing the email and password credentials.
       * @param {string} credentials.email - The user's email.
       * @param {string} credentials.password - The user's password.
       * @returns {Promise<Object>} - An object containing the user's id, email, and name.
       * @throws {Error} - If the email or password is invalid.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const client = await clientPromise;
        const db = client.db("devdb");

        // Check if users collection exists, if not create it
        const collections = await db.listCollections().toArray();
        if (!collections.find((c) => c.name === "users")) {
          await db.createCollection("users");
          await db
            .collection("users")
            .createIndex({ email: 1 }, { unique: true });
        }

        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Callback function that is called when a user signs in.
     *
     * @async
     * @param {Object} signInParams - An object containing the user and account information.
     * @param {Object} signInParams.user - The user object.
     * @param {Object} signInParams.account - The account object.
     * @returns {Promise<boolean>} - Returns true if the sign-in is successful.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const client = await clientPromise;
        const db = client.db("devdb");

        // Check if users collection exists, if not create it
        const collections = await db.listCollections().toArray();
        if (!collections.find((c) => c.name === "users")) {
          await db.createCollection("users");
          await db
            .collection("users")
            .createIndex({ email: 1 }, { unique: true });
        }

        const existingUser = await db.collection("users").findOne({
          email: user.email,
        });

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            createdAt: new Date(),
          });
        }
      }
      return true;
    },
    /**
     * Callback function that is called to update the JWT token.
     *
     * @async
     * @param {Object} tokenParams - An object containing the token and user information.
     * @param {Object} tokenParams.token - The JWT token.
     * @param {Object} tokenParams.user - The user object.
     * @returns {Promise<Object>} - The updated JWT token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    /**
     * Callback function that is called to update the session.
     *
     * @async
     * @param {Object} sessionParams - An object containing the session and token information.
     * @param {Object} sessionParams.session - The session object.
     * @param {Object} sessionParams.token - The JWT token.
     * @returns {Promise<Object>} - The updated session object.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
