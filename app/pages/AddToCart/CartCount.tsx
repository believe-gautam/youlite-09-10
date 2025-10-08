import imagePath from '@/constant/imagePath';
import Colors from '@/utils/Colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CartCountProps {
  count: number;
}

const CartCount: React.FC<CartCountProps> = ({ count }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/CartScreen')}>
        <Image
          source={imagePath.icon1}
          style={styles.cartIcon}
        />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.countText}>
              {count > 99 ? '99+' : count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CartCount;

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  cartIcon: {
    width: 40,
    height: 40,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.PRIMARY,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
