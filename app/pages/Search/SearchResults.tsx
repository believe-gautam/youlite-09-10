import { getProducts } from '@/lib/api/productApi';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const side = 16;
const gap = 16;
const itemWidth = (width - side * 2 - gap) / 2;

// Types
type WCImage = { id: number; src: string; alt?: string };
type WCTag = { id: number; name: string; slug?: string };
type WCCategory = { id: number; name: string; slug?: string; parent?: number };
type WCAttribute = {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
};
type WCProduct = {
  id: number | string;
  name: string;
  price: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  average_rating?: string | number;
  rating_count?: number;
  images?: WCImage[];
  categories?: WCCategory[];
  tags?: WCTag[];
  attributes?: WCAttribute[];
  default_attributes?: any[];
  variations?: (number | string)[];
  featured?: boolean;
  on_sale?: boolean;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  [k: string]: any;
};

// Helpers
const stripHTML = (s: string): string => s.replace(/<[^>]*>/g, '');
const toStr = (v: any) => String(v ?? '');
const toNum = (v: any, fb = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fb;
};
const pctOff = (reg: number, sale: number): string | undefined => {
  if (reg > sale && reg > 0) {
    const pct = Math.round(((reg - sale) / reg) * 100);
    return pct > 0 ? `${pct}% OFF` : undefined;
  }
  return undefined;
};
const normalizeUri = (uri: string): string => {
  const s = (uri || '').trim();
  if (!s) return '';
  return s.startsWith('http://') ? s.replace('http://', 'https://') : s;
};
const firstImageSrc = (images?: WCImage[]): string => {
  const fallback = 'https://placehold.co/400x400/E5E7EB/6B7280?text=No+Image';
  const first: string | undefined = images?.[0]?.src;
  const src: string = first ? normalizeUri(first) : fallback;
  return src;
};

type Filters = {
  categoryIds: number[];
  featured: boolean | null;
  tagIds: number[];
  minRating: number | null;
  brands: string[];
  attributes: Record<string, string[]>;
  inStockOnly: boolean;
  onSaleOnly: boolean;
};

const defaultFilters: Filters = {
  categoryIds: [],
  featured: null,
  tagIds: [],
  minRating: null,
  brands: [],
  attributes: {},
  inStockOnly: false,
  onSaleOnly: false,
};

