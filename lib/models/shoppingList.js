import mongoose from "mongoose";

/**
 * Schema for individual shopping items in a shopping list.
 * Defines the structure of each item in the `items` array of a shopping list.
 */
const shoppingItemSchema = new mongoose.Schema(
  {
    /**
     * @property {String} name - The name of the shopping item. This field is required.
     */
    name: { type: String, required: true },

    /**
     * @property {Number} quantity - The quantity of the shopping item. Defaults to 1 if not provided.
     */
    quantity: { type: Number, required: true, default: 1 },

    /**
     * @property {Boolean} purchased - Indicates whether the item has been purchased. Defaults to false.
     */
    purchased: { type: Boolean, default: false },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` timestamps to the schema.
     */
    timestamps: true,
  }
);

/**
 * Schema for a shopping list.
 * Represents a collection of shopping items associated with a specific user.
 */
const shoppingListSchema = new mongoose.Schema(
  {
    /**
     * @property {String} userId - The ID of the user who owns the shopping list. This field is required.
     */
    userId: { type: String, required: true },

    /**
     * @property {String} name - The name of the shopping list. This field is required.
     */
    name: { type: String, required: true },

    /**
     * @property {Array} items - An array of shopping items, defined by the `shoppingItemSchema`.
     */
    items: [shoppingItemSchema],
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` timestamps to the schema.
     */
    timestamps: true,
  }
);

/**
 * Mongoose model for the ShoppingList schema.
 * If the model already exists (due to hot reloading in development), it reuses the existing model;
 * otherwise, it creates a new model.
 *
 * @constant {mongoose.Model} ShoppingList - The ShoppingList model, used to interact with the shopping lists collection in the database.
 */
export const ShoppingList =
  mongoose.models.ShoppingList ||
  mongoose.model("ShoppingList", shoppingListSchema);