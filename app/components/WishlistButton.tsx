// components/WishlistButton.tsx
// import { clearSession, getSession } from '@/lib/services/authService';
import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import {
    addProductToWishlist,
    loadWishlistItems,
    removeProductFromWishlist
} from '@/lib/services/wishlistAuth';
import { clearSession, getSession } from '@/lib/services/authService';

interface WishlistButtonProps {
  productId: number;
  size?: number;
  style?: any;
  onWishlistChange?: (isInWishlist: boolean) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 24,
  style,
  onWishlistChange
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndWishlist();
  }, [productId]);

  const checkAuthAndWishlist = async () => {
    try {
      setChecking(true);
      const session = await getSession();
      if (session?.token && session?.user) {
        setIsLoggedIn(true);
        await checkIfInWishlist();
      } else {
        setIsLoggedIn(false);
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await clearSession(); // Clear invalid session
      setIsLoggedIn(false);
      setIsInWishlist(false);
      setWishlistItemId(null);
    } finally {
      setChecking(false);
    }
  };

  const checkIfInWishlist = async () => {
    try {
      const wishlistItems = await loadWishlistItems();
      if (Array.isArray(wishlistItems)) {
        const item = wishlistItems.find((item: any) => item.product_id === productId);
        if (item) {
          setIsInWishlist(true);
          setWishlistItemId(item.id);
        } else {
          setIsInWishlist(false);
          setWishlistItemId(null);
        }
      }
    } catch (error: any) {
      console.error('Error checking wishlist:', error);
      if (error.response?.status === 401) {
        await clearSession();
        setIsLoggedIn(false);
        Alert.alert('Session Expired', 'Please log in again.');
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'Wishlist API not found. Check YITH plugin configuration.');
      }
      setIsInWishlist(false);
      setWishlistItemId(null);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      setLoading(true);
      const session = await getSession();
      if (!session?.token || !session?.user) {
        await clearSession();
        setIsLoggedIn(false);
        Alert.alert(
          'Login Required',
          'Please login to add items to your wishlist',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/Login/LoginRegisterPage') }
          ]
        );
        return;
      }

      if (isInWishlist && wishlistItemId) {
        await removeProductFromWishlist(wishlistItemId);
        setIsInWishlist(false);
        setWishlistItemId(null);
        if (onWishlistChange) onWishlistChange(false);
        Alert.alert('Success', 'Product removed from wishlist');
      } else {
        const result = await addProductToWishlist({
          product_id: productId,
          quantity: 1
        });
        if (result && result.id) {
          setIsInWishlist(true);
          setWishlistItemId(result.id);
          if (onWishlistChange) onWishlistChange(true);
          Alert.alert('Success', 'Product added to wishlist');
        }
      }
    } catch (error: any) {
      console.error('Wishlist toggle error:', error);
      if (error.response?.status === 401) {
        await clearSession();
        setIsLoggedIn(false);
        Alert.alert('Session Expired', 'Please login again.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/Login/LoginRegisterPage') }
        ]);
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'Wishlist service unavailable. Ensure YITH plugin is active and permalinks regenerated.');
      } else {
        Alert.alert('Error', error.message || 'Failed to update wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <ActivityIndicator size={size} color={Colors.PRIMARY} style={style} />;
  }

  if (!isLoggedIn) {
    return (
      <TouchableOpacity style={style} onPress={handleWishlistToggle}>
        <Ionicons name="heart-outline" size={size} color={Colors.PRIMARY} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={style} onPress={handleWishlistToggle} disabled={loading}>
      {loading ? (
        <ActivityIndicator size={size} color={Colors.PRIMARY} />
      ) : (
        <Ionicons
          name={isInWishlist ? "heart" : "heart-outline"}
          size={size}
          color={isInWishlist ? Colors.SECONDARY : Colors.PRIMARY}
        />
      )}
    </TouchableOpacity>
  );
};

export default WishlistButton;