const SearchResults: React.FC = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  const query = useMemo(() => (typeof params.query === 'string' ? params.query.trim() : ''), [params.query]);

  const [products, setProducts] = useState<WCProduct[]>([]);
  const [baseProducts, setBaseProducts] = useState<WCProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Auth/meta
  const [userId, setUserId] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string>('');

  // Per-item loader states
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});
  const [loadingCart, setLoadingCart] = useState<Record<string, boolean>>({});

  // UI state
  const [sort, setSort] = useState<'relevant' | 'low' | 'high' | 'rating'>('relevant');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // Derived meta
  const [allCategories, setAllCategories] = useState<WCCategory[]>([]);
  const [allTags, setAllTags] = useState<WCTag[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allAttributes, setAllAttributes] = useState<Record<string, string[]>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  // Load user/meta. IMPORTANT: use the same cart key & shape as AllProductsScreen ('cart': array of {id, quantity})
  const loadUserMeta = useCallback(async () => {
    try {
      const session = await getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
        const customer = await getCustomerById(session.user.id);
        const wl = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
        const cartArr: any[] = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
        setWishlistIds(Array.isArray(wl) ? wl.map(toStr) : []);
        setCartIds(Array.isArray(cartArr) ? cartArr.map((c: any) => String(c.id)) : []);
      } else {
        setUserId(null);
        setWishlistIds([]);
        setCartIds([]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch and derive
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts();
      const list: WCProduct[] = Array.isArray(res?.data) ? res.data : [];

      const q = query.toLowerCase();
      const base = !q
        ? list
        : list.filter((p) => {
          const name = stripHTML(String(p.name || '')).toLowerCase();
          const inName = name.includes(q);
          const inTags = (p.tags || []).some((t) => String(t.name || '').toLowerCase().includes(q));
          const inCats = (p.categories || []).some((c) => String(c.name || '').toLowerCase().includes(q));
          return inName || inTags || inCats;
        });

      // derive meta
      const categoryMap = new Map<number, WCCategory>();
      base.forEach((p) => (p.categories || []).forEach((c) => categoryMap.set(c.id, c)));
      const tagMap = new Map<number, WCTag>();
      base.forEach((p) => (p.tags || []).forEach((t) => tagMap.set(t.id, t)));

      const brandsSet = new Set<string>();
      base.forEach((p) => {
        const root = (p.categories || []).find((c) => !c.parent || c.parent === 0);
        if (root?.name) brandsSet.add(root.name);
      });

      const attrMap: Record<string, Set<string>> = {};
      base.forEach((p) => {
        (p.attributes || []).forEach((a) => {
          const key = a.name || a.slug || `attr_${a.id}`;
          if (!attrMap[key]) attrMap[key] = new Set<string>();
          (a.options || []).forEach((opt) => attrMap[key].add(String(opt)));
        });
      });
      const attrObj: Record<string, string[]> = Object.fromEntries(
        Object.entries(attrMap).map(([k, v]) => [k, Array.from(v).sort()])
      );

      setBaseProducts(base);
      setProducts(base);
      setAllCategories(Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      setAllTags(Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      setAllBrands(Array.from(brandsSet.values()).sort());
      setAllAttributes(attrObj);
    } catch {
      setError('Failed to load search results. Please try again.');
      setBaseProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadUserMeta();
  }, [loadUserMeta]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Apply filters + sort
  useEffect(() => {
    let arr = [...baseProducts];

    if (filters.categoryIds.length) {
      const ids = new Set(filters.categoryIds);
      arr = arr.filter((p) => (p.categories || []).some((c) => ids.has(c.id)));
    }

    if (filters.featured !== null) {
      arr = arr.filter((p) => !!p.featured === !!filters.featured);
    }

    if (filters.tagIds.length) {
      const ids = new Set(filters.tagIds);
      arr = arr.filter((p) => (p.tags || []).some((t) => ids.has(t.id)));
    }

    if (filters.minRating !== null) {
      arr = arr.filter((p) => toNum(p.average_rating, 0) >= (filters.minRating as number));
    }

    if (filters.brands.length) {
      const brands = new Set(filters.brands.map((b) => b.toLowerCase()));
      arr = arr.filter((p) => {
        const root = (p.categories || []).find((c) => !c.parent || c.parent === 0);
        return root?.name ? brands.has(root.name.toLowerCase()) : false;
      });
    }

    const attrKeys = Object.keys(filters.attributes).filter((k) => (filters.attributes[k] || []).length);
    if (attrKeys.length) {
      arr = arr.filter((p) => {
        const pAttrs = p.attributes || [];
        return attrKeys.every((k) => {
          const selectedOptions = new Set(filters.attributes[k]);
          const match = pAttrs.find((a) => a.name === k || a.slug === k);
          if (!match) return false;
          return (match.options || []).some((opt) => selectedOptions.has(String(opt)));
        });
      });
    }

    if (filters.inStockOnly) {
      arr = arr.filter((p) => (p.stock_status || 'instock') === 'instock');
    }
    if (filters.onSaleOnly) {
      arr = arr.filter((p) => {
        const reg = toNum(p.regular_price ?? p.price);
        const sale = toNum(p.sale_price ?? p.price);
        return sale < reg || !!p.on_sale;
      });
    }

    if (sort === 'low') arr.sort((a, b) => toNum(a.sale_price ?? a.price) - toNum(b.sale_price ?? b.price));
    else if (sort === 'high') arr.sort((a, b) => toNum(b.sale_price ?? b.price) - toNum(a.sale_price ?? a.price));
    else if (sort === 'rating') arr.sort((a, b) => toNum(b.average_rating) - toNum(a.average_rating));

    setProducts(arr);
  }, [filters, sort, baseProducts]);

  // Actions
  const goToDetails = (p: WCProduct) => {
    router.push({
      pathname: '/pages/DetailsOfItem/ItemDetails',
      params: { id: String(p.id), title: stripHTML(String(p.name || '')) },
    });
  };

  const toggleWishlist = async (id: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');
    setLoadingWishlist((prev) => ({ ...prev, [id]: true }));
    try {
      const customer = await getCustomerById(userId);
      let wl: string[] = customer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      wl = Array.isArray(wl) ? wl.map(toStr) : [];
      const exists = wl.includes(id);
      const updated = exists ? wl.filter((x) => x !== id) : [...wl, id];
      await updateCustomerById(userId, { meta_data: [{ key: 'wishlist', value: updated }] });
      setWishlistIds(updated);
      showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      showToast('Failed to update wishlist');
    } finally {
      setLoadingWishlist((prev) => ({ ...prev, [id]: false }));
    }
  };

  // FIX: Write to 'cart' as array of objects { id, quantity } — same as AllProductsScreen
  const addToCart = async (id: string) => {
    if (!userId) return router.push('/Login/LoginRegisterPage');

    setLoadingCart((prev) => ({ ...prev, [id]: true }));

    try {
      const customer = await getCustomerById(userId);
      let cart: any[] = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
      if (!Array.isArray(cart)) cart = [];

      const exists = cart.some((c: any) => String(c.id) === id);
      if (!exists) {
        cart.push({ id, quantity: 1 });
        await updateCustomerById(userId, { meta_data: [{ key: 'cart', value: cart }] });
        setCartIds(cart.map((c: any) => String(c.id)));
        showToast('Item added to cart');
      } else {
        showToast('Already in cart');
      }
    } catch {
      showToast('Failed to add to cart');
    } finally {
      setLoadingCart((prev) => ({ ...prev, [id]: false }));
    }
  };

  const ResultMetaBar = () => {
    const total = products.length;
    return (
      <View style={styles.metaBar}>
        <Text style={styles.metaText}>
          {total} result{total === 1 ? '' : 's'} for “{query}”
        </Text>
        <View style={styles.metaActions}>
          <TouchableOpacity
            onPress={() =>
              setSort((s) => (s === 'relevant' ? 'low' : s === 'low' ? 'high' : s === 'high' ? 'rating' : 'relevant'))
            }
            style={styles.pill}
            activeOpacity={0.85}
          >
            <Ionicons name="swap-vertical" size={14} color={Colors.PRIMARY} />
            <Text style={styles.pillText}>
              {sort === 'relevant' ? 'Relevant' : sort === 'low' ? 'Price ↑' : sort === 'high' ? 'Price ↓' : 'Top Rated'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilterOpen(true)} style={[styles.pill, styles.pillGhost]} activeOpacity={0.85}>
            <Ionicons name="filter" size={14} color={Colors.PRIMARY} />
            <Text style={styles.pillText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const FilterModal = () => {
    const [local, setLocal] = useState<Filters>(filters);

    useEffect(() => {
      setLocal(filters);
    }, [filters]);

    const toggleCategory = (id: number) => {
      setLocal((p) => {
        const exists = p.categoryIds.includes(id);
        return { ...p, categoryIds: exists ? p.categoryIds.filter((x) => x !== id) : [...p.categoryIds, id] };
      });
    };

    const toggleTag = (id: number) => {
      setLocal((p) => {
        const exists = p.tagIds.includes(id);
        return { ...p, tagIds: exists ? p.tagIds.filter((x) => x !== id) : [...p.tagIds, id] };
      });
    };

    const toggleBrand = (name: string) => {
      setLocal((p) => {
        const exists = p.brands.includes(name);
        return { ...p, brands: exists ? p.brands.filter((x) => x !== name) : [...p.brands, name] };
      });
    };

    const toggleAttr = (key: string, opt: string) => {
      setLocal((p) => {
        const arr = p.attributes[key] || [];
        const exists = arr.includes(opt);
        const next = exists ? arr.filter((x) => x !== opt) : [...arr, opt];
        return { ...p, attributes: { ...p.attributes, [key]: next } };
      });
    };

    const clearAll = () => setLocal(defaultFilters);
    const apply = () => {
      setFilters(local);
      setFilterOpen(false);
    };

    return (
      <Modal visible={filterOpen} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refine Results</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              {/* Highlights */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Highlights</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.switchLabel}>Featured only</Text>
                  <Switch
                    value={!!local.featured}
                    onValueChange={(v) => setLocal((p) => ({ ...p, featured: v ? true : null }))}
                    thumbColor={local.featured ? Colors.PRIMARY : '#fff'}
                    trackColor={{ true: '#E0E7FF', false: '#E5E7EB' }}
                  />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.switchLabel}>In stock only</Text>
                  <Switch
                    value={local.inStockOnly}
                    onValueChange={(v) => setLocal((p) => ({ ...p, inStockOnly: v }))}
                    thumbColor={local.inStockOnly ? Colors.PRIMARY : '#fff'}
                    trackColor={{ true: '#E0E7FF', false: '#E5E7EB' }}
                  />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.switchLabel}>On sale only</Text>
                  <Switch
                    value={local.onSaleOnly}
                    onValueChange={(v) => setLocal((p) => ({ ...p, onSaleOnly: v }))}
                    thumbColor={local.onSaleOnly ? Colors.PRIMARY : '#fff'}
                    trackColor={{ true: '#E0E7FF', false: '#E5E7EB' }}
                  />
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={styles.switchLabel}>Minimum rating</Text>
                  <View style={styles.ratingFilterRow}>
                    {[0, 3, 4, 4.5].map((r) => {
                      const active = (local.minRating || 0) === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setLocal((p) => ({ ...p, minRating: r === 0 ? null : r }))}
                          style={[styles.ratingPill, active && styles.ratingPillActive]}
                        >
                          <Ionicons name="star" size={12} color={active ? Colors.WHITE : '#F59E0B'} />
                          <Text style={[styles.ratingPillText, active && { color: Colors.WHITE }]}>
                            {r === 0 ? 'Any' : `${r}+`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Categories */}
              {allCategories.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Categories</Text>
                  <View style={styles.chipWrap}>
                    {allCategories.map((c) => {
                      const active = local.categoryIds.includes(c.id);
                      return (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => toggleCategory(c.id)}
                          style={[styles.chip, active && styles.chipActive]}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.chipWrap}>
                    {allTags.map((t) => {
                      const active = local.tagIds.includes(t.id);
                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => toggleTag(t.id)}
                          style={[styles.chip, active && styles.chipActive]}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Brands */}
              {allBrands.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Brands</Text>
                  <View style={styles.chipWrap}>
                    {allBrands.map((b) => {
                      const active = local.brands.includes(b);
                      return (
                        <TouchableOpacity
                          key={b}
                          onPress={() => toggleBrand(b)}
                          style={[styles.chip, active && styles.chipActive]}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>{b}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Attributes */}
              {Object.keys(allAttributes).length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Attributes</Text>
                  {Object.entries(allAttributes).map(([key, opts]) => {
                    const selected = new Set(local.attributes[key] || []);
                    return (
                      <View key={key} style={{ marginBottom: 8 }}>
                        <Text style={styles.attrTitle}>{key}</Text>
                        <View style={styles.chipWrap}>
                          {opts.map((opt) => {
                            const active = selected.has(opt);
                            return (
                              <TouchableOpacity
                                key={`${key}_${opt}`}
                                onPress={() => toggleAttr(key, opt)}
                                style={[styles.chip, active && styles.chipActive]}
                              >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setFilters(defaultFilters)} style={[styles.footerBtn, styles.footerGhost]} activeOpacity={0.9}>
                <Text style={[styles.footerBtnText, { color: Colors.PRIMARY }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setFilters(local); setFilterOpen(false); }} style={[styles.footerBtn, styles.footerSolid]} activeOpacity={0.9}>
                <Text style={[styles.footerBtnText, { color: Colors.WHITE }]}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderItem = ({ item }: { item: WCProduct }) => {
    const idStr = String(item.id);
    const img = firstImageSrc(item.images);
    const title = stripHTML(String(item.name || ''));
    const reg = toNum(item.regular_price ?? item.price);
    const sale = toNum(item.sale_price ?? item.price);
    const off = pctOff(reg, sale);
    const rating = toNum(item.average_rating, 0);
    const ratingCount = toNum(item.rating_count, 0);

    const inWishlist = wishlistIds.includes(idStr);
    const inCart = cartIds.includes(idStr);
    const wlLoading = !!loadingWishlist[idStr];
    const ctLoading = !!loadingCart[idStr];

    return (
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <TouchableOpacity style={styles.wishlistBtn} onPress={() => toggleWishlist(idStr)} disabled={wlLoading}>
            {wlLoading ? (
              <ActivityIndicator size="small" color={Colors.PRIMARY} />
            ) : (
              <Ionicons name={inWishlist ? 'heart' : 'heart-outline'} size={18} color={inWishlist ? Colors.PRIMARY : '#111'} />
            )}
          </TouchableOpacity>

          {off && (
            <View style={styles.offBadge}>
              <Text style={styles.offText}>{off}</Text>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.9} onPress={() => goToDetails(item)}>
            <Image source={{ uri: img }} style={styles.productImage} contentFit="contain" transition={200} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={() => goToDetails(item)}>
          <View style={styles.info}>
            <Text numberOfLines={2} style={styles.title}>
              {title}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD43B" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              {ratingCount > 0 && <Text style={styles.ratingCount}>({ratingCount})</Text>}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceNow}>₹{sale.toFixed(0)}</Text>
              {reg > sale && <Text style={styles.priceOld}>₹{reg.toFixed(0)}</Text>}
            </View>

            {!!item.tags?.length && (
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 2).map((t) => (
                  <Text key={t.id} style={styles.tag}>
                    {t.name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cartBtn, inCart && styles.cartBtnAdded]}
          onPress={() => addToCart(idStr)}
          disabled={inCart || ctLoading}
          activeOpacity={0.9}
        >
          {ctLoading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <>
              <Ionicons name={inCart ? 'checkmark' : 'cart-outline'} size={16} color={Colors.WHITE} />
              <Text style={styles.cartTxt}>{inCart ? 'Added' : 'Add to Cart'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={Colors.PRIMARY}
        barStyle={'dark-content'} // Use 'light-content' if Colors.PRIMARY is dark
        translucent={false} // <--- Key for Android
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Search</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            Showing results for “{query}”
          </Text>
        </View>
        <View></View>
      </View>

      <View style={styles.container}>
        {/* Meta/sort/filter */}
        <View style={{ paddingHorizontal: side, paddingTop: 10 }}>
          <ResultMetaBar />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Finding great matches...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <Ionicons name="alert-circle" size={36} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.stateWrap}>
            <Ionicons name="search" size={36} color="#6B7280" />
            <Text style={styles.noResults}>No products found</Text>
            <Text style={styles.noResultsSub}>Try refining filters or keywords</Text>
          </View>
        )}
      </View>

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Filters */}
      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFB' },

  header: {
    paddingHorizontal: side,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: Colors.PRIMARY,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { color: Colors.WHITE, fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#F3F4F6', fontSize: 12, marginTop: 2 },

  container: { flex: 1 },

  metaBar: {
    paddingHorizontal: 0,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: { color: '#111827', fontSize: 13, fontWeight: '600' },
  metaActions: { flexDirection: 'row', alignItems: 'center' },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 8,
  },
  pillGhost: { backgroundColor: '#F1F5F9' },
  pillText: { color: Colors.PRIMARY, fontSize: 12, fontWeight: '700', marginLeft: 6 },

  listContent: { paddingHorizontal: side, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: gap },

  card: {
    width: itemWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },

  imageWrap: { position: 'relative' },
  productImage: { width: '100%', height: 130, backgroundColor: '#fff' },

  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 6,
    elevation: 2,
    zIndex: 2,
  },
  offBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  offText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  info: { paddingHorizontal: 10, paddingTop: 10 },
  title: { color: '#1F2937', fontSize: 13, fontWeight: '700', minHeight: 36 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { marginLeft: 4, color: '#111827', fontSize: 11, fontWeight: '700' },
  ratingCount: { marginLeft: 4, color: '#6B7280', fontSize: 11 },

  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  priceNow: { color: Colors.PRIMARY, fontSize: 14, fontWeight: '800', marginRight: 6 },
  priceOld: { color: '#9CA3AF', fontSize: 12, textDecorationLine: 'line-through' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginBottom: 8 },
  tag: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    fontWeight: '600',
  },

  cartBtn: {
    marginHorizontal: 10,
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 6,
  },
  cartBtnAdded: { backgroundColor: '#10B981' },
  cartTxt: { color: Colors.WHITE, fontSize: 12, fontWeight: '800' },

  loadingWrap: { alignItems: 'center', paddingTop: 36 },
  loadingText: { marginTop: 10, color: '#6B7280' },

  stateWrap: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  noResults: { marginTop: 8, color: '#374151', fontSize: 16, fontWeight: '800' },
  noResultsSub: { marginTop: 4, color: '#6B7280', fontSize: 12, textAlign: 'center' },
  errorText: { marginTop: 8, color: '#DC2626', fontSize: 14, textAlign: 'center' },

  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 6,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Modal
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '88%',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalHeader: {
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { color: '#111827', fontSize: 16, fontWeight: '800' },

  section: { marginTop: 12 },
  sectionTitle: { color: '#111827', fontSize: 14, fontWeight: '800', marginBottom: 8 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: Colors.PRIMARY },
  chipText: { fontSize: 12, color: '#1F2937', fontWeight: '600' },
  chipTextActive: { color: Colors.PRIMARY },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  switchLabel: { color: '#111827', fontSize: 13, fontWeight: '600' },

  ratingFilterRow: { flexDirection: 'row', marginTop: 8 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    marginRight: 8,
  },
  ratingPillActive: { backgroundColor: Colors.PRIMARY },
  ratingPillText: { marginLeft: 6, fontSize: 12, fontWeight: '700' },

  attrTitle: { color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 6 },

  modalFooter: { flexDirection: 'row', paddingVertical: 12, gap: 10 },
  footerBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  footerGhost: { backgroundColor: '#EEF2FF' },
  footerSolid: { backgroundColor: Colors.PRIMARY },
  footerBtnText: { fontSize: 14, fontWeight: '800' },
});

export default SearchResults;
