// src/pages/AllCategory/CategoryProduct.tsx
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { loadProductsByCategory, normalizeProduct } from '@/lib/services/productService';
import Loading from '@/app/components/Loading';

const { width } = Dimensions.get('window');

/* ---------- TYPES ---------- */
interface Product {
  id: string;
  name: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  discount?: string | null;
  image?: string | null;
  rating?: number;
  category: string;
  brand?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  raw?: any;
}

type RouteParams = { id?: string; title?: string };

/* ---------- UTILS ---------- */
const safeStr = (v: any, fb = ''): string => (typeof v === 'string' ? v : fb);

const toImg = (src?: string | null, raw?: any) => {
  const p = safeStr(src);
  if (p) return { uri: p };
  const first = raw?.images?.[0]?.src;
  return first ? { uri: safeStr(first) } : null;
};

/* ---------- BADGE ---------- */
const CartCount: React.FC<{ count: number }> = ({ count }) => (
  <View style={styles.cartIconContainer}>
    <Ionicons name="cart" size={24} color={Colors.WHITE} />
    {count > 0 && (
      <View style={styles.cartBadge}>
        <Text style={styles.cartBadgeText}>{count}</Text>
      </View>
    )}
  </View>
);

/* ====================================================================== */
const CategoryProduct: React.FC = () => {
  /* ---------- PARAMS ---------- */
  const { id: catId, title: routeTitle } = useLocalSearchParams<RouteParams>();
  const categoryId = catId ? String(catId) : '';
  const title = routeTitle ? String(routeTitle) : 'Products';

  /* ---------- STATE ---------- */
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([]);
  const [toast, setToast] = useState('');
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});
  const [loadingCart, setLoadingCart] = useState<Record<string, boolean>>({});

  /* ---------- HELPERS ---------- */
  const isInCart = (pid: string) => cartItems.some(c => c.id === pid);
  const isInWishlist = (pid: string) => wishlistIds.includes(pid);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const syncMeta = async (key: 'cart' | 'wishlist', value: any) => {
    if (!userId) return;
    await updateCustomerById(userId, { meta_data: [{ key, value }] });
  };

  /* ---------- LOAD USER ---------- */
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session?.user?.id) return;
      setUserId(session.user.id);
      const customer = await getCustomerById(session.user.id);
      setWishlistIds(customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || []);
      setCartItems(customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || []);
    })();
  }, []);

  /* ---------- LOAD PRODUCTS ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await loadProductsByCategory(categoryId);
        const list: Product[] = (Array.isArray(raw) ? raw : []).map((r, i) => {
          const n = normalizeProduct(r, title);
          return {
            id: String(n?.id ?? i),
            name: safeStr(n?.name, 'Unnamed'),
            price: Number(n?.price) || 0,
            regularPrice: Number(n?.regularPrice) || undefined,
            salePrice: Number(n?.salePrice) || undefined,
            discount: typeof n?.discount === 'string' ? n.discount : null,
            image: n?.image,
            rating: Number(n?.rating) || 0,
            category: safeStr(n?.category, title),
            brand: safeStr(n?.brand, ''),
            isFeatured: !!n?.isFeatured,
            isTrending: !!n?.isTrending,
            raw: n?.raw ?? r,
          };
        });
        if (mounted) setProducts(list);
      } catch {
        if (mounted) {
          setError('Failed to load products.');
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [categoryId, title]);

  /* ---------- ACTIONS ---------- */
  const toggleWishlist = async (pid: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    setLoadingWishlist(prev => ({ ...prev, [pid]: true }));
    try {
      const updated = isInWishlist(pid)
        ? wishlistIds.filter(id => id !== pid)
        : [...wishlistIds, pid];
      await syncMeta('wishlist', updated);
      setWishlistIds(updated);
      showToast(isInWishlist(pid) ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (e) {
      console.error('Wishlist error:', e);
      showToast('Failed to update wishlist');
    } finally {
      setLoadingWishlist(prev => ({ ...prev, [pid]: false }));
    }
  };

  const addToCart = async (pid: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    setLoadingCart(prev => ({ ...prev, [pid]: true }));
    try {
      const idx = cartItems.findIndex(c => c.id === pid);
      const updated =
        idx !== -1
          ? cartItems.map((c, i) => (i === idx ? { ...c, quantity: c.quantity + 1 } : c))
          : [...cartItems, { id: pid, quantity: 1 }];
      await syncMeta('cart', updated);
      setCartItems(updated);
      showToast('Item added to cart');
    } catch (e) {
      console.error('Cart error:', e);
      showToast('Failed to add to cart');
    } finally {
      setLoadingCart(prev => ({ ...prev, [pid]: false }));
    }
  };

  /* ---------- FILTERED LISTS ---------- */
  const featured = useMemo(() => products.filter(p => p.isFeatured), [products]);
  const trending = useMemo(() => products.filter(p => p.isTrending), [products]);

  /* ---------- RENDER ITEM ---------- */
  const renderCard = ({ item }: { item: Product }) => {
    const img = toImg(item.image, item.raw);
    const isWishLoading = loadingWishlist[item.id] || false;
    const isCartLoading = loadingCart[item.id] || false;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: '/pages/DetailsOfItem/ItemDetails', params: { id: item.id, title: item.name } })
        }
      >
        {/* IMAGE */}
        <View style={styles.imageBox}>
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountTxt}>{item.discount}</Text>
            </View>
          )}
          {/* wishlist icon */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(item.id)}
            activeOpacity={0.7}
            disabled={isWishLoading}
          >
            {isWishLoading ? (
              <ActivityIndicator size="small" color={Colors.WHITE} />
            ) : (
              <Ionicons
                name={isInWishlist(item.id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isInWishlist(item.id) ? Colors.PRIMARY : '#fff'}
              />
            )}
          </TouchableOpacity>
          {img ? (
            <Image source={img} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImg]}>
              <Ionicons name="image" size={32} color={Colors.PRIMARY} />
            </View>
          )}
        </View>
        {/* INFO */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              if (star <= (item.rating ?? 0)) {
                return <Ionicons key={star} name="star" size={12} color="#FFD700" />;
              } else if (star - 0.5 <= (item.rating ?? 0)) {
                return <Ionicons key={star} name="star-half" size={12} color="#FFD700" />;
              } else {
                return <Ionicons key={star} name="star-outline" size={12} color="#FFD700" />;
              }
            })}
            <Text style={styles.ratingTxt}>{(item.rating ?? 0).toFixed(1)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceNow}>₹{item.price.toFixed(2)}</Text>
            {item.regularPrice && item.regularPrice > item.price && (
              <Text style={styles.priceOrig}>₹{item.regularPrice.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.cartBtn, isInCart(item.id) && styles.cartBtnAdded]}
            onPress={() => addToCart(item.id)}
            disabled={isInCart(item.id) || isCartLoading}
            activeOpacity={0.8}
          >
            {isCartLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name={isInCart(item.id) ? 'checkmark' : 'cart'} size={14} color="#fff" />
                <Text style={styles.cartTxt}>{isInCart(item.id) ? 'In Cart' : 'Add'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: Product) => item.id;

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Loading />
        <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '600', color: Colors.SECONDARY }}>
          Loading your Products...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={() => router.push('/CartScreen')}>
          <CartCount count={cartItems.length} />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {error && <Text style={{ color: 'red', padding: 16 }}>{error}</Text>}

        {featured.length > 0 && (
          <View style={styles.featureSection}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <FlatList
              horizontal
              data={featured}
              renderItem={renderCard}
              keyExtractor={keyExtractor}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              contentContainerStyle={{ padding: 8 }}
            />

          </View>
        )}

        {trending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <FlatList
              horizontal
              data={trending}
              renderItem={renderCard}
              keyExtractor={keyExtractor}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              contentContainerStyle={{ padding: 8 }}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <View style={styles.grid}>
            {products.map(p => (
              <View key={p.id} style={styles.col}>
                {renderCard({ item: p })}
              </View>
            ))}
          </View>
        </View>


      </ScrollView>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastTxt}>{toast}</Text>
        </View>
      )}
    </View>
  );
};

