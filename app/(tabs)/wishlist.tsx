import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function WishlistScreen() {
  // Ambil parameter yang dikirim dari HomeScreen
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse parameter wishlist, atau gunakan array kosong jika tidak ada
  const wishlist = params.wishlist ? JSON.parse(params.wishlist) : [];

  // Fungsi untuk menavigasi ke halaman Keranjang dengan membawa data produk
  const goToKeranjang = (item) => {
    router.push({
      pathname: "/keranjang",
      params: { item: JSON.stringify(item) },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      {/* Daftar Produk */}
      {wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <TouchableOpacity style={styles.favorite}>
                <Ionicons name="heart" size={20} color="red" />
              </TouchableOpacity>
              <View style={styles.infoContainer}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.rating}>
                  ⭐ {item.rating} {item.sold}
                </Text>
                <Text style={styles.price}>{item.price}</Text>
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => goToKeranjang(item)} // Navigasi ke Keranjang
                >
                  <Text style={styles.cartText}>Add to cart</Text>
                  <Ionicons name="cart-outline" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        // Tampilkan pesan jika wishlist kosong
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Wishlist Anda kosong.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#536001",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3, // Untuk efek shadow di Android
    minHeight: 200, // Menambah tinggi minimal card
    width: "90%", // Menyesuaikan lebar card (90% dari parent-nya)
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  favorite: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 5,
    borderRadius: 50,
  },
  infoContainer: {
    marginTop: 10,
  },
  category: {
    backgroundColor: "#536001", // Warna label kategori
    color: "white",
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#536001",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  cartText: {
    color: "white",
    fontWeight: "bold",
    marginRight: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
});
