import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosInstance';

const ReviewScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState({});

  const API_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await axiosInstance.get(`/order-detail/${orderId}`);
      console.log("Order Detail Response:", response.data);
      
      if (response.data && response.data.data) {
        setOrderItems(response.data.data);
        // Initialize reviews state
        const initialReviews = {};
        response.data.data.forEach(item => {
          initialReviews[item.id] = {
            rating: 0,
            review: ''
          };
        });
        setReviews(initialReviews);
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      Alert.alert("Error", "Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingPress = (orderItemId, rating) => {
    setReviews(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        rating: rating
      }
    }));
  };

  const handleReviewChange = (orderItemId, reviewText) => {
    setReviews(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        review: reviewText
      }
    }));
  };

  const handleSubmitReviews = async () => {
    // Validate all reviews have rating
    const incompleteReviews = Object.entries(reviews).filter(([_, review]) => review.rating === 0);
    
    if (incompleteReviews.length > 0) {
      Alert.alert("Peringatan", "Mohon berikan rating untuk semua produk");
      return;
    }

    setSubmitting(true);
    
    try {
      // Send review for each order item
      const reviewPromises = Object.entries(reviews).map(([orderItemId, reviewData]) => {
        const orderItem = orderItems.find(item => item.id.toString() === orderItemId);

        console.log("Processing order item:", orderItem);
        console.log("Review data for orderItemId", orderItem.id, ":", reviewData, 'product: ',orderItem.product_id);
        
        return axiosInstance.post('/reviews', {
          order_item_id: orderItem.id,
          product_id: orderItem.product_id,
          rating: reviewData.rating,
          review: reviewData.review
        });
      });

      await Promise.all(reviewPromises);
      
      Alert.alert(
        "Berhasil", 
        "Terima kasih atas review Anda!",
        [
          {
            text: "OK",
            onPress: () => router.push('/(tabs)/home')
          }
        ]
      );
    } catch (error) {
      console.error("Failed to submit reviews:", error);
      Alert.alert("Error", "Gagal mengirim review. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (orderItemId, currentRating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingPress(orderItemId, star)}
            style={styles.starButton}
          >
            <FontAwesome
              name={star <= currentRating ? "star" : "star-o"}
              size={24}
              color={star <= currentRating ? "#FFD700" : "#DDD"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFeedbackCard = (item) => {
    const currentReview = reviews[item.id] || { rating: 0, review: '' };
    
    return (
      <View key={item.id} style={styles.feedbackCard}>
        <View style={styles.productHeader}>
          <Image 
            source={{ uri: `${API_IMAGE_URL}/${item.product.image}` }} 
            style={styles.productImage} 
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.product.name}</Text>
            <Text style={styles.productQuantity}>Jumlah: {item.quantity}</Text>
          </View>
        </View>
        
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Berikan Rating:</Text>
          {renderStars(item.id, currentReview.rating)}
        </View>
        
        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Masukkan Ulasan</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tulis ulasan Anda"
            value={currentReview.review}
            onChangeText={(text) => handleReviewChange(item.id, text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.congratsContainer}>
            <Text style={styles.congratsText}>Congratulations </Text>
            <Text style={styles.emoji}>🎉</Text>
          </View>
          <Text style={styles.subtitle}>
            Selamat, pesanan anda telah sampai
          </Text>
        </View>
        
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>
            Beri kami nilai atas pengalaman belanjamu.
          </Text>
          
          {orderItems.map(renderFeedbackCard)}
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReviews}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  congratsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emoji: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    lineHeight: 28,
  },
  feedbackSection: {
    margin: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
    marginRight: 4,
  },
  reviewSection: {
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReviewScreen;