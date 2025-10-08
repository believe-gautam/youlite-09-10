import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 🔹 Import your review services
import { getSession } from '@/lib/services/authService'; // For getting current user
import { createReview, loadReviews } from '@/lib/services/ratingServices';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  product: string;
  status: string; // Added status to interface
}

const { width } = Dimensions.get('window');

const ReviewPage = () => {
  const params = useLocalSearchParams<{ productId?: string }>();
  const productId = params?.productId ? Number(params.productId) : 1687; // Ensure number type

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  const ratingSummary = {
    average: 4.5,
    total: reviews.length,
    distribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }
  };

  // Function to strip HTML tags
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').trim();

  // 🔹 Load current user
  const fetchCurrentUser = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        setCurrentUser({
          name: session.user.name || 'Guest User',
          email: session.user.email || 'guest@example.com',
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser({ name: 'Guest User', email: 'guest@example.com' });
    }
  };

  // 🔹 Load reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await loadReviews({ product: productId });
      // Filter only approved reviews based on status
      const approvedData = data.filter((item: any) => item.status === 'approved');
      // Map fetched approved data to Review interface
      const mappedReviews = approvedData.map((item: any) => ({
        id: String(item.id),
        userName: item.reviewer,
        rating: item.rating,
        comment: stripHtml(item.review), // Strip HTML from comment
        date: item.date_created,
        verified: item.verified || false, // Assuming verified is available or default to false
        product: item.product_name || 'Unknown Product',
        status: item.status, // Include status
      }));
      setReviews(mappedReviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchReviews();
  }, [productId]);

  // 🔹 Submit new review
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert("Error", "Please write something before submitting.");
      return;
    }

    try {
      await createReview({
        product_id: productId,
        reviewer: currentUser?.name || "Guest User", // Use logged-in user's name
        reviewer_email: currentUser?.email || "guest@example.com", // Required field
        review: reviewText,
        rating: rating,
        verified: false, // Set to true if you can verify purchase
        status: "hold", // Explicitly set status to approved in payload
      });

      Alert.alert("Success", "Review submitted successfully!");
      setReviewText('');
      setRating(5);

      // reload reviews (will only show if status is approved)
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Could not submit review. Please ensure all required fields are provided and API permissions are correct.");
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.userName}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.PRIMARY} />
              <Text style={styles.verifiedText}>Verified Purchase</Text>
            </View>
          )}
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= item.rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.productName}>{item.product}</Text>
      </View>
    </View>
  );

  const renderRatingBar = (stars: number, count: number, percentage: number) => (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingBarText}>{stars} stars</Text>
      <View style={styles.ratingBar}>
        <View
          style={[
            styles.ratingBarFill,
            { width: `${percentage}%` }
          ]}
        />
      </View>
      <Text style={styles.ratingBarCount}>{count}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Rating Summary */}
          <View style={styles.summarySection}>
            <View style={styles.overallRating}>
              <Text style={styles.ratingAverage}>{ratingSummary.average.toFixed(1)}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(ratingSummary.average) ? 'star' : 'star-half'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.ratingTotal}>{ratingSummary.total} reviews</Text>
            </View>

            <View style={styles.ratingBars}>
              {renderRatingBar(5, ratingSummary.distribution[5], (ratingSummary.distribution[5] / (ratingSummary.total || 1)) * 100)}
              {renderRatingBar(4, ratingSummary.distribution[4], (ratingSummary.distribution[4] / (ratingSummary.total || 1)) * 100)}
              {renderRatingBar(3, ratingSummary.distribution[3], (ratingSummary.distribution[3] / (ratingSummary.total || 1)) * 100)}
              {renderRatingBar(2, ratingSummary.distribution[2], (ratingSummary.distribution[2] / (ratingSummary.total || 1)) * 100)}
              {renderRatingBar(1, ratingSummary.distribution[1], (ratingSummary.distribution[1] / (ratingSummary.total || 1)) * 100)}
            </View>
          </View>

          {/* Write Review */}
          <View style={styles.writeReviewSection}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            <View style={styles.ratingInput}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <View style={styles.starInput}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience with this product..."
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>



          {/* Reviews List */}
          <View style={styles.reviewsList}>
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

// ⚡ keep your same styles here (not shown to save space)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  summarySection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  overallRating: {
    alignItems: 'center',
    marginRight: 30,
    justifyContent: 'center',
  },
  ratingAverage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  ratingTotal: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingBars: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarText: {
    width: 50,
    fontSize: 12,
    color: '#6B7280',
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 4,
  },
  ratingBarCount: {
    width: 30,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  writeReviewSection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  ratingInput: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  starInput: {
    flexDirection: 'row',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  filterSection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  activeSortButton: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeSortButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  reviewsList: {
    padding: 16,
    paddingTop: 0,
  },
  reviewItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default ReviewPage;


