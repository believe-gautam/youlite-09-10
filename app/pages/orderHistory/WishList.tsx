// src/pages/WishList/WishList.tsx
import { getCustomerById, getSession, updateCustomerById } from '@/lib//services/authService';
import { loadProductById } from '@/lib/services/productService';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '@/app/components/Loading';

/* ---------------------------- Types & helpers ---------------------------- */
interface WishListItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: { uri: string };
  inStock: boolean;
}

const toNum = (v: any, fb = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fb;
};

/* ======================================================================== */
const WishList: React.FC = () => {
  /* -------------------- State -------------------- */
  const [wishlistItems, setWishlistItems] = useState<WishListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loadingRemove, setLoadingRemove] = useState<Record<string, boolean>>({});
  const [loadingCart, setLoadingCart] = useState<Record<string, boolean>>({});

  /* -------------------- Load wishlist -------------------- */
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const session = await getSession();
        if (!session?.user?.id) {
          setWishlistItems([]);
          setUserId(null);
          return;
        }

        setUserId(session.user.id);
        const customer = await getCustomerById(session.user.id);
        const wishlistIds: string[] =
          customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];

        if (wishlistIds.length === 0) {
          setWishlistItems([]);
          return;
        }

        /* fetch each product in parallel */
        const prods = await Promise.all(
          wishlistIds.map(async (id) => {
            try {
              return await loadProductById(id);
            } catch {
              return null;
            }
          })
        );

        const items: WishListItem[] = prods
          .filter(Boolean)
          .map((p: any) => {
            const price = toNum(p?.sale_price ?? p?.price, 0);
            const original = toNum(p?.regular_price ?? p?.price, 0);
            return {
              id: String(p?.id),
              name: p?.name || 'Unnamed',
              price,
              originalPrice: original > price ? original : undefined,
              image: { uri: p?.images?.[0]?.src || 'https://via.placeholder.com/150' },
              inStock: (p?.stock_status ?? 'instock') === 'instock',
            };
          });

        setWishlistItems(items);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  /* -------------------- Helpers -------------------- */
  const showTempMsg = (txt: string) => {
    setMessage(txt);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateRemoteMeta = async (key: 'wishlist' | 'cart', value: any) => {
    if (!userId) return;
    await updateCustomerById(userId, { meta_data: [{ key, value }] });
  };

  /* -------------------- Mutations -------------------- */
  const removeFromWishlist = async (id: string) => {
    if (!userId) return;
    setLoadingRemove(prev => ({ ...prev, [id]: true }));
    try {
      const customer = await getCustomerById(userId);
      let wishlist: string[] =
        customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      wishlist = wishlist.filter((w) => w !== id);

      await updateRemoteMeta('wishlist', wishlist);
      setWishlistItems((prev) => prev.filter((it) => it.id !== id));
      showTempMsg('Item removed from wishlist');
    } catch (err) {
      console.error('remove wishlist error', err);
      showTempMsg('Failed to remove item');
    } finally {
      setLoadingRemove(prev => ({ ...prev, [id]: false }));
    }
  };

  const addToCart = async (id: string) => {
    if (!userId) {
      router.push('/Login/LoginRegisterPage');
      return;
    }
    setLoadingCart(prev => ({ ...prev, [id]: true }));
    try {
      const customer = await getCustomerById(userId);
      let cart: any[] = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];

      const idx = cart.findIndex((c) => c.id === id);
      if (idx !== -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      } else {
        cart.push({ id, quantity: 1 });
      }
      await updateRemoteMeta('cart', cart);

      /* also remove from wishlist */
      await removeFromWishlist(id);
      showTempMsg('Added to cart');
    } catch (err) {
      console.error('addToCart error', err);
      showTempMsg('Failed to add to cart');
    } finally {
      setLoadingCart(prev => ({ ...prev, [id]: false }));
    }
  };

  /* -------------------- Render -------------------- */
  const renderWishlistItem = ({ item }: { item: WishListItem }) => {
    const busyRemove = loadingRemove[item.id];
    const busyCart = loadingCart[item.id];

    return (
      <TouchableOpacity
        style={styles.wishlistItem}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: '/pages/DetailsOfItem/ItemDetails',
            params: { id: item.id, title: item.name },
          })
        }
      >
        <Image source={item.image} style={styles.itemImage} />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          <Text
            style={[
              styles.stockStatus,
              { color: item.inStock ? '#10B981' : '#EF4444' },
            ]}
          >
            {item.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={() => removeFromWishlist(item.id)}
            style={styles.actionButton}
            disabled={busyRemove}
          >
            {busyRemove ? (
              <ActivityIndicator size={18} color="#EF4444" />
            ) : (
              // <Ionicons name="heart-dislike" size={20} color="#EF4444" />
              <MaterialIcons name="delete" size={20} color="#EF4444" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cartButton,
              (!item.inStock || busyCart) && styles.disabledButton,
            ]}
            disabled={!item.inStock || busyCart}
            onPress={() => addToCart(item.id)}
          >
            {busyCart ? (
              <ActivityIndicator size={18} color={Colors.WHITE} />
            ) : (
              <Ionicons
                name="cart"
                size={20}
                color={item.inStock ? Colors.WHITE : '#9CA3AF'}
              />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  /* -------------------- UI -------------------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={Colors.PRIMARY}
          barStyle={'dark-content'}
          translucent={false}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <View style={styles.heartIconContainer}>
            <Ionicons name="heart" size={24} color={Colors.WHITE} />
            <View style={styles.heartBadge}>
              <Text style={styles.heartBadgeText}>0</Text>
            </View>
          </View>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Loading />
          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '600', color: '#4a5568' }}>
            Loading your WishList...
          </Text>
        </View>

      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={styles.heartIconContainer}>
          <Ionicons name="heart" size={24} color={Colors.WHITE} />
          <View style={styles.heartBadge}>
            <Text style={styles.heartBadgeText}>{wishlistItems.length}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(it) => it.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubText}>Items you save will appear here</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Toast */}
      {message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default WishList;

/* ---------------------------- Styles ---------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.WHITE },

  /* list */
  listContainer: { paddingHorizontal: 10, paddingBottom: 10 },

  wishlistItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: Colors.PRIMARY, marginRight: 8 },
  originalPrice: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  stockStatus: { fontSize: 12, fontWeight: '500' },

  itemActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, marginLeft: 8 },
  cartButton: { backgroundColor: Colors.PRIMARY, padding: 8, borderRadius: 8, marginLeft: 8 },
  disabledButton: { backgroundColor: '#F3F4F6' },

  /* empty */
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  continueShoppingButton: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  continueShoppingText: { color: Colors.WHITE, fontWeight: '600', fontSize: 14 },

  /* toast */
  messageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: { color: '#fff', fontSize: 14 },

  /* heart badge */
  heartIconContainer: { position: 'relative' },
  heartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.WHITE,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBadgeText: { color: Colors.PRIMARY, fontSize: 12, fontWeight: 'bold' },
});
