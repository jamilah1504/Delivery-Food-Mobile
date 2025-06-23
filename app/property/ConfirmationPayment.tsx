import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from 'react-native-webview';
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/utils/AuthContext";
import axios from "axios";

export default function ConfirmationScreen() {
  const { items, totalAmount, itemCount } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [snapToken, setSnapToken] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  
  const parsedCart = JSON.parse(items as string || "[]");
  const total = parseFloat(totalAmount as string || "0");
  const count = parseInt(itemCount as string || "0");

  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        email: user.email || "",
        address: (user as any).address || "",
        phone: (user as any).phone || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    if (!userData.name || !userData.email || !userData.address || !userData.phone) {
      Alert.alert("Data Tidak Lengkap", "Pastikan semua informasi pelanggan telah terisi.");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert("Error", "Sesi Anda telah berakhir. Silakan login kembali.");
      router.replace('/sign-in');
      return;
    }
    if (!parsedCart || parsedCart.length === 0) {
      Alert.alert("Error", "Keranjang Anda kosong.");
      return;
    }

    setIsLoading(true);
    
    try {
      // ... (kode paymentData tetap sama)
      const paymentData = {
        customer: { user_id: user.id, name: userData.name, email: userData.email, address: userData.address, phone: userData.phone, },
        items: parsedCart.map(item => ({ product_id: item.product.id, product_name: item.product.name, price: parseFloat(item.product.price || 0), quantity: item.quantity || 1, subtotal: parseFloat(item.product.price || 0) * (item.quantity || 1), category: item.product.category?.category || "Uncategorized", })),
        order_summary: { total_amount: total, total_items: count, order_date: formattedDate, order_time: formattedTime, },
      };
      
      const response = await axiosInstance.post(`/create-transaction`, paymentData);
      
      if (response.data.snap_token) {
        setSnapToken(response.data.snap_token);
        setShowWebView(true);
      } else {
        throw new Error('Snap token tidak diterima dari server');
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      let errorMessage = "Terjadi kesalahan saat memproses pembayaran";
      if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.message || "Error dari server";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================================
  // FUNGSI BARU UNTUK MENANGANI HASIL PEMBAYARAN
  // ======================================================================
  const handleWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;
    if (!url) return;

    // Cek jika URL adalah callback dari Midtrans yang menandakan transaksi selesai
    // URL ini adalah contoh, sesuaikan dengan URL callback Midtrans Anda jika berbeda
    if (url.includes('midtrans/callback') || url.includes('transaction_status')) {
      // Fungsi untuk mengambil parameter dari URL
      const getUrlParams = (url: string) => {
        const params = {};
        const regex = /[?&]([^=#]+)=([^&#]*)/g;
        let match;
        while ((match = regex.exec(url))) {
          params[match[1]] = decodeURIComponent(match[2]);
        }
        return params;
      };

      const params = getUrlParams(url);
      const transactionStatus = params['transaction_status'];

      // Sembunyikan WebView
      setShowWebView(false);

      if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
        // --- PEMBAYARAN BERHASIL ---
        Alert.alert(
          "Pembayaran Berhasil",
          "Terima kasih, pembayaran Anda telah berhasil kami terima.",
          [{ 
            text: "OK", 
            onPress: () => router.replace('../property/HistoryBelanjaScreen') // Ganti dengan path halaman history Anda yang benar
          }]
        );
      } else if (transactionStatus === 'pending') {
        // --- PEMBAYARAN PENDING ---
        Alert.alert(
          "Pembayaran Tertunda",
          "Pembayaran Anda sedang menunggu penyelesaian. Anda akan diarahkan ke halaman utama.",
          [{ 
            text: "OK", 
            onPress: () => router.replace('/') // Arahkan ke home
          }]
        );
      } else {
        // --- PEMBAYARAN GAGAL (deny, cancel, expire, dll) ---
        Alert.alert(
          "Pembayaran Gagal",
          "Maaf, pembayaran Anda gagal diproses. Silakan coba lagi.",
          [{ 
            text: "OK", 
            onPress: () => router.replace('/') // Arahkan ke home
          }]
        );
      }
    }
  };

  // JIKA SEDANG MEMBUKA WEBVIEW, TAMPILKAN WEBVIEW SAJA
  if (showWebView && snapToken) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          source={{ uri: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}` }}
          // AKTIFKAN onNavigationStateChange untuk memanggil fungsi di atas
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />
      </SafeAreaView>
    );
  }

  // ... (Sisa JSX lainnya tetap sama)
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ... (Isi ScrollView tidak berubah) ... */}
        {/* ... */}
         {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
          
          {parsedCart.length > 0 && (
            <View style={styles.orderSummary}>
              {parsedCart.map((item, index) => (
                <View key={index} style={styles.orderRow}>
                  {/* {renderFoodImage(item)} */}
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
          
          {isLoading && !snapToken ? ( // Tampilkan loading hanya saat data form dimuat
            <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  value={userData.name}
                  editable={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  value={userData.email}
                  editable={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Alamat Lengkap</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, styles.disabledInput]}
                  value={userData.address}
                  editable={false}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nomor Telepon</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  value={userData.phone}
                  editable={false}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}
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
            {isLoading && !showWebView ? ( // Tampilkan loading hanya saat proses ke pembayaran
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

// ... (Styles object tidak berubah)
const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: "#fff" 
    },
    disabledInput: {
        backgroundColor: '#f0f0f0', // Warna abu-abu untuk field yang tidak bisa diedit
        color: '#666',
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