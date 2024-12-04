"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const RecipeEdit = ({ recipe }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [description, setDescription] = useState(recipe?.description || "");
  const [localRecipe, setLocalRecipe] = useState(recipe);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when recipe prop changes
  useEffect(() => {
    setDescription(recipe?.description || "");
    setLocalRecipe(recipe);
  }, [recipe]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!session?.user) {
      signIn();
      return;
    }

    if (!recipe?._id) {
      setError("Recipe ID is missing.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Optimistically update local state
      const optimisticUpdate = {
        ...localRecipe,
        description: description.trim(),
        userVersions: {
          ...localRecipe.userVersions,
          [Date.now()]: {
            userName: session.user.name || session.user.email,
            lastModified: new Date().toISOString(),
          },
        },
      };
      setLocalRecipe(optimisticUpdate);

      // Send update request
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update recipe");
      }

      const { recipe: updatedRecipe } = await response.json();

      setSuccessMessage("Description updated successfully!");
      setIsEditing(false);
      setLocalRecipe(updatedRecipe);
    } catch (error) {
      // Revert to original state on error
      setLocalRecipe(recipe);
      setError(error.message || "An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription(localRecipe?.description || "");
    setError(null);
    setSuccessMessage(null);
    setIsEditing(false);
  };

  if (!localRecipe) {
    return null;
  }

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

  const renderEditHistory = () => {
    if (!localRecipe.userVersions) return null;

    const latestVersion = Object.values(localRecipe.userVersions).sort(
      (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
    )[0];

    if (!latestVersion) return null;

    return (
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Last edited by {latestVersion.userName} on{" "}
        {formatDate(latestVersion.lastModified)}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm">
      {!isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Description
            </h2>
            {session && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Edit Description
              </button>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {localRecipe.description}
          </p>
          {renderEditHistory()}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Edit Description
          </h2>

          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

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

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-500 transition-colors disabled:opacity-50"
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
