import imagePath from '@/constant/imagePath';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const { width } = Dimensions.get('window');

// Define types for our products
interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: string;
    image: any;
    rating: number;
    category?: string;
}

const OfferPage = () => {
    const [cartItems, setCartItems] = useState<string[]>([]);

    // Function to handle adding items to cart
    const handleAddToCart = (productId: string) => {
        setCartItems(prev => [...prev, productId]);
    };

    // Function to check if item is in cart
    const isInCart = (productId: string) => {
        return cartItems.includes(productId);
    };

    // Featured products for horizontal scrolling
    const featuredProducts: Product[] = [
        {
            id: '1',
            name: 'Nike Air Max',
            price: 89.99,
            originalPrice: 119.99,
            discount: '25% OFF',
            image: imagePath.image11,
            rating: 4.8,
        },
        {
            id: '2',
            name: 'Adidas Ultraboost',
            price: 129.99,
            originalPrice: 159.99,
            discount: '19% OFF',
            image: imagePath.image1,
            rating: 4.7,
        },
        {
            id: '3',
            name: 'Puma RS-X',
            price: 79.99,
            originalPrice: 99.99,
            discount: '20% OFF',
            image: imagePath.image2,
            rating: 4.5,
        },
        {
            id: '4',
            name: 'New Balance 574',
            price: 69.99,
            originalPrice: 89.99,
            discount: '22% OFF',
            image: imagePath.image3,
            rating: 4.6,
        },
    ];

    // All products for vertical scrolling
    const allProducts: Product[] = [
        {
            id: '5',
            name: 'Summer T-Shirt',
            price: 24.99,
            originalPrice: 34.99,
            discount: '29% OFF',
            image: imagePath.image4,
            rating: 4.3,
            category: 'Clothing',
        },
        {
            id: '6',
            name: 'Denim Jacket',
            price: 59.99,
            originalPrice: 79.99,
            discount: '25% OFF',
            image: imagePath.image5,
            rating: 4.4,
            category: 'Clothing',
        },
        {
            id: '7',
            name: 'Sports Shorts',
            price: 29.99,
            originalPrice: 39.99,
            discount: '25% OFF',
            image: imagePath.image6,
            rating: 4.2,
            category: 'Clothing',
        },
        {
            id: '8',
            name: 'Casual Sneakers',
            price: 49.99,
            originalPrice: 69.99,
            discount: '29% OFF',
            image: imagePath.image7,
            rating: 4.5,
            category: 'Footwear',
        },
        {
            id: '9',
            name: 'Baseball Cap',
            price: 19.99,
            originalPrice: 24.99,
            discount: '20% OFF',
            image: imagePath.image8,
            rating: 4.1,
            category: 'Accessories',
        },
        {
            id: '10',
            name: 'Running Shoes',
            price: 89.99,
            originalPrice: 119.99,
            discount: '25% OFF',
            image: imagePath.image9,
            rating: 4.7,
            category: 'Footwear',
        },
        {
            id: '11',
            name: 'Backpack',
            price: 39.99,
            originalPrice: 49.99,
            discount: '20% OFF',
            image: imagePath.image10,
            rating: 4.4,
            category: 'Accessories',
        },
    ];

    const renderFeaturedItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.featuredItem}>
            <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}</Text>
            </View>
            <Image source={item.image} style={styles.featuredImage} />
            <View style={styles.featuredInfo}>
                <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                </View>

                {/* Add to Cart Button for Featured Items */}
                <TouchableOpacity
                    style={[styles.addToCartButton, isInCart(item.id) && styles.inCartButton]}
                    onPress={() => handleAddToCart(item.id)}
                >
                    {isInCart(item.id) ? (
                        <View style={styles.cartButtonContent}>
                            <Ionicons name="checkmark" size={16} color={Colors.WHITE} />
                            <Text style={styles.addToCartText}>In Cart</Text>
                        </View>
                    ) : (
                        <View style={styles.cartButtonContent}>
                            <Ionicons name="cart" size={16} color={Colors.WHITE} />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.productItem}>
            <View style={styles.productImageContainer}>
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                </View>
                <Image source={item.image} style={styles.productImage} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                {item.category && (
                    <Text style={styles.productCategory}>{item.category}</Text>
                )}
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                </View>

                {/* Add to Cart Button for Product Items */}
                <TouchableOpacity
                    style={[styles.addToCartButton, isInCart(item.id) && styles.inCartButton]}
                    onPress={() => handleAddToCart(item.id)}
                >
                    {isInCart(item.id) ? (
                        <View style={styles.cartButtonContent}>
                            <Ionicons name="checkmark" size={16} color={Colors.WHITE} />
                            <Text style={styles.addToCartText}>In Cart</Text>
                        </View>
                    ) : (
                        <View style={styles.cartButtonContent}>
                            <Ionicons name="cart" size={16} color={Colors.WHITE} />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header - Matching your previous design */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Special Offers</Text>

            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Banner Section */}
                <View style={styles.bannerContainer}>
                    <Image source={imagePath.image11} style={styles.bannerImage} />
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerTitle}>SUMMER SALE</Text>
                        <Text style={styles.bannerSubtitle}>UP TO 50% OFF</Text>
                        <TouchableOpacity style={styles.bannerButton}>
                            <Text style={styles.bannerButtonText}>SHOP NOW</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Featured Products - Horizontal Scroll */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Featured Offers</Text>
                    </View>
                    <FlatList
                        data={featuredProducts}
                        renderItem={renderFeaturedItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredList}
                    />
                </View>

                {/* All Products - Vertical List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>All Offers</Text>
                    </View>
                    <View style={styles.productsGrid}>
                        {allProducts.map(item => (
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
    bannerContainer: {
        height: 200,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.WHITE,
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 18,
        color: Colors.WHITE,
        marginBottom: 12,
    },
    bannerButton: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        color: Colors.WHITE,
        fontWeight: 'bold',
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
    featuredList: {
        paddingHorizontal: 16,
    },
    featuredItem: {
        width: width * 0.6,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 16,
        padding: 12,
        elevation: 3,
        marginBottom: 10,

    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: Colors.PRIMARY,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 1,
    },
    discountText: {
        color: Colors.WHITE,
        fontSize: 12,
        fontWeight: 'bold',
    },
    featuredImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    featuredInfo: {
        paddingHorizontal: 4,
    },
    featuredName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
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
    // Add to Cart Button Styles
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
    productImageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        height: 40,
    },
    productCategory: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
});

export default OfferPage;