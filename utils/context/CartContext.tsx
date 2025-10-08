// src/context/CartContext.tsx
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import { AppEvents } from '@/utils/EventEmitter';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface CartItem {
  id: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const cartCount = cartItems.length;

  const getCustomerId = async () => {
    const session = await getSession();
    return session?.user?.id;
  };

  const saveCartToMeta = async (items: CartItem[]) => {
    const userId = await getCustomerId();
    if (!userId) return;
    try {
      await updateCustomerById(userId, { meta_data: [{ key: 'cart', value: items }] });
      AppEvents.emit('cartUpdated', items);
    } catch (e) {
      console.error('Failed to save cart to meta:', e);
    }
  };

  const refreshCart = async () => {
    setLoading(true);
    const userId = await getCustomerId();
    if (userId) {
      try {
        const customer = await getCustomerById(userId);
        const cartMeta = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
        setCartItems(Array.isArray(cartMeta) ? cartMeta : []);
      } catch (e) {
        console.error('Failed to fetch cart:', e);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  };

  const addToCart = async (productId: string, quantity: number) => {
    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      updatedCart.push({ id: productId, quantity });
    }
    setCartItems(updatedCart);
    await saveCartToMeta(updatedCart);
  };

  const removeFromCart = async (productId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    await saveCartToMeta(updatedCart);
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    await saveCartToMeta(updatedCart);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};