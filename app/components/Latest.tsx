// src/components/Latest/Latest.tsx
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getCategories } from '@/lib/api/categoryApi';
import { getProducts } from '@/lib/api/productApi';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';

/* ------------------------------- Types ------------------------------ */
type Business = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  price: number;
};

type WCImage   = { id: number; src: string };
type WCCategory = { id: number; name: string; count: number };
type WCProduct  = {
  id: number | string;
  name: string;
  price: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  images?: WCImage[];
  categories?: { id: number; name: string }[];
};

/* ---------------------------- Helpers ------------------------------ */
const toNum       = (v: any, fb = 0) => (Number.isFinite(parseFloat(v)) ? +v : fb);
const normalizeUri = (u = '') => (u.trim().startsWith('http://') ? u.replace('http://', 'https://') : u.trim());

/* =================================================================== */
const Latest = () => {
  /* ------------------ Local state ------------------ */
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]       = useState(true);

  const [userId, setUserId]         = useState<number | null>(null);
  const [wishlistIds, setWishlist]  = useState<string[]>([]);
  const [cartIds,     setCart]      = useState<string[]>([]);
  const [toast,       setToast]     = useState('');

  const [categoryTitle, setCategoryTitle] = useState('Latest Products');

  // NEW: State for tracking loading buttons
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});
  const [loadingCart, setLoadingCart] = useState<Record<string, boolean>>({});

  /* ------------------ Meta loader ------------------ */
  const loadUserMeta = useCallback(async () => {
    const session = await getSession();
    if (session?.user?.id) {
      setUserId(session.user.id);
      const customer = await getCustomerById(session.user.id);
      setWishlist(customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || []);
      const cartMeta = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
      setCart(cartMeta.map((c: any) => String(c.id)));
    } else {
      setUserId(null);
      setWishlist([]);
      setCart([]);
    }
  }, []);

  /* ------------------ Category + product loaders ------------------- */
  const loadCategories = useCallback(async () => {
    try {
      const res  = await getCategories({ per_page: 10, hide_empty: true, order: 'desc', orderby: 'count' });
      const list = (res?.data || []) as WCCategory[];
      if (!list.length) return null;
      const top  = list.reduce((p, c) => (p.count > c.count ? p : c));
      setCategoryTitle(top.name);
      return top.id;
    } catch (e) {
      console.error('Category load error', e);
      return null;
    }
  }, []);

  const loadProducts = useCallback(async (catId: number) => {
    try {
      setLoading(true);
      const res  = await getProducts({ per_page: 12, page: 1, status: 'publish', order: 'desc', orderby: 'date', category: String(catId) });
      const list = (res?.data || []) as WCProduct[];
      const mapped: Business[] = list.map(p => ({
        id      : String(p.id),
        title   : p.name || 'Unnamed',
        subtitle: '',
        category: p.categories?.[0]?.name || 'Unknown',
        image   : p.images?.[0]?.src ? { uri: normalizeUri(p.images[0].src) } : imagePath.image11,
        price   : toNum(p.sale_price ?? p.price),
      }));
      setBusinesses(mapped);
    } catch (e) {
      console.error('Product load error', e);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------ Initial load ------------------ */
  useEffect(() => {
    (async () => {
      await loadUserMeta();
      const cid = await loadCategories();
      if (cid) await loadProducts(cid);
      else setLoading(false);
    })();
  }, [loadCategories, loadProducts, loadUserMeta]);

  /* -------- Reload meta on screen focus -------- */
  useFocusEffect(
    useCallback(() => {
      loadUserMeta();
    }, [loadUserMeta]),
  );

  /* -------- Cross-screen real-time updates ----- */
  useEffect(() => {
    const wl = DeviceEventEmitter.addListener('wishlistChanged', loadUserMeta);
    const ct = DeviceEventEmitter.addListener('cartChanged'    , loadUserMeta);
    return () => {
      wl.remove();
      ct.remove();
    };
  }, [loadUserMeta]);

  /* ------------------ Helpers ------------------ */
  const showToast = (txt: string) => {
    setToast(txt);
    setTimeout(() => setToast(''), 2500);
  };

  const emitMeta  = (ev: 'wishlistChanged' | 'cartChanged') => DeviceEventEmitter.emit(ev);

  /* ------------------ Mutations ------------------ */
  const toggleWishlist = async (pid: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    
    // Set loading state for this specific product
    setLoadingWishlist(prev => ({ ...prev, [pid]: true }));
    
    try {
      const customer = await getCustomerById(userId);
      let wish = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      const exists = wish.includes(pid);
      wish = exists ? wish.filter((id: string) => id !== pid) : [...wish, pid];
      await updateCustomerById(userId, { meta_data: [{ key: 'wishlist', value: wish }] });
      setWishlist(wish);
      emitMeta('wishlistChanged');
      showToast(exists ? 'Item removed from wishlist' : 'Item added to wishlist');
    } catch (e) {
      console.error('Wishlist update error', e);
      showToast('Failed to update wishlist');
    } finally {
      // Clear loading state
      setLoadingWishlist(prev => ({ ...prev, [pid]: false }));
    }
  };

  const addToCart = async (pid: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    
    // Set loading state for this specific product
    setLoadingCart(prev => ({ ...prev, [pid]: true }));
    
    try {
      const customer = await getCustomerById(userId);
      let cart = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
      if (!cart.some((c: any) => c.id === pid)) cart.push({ id: pid, quantity: 1 });
      await updateCustomerById(userId, { meta_data: [{ key: 'cart', value: cart }] });
      setCart(cart.map((c: any) => String(c.id)));
      emitMeta('cartChanged');
      showToast('Item added to cart');
    } catch (e) {
      console.error('Cart update error', e);
      showToast('Failed to add to cart');
    } finally {
      // Clear loading state
      setLoadingCart(prev => ({ ...prev, [pid]: false }));
    }
  };

  /* ------------------ Render card ------------------ */
  const renderCard = ({ item }: { item: Business }) => {
    const inWish = wishlistIds.includes(item.id);
    const inCart = cartIds.includes(item.id);
    const isWishlistLoading = loadingWishlist[item.id]; // NEW
    const isCartLoading = loadingCart[item.id]; // NEW

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/pages/DetailsOfItem/ItemDetails', params: { id: item.id } })}
      >
        <Image source={item.image} style={styles.image} />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
          </View>

          <View style={styles.footerContainer}>
            {/* <View style={styles.tag}><Text style={styles.tagText}>{item.category}</Text></View> */}

            {/* Wishlist */}
            <TouchableOpacity 
              onPress={() => toggleWishlist(item.id)} 
              style={styles.iconBtn}
              disabled={isWishlistLoading} // NEW
            >
              {isWishlistLoading ? ( // NEW: Show loader if loading
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
              ) : (
                <Ionicons 
                  name={inWish ? 'heart' : 'heart-outline'} 
                  size={20} 
                  color={inWish ? Colors.PRIMARY : '#000'} 
                />
              )}
            </TouchableOpacity>

            {/* Cart */}
            <TouchableOpacity
              style={[styles.addToCartButton, inCart && { backgroundColor: '#10B981' }]}
              disabled={inCart || isCartLoading} // NEW
              onPress={() => addToCart(item.id)}
            >
              {isCartLoading ? ( // NEW: Show loader if loading
                <ActivityIndicator size="small" color={Colors.WHITE} />
              ) : (
                <>
                  <Ionicons name={inCart ? 'checkmark' : 'cart'} size={16} color={Colors.WHITE} />
                  <Text style={styles.cartButtonText}>{inCart ? 'Added' : 'Add'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ------------------ JSX ------------------ */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{categoryTitle}</Text>
        <TouchableOpacity onPress={() => router.push('/pages/LIstPage/LatestAll')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <Text style={{ color: '#6B7280' }}>Loading...</Text>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCard}
        />
      )}

      {/* Toast */}
      {toast && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{toast}</Text>
        </View>
      )}
    </View>
  );
};

export default Latest;

/* ------------------------------ Styles ----------------------------- */
const styles = StyleSheet.create({
  container  : { marginTop: 20, paddingHorizontal: 10,  },
  header     : { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title      : { fontSize: 18, fontWeight: 'bold', color: Colors.SECONDARY },
  viewAll    : { fontSize: 14, color: Colors.PRIMARY, fontWeight: '600' },

  card       : { backgroundColor: Colors.WHITE, borderRadius: 12, marginRight: 10,marginBottom: 10, width: 160, overflow: 'hidden', elevation: 0.5 },
  image      : { width: '100%', height: 120 },
  textContainer: { padding: 12 },
  cardTitle  : { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 6 },
  priceContainer: { marginBottom: 10 },
  price      : { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY },

  footerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag        : { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText    : { fontSize: 12, color: Colors.PRIMARY, fontWeight: '600' },
  iconBtn    : { padding: 4, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }, // NEW: Fixed size

  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minHeight: 32, // NEW: Fixed height to prevent layout shift
  },
  cartButtonText : { fontSize: 12, color: Colors.WHITE, fontWeight: '600', marginLeft: 4 },

  messageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0, right: 0,
    backgroundColor: '#333',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: { color: '#fff', fontSize: 16 },
});