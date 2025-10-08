import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Types based on your API response
interface ShiprocketProduct {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  selling_price: number;
}

interface ShiprocketShipment {
  id: number;
  awb: string;
  courier: string;
  courier_id: string;
  status: string;
  delivered_date: string;
  shipped_date: string;
  etd: string;
  weight: number;
  dimensions: string;
}

interface ShiprocketOrderData {
  id: number;
  channel_order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;
  total: number;
  status: string;
  payment_method: string;
  order_date: string;
  products: ShiprocketProduct[];
  shipments: ShiprocketShipment;
  pickup_address?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pin_code: string;
  };
}

interface ShiprocketTabProps {
  orderId: string;
}

const ShiprocketTab: React.FC<ShiprocketTabProps> = ({ orderId }) => {
  const [shiprocketData, setShiprocketData] = useState<ShiprocketOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log({orderId})
    if (orderId) {
      fetchShiprocketData();
    }
  }, [orderId]);

  const fetchShiprocketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://youlitestore.in/app-api/api.php?action=order_details&order_id=${orderId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Shiprocket data');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setShiprocketData(result.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Shiprocket fetch error:', err);
      setError('Unable to load Shiprocket details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return '#4CAF50';
    if (statusLower.includes('shipped') || statusLower.includes('transit')) return '#2196F3';
    if (statusLower.includes('pending') || statusLower === 'new') return '#FFA500';
    if (statusLower.includes('cancelled') || statusLower.includes('rto')) return '#F44336';
    return '#666';
  };

  const openTrackingUrl = (awb: string) => {
    if (awb) {
      const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
      Linking.openURL(trackingUrl).catch((err: Error) => {
        Alert.alert('Error', 'Unable to open tracking URL');
        console.error('Error opening URL:', err);
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading Shiprocket details...</Text>
        </View>
      </View>
    );
  }

  if (error || !shiprocketData) {
    return (
      <View style={styles.section}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'No Shiprocket data available'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchShiprocketData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {/* Header with Refresh */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Shiprocket Details</Text>
        <TouchableOpacity onPress={fetchShiprocketData} disabled={loading}>
          <Ionicons name="refresh" size={20} color={loading ? '#ccc' : Colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Order Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Order Status:</Text>
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(shiprocketData.status) }]}>
            {shiprocketData.status}
          </Text>
        </View>
      </View>

      {/* Shipment Information */}
      {shiprocketData.shipments && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipment Information</Text>
          
          {shiprocketData.shipments.awb && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>AWB Number:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.awb}</Text>
            </View>
          )}

          {shiprocketData.shipments.courier && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Courier:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.courier}</Text>
            </View>
          )}

          {shiprocketData.shipments.status && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Shipment Status:</Text>
              <Text style={[styles.value, { color: getStatusColor(shiprocketData.shipments.status) }]}>
                {shiprocketData.shipments.status}
              </Text>
            </View>
          )}

          {shiprocketData.shipments.etd && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Expected Delivery:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.etd}</Text>
            </View>
          )}

          {shiprocketData.shipments.shipped_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Shipped Date:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.shipped_date}</Text>
            </View>
          )}

          {shiprocketData.shipments.delivered_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Delivered Date:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.delivered_date}</Text>
            </View>
          )}

          {shiprocketData.shipments.weight > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Weight:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.weight} kg</Text>
            </View>
          )}

          {shiprocketData.shipments.dimensions && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dimensions:</Text>
              <Text style={styles.value}>{shiprocketData.shipments.dimensions}</Text>
            </View>
          )}

          {/* Track Online Button */}
          {shiprocketData.shipments.awb && (
            <TouchableOpacity 
              style={styles.trackButton} 
              onPress={() => openTrackingUrl(shiprocketData.shipments.awb)}
            >
              <Ionicons name="location-outline" size={20} color="white" />
              <Text style={styles.trackButtonText}>Track Shipment</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Customer Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{shiprocketData.customer_name}</Text>
          {shiprocketData.customer_phone && (
            <Text style={styles.addressText}>{shiprocketData.customer_phone}</Text>
          )}
          <Text style={styles.addressText}>{shiprocketData.customer_address}</Text>
          <Text style={styles.addressText}>
            {shiprocketData.customer_city}, {shiprocketData.customer_state} - {shiprocketData.customer_pincode}
          </Text>
        </View>
      </View>

      {/* Pickup Address */}
      {shiprocketData.pickup_address && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup Location</Text>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{shiprocketData.pickup_address.name}</Text>
            <Text style={styles.addressText}>{shiprocketData.pickup_address.address}</Text>
            <Text style={styles.addressText}>
              {shiprocketData.pickup_address.city}, {shiprocketData.pickup_address.state} - {shiprocketData.pickup_address.pin_code}
            </Text>
          </View>
        </View>
      )}

      {/* Products */}
      {shiprocketData.products && shiprocketData.products.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Products in Shipment</Text>
          
          {shiprocketData.products.map((product: ShiprocketProduct, index: number) => (
            <View key={product.id} style={[styles.productItem, index > 0 && styles.productItemBorder]}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>
                <Text style={styles.productQuantity}>Quantity: {product.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>₹{product.selling_price}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Payment Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{shiprocketData.payment_method}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={[styles.value, styles.totalAmount]}>₹{shiprocketData.total}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 16,
    color: '#E91E63',
  },
  addressBox: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  trackButton: {
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginLeft: 12,
  },
});

export default ShiprocketTab;