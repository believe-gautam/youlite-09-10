// New file: app/pages/Profile/ShippingAddress.tsx
// Handles fetching, editing, and submitting shipping address.
// Added prune and change check logic from original.

import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService'; // Adjust path

// Allowed keys from original
const shippingAllow = [
  'first_name', 'last_name', 'company', 'address_1', 'address_2',
  'city', 'postcode', 'country', 'state', 'phone',
];

// Prune function from original
const pruneAllowedNonEmpty = (addr: Record<string, any>, allowlist: string[]) => {
  const out: Record<string, any> = {};
  allowlist.forEach((k) => {
    const v = addr[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      out[k] = v;
    }
  });
  return out;
};

const ShippingAddress = () => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  // Shipping states
  const [sFirst, setSFirst] = useState('');
  const [sLast, setSLast] = useState('');
  const [sCompany, setSCompany] = useState('');
  const [sAddr1, setSAddr1] = useState('');
  const [sAddr2, setSAddr2] = useState('');
  const [sCity, setSCity] = useState('');
  const [sPostcode, setSPostcode] = useState('');
  const [sCountry, setSCountry] = useState('');
  const [sState, setSState] = useState('');
  const [sPhone, setSPhone] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          router.replace('/Login/LoginRegisterPage');
          return;
        }
        const data = await getCustomerById(session.user.id);
        setCustomer(data);
        // Seed fields
        setSFirst(data.shipping?.first_name || '');
        setSLast(data.shipping?.last_name || '');
        setSCompany(data.shipping?.company || '');
        setSAddr1(data.shipping?.address_1 || '');
        setSAddr2(data.shipping?.address_2 || '');
        setSCity(data.shipping?.city || '');
        setSPostcode(data.shipping?.postcode || '');
        setSCountry(data.shipping?.country || '');
        setSState(data.shipping?.state || '');
        setSPhone(data.shipping?.phone || '');
      } catch (err: any) {
        console.error('Load error:', err);
        Alert.alert('Error', 'Failed to load shipping address.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const currentShipping = customer.shipping || {};
      const newShippingRaw = {
        first_name: sFirst,
        last_name: sLast,
        company: sCompany,
        address_1: sAddr1,
        address_2: sAddr2,
        city: sCity,
        postcode: sPostcode,
        country: sCountry,
        state: sState,
        phone: sPhone,
      };
      const prunedShipping = pruneAllowedNonEmpty(newShippingRaw, shippingAllow);
      const shippingChanged = Object.keys(prunedShipping).some(
        (k) => String(prunedShipping[k] || '') !== String((currentShipping as any)[k] || '')
      );
      const updates: any = {};
      if (shippingChanged && Object.keys(prunedShipping).length > 0) {
        updates.shipping = prunedShipping;
      }
      if (Object.keys(updates).length === 0) {
        Alert.alert('Info', 'No changes to save.');
        setSaving(false);
        return;
      }
      const updated = await updateCustomerById(customer.id, updates);
      setCustomer(updated);
      Alert.alert('Success', 'Shipping address updated.');
      router.back();
    } catch (err: any) {
      console.error('Update error:', err);
      Alert.alert('Error', err?.message || 'Failed to update shipping address.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.center} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shipping Address</Text>
      </View>
      <ScrollView style={styles.form}>
        <TextInput style={styles.input} placeholder="First Name" value={sFirst} onChangeText={setSFirst} />
        <TextInput style={styles.input} placeholder="Last Name" value={sLast} onChangeText={setSLast} />
        <TextInput style={styles.input} placeholder="Company" value={sCompany} onChangeText={setSCompany} />
        <TextInput style={styles.input} placeholder="Address 1" value={sAddr1} onChangeText={setSAddr1} />
        <TextInput style={styles.input} placeholder="Address 2" value={sAddr2} onChangeText={setSAddr2} />
        <TextInput style={styles.input} placeholder="City" value={sCity} onChangeText={setSCity} />
        <TextInput style={styles.input} placeholder="Postcode" value={sPostcode} onChangeText={setSPostcode} />
        <TextInput style={styles.input} placeholder="Country" value={sCountry} onChangeText={setSCountry} />
        <TextInput style={styles.input} placeholder="State" value={sState} onChangeText={setSState} />
        <TextInput style={styles.input} placeholder="Phone" value={sPhone} onChangeText={setSPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.PRIMARY,
    paddingVertical: 20, paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 20, color: Colors.WHITE, marginLeft: 16 },
  form: { padding: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 16, backgroundColor: '#fff', color: '#333',
  },
  saveButton: { backgroundColor: Colors.PRIMARY, padding: 16, borderRadius: 8, alignItems: 'center' },
  saveText: { color: Colors.WHITE, fontWeight: 'bold' },
});

export default ShippingAddress;
