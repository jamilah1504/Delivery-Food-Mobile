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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

export default function ConfirmationScreen() {
  const { cartItems, paymentData, deliveryData } = useLocalSearchParams();
  const router = useRouter();

  const parsedCart = JSON.parse(cartItems || "[]");
  const parsedPayment = JSON.parse(paymentData || "{}");
  const parsedDelivery = JSON.parse(deliveryData || "{}");

  const subtotal = parsedPayment.subtotal || 0;
  const total = parsedPayment.total || 0;
  const ongkir = parsedDelivery.fee || 0;
  const paymentFee = parsedPayment.paymentFee || 0;
  const paymentOption = parsedPayment.paymentMethod || "ovo";
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [status, setStatus] = useState("Menunggu");
  const [transactionId, setTransactionId] = useState("");
  const [imageLoading, setImageLoading] = useState(true);

  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;
  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  useEffect(() => {
    setTransactionId(
      "TRX-" + Math.random().toString(36).substr(2, 10).toUpperCase()
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const statusTimeout = setTimeout(() => {
      setStatus("Sukses");
    }, 3 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(statusTimeout);
    };
  }, []);

  useEffect(() => {
    if (status === "Sukses") {
      const saveHistory = async () => {
        try {
          const existingHistory = await AsyncStorage.getItem(
            "transactionHistory"
          );
          const historyArray = existingHistory
            ? JSON.parse(existingHistory)
            : [];

          const newEntry = {
            id: transactionId,
            cartItems: parsedCart,
            paymentData: parsedPayment,
            deliveryData: parsedDelivery,
            date: formattedDate,
            time: formattedTime,
            status: "Sukses",
            totalAmount: total,
          };

          const updatedHistory = [newEntry, ...historyArray];
          await AsyncStorage.setItem(
            "transactionHistory",
            JSON.stringify(updatedHistory)
          );

          Alert.alert(
            "Pembayaran Berhasil",
            `Transaksi ${transactionId} telah berhasil`,
            [
              { text: "Lihat Histori", onPress: () => router.push("/history") },
              { text: "Kembali ke Home", onPress: () => router.push("/") },
            ]
          );
        } catch (err) {
          console.error("Gagal menyimpan histori:", err);
          Alert.alert("Error", "Gagal menyimpan data transaksi");
        }
      };

      saveHistory();
    }
  }, [status]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const renderFoodImage = (item) => {
    return (
      <View style={styles.imageContainer}>
        {item.image ? (
          <>
            <Image
              source={{ uri: item.image }}
              style={styles.foodImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <ActivityIndicator
                style={styles.loadingIndicator}
                size="small"
                color="#000"
              />
            )}
          </>
        ) : (
          <View style={[styles.foodImage, styles.imagePlaceholder]}>
            <FontAwesome name="cutlery" size={24} color="#999" />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Konfirmasi Pembayaran</Text>

      <View style={styles.statusWrapper}>
        <Text style={styles.statusIcon}>
          {status === "Sukses" ? "✅" : "⏳"}
        </Text>
        <Text style={styles.statusLabel}>{status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.instruction}>
          Silahkan lakukan pembayaran sesuai dengan metode yang Anda pilih
        </Text>
        <View style={styles.divider} />

        {parsedCart.length > 0 && (
          <View style={styles.orderRow}>
            {renderFoodImage(parsedCart[0])}
            <View>
              <Text style={styles.foodTitle}>
                {parsedCart[0]?.name}
                {parsedCart.length > 1
                  ? ` & ${parsedCart.length - 1} Lainnya`
                  : ""}
              </Text>
              <Text style={styles.orderCount}>{parsedCart.length} Pesanan</Text>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Pembayaran</Text>
          <Text style={styles.infoValue}>
            Rp. {total.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Metode Pembayaran</Text>
          <Text style={styles.infoValue}> {paymentOption}</Text>
        </View>

        <View style={styles.barcodeContainer}>
          <Image
            source={require("@/assets/images/barcode.png")}
            style={styles.barcodeImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.payTimer}>
          <Text style={styles.timerText}>
            Bayar Dalam {formatTime(timeLeft)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.detailTitle}>Detail Transaksi</Text>
        <View style={styles.infoRow}>
          <Text>Status Transaksi</Text>
          <Text
            style={[
              styles.waitingStatus,
              {
                backgroundColor: status === "Sukses" ? "#A6F4C5" : "#FFD452",
              },
            ]}
          >
            {status}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text>Nomor Transaksi</Text>
          <Text>{transactionId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text>Waktu Transaksi</Text>
          <Text>
            {formattedDate} {formattedTime}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.detailTitle}>Detail Pembayaran</Text>
        <View style={styles.infoRow}>
          <Text>Sub Total</Text>
          <Text>Rp. {subtotal.toLocaleString("id-ID")}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text>Biaya Pengiriman</Text>
          <Text>Rp. {ongkir.toLocaleString("id-ID")}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text>Biaya Pembayaran</Text>
          <Text>Rp. {paymentFee.toLocaleString("id-ID")}</Text>
        </View>
        <View
          style={[
            styles.infoRow,
            { borderTopWidth: 1, marginTop: 8, paddingTop: 6 },
          ]}
        >
          <Text style={{ fontWeight: "bold" }}>Total</Text>
          <Text style={{ fontWeight: "bold" }}>
            Rp. {total.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/")}
        style={{
          backgroundColor: "#4CAF50",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Kembali ke Home
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusWrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    gap: 8,
  },
  statusIcon: { fontSize: 20 },
  statusLabel: { fontSize: 14 },
  card: {
    backgroundColor: "#E5F0FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  barcodeContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  barcodeImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
  },
  instruction: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  divider: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  orderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  imageContainer: {
    position: "relative",
    width: 60,
    height: 60,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  foodTitle: { fontWeight: "bold", fontSize: 16 },
  orderCount: { fontSize: 14, color: "#333" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14 },
  payTimer: {
    backgroundColor: "#FFDADA",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  timerText: { fontWeight: "bold", fontSize: 16, color: "#333" },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  waitingStatus: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: "bold",
    color: "#000",
  },
});
