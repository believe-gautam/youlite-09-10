// Modified app/(tabs)/Profile.tsx
// Enhanced UI with better icons, improved layout, and additional features
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

import {
  clearSession,
  getCustomerById,
  getSession,
  updateCustomerById,
} from '@/lib/services/authService';
import Loading from '../components/Loading';

// Types
type WCAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  state?: string;
  email?: string;
  phone?: string;
};

type WCMeta = { id?: number; key: string; value: any };

type WCCustomer = {
  id: number;
  date_created?: string;
  date_created_gmt?: string;
  date_modified?: string;
  date_modified_gmt?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  username?: string;
  billing?: WCAddress;
  shipping?: WCAddress;
  is_paying_customer?: boolean;
  avatar_url?: string;
  meta_data?: WCMeta[];
};

type StoredSession = {
  user: {
    id: number;
    email: string;
    name?: string;
    first_name?: string;
    last_name?: string;
  };
  token?: string;
};

// Utils
const formatJoinDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const month = d.toLocaleString(undefined, { month: 'long' });
  const year = d.getFullYear();
  return `Member since ${month} ${year}`;
};

const initialsFrom = (name: string, email?: string) => {
  const trimmed = (name || '').trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
  }
  if (email) return (email || '?').toUpperCase();
  return '?';
};

const Row = ({ label, value }: { label: string; value?: string | number | boolean }) => (
  <View style={styles.infoItem}>
    <Text style={[styles.infoText, { flex: 1, color: '#666' }]}>{label}</Text>
    <Text style={[styles.infoText, { textAlign: 'right' }]}>{value === '' || value === undefined ? '—' : String(value)}</Text>
  </View>
);

// Helpers
const findMeta = (meta: WCMeta[] | undefined, key: string) =>
  (meta || []).find((m) => m.key === key);

const upsertMeta = (meta: WCMeta[] | undefined, key: string, value: any): WCMeta[] => {
  const list = Array.isArray(meta) ? [...meta] : [];
  const existingIdx = list.findIndex((m) => m.key === key);
  if (existingIdx >= 0) {
    list[existingIdx] = { id: list[existingIdx].id, key, value };
  } else {
    list.push({ key, value });
  }
  return list;
};

const ensureString = (v: any) => (typeof v === 'string' ? v : '');

