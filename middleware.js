import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/favorites/:path*",
    "/shopping-list/:path*",
    "/downloaded-recipes/:path*",
  ],
};