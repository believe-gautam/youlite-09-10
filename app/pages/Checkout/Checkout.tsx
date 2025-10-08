import { getProductDetail } from '@/lib/api/productApi';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import { createOrder, createRazorpayOrder, processRazorpayPayment } from '@/lib/services/orderService';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ---------- TYPES ---------- */
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: { uri: string };
  quantity: number;
}

interface Address {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

/* ✅ SEPARATE MEMOIZED INPUT COMPONENT */
const AddressInput = memo(({ 
  field,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  error,
}: {
  field: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType: any;
  error: string | null;
}) => {
  return (
    <View>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="next"
        blurOnSubmit={false}
        keyboardType={keyboardType}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

AddressInput.displayName = 'AddressInput';

/* =================================================================== */
const Checkout: React.FC = () => {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<Address | null>(null);
  const [billing, setBilling] = useState<Address | null>(null);
  const [sameAddress, setSameAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'shipping' | 'billing'>('shipping');
  const [editShipping, setEditShipping] = useState(false);
  const [editBilling, setEditBilling] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState('');

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = 0;
  const total = subtotal + delivery;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = async () => {
    console.log('=== LOAD DATA STARTED ===');
    try {
      setLoading(true);
      console.log('📱 Getting session...');
      const session = await getSession();
      console.log('Session:', session);
      
      if (!session?.user?.id) {
        console.error('❌ No session or user ID found');
        setLoading(false);
        router.replace('/Login/LoginRegisterPage');
        return;
      }
      
      setUserId(session.user.id);
      console.log('✅ User ID set:', session.user.id);

      console.log('👤 Fetching customer details...');
      const customer = await getCustomerById(session.user.id);
      console.log('Customer data:', customer);
      
      console.log('📍 Shipping address:', customer?.shipping);
      console.log('📍 Billing address:', customer?.billing);
      
      setShipping(customer?.shipping || null);
      setBilling(customer?.billing || null);

      if (params.buyNow === 'true' && params.productId && params.quantity) {
        console.log('🛍️ BUY NOW mode');
        console.log('Product ID:', params.productId);
        console.log('Quantity:', params.quantity);
        
        const res = await getProductDetail(params.productId as string);
        console.log('Product details:', res?.data);
        
        const p = res?.data;
        if (p) {
          const item = {
            id: String(p.id),
            name: p.name,
            price: parseFloat(p.sale_price || p.price) || 0,
            image: { uri: p.images?.[0]?.src || 'https://via.placeholder.com/80' },
            quantity: parseInt(params.quantity as string) || 1,
          };
          console.log('✅ Buy Now item added:', item);
          setCartItems([item]);
        } else {
          console.error('❌ Product not found');
        }
      } else {
        console.log('🛒 CART mode');
        const meta = customer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
        console.log('Cart meta data:', meta);
        console.log('Cart items count:', meta.length);
        
        const items: CartItem[] = [];
        for (const { id, quantity } of meta) {
          try {
            console.log(`Fetching product ${id}...`);
            const res = await getProductDetail(id);
            const p = res?.data;
            if (!p) {
              console.warn(`Product ${id} not found`);
              continue;
            }
            const item = {
              id: String(p.id),
              name: p.name,
              price: parseFloat(p.sale_price || p.price) || 0,
              image: { uri: p.images?.[0]?.src || 'https://via.placeholder.com/80' },
              quantity: quantity || 1,
            };
            console.log(`✅ Product ${id} added:`, item);
            items.push(item);
          } catch (e) {
            console.error(`❌ Failed to load product ${id}:`, e);
          }
        }
        console.log('✅ Total cart items loaded:', items.length);
        setCartItems(items);
      }
    } catch (e) {
      console.error('❌ loadData error:', e);
      showToast('Failed to load checkout data');
    } finally {
      setLoading(false);
      console.log('=== LOAD DATA ENDED ===');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Validation helper functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validatePostcode = (postcode: string): boolean => {
    const postcodeRegex = /^[1-9][0-9]{5}$/;
    return postcodeRegex.test(postcode);
  };

  const validateAddress = (addr: Address | null, type: string): string | null => {
    if (!addr) return `${type} address is required`;
    
    if (!addr.first_name?.trim()) return 'First name is required';
    if (!addr.last_name?.trim()) return 'Last name is required';
    if (!addr.address_1?.trim()) return 'Address line 1 is required';
    if (!addr.city?.trim()) return 'City is required';
    if (!addr.state?.trim()) return 'State is required';
    if (!addr.postcode?.trim()) return 'Postcode is required';
    if (!validatePostcode(addr.postcode)) return 'Invalid postcode format (6 digits required)';
    if (!addr.country?.trim()) return 'Country is required';
    if (!addr.email?.trim()) return 'Email is required';
    if (!validateEmail(addr.email)) return 'Invalid email format';
    if (!addr.phone?.trim()) return 'Phone number is required';
    if (!validatePhone(addr.phone)) return 'Invalid phone number (10 digits required)';
    
    return null;
  };

  const getInputError = (addr: Address | null, field: keyof Address): string | null => {
    if (!addr || !addr[field]) return null;
    
    const value = addr[field];
    
    switch (field) {
      case 'email':
        return value && !validateEmail(value) ? 'Invalid email' : null;
      case 'phone':
        return value && !validatePhone(value) ? 'Invalid phone (10 digits)' : null;
      case 'postcode':
        return value && !validatePostcode(value) ? 'Invalid PIN (6 digits)' : null;
      default:
        return null;
    }
  };

  const saveAddress = async (type: 'shipping' | 'billing') => {
    if (!userId) return;
    const addr = type === 'shipping' ? shipping : billing;
    
    const validationError = validateAddress(addr, type);
    if (validationError) {
      showToast(validationError);
      return;
    }
    
    try {
      await updateCustomerById(userId, { [type]: addr });
      showToast('Address saved successfully');
      type === 'shipping' ? setEditShipping(false) : setEditBilling(false);
    } catch (e) {
      console.error('Save address error', e);
      showToast('Failed to save address');
    }
  };

  const placeOrder = async () => {
    console.log('=== PLACE ORDER STARTED ===');
    
    if (!userId) {
      console.error('❌ No userId found');
      showToast('User session expired. Please login again');
      return;
    }
    console.log('✅ User ID:', userId);

    if (cartItems.length === 0) {
      console.error('❌ Cart is empty');
      showToast('Your cart is empty');
      return;
    }
    console.log('✅ Cart items:', cartItems.length);

    const shippingError = validateAddress(shipping, 'Shipping');
    if (shippingError) {
      console.error('❌ Shipping validation failed:', shippingError);
      showToast(shippingError);
      setActiveTab('shipping');
      return;
    }
    console.log('✅ Shipping address validated');

    const billingError = validateAddress(billing, 'Billing');
    if (billingError) {
      console.error('❌ Billing validation failed:', billingError);
      showToast(billingError);
      setActiveTab('billing');
      return;
    }
    console.log('✅ Billing address validated');

    setPlacingOrder(true);
    let wooCommerceOrderId: number | null = null;

    try {
      // Step 1: Create WooCommerce Order
      console.log('📦 STEP 1: Creating WooCommerce Order...');
      const orderPayload = {
        customer_id: userId,
        payment_method: "razorpay",
        payment_method_title: "Razorpay",
        set_paid: false,
        status: 'pending',
        billing: billing,
        shipping: shipping,
        line_items: cartItems.map((item) => ({
          product_id: Number(item.id),
          quantity: item.quantity,
        })),
        shipping_lines: [
          {
            method_id: "flat_rate",
            method_title: "Flat Rate",
            total: String(delivery),
          },
        ],
      };
      console.log('Order Payload:', JSON.stringify(orderPayload, null, 2));

      const wooCommerceOrder = await createOrder(orderPayload);
      console.log('WooCommerce Order Response:', wooCommerceOrder);
      
      if (!wooCommerceOrder?.id) {
        console.error('❌ No order ID in response');
        throw new Error('Failed to create order');
      }

      wooCommerceOrderId = wooCommerceOrder.id;
      console.log('✅ WooCommerce Order Created. ID:', wooCommerceOrderId);
      const order_id = `order_${wooCommerceOrder.id}`;//_${Date.now()}_${wooCommerceOrderId}`;

      // Step 2: Create Razorpay Order
      console.log('💳 STEP 2: Creating Razorpay Order...');
      const razorpayOrderPayload = {
        amount: Math.round(total * 100), // Amount in paise, ensure integer
        currency: 'INR',
        receipt: `order_${wooCommerceOrder.id}_${Date.now()}`,
        notes: {
          woo_order_id: wooCommerceOrder.id.toString(),
          customer_id: userId.toString(),
        }
      };
      console.log('Razorpay Order Payload:', JSON.stringify(razorpayOrderPayload, null, 2));

      const razorpayOrder = await createRazorpayOrder(razorpayOrderPayload);
      console.log('Razorpay Order Response:', razorpayOrder);
      
      if (!razorpayOrder?.id) {
        console.error('❌ No Razorpay order ID in response');
        throw new Error('Failed to create Razorpay order');
      }
      console.log('✅ Razorpay Order Created. ID:', razorpayOrder.id);

      // Step 3: Prepare Razorpay Checkout Options
      console.log('🔐 STEP 3: Preparing Razorpay Checkout...');
      
      // Clean and validate phone number
      const cleanPhone = billing?.phone?.replace(/\D/g, '') || '';
      const validPhone = cleanPhone.length === 10 ? cleanPhone : '9999999999';
      
      // Validate email
      const validEmail = billing?.email && validateEmail(billing.email) 
        ? billing.email 
        : 'customer@example.com';
      
      // Clean name
      const fullName = `${billing?.first_name || ''} ${billing?.last_name || ''}`.trim();
      const validName = fullName || 'Customer';

      console.log('Prefill Data:', {
        email: validEmail,
        contact: validPhone,
        name: validName
      });
      console.log({order_id,order_id2:wooCommerceOrder.id})

      const options = {
        description: `Order #${wooCommerceOrder.id}`,
        image: 'https://youlite.in/wp-content/uploads/2022/06/short-logo.png',
        currency: 'INR',

        // Razorpay Live Key :  rzp_live_RNs9lqLuduxCWX  
        // Razorpay Test Key : rzp_test_ROuqm8IgPPhMf2 
        key: 'rzp_test_ROuqm8IgPPhMf2',// EXPO_PUBLIC_RAZORPAY_KEY_ID, //'rzp_test_ROuqm8IgPPhMf2',// 'rzp_live_RLljcmIjPif8dk', // 
        amount: Math.round(total * 100).toString(), // Must be string
        name: 'YouLite Store',
        order_id: wooCommerceOrder.id,
        prefill: {
          email: validEmail,
          contact: validPhone,
          name: validName
        },
        theme: { 
          color: Colors.PRIMARY 
        },
        notes: {
          woo_order_id: wooCommerceOrder.id.toString(),
          customer_id: userId.toString()
        }
      };
      

      console.log('Razorpay Checkout Options:', JSON.stringify(options, null, 2));
      console.log('🚀 Opening Razorpay Checkout...');

      const paymentData = await RazorpayCheckout.open(options);
      console.log('✅ Payment Success:', paymentData);

      // Step 4: Verify payment on backend
      console.log('🔍 STEP 4: Verifying payment on backend...');
      const verificationPayload = {
        order_id: wooCommerceOrder.id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature
      };
      console.log('Verification Payload:', verificationPayload);

      await processRazorpayPayment(verificationPayload);
      console.log('✅ Payment verified successfully');

      // Step 5: Clear cart (only if not buy now)
      if (params.buyNow !== 'true') {
        console.log('🛒 STEP 5: Clearing cart...');
        await updateCustomerById(userId, { 
          meta_data: [{ key: 'cart', value: [] }] 
        });
        console.log('✅ Cart cleared');
      } else {
        console.log('ℹ️ Buy Now mode - Cart not cleared');
      }

      showToast('Order placed successfully!');
      console.log('🎉 ORDER COMPLETED SUCCESSFULLY!');
      
      setTimeout(() => {
        router.replace({
          pathname: '/pages/orderHistory/orderHistory',
          params: { 
            orderId: wooCommerceOrder.id.toString()
          }
        });
      }, 1500);

    } catch (error: any) {
      console.error('❌ PAYMENT ERROR:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Handle Razorpay specific errors
      if (error.error) {
        const errorCode = error.error.code;
        const errorDescription = error.error.description;
        const errorReason = error.error.reason;
        const errorSource = error.error.source;
        const errorStep = error.error.step;
        
        console.error('Razorpay Error Details:', {
          code: errorCode,
          description: errorDescription,
          reason: errorReason,
          source: errorSource,
          step: errorStep
        });
        
        switch (errorCode) {
          case 0: // Network error
            showToast('Network error. Please check your connection and try again');
            break;
          case 1: // Razorpay error
            showToast(`Payment error: ${errorDescription || errorReason || 'Something went wrong'}`);
            break;
          case 2: // User cancelled
            showToast('Payment cancelled');
            break;
          default:
            showToast(`Payment failed: ${errorDescription || errorReason || 'Unknown error'}`);
        }
      } else if (error.message) {
        console.error('Error message:', error.message);
        showToast(error.message);
      } else {
        console.error('Unknown error type');
        showToast('Failed to process payment. Please try again.');
      }

      // If order was created but payment failed, you might want to handle it
      if (wooCommerceOrderId) {
        console.log('⚠️ Order created but payment failed. Order ID:', wooCommerceOrderId);
        // Optionally update order status to 'failed' or 'cancelled'
      }
    } finally {
      setPlacingOrder(false);
      console.log('=== PLACE ORDER ENDED ===');
    }
  };

  // ✅ FIXED: Separate handlers for shipping and billing
  const handleShippingChange = useCallback((field: keyof Address, value: string) => {
    setShipping(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      
      // If same address is enabled, also update billing
      if (sameAddress) {
        setBilling(updated);
      }
      
      return updated;
    });
  }, [sameAddress]);

  const handleBillingChange = useCallback((field: keyof Address, value: string) => {
    setBilling(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleSameAddressToggle = useCallback((value: boolean) => {
    setSameAddress(value);
    if (value && shipping) {
      setBilling({ ...shipping });
    }
  }, [shipping]);

  // ✅ FIXED: Generate unique keys using index to avoid duplicate key errors
  const addrLines = (addr: Address | null) => {
    if (!addr) return [];
    
    const lines = [
      `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
      addr.company,
      addr.address_1,
      addr.address_2,
      `${addr.city || ''}${addr.state ? ', ' + addr.state : ''} ${addr.postcode || ''}`.trim(),
      addr.country,
      addr.email,
      addr.phone,
    ].filter(line => line && line.trim() !== '');
    
    return lines;
  };

  const AddressDisplay = ({ addr }: { addr: Address | null }) => {
    const lines = addrLines(addr);
    
    return (
      <>
        {lines.length === 0 ? (
          <Text style={styles.addrLine}>No address saved</Text>
        ) : (
          lines.map((line, index) => (
            <Text key={`addr-${index}-${line.substring(0, 10)}`} style={styles.addrLine}>
              {line}
            </Text>
          ))
        )}
      </>
    );
  };

  // ✅ Address field configuration
  const addressFields: Array<[keyof Address, string, any]> = [
    ['first_name', 'First Name*', 'default'],
    ['last_name', 'Last Name*', 'default'],
    ['company', 'Company (Optional)', 'default'],
    ['address_1', 'Address Line 1*', 'default'],
    ['address_2', 'Address Line 2 (Optional)', 'default'],
    ['city', 'City*', 'default'],
    ['state', 'State*', 'default'],
    ['postcode', 'Postcode* (6 digits)', 'numeric'],
    ['country', 'Country*', 'default'],
    ['email', 'Email*', 'email-address'],
    ['phone', 'Phone* (10 digits)', 'phone-pad'],
  ];

  const renderTabContent = () => {
    const isShipping = activeTab === 'shipping';
    const addr = isShipping ? shipping : billing;
    const isEditing = isShipping ? editShipping : editBilling;
    const handleChange = isShipping ? handleShippingChange : handleBillingChange;

    if (!isEditing) {
      return <AddressDisplay addr={addr} />;
    }

    if (!addr) return null;

    return (
      <>
        {addressFields.map(([field, placeholder, keyboardType]) => (
          <AddressInput
            key={field}
            field={field}
            placeholder={placeholder}
            value={addr[field] || ''}
            onChangeText={(text) => handleChange(field, text)}
            keyboardType={keyboardType}
            error={getInputError(addr, field)}
          />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* MAIN SCROLL */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* ORDER ITEMS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {cartItems.length === 0 ? (
              <Text style={{ color: '#666' }}>Your cart is empty</Text>
            ) : (
              cartItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Image source={item.image} style={styles.itemImg} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.qtyTxt}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.priceTxt}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* ADDRESS TABS */}
          <View style={styles.section}>
            <View style={styles.tabsRow}>
              {(['shipping', 'billing'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabTxt,
                      activeTab === tab && styles.tabTxtActive,
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.checkboxRow}>
              <Switch
                value={sameAddress}
                onValueChange={handleSameAddressToggle}
                trackColor={{ false: '#ccc', true: Colors.PRIMARY + '77' }}
                thumbColor={sameAddress ? Colors.PRIMARY : '#f4f3f4'}
              />
              <Text style={styles.checkboxLabel}>
                Billing same as Shipping
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                activeTab === 'shipping'
                  ? setEditShipping((p) => !p)
                  : setEditBilling((p) => !p)
              }
            >
              <Text style={styles.editTxt}>
                {(activeTab === 'shipping' ? editShipping : editBilling)
                  ? 'Cancel'
                  : 'Edit Address'}
              </Text>
            </TouchableOpacity>

            {renderTabContent()}

            {((activeTab === 'shipping' && editShipping) ||
              (activeTab === 'billing' && editBilling)) && (
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => saveAddress(activeTab)}
                >
                  <Text style={styles.saveTxt}>Save</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* SUMMARY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            {[
              ['Subtotal', subtotal],
              ['Delivery', delivery],
              ['Total', total],
            ].map(([lbl, val]) => (
              <View key={lbl} style={styles.sumRow}>
                <Text style={lbl === 'Total' ? styles.sumBold : undefined}>
                  {lbl}
                </Text>
                <Text style={lbl === 'Total' ? styles.sumBold : undefined}>
                  ₹{(val as number).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom button with safe area insets */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.placeBtn, (placingOrder || cartItems.length === 0) && { opacity: 0.5 }]}
            onPress={placeOrder}
            disabled={placingOrder || cartItems.length === 0}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeTxt}>Pay ₹{total.toLocaleString()}</Text>
            )}
          </TouchableOpacity>
        </View>

        {toast && (
          <View style={[styles.toast, { bottom: Math.max(insets.bottom, 16) + 70 }]}>
            <Text style={styles.toastTxt}>{toast}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Checkout;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
  headerTitle: { color: Colors.WHITE, fontSize: 20, fontWeight: 'bold' },

  section: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },

  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemImg: { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  qtyTxt: { fontSize: 12, color: '#666' },
  priceTxt: { fontSize: 14, fontWeight: '600' },

  tabsRow: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabBtnActive: { borderColor: Colors.PRIMARY },
  tabTxt: { color: '#666', fontSize: 14 },
  tabTxtActive: { color: Colors.PRIMARY, fontWeight: '600' },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#333' },

  editBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  editTxt: { color: Colors.PRIMARY, fontWeight: '600' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 6, 
    padding: 10, 
    marginBottom: 4,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  addrLine: { color: '#333', lineHeight: 22 },
  saveBtn: { backgroundColor: Colors.PRIMARY, padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  saveTxt: { color: Colors.WHITE, fontWeight: 'bold' },

  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sumBold: { fontWeight: '700' },

  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  placeBtn: { 
    backgroundColor: Colors.PRIMARY, 
    padding: 16, 
    alignItems: 'center',
    borderRadius: 8,
  },
  placeTxt: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' },

  toast: { 
    position: 'absolute', 
    left: 20, 
    right: 20, 
    backgroundColor: '#333', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  toastTxt: { color: '#fff' },
});