"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  PlusCircle,
  MinusCircle,
  ShoppingCart,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { getIngredientUnit } from "./IngredientUnit";
import Alert from "./Alert";

/**
 * ShoppingList Component
 * @param {Object} props - Props passed to the component.
 * @param {Object} props.ingredients - Ingredients data, where keys are ingredient names and values are quantities.
 *
 * This component allows users to manage shopping lists, add/remove items, create new lists, and add items to existing lists.
 * Users must be authenticated to use shopping list features.
 */

export default function ShoppingList({ ingredients }) {
  const { data: session } = useSession(); // Access the user's session data from NextAuth
  const [selectedItems, setSelectedItems] = useState([]); // Track selected ingredients
  const [lists, setLists] = useState([]); // Stores fetched shopping lists
  const [loading, setLoading] = useState(false); // Loading state for creating a list
  const [fetchingLists, setFetchingLists] = useState(true); // Loading state for fetching shopping lists
  const [addingToList, setAddingToList] = useState(null); // ID of the list currently being added to
  const [selectedId, setSelectedId] = useState(null); // ID of the currently selected list
  const [listName, setListName] = useState(""); // Name of the new shopping list
  const [isVisible, setIsVisible] = useState(true); // Controls visibility of the shopping list section
  const [showModal, setShowModal] = useState(false); // Add this state

  // New state for Alert
  const [alert, setAlert] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Helper function to show alert
  const showAlert = (message, type = "success", duration = 5000) => {
    setAlert({
      isVisible: true,
      message,
      type,
    });
  };

  /**
   * Fetch shopping lists when the session changes.
   * Only runs if the user is authenticated.
   */
  useEffect(() => {
    if (session) {
      fetchLists();
    }
  }, [session]);

  /**
   * Fetches the user's shopping lists from the API.
   */

  const fetchLists = async () => {
    try {
      setFetchingLists(true);
      const response = await fetch("/api/shopping-list");
      if (!response.ok) throw new Error("Failed to fetch shopping lists");
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
      showAlert("Failed to fetch shopping lists", "error");
    } finally {
      setFetchingLists(false);
    }
  };

  /**
   * Toggles the selection of an ingredient.
   * Adds or removes the ingredient from the selectedItems array.
   * @param {string} ingredient - The name of the ingredient.
   * @param {number} amount - The quantity of the ingredient.
   */

  const toggleItem = (ingredient, amount) => {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.ingredient === ingredient);
      if (exists) {
        return prev.filter((item) => item.ingredient !== ingredient);
      }
      return [...prev, { ingredient, amount }];
    });
  };

  /**
   * Updates the quantity of a selected ingredient.
   * @param {string} ingredient - The name of the ingredient.
   * @param {number} newAmount - The updated quantity.
   */

  const handleQuantityChange = (ingredient, newAmount) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.ingredient === ingredient ? { ...item, amount: newAmount } : item
      )
    );
  };

  /**
   * Creates a new shopping list with the selected items.
   * Requires user authentication.
   */

  const createShoppingList = async () => {
    if (!session) {
      showAlert("Please sign in to create a shopping list", "error");
      return;
    }
    if (!listName.trim()) {
      showAlert("Please enter a name for your shopping list", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: listName.trim(), items: selectedItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to create shopping list");
      }

      setListName("");
      setSelectedItems([]);
      showAlert("Shopping list created successfully!");
      fetchLists();
    } catch (error) {
      console.error("Error creating shopping list:", error);
      showAlert("Failed to create shopping list", "error");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const addItemsToList = async (id) => {
    if (!selectedItems.length) {
      showAlert("Please select items to add", "error");
      return;
    }

    try {
      setAddingToList(id);
      const response = await fetch(`/api/shopping-list/${id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: selectedItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to add items to the list");
      }

      setSelectedItems([]);
      showAlert("Items added to list successfully!");
      setSelectedItems([]);
      fetchLists();
      setSelectedId(null);
    } catch (error) {
      console.error("Error adding items to list:", error);
      showAlert("Failed to add items to the list", "error");
    } finally {
      setAddingToList(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6 dark:bg-gray-700">
      {/* Alert Component */}
      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.isVisible}
        onClose={() => setAlert((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Add to Shopping List
        </h2>
      </div>

      {/* Toggle Visibility Button */}
      <button
        onClick={() => setIsVisible((prev) => !prev)}
        className="mb-4 bg-teal-500 dark:bg-teal-600  text-white font-bold py-2 px-4 rounded-lg dark:hover:bg-teal-700 hover:bg-teal-600 transition-colors"
      >
        {isVisible ? "Hide Shopping List" : "Show Shopping List"}
      </button>

      {/* Conditionally render content */}
      {isVisible && (
        <>
          {/* Ingredient Selection */}
          <div className="space-y-4">
            {Object.entries(ingredients).map(([ingredient, amount]) => {
              const unit = getIngredientUnit(ingredient);
              return (
                <div
                  key={ingredient}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {amount} {unit ? `${unit}` : ""}
                    </span>
                    <span> {ingredient}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleItem(ingredient, amount)}
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      {selectedItems.find(
                        (item) => item.ingredient === ingredient
                      ) ? (
                        <MinusCircle className="w-6 h-6" />
                      ) : (
                        <PlusCircle className="w-6 h-6" />
                      )}
                    </button>
                    {selectedItems.find(
                      (item) => item.ingredient === ingredient
                    ) && (
                      <input
                        type="number"
                        min="1"
                        value={
                          selectedItems.find(
                            (item) => item.ingredient === ingredient
                          ).amount
                        }
                        onChange={(e) =>
                          handleQuantityChange(ingredient, e.target.value)
                        }
                        className="w-16 p-1 border rounded-md dark:text-white dark:bg-slate-800"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          {selectedItems.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-4">
                {/* Create New List Button */}
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  Create New List
                </button>

                {/* Add to Existing List */}
                {lists.length > 0 && (
                  <button
                    onClick={() => setSelectedId(selectedId ? null : "select")}
                    className="flex-1 bg-teal-800 text-white py-2 px-4 rounded-lg hover:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-800 dark:hover:bg-teal-900"
                  >
                    Add to Existing List
                  </button>
                )}
              </div>

              {/* Modal for Create New List */}
              {showModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 max-h-screen"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setShowModal(false);
                  }}
                >
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Create New List
                      </h2>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter list name"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      className="w-full mb-4 p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={createShoppingList}
                      disabled={loading}
                      className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-500 dark:hover:bg-teal-600"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        "Create"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown for Add to Existing List */}
              {selectedId === "select" && (
                <div className="relative mt-2">
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select a list
                        </span>
                        <button
                          onClick={() => setSelectedId(null)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {lists.map((list) => (
                        <button
                          key={list._id}
                          onClick={() => addItemsToList(list._id)}
                          disabled={addingToList === list._id}
                          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex justify-between items-center"
                        >
                          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {list.name ||
                              `Shopping List ${new Date(
                                list.createdAt
                              ).toLocaleDateString()}`}
                          </h2>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            List from{" "}
                            {new Date(list.createdAt).toLocaleDateString()}
                          </span>
                          {addingToList === list._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
