import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type CartItem = {
  id: string;
  name: string;
  price: string;
  image: any;
  quantity: number;
};

export default function Keranjang() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Tambahkan item ke keranjang saat parameter diterima
  useEffect(() => {
    if (params.item) {
      const item = JSON.parse(params.item);

      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (cartItem) => cartItem.id === item.id
        );
        if (existingItem) {
          return prevItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          return [...prevItems, { ...item, quantity: 1 }];
        }
      });
    }
  }, [params.item]);

  // Fungsi untuk menambah jumlah item
  const increaseQuantity = (id: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Fungsi untuk mengurangi jumlah item
  const decreaseQuantity = (id: string) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Fungsi untuk menghapus item dari keranjang
  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Hitung total harga
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("Rp. ", "").replace(".", ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keranjang</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => decreaseQuantity(item.id)}
                style={styles.quantityButton}
              >
                <Ionicons name="remove-circle-outline" size={24} color="#555" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => increaseQuantity(item.id)}
                style={styles.quantityButton}
              >
                <Ionicons name="add-circle-outline" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total Belanja</Text>
        <Text style={styles.totalPrice}>
          Rp. {totalAmount.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() =>
          router.push({
            pathname: "/property/checkout",
            params: {
              items: JSON.stringify(cartItems),
              totalAmount: totalAmount,
            },
          })
        }
      >
        <Text style={styles.checkoutText}>CHECK OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#536001",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FFB337",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    color: "#FF7C71",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  quantityButton: {
    padding: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  removeButton: {
    padding: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFDAB9",
    borderRadius: 10,
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  checkoutButton: {
    backgroundColor: "#FFB337",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
