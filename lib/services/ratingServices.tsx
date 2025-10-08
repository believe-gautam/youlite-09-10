import { addReview, deleteReview, getReviewDetail, getReviews, updateReview } from "../../lib/api/ratingsApi";

// Service function to load all reviews
export const loadReviews = async (params?: { product?: number; per_page?: number }) => {
  try {
    const response = await getReviews(params);
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

// Service function to load a single review by ID
export const loadReviewDetail = async (id: number | string) => {
  try {
    const response = await getReviewDetail(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review ${id}:`, error);
    throw error;
  }
};

// (Optional) Add a review
export const createReview = async (data: any) => {
  try {
    const response = await addReview(data);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

// (Optional) Update a review
export const editReview = async (id: number | string, data: any) => {
  try {
    const response = await updateReview(id, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${id}:`, error);
    throw error;
  }
};

// (Optional) Delete a review
export const removeReview = async (id: number | string) => {
  try {
    const response = await deleteReview(id);
    return response.data;
  } catch (error) {
    console.error(`Error deleting review ${id}:`, error);
    throw error;
  }
};
