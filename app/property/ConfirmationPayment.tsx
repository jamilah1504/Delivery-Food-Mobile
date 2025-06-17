import React, { useEffect, useState } from "react";
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
  Modal, // BARU: Import Modal
  SafeAreaView, // BARU: Import SafeAreaView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { WebView } from 'react-native-webview'; // BARU: Import WebView
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

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // BARU: State untuk Midtrans
  const [snapToken, setSnapToken] = useState('');
  const [showWebView, setShowWebView] = useState(false);

  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataFromStorage = await AsyncStorage.getItem("user");
      const fetchedUser: User | null = userDataFromStorage ? JSON.parse(userDataFromStorage) : null;
      setUser(fetchedUser);
      
      const savedFormData = await AsyncStorage.getItem("userData");
      
      if (savedFormData) {
        setUserData(JSON.parse(savedFormData));
      } else if (fetchedUser) {
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
  
  const validateForm = () => { /* ... (fungsi validasi tidak berubah) ... */ return true; };

  // MODIFIKASI: Fungsi untuk memproses pembayaran
  const handleProceedToPayment = async () => {
    if (!validateForm()) return;
    // if (!user) {
    //   Alert.alert("Error", "Anda harus login terlebih dahulu");
    //   return;
    // }
    if (!parsedCart || parsedCart.length === 0) {
      Alert.alert("Error", "Keranjang kosong");
      return;
    }

    setIsLoading(true);
    
    try {
      await saveUserData();
      
      const paymentData = {
        customer: {
          user_id: 1,
          // user_id: user.id,
          name: userData.name,
          email: userData.email,
          address: userData.address,
          phone: userData.phone,
        },
        items: parsedCart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          price: parseFloat(item.product.price || 0),
          quantity: item.quantity || 1,
          subtotal: parseFloat(item.product.price || 0) * (item.quantity || 1),
          category: item.product.category?.category || "Uncategorized",
        })),
        order_summary: {
          total_amount: total,
          total_items: count,
          order_date: formattedDate,
          order_time: formattedTime,
        },
      };

      console.log('Mengirim data ke backend:', JSON.stringify(paymentData, null, 2));

      // Kirim data ke backend untuk mendapatkan Snap Token
      const response = await axiosInstance.post(`/create-transaction`, paymentData);
      
      if (response.data.snap_token) {
        setSnapToken(response.data.snap_token);
        setShowWebView(true); // Tampilkan WebView
      } else {
        throw new Error('Snap token tidak diterima');
      }

    } catch (error) {
      console.error("Error processing payment:", error);
      let errorMessage = "Terjadi kesalahan saat memproses pembayaran";
      if (axios.isAxiosError(error) && error.response) {
          console.log('Error response:', error.response.data);
          errorMessage = error.response.data.message || "Error dari server";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, transactionStatus) => {
    try {
      // Data yang akan dikirim sebagai body request
      const payload = {
        order_id: orderId,
        transaction_status: transactionStatus,
      };

      // Panggil endpoint menggunakan axiosInstance.post(endpoint, data)
      // - Axios otomatis mengubah payload menjadi JSON.
      // - baseURL dan headers sudah diatur di dalam instance.
      const response = await axiosInstance.post('/orders/update-status', payload);

      console.log(`Status for order ${orderId} updated successfully. Server response:`, response.data.message);

    } catch (error) {
      // Axios memberikan detail error yang lebih baik, yang bisa kita manfaatkan
      console.error(`Failed to update status for order ${orderId}.`);
      
      if (error.response) {
        // Request berhasil dikirim dan server merespons dengan kode status error (bukan 2xx)
        console.error('Error Data:', error.response.data);
        console.error('Error Status:', error.response.status);
      } else if (error.request) {
        // Request berhasil dikirim tapi tidak ada respons yang diterima (masalah jaringan)
        console.error('Error Request:', 'No response received from the server. Check your network or Ngrok connection.');
      } else {
        // Terjadi error saat menyiapkan request
        console.error('Error Message:', error.message);
      }
    }
  };

  const getUrlParams = (url) => {
    const params = {};
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    let match;
    while (match = regex.exec(url)) {
      params[match[1]] = match[2];
    }
    return params;
  };


  const handleWebViewNavigationStateChange = (newNavState) => {
    const { url } = newNavState;
    if (!url) return;

    const getUrlParams = (url) => {
      const params = {};
      const regex = /[?&]([^=#]+)=([^&#]*)/g;
      let match;
      while ((match = regex.exec(url))) {
        params[match[1]] = decodeURIComponent(match[2]);
      }
      return params;
    };

    const params = getUrlParams(url);
    const orderId = params.order_id;
    const transactionStatus = params.transaction_status;

    // Jika transaksi berhasil, arahkan ke halaman review dengan orderId
    if (orderId && (transactionStatus === 'capture' || transactionStatus === 'settlement')) {
      setShowWebView(false);
      updateOrderStatus(orderId, transactionStatus); // Panggil fungsi update
      Alert.alert("Sukses", "Pembayaran Anda telah berhasil diproses.", [
        {
          text: "OK",
          // Mengarahkan ke halaman review dengan menyertakan orderId
          onPress: () => router.replace(`/property/review?orderId=${orderId}`)
        }
      ]);
    }
    // Jika transaksi pending
    else if (orderId && transactionStatus === 'pending') {
      setShowWebView(false);
      updateOrderStatus(orderId, transactionStatus); // Panggil fungsi update
      Alert.alert("Tertunda", "Pembayaran Anda sedang menunggu penyelesaian.", [
        { text: "OK", onPress: () => router.replace('/') }
      ]);
    }
    // Jika webview ditutup atau transaksi gagal/dibatalkan
    else if (url.includes('/close') || (orderId && (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel'))) {
      setShowWebView(false);
      if (orderId) {
        updateOrderStatus(orderId, transactionStatus || 'cancelled'); // Panggil fungsi update
      }
      // Opsional: Anda bisa arahkan ke halaman lain jika diperlukan saat gagal/tutup
      // router.replace('/'); 
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
        <View></View>
        ) : (
          <View style={[styles.foodImage, styles.imagePlaceholder]}>
            <FontAwesome name="cutlery" size={24} color="#999" />
          </View>
        )}
      </View>
    );
  };

    // JIKA SEDANG MEMBUKA WEBVIEW, TAMPILKAN WEBVIEW SAJA
    if (showWebView && snapToken) {
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <WebView
            source={{ uri: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}` }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
        </SafeAreaView>
      );
    }


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
                      {item.product?.category?.name_category || "category"}
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
    color: "#161b44",
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
    backgroundColor: "#161b44",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});