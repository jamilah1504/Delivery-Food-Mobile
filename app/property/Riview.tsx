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
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '@/utils/AuthContext';

const ReviewScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {user} = useAuth();
  
  // State 'reviews' sekarang akan menyimpan input pengguna untuk item yang BELUM direview
  const [reviewsInput, setReviewsInput] = useState({});

  const API_IMAGE_URL = "http://192.168.43.146:8000/storage";

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      // Endpoint ini sekarang mengembalikan order items dengan data 'review' di dalamnya
      const response = await axiosInstance.get(`/order-detail/${orderId}`);
      
      if (response.data && response.data.data) {
        const items = response.data.data;
        setOrderItems(items);
        
        // Inisialisasi state input hanya untuk item yang belum direview
        const initialInputs = {};
        items.forEach(item => {
          if (!item.reviews) { // Jika tidak ada review
            initialInputs[item.id] = {
              rating: 0,
              comment: ''
            };
          }
        });
        setReviewsInput(initialInputs);
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      Alert.alert("Error", "Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingPress = (orderItemId, rating) => {
    setReviewsInput(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], rating }
    }));
  };

  const handleReviewChange = (orderItemId, text) => {
    setReviewsInput(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], comment: text }
    }));
  };

  const handleSubmitReviews = async () => {
    // Filter item yang perlu di-submit (yang ada di state reviewsInput)
    const reviewsToSubmit = Object.entries(reviewsInput).filter(([_, reviewData]) => reviewData.rating > 0);
    
    if (Object.keys(reviewsInput).length > 0 && reviewsToSubmit.length === 0) {
      Alert.alert("Peringatan", "Mohon berikan rating minimal 1 bintang untuk produk yang Anda review.");
      return;
    }

    if (reviewsToSubmit.length === 0) {
        Alert.alert("Info", "Semua produk sudah Anda review.", [
            { text: "OK", onPress: () => router.back() }
        ]);
        return;
    }

    setSubmitting(true);
    
    try {
      const reviewPromises = reviewsToSubmit.map(([orderItemId, reviewData]) => {
        const orderItem = orderItems.find(item => item.id.toString() === orderItemId);
        return axiosInstance.post('/reviews', {
          user_id: user?.id,
          id_orderItems: orderItem?.id,
          product_id: orderItem?.product_id,
          rating: reviewData?.rating,
          comment: reviewData?.comment
        });
      });

      await Promise.all(reviewPromises);
      
      Alert.alert(
        "Berhasil", 
        "Terima kasih atas review Anda!",
        [{ text: "OK", onPress: () => router.push('/(tabs)/home') }]
      );

      } catch (error) {
        console.error("Failed to submit reviews:", error.response?.data || error);
        
        // Tambahkan penanganan untuk error 409
        if (error.response && error.response.status === 409) {
          Alert.alert("Gagal", error.response.data.message);
        } else {
          Alert.alert("Error", "Gagal mengirim review. Silakan coba lagi.");
        }

      } finally {
        setSubmitting(false);
      }
  };

  const renderStars = (rating, onStarPress, orderItemId = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onStarPress && onStarPress(orderItemId, star)}
            disabled={!onStarPress} // Disable klik jika hanya untuk display
            style={styles.starButton}
          >
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={24}
              color={star <= rating ? "#FFD700" : "#DDD"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // KARTU UNTUK MENAMPILKAN REVIEW YANG SUDAH ADA
  const renderExistingReviewCard = (item) => (
    <View key={item.id} style={[styles.feedbackCard, styles.reviewedCard]}>
      <View style={styles.productHeader}>
        <Image source={{ uri: `${API_IMAGE_URL}/${item.product.image}` }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product.name}</Text>
        </View>
      </View>
      <Text style={styles.reviewedLabel}>Anda telah mereview produk ini:</Text>
      {renderStars(item.review.rating)}
      {item.review.comment && <Text style={styles.existingComment}>{item.review.comment}</Text>}
    </View>
  );

  // KARTU UNTUK FORM INPUT REVIEW
  const renderReviewFormCard = (item) => {
    const currentReviewInput = reviewsInput[item.id] || { rating: 0, comment: '' };
    return (
      <View key={item.id} style={styles.feedbackCard}>
        <View style={styles.productHeader}>
          <Image source={{ uri: `${API_IMAGE_URL}/${item.product.image}` }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.product.name}</Text>
            <Text style={styles.productQuantity}>Jumlah: {item.quantity}</Text>
          </View>
        </View>
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Berikan Rating:</Text>
          {renderStars(currentReviewInput.rating, handleRatingPress, item.id)}
        </View>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Masukkan Ulasan (Opsional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tulis ulasan Anda"
            value={currentReviewInput.comment}
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

  const itemsToReview = orderItems.filter(item => !item.review);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2E5BFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Pesanan</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>
            Beri kami nilai atas pengalaman belanjamu.
          </Text>
          
          {/* Render kartu berdasarkan apakah item sudah direview atau belum */}
          {orderItems.map(item =>
            item.review ? renderExistingReviewCard(item) : renderReviewFormCard(item)
          )}
        </View>
        
        {/* Hanya tampilkan tombol submit jika ada item yang bisa direview */}
        {itemsToReview.length > 0 && (
            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReviews}
                disabled={submitting}
            >
                {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                <Text style={styles.submitButtonText}>KIRIM REVIEW</Text>
                )}
            </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Tambahkan beberapa style baru
const styles = StyleSheet.create({
  // ... (copy semua style lama Anda ke sini) ...
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 40, padding: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#2E5BFF" },
  feedbackSection: { margin: 16 },
  feedbackTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 16, textAlign: 'center' },
  feedbackCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  productImage: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#E5E7EB' },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  productQuantity: { fontSize: 14, color: '#6B7280' },
  ratingSection: { marginBottom: 16 },
  ratingLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  starsContainer: { flexDirection: 'row', alignItems: 'center' },
  starButton: { paddingHorizontal: 4 },
  reviewSection: { marginBottom: 8 },
  reviewLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  reviewInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 12, fontSize: 14, color: '#374151', backgroundColor: '#FFFFFF', minHeight: 80 },
  submitButton: { backgroundColor: '#3B82F6', borderRadius: 25, paddingVertical: 14, marginHorizontal: 16, marginBottom: 20, alignItems: 'center', elevation: 3 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  // Style baru untuk kartu yang sudah direview
  reviewedCard: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  reviewedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  existingComment: {
    fontSize: 15,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6
  }
});

export default ReviewScreen;