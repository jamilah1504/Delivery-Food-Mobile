import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../utils/axiosInstance"; // Adjust path as needed
import BASEURL from "../../utils/constants"; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/utils/AuthContext";
interface User {
  id: number;
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // State for user


  // // Base URL for images (adjust to your Laravel storage URL)
  // const BASE_IMAGE_URL = "http://your-app.test/storage/"; // Update with your actual base URL

  // Fetch data from /api/home
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/home");
        const { products, categories } = response.data;

        const userData = await AsyncStorage.getItem("user");
        const fetchedUser: User | null = userData ? JSON.parse(userData) : null;
        setUser(fetchedUser);

        // Map products to the expected format
        const formattedProducts = products.map((product) => ({
          id: product.id.toString(), // Convert to string for FlatList key
          name: product.name,
          category: product.kategori?.kategori || "Uncategorized", // Fallback if kategori is null
          price: `Rp ${product.price.toLocaleString("id-ID")}`, // Format price in IDR
          oldPrice: product.oldPrice ? `Rp ${product.oldPrice.toLocaleString("id-ID")}` : null, // Optional
          rating: product.rating || "4.5", // Fallback rating
          sold: product.sold || "100+ terjual", // Fallback sold count
          // image: product.image ? { uri: `${BASE_IMAGE_URL}${product.image}` } : require("@/assets/images/placeholder.png"), // Fallback image
        }));

        // Map categories to the expected format
        const formattedCategories = categories.map((category) => ({
          id: category.id.toString(),
          kategori: category.kategori,
        }));

