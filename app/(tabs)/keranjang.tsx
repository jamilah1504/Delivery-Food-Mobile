import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

type CartItem = {
  id: string;
  product_id: string;
  product:{
    name: string;
    price: string;
    image: any;
  }
  
  quantity: number;
};

const USER_ID = 1; // Default user_id

export default function Keranjang() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);


  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/cart/1');
      console.log("Cart response:", response.data); // Debug response
      const cartData = response.data.cart || [];
      // Validate cart items
      if (Array.isArray(cartData)) {
        setCartItems(cartData);
      } else {
        console.warn("Invalid cart data format:", cartData);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Gagal mengambil data keranjang");
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart via axiosInstance
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/cart`, {
        user_id: USER_ID,
        product_id: productId,
        quantity: quantity,
      });
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart data
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Gagal menambahkan item ke keranjang");
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity via axiosInstance
  const updateCartQuantity = async (cartId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/cart/${cartId}`, {
        user_id: USER_ID,
        quantity: quantity,
      });
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart data
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      Alert.alert("Error", "Gagal mengupdate jumlah item");
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart via axiosInstance
  const removeFromCart = async (cartId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/cart/${cartId}`);
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart data
        Alert.alert("Berhasil", "Item berhasil dihapus dari keranjang");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      Alert.alert("Error", "Gagal menghapus item dari keranjang");
    } finally {
      setLoading(false);
    }
  };

  // Load cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Handle adding item from params (if coming from product page)
  useEffect(() => {
    if (params.item) {
      const item = JSON.parse(params.item as string);
      addToCart(item.product_id || item.id, 1);
    }
  }, [params.item]);

  // Fungsi untuk menambah jumlah item
  const increaseQuantity = async (cartId: string) => {
    const currentItem = cartItems.find(item => item.id === cartId);
    if (currentItem) {
      await updateCartQuantity(cartId, currentItem.quantity + 1);
    }
  };

  // Fungsi untuk mengurangi jumlah item
  const decreaseQuantity = async (cartId: string) => {
    const currentItem = cartItems.find(item => item.id === cartId);
    if (currentItem) {
      if (currentItem.quantity > 1) {
        await updateCartQuantity(cartId, currentItem.quantity - 1);
      } else {
        // Jika quantity adalah 1, tampilkan konfirmasi sebelum menghapus
        Alert.alert(
          "Konfirmasi",
          "Item akan dihapus dari keranjang karena jumlahnya akan menjadi 0. Lanjutkan?",
          [
            {
              text: "Batal",
              style: "cancel",
            },
            {
              text: "Hapus",
              style: "destructive",
              onPress: () => removeFromCart(cartId),
            },
          ],
          { cancelable: true }
        );
      }
    }
  };

  // Fungsi untuk menghapus item dari keranjang dengan konfirmasi
  const removeItem = (cartId: string) => {
    const currentItem = cartItems.find(item => item.id === cartId);
    const itemName = currentItem?.product?.name || "Item ini";
    
    Alert.alert(
      "Hapus Item",
      `Apakah Anda yakin ingin menghapus "${itemName}" dari keranjang?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => removeFromCart(cartId),
        },
      ],
      { 
        cancelable: true,
        userInterfaceStyle: 'light' // Memastikan alert tampil dengan style yang konsisten
      }
    );
  };

  const parsePrice = (priceValue: string | number | null | undefined): number => {
  // Tetap amankan dari nilai null/undefined
  if (priceValue === null || priceValue === undefined || priceValue === '') {
    return 0;
  }

  // Jika sudah berupa angka, langsung kembalikan
  if (typeof priceValue === 'number') {
    return priceValue;
  }

  // Hapus semua karakter yang BUKAN digit atau titik.
  // Ini akan melindungi dari "Rp", spasi, dll. tapi mempertahankan "20000.00"
  const cleanedString = priceValue.replace(/[^0-9.]/g, '');

  // Gunakan parseFloat untuk membaca angka desimal.
  const price = parseFloat(cleanedString);

  // Fallback jika hasilnya NaN
  return isNaN(price) ? 0 : price;
};

  // Hitung total harga dengan error handling
  const totalAmount: number = cartItems.reduce((sum, item) => {
    // TypeScript tahu `sum` adalah number dan `item` adalah CartItem.
    // `?.` (Optional Chaining) sangat berguna di sini dan didukung penuh.
    const price = parsePrice(item.product?.price);
    
    // Pastikan kuantitas juga merupakan angka yang valid.
    const quantity = Number(item.quantity) || 0;

    return sum + (price * quantity);
  }, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      console.log('Keranjang Anda kosong');
      return;
    }

    // Validasi setiap item di keranjang
    const invalidItems = cartItems.filter(item => 
      !item.product || 
      !item.product.name || 
      !item.product.price || 
      item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      console.log('Ada item yang tidak valid di keranjang');
      return;
    }

    // Prepare checkout data
    const checkoutData = {
      items: cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          category: {
            id: item.product.category.id,
            category: item.product.category.category
          }
        }
      })),
      totalAmount: totalAmount,
      itemCount: cartItems.length,
      summary: {
        subtotal: totalAmount,
        shipping: 0, // Bisa diatur sesuai kebutuhan
        tax: 0, // Bisa diatur sesuai kebutuhan
        total: totalAmount
      }
    };

    try {
      // Navigate to confirmation/checkout page
      router.push({
        pathname: "/property/ConfirmationPayment",
        params: {
          items: JSON.stringify(checkoutData.items),
          totalAmount: totalAmount.toString(),
          itemCount: checkoutData.itemCount.toString(),
          checkoutData: JSON.stringify(checkoutData)
        },
      });
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      console.log('Gagal menuju halaman checkout');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keranjang</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keranjang Anda kosong</Text>
          <Text style={styles.emptySubText}>Yuk, tambahkan produk favorit Anda!</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image
                source={{
                  uri: `http://127.0.0.1:8000/storage/${
                    item.product?.image || "placeholder.jpg"
                  }`,
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product?.name || "Unknown Item"}</Text>
                <Text style={styles.itemPrice}>
                  {item.product?.price || "Rp. 0"}
                </Text>
                <Text style={styles.itemSubtotal}>
                  Subtotal: Rp. {(parsePrice(item.product?.price) * item.quantity).toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => decreaseQuantity(item.id)}
                  style={[styles.quantityButton, loading && styles.disabledButton]}
                  disabled={loading}
                >
                  <Ionicons name="remove-circle-outline" size={24} color={loading ? "#ccc" : "#555"} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => increaseQuantity(item.id)}
                  style={[styles.quantityButton, loading && styles.disabledButton]}
                  disabled={loading}
                >
                  <Ionicons name="add-circle-outline" size={24} color={loading ? "#ccc" : "#555"} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={[styles.removeButton, loading && styles.disabledButton]}
                disabled={loading}
              >
                <Ionicons name="close-circle-outline" size={24} color={loading ? "#ccc" : "red"} />
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {cartItems.length > 0 && (
        <>
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total Belanja</Text>
              <Text style={styles.itemCount}>({cartItems.length} item)</Text>
            </View>
            <Text style={styles.totalPrice}>
              Rp. {totalAmount.toLocaleString("id-ID")}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, loading && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={loading}
          >
            <Text style={styles.checkoutText}>
              {loading ? "Loading..." : "CHECK OUT"}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
    color: "#2E5BFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
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
    borderColor: "#2E5BFF",
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF7C71",
    marginBottom: 2,
  },
  itemSubtotal: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
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
    minWidth: 30,
    textAlign: "center",
  },
  removeButton: {
    padding: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFDAB9",
    borderRadius: 10,
    marginTop: 10,
  },
  totalContainer: {
    flexDirection: "column",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  itemCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  checkoutButton: {
    backgroundColor: "#2E5BFF",
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