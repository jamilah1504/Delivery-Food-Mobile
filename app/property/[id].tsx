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

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        const item = response.data.data;

        // Format harga
        const formattedProduct = {
          ...item,
          price: item.price
            ? `Rp. ${Number(item.price).toLocaleString("id-ID")}`
            : "Rp. 0",
          oldPrice: item.old_price
            ? `Rp. ${Number(item.old_price).toLocaleString("id-ID")}`
            : null,
        };

        setProduct(formattedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Gagal memuat detail produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E5BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        <View style={{ width: 24 }} /> {/* Untuk alignment */}
      </View>

      <Image
        source={{
          uri: `http://127.0.0.1:8000/storage/${
            product.image || "placeholder.jpg"
          }`,
        }}
        style={styles.productImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>

        <View style={styles.priceContainer}>
          {product.oldPrice && (
            <Text style={styles.oldPrice}>{product.oldPrice}</Text>
          )}
          <Text style={styles.price}>{product.price}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {product.rating || "N/A"} | {product.sold || "0"} terjual
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>
            {product.description || "Tidak ada deskripsi"}
          </Text>
        </View>

        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartText}>Tambah ke Keranjang</Text>
          <Ionicons name="cart-outline" size={20} color="white" />
        </TouchableOpacity>
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
    padding: 16,
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
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  category: {
    backgroundColor: "#2E5BFF",
    color: "white",
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    fontWeight: "500",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E5BFF",
  },
  oldPrice: {
    fontSize: 16,
    color: "#A0AEC0",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    color: "#7E8B9F",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
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
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E5BFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  cartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    margin: 16,
  },
});
