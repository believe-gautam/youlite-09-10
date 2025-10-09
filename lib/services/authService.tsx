import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ----------------- AUTH FUNCTIONS -----------------

/**
 * Register a new WooCommerce customer using your existing API helper
 */
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

export type LoginPayload = {
  email: string;
  password: string;
};

// ----------------- SESSION MANAGEMENT -----------------

const SESSION_KEY = "auth_session";

export const storeSession = async (user: AuthUser, token?: string) => {
  try {
    const session = { user, token };
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

// ----------------- API ENDPOINTS -----------------

const API_BASE = "https://youlitestore.in/wp-json"; // Replace with your WooCommerce site
const JWT_LOGIN = `${API_BASE}/jwt-auth/v1/token`;

export const registerCustomer = async (payload: RegisterPayload) => {
  if (!payload.email || !payload.password) throw new Error("Email and password required");

  const customer = await apiRegisterCustomer(payload);

  const user: AuthUser = {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
  };

  // Optional: automatically login after registration
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
 * Login using WooCommerce JWT plugin
 */
export const loginCustomer = async (payload: LoginPayload) => {
  if (!payload.email || !payload.password) throw new Error("Email and password required");

  try {
    // Request JWT token from WP
    const res = await axios.post(JWT_LOGIN, {
      username: payload.email,
      password: payload.password,
    });

    const token = res.data.token;

    // Get user info from WooCommerce API using email
    const customer = await apiFindCustomerByEmail(payload.email);
    if (!customer) throw new Error("Customer not found.");

    const user: AuthUser = {
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
    };

    // Store session with JWT token
    await storeSession(user, token);

    return { user, token };
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error("Invalid email or password");
    }
    console.error("Login error:", error.response || error.message);
    throw new Error(error.message || "Login failed");
  }
};


export const OtpLoginCustomer = async (email: string) => {
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

/**
 * Logout user
 */
export const logoutCustomer = async () => {
  await clearSession();
  return true;
};
