import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  {
    id: "1",
    name: "Burger",
    category: "Makanan",
    rating: 4.7,
    sold: "1K terjual",
    price: "Rp. 16.500",
    oldPrice: "Rp. 21.000",
    image: require("@/assets/images/burger2.png"),
  },
  {
    id: "2",
    name: "Salad Buah",
    category: "Makanan",
    rating: 4.6,
    sold: "1K terjual",
    price: "Rp. 9.500",
    oldPrice: "Rp. 12.000",
    image: require("@/assets/images/salad2.png"),
  },
  {
    id: "3",
    name: "Pizza",
    category: "Makanan",
    rating: 4.8,
    sold: "2K terjual",
    price: "Rp. 25.000",
    oldPrice: "Rp. 30.000",
    image: require("@/assets/images/pizza.png"),
  },
  {
    id: "4",
    name: "Sushi",
    category: "Makanan",
    rating: 4.5,
    sold: "800 terjual",
    price: "Rp. 35.000",
    oldPrice: "Rp. 40.000",
    image: require("@/assets/images/sushi.png"),
  },
  {
    id: "5",
    name: "Ayam Goreng",
    category: "Makanan",
    rating: 4.4,
    sold: "1.5K terjual",
    price: "Rp. 18.000",
    oldPrice: "Rp. 22.000",
    image: require("@/assets/images/ayam.png"),
  },
  {
    id: "6",
    name: "Jus",
    category: "Minuman",
    rating: 4.9,
    sold: "3K terjual",
    price: "Rp. 10.000",
    oldPrice: "Rp. 15.000",
    image: require("@/assets/images/jus.png"),
  },
  {
    id: "7",
    name: "Es Krim",
    category: "Dessert",
    rating: 4.9,
    sold: "3K terjual",
    price: "Rp. 10.000",
    oldPrice: "Rp. 15.000",
    image: require("@/assets/images/es-krim.png"),
  },
  {
    id: "8",
    name: "Teh Manis",
    category: "Minuman",
    rating: 4.2,
    sold: "2K terjual",
    price: "Rp. 5.000",
    oldPrice: "Rp. 7.000",
    image: require("@/assets/images/teh-manis.png"),
  },
  {
    id: "9",
    name: "Kopi Susu",
    category: "Minuman",
    rating: 4.5,
    sold: "1.8K terjual",
    price: "Rp. 12.000",
    oldPrice: "Rp. 15.000",
    image: require("@/assets/images/kopi-susu.png"),
  },
  {
    id: "10",
    name: "Jus Jeruk",
    category: "Minuman",
    rating: 4.7,
    sold: "2.5K terjual",
    price: "Rp. 11.000",
    oldPrice: "Rp. 14.000",
    image: require("@/assets/images/jus-jeruk.png"),
  },
  {
    id: "11",
    name: "Milk Shake",
    category: "Minuman",
    rating: 4.6,
    sold: "1.2K terjual",
    price: "Rp. 13.000",
    oldPrice: "Rp. 16.000",
    image: require("@/assets/images/milkshake.png"),
  },
  {
    id: "12",
    name: "Brownies",
    category: "Dessert",
    rating: 4.8,
    sold: "1.5K terjual",
    price: "Rp. 15.000",
    oldPrice: "Rp. 18.000",
    image: require("@/assets/images/brownies.png"),
  },
  {
    id: "13",
    name: "Cake Coklat",
    category: "Dessert",
    rating: 4.4,
    sold: "1K terjual",
    price: "Rp. 20.000",
    oldPrice: "Rp. 25.000",
    image: require("@/assets/images/cake-coklat.png"),
  },
  {
    id: "14",
    name: "Puding",
    category: "Dessert",
    rating: 4.6,
    sold: "800 terjual",
    price: "Rp. 8.000",
    oldPrice: "Rp. 10.000",
    image: require("@/assets/images/puding.png"),
  },
  {
    id: "15",
    name: "Pie Apel",
    category: "Dessert",
    rating: 4.9,
    sold: "2K terjual",
    price: "Rp. 18.000",
    oldPrice: "Rp. 22.000",
    image: require("@/assets/images/pie-apel.png"),
  },
  {
    id: "16",
    name: "Muffin Blueberry",
    category: "Dessert",
    rating: 4.7,
    sold: "1.1K terjual",
    price: "Rp. 12.000",
    oldPrice: "Rp. 15.000",
    image: require("@/assets/images/muffin-blueberry.png"),
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Menu");
  const [wishlist, setWishlist] = useState([]);
  const router = useRouter();

  const filteredCategories = categories.filter((item) => {
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
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "All Menu" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("All Menu")}
        >
          <Ionicons name="list" size={20} color="#333" />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === "All Menu" && styles.activeFilterButtonText,
            ]}
          >
            All Menu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "Makanan" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("Makanan")}
        >
          <Ionicons name="fast-food" size={20} color="#333" />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === "Makanan" && styles.activeFilterButtonText,
            ]}
          >
            Makanan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "Minuman" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("Minuman")}
        >
          <Ionicons name="beer" size={20} color="#333" />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === "Minuman" && styles.activeFilterButtonText,
            ]}
          >
            Minuman
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "Dessert" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory("Dessert")}
        >
          <Ionicons name="ice-cream" size={20} color="#333" />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === "Dessert" && styles.activeFilterButtonText,
            ]}
          >
            Dessert
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Rekomendasi</Text>
      <FlatList
        data={filteredCategories.filter((item) => item.price)}
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
              <Text style={styles.oldPrice}>{item.oldPrice}</Text>
              <Text style={styles.price}>{item.price}</Text>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.cartText}>Add to cart</Text>
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 12,
    marginBottom: 12,
  },
  filterButton: {
    marginTop: 16, // Add space above the carousel
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginLeft: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFB337", // Kuning
    backgroundColor: "#ffff", // Peach Muda
    flexDirection: "row",
    alignItems: "center",
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
  cartText: {
    color: "white",
    marginRight: 5,
    fontWeight: "bold",
  },
});