        setProducts(formattedProducts);
        setCategories([{ id: "all", kategori: "All Menu" }, ...formattedCategories]); // Add "All Menu" category
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === "All Menu") {
      return matchesSearch;
    } else {
      return matchesSearch && item.category === selectedCategory;
    }
  });

  // Handle Add to Cart with API call
  const handleAddToCart = async (item, navigate) => {
    try {
      setAddingToCart(true);
      
      // Data yang akan dikirim ke API
      const cartData = {
        product_id: parseInt(item.id), // Convert back to number for API
        user_id: user?.id, // TODO: Replace with actual user ID from auth context/storage
        quantity: 1
      };

      const response = await axiosInstance.post("/cart", cartData);
      
      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Berhasil",
          `${item.name} berhasil ditambahkan ke keranjang!`,
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Item added to cart successfully");
                navigate('/cart'); // Redirect ke halaman /cart
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert(
        "Error",
        "Gagal menambahkan item ke keranjang. Silakan coba lagi.",
        [{ text: "OK" }]
      );
    } finally {
      setAddingToCart(false);
    }
};

  const toggleWishlist = (item) => {
    if (wishlist.some((fav) => fav.id === item.id)) {
      setWishlist(wishlist.filter((fav) => fav.id !== item.id));
    } else {
      setWishlist([...wishlist, item]);
    }
  };

  const goToWishlist = () => {
    if (wishlist.length > 0) {
      console.log("Data wishlist yang dikirim:", wishlist);
      router.push({
        pathname: "/wishlist",
        params: { wishlist: JSON.stringify(wishlist) },
      });
    } else {
      console.log("Wishlist kosong, tidak ada data yang dikirim.");
      router.push({
        pathname: "/wishlist",
        params: { wishlist: JSON.stringify([]) },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Error: {error}</Text>
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
        <TouchableOpacity onPress={goToWishlist} style={styles.wishlistIcon}>
          <Ionicons name="heart" size={24} color="red" />
          {wishlist.length > 0 && (
            <View style={styles.wishlistBadge}>
              <Text style={styles.wishlistBadgeText}>{wishlist.length}</Text>
            </View>
          )}
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

      <Text style={styles.sectionTitle}>Terlaris</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.carouselContainer}
      >
        {[
          require("@/assets/images/salad2.png"),
          require("@/assets/images/burger2.png"),
          require("@/assets/images/pizza.png"),
          require("@/assets/images/sushi.png"),
          require("@/assets/images/pie-apel.png"),
          require("@/assets/images/muffin-blueberry.png"),
        ].map((image, index) => (
          <View key={index} style={styles.carouselItem}>
            <Image source={image} style={styles.terlarisImage} />
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Kategori Menu</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}
        contentContainerStyle={styles.filterContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategory === category.kategori && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedCategory(category.kategori)}
          >
            <Ionicons
              name={
                category.kategori === "All Menu"
                  ? "list"
                  : category.kategori === "Makanan"
                  ? "fast-food"
                  : category.kategori === "Minuman"
                  ? "beer"
                  : "ice-cream"
              }
              size={20}
              color={selectedCategory === category.kategori ? "#FFF" : "#333"}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === category.kategori && styles.activeFilterButtonText,
              ]}
            >
              {category.kategori}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Rekomendasi</Text>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <Image source={item.image} style={styles.productImage} />
            <TouchableOpacity
              style={styles.favorite}
              onPress={() => toggleWishlist(item)}
            >
              <Ionicons
                name={
                  wishlist.some((fav) => fav.id === item.id)
                    ? "heart"
                    : "heart-outline"
                }
                size={20}
                color={
                  wishlist.some((fav) => fav.id === item.id) ? "red" : "black"
                }
              />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.rating}>
                ⭐ {item.rating} {item.sold}
              </Text>
              {item.oldPrice && <Text style={styles.oldPrice}>{item.oldPrice}</Text>}
              <Text style={styles.price}>{item.price}</Text>
              <TouchableOpacity
                style={[
                  styles.cartButton,
                  addingToCart && styles.cartButtonDisabled
                ]}
                onPress={() => handleAddToCart(item)}
                disabled={addingToCart}
              >
                <Text style={styles.cartText}>
                  {addingToCart ? "Adding..." : "Add to cart"}
                </Text>
                <Ionicons name="cart-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff", // Peach Muda
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "333", // Kuning
    elevation: 4, // Increased elevation for a more pronounced shadow
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26, // Increased font size for better visibility
    fontWeight: "bold",
    color: "#536001", // Hijau Tua
  },
  wishlistIcon: {
    position: "relative",
  },
  wishlistBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF7C71", // Merah Muda
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  wishlistBadgeText: {
    color: "white",
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: "#FFB337", // Kuning
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, // Increased shadow opacity for a bolder effect
    shadowRadius: 6, // Increased shadow radius for a softer shadow
    elevation: 4, // Increased elevation for a more pronounced shadow
  },
  searchIcon: {
    marginRight: 10,
    color: "#536001", // Hijau Tua
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 24, // Increased font size for better visibility
    fontWeight: "bold",
    color: "#536001", // Hijau Tua
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  carouselContainer: {
    marginTop: 16, // Add space above the carousel
    marginBottom: 16, // Add space below the carousel
    marginLeft: 10,
    paddingHorizontal: 16, // Add horizontal padding to the carousel
  },
  carouselItem: {
    width: 250,
    height: 150,
    marginRight: 10,
    borderRadius: 10, // Optional: Add rounded corners to carousel items
    overflow: "hidden", // Ensure the image does not overflow the rounded corners
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  terlarisImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  filterScrollContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingRight: 32, // Extra padding at the end
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFB337", // Kuning
    backgroundColor: "#ffff", // Peach Muda
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100, // Minimum width for better appearance
  },
  activeFilterButton: {
    backgroundColor: "#89AC46", // Hijau Tua
    borderColor: "#89AC46",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  activeFilterButtonText: {
    color: "#FFF",
  },
  categoryList: {
    paddingLeft: 16,
    marginTop: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background for the card
    borderRadius: 12,
    margin: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3, // Increased shadow opacity for a bolder effect
    shadowOffset: { width: 0, height: 4 }, // Increased shadow offset for more depth
    shadowRadius: 6, // Increased shadow radius for a softer shadow
    elevation: 5, // Increased elevation for Android
    borderWidth: 1, // Add a border
    borderColor: "#FFB337", // Use Kuning for the border
  },
  productImage: {
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
    backgroundColor: "#536001", // Hijau Tua
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
  oldPrice: {
    fontSize: 12,
    color: "#777",
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF7C71", // Merah Muda
    marginTop: 2,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB337", // Kuning
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  cartButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  cartText: {
    color: "white",
    marginRight: 5,
    fontWeight: "bold",
  },
});