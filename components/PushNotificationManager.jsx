"use client"; // Indicates that this code is a client-side component in Next.js

// Import necessary hooks and libraries
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

/**
 * Converts a base64 string to a Uint8Array, which is required for PushManager's applicationServerKey.
 * @param {string} base64String - The base64 string to be converted.
 * @returns {Uint8Array} - A Uint8Array representation of the base64 string.
 */
const urlBase64ToUint8Array = (base64String) => {
  // Add padding to the base64 string if necessary
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  // Replace URL-safe characters with standard base64 characters
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  // Decode the base64 string to raw binary data
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  // Convert each character to a byte
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * PushNotificationManager handles the registration and management of push notifications.
 * It listens for push messages from the service worker and displays toast notifications accordingly.
 * @returns {null} - This component renders nothing but manages push notification logic.
 */
export default function PushNotificationManager() {
  const { data: session } = useSession(); // Get session data using NextAuth
  const [subscription, setSubscription] = useState(null); // State to store push subscription

  // Effect to handle push notification setup and message handling
  useEffect(() => {
    // Check if service workers are supported
    if ("serviceWorker" in navigator) {
      // Add an event listener for messages from the service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type) {
          // Handle different types of messages
          switch (event.data.type) {
            case "recipe-update":
              // Display a toast for recipe updates
              toast.info(event.data.message, {
                description: `Recipe: ${event.data.recipeTitle}`,
                action: {
                  label: "View Recipe",
                  onClick: () => {
                    window.location.href = `/recipes/${event.data.recipeId}`;
                  },
                },
                icon: "🍲", // Icon for the toast
              });
              break;
            case "popular-recipe":
              // Display a toast for popular recipes
              toast.success(event.data.message, {
                description: "Check out trending recipes!",
                action: {
                  label: "Explore",
                  onClick: () => {
                    window.location.href = "/recipes/popular";
                  },
                },
                icon: "🔥", // Icon for the toast
              });
              break;
            case "offline-update":
              // Display a toast for offline updates
              toast.info(event.data.message, {
                description: "Your offline recipes have been updated",
                action: {
                  label: "Sync Now",
                  onClick: () => {
                    window.location.href = "/favorites";
                  },
                },
                icon: "📥", // Icon for the toast
              });
              break;
            default:
              // Display a generic toast for other messages
              toast(event.data.message);
          }
        }
      });
    }

    // Exit if session or required APIs are not available
    if (
      !session ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    /**
     * Registers the client for push notifications.
     * Requests permission and subscribes to push notifications using the service worker.
     */
    async function registerPushNotifications() {
      try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        // Check for an existing subscription
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (existingSubscription) {
          // Use the existing subscription
          setSubscription(existingSubscription);
          return;
        }

        // Request notification permissions
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          // Show error toast if permission is denied
          toast.error("Notification permission denied", {
            description: "You won't receive push notifications",
          });
          return;
        }

        // Convert VAPID public key to Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        );

        // Subscribe for push notifications
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        // Store the subscription in state
        setSubscription(newSubscription);

        // Send the subscription to the server
        await fetch("/api/push-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSubscription),
        });

        // Show success toast for enabling notifications
        toast.success("Push Notifications Enabled", {
          description: "You'll now receive recipe updates and alerts",
        });
      } catch (error) {
        // Log and show error toast for registration failure
        console.error("Push notification registration error:", error);
        toast.error("Failed to register push notifications", {
          description: "Please check your browser settings",
        });
      }
    }

    // Call the function to register push notifications
    registerPushNotifications();
  }, [session]); // Dependency array includes session

  return null; // The component does not render any UI
}