const dataUrlFrom = (mime: string, base64: string) => `data:${mime};base64,${base64}`;

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<WCCustomer | null>(null);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [navigated, setNavigated] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [expandedBilling, setExpandedBilling] = useState(false);
  const [expandedShipping, setExpandedShipping] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const userSession = await getSession();
      if (!userSession?.user?.id) {
        if (!navigated) {
          setNavigated(true);
          // setTimeout(() => router.replace('/Login/LoginRegisterPage'), 0);
          setTimeout(() => router.replace('/Login/MobileRegistrationScreen'), 0);
        }
        return;
      }
      setSession(userSession);
      const data = await getCustomerById(userSession.user.id);
      const avatarMeta = findMeta(data.meta_data, 'avatar_file');
      const metaVal = ensureString(avatarMeta?.value);
      if (metaVal) {
        data.avatar_url = metaVal;
      } else if (!data.avatar_url) {
        data.avatar_url = '';
      }
      setCustomer(data);
    } catch (err: any) {
      console.log('Profile refresh error:', err?.message || err);
    }
  }, [navigated]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      await refreshProfile();
      if (isMounted) setLoading(false);
    })();
    return () => { isMounted = false; };
  }, [refreshProfile]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const display = useMemo(() => {
    if (!customer && session) {
      return {
        name: session.user.name || `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim() || session.user.email,
        email: session.user.email,
        avatar: '',
        joinDate: '',
        phone: ''
      };
    }
    const email = customer?.email || '';
    const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.username || email;
    const avatar = ensureString(customer?.avatar_url);
    const joinDate = formatJoinDate(customer?.date_created);
    const phone = customer?.billing?.phone || customer?.shipping?.phone || '';
    return { name, email, avatar, joinDate, phone };
  }, [customer, session]);

  const onLogout = async () => {
    try {
      await clearSession();
      if (!navigated) {
        setNavigated(true);
        setTimeout(() => router.replace('/Login/LoginRegisterPage'), 0);
      }
    } catch {
      Alert.alert('Error', 'Failed to logout, please try again.');
    }
  };

  const onChangeAvatar = async () => {
    if (!customer) return;
    try {
      if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== 'function') {
        throw new Error('Image picker not available.');
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to update your profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
      });
      const anyResult = result as any;
      if (anyResult.canceled || !anyResult.assets || anyResult.assets.length === 0) {
        return;
      }
      const asset = anyResult.assets[0];
      const uri: string = asset.uri;
      const inferredMime =
        asset.mimeType ||
        (uri.endsWith('.png') ? 'image/png' :
          uri.endsWith('.webp') ? 'image/webp' :
            'image/jpeg');
      setUploadingAvatar(true);
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const dataUrl = dataUrlFrom(inferredMime, base64);
      const updatedMeta = upsertMeta(customer.meta_data, 'avatar_file', dataUrl);
      const updates: any = {
        avatar_url: dataUrl,
        meta_data: updatedMeta.map((m) => (m.id ? { id: m.id, key: m.key, value: m.value } : { key: m.key, value: m.value })),
      };
      const updated = await updateCustomerById(customer.id, updates);
      const persistedFile = findMeta(updated.meta_data, 'avatar_file');
      const persistedVal = ensureString(persistedFile?.value);
      updated.avatar_url = persistedVal || ensureString(updated.avatar_url);
      setCustomer(updated);
      Alert.alert('Success', 'Profile picture updated.');
    } catch (err: any) {
      console.log('Avatar update error:', err?.response?.status || 0, err?.message || err);
      Alert.alert('Error', err?.message || 'Failed to update profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Loading />
        <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '600', color: Colors.SECONDARY }}>
          Loading your Profile
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>No user session found.</Text>
        <TouchableOpacity onPress={() => router.replace('/Login/LoginRegisterPage')} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }


  const hasAvatar = typeof display.avatar === 'string' && display.avatar.trim().length > 0;

  const toggleAccordion = (section: 'billing' | 'shipping') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'billing') {
      setExpandedBilling(!expandedBilling);
    } else {
      setExpandedShipping(!expandedShipping);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="person-circle-outline" size={28} color={Colors.WHITE} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        {/* <TouchableOpacity onPress={() => router.push('/pages/Setting/Setting')}>
          <Ionicons name="settings-outline" size={24} color={Colors.WHITE} />
        </TouchableOpacity> */}
        <View></View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {hasAvatar ? (
              <Image source={{ uri: display.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={{ color: Colors.WHITE, fontWeight: 'bold', fontSize: 24 }}>
                  {initialsFrom(display.name, display.email)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editIcon} onPress={onChangeAvatar} disabled={uploadingAvatar}>
              <Ionicons name={uploadingAvatar ? 'cloud-upload-outline' : 'camera-outline'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{display.name}</Text>
          <Text style={styles.userEmail}>{display.email}</Text>
          <Text style={styles.userJoinDate}>{display.joinDate}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.PRIMARY} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/pages/Profile/AccountInfo')}>
              <Ionicons name="pencil-outline" size={20} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{display.name}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{display.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="at-circle-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{customer?.username || '—'}</Text>
          </View>

          <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{display.phone || '—'}</Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="location-outline" size={20} color={Colors.PRIMARY} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Addresses</Text>
            </View>
          </View>

          {/* Billing Address */}
          <View style={styles.accordionItem}>
            <View style={styles.accordionHeader}>
              <View style={styles.accordionTitleContainer}>
                <Ionicons name="card-outline" size={18} color="#666" style={styles.accordionIcon} />
                <Text style={styles.accordionTitle}>Billing Address</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.push('/pages/Profile/BillingAddress')} style={{ marginRight: 16 }}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleAccordion('billing')}>
                  <Ionicons name={expandedBilling ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            {expandedBilling && (
              <View style={styles.accordionContent}>
                <Row label="First name" value={customer?.billing?.first_name || ''} />
                <Row label="Last name" value={customer?.billing?.last_name || ''} />
                <Row label="Company" value={customer?.billing?.company || ''} />
                <Row label="Address 1" value={customer?.billing?.address_1 || ''} />
                <Row label="Address 2" value={customer?.billing?.address_2 || ''} />
                <Row label="City" value={customer?.billing?.city || ''} />
                <Row label="Postcode" value={customer?.billing?.postcode || ''} />
                <Row label="Country" value={customer?.billing?.country || ''} />
                <Row label="State" value={customer?.billing?.state || ''} />
                <Row label="Email" value={customer?.billing?.email || ''} />
                <Row label="Phone" value={customer?.billing?.phone || ''} />
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Shipping Address */}
          <View style={styles.accordionItem}>
            <View style={styles.accordionHeader}>
              <View style={styles.accordionTitleContainer}>
                <Ionicons name="car-outline" size={18} color="#666" style={styles.accordionIcon} />
                <Text style={styles.accordionTitle}>Shipping Address</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.push('/pages/Profile/ShippingAddress')} style={{ marginRight: 16 }}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleAccordion('shipping')}>
                  <Ionicons name={expandedShipping ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            {expandedShipping && (
              <View style={styles.accordionContent}>
                <Row label="First name" value={customer?.shipping?.first_name || ''} />
                <Row label="Last name" value={customer?.shipping?.last_name || ''} />
                <Row label="Company" value={customer?.shipping?.company || ''} />
                <Row label="Address 1" value={customer?.shipping?.address_1 || ''} />
                <Row label="Address 2" value={customer?.shipping?.address_2 || ''} />
                <Row label="City" value={customer?.shipping?.city || ''} />
                <Row label="Postcode" value={customer?.shipping?.postcode || ''} />
                <Row label="Country" value={customer?.shipping?.country || ''} />
                <Row label="State" value={customer?.shipping?.state || ''} />
                <Row label="Phone" value={customer?.shipping?.phone || ''} />
              </View>
            )}
          </View>
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="key-outline" size={20} color={Colors.PRIMARY} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Account Management</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/pages/Profile/About')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="information-circle-outline" size={22} style={styles.sectionIcon} />
            </View>
            <Text style={styles.settingText}>About Us</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/pages/Profile/ChangePassword')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="lock-closed-outline" size={22} style={styles.sectionIcon} />
            </View>
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/pages/orderHistory/orderHistory')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="bag-handle-outline" size={22} style={styles.sectionIcon} />
            </View>
            <Text style={styles.settingText}>Order History</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>


        {/* Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="help-buoy-outline" size={20} color={Colors.PRIMARY} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Support</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/pages/Profile/Contact')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={22} style={styles.sectionIcon} />
            </View>
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>



          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/pages/Profile/Feedback')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} style={styles.sectionIcon} />
            </View>
            <Text style={styles.settingText}>Send Feedback</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 0
  },
  scrollContent: {
    padding: 6,
    paddingBottom: 32
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,

  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f0f0f0'
  },
  avatarFallback: {
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    borderRadius: 60
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PRIMARY,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center'
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center'
  },
  userJoinDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionIcon: {
    marginRight: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 12,
    width: 24
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  accordionItem: {
    marginBottom: 8
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  accordionIcon: {
    marginRight: 8,
    width: 20
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  accordionContent: {
    paddingTop: 8,
    paddingLeft: 28
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
});

export default ProfileScreen;
