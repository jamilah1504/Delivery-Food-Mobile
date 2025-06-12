import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

const deliveryMethods = [
  {
    id: "gojek",
    name: "Gojek",
    image: require("@/assets/images/gojek.png"),
    fee: 1000,
  },
  {
    id: "grab",
    name: "Grab",
    image: require("@/assets/images/grab.png"),
    fee: 1500,
  },
  {
    id: "shopeefood",
    name: "Shopee Food",
    image: require("@/assets/images/shopeefood.png"),
    fee: 2000,
  },
];

export default function DeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [savedAddress, setSavedAddress] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    subtotal: 0,
    paymentFee: 0,
    total: 0,
  });
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load saved address
        const addressData = await AsyncStorage.getItem("userAddress");
        if (addressData) {
          setSavedAddress(JSON.parse(addressData));
        }

        // Parse and validate payment data
        if (params.paymentData) {
          const parsedPayment = JSON.parse(params.paymentData);
          setPaymentData({
            subtotal: Number(parsedPayment.subtotal) || 0,
            paymentFee: Number(parsedPayment.paymentFee) || 0,
            total: Number(parsedPayment.total) || 0,
            paymentMethod: parsedPayment.paymentMethod,
            paymentOption: parsedPayment.paymentOption,
          });
        }

        // Parse cart items
        if (params.cartItems) {
          setCartItems(JSON.parse(params.cartItems));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotal = () => {
    const deliveryFee = selectedMethod
      ? deliveryMethods.find((m) => m.id === selectedMethod).fee
      : 0;
    return paymentData.subtotal + paymentData.paymentFee + deliveryFee;
  };

  const handleConfirmDelivery = async () => {
    if (!selectedMethod) {
      Alert.alert("Peringatan", "Silakan pilih metode pengiriman");
      return;
    }

    const deliveryMethod = deliveryMethods.find((m) => m.id === selectedMethod);
    const totalAmount = calculateTotal();

    try {
      // Save delivery data
      await AsyncStorage.setItem(
        "deliveryData",
        JSON.stringify({
          method: deliveryMethod.name,
          fee: deliveryMethod.fee,
          image: deliveryMethod.image,
          address: savedAddress,
        })
      );

      // Navigate to summary screen with all data
      router.push({
        pathname: "/property/SummaryScreen",
        params: {
          paymentData: JSON.stringify({
            ...paymentData,
            total: totalAmount,
          }),
          deliveryData: JSON.stringify({
            method: deliveryMethod.name,
            fee: deliveryMethod.fee,
            image: deliveryMethod.image,
            address: savedAddress,
          }),
          cartItems: params.cartItems,
          totalAmount: totalAmount.toString(),
        },
      });
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Gagal memproses pengiriman");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Metode Pengiriman</Text>

      {/* Delivery Options */}
      <View style={styles.optionsContainer}>
        {deliveryMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.optionCard,
              selectedMethod === method.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Image source={method.image} style={styles.methodIcon} />
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodFee}>
                Rp {method.fee.toLocaleString("id-ID")}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Delivery Address */}
      <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
      <View style={styles.addressContainer}>
        <Image
          source={require("@/assets/images/maps.png")}
          style={styles.mapImage}
        />
        {savedAddress ? (
          <>
            <Text style={styles.addressText}>{savedAddress.street}</Text>
            <Text style={styles.addressText}>
              {savedAddress.city}, {savedAddress.province}{" "}
              {savedAddress.postalCode}
            </Text>
            <Text style={styles.addressText}>Kontak: {savedAddress.phone}</Text>
          </>
        ) : (
          <Text style={styles.noAddressText}>Belum ada alamat pengiriman</Text>
        )}
      </View>

      {/* Payment Summary */}
      <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
      <View style={styles.summaryContainer}>
        {/* <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>
            Rp {paymentData.subtotal.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Biaya Pembayaran:</Text>
          <Text style={styles.summaryValue}>
            Rp {paymentData.paymentFee.toLocaleString("id-ID")}
          </Text>
        </View> */}
        {selectedMethod && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Biaya Pengiriman:</Text>
            <Text style={styles.summaryValue}>
              Rp{" "}
              {deliveryMethods
                .find((m) => m.id === selectedMethod)
                .fee.toLocaleString("id-ID")}
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            Rp {calculateTotal().toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleConfirmDelivery}
      >
        <Text style={styles.continueButtonText}>Lanjutkan ke Pembayaran</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  selectedOption: {
    borderColor: "#FFA500",
    backgroundColor: "#FFF8E1",
  },
  methodIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  methodFee: {
    fontSize: 14,
    color: "#666",
  },
  summaryContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#555",
  },
  summaryValue: {
    fontWeight: "500",
  },
  mapImage: {
    width: "100%",
    height: 600,
    marginTop: 10,
    borderRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#FFA500",
  },
  addressContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  addressText: {
    marginBottom: 5,
    color: "#555",
    fontSize: 14,
  },
  noAddressText: {
    color: "#e74c3c",
    fontStyle: "italic",
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
