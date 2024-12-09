/**
 * Name of the cache to store resources for offline use.
 * @const {string}
 */
const CACHE_NAME = "recipe-app-cache-v2";

/**
 * List of URLs to be cached for offline access.
 * @const {Array<string>}
 */
const urlsToCache = [
  "/", // Root URL
  "/site.webmanifest", // Web manifest file for PWA
  "/android-chrome-192x192.png", // App icon (192x192)
  "/android-chrome-512x512.png", // App icon (512x512)
];

/**
 * Event listener for the service worker installation.
 * Caches predefined URLs during the install phase.
 */
self.addEventListener("install", (event) => {
  // Wait until caching is completed before finishing installation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache"); // Log when the cache is successfully opened
      return cache.addAll(urlsToCache); // Add all URLs to the cache
    })
  );
});

/**
 * Event listener for push notifications.
 * Handles different types of push notifications and displays them.
 */
self.addEventListener("push", (event) => {
  try {
    // Parse the push notification data as JSON
    const data = event.data.json();
    let notificationOptions = {}; // Initialize options for the notification

    // Switch statement to handle specific notification types
    switch (data.type) {
      case "recipe-update":
        notificationOptions = {
          body: `${data.userName} updated: ${data.recipeTitle}`, // Message body
          icon: "/android-chrome-192x192.png", // Notification icon
          data: {
            type: "recipe-update",
            recipeId: data.recipeId, // ID of the updated recipe
            recipeTitle: data.recipeTitle, // Title of the updated recipe
            message: `Recipe "${data.recipeTitle}" has been updated`, // Custom message
          },
        };
        break;
      case "popular-recipe":
        notificationOptions = {
          body: `${data.count} of your favorite recipes are trending!`, // Message body
          icon: "/android-chrome-192x192.png", // Notification icon
          data: {
            type: "popular-recipe",
            message: `${data.count} trending recipes`, // Custom message
            url: "/recipes/popular", // URL to open on click
          },
        };
        break;
      case "offline-update":
        notificationOptions = {
          body: `${data.count} recipes have been updated for offline access`, // Message body
          icon: "/android-chrome-192x192.png", // Notification icon
          data: {
            type: "offline-update",
            message: `${data.count} offline recipes updated`, // Custom message
            url: "/favorites", // URL to open on click
          },
        };
        break;
      default:
        notificationOptions = {
          body: data.message, // Default message body
          icon: "/android-chrome-192x192.png", // Default icon
        };
    }

    // Show the notification with the specified options
    event.waitUntil(
      self.registration.showNotification(
        data.title || "Culinary Haven", // Notification title
        notificationOptions
      )
    );
  } catch (error) {
    // Log any errors that occur during push notification handling
    console.error("Push notification error:", error);
  }
});

/**
 * Event listener for notification clicks.
 * Handles user interactions with notifications.
 */
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification; // The clicked notification
  const data = notification.data; // Data associated with the notification

  // Close the notification
  event.notification.close();

  // Handle notification click actions
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Iterate through all open clients (windows/tabs)
      for (const client of clientList) {
        // Post a message to each client with notification details
        client.postMessage({
          type: data.type, // Notification type
          message: data.message, // Custom message
          recipeId: data.recipeId, // Recipe ID
          recipeTitle: data.recipeTitle, // Recipe title
          url: data.url, // URL associated with the notification
        });
      }

      // Open the specified URL in a new window or tab
      return clients.openWindow(data.url || "/");
    })
  );
});
