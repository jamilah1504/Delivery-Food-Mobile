import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ConfirmationScreen() {
  const { items, totalAmount, itemCount, checkoutData } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const parsedCart = JSON.parse(items || "[]");
  const total = parseFloat(totalAmount || "0");
  const count = parseInt(itemCount || "0");
  const fullCheckoutData = checkoutData ? JSON.parse(checkoutData) : null;

  // User data state - Initialize with user data when available
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  
  const [imageLoading, setImageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  // Load saved user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const fetchedUser: User | null = userData ? JSON.parse(userData) : null;
      setUser(fetchedUser);
      
      // Load saved form data
      const savedUserData = await AsyncStorage.getItem("userData");
      
      if (savedUserData) {
        const parsed = JSON.parse(savedUserData);
        setUserData(parsed);
      } else if (fetchedUser) {
        // If no saved form data, initialize with user data
        setUserData({
          name: fetchedUser.name || "",
          email: fetchedUser.email || "",
          address: "",
          phone: "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const validateForm = () => {
    if (!userData.name.trim()) {
      Alert.alert("Error", "Nama harus diisi");
      return false;
    }
    if (!userData.email.trim()) {
      Alert.alert("Error", "Email harus diisi");
      return false;
    }
    if (!userData.email.includes("@")) {
      Alert.alert("Error", "Format email tidak valid");
      return false;
    }
    if (!userData.address.trim()) {
      Alert.alert("Error", "Alamat harus diisi");
      return false;
    }
    if (!userData.phone.trim()) {
      Alert.alert("Error", "Nomor telepon harus diisi");
      return false;
    }
    if (userData.phone.length < 10) {
      Alert.alert("Error", "Nomor telepon minimal 10 digit");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) return;

    // Check if user is logged in
    if (!user) {
      Alert.alert("Error", "Anda harus login terlebih dahulu");
      return;
    }

    // Check if cart has items
    if (!parsedCart || parsedCart.length === 0) {
      Alert.alert("Error", "Keranjang kosong");
      return;
    }

    setIsLoading(true);
    
    try {
      // Save user data
      await saveUserData();
      
      // Prepare data to send to API
      const paymentData = {
        customer: {
          id: user.id,
          name: userData.name, // Use form data instead of user.name
          email: userData.email, // Use form data instead of user.email
          address: userData.address,
          phone: userData.phone,
        },
        items: parsedCart.map(item => {
          // Ensure all required fields are present
          if (!item.product) {
            throw new Error(`Product data missing for item ${item.id}`);
          }
          
          return {
            product_id: item.product.id,
            product_name: item.product.name,
            price: parseFloat(item.product.price || 0),
            quantity: item.quantity || 1,
            subtotal: parseFloat(item.product.price || 0) * (item.quantity || 1),
            category: item.product.kategori?.kategori || "Uncategorized",
          };
        }),
        order_summary: {
          total_amount: total,
          total_items: count,
          order_date: formattedDate,
          order_time: formattedTime,
        },
        additional_data: fullCheckoutData,
      };

      console.log('Sending payment data:', JSON.stringify(paymentData, null, 2));

      // Validate payment data before sending
      if (!paymentData.customer.id || !paymentData.customer.name || !paymentData.customer.email) {
        throw new Error("Customer data is incomplete");
      }

      if (!paymentData.items || paymentData.items.length === 0) {
        throw new Error("No items to process");
      }

      // Send to payments API
      const response = await axiosInstance.post('/payments', paymentData);
      
      console.log('Payment response:', response.data);

      // Handle successful response
      if (response.status === 200 || response.status === 201) {
//         Alert.alert(
//           "Berhasil", 
//           "Pesanan berhasil diproses. Anda akan diarahkan ke halaman utama.",
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 // Clear cart or navigate to success page
//             }
//         }
//     ]
// );
        router.replace('./Payment'); // Navigate to home or success page
      } else {
        throw new Error('Unexpected response status');
      }

    } catch (error) {
      console.error("Error processing payment:", error);
      
      let errorMessage = "Terjadi kesalahan saat memproses pembayaran";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;
          
          console.log('Error response:', data);
          
          if (status === 400) {
            errorMessage = data.message || "Data yang dikirim tidak valid";
          } else if (status === 401) {
            errorMessage = "Anda perlu login terlebih dahulu";
          } else if (status === 500) {
            errorMessage = "Terjadi kesalahan pada server";
          } else {
            errorMessage = data.message || `Error: ${status}`;
          }
        } else if (error.request) {
          // Network error
          errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        }
      } else {
        // Other errors (validation, etc.)
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFoodImage = (item) => {
    return (
      <View style={styles.imageContainer}>
        {item.product?.image ? (
        //   <>
        //     <Image
        //       source={{ 
        //         uri: item.product.image === 'default.jpg' 
        //           ? 'https://via.placeholder.com/150' 
        //           : item.product.image 
        //       }}
        //       style={styles.foodImage}
        //       resizeMode="cover"
        //       onLoadStart={() => setImageLoading(true)}
        //       onLoadEnd={() => setImageLoading(false)}
        //       onError={() => setImageLoading(false)}
        //     />
        //     {imageLoading && (
        //       <ActivityIndicator
        //         style={styles.loadingIndicator}
        //         size="small"
        //         color="#000"
        //       />
        //     )}
        //   </>
        <div></div>
        ) : (
          <View style={[styles.foodImage, styles.imagePlaceholder]}>
            <FontAwesome name="cutlery" size={24} color="#999" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Konfirmasi Pesanan</Text>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
          
          {parsedCart.length > 0 && (
            <View style={styles.orderSummary}>
              {parsedCart.map((item, index) => (
                <View key={index} style={styles.orderRow}>
                  {renderFoodImage(item)}
                  <View style={styles.orderDetails}>
                    <Text style={styles.foodTitle} numberOfLines={2}>
                      {item.product?.name || "Produk"}
                    </Text>
                    <Text style={styles.foodPrice}>
                      Rp. {parseFloat(item.product?.price || 0).toLocaleString("id-ID")}
                    </Text>
                    <Text style={styles.foodCategory}>
                      {item.product?.kategori?.kategori || "Kategori"}
                    </Text>
                  </View>
                  <View style={styles.quantityInfo}>
                    <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                    <Text style={styles.subtotalText}>
                      Rp. {(parseFloat(item.product?.price || 0) * item.quantity).toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>
              Rp. {total.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {/* User Information Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nama Lengkap *</Text>
            <TextInput
              style={styles.textInput}
              value={userData.name}
              onChangeText={(text) => setUserData({...userData, name: text})}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              value={userData.email}
              onChangeText={(text) => setUserData({...userData, email: text})}
              placeholder="Masukkan email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Alamat Lengkap *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={userData.address}
              onChangeText={(text) => setUserData({...userData, address: text})}
              placeholder="Masukkan alamat lengkap"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nomor Telepon *</Text>
            <TextInput
              style={styles.textInput}
              value={userData.phone}
              onChangeText={(text) => setUserData({...userData, phone: text})}
              placeholder="Masukkan nomor telepon"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.button, styles.backButton]}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleProceedToPayment}
            style={[styles.button, styles.proceedButton]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>Proses Pembayaran</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  orderSummary: {
    marginBottom: 12,
  },
  orderRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  imageContainer: {
    position: "relative",
    width: 60,
    height: 60,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  loadingIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orderDetails: {
    flex: 1,
    marginRight: 8,
  },
  foodTitle: { 
    fontWeight: "600", 
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  foodCategory: {
    fontSize: 11,
    color: "#999",
  },
  quantityInfo: {
    alignItems: "flex-end",
  },
  quantityText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  subtotalText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    borderBottomColor: "#dee2e6",
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    backgroundColor: "#6c757d",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  proceedButton: {
    backgroundColor: "#28a745",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});