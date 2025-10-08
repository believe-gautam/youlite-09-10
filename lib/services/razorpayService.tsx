// src/app/services/razorpayService.ts
import { EXPO_PUBLIC_RAZORPAY_KEY_ID } from "@/utils/apiUtils/constants";
import RazorpayCheckout, { CheckoutOptions } from "react-native-razorpay";
import { addOrder } from "../../lib/api/orderApi";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: any;
}

/**
 * Open Razorpay Checkout after creating an order in WooCommerce/backend
 */
export const openRazorpayCheckout = async (
  totalAmount: number,
  user: User
): Promise<PaymentResult> => {
  try {
    // Validate input
    if (!totalAmount || totalAmount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!EXPO_PUBLIC_RAZORPAY_KEY_ID) {
      throw new Error("Razorpay key not configured");
    }

    // 1. Create order in your backend (WooCommerce / custom)
    const orderPayload = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      customer_id: user.id,
    };

    const backendOrderRes = await addOrder(orderPayload);

    // Make sure backend returns data correctly
    const backendOrder = backendOrderRes?.data || backendOrderRes;

    if (!backendOrder?.id) {
      throw new Error("Failed to create order on backend");
    }

    // 2. Setup Razorpay Checkout options
    const options: CheckoutOptions = {
      key: '',// EXPO_PUBLIC_RAZORPAY_KEY_ID,
      order_id: backendOrder.id,
      amount: backendOrder.amount.toString(),
      currency: backendOrder.currency || "INR",
      name: "My Shop",
      description: "Order Payment",
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      theme: {
        color: "#0A74DA",
      },
      notes: {
        customer_id: user.id.toString(),
      },
    };

    // 3. Open Razorpay checkout
    const data: RazorpayResponse = await RazorpayCheckout.open(options);

    console.log("Payment success:", data);
    return {
      success: true,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      signature: data.razorpay_signature,
    };

  } catch (error: any) {
    console.error("openRazorpayCheckout error:", error);

    // Handle specific Razorpay errors
    if (error?.code === 2) {
      return {
        success: false,
        error: "Payment cancelled by user",
      };
    }

    return {
      success: false,
      error: error.message || "Payment failed",
    };
  }
};

