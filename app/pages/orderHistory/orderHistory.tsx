import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import imagePath from '@/constant/imagePath';
import { getSession } from '@/lib/services/authService';
import { API_CONSUMER_KEY, API_CONSUMER_SECRET } from '@/utils/apiUtils/constants';
import Colors from '@/utils/Colors';
import Dimension from '@/utils/Dimenstion';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Type Definitions ---
type OrderStatus = 'completed' | 'cancelled' | 'processing' | string;

interface LineItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image?: { src: string };
}

interface Order {
  id: number;
  date_created: string;
  status: OrderStatus;
  total: string;
  line_items: LineItem[];
}

// --- Component ---
const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          setOrders([]);
          setFilteredOrders([]);
          return;
        }

        const userId = session.user.id;
        const response = await fetch(
          `https://youlitestore.in/wp-json/wc/v3/orders?customer=${userId}&consumer_key=${API_CONSUMER_KEY}&consumer_secret=${API_CONSUMER_SECRET}`
        );
        const data: Order[] = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // --- Search Filter ---
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredOrders(orders);
      return;
    }

    const lowerText = text.toLowerCase();
    const filtered = orders.filter((order) => {
      const matchId = order.id.toString().includes(lowerText);
      const matchStatus = order.status.toLowerCase().includes(lowerText);
      const matchProduct = order.line_items.some((item) =>
        item.name.toLowerCase().includes(lowerText)
      );
      return matchId || matchStatus || matchProduct;
    });

    setFilteredOrders(filtered);
  };

  // --- Status Icon ---
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={16} color="#10B981" />;
      case 'cancelled':
        return <Ionicons name="close-circle" size={16} color="#EF4444" />;
      case 'processing':
        return <Ionicons name="time" size={16} color="#F59E0B" />;
      default:
        return <Ionicons name="ellipse" size={16} color="#6B7280" />;
    }
  };

  // --- Render Order Item ---
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => router.push(`/pages/orderHistory/OrderDetails?id=${item.id}`)}
      style={styles.orderItem}
    >
      {/* Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.date_created).toDateString()}</Text>
        </View>
        <View
          style={[
            styles.statusContainer,
            item.status === 'completed'
              ? styles.statusDeliveredContainer
              : item.status === 'cancelled'
                ? styles.statusCancelledContainer
                : styles.statusProcessingContainer,
          ]}
        >
          {getStatusIcon(item.status)}
          <Text
            style={[
              styles.orderStatus,
              item.status === 'completed'
                ? styles.statusDelivered
                : item.status === 'cancelled'
                  ? styles.statusCancelled
                  : styles.statusProcessing,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.orderContent}>
        {item.line_items.length > 0 && (
          <View style={styles.productImagesContainer}>
            {item.line_items.map((product: LineItem) => (
              <Image
                key={product.id}
                source={{ uri: product.image?.src || imagePath.image1 }}
                style={styles.productImage}
              />
            ))}
          </View>
        )}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.orderAmount}>₹{item.total}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.orderFooter}>
        <TouchableOpacity
          onPress={() => router.push(`/pages/orderHistory/OrderDetails?id=${item.id}`)}
          style={styles.detailsButton}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.PRIMARY}
        barStyle={'light-content'}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by order ID, product name, or status"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Orders */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubText}>Try adjusting your search</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Dimension.headerHeight - 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.WHITE },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  orderItem: {
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
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderId: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  orderDate: { fontSize: 13, color: '#6B7280' },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusDeliveredContainer: { backgroundColor: '#ECFDF5' },
  statusCancelledContainer: { backgroundColor: '#FEF2F2' },
  statusProcessingContainer: { backgroundColor: '#FFFBEB' },
  orderStatus: { fontSize: 12, fontWeight: '500', marginLeft: 4 },
  statusDelivered: { color: '#065F46' },
  statusCancelled: { color: '#B91C1C' },
  statusProcessing: { color: '#B45309' },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImagesContainer: { flexDirection: 'row' },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  amountContainer: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  orderAmount: { fontSize: 18, fontWeight: '700', color: '#111827' },
  orderFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  detailsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailsButtonText: { fontSize: 14, fontWeight: '500', color: Colors.PRIMARY, marginRight: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});

export default OrderHistory;
