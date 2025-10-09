// src/pages/AddToCart/Cart.tsx
import imagePath from '@/constant/imagePath'; // Import imagePath for the loader image
import { getCustomerById, getSession, updateCustomerById } from '@/lib//services/authService';
import { getProductDetail } from '@/lib/api/productApi';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinkProps, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'; // Import Reanimated for animation
import Loading from './Loading';
const { width } = Dimensions.get('window');

/* ------------------------------ Types ------------------------------ */
interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  size: string;
  color: string;
  image: { uri: string };
  quantity: number;
}

/* ----------------------------- Helpers ----------------------------- */
const toNum = (v: any, fb = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fb;
};

/* =================================================================== */
const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string>('');
  const [busyQty, setBusyQty] = useState<Record<string, boolean>>({});
  const [busyRemove, setBusyRemove] = useState<Record<string, boolean>>({});
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);

  // Animation values moved outside conditional
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (loading) {
      translateY.value = withRepeat(
        withTiming(-20, { duration: 500, easing: Easing.out(Easing.quad) }),
        -1, // Infinite loop
        true // Reverse animation to create bounce effect
      );
    }

    return () => {
      // Clean up animation when component unmounts or loading changes
      translateY.value = 0;
    };
  }, [loading, translateY]);

  /* -------------------- Load Cart -------------------- */
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText('');

      const session = await getSession();
      if (!session?.user?.id) {
        setErrorText('Please log in to view your cart.');
        setCartItems([]);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      const customer = await getCustomerById(session.user.id);
      const cartMeta = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];

      const fetched: CartItem[] = [];
      for (const entry of cartMeta) {
        const { id, quantity } = entry;
        const detailRes = await getProductDetail(id);
        const productData = detailRes?.data;
        if (!productData) continue;

        const attrs = Array.isArray(productData.attributes) ? productData.attributes : [];
        const color = attrs.find((a: any) => a?.name?.toLowerCase().includes('color'))?.options?.[0] || 'N/A';
        const size = attrs.find((a: any) => a?.name?.toLowerCase().includes('size'))?.options?.[0] || 'N/A';

        fetched.push({
          id: String(productData.id),
          name: productData.name || 'Unnamed',
          price: toNum(productData.sale_price ?? productData.price, 0),
          originalPrice: toNum(productData.regular_price ?? productData.price, 0),
          size,
          color,
          image: { uri: productData.images?.[0]?.src || 'https://via.placeholder.com/100' },
          quantity: quantity || 1,
        });
      }

      setCartItems(fetched);
    } catch (err) {
      console.error('Cart load error:', (err as any)?.message || err);
      setErrorText('Failed to load cart. Please try again.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  /* -------------------- Meta Update -------------------- */
  const updateCartMeta = async (items: CartItem[]) => {
    if (!userId) return;
    const meta = items.map((it) => ({ id: it.id, quantity: it.quantity }));
    try {
      await updateCustomerById(userId, { meta_data: [{ key: 'cart', value: meta }] });
    } catch (e) {
      console.error('Cart meta update error', e);
    }
  };

  /* -------------------- Quantity & Remove -------------------- */
  const updateQuantity = async (id: string, qty: number) => {
    if (qty < 1) return;
    setBusyQty((p) => ({ ...p, [id]: true }));
    const updated = cartItems.map((it) => (it.id === id ? { ...it, quantity: qty } : it));
    setCartItems(updated);
    await updateCartMeta(updated);
    setBusyQty((p) => ({ ...p, [id]: false }));
  };

  const removeItem = async (id: string) => {
    setBusyRemove((p) => ({ ...p, [id]: true }));
    const updated = cartItems.filter((it) => it.id !== id);
    setCartItems(updated);
    await updateCartMeta(updated);
    setBusyRemove((p) => ({ ...p, [id]: false }));
  };

  /* -------------------- Derived totals -------------------- */
  const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const discount = cartItems.reduce(
    (s, it) => s + Math.max(it.originalPrice - it.price, 0) * it.quantity,
    0
  );
  const delivery = 0;// subtotal > 999 ? 0 : 99;
  const total = subtotal + delivery;

  /* -------------------- Navigation helpers -------------------- */
  const go = (path: LinkProps['href']) => router.push(path);

  /* -------------------- Loading -------------------- */
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Loading />
        <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '600', color: Colors.SECONDARY }}>
          Loading your Cart
        </Text>
      </View>
    );
  }

  /* -------------------- JSX -------------------- */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.cartCountText}>{cartItems.length} items</Text>
      </View>

      {/* Quick links */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={() => go('/pages/orderHistory/orderHistory')}>
          <Ionicons name="receipt-outline" size={20} color={Colors.PRIMARY} />
          <Text style={styles.optionText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => go('/pages/AddToCart/Coupons')}>
          <Ionicons name="pricetag-outline" size={20} color={Colors.PRIMARY} />
          <Text style={styles.optionText}>Coupons</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => go('/pages/AddToCart/Help')}>
          <Ionicons name="help-circle-outline" size={20} color={Colors.PRIMARY} />
          <Text style={styles.optionText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => go('/(tabs)/Category')}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.PRIMARY} />
          <Text style={styles.optionText}>Add More</Text>
        </TouchableOpacity>
      </View>

      {errorText ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorText}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCart}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : cartItems.length === 0 ? (
        /* Empty cart */
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Browse our products and start adding items!</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => go('/(tabs)/Category')}>
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Items */}
          <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {/* Touchable area to go to product details */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: '/pages/DetailsOfItem/ItemDetails',
                      params: { id: item.id, title: item.name },
                    })
                  }
                  style={styles.imageContainer}
                >
                  <Image source={item.image} style={styles.itemImage} />
                </TouchableOpacity>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSizeColor}>
                    Size: {item.size} | Color: {item.color}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
                    {item.originalPrice > item.price && (
                      <>
                        <Text style={styles.originalPrice}>
                          ₹{item.originalPrice.toLocaleString()}
                        </Text>
                        <Text style={styles.discountText}>
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </Text>
                      </>
                    )}
                  </View>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      style={styles.quantityButton}
                      disabled={busyQty[item.id] || item.quantity <= 1}
                    >
                      {busyQty[item.id] ? (
                        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                          <Loading />
                          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '600', color: Colors.SECONDARY }}>
                            Loading your Products
                          </Text>
                        </View>
                      ) : (
                        <Ionicons name="remove" size={20} color="#333" />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      style={styles.quantityButton}
                      disabled={busyQty[item.id]}
                    >
                      {busyQty[item.id] ? (
                        <ActivityIndicator size={16} color={Colors.PRIMARY} />
                      ) : (
                        <Ionicons name="add" size={20} color="#333" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                      disabled={busyRemove[item.id]}
                    >
                      {busyRemove[item.id] ? (
                        <ActivityIndicator size={14} color="#ff3f6c" />
                      ) : (
                        <Text style={styles.removeText}>Remove</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            <View style={styles.spacer} />
          </ScrollView>

          {/* Bottom container for summary and checkout */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.toggleHandle}
              onPress={() => setIsSummaryVisible(!isSummaryVisible)}
            >
              <Ionicons
                name={isSummaryVisible ? 'chevron-down' : 'chevron-up'}
                size={24}
                color={Colors.PRIMARY}
              />
            </TouchableOpacity>
            {isSummaryVisible && (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>
                    -₹{discount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={styles.summaryValue}>
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                </View>

              </View>
            )}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => go('/pages/Checkout/Checkout')}
            >
              <Text style={styles.checkoutText}>
                {isSummaryVisible ? 'Proceed to Checkout' : `Proceed to Checkout (₹${total.toLocaleString()})`}
              </Text>
            </TouchableOpacity>
            <Text style={styles.secureText}>
              <Ionicons name="lock-closed" size={14} color="#666" /> Secure Checkout
            </Text>
          </View>

        </>
      )}
    </View>
  );
};

export default Cart;

/* ----------------------------- Styles ----------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  /* header */
  header: {
    marginBottom: 24,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Dimenstion.headerHeight,
  },
  headerButton: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.WHITE },
  cartCountText: { fontSize: 16, fontWeight: '600', color: Colors.WHITE },

  /* quick links */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionButton: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  optionText: { fontSize: 14, color: Colors.PRIMARY, fontWeight: '500', marginTop: 4 },

  /* error */
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#c00', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: Colors.PRIMARY, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },

  /* items list */
  itemsContainer: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: { marginRight: 16 },
  itemImage: { width: 100, height: 100, borderRadius: 8 },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  itemSizeColor: { fontSize: 14, color: '#666', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemPrice: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  originalPrice: { fontSize: 14, color: '#999', textDecorationLine: 'line-through', marginRight: 8 },
  discountText: { fontSize: 14, color: '#00a650', fontWeight: 'bold' },

  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  quantityText: { width: 50, textAlign: 'center', fontSize: 18, fontWeight: '600' },
  removeButton: { marginLeft: 'auto', paddingVertical: 8, paddingHorizontal: 12 },
  removeText: { color: '#ff3f6c', fontWeight: 'bold', fontSize: 14 },

  /* bottom container */
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 12,
  },
  toggleHandle: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 2, // To overlap the border slightly for a handle effect
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  /* summary */
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryValue: { fontSize: 15, fontWeight: '500' },
  discountValue: { color: '#00a650' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.PRIMARY },

  checkoutButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  checkoutText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },
  secureText: { textAlign: 'center', fontSize: 12, color: '#666', marginBottom: 0, marginTop: 8 },

  /* empty */
  emptyCart: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 8, color: '#333' },
  emptySubtext: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  shopButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  shopButtonText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },

  spacer: { height: 100 }, // To prevent summary overlap on scroll
});

