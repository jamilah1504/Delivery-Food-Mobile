import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const getSliders = async () => {
  try {
    const response = await api.get("/sliders");
    console.log("Raw Sliders API Response:", response.data);
    return (
      response.data.data.map((item) => ({
        ...item,
        image: item.image || "placeholder.jpg", // Pastikan image ada
        is_active: item.is_active !== undefined ? item.is_active : true, // Default true jika tidak ada
      })) || []
    );
  } catch (error) {
    console.error("Error fetching sliders:", error.message);
    return [];
  }
};

// Fetch categories
const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    console.log("Raw Categories API Response:", response.data);
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid category data format");
    }
    const apiCategories = response.data.data
      .filter((category) => category.id_category && category.name_category)
      .map((category) => ({
        id: category.id_category,
        name: category.name_category,
        icon: getCategoryIcon(category.name_category),
        originalData: category,
      }));
    return [{ id: 0, name: "All Menu", icon: "list" }, ...apiCategories];
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return [{ id: 0, name: "All Menu", icon: "list" }];
  }
};

const getProducts = async () => {
  try {
    const response = await api.get("/products");
    console.log("Raw Products API Response:", response.data);
    const categoriesResponse = await api.get("/categories");
    const categoryMap = categoriesResponse.data.data.reduce((map, cat) => {
      map[cat.id_category] = cat.name_category;
      return map;
    }, {});
    return (
      (Array.isArray(response.data.data)
        ? response.data.data.map((item) => ({
            ...item,
            category: categoryMap[item.id_category] || "unknown",
            price:
              typeof item.price === "string"
                ? parseFloat(item.price.replace(/[^0-9.-]+/g, ""))
                : parseFloat(item.price) || 0,
            discount_price:
              typeof item.discount_price === "string"
                ? parseFloat(item.discount_price.replace(/[^0-9.-]+/g, ""))
                : parseFloat(item.discount_price) || 0,
            stock_status: item.stock_status || "available",
            is_available:
              item.is_available !== undefined ? item.is_available : true,
            rating: item.rating || "N/A",
            sold: item.sold || 0,
          }))
        : []) || []
    );
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
    return [];
  }
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  const [sliders, setSliders] = useState([]);
  const [categories, setCategories] = useState([
    { id: 0, name: "All Menu", icon: "list" },
  ]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  const getNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      console.log("Raw Notifications API Response:", response.data);
      const unreadCount =
        response.data.data.filter((notif) => !notif.is_read).length || 0;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setNotificationCount(0);
    }
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sliderData, categoryData, productData] = await Promise.all([
        getSliders(),
        getCategories(),
        getProducts(),
      ]);
      await getNotifications();
      setSliders(sliderData);
      setCategories(categoryData);
      setProducts(productData);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setError("Gagal memuat data. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter produk dengan useMemo untuk optimasi
  const filteredProducts = useMemo(() => {
    console.log("Filtering products for category:", selectedCategory);
    return products.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Menu" ||
        (item.category &&
          item.category.toLowerCase() === selectedCategory.toLowerCase());
      console.log(
        `Item: ${item.name}, Category: ${item.category}, Matches: ${matchesCategory}`
      );
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Fungsi navigasi
  const handleAddToCart = (item) => {
    // Validasi dan log untuk debugging
    console.log("Adding to cart:", item);
    console.log("Price type:", typeof item.price, "Value:", item.price);
    if (isNaN(item.price) || item.price === null || item.price === undefined) {
      console.warn("Invalid price detected, defaulting to 0");
      item.price = 0; // Default jika price tidak valid
    }
    router.push({
      pathname: "/keranjang",
      params: { item: JSON.stringify(item) },
    });
  };

  const goToNotifications = () => {
    router.push("/property/notifications");
  };

  const goToProductDetail = (id) => {
    router.push(`/property/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          accessibilityLabel="TNDH Food Logo"
        />
        <Text style={styles.headerTitle}>TNDH Food</Text>
        <TouchableOpacity
          onPress={goToNotifications}
          style={styles.notificationIcon}
          accessibilityLabel="Buka Notifikasi"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={24} color="#2E5BFF" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#777"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Cari Produk"
        />
      </View>

      {/* Error dan Retry */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchData}
            accessibilityLabel="Coba Lagi"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slider Terlaris */}
      <Text style={styles.sectionTitle}>Terlaris</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.carouselContainer}
      >
        {sliders.length > 0 ? (
          sliders
            .filter((item) => item.is_active)
            .map((item, index) => (
              <View key={index} style={styles.carouselItem}>
                <Image
                  source={{
                    uri: item.image
                      ? `http://192.168.43.146:8000/storage/${item.image}`
                      : "http://192.168.43.146:8000/storage/placeholder.jpg",
                  }}
                  style={styles.terlarisImage}
                  resizeMode="cover"
                  accessibilityLabel={`Slider ${index + 1}`}
                />
              </View>
            ))
        ) : (
          <Text style={styles.emptyText}>Tidak ada slider tersedia</Text>
        )}
      </ScrollView>

      {/* Filter Kategori */}
      <Text style={styles.sectionTitle}>Kategori Menu</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}
      >
        <View style={styles.filterContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                selectedCategory === category.name && styles.activeFilterButton,
              ]}
              onPress={() => {
                console.log("Selected category:", category.name);
                setSelectedCategory(category.name);
              }}
              accessibilityLabel={`Pilih kategori ${category.name}`}
              accessibilityRole="button"
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === category.name ? "#FFFFFF" : "#333"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === category.name &&
                    styles.activeFilterButtonText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Daftar Produk */}
      <Text style={styles.sectionTitle}>Rekomendasi</Text>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Tidak ada produk untuk kategori "{selectedCategory}"
          </Text>
        }
        renderItem={({ item }) => {
          // Kondisi 2: Jangan tampilkan jika tidak tersedia (is_available = false)
          if (!item.is_available) {
            return null; // Item tidak dirender
          }

          // Hitung harga baru jika ada diskon
          const originalPrice = parseFloat(item.price) || 0;
          const discountPrice = parseFloat(item.discount_price) || 0;
          const newPrice = originalPrice - discountPrice;

          return (
            <TouchableOpacity
              style={[
                styles.categoryCard,
                item.stock_status === "out_of_stock" && styles.outOfStockCard, // Kondisi 1: Warna abu-abu jika habis
              ]}
              onPress={() =>
                item.stock_status === "available"
                  ? goToProductDetail(item.id)
                  : null
              } // Hanya navigasi jika tersedia
              activeOpacity={0.7}
              accessibilityLabel={`Lihat detail ${item.name}`}
              accessibilityRole="button"
              disabled={item.stock_status === "out_of_stock"} // Nonaktifkan jika habis
            >
              <Image
                source={{
                  uri: item.image
                    ? `http://192.168.43.146:8000/storage/${item.image}`
                    : "http://192.168.43.146:8000/storage/placeholder.jpg",
                }}
                style={styles.productImage}
                resizeMode="cover"
                accessibilityLabel={`Gambar ${item.name}`}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.category}>
                  {item.category || "Tidak ada kategori"}
                </Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.rating}>⭐ {item.rating || "N/A"}</Text>
                {/* Kondisi 3 & 4: Tampilkan harga */}
                {discountPrice > 0 ? (
                  <>
                    <Text style={[styles.oldPrice, styles.strikeThrough]}>
                      Rp {numberFormat(originalPrice)}
                    </Text>
                    <Text style={styles.price}>
                      Rp {numberFormat(newPrice)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.price}>
                    Rp {numberFormat(originalPrice)}
                  </Text>
                )}
                {item.stock_status === "out_of_stock" && (
                  <Text style={styles.outOfStockText}>Habis</Text> // Kondisi 1: Tulisan "Habis"
                )}
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() =>
                    item.stock_status === "available"
                      ? handleAddToCart(item)
                      : null
                  } // Hanya tambah jika tersedia
                  accessibilityLabel={`Tambah ${item.name} ke keranjang`}
                  accessibilityRole="button"
                  disabled={item.stock_status === "out_of_stock"} // Nonaktifkan jika habis
                >
                  <Text style={styles.cartText}>Add to cart</Text>
                  <Ionicons name="cart-outline" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScrollView>
  );
}

