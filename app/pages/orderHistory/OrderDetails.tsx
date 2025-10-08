import imagePath from "@/constant/imagePath";
import {
  API_CONSUMER_KEY,
  API_CONSUMER_SECRET,
} from "@/utils/apiUtils/constants";
import Colors from "@/utils/Colors";
import Dimenstion from "@/utils/Dimenstion";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderDetails = () => {
  const { id } = useLocalSearchParams(); // order ID
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(
          `https://youlitestore.in/wp-json/wc/v3/orders/${id}?consumer_key=${API_CONSUMER_KEY}&consumer_secret=${API_CONSUMER_SECRET}`
        );
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ color: "#333", fontSize: 16 }}>Order not found.</Text>
      </View>
    );
  }

  const {
    id: orderId,
    date_created,
    total,
    line_items,
    billing,
    shipping,
    payment_method_title,
    status,
  } = order;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.PRIMARY}
        barStyle={'dark-content'} // Use 'light-content' if Colors.PRIMARY is dark
        translucent={false} // <--- Key for Android
      />


      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Order #{orderId}</Text>
        <View></View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <Text style={styles.summaryText}>
            Date:{" "}
            <Text style={styles.summaryValue}>
              {new Date(date_created).toDateString()}
            </Text>
          </Text>
          <Text style={styles.summaryText}>
            Status: <Text style={styles.summaryValue}>{status}</Text>
          </Text>
          <Text style={styles.summaryText}>
            Total: <Text style={styles.summaryValue}>₹{total}</Text>
          </Text>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          {line_items?.map((item: any) => (
            <View key={item.id} style={styles.productContainer}>
              <Image
                source={{ uri: item.image?.src || imagePath.image1 }}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info + Track Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.infoText}>{payment_method_title}</Text>
          <Text style={[styles.infoText, { marginTop: 8 }]}>
            Total Paid: <Text style={styles.totalPrice}>₹{total}</Text>
          </Text>

          {/* Track Order Button */}
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() =>
              router.push({
                pathname: "/pages/orderHistory/TrackOrder",
                params: { id: orderId },
              })
            }
          >
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {shipping?.first_name} {shipping?.last_name}
            </Text>
            <Text style={styles.infoText}>{shipping?.address_1}</Text>
            <Text style={styles.infoText}>
              {shipping?.city}, {shipping?.state}
            </Text>
            <Text style={styles.infoText}>{shipping?.postcode}</Text>
            <Text style={styles.infoText}>{shipping?.country}</Text>
          </View>
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {billing?.first_name} {billing?.last_name}
            </Text>
            <Text style={styles.infoText}>{billing?.email}</Text>
            <Text style={styles.infoText}>{billing?.phone}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    height: Dimenstion.headerHeight - 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.WHITE
  },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 12 },
  summaryText: { fontSize: 14, color: "#666", marginBottom: 4 },
  summaryValue: { fontWeight: "600", color: "#333" },
  productContainer: { flexDirection: "row", marginTop: 8 },
  productImage: { width: 80, height: 80, borderRadius: 8 },
  productDetails: { marginLeft: 16, justifyContent: "center", flex: 1 },
  productName: { fontSize: 16, fontWeight: "600", color: "#333" },
  productPrice: { fontSize: 18, fontWeight: "bold", color: "#E91E63", marginTop: 4 },
  quantity: { fontSize: 14, color: "#666", marginTop: 4 },
  infoBox: { backgroundColor: "#f8f9fa", padding: 12, borderRadius: 8, marginTop: 8 },
  infoText: { fontSize: 14, color: "#333", lineHeight: 20 },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: "#E91E63" },
  trackButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  trackButtonText: { color: "#fff", fontWeight: "600", fontSize: 16, marginLeft: 8 },
});
