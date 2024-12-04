"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushNotificationManager() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Handle incoming push notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type) {
          switch (event.data.type) {
            case "recipe-update":
              toast.info(event.data.message, {
                description: `Recipe: ${event.data.recipeTitle}`,
                action: {
                  label: "View Recipe",
                  onClick: () => {
                    window.location.href = `/recipes/${event.data.recipeId}`;
                  },
                },
                icon: "🍲",
              });
              break;
            case "popular-recipe":
              toast.success(event.data.message, {
                description: "Check out trending recipes!",
                action: {
                  label: "Explore",
                  onClick: () => {
                    window.location.href = "/recipes/popular";
                  },
                },
                icon: "🔥",
              });
              break;
            case "offline-update":
              toast.info(event.data.message, {
                description: "Your offline recipes have been updated",
                action: {
                  label: "Sync Now",
                  onClick: () => {
                    window.location.href = "/favorites";
                  },
                },
                icon: "📥",
              });
              break;
            default:
              toast(event.data.message);
          }
        }
      });
    }

    if (
      !session ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    async function registerPushNotifications() {
      try {
        const registration =
          await navigator.serviceWorker.register("/service-worker.js");
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (existingSubscription) {
          setSubscription(existingSubscription);
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission denied", {
            description: "You won't receive push notifications",
          });
          return;
        }

        const applicationServerKey = urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        );

        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        setSubscription(newSubscription);

        // Send subscription to server
        await fetch("/api/push-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSubscription),
        });

        toast.success("Push Notifications Enabled", {
          description: "You'll now receive recipe updates and alerts",
        });
      } catch (error) {
        console.error("Push notification registration error:", error);
        toast.error("Failed to register push notifications", {
          description: "Please check your browser settings",
        });
      }
    }

    registerPushNotifications();
  }, [session]);

  return null;
}
