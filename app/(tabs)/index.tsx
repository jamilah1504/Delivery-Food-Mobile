import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Replace with your actual server URL or use ngrok
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const getSliders = async () => {
  try {
    const response = await api.get("/sliders");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return [];
  }
};

const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const getProducts = async () => {
  try {
    const response = await api.get("/products");
    return (
      response.data.data.map((item) => ({
        ...item,
        price: item.price
          ? `Rp. ${Number(item.price).toLocaleString("id-ID")}`
          : "Rp. 0",
        oldPrice: item.old_price
          ? `Rp. ${Number(item.old_price).toLocaleString("id-ID")}`
          : null,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  const [sliders, setSliders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Define icon mappings for categories (customize based on your category names)
  const categoryIcons = {
    "All Menu": "list",
    Makanan: "fast-food",
    Minuman: "water",
    Cemilan: "pizza",
    "Makanan Berat": "restaurant",
    // Add more categories and icons as needed
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sliderData, categoryData, productData] = await Promise.all([
          getSliders(),
          getCategories(),
          getProducts(),
        ]);
        console.log("Sliders:", sliderData);
        console.log("Categories:", categoryData);
        console.log("Products:", productData);
        setSliders(sliderData);
        setCategories(categoryData);
        setProducts(productData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (selectedCategory === "All Menu") {
      return matchesSearch;
    } else {
      return matchesSearch && item.category === selectedCategory;
    }
  });

  const handleAddToCart = (item) => {
    router.push({
      pathname: "/keranjang",
      params: { item: JSON.stringify(item) },
    });
  };

  const goToNotifications = () => {
    router.push("/notifications");
  };

  const goToProductDetail = (id) => {
    router.push(`/property/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>TNDH Food</Text>
        <TouchableOpacity
          onPress={goToNotifications}
          style={styles.notificationIcon}
        >
          <Ionicons name="notifications-outline" size={24} color="#2E5BFF" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

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
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.sectionTitle}>Terlaris</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.carouselContainer}
      >
        {sliders.length > 0 ? (
          sliders.map((item, index) => (
            <View key={index} style={styles.carouselItem}>
              <Image
                source={{
                  uri: `http://127.0.0.1:8000/storage/${
                    item.image || "placeholder.jpg"
                  }`,
                }}
                style={styles.terlarisImage}
                resizeMode="cover"
                onError={(e) =>
                  console.log(
                    `Failed to load slider image: http://127.0.0.1:8000/storage/${item.image}`,
                    e.nativeEvent.error
                  )
                }
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Tidak ada slider tersedia</Text>
        )}
      </ScrollView>

      <Text style={styles.sectionTitle}>Kategori Menu</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "All Menu" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("All Menu")}
        >
          <Ionicons
            name={categoryIcons["All Menu"]}
            size={20}
            color={selectedCategory === "All Menu" ? "#FFFFFF" : "#333"}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === "All Menu" && styles.activeFilterButtonText,
            ]}
          >
            All Menu
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategory === category.name && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Ionicons
              name={categoryIcons[category.name] || "fast-food"} // Fallback to "fast-food" if no specific icon
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

      <Text style={styles.sectionTitle}>Rekomendasi</Text>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => goToProductDetail(item.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{
                uri: `http://127.0.0.1:8000/storage/${
                  item.image || "placeholder.jpg"
                }`,
              }}
              style={styles.productImage}
              resizeMode="cover"
              onError={(e) =>
                console.log(
                  `Failed to load product image: http://127.0.0.1:8000/storage/${item.image}`,
                  e.nativeEvent.error
                )
              }
            />
            <View style={styles.infoContainer}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.rating}>
                ⭐ {item.rating || "N/A"} {item.sold || "0 terjual"}
              </Text>
              <Text style={styles.oldPrice}>
                {item.oldPrice || item.old_price || ""}
              </Text>
              <Text style={styles.price}>{item.price}</Text>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.cartText}>Add to cart</Text>
                <Ionicons name="cart-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
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
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
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
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    shadowColor: "#2E5BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
    color: "#7E8B9F",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#2D3748",
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E5BFF",
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  carouselContainer: {
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 10,
    paddingHorizontal: 16,
  },
  carouselItem: {
    width: 250,
    height: 150,
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E6ED",
    shadowColor: "#2E5BFF",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  terlarisImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 12,
    marginBottom: 12,
  },
  filterButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
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
    paddingLeft: 16,
    marginTop: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    shadowColor: "#2E5BFF",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E0E6ED",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#F7F9FC",
  },
  infoContainer: {
    marginTop: 10,
  },
  category: {
    backgroundColor: "#2E5BFF",
    color: "white",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    fontWeight: "500",
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
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  cartText: {
    color: "white",
    marginRight: 5,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    margin: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#7E8B9F",
    margin: 16,
  },
});
