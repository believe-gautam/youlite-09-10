// ✅ lib/api/woocommerce.ts
import axios from 'axios';

// Your WordPress site URL
const WORDPRESS_URL = 'https://youlitestore.in/wp-json/wc/v3'; // Replace with your actual URL

// Create axios instance with base configuration
const WooCommerceAPI = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wc/v3`,
  timeout: 10000,
});

// Add auth interceptor to include consumer key and secret
WooCommerceAPI.interceptors.request.use(async (config) => {
  // You'll need to get these from your WooCommerce settings
  const consumerKey = 'ck_d75d53f48f9fb87921a2523492a995c741d368df'; // Replace with your actual consumer key
  const consumerSecret = 'cs_ae3184c5435dd5d46758e91fa9ed3917d85e0c17'; // Replace with your actual consumer secret
  
  // Add authentication parameters
  config.params = {
    ...config.params,
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
  };
  
  return config;
});

export const WooCommerce = {
  get: (endpoint: string, params = {}) => WooCommerceAPI.get(endpoint, { params }),
  post: (endpoint: string, data: any) => WooCommerceAPI.post(endpoint, data),
  put: (endpoint: string, data: any) => WooCommerceAPI.put(endpoint, data),
  delete: (endpoint: string) => WooCommerceAPI.delete(endpoint),
};

export default WooCommerce;