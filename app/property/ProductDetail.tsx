import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

const ProductDetail = () => {
  const params = useLocalSearchParams();
  const details = { item: JSON.stringify(item) }; // Access the item directly

  return (
    <ScrollView style={styles.container}>
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productRating}>Rating: {item.rating} ⭐</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <Text style={styles.productOldPrice}>{item.oldPrice}</Text>
        <Text style={styles.productDescription}>
          This is a delicious {item.name} that you will love!
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.orderButtosn}>
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          <FlatList
            data={item.reviews} // Assuming item.reviews is an array of review objects
            keyExtractor={(review) => review.id}
            renderItem={({ item: review }) => (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewRating}>
                  Rating: {review.rating} ⭐
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Peach Muda
  },
  productImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  detailsContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#536001", // Hijau Tua
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: "#FFB337", // Kuning
    marginBottom: 4,
  },
  productRating: {
    fontSize: 16,
    color: "#FF7C71", // Merah Muda
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF7C71", // Merah Muda
    marginBottom: 4,
  },
  productOldPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "#777",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  orderButton: {
    backgroundColor: "#FFB337", // Kuning
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewsContainer: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#536001", // Hijau Tua
    marginBottom: 8,
  },
  reviewItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
  },
  reviewRating: {
    fontSize: 12,
    color: "#FF7C71", // Merah Muda for review rating
    marginTop: 4,
  },
});

export default ProductDetail;
