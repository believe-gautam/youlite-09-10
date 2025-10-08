// import client from "./client";

// // Get all categories
// export const getCategories = (params = {}) =>
//   client.get("/products/categories", { params });

// Get single category detail
// export const getCategoryDetail = (id) => 
//   client.get(`/products/categories/${id}`);


import client from "./client";

// Get all categories
export const getCategories = (params = {}) =>
  client.get("/products/categories", { params });

// Get single category detail
export const getCategoryDetail = (id) =>
  client.get(`/products/categories/${id}`);

// Add this default export to satisfy Expo Router
const CategoryApi = {
  getCategories,
  getCategoryDetail
};

export default CategoryApi;