"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Alert from "./Alert";

/**
 * RecipeEdit Component
 * Allows users to view and edit recipe descriptions with authentication and version tracking
 *
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.recipe - The recipe object to be edited
 * @returns {React.ReactElement} Rendered recipe edit component
 */
const RecipeEdit = ({ recipe }) => {
  // Initialize router for navigation
  const router = useRouter();

  // Get current user session and authentication status
  const { data: session, status } = useSession();

  // State for managing description input
  const [description, setDescription] = useState(recipe?.description || "");

  // State for storing the local copy of the recipe
  const [localRecipe, setLocalRecipe] = useState(recipe);

  // State to manage loading state during submission
  const [loading, setLoading] = useState(false);

  // State for managing alert messages
  const [alert, setAlert] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // State to toggle between view and edit modes
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Update local state when recipe prop changes
   * Ensures component reflects the latest recipe data
   */
  useEffect(() => {
    // Reset description and local recipe state
    setDescription(recipe?.description || "");
    setLocalRecipe(recipe);
  }, [recipe]);

  /**
   * Display an alert message to the user
   *
   * @param {string} message - The message to display
   * @param {string} [type="success"] - The type of alert (success/error)
   */
  const showAlert = (message, type = "success") => {
    // Update alert state to show the message
    setAlert({
      isVisible: true,
      message,
      type,
    });
  };

  /**
   * Handle form submission for updating recipe description
   *
   * @param {React.FormEvent} event - Form submission event
   */
  const handleSubmit = async (event) => {
    // Prevent default form submission behavior
    event.preventDefault();

    // Redirect to sign in if no user session exists
    if (!session?.user) {
      signIn();
      return;
    }

    // Validate recipe ID
    if (!recipe?._id) {
      showAlert("Recipe ID is missing.", "error");
      return;
    }

    // Validate description length
    if (description.trim().length < 10) {
      showAlert("Description must be at least 10 characters long.", "error");
      return;
    }

    // Set loading state to true
    setLoading(true);

    try {
      // Create an optimistic update to immediately reflect changes
      const optimisticUpdate = {
        ...localRecipe,
        description: description.trim(),
        userVersions: {
          ...localRecipe.userVersions,
          // Create a new version entry with current timestamp
          [Date.now()]: {
            userName: session.user.name || session.user.email,
            lastModified: new Date().toISOString(),
          },
        },
      };
      // Update local state optimistically
      setLocalRecipe(optimisticUpdate);

      // Send PATCH request to update recipe
      const response = await fetch(`/api/recipes/${recipe._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          userId: session.user.id,
          userName: session.user.name || session.user.email,
        }),
      });

      // Handle unsuccessful response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update recipe");
      }

      // Parse successful response
      const { recipe: updatedRecipe } = await response.json();

      // Show success message and update state
      showAlert("Description updated successfully!");
      setIsEditing(false);
      setLocalRecipe(updatedRecipe);
    } catch (error) {
      // Revert to original recipe state on error
      setLocalRecipe(recipe);
      // Show error message
      showAlert(error.message || "An error occurred while updating.", "error");
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  /**
   * Reset the description to its original state and exit editing mode
   */
  const handleReset = () => {
    // Revert description to original
    setDescription(localRecipe?.description || "");
    // Exit editing mode
    setIsEditing(false);
  };

  // Don't render anything if no recipe is available
  if (!localRecipe) {
    return null;
  }

  /**
   * Format a date string into a more readable format
   *
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Render the edit history of the recipe
   *
   * @returns {React.ReactElement|null} Edit history component or null
   */
  const renderEditHistory = () => {
    // Return null if no user versions exist
    if (!localRecipe.userVersions) return null;

    // Sort and get the latest version
    const latestVersion = Object.values(localRecipe.userVersions).sort(
      (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
    )[0];

    // Return null if no latest version found
    if (!latestVersion) return null;

    // Render edit history information
    return (
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Last edited by {latestVersion.userName} on{" "}
        {formatDate(latestVersion.lastModified)}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm relative">
      {/* Alert component for showing success/error messages */}
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.isVisible}
        onClose={() => setAlert((prev) => ({ ...prev, isVisible: false }))}
      />

      {/* Conditional rendering between view and edit modes */}
      {!isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Description
            </h2>
            {/* Edit button visible only to logged-in users */}
            {session && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Edit Description
              </button>
            )}
          </div>
          {/* Display current description */}
          <p className="text-gray-700 dark:text-gray-300">
            {localRecipe.description}
          </p>
          {/* Render edit history */}
          {renderEditHistory()}
        </div>
      ) : (
        // Edit mode rendering
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Edit Description
          </h2>

          {/* Description edit form */}
          <form onSubmit={handleSubmit}>
            <textarea
              name="description"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Edit the description here..."
              minLength={10}
              required
            />

            {/* Form action buttons */}
            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-500 transition-colors disabled:opacity-50"
                // Disable button when loading, description is too short, or no session
                disabled={loading || description.trim().length < 10 || !session}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sign-in prompt for unauthenticated users */}
      {!session && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-gray-700 dark:text-gray-300">
            Please{" "}
            <button
              onClick={() => signIn()}
              className="text-teal-600 hover:underline dark:text-teal-400"
            >
              sign in
            </button>{" "}
            to edit the recipe description.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeEdit;
