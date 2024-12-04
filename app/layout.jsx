import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import OnlineStatus from "@/components/OnlineStatus";
import { ThemeProvider } from "@/ThemeContext";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth/next";
import PushNotificationManager from "@/components/PushNotificationManager";
import PWAInstallPrompt from "@/components/PWAInstallation";

/**
 * Metadata for the application, including SEO and social sharing configuration.
 * @constant
 * @type {Object}
 */
export const metadata = {
  title: {
    default: "Culinary Haven - Discover Delicious Recipes",
    template: "%s | Culinary Haven",
  },
  description:
    "Discover and explore a world of delicious recipes, cooking tips, and culinary inspiration. Find your next favorite dish with our extensive collection.",
  keywords: [
    "recipes",
    "cooking",
    "food",
    "culinary",
    "dishes",
    "meal plans",
    "cooking instructions",
  ],
  authors: [{ name: "Culinary Haven Team" }],
  manifest: "/site.webmanifest",
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Culinary Haven",
  },
  openGraph: {
    title: "Culinary Haven - Discover Delicious Recipes",
    description:
      "Explore our collection of delicious recipes and cooking inspiration",
    url: "https://your-domain.com",
    siteName: "Culinary Haven",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Culinary Haven - Discover Delicious Recipes",
    description:
      "Explore our collection of delicious recipes and cooking inspiration",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

/**
 * RootLayout Component
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render inside the layout.
 * @returns {JSX.Element} The rendered root layout for the application.
 *
 * @description This is the main layout component for the application, providing a consistent
 * structure with a header, footer, and session management. It also sets global metadata for SEO
 * and social sharing purposes.
 *
 */
export default async function RootLayout({ children }) {
  /**
   * Retrieves the server-side session for the current user.
   * @async
   * @function getServerSession
   * @returns {Promise<Object>} The session object.
   */
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-touch-icon-72x72.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <SessionProvider session={session}>
          <ThemeProvider>
            <Header />
            <OnlineStatus />
            <PushNotificationManager />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
            <PWAInstallPrompt />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
