import client from "./client";

// Get all coupons
export const getCoupons = (params = {}) =>
  client.get("/coupons", { params });

// Get single coupon detail
export const getCouponDetail = (id) => 
  client.get(`/coupons/${id}`);

// Create a coupon
export const createCoupon = (data) => 
  client.post("/coupons", data);

// Update a coupon
export const updateCoupon = (id, data) => 
  client.put(`/coupons/${id}`, data);

// Delete a coupon
export const deleteCoupon = (id, force = true) => 
  client.delete(`/coupons/${id}`, { params: { force } });
