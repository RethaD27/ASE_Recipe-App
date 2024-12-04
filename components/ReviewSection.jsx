"use client";

import swal from "sweetalert"; // Import SweetAlert for simple alert popups.
import Swal from "sweetalert2"; // Import SweetAlert2 for advanced confirmation modals.
import { useState, useEffect } from "react"; // Import React hooks.
import { Star } from "lucide-react"; // Import the Star icon from Lucide for ratings.
import { useSession } from "next-auth/react"; // Import `useSession` to handle user authentication.
import { signIn } from "next-auth/react"; // Import `signIn` to prompt user login.

/**
 * ReviewSection Component
 * - Displays and manages user reviews for a specific recipe.
 * - Features include adding, editing, deleting, and sorting reviews.
 * - Allows only authenticated users to interact with the review system.
 *
 * @param {Object} props - Component props.
 * @param {string} props.recipeId - The ID of the recipe for which reviews are managed.
 */
function ReviewSection({ recipeId }) {
  // Session management using NextAuth.
  const { data: session, status } = useSession();

  // State variables for reviews, form inputs, and UI behavior.
  const [reviews, setReviews] = useState([]); // Stores the list of reviews.
  const [currentUser, setCurrentUser] = useState(null); // Tracks the current logged-in user.
  const [reviewsVisible, setReviewsVisible] = useState(false); // Toggles review visibility.
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" }); // Stores new or updated review data.
  const [submittingReview, setSubmittingReview] = useState(false); // Tracks if a review is being submitted.
  const [error, setError] = useState(null); // Tracks error messages.
  const [hover, setHover] = useState(0); // Tracks hover state for rating stars.
  const [editingReviewId, setEditingReviewId] = useState(null); // Tracks ID of the review being edited.
  const [sortBy, setSortBy] = useState("date"); // Current sorting field.
  const [sortOrder, setSortOrder] = useState("desc"); // Current sorting order.

  /**
   * Fetches reviews from the API when the reviews section becomes visible or user session changes.
   */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/recipes/${recipeId}/reviews`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data.reviews || []);
        setCurrentUser(data.currentUser); // Identify the current user for ownership checks.
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Failed to load reviews");
      }
    };

    if (reviewsVisible) {
      fetchReviews();
    }
  }, [recipeId, reviewsVisible, session]);

  /**
   * Handles sorting reviews by a specific field (date or rating) and order (ascending or descending).
   * @param {string} field - Field to sort by ("date" or "rating").
   * @param {string} order - Sort order ("asc" or "desc").
   */
  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setReviews((prevReviews) => {
      const sortedReviews = [...prevReviews].sort((a, b) => {
        if (field === "date") {
          return order === "desc"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        } else if (field === "rating") {
          return order === "desc" ? b.rating - a.rating : a.rating - b.rating;
        }
        return 0;
      });
      return sortedReviews;
    });
  };

  /**
   * Adds or updates a review by sending data to the API.
   */
  const handleAddOrUpdateReview = async () => {
    if (!session) {
      swal(
        "Please log in",
        "You must be logged in to add a review.",
        "warning"
      );
      signIn();
      return;
    }

    try {
      setError(null);
      setSubmittingReview(true);

      if (newReview.rating === 0) {
        throw new Error("Please select a rating");
      }

      const method = editingReviewId ? "PUT" : "POST"; // Determine HTTP method.
      const endpoint = `/api/recipes/${recipeId}/reviews`; // API endpoint.
      const body = {
        rating: newReview.rating,
        comment: newReview.comment,
        ...(editingReviewId && { reviewId: editingReviewId }), // Include review ID for updates.
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Refresh reviews after submission.
      const refreshResponse = await fetch(`/api/recipes/${recipeId}/reviews`);
      const refreshData = await refreshResponse.json();
      setReviews(refreshData.reviews || []);

      // Reset form.
      setNewReview({ rating: 0, comment: "" });
      setEditingReviewId(null);
      swal(
        "Review submitted",
        "Your review has been successfully submitted.",
        "success"
      );
    } catch (error) {
      console.error("Failed to submit review:", error);
      setError(error.message);
      swal(
        "Submission failed",
        error.message || "Failed to add review",
        "error"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * Deletes a review by its ID.
   * @param {string} reviewId - ID of the review to delete.
   */
  const handleDeleteReview = async (reviewId) => {
    if (!session) {
      swal(
        "Please log in",
        "You must be logged in to delete a review.",
        "warning"
      );
      setError("You must be logged in to delete a review");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/api/recipes/${recipeId}/reviews?reviewId=${reviewId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete review");
        }

        // Refresh reviews after deletion.
        const refreshResponse = await fetch(`/api/recipes/${recipeId}/reviews`);
        const refreshData = await refreshResponse.json();
        setReviews(refreshData.reviews || []);
        swal(
          "Review deleted",
          "Your review has been successfully deleted.",
          "success"
        );
      } catch (error) {
        console.error("Error deleting review:", error);
        setError(error.message || "Failed to delete review");
        swal(
          "Deletion failed",
          error.message || "Failed to delete review",
          "error"
        );
      }
    }
  };

  /**
   * Determines whether the current user can add a review.
   * Users can only add one review per recipe.
   */
  const canAddReview =
    session &&
    !reviews.some(
      (review) =>
        review.userId === session.user.id ||
        review.username === session.user.name
    );

  /**
   * Loads a review into the form for editing.
   * @param {Object} review - Review object to edit.
   */
  const loadReviewForEditing = (review) => {
    setNewReview({
      rating: review.rating,
      comment: review.comment,
    });
    setEditingReviewId(review._id);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6 dark:bg-gray-700">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Reviews
        </h2>
      </div>
      <button
        onClick={() => setReviewsVisible(!reviewsVisible)}
        className="mb-4 bg-teal-500 dark:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg dark:hover:bg-teal-700 hover:bg-teal-600 transition-colors"
      >
        {reviewsVisible ? "Hide Reviews" : "Show Reviews"}
      </button>

      {reviewsVisible && (
        <>
          {/* Sort buttons */}
          <div className="my-6 flex flex-wrap gap-6 justify-between items-center">
            {/* Sort by Date */}
            <div className="flex flex-col space-y-2">
              <p className="text-gray-700 font-semibold dark:text-gray-300">
                Sort by Date:
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSortChange("date", "desc")}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out 
                    ${
                      sortBy === "date" && sortOrder === "desc"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-slate-600"
                    }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange("date", "asc")}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out 
                    ${
                      sortBy === "date" && sortOrder === "asc"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-slate-600"
                    }`}
                >
                  Oldest
                </button>
              </div>
            </div>

            {/* Sort by Rating */}
            <div className="flex flex-col space-y-2">
              <p className="text-gray-700 font-semibold dark:text-gray-300">
                Sort by Rating:
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSortChange("rating", "desc")}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out 
                    ${
                      sortBy === "rating" && sortOrder === "desc"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-slate-600"
                    }`}
                >
                  Highest
                </button>
                <button
                  onClick={() => handleSortChange("rating", "asc")}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out 
                    ${
                      sortBy === "rating" && sortOrder === "asc"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-slate-600"
                    }`}
                >
                  Lowest
                </button>
                <button
                  onClick={() => {
                    setSortBy("date");
                    setSortOrder("desc");
                  }}
                  className="ml-4 px-4 py-2 font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300 ease-in-out dark:bg-red-700 dark:hover:bg-red-600"
                >
                  <span className="hidden sm:inline">Reset Filters</span>
                  <span className="inline sm:hidden">Reset</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!session && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="text-gray-700 dark:text-gray-300">
                Please{" "}
                <button
                  onClick={() => signIn()}
                  className="text-teal-600 hover:underline dark:text-teal-400"
                >
                  sign in
                </button>{" "}
                to leave a review.
              </p>
            </div>
          )}

          {reviews.length === 0 && (
            <div className="text-center py-3 bg-gray-50 rounded-xl dark:bg-slate-800/50">
              <p className="text-gray-500 dark:text-gray-400">
                No reviews yet.{" "}
                {session
                  ? "Be the first to review this recipe!"
                  : "Sign in to be the first to review this recipe!"}
              </p>
            </div>
          )}

          {session && canAddReview && !editingReviewId && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-sm dark:bg-slate-800/50">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Add a Review
              </h3>
              {/* Review form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 dark:text-gray-300">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setNewReview({ ...newReview, rating: star })
                        }
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hover || newReview.rating)
                              ? "fill-yellow-400 text-yellow-400 dark:text-[#FFC857]"
                              : "text-gray-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 dark:text-gray-300">
                    Comment
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:focus:ring-teal-600"
                    placeholder="Share your thoughts about this recipe..."
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleAddOrUpdateReview}
                  disabled={submittingReview || newReview.rating === 0}
                  className="w-full px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold uppercase tracking-wider shadow-md transition-all duration-300 ease-in-out hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {session && editingReviewId && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-sm dark:bg-slate-800/50">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Edit Your Review
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 dark:text-gray-300">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setNewReview({ ...newReview, rating: star })
                        }
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hover || newReview.rating)
                              ? "fill-yellow-400 text-yellow-400 dark:text-[#FFC857]"
                              : "text-gray-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2 dark:text-gray-300">
                    Comment
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:focus:ring-teal-600"
                    placeholder="Share your thoughts about this recipe..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddOrUpdateReview}
                    disabled={submittingReview || newReview.rating === 0}
                    className="flex-1 px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold uppercase tracking-wider shadow-md transition-all duration-300 ease-in-out hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    {submittingReview ? "Updating..." : "Update Review"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingReviewId(null);
                      setNewReview({ rating: 0, comment: "" });
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold uppercase tracking-wider shadow-md transition-all duration-300 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border rounded-xl p-5 bg-white shadow-md dark:bg-slate-800/50 dark:border-slate-700 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex-col items-center justify-between mb-3">
                  <div className="flex justify-between items-center space-x-3">
                  {/* <div className="flex justify-between"> */}
                    <strong className="text-gray-800 dark:text-gray-100">
                      {review.username}
                    </strong>
                    {review.isOwner && (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => loadReviewForEditing(review)}
                          className="text-teal-600 hover:underline text-sm dark:text-teal-400"
                          disabled={editingReviewId !== null}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 hover:underline text-sm dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`w-5 h-5 mt-2 ${
                            index < review.rating
                              ? "fill-yellow-400 text-yellow-400 dark:text-[#FFC857]"
                              : "text-gray-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  {/* </div> */}

                </div>

                {review.comment && (
                  <p className="text-gray-700 mt-2 dark:text-gray-300">
                    {review.comment}
                  </p>
                )}

                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  {review.createdAt !== review.updatedAt && (
                    <p className="text-sm text-gray-400 italic dark:text-gray-500">
                      (edited {new Date(review.updatedAt).toLocaleDateString()})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewSection;
