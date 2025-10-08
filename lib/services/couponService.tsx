import {
    createCoupon,
    deleteCoupon,
    getCouponDetail,
    getCoupons,
    updateCoupon
} from "@/lib/api/couponsApi";

// Service: Get all coupons
export const loadCoupons = async (params?: { per_page?: number; code?: string }) => {
  try {
    const response = await getCoupons(params);
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
};

// Service: Get coupon by ID
export const loadCouponDetail = async (id: number | string) => {
  try {
    const response = await getCouponDetail(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coupon ${id}:`, error);
    throw error;
  }
};

// Service: Create new coupon
export const addCoupon = async (data: any) => {
  try {
    const response = await createCoupon(data);
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};

// Service: Update existing coupon
export const editCoupon = async (id: number | string, data: any) => {
  try {
    const response = await updateCoupon(id, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating coupon ${id}:`, error);
    throw error;
  }
};

// Service: Delete coupon
export const removeCoupon = async (id: number | string, force: boolean = true) => {
  try {
    const response = await deleteCoupon(id, force);
    return response.data;
  } catch (error) {
    console.error(`Error deleting coupon ${id}:`, error);
    throw error;
  }
};
