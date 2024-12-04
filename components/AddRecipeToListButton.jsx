"use client";

import React, { useState } from "react";
import { ListPlus } from "lucide-react";

/**
 * AddRecipeToListButton Component
 *
 * A button component that allows users to add a recipe's ingredients to a shopping list.
 * Displays notifications for success or error messages and handles API requests.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.ingredients - The ingredients object where the key is the ingredient name and the value is the amount.
 * @param {string} props.shoppingListId - The ID of the shopping list to which ingredients will be added.
 * @returns {JSX.Element} The rendered button component.
 */
const AddRecipeToListButton = ({ ingredients, shoppingListId, recipeName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  /**
   * Show notification
   *
   * Displays a notification with the specified message and type for 3 seconds.
   *
   * @param {string} message - The message to display.
   * @param {string} [type='success'] - The type of the notification ('success' or 'error').
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Add ingredients to the shopping list
   *
   * Sends an API request to add the ingredients to the shopping list. Displays success or error messages.
   *
   * @async
   * @throws Will throw an error if the API request fails or the server response is invalid.
   */
  const addIngredientsToList = async () => {
    try {
      setIsLoading(true);

      // Transform ingredients object into an array format
      const items = Object.entries(ingredients).map(([ingredient, amount]) => ({
        ingredient,
        amount: amount.toString(),
      }));

      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          name: `Shopping List for ${recipeName}`,
        }),
      });

      try {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to add ingredients to shopping list"
          );
        }

        showNotification(`${items.length} ingredients added to shopping list`);
      } catch (parseError) {
        if (response.status === 404) {
          throw new Error("Shopping list endpoint not found");
        } else if (response.status === 401) {
          throw new Error("Please sign in to add items to shopping list");
        } else {
          throw new Error("Unexpected server response");
        }
      }
    } catch (error) {
      console.error("Error adding ingredients:", error);
      let errorMessage = error.message;

      // Handle network errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Network error: Please check your connection";
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={addIngredientsToList}
        disabled={isLoading}
        className="flex items-center px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        <ListPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
        {isLoading ? "Adding..." : "Add All to Shopping List"}
      </button>

      {notification && (
        <div
          className={`absolute top-full mt-2 right-0 p-3 rounded-lg shadow-lg text-sm w-64 z-50 ${
            notification.type === "error"
              ? "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100"
              : "bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-100"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AddRecipeToListButton;
