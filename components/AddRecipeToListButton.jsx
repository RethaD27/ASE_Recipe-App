"use client";

import React, { useState } from "react";
import { ListPlus } from "lucide-react";
import Alert from "./Alert";

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
  const [alert, setAlert] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showAlert = (message, type = "success") => {
    setAlert({
      isVisible: true,
      message,
      type,
    });
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

        showAlert(`${items.length} ingredients added to shopping list`);
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

      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.isVisible}
        onClose={() => setAlert((prev) => ({ ...prev, isVisible: false }))}
      />

      <button
        onClick={addIngredientsToList}
        disabled={isLoading}
        className="flex items-center px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        <ListPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
        {isLoading ? "Adding..." : "Add All to Shopping List"}
      </button>
    </div>
  );
};

export default AddRecipeToListButton;
