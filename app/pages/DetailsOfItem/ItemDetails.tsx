import { getProductDetail, getProducts } from '@/lib/api/productApi';
import { getCustomerById, getSession, updateCustomerById } from '@/lib/services/authService';
import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Import rating services
import { loadReviews } from '@/lib/services/ratingServices';
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  attributeName: string;
  options: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  deliveryDate: string;
  inStock: boolean;
}
interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  title: string;
}
interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}
const { width } = Dimensions.get('window');
type WCImage = { id: number; src: string; alt?: string };
type WCCategory = { id: number; name: string; slug?: string };
type WCAttribute = { id: number; name: string; slug?: string; options?: string[] };
type WCProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'variable' | string;
  status: string;
  featured: boolean;
  description?: string;
  short_description?: string;
  price: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  on_sale?: boolean;
  average_rating?: string | number;
  rating_count?: number;
  images?: WCImage[];
  categories?: WCCategory[];
  attributes?: WCAttribute[];
  stock_status?: string;
  price_html?: string;
  related_ids?: number[];
  [k: string]: any;
};
type WCReview = {
  id: number;
  reviewer: string;
  reviewer_email?: string;
  rating: number;
  review: string;
  date_created: string;
  [k: string]: any;
};
const toNum = (v: any, fb = 0): number => {
  const n = parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fb;
};
const stripHtml = (html?: string): string => {
  if (!html) return '';
  return html.replace(/(<([^>]+)>)/gi, '').replace(/&nbsp;/g, ' ').trim();
};
const decodeEntities = (s: string): string => {
  try {
    return s
      .replace(/\u003C/gi, '<')
      .replace(/\u003E/gi, '>')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/'/g, "'")
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\s*\/?p\s*>/gi, ' ')
      .trim();
  } catch {
    return s;
  }
};
const pctDiscount = (regular: number, sale: number): number | undefined => {
  if (regular > 0 && sale > 0 && regular > sale) {
    const pct = Math.round(((regular - sale) / regular) * 100);
    return Number.isFinite(pct) && pct > 0 ? pct : undefined;
  }
  return undefined;
};
const safeDatePlusDays = (days = 5): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const normalizeUri = (uri: string): string => {
  const trimmed = (uri || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://')) return trimmed.replace('http://', 'https://');
  return trimmed;
};
const parsePriceRangeFromHtml = (priceHtml?: string): { min?: number; max?: number } => {
  if (!priceHtml || typeof priceHtml !== 'string') return {};
  const text = stripHtml(priceHtml).replace(/[^\d.,\s-]/g, '');
  const nums = text
    .split(/[^\d.]/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
  if (nums.length >= 2) {
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return { min, max };
  }
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return {};
};
const mapToUIProduct = (p: WCProduct): Product => {
  const safeName = stripHtml(decodeEntities(String(p?.name ?? 'Unnamed Product')));
  let sale = toNum(p?.sale_price ?? p?.price, 0);
  let regular = toNum(p?.regular_price ?? p?.price, 0);
  if (p?.type === 'variable') {
    if (!(regular > 0) || !(sale > 0)) {
      const range = parsePriceRangeFromHtml(p?.price_html);
      if (typeof range.min === 'number') {
        sale = range.min;
        if (typeof range.max === 'number' && range.max > sale) {
          regular = range.max;
        } else {
          regular = sale;
        }
      }
    }
  }
  const imgs = Array.isArray(p?.images) ? p.images : [];
  const imageUrls = imgs
    .map((im) => (typeof im?.src === 'string' ? normalizeUri(im.src) : ''))
    .filter((s) => s.length > 0);
  const desc = stripHtml(p?.description) || stripHtml(p?.short_description) || '';
  const attrs = Array.isArray(p?.attributes) ? p.attributes : [];
  let attr =
    attrs.find(
      (a) =>
        typeof a?.name === 'string' &&
        ['watt'].includes(a.name.trim().toLowerCase())
    ) || null;
  if (!attr) {
    attr = attrs.find((a) => Array.isArray(a?.options) && a.options.length > 0) || null;
  }
  const attributeName = attr?.name || 'Option';
  const options =
    attr && Array.isArray(attr.options) && attr.options.length > 0
      ? attr.options
          .map((opt) => (typeof opt === 'string' ? opt : ''))
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : ['Default'];
  return {
    id: String(p?.id ?? ''),
    name: safeName || 'Unnamed Product',
    price: sale,
    originalPrice: regular > sale ? regular : undefined,
    discount: pctDiscount(regular, sale),
    description: desc,
    attributeName,
    options,
    images: imageUrls,
    rating: toNum(p?.average_rating ?? 0, 0),
    reviewCount: toNum(p?.rating_count ?? 0, 0),
    deliveryDate: safeDatePlusDays(5),
    inStock: (p?.stock_status ?? 'instock').toLowerCase() === 'instock',
  };
};
const mapToRelated = (p: WCProduct): RelatedProduct => {
  const imgs = Array.isArray(p?.images) ? p.images : [];
  const first = imgs.length > 0 && typeof imgs[0]?.src === 'string' ? normalizeUri(imgs[0].src) : '';
  return {
    id: String(p?.id ?? ''),
    name: stripHtml(decodeEntities(String(p?.name ?? 'Unnamed'))),
    price: toNum(p?.sale_price ?? p?.price, 0),
    image: first || 'https://via.placeholder.com/300x300.png?text=Product',
    rating: toNum(p?.average_rating ?? 0, 0),
    title: p.name || 'Unnamed',
  };
};
const mapToReview = (r: WCReview): Review => {
  return {
    id: String(r?.id ?? ''),
    reviewer: stripHtml(decodeEntities(String(r?.reviewer ?? 'Anonymous'))),
    rating: toNum(r?.rating ?? 0, 0),
    comment: stripHtml(decodeEntities(String(r?.review ?? ''))),
    date: r?.date_created ? new Date(r.date_created).toLocaleDateString() : 'Unknown date',
  };
};
// Function to fetch reviews from WooCommerce API
const getProductReviews = async (productId: string) => {
  try {
    const reviews = await loadReviews({ product: Number(productId), per_page: 5 });
    const sortedReviews = reviews
      .sort((a: WCReview, b: WCReview) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
      .slice(0, 5);
    return { data: sortedReviews };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { data: [] };
  }
};
// Function to submit a review to WooCommerce API
const submitProductReview = async (productId: string, reviewData: {
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
}) => {
  try {
    console.log('Submitting review:', { productId, ...reviewData });
    
    return { 
      id: Math.floor(Math.random() * 1000) + 100,
      ...reviewData,
      date_created: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};
const ItemDetails: React.FC = () => {
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = useMemo(() => (params?.id ? String(params.id) : ''), [params?.id]);
  const [selectedOption, setSelectedOption] = useState<string>('Default');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addToCartLoading, setAddToCartLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Loading address...');
  const [customer, setCustomer] = useState<any>(null); // Added to store customer data
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.images?.length]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setErrorText('');
        const session = await getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
        } else {
          setIsInWishlist(false);
        }
        if (!productId) {
          setErrorText('Missing product id in route params.');
          if (mounted) {
            setProduct(null);
            setRelatedProducts([]);
            setReviews([]);
          }
          setLoading(false);
          return;
        }
        // Parallel fetch
        const [detailRes, reviewsRes, fetchedCustomer] = await Promise.all([
          getProductDetail(productId),
          getProductReviews(productId),
          session?.user?.id ? getCustomerById(session.user.id) : Promise.resolve(null)
        ]);
        const detailData: WCProduct | null =
          detailRes?.data ?? (Array.isArray(detailRes) ? (detailRes as any)[0] : null);
        if (!detailData || typeof detailData !== 'object') {
          console.warn('ItemDetails: product not found for id', productId);
          setErrorText('Product not found.');
          if (mounted) {
            setProduct(null);
            setRelatedProducts([]);
            setReviews([]);
          }
          setLoading(false);
          return;
        }
        const uiProd = mapToUIProduct(detailData);
        if (mounted) {
          setProduct(uiProd);
          if (uiProd.options.length > 0) setSelectedOption(uiProd.options[0]);
        }
        // Set reviews
        const reviewList: WCReview[] = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];
        if (mounted) setReviews(reviewList.map(mapToReview));
        // Set wishlist, cart, and customer
        if (fetchedCustomer) {
          setCustomer(fetchedCustomer);
          const wishlist = fetchedCustomer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
          setIsInWishlist(wishlist.includes(uiProd.id));
          const cart = fetchedCustomer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
          const cartIds = cart.map((item: any) => item.id);
          setCartItems(cartIds);
          // Set dynamic delivery address (prefer shipping, fallback to billing)
          let addr = 'No address set';
          if (fetchedCustomer.shipping && fetchedCustomer.shipping.address_1) {
            addr = `${fetchedCustomer.shipping.address_1}, ${fetchedCustomer.shipping.city}, ${fetchedCustomer.shipping.state} ${fetchedCustomer.shipping.postcode}`;
          } else if (fetchedCustomer.billing && fetchedCustomer.billing.address_1) {
            addr = `${fetchedCustomer.billing.address_1}, ${fetchedCustomer.billing.city}, ${fetchedCustomer.billing.state} ${fetchedCustomer.billing.postcode}`;
          }
          setDeliveryAddress(addr);
        }
        // Related products
        let related: RelatedProduct[] = [];
        const relatedIds = Array.isArray(detailData?.related_ids)
          ? detailData.related_ids.map((x: any) => String(x)).filter(Boolean)
          : [];
        if (relatedIds.length > 0) {
          const include = relatedIds.join(',');
          const relRes = await getProducts({
            include,
            per_page: relatedIds.length,
            status: 'publish',
          });
          const relList: WCProduct[] = Array.isArray(relRes?.data) ? relRes.data : [];
          related = relList.map(mapToRelated);
        } else {
          const cats = Array.isArray(detailData?.categories) ? detailData.categories : [];
          const categoryId = cats.length > 0 ? String(cats[0]?.id) : undefined;
          const relRes = await getProducts({
            per_page: 12,
            page: 1,
            status: 'publish',
            order: 'desc',
            orderby: 'date',
            category: categoryId,
            exclude: productId,
          });
          const relList: WCProduct[] = Array.isArray(relRes?.data) ? relRes.data : [];
          related = relList.filter((p) => String(p?.id) !== String(productId)).map(mapToRelated);
        }
        if (mounted) setRelatedProducts(related);
      } catch (e: any) {
        console.error('ItemDetails load error:', e?.message || e);
        setErrorText('Failed to load product. Please try again.');
        if (mounted) {
          setProduct(null);
          setRelatedProducts([]);
          setReviews([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [productId]);
  const handleGoToChat = async () => {
    try {
      // ✅ Get logged-in user session
      const session = await getSession();
      if (!session?.user?.id) {
        alert("Please login to start chat");
        return;
      }
      if (!customer || !product) {
        // If customer or product not available, refetch or handle error
        alert("Unable to start chat: missing user or product data");
        return;
      }
      router.push({
        pathname: "/pages/DetailsOfItem/ChatScreen",
        params: {
          product_id: product.id.toString(),
          user_id: customer.id.toString(),
          user_name: customer.first_name || customer.username || "Guest",
          product_name: product.name,
        },
      });
    } catch (error) {
      console.error("❌ Chat navigation error:", error);
    }
  };
  const toggleWishlist = async () => {
    if (!userId || !product) {
      // If not logged in, navigate to login
      router.push('/Login/LoginRegisterPage');
      return;
    }
    try {
      const fetchedCustomer = await getCustomerById(userId);
      let wishlist = fetchedCustomer?.meta_data?.find((m: any) => m.key === 'wishlist')?.value || [];
      const wasInWishlist = isInWishlist;
      if (isInWishlist) {
        wishlist = wishlist.filter((id: string) => id !== product.id);
      } else {
        wishlist.push(product.id);
      }
      await updateCustomerById(userId, {
        meta_data: [{ key: 'wishlist', value: wishlist }],
      });
      setIsInWishlist(!isInWishlist);
      // Show message
      setFeedbackMessage(wasInWishlist ? 'Item removed from wishlist' : 'Item added to wishlist');
      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
      // Update local customer state
      setCustomer({ ...fetchedCustomer, meta_data: [{ key: 'wishlist', value: wishlist }] });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setFeedbackMessage('Failed to update wishlist');
      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
    }
  };
  const handleAddToCart = async (addProductId: string, qty: number = 1) => {
    if (!userId) {
      router.push('/Login/LoginRegisterPage');
      return;
    }
    try {
      setAddToCartLoading(true);
      const fetchedCustomer = await getCustomerById(userId);
      let cart = fetchedCustomer?.meta_data?.find((m: any) => m.key === 'cart')?.value || [];
      const existingIndex = cart.findIndex((item: any) => item.id === addProductId);
      if (existingIndex !== -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + qty;
      } else {
        cart.push({ id: addProductId, quantity: qty });
      }
      await updateCustomerById(userId, {
        meta_data: [{ key: 'cart', value: cart }],
      });
      setCartItems(prev => [...prev, addProductId]);
      setFeedbackMessage('Item added to cart');
      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
      // Update local customer state
      setCustomer({ ...fetchedCustomer, meta_data: [{ key: 'cart', value: cart }] });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setFeedbackMessage('Failed to add to cart');
      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
    } finally {
      setAddToCartLoading(false);
    }
  };
  const renderRelatedProduct = ({ item }: { item: RelatedProduct }) => {
    const isInCart = cartItems.includes(item.id);
    return (
      <TouchableOpacity 
        style={styles.relatedProduct}
        onPress={() => router.push({ pathname: '/pages/DetailsOfItem/ItemDetails', params: { id: item.id, title: item.title } })}
      >
        <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
        <Text style={styles.relatedProductName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.relatedProductRating}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.relatedProductRatingText}>{item.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.relatedProductPrice}>₹{item.price.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => !isInCart && handleAddToCart(item.id)}
        >
          {isInCart ? (
            <Ionicons name="checkmark" size={16} color={Colors.WHITE} />
          ) : (
            <>
              <Ionicons name="cart-outline" size={16} color={Colors.WHITE} />
              <Text style={styles.addToCartText}>Add</Text>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  const renderImageItem = ({ item, index }: { item: string; index: number }) => {
    const uri = (item || '').trim();
    if (!uri) return null;
    return (
      <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
        <Image
          source={{ uri }}
          style={[
            styles.thumbnail,
            index === selectedImageIndex && styles.selectedThumbnail
          ]}
        />
      </TouchableOpacity>
    );
  };
  const renderReview = (item: Review) => (
    <View key={item.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewReviewer}>{item.reviewer}</Text>
        <View style={styles.reviewStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.floor(item.rating) ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={{ color: '#666', marginTop: 10 }}>Loading product...</Text>
      </View>
    );
  }
  if (!product) {
    return (
      <View style={{ flex: 1, padding: 24, gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
          <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={{ color: '#c00', marginTop: 8 }}>{errorText || 'Unable to load product.'}</Text>
      </View>
    );
  }
  const heroUri =
    product.images.length > 0
      ? product.images[Math.min(selectedImageIndex, product.images.length - 1)]
      : 'https://via.placeholder.com/800x800.png?text=No+Image';
  const isProductInCart = cartItems.includes(product.id);
  const total = product.price * quantity;
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
          <Image source={{ uri: heroUri }} style={styles.mainImage} resizeMode="cover" />
          {product.images.length > 0 ? (
            <FlatList
              data={product.images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailList}
            />
          ) : null}
        </View>
        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
            {typeof product.originalPrice === 'number' && product.originalPrice > product.price ? (
              <Text style={styles.originalPrice}>₹{product.originalPrice.toFixed(2)}</Text>
            ) : null}
            {typeof product.discount === 'number' && product.discount > 0 ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={20}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviewCount} reviews)
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleGoToChat}>
            <Text style={styles.buttonText}>Go to Chat</Text>
          </TouchableOpacity>
          <View style={styles.colorSection}>
            <Text style={styles.sectionTitle}>{product.attributeName}: {selectedOption}</Text>
            <Picker
              selectedValue={selectedOption}
              onValueChange={(itemValue: string) => setSelectedOption(itemValue)}
              style={styles.picker}
            >
              {product.options.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Delivery</Text>
            <View style={styles.deliveryInfo}>
              <Ionicons name="location-outline" size={20} color="#4a6cf7" />
              <View style={styles.deliveryTextContainer}>
                <Text style={styles.deliveryAddress}>Delivery to {deliveryAddress}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/pages/Profile/ShippingAddress')}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description || 'No description.'}</Text>
          </View>
          {/* New Ratings and Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Ratings and Reviews</Text>
              <TouchableOpacity onPress={() => router.push({
                pathname: '/pages/orderHistory/reviewPage',
                params: { productId: productId, productName: product.name }
              })}>
                <Text style={{ color: Colors.PRIMARY, fontSize: 16, fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>
            {reviews.length === 0 ? (
              <Text style={{ color: '#666' }}>No reviews yet.</Text>
            ) : (
              reviews.map(renderReview)
            )}
          </View>
        </View>
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>You might also like</Text>
          <FlatList
            data={relatedProducts}
            renderItem={renderRelatedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.wishlistButton} onPress={toggleWishlist}>
          <Ionicons
            name={isInWishlist ? "heart" : "heart-outline"}
            size={24}
            color={isInWishlist ? Colors.PRIMARY : Colors.PRIMARY}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addToCartButtonFooter} 
          onPress={() => !isProductInCart && handleAddToCart(product.id, quantity)} 
          disabled={addToCartLoading || isProductInCart}
        >
          {addToCartLoading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : isProductInCart ? (
            <Ionicons name="checkmark" size={20} color={Colors.WHITE} />
          ) : (
            <Text style={styles.addToCartTextFooter}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={async () => {
              if (!userId) {
                router.push('/Login/LoginRegisterPage');
                return;
              }
              router.push({
                pathname: '/pages/Checkout/Checkout',
                params: {
                  buyNow: 'true',
                  productId: product.id,
                  quantity: quantity.toString(),
                  option: selectedOption,
                }
              });
            }}
          >
            <Text style={styles.checkoutText}>
              {`Buy Now`}
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>
      {feedbackMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{feedbackMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};
export default ItemDetails;
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  imageSection: { backgroundColor: 'white', paddingBottom: 10, position: 'relative' },
  backButton: {
    position: 'absolute', top: 30, left: 20, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  mainImage: { width: width, height: width },
  thumbnailList: { paddingHorizontal: 10, marginTop: 10 },
  thumbnail: { width: 60, height: 60, marginRight: 10, borderRadius: 8 },
  selectedThumbnail: { borderWidth: 2, borderColor: '#4a6cf7' },
  infoSection: { backgroundColor: 'white', padding: 16, marginTop: 10 },
  productName: { fontSize: 22, fontWeight: '700', color: '#2d3748', marginBottom: 10 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#4a6cf7', marginRight: 10 },
  originalPrice: { fontSize: 18, color: '#a0aec0', textDecorationLine: 'line-through', marginRight: 10 },
  discountBadge: { backgroundColor: '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  discountText: { color: 'white', fontWeight: '600', fontSize: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stars: { flexDirection: 'row', marginRight: 10 },
  ratingText: { color: '#4a5568', fontSize: 16 },
  colorSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2d3748', marginBottom: 10 },
  picker: { height: 50, width: '100%', backgroundColor: '#f7fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  quantitySection: { marginBottom: 20 },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignSelf: 'flex-start' },
  quantityButton: { padding: 10 },
  quantityText: { paddingHorizontal: 15, fontSize: 16, fontWeight: '600' },
  deliverySection: { marginBottom: 20 },
  deliveryInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7fafc', padding: 15, borderRadius: 8 },
  deliveryTextContainer: { flex: 1, marginLeft: 10 },
  deliveryAddress: { fontSize: 14, color: '#2d3748', marginBottom: 4 },
  deliveryDate: { fontSize: 14, color: '#4a5568' },
  changeText: { color: '#4a6cf7', fontWeight: '600' },
  descriptionSection: { marginBottom: 20 },
  descriptionText: { fontSize: 16, color: '#4a5568', lineHeight: 24 },
  reviewsSection: { marginBottom: 20 },
  reviewItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  reviewReviewer: { fontSize: 16, fontWeight: '600', flex: 1 },
  reviewStars: { flexDirection: 'row', marginRight: 10 },
  reviewDate: { fontSize: 12, color: '#718096' },
  reviewComment: { fontSize: 14, color: '#4a5568' },
  relatedSection: { backgroundColor: 'white', padding: 16, marginTop: 10, marginBottom: 80 },
  relatedProduct: { width: 150, marginRight: 15, position: 'relative' },
  relatedProductImage: { width: 150, height: 150, borderRadius: 8, marginBottom: 8 },
  relatedProductName: { fontSize: 14, fontWeight: '500', color: '#2d3748', marginBottom: 4 },
  relatedProductRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  relatedProductRatingText: { fontSize: 12, color: '#4a5568', marginLeft: 4 },
  relatedProductPrice: { fontSize: 16, fontWeight: 'bold', color: '#4a6cf7', marginBottom: 8 },
  addToCartButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.PRIMARY, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  addToCartText: { fontSize: 12, fontWeight: '600', color: Colors.WHITE, marginLeft: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'white', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  wishlistButton: { justifyContent: 'center', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, marginRight: 10 },
  addToCartButtonFooter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: Colors.SECONDARY, borderRadius: 8, marginRight: 10 },
  addToCartTextFooter: { color: Colors.WHITE, fontWeight: '600', fontSize: 16 },
  checkoutButton: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 8 },
  checkoutText: { color: 'white', fontWeight: '600', fontSize: 16 },
  secureText: { fontSize: 12, color: '#666', marginTop: 4 },
  messageContainer: {
    position: 'absolute',
    bottom: 80, // Position above footer
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
});
