import { getCategories, getCategoryDetail } from "../../lib/api/categoryApi";

// Service function to load all categories
export const loadCategories = async (p0?: { per_page: number; hide_empty: boolean }) => {
  try {
    const response = await getCategories(p0);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Service function to load a single category by ID
export const loadCategoryDetail = async (id: number | string) => {
  try {
    const response = await getCategoryDetail(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};
