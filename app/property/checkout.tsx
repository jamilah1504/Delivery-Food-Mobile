import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const paymentMethods = [
  {
    id: "cod",
    name: "Cash on Delivery",
    options: [],
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    options: [
      {
        id: "dana",
        name: "DANA",
        image: require("@/assets/images/dana.png"),
        fee: 500,
      },
      {
        id: "ovo",
        name: "OVO",
        image: require("@/assets/images/ovo.png"),
        fee: 1000,
      },
      {
        id: "qris",
        name: "QRIS",
        image: require("@/assets/images/qris.png"),
        fee: 0,
      },
    ],
  },
  {
    id: "bank",
    name: "Transfer Bank",
    options: [
      {
        id: "mandiri",
        name: "MANDIRI",
        image: require("@/assets/images/mandiri.png"),
        fee: 500,
      },
      {
        id: "bca",
        name: "BCA",
        image: require("@/assets/images/bca.png"),
        fee: 1000,
      },
      {
        id: "bri",
        name: "BRI",
        image: require("@/assets/images/bri.png"),
        fee: 1100,
      },
      {
        id: "bni",
        name: "BNI",
        image: require("@/assets/images/bni.png"),
        fee: 1000,
      },
    ],
  },
];

const CheckoutScreen = () => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [paymentFee, setPaymentFee] = useState(0);
  const { items, totalAmount: totalParam } = useLocalSearchParams();
  const [cartItems] = useState(items ? JSON.parse(items) : []);
  const [totalAmount] = useState(Number(totalParam) || 0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);

  useEffect(() => {
    let fee = 0;

    if (selectedMethod === "cod") {
      fee = 0;
    } else if (selectedMethod && selectedOption) {
      const method = paymentMethods.find((m) => m.id === selectedMethod);
      const option = method?.options.find((o) => o.id === selectedOption);
      fee = option?.fee || 0;
    }

    setPaymentFee(fee);
    setFinalAmount(totalAmount + fee);
  }, [selectedMethod, selectedOption, totalAmount]);

  const handleCheckout = () => {
    if (!selectedMethod) {
      alert("Silakan pilih metode pembayaran terlebih dahulu");
      return;
    }

    const method = paymentMethods.find((m) => m.id === selectedMethod);

    if (method.options.length > 0 && !selectedOption) {
      alert("Silakan pilih opsi pembayaran terlebih dahulu");
      return;
    }

    const paymentData = {
      paymentMethod: method.name,
      paymentOption: selectedOption
        ? method.options.find((o) => o.id === selectedOption)?.name
        : null,
      paymentFee: paymentFee,
      subtotal: totalAmount,
      total: finalAmount,
    };

    router.push({
      pathname: "/property/DeliveryScreen",
      params: {
        paymentData: JSON.stringify({
          subtotal: totalAmount,
          paymentFee: paymentFee,
          total: totalAmount + paymentFee,
          paymentMethod: selectedOption,
        }),
        cartItems: JSON.stringify(cartItems), // kirim cartItems juga
      },
    });
  };

  const showOptionsTitle =
    selectedMethod &&
    paymentMethods.find((m) => m.id === selectedMethod)?.options.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Pilih Pembayaran</Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodButton,
            selectedMethod === method.id && styles.selectedMethod,
          ]}
          onPress={() => {
            setSelectedMethod(method.id);
            setSelectedOption(null);
          }}
        >
          <Text style={styles.methodText}>{method.name}</Text>
        </TouchableOpacity>
      ))}

      {showOptionsTitle && (
        <Text style={styles.subtitle}>
          {selectedMethod === "ewallet"
            ? "Pilih E-Wallet"
            : selectedMethod === "bank"
            ? "Pilih Bank"
            : "Pilih Opsi"}
        </Text>
      )}

      {selectedMethod &&
        paymentMethods.find((m) => m.id === selectedMethod)?.options.length >
          0 && (
          <View style={styles.optionsContainer}>
            {paymentMethods
              .find((m) => m.id === selectedMethod)
              .options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selectedOption === option.id && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedOption(option.id)}
                >
                  <View style={styles.optionContent}>
                    <Image
                      source={option.image}
                      style={styles.optionImage}
                      resizeMode="contain"
                    />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionName}>{option.name}</Text>
                      <Text style={styles.optionFee}>
                        {option.fee > 0
                          ? `Rp ${option.fee.toLocaleString("id-ID")}`
                          : "Gratis"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
        <View style={styles.summaryRow}>
          <Text>Subtotal: Rp {totalAmount.toLocaleString("id-ID")}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Biaya Pembayaran: Rp {paymentFee.toLocaleString("id-ID")}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>
            Total: Rp {finalAmount.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutText}>Lanjutkan ke Pengiriman</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#333",
  },
  methodButton: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedMethod: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD54F",
  },
  methodText: {
    fontSize: 16,
  },
  optionsContainer: {
    marginBottom: 15,
  },
  optionButton: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedOption: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD54F",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionFee: {
    fontSize: 14,
    color: "#757575",
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default CheckoutScreen;
