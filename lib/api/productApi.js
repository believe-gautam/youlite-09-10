// src/services/productApi.js
import client from './client';

// Get all products
export const getProducts = (params = {}) => client.get('/products', { params });

// Get single product detail
export const getProductDetail = (id) => client.get(`/products/${id}`);
