// New file: app/pages/Profile/BillingAddress.tsx
// Handles fetching, editing, and submitting billing address.
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
const billingAllow = [
  'first_name', 'last_name', 'company', 'address_1', 'address_2',
  'city', 'postcode', 'country', 'state', 'email', 'phone',
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

const BillingAddress = () => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  // Billing states
  const [bFirst, setBFirst] = useState('');
  const [bLast, setBLast] = useState('');
  const [bCompany, setBCompany] = useState('');
  const [bAddr1, setBAddr1] = useState('');
  const [bAddr2, setBAddr2] = useState('');
  const [bCity, setBCity] = useState('');
  const [bPostcode, setBPostcode] = useState('');
  const [bCountry, setBCountry] = useState('');
  const [bState, setBState] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bPhone, setBPhone] = useState('');

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
        setBFirst(data.billing?.first_name || '');
        setBLast(data.billing?.last_name || '');
        setBCompany(data.billing?.company || '');
        setBAddr1(data.billing?.address_1 || '');
        setBAddr2(data.billing?.address_2 || '');
        setBCity(data.billing?.city || '');
        setBPostcode(data.billing?.postcode || '');
        setBCountry(data.billing?.country || '');
        setBState(data.billing?.state || '');
        setBEmail(data.billing?.email || '');
        setBPhone(data.billing?.phone || '');
      } catch (err: any) {
        console.error('Load error:', err);
        Alert.alert('Error', 'Failed to load billing address.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const currentBilling = customer.billing || {};
      const newBillingRaw = {
        first_name: bFirst,
        last_name: bLast,
        company: bCompany,
        address_1: bAddr1,
        address_2: bAddr2,
        city: bCity,
        postcode: bPostcode,
        country: bCountry,
        state: bState,
        email: bEmail,
        phone: bPhone,
      };
      const prunedBilling = pruneAllowedNonEmpty(newBillingRaw, billingAllow);
      const billingChanged = Object.keys(prunedBilling).some(
        (k) => String(prunedBilling[k] || '') !== String((currentBilling as any)[k] || '')
      );
      const updates: any = {};
      if (billingChanged && Object.keys(prunedBilling).length > 0) {
        updates.billing = prunedBilling;
      }
      if (Object.keys(updates).length === 0) {
        Alert.alert('Info', 'No changes to save.');
        setSaving(false);
        return;
      }
      const updated = await updateCustomerById(customer.id, updates);
      setCustomer(updated);
      Alert.alert('Success', 'Billing address updated.');
      router.back();
    } catch (err: any) {
      console.error('Update error:', err);
      Alert.alert('Error', err?.message || 'Failed to update billing address.');
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
        <Text style={styles.headerTitle}>Edit Billing Address</Text>
      </View>
      <ScrollView style={styles.form}>
        <TextInput style={styles.input} placeholder="First Name" value={bFirst} onChangeText={setBFirst} />
        <TextInput style={styles.input} placeholder="Last Name" value={bLast} onChangeText={setBLast} />
        <TextInput style={styles.input} placeholder="Company" value={bCompany} onChangeText={setBCompany} />
        <TextInput style={styles.input} placeholder="Address 1" value={bAddr1} onChangeText={setBAddr1} />
        <TextInput style={styles.input} placeholder="Address 2" value={bAddr2} onChangeText={setBAddr2} />
        <TextInput style={styles.input} placeholder="City" value={bCity} onChangeText={setBCity} />
        <TextInput style={styles.input} placeholder="Postcode" value={bPostcode} onChangeText={setBPostcode} />
        <TextInput style={styles.input} placeholder="Country" value={bCountry} onChangeText={setBCountry} />
        <TextInput style={styles.input} placeholder="State" value={bState} onChangeText={setBState} />
        <TextInput style={styles.input} placeholder="Email" value={bEmail} onChangeText={setBEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone" value={bPhone} onChangeText={setBPhone} keyboardType="phone-pad" />
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

export default BillingAddress;
