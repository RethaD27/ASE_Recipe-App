"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Check,
  Loader2,
  X,
  Share2,
  PlusCircle,
  NotebookPen,
  Undo2,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import LoadingPage from "../loading";
import { motion, AnimatePresence } from "framer-motion";
import { getIngredientUnit } from "@/components/IngredientUnit";
import Alert from "@/components/Alert";
import ConfirmationModal from "@/components/ConfirmationModal";

/**
 * Shopping List Page Component
 * Manages user's shopping lists, allowing creation, modification, and interaction
 *
 * @component
 * @returns {React.ReactElement} Rendered shopping list page
 */
export default function ShoppingListPage() {
  // Authentication and routing hooks
  const { data: session } = useSession();
  const router = useRouter();

  // State management for shopping lists and UI interactions
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for various UI interactions and actions
  const [deleting, setDeleting] = useState({});
  const [removingItem, setRemovingItem] = useState({});
  const [updatingQuantity, setUpdatingQuantity] = useState({});

  // New list creation states
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  // New item addition states
  const [newItemAmount, setNewItemAmount] = useState(1);
  const [newItemIngredient, setNewItemIngredient] = useState("");
  const [addingManualItem, setAddingManualItem] = useState(null);

  // UI interaction states
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Confirmation and undo states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [undoItem, setUndoItem] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  // Alert state for user notifications
  const [alert, setAlert] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  /**
   * Displays an alert to the user
   *
   * @param {string} message - Message to display
   * @param {string} [type='success'] - Type of alert (success/error)
   */
  const showAlert = (message, type = "success") => {
    setAlert({
      isVisible: true,
      message,
      type,
    });
  };

  /**
   * Fetches user's shopping lists from the server
   *
   * @async
   * @throws {Error} If fetching lists fails
   */
  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/shopping-list", {
        headers: {
          "user-id": session.user.id,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch shopping lists");

      const data = await response.json();
      setLists(data);
    } catch (error) {
      setError("Error fetching shopping lists: " + error.message);
      showAlert("Failed to fetch shopping lists", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates the delete list process with confirmation
   *
   * @param {string} id - ID of the shopping list to delete
   */
  const confirmDeleteList = (id) => {
    setListToDelete(id);
    setShowDeleteConfirmation(true);
  };

  /**
   * Handles the confirmed deletion of a shopping list
   */
  const handleConfirmedDelete = async () => {
    if (!listToDelete) return;

    try {
      setDeleting((prev) => ({ ...prev, [listToDelete]: true }));

      const response = await fetch(`/api/shopping-list/${listToDelete}`, {
        method: "DELETE",
        headers: {
          "user-id": session.user.id,
        },
      });

      if (!response.ok) throw new Error("Failed to delete shopping list");

      fetchLists();
      showAlert("Shopping list deleted successfully!");
    } catch (error) {
      setError("Error deleting list: " + error.message);
      showAlert("Failed to delete shopping list", "error");
    } finally {
      setDeleting((prev) => ({ ...prev, [listToDelete]: false }));
      setShowDeleteConfirmation(false);
      setListToDelete(null);
    }
  };

  /**
   * Removes a specific item from a shopping list with undo functionality
   *
   * @param {string} id - ID of the shopping list
   * @param {number} index - Index of the item to remove
   * @async
   */
  const removeItem = async (id, index) => {
    try {
      setRemovingItem({ id, index });

      const list = lists.find((l) => l._id === id);
      const removedItem = list.items[index];

      const response = await fetch(`/api/shopping-list/${id}/items`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "user-id": session.user.id,
        },
        body: JSON.stringify({ index }),
      });

      if (!response.ok) throw new Error("Failed to remove item");

      setUndoItem({ listId: id, item: removedItem, index });

      if (undoTimer) clearTimeout(undoTimer);

      const timer = setTimeout(() => {
        setUndoItem(null);
      }, 10000);

      setUndoTimer(timer);

      fetchLists();
      showAlert("Item removed. Undo available for 10 seconds.");
    } catch (error) {
      setError("Error removing item: " + error.message);
      showAlert("Failed to remove item", "error");
    } finally {
      setRemovingItem({ id: null, index: null });
    }
  };

  /**
   * Undoes the last item removal
   */
  const undoItemRemoval = async () => {
    if (!undoItem) return;

    try {
      const { listId, item, index } = undoItem;
      const list = lists.find((l) => l._id === listId);

      if (!list) {
        throw new Error("List not found");
      }

      const updatedItems = [...list.items];
      updatedItems.splice(index, 0, item);

      const response = await fetch(
        `/api/shopping-list/${listId}`, // Fixed: using listId instead of id
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "user-id": session.user.id,
          },
          body: JSON.stringify({ items: updatedItems }),
        }
      );

      if (!response.ok) throw new Error("Failed to undo item removal");

      if (undoTimer) clearTimeout(undoTimer);
      setUndoTimer(null);
      setUndoItem(null);

      fetchLists();
      showAlert("Item restored successfully!");
    } catch (error) {
      setError("Error restoring item: " + error.message);
      showAlert("Failed to restore item", "error");
    }
  };

  /**
   * Marks an item as purchased or not purchased
   *
   * @param {string} id - ID of the shopping list
   * @param {number} itemIndex - Index of the item to mark
   */
  const markAsPurchased = async (id, itemIndex) => {
    try {
      const list = lists.find((l) => l._id === id);
      if (!list) return;

      const updatedItems = [...list.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        purchased: !updatedItems[itemIndex].purchased,
      };

      const response = await fetch(`/api/shopping-list/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "user-id": session.user.id,
        },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) throw new Error("Failed to update item");
      fetchLists();
    } catch (error) {
      setError("Error updating item: " + error.message);
    }
  };

  /**
   * Updates the quantity of an item in a shopping list
   *
   * @param {string} id - ID of the shopping list
   * @param {number} index - Index of the item to update
   * @param {number} newQuantity - New quantity for the item
   */
  const updateQuantity = async (id, index, newQuantity) => {
    try {
      setUpdatingQuantity({ id, index });
      const list = lists.find((l) => l._id === id);
      if (!list) return;

      const updatedItems = [...list.items];
      updatedItems[index] = {
        ...updatedItems[index],
        amount: newQuantity,
      };

      const response = await fetch(`/api/shopping-list/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "user-id": session.user.id,
        },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");
      fetchLists();
    } catch (error) {
      setError("Error updating quantity: " + error.message);
    } finally {
      setUpdatingQuantity({ id: null, index: null });
    }
  };

  /**
   * Generates a WhatsApp sharing link for a shopping list
   *
   * @param {Object} list - The shopping list to share
   * @returns {string} WhatsApp sharing URL
   */
  const generateWhatsAppLink = (list) => {
    const listText = list.items
      .map(
        (item) =>
          `${item.amount} ${item.ingredient}${
            item.purchased ? " (Purchased)" : ""
          }`
      )
      .join("\n");

    const message = encodeURIComponent(`${list.name}: \n${listText}`);
    return `https://wa.me/?text=${message}`;
  };

  /**
   * Creates a new shopping list
   */
  const createShoppingList = async () => {
    if (!session) {
      alert("Please sign in to create a shopping list");
      return;
    }
    if (!newListName.trim()) {
      alert("Please enter a name for your shopping list");
      return;
    }

    try {
      setCreatingList(true);
      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": session.user.id,
        },
        body: JSON.stringify({ name: newListName.trim(), items: [] }),
      });

      if (!response.ok) throw new Error("Failed to create shopping list");

      setNewListName("");
      fetchLists();
      showAlert("Shopping list created successfully!");
    } catch (error) {
      console.error("Error creating shopping list:", error);
      showAlert("Failed to create shopping list", "error");
    } finally {
      setCreatingList(false);
    }
  };

  /**
   * Adds a manual item to a shopping list
   *
   * @param {string} id - ID of the shopping list
   */
  const addManualItem = async (id) => {
    if (!newItemIngredient.trim()) {
      alert("Please enter an item name");
      return;
    }

    try {
      setAddingManualItem(id);
      const list = lists.find((l) => l._id === id);
      if (!list) return;

      const newItem = {
        ingredient: newItemIngredient.trim(),
        amount: newItemAmount,
        purchased: false,
      };

      const updatedItems = [...list.items, newItem];

      const response = await fetch(`/api/shopping-list/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "user-id": session.user.id,
        },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) throw new Error("Failed to add manual item");

      setNewItemIngredient("");
      setNewItemAmount(1);

      fetchLists();
    } catch (error) {
      setError("Error adding manual item: " + error.message);
      showAlert("Failed to add item to shopping list", "error");
    } finally {
      setAddingManualItem(null);
    }
  };

  // Initial data fetch and authentication check
  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchLists();
  }, [session, router]);

  // Loading state
  if (loading) return <LoadingPage />;

  // Error state
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  // Ensure session exists (redundant with useEffect, but added for type safety)
  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Confirmation Modal for List Deletion */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmedDelete}
        title="Delete Shopping List"
        message="Are you sure you want to delete this shopping list? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Undo Item Removal Banner */}
      {undoItem && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col items-center space-y-2"
        >
          <span className="text-sm text-center">
            Removed: {undoItem.item.amount} {undoItem.item.ingredient}
          </span>
          <button
            onClick={undoItemRemoval}
            className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            <Undo2 className="w-5 h-5" />
            <span>Undo</span>
          </button>
        </motion.div>
      )}

      {/* Alert component */}
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.isVisible}
        onClose={() => setAlert({ ...alert, isVisible: false })}
      />

      {/* Fixed position back button */}
      <div className="absolute top-2 -left-[5rem] z-10">
        <BackButton className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-2 hover:bg-white transition-colors dark:bg-gray-800 dark:hover:bg-gray-700" />
      </div>

      <h1 className="text-4xl font-bold mt-6 mb-20 dark:text-white text-center tracking-tight text-gray-700 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-500">
        My Shopping Lists
      </h1>
      <div className="container mx-auto px-4 pb-8">
        {/* Trigger Button - Fixed on the left side */}
        <motion.button
          onClick={() => setIsPanelOpen(true)}
          className="fixed left-0 -translate-y-[3rem] bg-teal-600 dark:bg-teal-700 text-white p-3 rounded-r-lg shadow-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors z-40 group"
        >
          <NotebookPen className="w-5 h-5" />
          <span className="absolute left-full top-1/2 -translate-y-1/2 bg-teal-600 dark:bg-teal-700 text-white px-2 py-1 rounded-r-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-0.5">
            Create Shopping List
          </span>
        </motion.button>

        {/* Overlay Background */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              onClick={() => setIsPanelOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
            />
          )}
        </AnimatePresence>

        {/* Panel */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Panel Header */}
              <div className=" p-3 flex justify-between items-center py-[1.1rem] border-b bg-gradient-to-r from-teal-50 to-slate-100 dark:from-slate-800 dark:to-teal-900 border-neutral-100 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <PlusCircle className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
                  <h2 className="text-base font-semibold text-teal-800 dark:text-emerald-300">
                    Create Shopping List
                  </h2>
                </div>
                {/* Close Button */}
                <motion.button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>{" "}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Create Shopping List Section */}
                <div className="flex space-x-4 items-center">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Create a new shopping list"
                    className="flex-grow px-4 p-2 rounded-lg border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-teal-900 dark:text-slate-200 shadow-sm hover:border-teal-200 dark:hover:border-slate-600 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-teal-500/40 focus:border-teal-500"
                  />

                  <button
                    onClick={createShoppingList}
                    disabled={creatingList}
                    className="px-4 py-2 bg-teal-600 text-white dark:bg-teal-500 rounded-lg transition-all duration-300 hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-800 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {creatingList && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <span>{creatingList ? "Creating..." : "Create List"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* </div> */}

        {/* Shopping Lists Grid */}
        {lists.length === 0 ? (
          <div className="text-center py-12 px-6">
            <ShoppingCart className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              You haven't created any shopping lists yet. Start by creating one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list._id}
                className="bg-white dark:bg-gray-750 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {list.name && list.name.length > 52 ? (
                          <>{list.name.slice(0, 52)}...</>
                        ) : (
                          list.name ||
                          `Shopping List - ${new Date(
                            list.createdAt
                          ).toLocaleDateString()}`
                        )}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created on{" "}
                        {new Date(list.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={generateWhatsAppLink(list)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => confirmDeleteList(list._id)}
                        disabled={deleting[list._id]}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                      >
                        {deleting[list._id] ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Manual Item Addition */}
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="number"
                      value={newItemAmount}
                      onChange={(e) =>
                        setNewItemAmount(parseInt(e.target.value, 10) || 1)
                      }
                      min="1"
                      className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={newItemIngredient}
                      onChange={(e) => setNewItemIngredient(e.target.value)}
                      placeholder="Add custom item"
                      className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => addManualItem(list._id)}
                      disabled={addingManualItem === list._id}
                      className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
                    >
                      {addingManualItem === list._id ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <PlusCircle className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {list.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Purchase Button */}
                          <button
                            onClick={() => markAsPurchased(list._id, index)}
                            className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                              transition-all duration-300
                              ${
                                item.purchased
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-gray-300 dark:border-gray-600 hover:border-emerald-500"
                              }
                            `}
                          >
                            {item.purchased && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>

                          {/* Ingredient Display */}
                          <span
                            className={`
                              ${
                                item.purchased
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : "text-gray-800 dark:text-gray-200"
                              }
                              transition-colors duration-300
                            `}
                          >
                            {item.amount}{" "}
                            {getIngredientUnit(item.ingredient) || ""}{" "}
                            {item.ingredient}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) =>
                              updateQuantity(
                                list._id,
                                index,
                                parseInt(e.target.value, 10)
                              )
                            }
                            disabled={
                              updatingQuantity.id === list._id &&
                              updatingQuantity.index === index
                            }
                            className="w-20 text-center text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                          />
                          <button
                            onClick={() => removeItem(list._id, index)}
                            disabled={
                              removingItem.id === list._id &&
                              removingItem.index === index
                            }
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                          >
                            {removingItem.id === list._id &&
                            removingItem.index === index ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
