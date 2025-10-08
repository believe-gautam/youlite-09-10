import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Service that returns Woo coupons. Ensure it forwards params to your coupons endpoint.
import { loadCoupons } from '@/lib/services/couponService';

type DiscountType = 'percent' | 'fixed_cart' | 'fixed_product' | string;

interface Coupon {
  id: number;
  code: string;
  amount: string;
  description: string;
  date_expires: string | null;
  date_expires_gmt: string | null;
  discount_type: DiscountType;
  usage_count: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  status: string;
  used_by: string[];
  image?: string;
}

type CouponTabs = 'Available' | 'Used' | 'Expired';

const formatDiscount = (coupon: Coupon): string => {
  if (coupon.discount_type === 'percent') return `${coupon.amount}%`;
  return `₹${coupon.amount}`;
};

const isExpired = (coupon: Coupon): boolean => {
  const exp = coupon.date_expires_gmt || coupon.date_expires;
  if (!exp) return false;
  return new Date(exp).getTime() < Date.now();
};

const isUsedOut = (coupon: Coupon): boolean => {
  const limited = typeof coupon.usage_limit === 'number' && coupon.usage_limit !== null;
  if (limited && coupon.usage_count >= (coupon.usage_limit as number)) return true;

  const perUserLimited =
    typeof coupon.usage_limit_per_user === 'number' && coupon.usage_limit_per_user !== null;
  if (perUserLimited && Array.isArray(coupon.used_by)) {
    if (coupon.used_by.length >= (coupon.usage_limit_per_user as number)) return true;
  }
  return false;
};

const categorizeCoupons = (all: Coupon[]): Record<CouponTabs, Coupon[]> => {
  const available: Coupon[] = [];
  const used: Coupon[] = [];
  const expired: Coupon[] = [];

  all.forEach((c) => {
    if (isExpired(c)) {
      expired.push(c);
    } else if (isUsedOut(c)) {
      used.push(c);
    } else {
      // Only published coupons are considered available
      if (c.status === 'publish') available.push(c);
    }
  });

  return { Available: available, Used: used, Expired: expired };
};

const Coupons: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CouponTabs>('Available');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      // If your backend supports query params, update loadCoupons to pass { status: 'publish', per_page: 100 }.
      const data = await loadCoupons({ per_page: 100 });
      const arr = Array.isArray(data) ? data : [];
      // Keep published coupons for classification; expired will still appear if they were published earlier and have an expired date set.
      const publishedOnly = arr.filter((c: Coupon) => c.status === 'publish');
      setCoupons(publishedOnly);
    } catch (error) {
      Alert.alert('Error', 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => categorizeCoupons(coupons), [coupons]);

  const filteredCoupons = useMemo(() => {
    const list = grouped[activeTab];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.description ? c.description.toLowerCase().includes(q) : false)
    );
  }, [grouped, activeTab, searchQuery]);

  const CouponCard: React.FC<{ coupon: Coupon }> = ({ coupon }) => {
    const used = isUsedOut(coupon);
    const expired = isExpired(coupon);

    const cardStyle: ViewStyle[] = [styles.couponCard];
    if (used || expired) cardStyle.push(styles.usedCoupon);

    return (
      <View style={cardStyle}>
        <View style={styles.couponContent}>
          {coupon.image ? (
            <Image source={{ uri: coupon.image }} style={styles.couponImage} />
          ) : (
            <View style={styles.couponDiscount}>
              <Text style={styles.discountText}>{formatDiscount(coupon)}</Text>
              {used && (
                <View style={styles.usedBadge}>
                  <Text style={styles.usedText}>USED</Text>
                </View>
              )}
              {expired && (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredText}>EXPIRED</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.couponDetails}>
            <Text style={styles.couponTitle}>{coupon.code.toUpperCase()}</Text>
            <Text style={styles.couponDescription} numberOfLines={2}>
              {coupon.description || 'No description available'}
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{coupon.code}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  Alert.alert('Copied', `Coupon code "${coupon.code}" copied.`);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.copyText}>COPY</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.expiryText}>
              {coupon.date_expires_gmt
                ? `Expires: ${new Date(coupon.date_expires_gmt).toLocaleDateString()}`
                : 'No Expiry'}
            </Text>
            <Text style={styles.usageText}>
              Used: {coupon.usage_count}
              {coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
            </Text>
          </View>
        </View>

        {!used && !expired && (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              Alert.alert('Apply Coupon', `Applying "${coupon.code}" at checkout.`);
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.applyText}>Apply Coupon</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => <CouponCard coupon={item} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <TouchableOpacity activeOpacity={0.85}>
          <Ionicons name="gift-outline" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search coupons..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['Available', 'Used', 'Expired'] as CouponTabs[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.9}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab} ({grouped[tab].length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : filteredCoupons.length > 0 ? (
        <FlatList
          data={filteredCoupons}
          renderItem={renderCouponItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchCoupons}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetag-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No coupons found</Text>
          <Text style={styles.emptySubText}>
            {activeTab === 'Available'
              ? "You don't have any available coupons"
              : `You don't have any ${activeTab.toLowerCase()} coupons`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Dimenstion.headerHeight,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.WHITE },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: '#111' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 2,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 15, backgroundColor: '#fff' },
  activeTab: { backgroundColor: Colors.PRIMARY },
  tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
  activeTabText: { color: Colors.WHITE },

  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },

  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
  },
  usedCoupon: { opacity: 0.65 },

  couponContent: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  couponImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  couponDiscount: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  discountText: { fontSize: 16, fontWeight: 'bold', color: '#ff6b6b' },

  usedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#9e9e9e',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  expiredBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  usedText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  expiredText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  couponDetails: { flex: 1 },
  couponTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  couponDescription: { fontSize: 14, color: '#666', marginBottom: 8 },

  codeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  codeText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#ff6b6b', letterSpacing: 1 },
  copyButton: { backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  copyText: { color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' },

  expiryText: { fontSize: 12, color: '#999', marginBottom: 4 },
  usageText: { fontSize: 12, color: '#999' },

  applyButton: { backgroundColor: Colors.PRIMARY, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  applyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#666', textAlign: 'center' },
});

export default Coupons;
