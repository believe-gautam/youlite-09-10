// src/services/productService.ts
import { getProductDetail, getProducts } from '../../lib/api/productApi';

// Define WooCommerce types (simplified)
export interface WCImage {
  id: number;
  src: string;
  alt?: string;
}

export interface WCCategory {
  id: number;
  name: string;
}

export interface WCProduct {
  id: number;
  name: string;
  price: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  average_rating?: string | number;
  rating_count?: number;
  featured?: boolean;
  brand?: string;
  categories?: WCCategory[];
  images?: WCImage[];
  [key: string]: any;
}

export interface NormalizedProduct {
  id: string;
  name: string;
  price: number;
  regularPrice: number;
  salePrice: number;
  discount: string | null;
  image: string | null;
  rating: number;
  category: string;
  brand: string;
  isFeatured: boolean;
  isTrending: boolean;
  raw: WCProduct;
}

// Helpers
const toNumber = (v: any, fallback = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
};

const buildDiscount = (regularPrice: number, salePrice: number): string | null => {
  if (regularPrice > 0 && salePrice > 0 && regularPrice > salePrice) {
    const pct = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    if (Number.isFinite(pct) && pct > 0) return `${pct}% OFF`;
  }
  return null;
};

// Normalize WooCommerce product into app-friendly format
export const normalizeProduct = (
  p: WCProduct,
  fallbackCategory = 'Uncategorized'
): NormalizedProduct => {
  const salePrice = toNumber(p?.sale_price ?? p?.price, 0);
  const regularPrice = toNumber(p?.regular_price ?? p?.price, 0);
  const discount = buildDiscount(regularPrice, salePrice);

  const firstCategoryName =
    Array.isArray(p?.categories) && p.categories.length > 0
      ? p.categories[0]?.name
      : fallbackCategory;

  // ✅ FIXED: properly access first image
  const firstImage =
    Array.isArray(p?.images) && p.images.length > 0 && p.images[0]?.src
      ? String(p.images[0].src)
      : null;

  return {
    id: String(p?.id ?? ''),
    name: typeof p?.name === 'string' && p.name ? p.name : 'Unnamed',
    price: salePrice,
    regularPrice,
    salePrice,
    discount,
    image: firstImage,
    rating: toNumber(p?.average_rating ?? 0, 0),
    category: firstCategoryName,
    brand: typeof p?.brand === 'string' ? p.brand : '',
    isFeatured: !!p?.featured,
    isTrending: Number(p?.rating_count ?? 0) > 10,
    raw: p,
  };
};

// Fetch products by category
export const loadProductsByCategory = async (
  categoryId: string | number,
  options: {
    perPage?: number;
    page?: number;
    order?: 'asc' | 'desc';
    orderby?: string;
    status?: string;
  } = {}
): Promise<WCProduct[]> => {
  if (!categoryId) return [];

  const params: Record<string, any> = {
    category: String(categoryId),
    per_page: options.perPage ?? 20,
    page: options.page ?? 1,
    order: options.order ?? 'desc',
    orderby: options.orderby ?? 'date',
    status: options.status ?? 'publish',
  };

  try {
    const res = await getProducts(params);
    return Array.isArray(res?.data) ? (res.data as WCProduct[]) : [];
  } catch (err) {
    console.error('Error loading products by category:', err);
    return [];
  }
};

// Fetch single product by ID
export const loadProductById = async (
  productId: string | number
): Promise<WCProduct | null> => {
  if (!productId) return null;
  try {
    const res = await getProductDetail(productId);
    return (res?.data as WCProduct) ?? null;
  } catch (err) {
    console.error(`Error loading product ${productId}:`, err);
    return null;
  }
};

// Search products
export const searchProducts = async (
  search: string,
  options: {
    categoryId?: string | number;
    perPage?: number;
    page?: number;
    order?: 'asc' | 'desc';
    orderby?: string;
    status?: string;
  } = {}
): Promise<WCProduct[]> => {
  const params: Record<string, any> = {
    search,
    category: options.categoryId ? String(options.categoryId) : undefined,
    per_page: options.perPage ?? 20,
    page: options.page ?? 1,
    order: options.order ?? 'desc',
    orderby: options.orderby ?? 'relevance',
    status: options.status ?? 'publish',
  };

  Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

  try {
    const res = await getProducts(params);
    return Array.isArray(res?.data) ? (res.data as WCProduct[]) : [];
  } catch (err) {
    console.error('Error searching products:', err);
    return [];
  }
};

// Fetch featured products
export const loadFeaturedProducts = async (
  options: {
    perPage?: number;
    page?: number;
    order?: 'asc' | 'desc';
    orderby?: string;
    status?: string;
  } = {}
): Promise<WCProduct[]> => {
  const params: Record<string, any> = {
    per_page: options.perPage ?? 10,
    page: options.page ?? 1,
    order: options.order ?? 'desc',
    orderby: options.orderby ?? 'date',
    status: options.status ?? 'publish',
    featured: true,
  };

  try {
    const res = await getProducts(params);
    return Array.isArray(res?.data) ? (res.data as WCProduct[]) : [];
  } catch (err) {
    console.error('Error loading featured products:', err);
    return [];
  }
};

// Convert WooCommerce product → Gem card format
export const normalizeToGem = (
  p: WCProduct,
  fallbackImage: any
): {
  id: string;
  title: string;
  image: any;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
} => {
  const sale = toNumber(p?.sale_price ?? p?.price, 0);
  const regular = toNumber(p?.regular_price ?? p?.price, 0);

  const firstImage =
    Array.isArray(p?.images) && p.images.length > 0 && p.images[0]?.src
      ? String(p.images[0].src)
      : null;

  const discount =
    regular > 0 && regular > sale
      ? `${Math.round(((regular - sale) / regular) * 100)}% OFF`
      : undefined;

  return {
    id: String(p?.id ?? ''),
    title: typeof p?.name === 'string' ? p.name : 'Unnamed',
    image: firstImage ? { uri: firstImage } : fallbackImage,
    price: `₹${sale.toFixed(0)}`,
    originalPrice: regular > sale ? `₹${regular.toFixed(0)}` : undefined,
    discount,
    rating: toNumber(p?.average_rating ?? 0, 0),
  };
};
