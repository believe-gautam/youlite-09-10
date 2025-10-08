import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


const { width } = Dimensions.get('window');

interface CategoryItem {
    id: string;
    name: string;
    icon: string;
}

interface SeasonOffer {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    category: string;
}

interface FeaturedItem {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    category: string;
    rating: number;
}

const seasonCategories: CategoryItem[] = [
    { id: '1', name: 'Clothing', icon: 'tshirt' },
    { id: '2', name: 'Footwear', icon: 'sneaker' },
    { id: '3', name: 'Accessories', icon: 'sunglasses' },
    { id: '4', name: 'Electronics', icon: 'laptop' },
    { id: '5', name: 'Home & Living', icon: 'home' },
    { id: '6', name: 'Beauty', icon: 'lipstick' },
];

const seasonOffers: SeasonOffer[] = [
    {
        id: '1',
        title: 'Summer Collection',
        subtitle: 'Up to 60% off on summer essentials',
        image: 'https://images.unsplash.com/photo-1556906781-2f0520405b71',
        category: '1',
    },
    {
        id: '2',
        title: 'Winter Warmers',
        subtitle: 'Stay cozy with 50% off winter wear',
        image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b',
        category: '1',
    },
    {
        id: '3',
        title: 'Back to School',
        subtitle: 'Everything you need for the new semester',
        image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8',
        category: '4',
    },
];

const featuredItems: FeaturedItem[] = [
    {
        id: '1',
        name: 'Beachwear Set',
        price: 49.99,
        originalPrice: 79.99,
        discount: 38,
        image: 'https://images.unsplash.com/photo-1529903384028-929ae5dccdf1',
        category: '1',
        rating: 4.7,
    },
    {
        id: '2',
        name: 'Designer Sunglasses',
        price: 89.99,
        originalPrice: 129.99,
        discount: 31,
        image: '极简代码',
        category: '3',
        rating: 4.8,
    },
    {
        id: '3',
        name: 'Wireless Earbuds',
        price: 79.99,
        originalPrice: 99.99,
        discount: 20,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
        category: '4',
        rating: 4.5,
    },
    {
        id: '4',
        name: 'Summer Dresses',
        price: 39.99,
        originalPrice: 59.99,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        category: '1',
        rating: 4.6,
    },
    {
        id: '5',
        name: 'Beach Towel',
        price: 24.99,
        originalPrice: 34.99,
        discount: 29,
        image: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00',
        category: '5',
        rating: 4.3,
    },
    {
        id: '6',
        name: 'Sunscreen Kit',
        price: 29.99,
        originalPrice: 39.99,
        discount: 25,
        image: 'https://images.unsplash.com/photo-1600673003565-b8921d658567',
        category: '6',
        rating: 4.4,
    },
    {
        id: '7',
        name: 'Flip Flops',
        price: 19.99,
        originalPrice: 29.99,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
        category: '2',
        rating: 4.2,
    },
    {
        id: '8',
        name: 'Cooler Bag',
        price: 34.99,
        originalPrice: 49.99,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de',
        category: '5',
        rating: 4.1,
    },
];

const SeasonOfferPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedOffer, setSelectedOffer] = useState('1');

    const renderCategory = ({ item }: { item: CategoryItem }) => (
        <TouchableOpacity
            style={[styles.categoryItem, selectedCategory === item.id && styles.activeCategory]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <FontAwesome5 name={item.icon as any} size={20} color={selectedCategory === item.id ? Colors.WHITE : Colors.PRIMARY} />
            <Text style={[styles.categoryName, selectedCategory === item.id && styles.activeCategoryName]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderOffer = ({ item }: { item: SeasonOffer }) => (
        <TouchableOpacity
            style={[styles.offerCard, selectedOffer === item.id && styles.activeOffer]}
            onPress={() => setSelectedOffer(item.id)}
        >
            <Image source={{ uri: item.image }} style={styles.offerImage} />
            <View style={styles.offerOverlay} />
            <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>{item.title}</Text>
                <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFeaturedItem = ({ item }: { item: FeaturedItem }) => (
        <View style={styles.featuredItem}>
            <View style={styles.itemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.discount}%</Text>
                </View>
                <TouchableOpacity style={styles.wishlistButton}>
                    <Ionicons name="heart-outline" size={16} color="#64748b" />
                </TouchableOpacity>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.addToCartBtn}>
                <Ionicons name="cart-outline" size={14} color="#fff" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
        </View>
    );

    const renderBestSeller = ({ item }: { item: FeaturedItem }) => (
        <TouchableOpacity style={styles.bestSellerCard}>
            <Image source={{ uri: item.image }} style={styles.bestSellerImage} />
            <View style={styles.bestSellerInfo}>
                <Text style={styles.bestSellerName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.bestSellerPrice}>
                    <Text style={styles.bestSellerCurrentPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.bestSellerOriginalPrice}>${item.originalPrice.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const filteredItems = featuredItems.filter(item =>
        selectedCategory === 'all' || item.category === selectedCategory
    );

    const bestSellersData = featuredItems.slice(0, 4);

    const ListHeaderComponent = () => (
        <>
            <View style={styles.offersSection}>
                <Text style={styles.sectionTitle}>Special Season Offers</Text>
                <FlatList
                    data={seasonOffers}
                    renderItem={renderOffer}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.offersList}
                />
            </View>

            <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Shop by Category</Text>
                <FlatList
                    data={[{ id: 'all', name: 'All', icon: 'apps' }, ...seasonCategories]}
                    renderItem={renderCategory}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Items</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );

    const ListFooterComponent = () => (
        <>
            <View style={styles.limitedOfferSection}>
                <View style={[styles.limitedOfferCard, { backgroundColor: Colors.PRIMARY }]}>
                    <View style={styles.limitedOfferContent}>
                        <Text style={styles.limitedOfferTitle}>Limited Time Offer</Text>
                        <Text style={styles.limitedOfferText}>
                            Get an extra 15% off on already discounted items. Use code: SEASON15
                        </Text>
                        <Text style={styles.limitedOfferTime}>Ends in 2 days</Text>
                        <TouchableOpacity style={styles.shopNowButton}>
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1525299374597-911581e1bdef' }}
                        style={styles.limitedOfferImage}
                    />
                </View>
            </View>

            <View style={styles.bestSellersSection}>
                <Text style={styles.sectionTitle}>Best Sellers This Season</Text>
                <FlatList
                    data={bestSellersData}
                    renderItem={renderBestSeller}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.bestSellersList}
                />
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Season Offers</Text>

            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderFeaturedItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.itemsGrid}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    contentContainer: {
        paddingBottom: 20,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.WHITE,
    },
    offersSection: {
        padding: 16,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.SECONDARY,
        marginBottom: 16,
    },
    offersList: {
        paddingBottom: 8,
    },
    offerCard: {
        width: width - 80,
        height: 160,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    activeOffer: {
        borderWidth: 2,
        borderColor: Colors.PRIMARY,
    },
    offerImage: {
        width: '100%',
        height: '100%',
    },
    offerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    offerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    offerSubtitle: {
        fontSize: 12,
        color: '#fff',
    },
    categoriesSection: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    categoriesList: {
        paddingBottom: 4,
    },
    categoryItem: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        marginRight: 10,
        minWidth: 70,
    },
    activeCategory: {
        backgroundColor: Colors.PRIMARY,
    },
    categoryName: {
        marginTop: 6,
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    activeCategoryName: {
        color: Colors.WHITE,
        fontWeight: '600',
    },
    featuredSection: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllText: {
        color: Colors.PRIMARY,
        fontWeight: '600',
        fontSize: 14,
    },
    itemsGrid: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    featuredItem: {
        width: (width - 48) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
        height: 250,
    },
    itemImageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    itemImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
    },
    discountBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: '#ef4444',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    wishlistButton: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: '#fff',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingContainer: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 10,
        color: '#fff',
        marginLeft: 2,
        fontWeight: 'bold',
    },
    itemInfo: {
        marginBottom: 8,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 6,
        height: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    currentPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.PRIMARY,
    },
    originalPrice: {
        fontSize: 12,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
        marginTop: 'auto',
    },
    addToCartText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    limitedOfferSection: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    limitedOfferCard: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        height: 120,
    },
    limitedOfferContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    limitedOfferTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    limitedOfferText: {
        fontSize: 12,
        color: '#fff',
        marginBottom: 8,
        lineHeight: 16,
    },
    limitedOfferTime: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 12,
    },
    shopNowButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    shopNowText: {
        color: Colors.PRIMARY,
        fontWeight: 'bold',
        fontSize: 12,
    },
    limitedOfferImage: {
        width: 100,
        height: '100%',
    },
    bestSellersSection: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 8,
        marginBottom: 20,
    },
    bestSellersList: {
        paddingBottom: 8,
    },
    bestSellerCard: {
        width: 140,
        marginRight: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        overflow: 'hidden',
    },
    bestSellerImage: {
        width: '100%',
        height: 100,
    },
    bestSellerInfo: {
        padding: 8,
    },
    bestSellerName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    bestSellerPrice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bestSellerCurrentPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.PRIMARY,
    },
    bestSellerOriginalPrice: {
        fontSize: 10,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
});

export default SeasonOfferPage;

