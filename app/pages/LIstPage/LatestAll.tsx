import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/utils/Colors';
import imagePath from '@/constant/imagePath';
import { getProducts } from '@/lib/api/productApi';
import { getCategories } from '@/lib/api/categoryApi';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import { useLocalSearchParams, router } from 'expo-router';

const { width } = Dimensions.get('window');

// ---------- Types ----------
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: any;
  rating: number;
  category: string;
  brand: string;
  featured: boolean;
}

interface Category {
  id: number;
  name: string;
  parent: number;
}

// ---------- Component ----------
const LatestAll = () => {
  const params = useLocalSearchParams();
  const { categoryId, categoryName, isFeatured } = params;

  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [subCategoryProducts, setSubCategoryProducts] = useState<Record<number, Product[]>>({});

  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState('All Products');

  // ---------- Helpers ----------
  const toNum = (v: any, fb = 0) => {
    const n = parseFloat(String(v ?? ''));
    return Number.isFinite(n) ? n : fb;
  };

  const pickImage = (imgs: any[]) =>
    imgs?.length ? { uri: imgs[0].src } : imagePath.image11;

  const mapProduct = (p: any): Product => {
    const sale = toNum(p.sale_price ?? p.price, 0);
    const regular = toNum(p.regular_price ?? p.price, 0);
    const discount =
      regular > sale ? `${Math.round(((regular - sale) / regular) * 100)}% OFF` : undefined;
    const brand = p.categories?.find((c: any) => c.parent === 0)?.name || 'Generic';

    return {
      id: String(p.id),
      name: p.name,
      price: sale,
      originalPrice: regular !== sale ? regular : undefined,
      discount,
      image: pickImage(p.images || []),
      rating: toNum(p.average_rating, 4),
      category: p.categories?.[0]?.name || 'Uncategorized',
      brand,
      featured: !!p.featured,
    };
  };

  // ---------- Data Load ----------
  const loadData = async () => {
    try {
      setLoading(true);

      // --- 1. Build base query ---
      const qp: any = {
        per_page: 50,
        page: 1,
        status: 'publish',
        order: 'desc',
        orderby: 'date',
      };

      let parentForSub = 0;

      if (categoryId) {
        qp.category = categoryId;
        setCategoryTitle(String(categoryName ?? 'Category Products'));
        parentForSub = Number(categoryId);
      } else if (isFeatured === 'true') {
        qp.featured = true;
        setCategoryTitle('Featured Products');
      } else {
        const cats = await getCategories({
          per_page: 50,
          hide_empty: true,
          orderby: 'count',
          order: 'desc',
        });
        const top = Array.isArray(cats?.data) && cats.data.length ? cats.data[0] : null;
        if (top) {
          qp.category = top.id;
          setCategoryTitle(top.name);
          parentForSub = top.id;
        }
      }

      // --- 2. Fetch main list & derive slices ---
      const resp = await getProducts(qp);
      const all: Product[] = (resp?.data || []).map(mapProduct);
      setProducts(all);
      setFeaturedProducts(all.filter(p => p.featured));
      setDiscountedProducts(all.filter(p => p.discount));
      setNewProducts(all.slice(0, 6));
      setTrendingProducts(all.filter(p => p.rating >= 4.5));
      setBestsellerProducts([...all].sort((a, b) => b.rating - a.rating).slice(0, 6));

      // --- 3. Fetch sub-categories & their products ---
      if (parentForSub) {
        const subRes = await getCategories({ parent: parentForSub, per_page: 20 });
        const subs: Category[] = subRes?.data || [];
        setSubCategories(subs);

        const map: Record<number, Product[]> = {};
        for (const sub of subs) {
          const prodRes = await getProducts({ category: sub.id, per_page: 10 });
          map[sub.id] = (prodRes?.data || []).map(mapProduct);
        }
        setSubCategoryProducts(map);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    const session = await getSession();
    if (session?.user?.id) {
      setUserId(session.user.id);
      const customer = await getCustomerById(session.user.id);
      const ids = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      setWishlistIds(ids);
    }
  };

  useEffect(() => {
    loadUser();
    loadData();
  }, [categoryId, isFeatured]);

  // ---------- Wishlist ----------
  const toggleWishlist = async (id: string) => {
    if (!userId) {
      router.push('/Login/LoginRegisterPage');
      return;
    }
    const customer = await getCustomerById(userId);
    let list: string[] =
      customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
    list = list.includes(id) ? list.filter(i => i !== id) : [...list, id];
    await updateCustomerById(userId, { meta_data: [{ key: 'wishlist', value: list }] });
    setWishlistIds(list);
  };

  // ---------- Cart ----------
  const handleAddToCart = (id: string) => setCartItems(prev => [...prev, id]);
  const isInCart = (id: string) => cartItems.includes(id);

  // ---------- Render helpers ----------
  const ProductCardHorizontal = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.horizontalCard}>
      <View style={styles.imageWrap}>
        {item.discount && (
          <View style={styles.badgeDiscount}>
            <Text style={styles.badgeText}>{item.discount}</Text>
          </View>
        )}
        {item.featured && (
          <View style={styles.badgeType}>
            <Text style={styles.badgeText}>Featured</Text>
          </View>
        )}
        <Image source={item.image} style={styles.imageHorizontal} />

        <TouchableOpacity style={styles.wishBtn} onPress={() => toggleWishlist(item.id)}>
          <Ionicons
            name={wishlistIds.includes(item.id) ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlistIds.includes(item.id) ? Colors.PRIMARY : '#000'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingTxt}>{item.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceNow}>₹{item.price.toFixed(2)}</Text>
          {item.originalPrice && (
            <Text style={styles.priceOld}>₹{item.originalPrice.toFixed(2)}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.cartBtn, isInCart(item.id) && styles.inCart]}
          onPress={() => handleAddToCart(item.id)}
        >
          <Ionicons
            name={isInCart(item.id) ? 'checkmark' : 'cart'}
            size={14}
            color={Colors.WHITE}
          />
          <Text style={styles.cartTxt}>{isInCart(item.id) ? 'In Cart' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingTxt}>Loading products...</Text>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <Text style={styles.headerSub}>{products.length} products found</Text>
      </View>

      {/* Slider Sections */}
      {[
        { title: 'Featured Products Slider', data: featuredProducts },
        { title: 'New Arrivals Slider', data: newProducts },
        { title: 'Trending Now Slider', data: trendingProducts },
        { title: 'Hot Deals Slider', data: discountedProducts },
        { title: 'Bestsellers Slider', data: bestsellerProducts },
      ].map(
        s =>
          s.data.length > 0 && (
            <View key={s.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{s.title}</Text>
              </View>
              <FlatList
                data={s.data}
                renderItem={ProductCardHorizontal}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listH}
              />
            </View>
          )
      )}

      {/* Sub-category sliders */}
      {subCategories.map(sc => (
        <View key={sc.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{`${sc.name} Slider`}</Text>
          </View>
          <FlatList
            data={subCategoryProducts[sc.id] || []}
            renderItem={ProductCardHorizontal}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listH}
          />
        </View>
      ))}
    </ScrollView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTxt: { marginTop: 16, color: Colors.SECONDARY },

  header: {
    padding: 20,
    backgroundColor: Colors.PRIMARY,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: Colors.WHITE },
  headerSub: { fontSize: 14, color: Colors.WHITE, opacity: 0.9 },

  section: { marginVertical: 16 },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.SECONDARY },

  listH: { paddingHorizontal: 16 },

  // ---- Product card (horizontal) ----
  horizontalCard: {
    width: width * 0.6,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    padding: 12,
    elevation: 3,
  },
  imageWrap: { position: 'relative' },
  imageHorizontal: { width: '100%', height: 150, resizeMode: 'contain' },
  badgeDiscount: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeType: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeText: { color: Colors.WHITE, fontSize: 10, fontWeight: 'bold' },

  wishBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 20,
  },

  infoBox: { padding: 8 },
  brand: { fontSize: 12, color: '#666' },
  name: { fontSize: 14, fontWeight: '600', color: '#333', height: 38 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ratingTxt: { marginLeft: 4, fontSize: 12, color: '#666' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priceNow: { fontSize: 16, fontWeight: 'bold', color: '#333', marginRight: 6 },
  priceOld: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inCart: { backgroundColor: '#28a745' },
  cartTxt: { color: Colors.WHITE, fontSize: 13, marginLeft: 4 },
});

export default LatestAll;
