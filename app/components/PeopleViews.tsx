// src/pages/PeopleAlsoViewed/PeopleAlsoViewed.tsx
import imagePath from '@/constant/imagePath';
import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import APIs
import { getProducts } from '@/lib/api/productApi';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';

const { width } = Dimensions.get('window');

type WCImage = { id: number; src: string; alt?: string };
type WCProduct = {
  id: number | string;
  name: string;
  price: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  average_rating?: string | number;
  rating_count?: number;
  images?: WCImage[];
  categories?: { id: number; name: string }[];
  [k: string]: any;
};

interface CartItem {
  id: string;
  quantity: number;
}

interface ProductCardProps {
  imageSource: any;
  title: string;
  originalPrice: string;
  discountedPrice: string;
  discount?: string;
  rating: number;
  isInWishlist: boolean;
  isInCart: boolean;
  onToggleWishlist: () => void;
  onToggleCart: () => void;
  isWishlistLoading?: boolean;
  isCartLoading?: boolean;
}

const toNum = (v: any, fb = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fb;
};

const percentDiscount = (regular: number, sale: number): string | undefined => {
  if (regular > 0 && sale > 0 && regular > sale) {
    const pct = Math.round(((regular - sale) / regular) * 100);
    if (Number.isFinite(pct) && pct > 0) return `-${pct}%`;
  }
  return undefined;
};

