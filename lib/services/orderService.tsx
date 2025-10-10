import axios from "axios";
import {
  addOrder,
  createRazorOrder,
  deleteOrder,
  getOrderDetail,
  getOrders,
  updateOrder,
} from "../../lib/api/orderApi";

import { WooCommerce } from '@/lib/api/woocommerce';
import { API_CONSUMER_KEY, API_CONSUMER_SECRET } from "@/utils/apiUtils/constants";
import { getToken } from "./authService";


// Service function to load all orders
export const loadOrders = async (params?: { user?: number; per_page?: number }) => {
  try {
    const response = await getOrders(params);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Service function to load a single order by ID
export const loadOrderDetail = async (id: number | string) => {
  try {
    const response = await getOrderDetail(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// (Optional) Add a new order
export const createOrder = async (data: any) => {
  try {
    const response = await addOrder(data);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// (Optional) Update an order
export const editOrder = async (id: number | string, data: any) => {
  try {
    const response = await updateOrder(id, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

// (Optional) Delete an order
export const removeOrder = async (id: number | string) => {
  try {
    const response = await deleteOrder(id);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
};

// ⭐ IMPORTANT: This is a MOCK implementation.
// You MUST replace this with a real API call to your backend.
// Your backend will use the Razorpay SDK to create an order and return the official `id`.
export const createRazorpayOrder = async (payload: { amount: number; currency: string; receipt: string }) => {
  console.log('MOCK: Calling backend to create Razorpay order...');
  try{
      const razorpayOrder = {
        id: `order_mock_${Date.now()}`, // This is the format of a real Razorpay Order ID.
        entity: 'order',
        amount: payload.amount,
        currency: payload.currency,
        receipt: payload.receipt,
        status: 'created',
      };

      const API_URL = "https://youlitestore.in/wp-json/my-app/v1/create-razorpay-order";


      // const result = await createRazorOrder({razorpayOrder});
      const getTokenVal = await getToken();

      // console.log({requestions: })

            const response = await axios.post(
            API_URL,
            { amount: razorpayOrder.amount }, // payload
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer '+getTokenVal.token
              },
            }
          );


          console.log("✅ Razorpay Order Created:", response.data);
          const result   = response.data;
      return result;//Promise.resolve(result);
  }catch(e){
    console.log(`----------------------------------------------------`)
    console.log({e:e});

    console.log(`----------------------------------------------------`)
    return false;


  }
};

export const processRazorpayPayment = async (paymentData: {
  order_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  try {
    // This endpoint should be handled by your WooCommerce Razorpay plugin
    const response = await WooCommerce.post(`orders/${paymentData.order_id}/process_razorpay_payment`, {
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_signature: paymentData.razorpay_signature
    });
    
    return response.data;
  } catch (error) {
    console.error('Process payment error:', error);
    throw error;
  }
};

// Alternative: Update order status directly if the plugin handles webhooks
export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const response = await WooCommerce.put(`orders/${orderId}`, {
      status: status,
      set_paid: status === 'processing' || status === 'completed'
    });
    return response.data;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};
