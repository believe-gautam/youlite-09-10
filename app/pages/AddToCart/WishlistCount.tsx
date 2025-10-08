import Colors from '@/utils/Colors';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
   count: number;
};

const WishlistCount: React.FC<Props> = ({ count }) => {
   const handlePress = () => {
      router.push('/pages/orderHistory/WishList');
   };

   return (
      <TouchableOpacity
         style={styles.container}
         onPress={handlePress}
      >
         <AntDesign name="heart" size={24} color={Colors.WHITE} />
         {count > 0 && (
            <View style={styles.badge}>
               <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
            </View>
         )}
      </TouchableOpacity>
   );
};

const styles = StyleSheet.create({
   container: {
      position: 'relative',
      marginRight: 5,
   },
   badge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: Colors.PRIMARY,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: Colors.WHITE,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
   },
   badgeText: {
      color: Colors.WHITE,
      fontSize: 12,
      fontWeight: 'bold',
   },
});

export default WishlistCount;