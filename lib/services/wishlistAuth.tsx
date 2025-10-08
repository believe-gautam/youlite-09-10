// src/services/wishlistAuth.tsx (Modified - Remove redundant token fetch, use client's interceptor)
import {
  addToWishlist,
  createWishlist,
  getWishlistItems,
  getWishlists,
  moveWishlistItem,
  removeFromWishlist
} from "../../lib/api/wishlistApi";

// 🔹 Load all wishlist items
export const loadWishlistItems = async (params = {}) => {
  try {
    const response = await getWishlistItems(params);
    return response.data;
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    throw error;
  }
};

// 🔹 Add product to wishlist
export const addProductToWishlist = async (data: { product_id: number; wishlist_id?: number; quantity?: number }) => {
  try {
    const response = await addToWishlist(data);
    return response.data;
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    throw error;
  }
};

// 🔹 Remove product from wishlist
export const removeProductFromWishlist = async (itemId: number) => {
  try {
    const response = await removeFromWishlist(itemId);
    return response.data;
  } catch (error) {
    console.error(`Error removing wishlist item ${itemId}:`, error);
    throw error;
  }
};

// 🔹 Move product to another wishlist
export const moveProductToWishlist = async (itemId: number, data: { wishlist_id: number }) => {
  try {
    const response = await moveWishlistItem(itemId, data);
    return response.data;
  } catch (error) {
    console.error(`Error moving wishlist item ${itemId}:`, error);
    throw error;
  }
};

// 🔹 Load all wishlists for the user
export const loadWishlists = async (params = {}) => {
  try {
    const response = await getWishlists(params);
    return response.data;
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    throw error;
  }
};

// 🔹 Create a new wishlist
export const createNewWishlist = async (data: { name: string }) => {
  try {
    const response = await createWishlist(data);
    return response.data;
  } catch (error) {
    console.error("Error creating wishlist:", error);
    throw error;
  }
};
