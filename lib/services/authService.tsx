import * as SecureStore from "expo-secure-store";
import {
  apiFindCustomerByEmail,
  apiGetCustomer,
  apiRegisterCustomer,
  apiUpdateCustomer,
} from "../../lib/api/authApi";

export type AuthUser = {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  billing?: Record<string, any>;
  shipping?: Record<string, any>;
};

// Session management
const SESSION_KEY = "auth_session";

export const storeSession = async (user: AuthUser) => {
  try {
    const session = { user };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error("Error storing session:", error);
    return false;
  }
};

export const getSession = async () => {
  try {
    const session = await SecureStore.getItemAsync(SESSION_KEY);
    if (!session) return null;
    return JSON.parse(session);
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing session:", error);
    return false;
  }
};

// ========== AUTH FLOWS ==========

/**
 * Register a new WooCommerce customer and store session.
 */
export const registerCustomer = async (payload: RegisterPayload) => {
  if (!payload?.email) throw new Error("Email is required.");
  if (!payload?.password) throw new Error("Password is required.");

  const customer = await apiRegisterCustomer(payload);

  const user: AuthUser = {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
  };

  await storeSession(user);
  return customer;
};

/**
 * Get a customer by ID
 */
export const getCustomerById = async (customerId: number | string) => {
  return apiGetCustomer(customerId);
};

/**
 * Update a customer by ID
 */
export const updateCustomerById = async (
  customerId: number | string,
  updates: Record<string, any>
) => {
  return apiUpdateCustomer(customerId, updates);
};

/**
 * Login by email (basic lookup).
 * NOTE: This does NOT validate password on WooCommerce API.
 * If you need password auth, you'd need a custom WP plugin or JWT.
 */
export const loginCustomerByEmail = async (email: string) => {
  const customer = await apiFindCustomerByEmail(email);
  if (!customer) throw new Error("Customer not found.");

  const user: AuthUser = {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
  };

  await storeSession(user);
  return user;
};
