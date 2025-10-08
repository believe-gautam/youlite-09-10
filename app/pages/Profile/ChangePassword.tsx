// app/pages/Profile/ChangePassword.tsx
// Simple “Change Password” screen that matches the look-and-feel of the existing profile pages.
// • Three inputs: Current, New, Confirm password
// • Basic validation (non-empty, new = confirm, min length 6)
// • Integrated with WooCommerce API via updateCustomerById (assumes server verifies current password)
// • Uses Ionicons + Colors utility for consistent styling

import { getSession, updateCustomerById } from '@/lib/services/authService'; // Import your auth services
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChangePassword() {
  const router = useRouter();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      Alert.alert('Error', 'All fields are required.');
      return false;
    }
    if (newPwd.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return false;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return false;
    }
    if (newPwd === currentPwd) {
      Alert.alert('Error', 'New password must be different from current password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const session = await getSession();
      if (!session?.user?.id) {
        Alert.alert('Error', 'User session not found. Please log in again.');
        router.push('/Login/LoginRegisterPage');
        return;
      }

      // Call updateCustomerById to change password
      // Note: WooCommerce API allows updating password directly, but current password verification should be handled server-side
      // If your backend requires current password, modify the API to accept it and verify
      const response = await updateCustomerById(session.user.id, { password: newPwd });

      // Check if update was successful (adjust based on your API response structure)
      if (response && response.id) {
        console.log('Password update successful:', response);
        Alert.alert('Success', 'Password changed successfully.');
        router.back();
      } else {
        throw new Error('Password update failed on server.');
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      Alert.alert('Error', err.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        editable={!submitting}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {renderInput('Current Password', currentPwd, setCurrentPwd, 'Current password')}
        {renderInput('New Password', newPwd, setNewPwd, 'New password')}
        {renderInput('Confirm New Password', confirmPwd, setConfirmPwd, 'Confirm new password')}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginLeft: 16,
  },
  form: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: Colors.WHITE, fontSize: 16, fontWeight: '600' },
});
