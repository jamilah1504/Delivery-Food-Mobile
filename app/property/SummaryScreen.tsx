import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  id: string;
  name: string;
  price: number | string;
  quantity: number | string;
  image: any;
}

interface PaymentData {
  paymentMethod: string;
  paymentOption?: string;
  paymentFee: number | string;
  subtotal: number | string;
  total: number | string;
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  phone: string;
}

interface DeliveryData {
  method: string;
  fee: number | string;
  image: any;
  address: Address;
}

const paymentImages: Record<string, any> = {
  dana: require("@/assets/images/dana.png"),
  ovo: require("@/assets/images/ovo.png"),
  qris: require("@/assets/images/qris.png"),
  mandiri: require("@/assets/images/mandiri.png"),
  bca: require("@/assets/images/bca.png"),
  bri: require("@/assets/images/bri.png"),
  bni: require("@/assets/images/bni.png"),
};

const deliveryImages: Record<string, any> = {
  gojek: require("@/assets/images/gojek.png"),
  grab: require("@/assets/images/grab.png"),
  shopeefood: require("@/assets/images/shopeefood.png"),
};

// Helper function to safely convert to integer
const safeParseInteger = (value: any): number => {
  if (typeof value === "number") return Math.round(value);
  if (typeof value === "string") {
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, "");
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  return 0;
};

// Format currency without decimals
const formatCurrency = (value: number | string): string => {
  const num = safeParseInteger(value);
  return `Rp ${num.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
};

const SummaryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load cart items
        if (params.cartItems) {
          const parsedItems = JSON.parse(params.cartItems as string);
          const cleanedItems = parsedItems.map((item: any) => ({
            id: item.id || Math.random().toString(),
            name: item.name || "Produk",
            price: item.price,
            quantity: item.quantity,
            image: item.image || require("@/assets/images/default.png"),
          }));
          setCartItems(cleanedItems);
        }

        // Load payment data
        if (params.paymentData) {
          const parsedPayment =
            typeof params.paymentData === "string"
              ? JSON.parse(params.paymentData)
              : params.paymentData;

          console.log("Parsed Payment Data:", parsedPayment); // Debugging

          if (parsedPayment) {
            setPaymentData({
              paymentMethod: parsedPayment.paymentMethod || "Belum dipilih",
              paymentOption: parsedPayment.paymentOption,
              paymentFee: parsedPayment.paymentFee || 0,
              subtotal: parsedPayment.subtotal || 0,
              total: parsedPayment.total || 0,
            });
          }
        }

        // Load delivery data
        if (params.deliveryData) {
          const parsedDelivery = JSON.parse(params.deliveryData as string);
          setDeliveryData({
            method: parsedDelivery.method || "Belum dipilih",
            fee: parsedDelivery.fee,
            image:
              parsedDelivery.image || require("@/assets/images/default.png"),
            address: parsedDelivery.address || {
              street: "Alamat belum dipilih",
              city: "",
              province: "",
              phone: "",
            },
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Gagal memuat data pesanan");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  const calculateSubtotal = (): number => {
    return cartItems.reduce((sum, item) => {
      const price = safeParseInteger(item.price);
      const quantity = safeParseInteger(item.quantity);
      return sum + price * quantity;
    }, 0);
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const paymentFee = safeParseInteger(paymentData?.paymentFee);
    const deliveryFee = safeParseInteger(deliveryData?.fee);
    return subtotal + paymentFee + deliveryFee;
  };

  const handleCompleteOrder = () => {
    Alert.alert(
      "Pesanan Berhasil",
      "Terima kasih telah berbelanja dengan kami",
      [{ text: "OK", onPress: () => router.replace("/") }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Memuat ringkasan pesanan...</Text>
      </View>
    );
  }

  const goToConfirmationPage = () => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    router.push({
      pathname: "/property/Konfirmasi",
      params: {
        cartItems: JSON.stringify(cartItems),
        paymentData: JSON.stringify({
          ...paymentData,
          subtotal,
          total,
        }),
        deliveryData: JSON.stringify(deliveryData),
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Ringkasan Pesanan</Text>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Item Pesanan ({cartItems.length})
        </Text>
        {cartItems.length > 0 ? (
          cartItems.map((item) => {
            const price = safeParseInteger(item.price);
            const quantity = safeParseInteger(item.quantity);
            const total = price * quantity;

            return (
              <View key={item.id} style={styles.itemContainer}>
                <Image
                  source={item.image}
                  style={styles.itemImage}
                  defaultSource={require("@/assets/images/default.png")}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(price)} × {quantity}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(total)}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Tidak ada item pesanan</Text>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pembayaran</Text>
        <View style={styles.methodContainer}>
          <Image
            source={
              paymentData?.paymentMethod
                ? paymentImages[paymentData.paymentMethod.toLowerCase()]
                : require("@/assets/images/default.png")
            }
            style={styles.methodIcon}
          />
          <View style={styles.methodDetails}>
            <Text style={styles.methodText}>
              {paymentData?.paymentMethod || "Belum dipilih"}
            </Text>
            {paymentData?.paymentOption && (
              <Text style={styles.methodOption}>
                {paymentData.paymentOption}
              </Text>
            )}
            <Text style={styles.feeText}>
              Biaya: {formatCurrency(paymentData?.paymentFee || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengiriman</Text>
        <View style={styles.methodContainer}>
          <Image
            source={
              deliveryData?.method
                ? deliveryImages[deliveryData.method.toLowerCase()]
                : require("@/assets/images/default.png")
            }
            style={styles.methodIcon}
          />
          <View style={styles.methodDetails}>
            <Text style={styles.methodText}>
              {deliveryData?.method || "Belum dipilih"}
            </Text>
            <Text style={styles.feeText}>
              Biaya: {formatCurrency(deliveryData?.fee || 0)}
            </Text>
            {deliveryData?.address && (
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>
                  {deliveryData.address.street}
                </Text>
                <Text style={styles.addressText}>
                  {deliveryData.address.city}, {deliveryData.address.province}
                </Text>
                <Text style={styles.addressText}>
                  Kontak: {deliveryData.address.phone}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
        <View style={styles.summaryRow}>
          <Text>Subtotal ({cartItems.length} item):</Text>
          <Text>{formatCurrency(calculateSubtotal())}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Biaya Pengiriman:</Text>
          <Text>{formatCurrency(deliveryData?.fee || 0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Biaya Pembayaran:</Text>
          <Text>{formatCurrency(paymentData?.paymentFee || 0)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(calculateTotal())}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={goToConfirmationPage}
        disabled={!paymentData || !deliveryData || cartItems.length === 0}
      >
        <Text style={styles.completeButtonText}>Selesaikan Pesanan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#34495e",
  },
  emptyText: {
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: "cover",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemPrice: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  itemTotal: {
    fontWeight: "600",
    fontSize: 16,
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodIcon: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
  },
  methodDetails: {
    flex: 1,
  },
  methodText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  methodOption: {
    color: "#3498db",
    fontSize: 14,
    marginBottom: 4,
  },
  feeText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  addressContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
    color: "#555",
  },
  summarySection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#e74c3c",
  },
  completeButton: {
    backgroundColor: "#FFA500",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SummaryScreen;
