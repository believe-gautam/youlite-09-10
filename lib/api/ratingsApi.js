import client from "./client";

// Get all reviews
export const getReviews = (params = {}) =>
  client.get("/products/reviews", { params });

// Get single review detail
export const getReviewDetail = (id) =>
  client.get(`/products/reviews/${id}`);

// (Optional) Add new review
export const addReview = (data) =>
  client.post("/products/reviews", data);

// (Optional) Update review
export const updateReview = (id, data) =>
  client.put(`/products/reviews/${id}`, data);

// (Optional) Delete review
export const deleteReview = (id) =>
  client.delete(`/products/reviews/${id}`);

