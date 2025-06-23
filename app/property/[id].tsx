import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Konfigurasi axios
const api = axios.create({
  baseURL: "http://192.168.43.146:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper function untuk menentukan icon berdasarkan nama kategori
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    "all menu": "list",
    makanan: "fast-food",
    minuman: "water",
    cemilan: "pizza",
    snack: "cafe",
    dessert: "ice-cream",
    "makanan berat": "restaurant",
    kue: "cake",
    kopi: "cafe",
    teh: "cafe",
    jus: "water",
  };
  return iconMap[categoryName?.toLowerCase() || ""] || "fast-food";
};

// Helper function untuk memformat angka
const numberFormat = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
  if (!id) {
    setError("ID produk tidak valid");
    setLoading(false);
    return;
  }

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // Cukup satu panggilan API
      const response = await axiosInstance.get(`/products/${id}`);
      const item = response.data.data;

      // Semua data sudah ada di dalam 'item'
      const categoryName = item.category?.name_category || "Tidak ada kategori";
      const reviews = item.reviews || [];

      const originalPrice = Number(item.price) || 0;
      const discountPrice = Number(item.discount_price) || 0;
      const newPrice = originalPrice - discountPrice;

      const formattedProduct = {
        ...item,
        price: originalPrice,
        oldPrice: item.old_price ? Number(item.old_price) : null,
        discountPrice: discountPrice,
        newPrice: newPrice,
        reviews: reviews.map((review) => ({
          // Akses data user yang sudah di-load oleh backend
          userName: review.user?.name || "Anonim",
          rating: review.rating || 0,
          comment: review.comment || "Tidak ada komentar",
        })),
        categoryIcon: getCategoryIcon(categoryName),
        category: categoryName,
        description: item.description || "Tidak ada deskripsi",
      };

      setProduct(formattedProduct);
    } catch (error) {
      console.error("Error fetching product data:", error);
      if (error.response && error.response.status === 404) {
        setError("Produk yang Anda cari tidak ditemukan.");
      } else {
        setError(`Gagal memuat detail produk: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProductData();
}, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Produk tidak ditemukan</Text>
      </View>
    );
  }

  const handleAddToCart = (item) => {
    if (item.stock_status === "available") {
      router.push({
        pathname: "/keranjang",
        params: { item: JSON.stringify(item) },
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E5BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        <View style={{ width: 24 }} />
      </View>

      <Image
        source={{
          uri: product.image
            ? `http://192.168.43.146:8000/storage/${product.image}`
            : "http://192.168.43.146:8000/storage/placeholder.jpg",
        }}
        style={styles.productImage}
        resizeMode="cover"
        accessibilityLabel={`Gambar ${product.name}`}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.category}>
          <Ionicons name={product.categoryIcon} size={12} color="#FFFFFF" />{" "}
          {product.category || "Tidak ada kategori"}
        </Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.rating}>⭐ {product.rating || "N/A"}</Text>

        <View style={styles.priceContainer}>
          {product.discountPrice > 0 ? (
            <>
              <Text style={[styles.oldPrice, styles.strikeThrough]}>
                Rp {numberFormat(product.price)}
              </Text>
              <Text style={styles.price}>
                Rp {numberFormat(product.newPrice)}
              </Text>
            </>
          ) : (
            <Text style={styles.price}>Rp {numberFormat(product.price)}</Text>
          )}
        </View>

        {/* Tambahkan deskripsi produk di bawah harga */}
        <Text style={styles.description}>{product.description}</Text>

        {product.stock_status === "out_of_stock" && (
          <Text style={styles.outOfStockText}>Habis</Text>
        )}

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() =>
            product.stock_status === "available"
              ? handleAddToCart(product)
              : null
          }
          accessibilityLabel={`Tambah ${product.name} ke keranjang`}
          accessibilityRole="button"
          disabled={product.stock_status === "out_of_stock"}
        >
          <Text style={styles.cartText}>Add to cart</Text>
          <Ionicons name="cart-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ulasan Pelanggan</Text>
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review, index) => (
            <View key={index} style={styles.reviewContainer}>
              <Text style={styles.reviewUser}>{review.userName}</Text>
              <View style={styles.reviewRating}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? "star" : "star-outline"}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.description}>Belum ada ulasan</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E5BFF",
  },
  productImage: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 16,
  },
  category: {
    backgroundColor: "#2E5BFF",
    color: "#FFFFFF",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    color: "#7E8B9F",
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E5BFF",
  },
  oldPrice: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  strikeThrough: {
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  outOfStockText: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E5BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  cartText: {
    color: "#FFFFFF",
    marginRight: 6,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 22,
    marginBottom: 6,
  },
  reviewContainer: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    borderRadius: 8,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: "#4A5568",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    margin: 16,
  },
  retryButton: {
    backgroundColor: "#2E5BFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});