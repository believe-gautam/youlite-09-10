// src/components/Featured/Featured.tsx
import imagePath from '@/constant/imagePath';
import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import { loadFeaturedProducts, WCProduct } from '@/lib/services/productService';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ------------------------------ Types ------------------------------ */
type GemItem = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
};

/* ----------------------------- Helpers ----------------------------- */
const toNum = (v: any, fb = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fb;
};

const buildDiscount = (regular: number, sale: number): string | undefined => {
  if (regular > 0 && sale > 0 && regular > sale) {
    const pct = Math.round(((regular - sale) / regular) * 100);
    return pct > 0 ? `${pct}% OFF` : undefined;
  }
  return undefined;
};

const normalizeUri = (uri: string) => uri.trim().replace(/^http:\/\//, 'https://');

const pickImageSource = (p: WCProduct): ImageSourcePropType => {
  const first = p?.images?.[0]?.src;
  return first ? { uri: normalizeUri(first) } : imagePath.image11;
};

const mapToGemItem = (p: WCProduct): GemItem => {
  const sale    = toNum(p.sale_price ?? p.price);
  const regular = toNum(p.regular_price ?? p.price);

  return {
    id           : String(p.id),
    title        : p.name || 'Unnamed',
    image        : pickImageSource(p),
    price        : `₹${sale.toFixed(0)}`,
    originalPrice: regular > sale ? `₹${regular.toFixed(0)}` : undefined,
    discount     : buildDiscount(regular, sale),
    rating       : toNum(p.average_rating),
  };
};

/* =================================================================== */
const Featured = () => {
  const [items, setItems]           = useState<GemItem[]>([]);
  const [loading, setLoading]       = useState(true);

  const [userId, setUserId]         = useState<number | null>(null);
  const [wishlistIds, setWishlist]  = useState<string[]>([]);
  const [cartIds, setCart]          = useState<string[]>([]);
  const [toast, setToast]           = useState('');

  // NEW: State for tracking loading buttons
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});
  const [loadingCart, setLoadingCart] = useState<Record<string, boolean>>({});

  /* -------------------- Loaders -------------------- */
  const loadFeatured = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await loadFeaturedProducts({ perPage: 10, page: 1, order: 'desc', orderby: 'date', status: 'publish' });
      setItems(Array.isArray(raw) ? raw.map(mapToGemItem) : []);
    } catch (err) {
      console.error('Failed loading featured:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserMeta = useCallback(async () => {
    const session = await getSession();
    if (!session?.user?.id) {
      setUserId(null);
      setWishlist([]);
      setCart([]);
      return;
    }
    setUserId(session.user.id);

    const customer = await getCustomerById(session.user.id);
    setWishlist(customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || []);
    const cartMeta: any[] = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
    setCart(cartMeta.map((c) => String(c.id)));
  }, []);

  /* -------------------- Init -------------------- */
  useEffect(() => {
    loadFeatured();
    loadUserMeta();
  }, [loadFeatured, loadUserMeta]);

  /* Refresh meta on focus */
  useFocusEffect(
    useCallback(() => {
      loadUserMeta();
    }, [loadUserMeta]),
  );

  /* Listen for external meta changes */
  useEffect(() => {
    const wl = DeviceEventEmitter.addListener('wishlistChanged', loadUserMeta);
    const ct = DeviceEventEmitter.addListener('cartChanged', loadUserMeta);
    return () => {
      wl.remove();
      ct.remove();
    };
  }, [loadUserMeta]);

  /* -------------------- Utils -------------------- */
  const emitMeta = (ev: 'wishlistChanged' | 'cartChanged') => DeviceEventEmitter.emit(ev);

  const showTempMessage = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 2500);
  };

  /* -------------------- Mutations -------------------- */
  const toggleWishlist = async (productId: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    
    // Set loading state for this specific product
    setLoadingWishlist(prev => ({ ...prev, [productId]: true }));
    
    try {
      const customer = await getCustomerById(userId);
      let wish: string[] = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];

      const exists = wish.includes(productId);
      wish = exists ? wish.filter(id => id !== productId) : [...wish, productId];

      await updateCustomerById(userId, { meta_data: [{ key: 'wishlist', value: wish }] });
      setWishlist(wish);
      emitMeta('wishlistChanged');
      showTempMessage(exists ? 'Item removed from wishlist' : 'Item added to wishlist');
    } catch (err) {
      console.error('Wishlist error:', err);
      showTempMessage('Failed to update wishlist');
    } finally {
      // Clear loading state
      setLoadingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (productId: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    
    // Set loading state for this specific product
    setLoadingCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      const customer = await getCustomerById(userId);
      let cart = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];

      if (!cart.some((c: any) => c.id === productId)) cart.push({ id: productId, quantity: 1 });

      await updateCustomerById(userId, { meta_data: [{ key: 'cart', value: cart }] });
      setCart(cart.map((c: any) => String(c.id)));
      emitMeta('cartChanged');
      showTempMessage('Item added to cart');
    } catch (err) {
      console.error('Cart error:', err);
      showTempMessage('Failed to add to cart');
    } finally {
      // Clear loading state
      setLoadingCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  /* -------------------- Render -------------------- */
  const renderCard: ListRenderItem<GemItem> = ({ item }) => {
    const inWishlist = wishlistIds.includes(item.id);
    const inCart     = cartIds.includes(item.id);
    const isWishlistLoading = loadingWishlist[item.id] || false;
    const isCartLoading = loadingCart[item.id] || false;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/pages/DetailsOfItem/ItemDetails', params: { id: item.id, title: item.title } })}
          activeOpacity={0.85}
        >
          {/* Rating */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.productImage} />
          </View>

          {/* Price + Wishlist */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceText}>{item.price}</Text>
              {item.originalPrice && <Text style={styles.originalPriceText}>{item.originalPrice}</Text>}
            </View>
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.wishlistIcon} 
              onPress={() => toggleWishlist(item.id)}
              disabled={isWishlistLoading}
            >
              {isWishlistLoading ? (
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
              ) : (
                <Ionicons 
                  name={inWishlist ? 'heart' : 'heart-outline'} 
                  size={20} 
                  color={inWishlist ? Colors.PRIMARY : '#000'} 
                />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Add / Added */}
        <TouchableOpacity
          style={[styles.addToCartButton, inCart && { backgroundColor: '#10B981' }]}
          disabled={inCart || isCartLoading}
          onPress={() => addToCart(item.id)}
        >
          {isCartLoading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <>
              <Ionicons name={inCart ? 'checkmark' : 'cart-outline'} size={16} color={Colors.WHITE} />
              <Text style={styles.addToCartText}>{inCart ? 'Added' : 'Add to Cart'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  /* -------------------- JSX -------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Products</Text>
        <Text style={styles.subtitle}>Discover Amazing Deals</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
      ) : ( 
        <FlatList
          data={items}
          renderItem={renderCard}
          keyExtractor={(it) => it.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <Text style={{ paddingHorizontal: 16, color: '#6B7280' }}>
              No featured products.
            </Text>
          }
        />
      )}

      {toast && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Featured;

/* ----------------------------- Styles ----------------------------- */
const styles = StyleSheet.create({
  container: { backgroundColor: '#F9FAFB', paddingVertical: 20, marginTop: 20 },
  header   : { paddingHorizontal: 10, marginBottom: 16 },
  title    : { fontSize: 22, fontWeight: 'bold', color: Colors.SECONDARY },
  subtitle : { fontSize: 14, color: '#6B7280', marginTop: 4 },

  listContentContainer: { paddingLeft: 0, paddingRight: 0 },

  card           : { backgroundColor: '#fff', borderRadius: 16, padding: 10, marginHorizontal: 4, width: 160 },
  ratingBadge    : { 
    position: 'absolute', 
    top: 30, 
    left: 4, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 12, 
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // NEW: Added background for better visibility
  },
  ratingText     : { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  cardTitle      : { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#1F2937' },

  imageContainer : { width: '100%', height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  productImage   : { width: '100%', height: '100%', resizeMode: 'cover' },

  priceContainer : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  priceText      : { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY },
  originalPriceText: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },

  discountBadge  : { backgroundColor: Colors.PRIMARY, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  discountText   : { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  wishlistIcon   : { padding: 4, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }, // NEW: Fixed size

  addToCartButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: Colors.PRIMARY, 
    paddingVertical: 8, 
    borderRadius: 8, 
    columnGap: 6,
    minHeight: 36, // NEW: Fixed height to prevent layout shift
  },
  addToCartText  : { color: Colors.WHITE, fontWeight: '600', fontSize: 12 },

  messageContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, backgroundColor: '#333', padding: 16, marginHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  messageText     : { color: '#fff', fontSize: 16 },
});
