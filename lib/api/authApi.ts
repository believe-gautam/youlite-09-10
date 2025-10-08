import { API_BASE_URL, API_CONSUMER_KEY, API_CONSUMER_SECRET } from "@/utils/apiUtils/constants";
import axios from "axios";

// Base constants
const WC_CUSTOMERS_BASE = "/customers";

// Axios client with WooCommerce auth
const client = axios.create({
  baseURL: API_BASE_URL,
  auth: {
    username: API_CONSUMER_KEY,
    password: API_CONSUMER_SECRET,
  },
});

// Helper for extracting error messages
const parseErrorMessage = (err: any) => {
  if (err?.response?.data?.message) return String(err.response.data.message);
  if (err?.response?.data?.data?.message) return String(err.response.data.data.message);
  if (err?.message) return String(err.message);
  return "An unexpected error occurred.";
};

// ========== WooCommerce customers ==========

/**
 * Register a new WooCommerce customer.
 * @param payload { email, password, first_name?, last_name?, ... }
 */
export const apiRegisterCustomer = async (payload: any) => {
  try {
    const body = { ...payload };
    if (!body.username) body.username = body.email;

    // Clean empty fields
    Object.keys(body).forEach((k) => {
      const v = body[k];
      if (v === undefined || v === null || v === "") delete body[k];
    });

    const res = await client.post(WC_CUSTOMERS_BASE, body);
    return res.data;
  } catch (err: any) {
    throw new Error(parseErrorMessage(err));
  }
};

/**
 * Get customer details by WooCommerce customer ID
 */
export const apiGetCustomer = async (customerId: number | string) => {
  try {
    const res = await client.get(`${WC_CUSTOMERS_BASE}/${customerId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(parseErrorMessage(err));
  }
};

/**
 * Update customer details by ID
 */
export const apiUpdateCustomer = async (
  customerId: number | string,
  updates: Record<string, any>
) => {
  try {
    const body = { ...updates };
    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
    const res = await client.put(`${WC_CUSTOMERS_BASE}/${customerId}`, body);
    return res.data;
  } catch (err: any) {
    throw new Error(parseErrorMessage(err));
  }
};

/**
 * Find a customer by email using WooCommerce search API
 */
export const apiFindCustomerByEmail = async (email: string) => {
  try {
    const res = await client.get(WC_CUSTOMERS_BASE, {
      params: { search: email, per_page: 1 },
    });
    const customers: any[] = res.data || [];
    return customers[0] || null;
  } catch (err: any) {
    throw new Error(parseErrorMessage(err));
  }
};
