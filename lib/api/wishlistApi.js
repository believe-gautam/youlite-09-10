// src/api/wishlistApi.js (Modified - Use client with token handling)
import client from "./client";

// 🔹 Get all wishlist items for logged-in user (default wishlist)
export const getWishlistItems = (params = {}) =>
  client.get("/yith/wishlist/v1/items", { params });

// 🔹 Add product to wishlist (default wishlist id 0)
export const addToWishlist = (data) =>
  client.post("/yith/wishlist/v1/items", data);

// 🔹 Remove product from wishlist
export const removeFromWishlist = (itemId) =>
  client.delete(`/yith/wishlist/v1/items/${itemId}`);

// 🔹 Move wishlist item to another wishlist (if multiple lists are enabled)
export const moveWishlistItem = (itemId, data) =>
  client.post(`/yith/wishlist/v1/items/move/${itemId}`, data);

// 🔹 Get all wishlists for a user (if plugin supports multiple wishlists)
export const getWishlists = (params = {}) =>
  client.get("/yith/wishlist/v1/wishlists", { params });

// 🔹 Create a new wishlist
export const createWishlist = (data) =>
  client.post("/yith/wishlist/v1/wishlists", data);
