import client from "./client";

// Get all orders
export const getOrders = (params = {}) =>
  client.get("/orders", { params });

// Get single order detail
export const getOrderDetail = (id) =>
  client.get(`/orders/${id}`);

// (Optional) Add new order
export const addOrder = (data) =>
  client.post("/orders", data);

// (Optional) Update order
export const updateOrder = (id, data) =>
  client.put(`/orders/${id}`, data);

// (Optional) Delete order
export const deleteOrder = (id) =>
  client.delete(`/orders/${id}`);

export const createRazorOrder = (data) => client.post("/create-razorpay-order", data);