const normalizeUri = (uri: string): string => {
  const trimmed = (uri || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://')) return trimmed.replace('http://', 'https://');
  return trimmed;
};

const pickImageSource = (p: WCProduct) => {
  const imgs = Array.isArray(p?.images) ? p.images : [];
  const first = imgs.length > 0 ? imgs[0] : undefined;
  const src = typeof first?.src === 'string' ? normalizeUri(first.src) : '';
  return src.length > 0 ? { uri: src } : imagePath.image11;
};

const mapToCard = (p: WCProduct): (ProductCardProps & { id: string; title: string }) => {
  const sale = toNum(p?.sale_price ?? p?.price, 0);
  const regular = toNum(p?.regular_price ?? p?.price, 0);
  const discount = percentDiscount(regular, sale);
  const title = typeof p?.name === 'string' && p.name ? p.name : 'Unnamed';

  return {
    id: String(p?.id ?? ''),
    imageSource: pickImageSource(p),
    title,
    originalPrice: regular > 0 ? `₹${regular.toFixed(0)}` : '',
    discountedPrice: `₹${sale.toFixed(0)}`,
    discount,
    rating: toNum(p?.average_rating ?? 0, 0),
    isInWishlist: false,
    isInCart: false,
    onToggleWishlist: () => { },
    onToggleCart: () => { },
    isWishlistLoading: false,
    isCartLoading: false,
  };
};

const ProductCard = ({
  imageSource,
  title,
  originalPrice,
  discountedPrice,
  discount,
  rating,
  isInWishlist,
  isInCart,
  onToggleWishlist,
  onToggleCart,
  isWishlistLoading = false,
  isCartLoading = false,
}: ProductCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <View style={styles.priceContainer}>
        <View>
          <Text style={styles.originalPrice}>{originalPrice}</Text>
          <Text style={styles.discountedPrice}>{discountedPrice}</Text>
        </View>
        {discount ? <Text style={styles.discount}>{discount}</Text> : null}
        <TouchableOpacity
          onPress={onToggleWishlist}
          style={styles.wishlistButton}
          disabled={isWishlistLoading}
        >
          {isWishlistLoading ? (
            <ActivityIndicator size="small" color={Colors.PRIMARY} />
          ) : (
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist ? Colors.PRIMARY : "#000"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Add to Cart Button with checked functionality */}
      <TouchableOpacity
        style={[styles.addToCartButton, isInCart && { backgroundColor: '#10B981' }]}
        onPress={onToggleCart}
        disabled={isInCart || isCartLoading}
      >
        {isCartLoading ? (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        ) : (
          <>
            <Ionicons
              name={isInCart ? "checkmark" : "cart"}
              size={16}
              color={Colors.WHITE}
            />
            <Text style={styles.addToCartText}>{isInCart ? 'Added' : 'Add to Cart'}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const PeopleAlsoViewed = () => {
  const [items, setItems] = useState<(ProductCardProps & { id: string; title: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // State for tracking loading buttons
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});
  const [loadingCart, setLoadingCart] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        per_page: 12,
        page: 1,
        status: 'publish',
        order: 'desc',
        orderby: 'date',
      });

      const list: WCProduct[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? (res as any) : [];
      const mapped = list.map(mapToCard);
      setItems(mapped);
    } catch (e) {
      console.error('PeopleAlsoViewed: failed to load products', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    const session = await getSession();
    if (session?.user?.id) {
      setUserId(session.user.id);
      const customer = await getCustomerById(session.user.id);
      const wl = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      const cart = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
      setWishlistIds(wl);
      setCartIds(cart.map((c: CartItem) => String(c.id)));
    } else {
      setUserId(null);
      setWishlistIds([]);
      setCartIds([]);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    load();
  }, [loadUserData, load]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData]),
  );

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const toggleWishlist = async (productId: string) => {
    if (!userId) {
      router.push('/Login/LoginRegisterPage');
      return;
    }

    // Set loading state for this specific product
    setLoadingWishlist(prev => ({ ...prev, [productId]: true }));

    try {
      const customer = await getCustomerById(userId);
      let wishlist = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      const exists = wishlist.includes(productId);
      wishlist = exists ? wishlist.filter((id: string) => id !== productId) : [...wishlist, productId];
      await updateCustomerById(userId, { meta_data: [{ key: 'wishlist', value: wishlist }] });

      // ✅ FIX: Reload user data after a successful wishlist update
      await loadUserData();

      showFeedback(exists ? 'Item removed from wishlist' : 'Item added to wishlist');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showFeedback('Failed to update wishlist');
    } finally {
      // Clear loading state
      setLoadingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  };

  const toggleCart = async (productId: string) => {
    if (!userId) {
      router.push('/Login/LoginRegisterPage');
      return;
    }

    // Set loading state for this specific product
    setLoadingCart(prev => ({ ...prev, [productId]: true }));

    try {
      const customer = await getCustomerById(userId);
      let cart = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
      const idx = cart.findIndex((c: CartItem) => c.id === productId);
      if (idx === -1) {
        cart.push({ id: productId, quantity: 1 });
        await updateCustomerById(userId, { meta_data: [{ key: 'cart', value: cart }] });

        // ✅ FIX: Reload user data after a successful cart update
        await loadUserData();

        showFeedback('Item added to cart');
      }
      // Optional: handle removing from cart
    } catch (error) {
      console.error('Error toggling cart:', error);
      showFeedback('Failed to update cart');
    } finally {
      // Clear loading state
      setLoadingCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>People also viewed</Text>

      {loading && items.length === 0 && <Text style={{ color: '#6B7280' }}>Loading...</Text>}

      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              router.push({ pathname: '/pages/DetailsOfItem/ItemDetails', params: { id: String(item.id), title: item.title } })
            }
            style={styles.cardContainer}
          >
            <ProductCard
              imageSource={item.imageSource}
              title={item.title}
              originalPrice={item.originalPrice}
              discountedPrice={item.discountedPrice}
              discount={item.discount}
              rating={item.rating}
              isInWishlist={wishlistIds.includes(item.id)}
              isInCart={cartIds.includes(item.id)}
              onToggleWishlist={() => toggleWishlist(item.id)}
              onToggleCart={() => toggleCart(item.id)}
              isWishlistLoading={loadingWishlist[item.id]}
              isCartLoading={loadingCart[item.id]}
            />
          </TouchableOpacity>
        ))}

        {!loading && items.length === 0 && <Text style={{ color: '#6B7280' }}>No products available.</Text>}
      </View>

      {feedbackMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{feedbackMessage}</Text>
        </View>
      )}
    </View>
  );
};

export default PeopleAlsoViewed;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.SECONDARY,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  cardContainer: {
    width: (width - 40) / 2,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 1,
    height: 250,
    width: 160,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 13,
    marginVertical: 4,
    color: '#333',
    fontWeight: '500',
  },
  priceContainer: {
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  discountedPrice: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  discount: {
    fontSize: 12,
    color: '#fbf1f1ff',
    fontWeight: 'bold',
    backgroundColor: '#7da112ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  wishlistButton: {
    padding: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    minHeight: 36,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
});