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
  mobile?: string;
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


interface OtpLoginPayload {
  user_id: number;
  email: string;
  mobile: string;
  display_name: string;
  first_name: string;
  last_name: string;
  token: string;
}

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


export const getToken = async () => {
  try {
    const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    return session; // { user, token }
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
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



/**
 * NEW: OTP-based login with JWT token
 * This method stores the JWT token received from verify-otp endpoint
 */
export const OtpLoginCustomer = async (payload: OtpLoginPayload) => {
  try {
    const user: AuthUser = {
      id: payload.user_id,
      email: payload.email,
      mobile: payload.mobile,
      first_name: payload.first_name,
      last_name: payload.last_name,
      // display_name: payload.display_name,
      name:
        `${payload.first_name || ""} ${payload.last_name || ""}`.trim() ||
        payload.display_name,
    };

    // Store session with JWT token from OTP verification
    await storeSession(user, payload.token);

    console.log("OTP Login successful:", user);
    return user;
  } catch (error: any) {
    console.error("OTP Login error:", error);
    throw new Error(error.message || "OTP login failed");
  }
};



// ===========================
// API Helper Functions
// ===========================

/**
 * Find customer by email from WooCommerce API
 * (You may need to adjust this based on your WooCommerce setup)
 */

/**
 * Get authenticated user profile from server
 * Uses JWT token for authentication
 */
export const getAuthenticatedUserProfile = async () => {
  try {
    const { token } = await getSession();
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(
      "YOUR_WORDPRESS_URL/wp-json/mobile-app/v1/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      const userData = response.data.data;
      const user: AuthUser = {
        id: userData.user_id,
        email: userData.email,
        mobile: userData.mobile,
        first_name: userData.first_name,
        last_name: userData.last_name,
        // display_name: userData.display_name,
        name:
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
          userData.display_name,
      };

      // Update stored session
      await storeSession(user, token);
      return user;
    }

    throw new Error("Failed to fetch user profile");
  } catch (error: any) {
    console.error("Get profile error:", error);
    throw new Error(error.message || "Failed to fetch profile");
  }
};

/**
 * Update user profile
 * Uses JWT token for authentication
 */
export const updateUserProfile = async (profileData: {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  billing_first_name?: string;
  billing_last_name?: string;
  billing_address_1?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postcode?: string;
}) => {
  try {
    const { token } = await getSession();
    if (!token) throw new Error("No authentication token found");

    const response = await axios.post(
      "YOUR_WORDPRESS_URL/wp-json/mobile-app/v1/profile",
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      // Refresh user profile after update
      await getAuthenticatedUserProfile();
      return true;
    }

    throw new Error("Failed to update profile");
  } catch (error: any) {
    console.error("Update profile error:", error);
    throw new Error(error.message || "Failed to update profile");
  }
};

/**
 * Refresh JWT token
 * Call this periodically or when token is about to expire
 */
export const refreshAuthToken = async () => {
  try {
    const { token: oldToken } = await getSession();
    if (!oldToken) throw new Error("No authentication token found");

    const response = await axios.post(
      "YOUR_WORDPRESS_URL/wp-json/mobile-app/v1/refresh-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${oldToken}`,
        },
      }
    );

    if (response.data.success) {
      const newToken = response.data.data.token;
      
      // Get current user and update with new token
      const { user } = await getSession();
      if (user) {
        await storeSession(user, newToken);
      }
      
      return newToken;
    }

    throw new Error("Failed to refresh token");
  } catch (error: any) {
    console.error("Refresh token error:", error);
    // If refresh fails, logout user
    await clearSession();
    throw new Error(error.message || "Session expired. Please login again.");
  }
};

// ===========================
// Axios Interceptor for Auto Token Refresh
// ===========================

/**
 * Setup axios interceptor to automatically add JWT token to requests
 * and handle token refresh on 401 errors
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor - add token to all requests
  axios.interceptors.request.use(
    async (config) => {
      const { token } = await getSession();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle token expiry
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 401 and haven't retried yet, try to refresh token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAuthToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          await clearSession();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Logout user
 */
export const logoutCustomer = async () => {
  await clearSession();
  return true;
};
