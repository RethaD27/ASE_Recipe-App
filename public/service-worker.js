const CACHE_NAME = "recipe-app-cache-v2";
const urlsToCache = [
  "/",
  "/site.webmanifest",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Enhanced push notification handling
self.addEventListener("push", (event) => {
  try {
    const data = event.data.json();
    let notificationOptions = {};

    // Categorize notifications with specific handling
    switch (data.type) {
      case "recipe-update":
        notificationOptions = {
          body: `${data.userName} updated: ${data.recipeTitle}`,
          icon: "/android-chrome-192x192.png",
          data: {
            type: "recipe-update",
            recipeId: data.recipeId,
            recipeTitle: data.recipeTitle,
            message: `Recipe "${data.recipeTitle}" has been updated`,
          },
        };
        break;
      case "popular-recipe":
        notificationOptions = {
          body: `${data.count} of your favorite recipes are trending!`,
          icon: "/android-chrome-192x192.png",
          data: {
            type: "popular-recipe",
            message: `${data.count} trending recipes`,
            url: "/recipes/popular",
          },
        };
        break;
      case "offline-update":
        notificationOptions = {
          body: `${data.count} recipes have been updated for offline access`,
          icon: "/android-chrome-192x192.png",
          data: {
            type: "offline-update",
            message: `${data.count} offline recipes updated`,
            url: "/favorites",
          },
        };
        break;
      default:
        notificationOptions = {
          body: data.message,
          icon: "/android-chrome-192x192.png",
        };
    }

    // Show notification
    event.waitUntil(
      self.registration.showNotification(
        data.title || "Culinary Haven",
        notificationOptions
      )
    );
  } catch (error) {
    console.error("Push notification error:", error);
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const data = notification.data;

  event.notification.close();

  // Send message to the client for toast notification
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: data.type,
          message: data.message,
          recipeId: data.recipeId,
          recipeTitle: data.recipeTitle,
          url: data.url,
        });
      }

      // Open the specified URL
      return clients.openWindow(data.url || "/");
    })
  );
});
