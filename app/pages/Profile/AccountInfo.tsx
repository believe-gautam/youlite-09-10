// New file: app/pages/Profile/AccountInfo.tsx
// Handles fetching, editing, and submitting account information.

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

const AccountInfo = () => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  // Edit states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

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
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmailVal(data.email || '');
        setUsername(data.username || '');
        setPhone(data.billing?.phone || data.shipping?.phone || '');
      } catch (err: any) {
        console.error('Load error:', err);
        Alert.alert('Error', 'Failed to load account info.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!customer || !emailVal) {
      Alert.alert('Validation', 'Email is required.');
      return;
    }
    setSaving(true);
    try {
      const updates: any = {};
      if (firstName !== (customer.first_name || '')) updates.first_name = firstName;
      if (lastName !== (customer.last_name || '')) updates.last_name = lastName;
      if (emailVal !== (customer.email || '')) updates.email = emailVal;
      if (username !== (customer.username || '')) updates.username = username;
      const currentPhone = customer.billing?.phone || customer.shipping?.phone || '';
      if (phone !== currentPhone) {
        // Update billing phone for simplicity, or choose based on which one exists
        updates.billing = { ...(customer.billing || {}), phone };
      }
      if (Object.keys(updates).length === 0) {
        Alert.alert('Info', 'No changes to save.');
        setSaving(false);
        return;
      }
      const updated = await updateCustomerById(customer.id, updates);
      setCustomer(updated);
      Alert.alert('Success', 'Account info updated.');
      router.back();
    } catch (err: any) {
      console.error('Update error:', err);
      Alert.alert('Error', err?.message || 'Failed to update account info.');
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
        <Text style={styles.headerTitle}>Edit Account Info</Text>
      </View>
      <ScrollView style={styles.form}>
        <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Email" value={emailVal} onChangeText={setEmailVal} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
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

export default AccountInfo;