// Styles
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E5BFF",
  },
  notificationIcon: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    shadowColor: "#2E5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
    color: "#7E8B9F",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#2D3748",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E5BFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  carouselItem: {
    width: Dimensions.get("window").width * 0.95,
    height: 150,
    marginRight: 12,
    marginLeft: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E6ED",
    shadowColor: "#2E5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  terlarisImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  outOfStockCard: {
    backgroundColor: "#D3D3D3", // Warna abu-abu
    opacity: 0.6,
  },
  outOfStockText: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
  strikeThrough: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  filterScrollContainer: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    backgroundColor: "#FFFFFF",
  },
  activeFilterButton: {
    backgroundColor: "#2E5BFF",
    borderColor: "#2E5BFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#7E8B9F",
    marginLeft: 8,
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    shadowColor: "#2E5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#F7F9FC",
  },
  infoContainer: {
    marginTop: 8,
  },
  category: {
    backgroundColor: "#2E5BFF",
    color: "#FFFFFF",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginTop: 6,
  },
  rating: {
    fontSize: 12,
    color: "#7E8B9F",
    marginTop: 4,
  },
  oldPrice: {
    fontSize: 12,
    color: "#A0AEC0",
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E5BFF",
    marginTop: 4,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E5BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  cartText: {
    color: "#FFFFFF",
    marginRight: 6,
    fontWeight: "600",
  },
  errorContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#2E5BFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#7E8B9F",
    marginVertical: 16,
    marginHorizontal: 16,
  },
  loadingText: {
    textAlign: "center",
    color: "#2E5BFF",
    fontSize: 16,
    marginTop: 20,
  },
});