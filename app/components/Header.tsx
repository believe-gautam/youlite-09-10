import imagePath from '@/constant/imagePath';
import { getCustomerById, getSession } from '@/lib/services/authService';
import Colors from '@/utils/Colors';
import { AppEvents } from '@/utils/EventEmitter';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CartCount from '../pages/AddToCart/CartCount';
import WishlistCount from '../pages/AddToCart/WishlistCount';

const AVATAR_DIR = FileSystem.documentDirectory + 'avatars/';

const localPathsForUser = (userId: number) => ([
  `${AVATAR_DIR}user_${userId}.jpg`,
  `${AVATAR_DIR}user_${userId}.png`,
  `${AVATAR_DIR}user_${userId}.webp`,
]);

const nonEmpty = (s?: string | null): s is string => typeof s === 'string' && s.trim().length > 0;
const findMeta = (meta: any[] | undefined, key: string) => (meta || []).find((m) => m.key === key);
const asString = (v: unknown) => typeof v === 'string' ? v : '';
const buildDisplayName = (c?: any) => {
  if (!c) return 'Guest';
  const name = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  if (name) return name;
  if (c.username) return c.username;
  return c.email || 'Guest';
};
const buildLocation = (c?: any) => {
  const b = c?.billing;
  const s = c?.shipping;
  const city = b?.city || s?.city || '';
  const state = b?.state || s?.state || '';
  const country = b?.country || s?.country || '';
  const parts = [city, state || country].filter(Boolean);
  return parts.join(', ');
};

const Header: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [customer, setCustomer] = useState<any>();
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const screenFocused = useIsFocused();

  const fetchUserData = useCallback(async () => {
    try {
      const sess = await getSession();
      if (!sess?.user?.id) {
        setSession(null);
        setCustomer(undefined);
        setAvatarUri('');
        setWishlistIds([]);
        setCartItems([]);
        return;
      }
      setSession(sess);

      const candidates = localPathsForUser(sess.user.id);
      let localFound = '';
      for (const p of candidates) {
        const info = await FileSystem.getInfoAsync(p);
        if (info.exists) { localFound = p; break; }
      }
      if (nonEmpty(localFound)) setAvatarUri(localFound);

      const cust = await getCustomerById(sess.user.id);
      setCustomer(cust);

      const wishlist = findMeta(cust.meta_data, 'wishlist')?.value || [];
      setWishlistIds(Array.isArray(wishlist) ? wishlist : []);

      const cart = findMeta(cust.meta_data, 'cart')?.value || [];
      setCartItems(Array.isArray(cart) ? cart : []);

      if (!nonEmpty(localFound)) {
        const metaVal = asString(findMeta(cust.meta_data, 'avatar_file')?.value);
        if (nonEmpty(metaVal)) setAvatarUri(metaVal);
        else if (nonEmpty(cust.avatar_url)) setAvatarUri(cust.avatar_url);
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  }, []);

  useEffect(() => { if (screenFocused) fetchUserData(); }, [screenFocused]);

  useEffect(() => {
    const removeCartListener = AppEvents.addListener('cartUpdated', setCartItems);
    const removeWishlistListener = AppEvents.addListener('wishlistUpdated', setWishlistIds);
    return () => { removeCartListener(); removeWishlistListener(); };
  }, []);

  // ---------------- Live search ----------------
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      setLoadingSearch(true);
      const { data } = await axios.get(
        `https://youlitestore.in/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&consumer_key=ck_d75d53f48f9fb87921a2523492a995c741d368df&consumer_secret=cs_ae3184c5435dd5d46758e91fa9ed3917d85e0c17`
      );
      setSearchResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally { setLoadingSearch(false); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue.length > 0) searchProducts(inputValue);
      else setShowDropdown(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, searchProducts]);

  const handleSelectProduct = (item: any) => {
    setShowDropdown(false);
    setInputValue('');
    router.push({ pathname: '/pages/DetailsOfItem/ItemDetails', params: { id: String(item.id), title: item.title } });
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    router.push({ pathname: '/pages/Search/SearchResults', params: { query: inputValue } });
  };

  const isLoggedIn = !!session?.user?.id;
  const displayName = useMemo(() => (isLoggedIn ? buildDisplayName(customer) : 'Guest'), [isLoggedIn, customer]);
  const displayLocation = useMemo(() => (isLoggedIn ? buildLocation(customer) || '—' : 'create profile'), [isLoggedIn, customer]);

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.push(isLoggedIn ? '/Profile' : '/Login/LoginRegisterPage')} style={styles.profileCircle}>
          <Image source={nonEmpty(avatarUri) ? { uri: avatarUri } : imagePath.image1} style={styles.profileImage} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.welcome}>{displayLocation}</Text>
          <Text style={styles.username}>{displayName}</Text>
        </View>
        <WishlistCount count={wishlistIds.length} />
        <CartCount count={cartItems.length} />
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Search products..."
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => setShowDropdown(true)}>
          <Ionicons name="search" size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {loadingSearch ? (
            <ActivityIndicator color={Colors.PRIMARY} />
          ) : searchResults.length === 0 ? (
            <Text style={styles.noResult}>No results found</Text>
          ) : (
            <>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectProduct(item)}>
                    <Image source={{ uri: item.images?.[0]?.src }} style={styles.dropdownImage} />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.dropdownText}>{item.name}</Text>
                      <Text style={styles.dropdownPrice}>₹{item.price}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
                <Text style={styles.viewAllText}>View All Results</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.PRIMARY, padding: 16, paddingTop: 35, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff2', marginRight: 10 },
  profileImage: { width: '100%', height: '100%', borderRadius: 50 },
  textContainer: { flex: 1 },
  welcome: { fontSize: 12, color: Colors.WHITE },
  username: { fontSize: 18, fontWeight: 'bold', color: Colors.WHITE },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, height: 40, backgroundColor: Colors.WHITE, borderRadius: 10, paddingHorizontal: 10 },
  searchButton: { width: 40, height: 40, backgroundColor: Colors.WHITE, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  dropdown: { backgroundColor: '#fff', borderRadius: 10, marginTop: 5, maxHeight: 300, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dropdownImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  dropdownText: { fontWeight: '600', color: '#333' },
  dropdownPrice: { fontSize: 12, color: Colors.PRIMARY, marginTop: 2 },
  noResult: { textAlign: 'center', paddingVertical: 10, color: '#777' },
  viewAllButton: { padding: 12, backgroundColor: Colors.PRIMARY, alignItems: 'center' },
  viewAllText: { color: '#fff', fontWeight: 'bold' },
});

export default Header;
