import withPWA from "next-pwa"; // Import the PWA configuration utility from the next-pwa package

/**
 * @type {import('next').NextConfig} 
 * This defines the Next.js configuration object with custom settings for images and webpack.
 */
const nextConfig = {
  images: {
    // Configure allowed remote image sources using remotePatterns
    remotePatterns: [
      {
        protocol: "https", // Protocol used for images
        hostname: "img.sndimg.com", // Allowed hostname for image source
        port: "", // No specific port required
        pathname: "/**", // Allow all paths under this hostname
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  /**
   * Custom Webpack configuration to handle service worker compatibility.
   * @param {object} config - The Webpack configuration object.
   * @param {object} options - Options provided by Next.js, including whether it's a server build.
   * @returns {object} The updated Webpack configuration object.
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Avoid using certain Node.js modules on the client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // File system module disabled
        net: false, // Network module disabled
        tls: false, // TLS module disabled
      };
    }
    return config; // Return the updated configuration
  },
};

/**
 * Configuration for Progressive Web App (PWA) functionality using next-pwa.
 * @type {object} 
 */
const pwaConfig = withPWA({
  dest: "public", // Destination folder for the service worker files
  register: true, // Automatically register the service worker
  skipWaiting: true, // Activate the new service worker immediately
  disable: process.env.NODE_ENV === "development", // Disable PWA during development
  runtimeCaching: [
    // Caching configuration for static images
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|webp|svg|gif)$/, // Match URLs for image files
      handler: "CacheFirst", // Use the CacheFirst strategy for image requests
      options: {
        cacheName: "image-cache", // Name of the image cache
        expiration: {
          maxEntries: 60, // Maximum number of cached entries
          maxAgeSeconds: 30 * 24 * 60 * 60, // Cache duration: 30 days
        },
      },
    },
    // Caching configuration for API requests
    {
      urlPattern: /^https:\/\/api\..*\.com\/.*$/, // Match URLs for API requests
      handler: "NetworkFirst", // Use the NetworkFirst strategy for API requests
      options: {
        cacheName: "api-cache", // Name of the API cache
        networkTimeoutSeconds: 10, // Timeout for network requests: 10 seconds
        expiration: {
          maxEntries: 50, // Maximum number of cached entries
          maxAgeSeconds: 24 * 60 * 60, // Cache duration: 24 hours
        },
      },
    },
  ],
})(nextConfig);

export default pwaConfig; // Export the final PWA-enabled Next.js configuration
