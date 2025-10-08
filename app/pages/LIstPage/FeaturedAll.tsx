import imagePath from '@/constant/imagePath';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Define types for our products
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: any;
  rating: number;
  category: string;
  brand: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

// Define types for brands
interface Brand {
  id: string;
  name: string;
  logo: any;
  productCount: number;
  featured: boolean;
}

const FeaturedAll = () => {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Function to handle adding items to cart
  const handleAddToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
  };

  // Function to check if item is in cart
  const isInCart = (productId: string) => {
    return cartItems.includes(productId);
  };

  // Brands data
  const brands: Brand[] = [
    {
      id: '1',
      name: 'Apple',
      logo: imagePath.image11, // Replace with actual brand logo
      productCount: 42,
      featured: true
    },
    {
      id: '2',
      name: 'Samsung',
      logo: imagePath.image1,
      productCount: 38,
      featured: true
    },
    {
      id: '3',
      name: 'Sony',
      logo: imagePath.image2,
      productCount: 28,
      featured: true
    },
    {
      id: '4',
      name: 'LG',
      logo: imagePath.image3,
      productCount: 25,
      featured: false
    },
    {
      id: '5',
      name: 'Dell',
      logo: imagePath.image4,
      productCount: 22,
      featured: false
    },
    {
      id: '6',
      name: 'HP',
      logo: imagePath.image5,
      productCount: 19,
      featured: false
    },
    {
      id: '7',
      name: 'Canon',
      logo: imagePath.image6,
      productCount: 16,
      featured: false
    },
    {
      id: '8',
      name: 'Bose',
      logo: imagePath.image7,
      productCount: 14,
      featured: true
    },
  ];

  // Featured products data
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 1199.99,
      originalPrice: 1299.99,
      discount: '8% OFF',
      image: imagePath.image11,
      rating: 4.9,
      category: 'Smartphones',
      brand: 'Apple',
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1099.99,
      originalPrice: 1199.99,
      discount: '8% OFF',
      image: imagePath.image1,
      rating: 4.8,
      category: 'Smartphones',
      brand: 'Samsung',
      isFeatured: true
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5 Headphones',
      price: 349.99,
      originalPrice: 399.99,
      discount: '13% OFF',
      image: imagePath.image2,
      rating: 4.8,
      category: 'Headphones',
      brand: 'Sony',
      isFeatured: true
    },
    {
      id: '4',
      name: 'MacBook Pro 16"',
      price: 2399.99,
      originalPrice: 2599.99,
      discount: '8% OFF',
      image: imagePath.image3,
      rating: 4.9,
      category: 'Laptops',
      brand: 'Apple',
    },
    {
      id: '5',
      name: 'Samsung 49" Odyssey G9',
      price: 1299.99,
      originalPrice: 1499.99,
      discount: '13% OFF',
      image: imagePath.image4,
      rating: 4.7,
      category: 'Monitors',
      brand: 'Samsung',
      isFeatured: true
    },
    {
      id: '6',
      name: 'Bose QuietComfort Earbuds',
      price: 279.99,
      originalPrice: 299.99,
      discount: '7% OFF',
      image: imagePath.image5,
      rating: 4.7,
      category: 'Headphones',
      brand: 'Bose',
    },
    {
      id: '7',
      name: 'iPad Pro 12.9"',
      price: 1099.99,
      originalPrice: 1199.99,
      discount: '8% OFF',
      image: imagePath.image6,
      rating: 4.9,
      category: 'Tablets',
      brand: 'Apple',
      isFeatured: true
    },
    {
      id: '8',
      name: 'Sony Bravia XR A80L',
      price: 1999.99,
      originalPrice: 2199.99,
      discount: '9% OFF',
      image: imagePath.image7,
      rating: 4.8,
      category: 'TVs',
      brand: 'Sony',
    },
  ];

  // Filter products by brand if a brand is selected
  const filteredProducts = selectedBrand
    ? featuredProducts.filter(product => product.brand === selectedBrand)
    : featuredProducts;

  // Render brand item
  const renderBrandItem = ({ item }: { item: Brand }) => (
    <TouchableOpacity
      style={[
        styles.brandItem,
        selectedBrand === item.name && styles.selectedBrandItem
      ]}
      onPress={() => setSelectedBrand(selectedBrand === item.name ? null : item.name)}
    >
      <View style={styles.brandLogoContainer}>
        <Image source={item.logo} style={styles.brandLogo} />
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={Colors.WHITE} />
          </View>
        )}
      </View>
      <Text style={styles.brandName}>{item.name}</Text>
      <Text style={styles.productCount}>{item.productCount} products</Text>
    </TouchableOpacity>
  );

  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productItem}>
      <View style={styles.productImageContainer}>
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
        <Image source={item.image} style={styles.productImage} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, isInCart(item.id) && styles.inCartButton]}
          onPress={() => handleAddToCart(item.id)}
        >
          {isInCart(item.id) ? (
            <View style={styles.cartButtonContent}>
              <Ionicons name="checkmark" size={14} color={Colors.WHITE} />
              <Text style={styles.addToCartText}>In Cart</Text>
            </View>
          ) : (
            <View style={styles.cartButtonContent}>
              <Ionicons name="cart" size={14} color={Colors.WHITE} />
              <Text style={styles.addToCartText}>Add</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Featured Brands</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart" size={24} color={Colors.WHITE} />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image source={imagePath.image8} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Premium Brands</Text>
            <Text style={styles.heroSubtitle}>Discover products from world's leading electronic brands</Text>
          </View>
        </View>

        {/* Brands Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Brands</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={brands.filter(brand => brand.featured)}
            renderItem={renderBrandItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsList}
          />
        </View>

        {/* All Brands Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Brands</Text>
            <Text style={styles.brandsCount}>{brands.length} brands</Text>
          </View>
          <View style={styles.allBrandsGrid}>
            {brands.map(brand => (
              <TouchableOpacity
                key={brand.id}
                style={[
                  styles.allBrandItem,
                  selectedBrand === brand.name && styles.selectedAllBrandItem
                ]}
                onPress={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
              >
                <Image source={brand.logo} style={styles.allBrandLogo} />
                <Text style={styles.allBrandName}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedBrand ? `${selectedBrand} Products` : 'Featured Products d'}
            </Text>
            <Text style={styles.productCount}>{filteredProducts.length} products</Text>
          </View>
          <View style={styles.productsGrid}>
            {filteredProducts.map(item => (
              <View key={item.id} style={styles.productColumn}>
                {renderProductItem({ item })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.WHITE,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroBanner: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.SECONDARY,
  },
  seeAllText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  brandsCount: {
    fontSize: 14,
    color: '#666',
  },
  brandsList: {
    paddingHorizontal: 16,
  },
  brandItem: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    elevation: 2,
  },
  selectedBrandItem: {
    backgroundColor: Colors.PRIMARY,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  brandLogoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  brandLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  featuredBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.PRIMARY,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: '#666',
  },
  allBrandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  allBrandItem: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  selectedAllBrandItem: {
    backgroundColor: Colors.PRIMARY,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  allBrandLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  allBrandName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#f8f8f8',
  },
  productInfo: {
    padding: 12,
  },
  brandText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  inCartButton: {
    backgroundColor: '#28a745',
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productColumn: {
    width: '48%',
    marginBottom: 16,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
});

export default FeaturedAll;