export default CategoryProduct;

/* ====================================================================== */
const CARD_W = (width - 48) / 2; // 16 padding + 16 gap
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.WHITE },
  cartIconContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -5, right: -5,
    backgroundColor: Colors.WHITE,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: Colors.PRIMARY, fontSize: 12, fontWeight: 'bold' },

  /* section */
  featureSection: { margin: 8 },
  section: { margin: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: Colors.SECONDARY },

  /* grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  col: { width: CARD_W, marginBottom: 16 },

  /* card */
  card: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', elevation: 2 },
  imageBox: { position: 'relative' },
  image: { width: '100%', height: 150, resizeMode: 'contain', backgroundColor: '#f8f8f8' },
  noImg: { justifyContent: 'center', alignItems: 'center' },
  discountBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, zIndex: 3,
  },
  discountTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  wishlistBtn: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
    zIndex: 3,
  },
  info: { padding: 10 },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingTxt: { marginLeft: 4, fontSize: 12, color: '#666' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priceNow: { fontSize: 14, fontWeight: 'bold', color: Colors.PRIMARY },
  priceOrig: { fontSize: 12, color: '#999', textDecorationLine: 'line-through', marginLeft: 8 },
  cartBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 6,
  },
  cartBtnAdded: { backgroundColor: '#28a745' },
  cartTxt: { color: '#fff', fontSize: 12 },

  /* toast */
  toast: {
    position: 'absolute',
    bottom: 20, left: 20, right: 20,
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastTxt: { color: '#fff', fontSize: 14 },
});
