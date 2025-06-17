import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Ganti useNavigation() dengan useRouter()
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Asumsikan Anda memiliki instance axios yang sudah dikonfigurasi
// dan context untuk autentikasi
import axiosInstance from "../../utils/axiosInstance"; 
import { useAuth } from "../../utils/AuthContext";

export default function ProfileScreen() {
  const router = useRouter(); // Gunakan router dari expo-router
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // 1. Panggil API untuk logout dari server
      // Endpoint '/api/logout' adalah umum untuk Laravel, sesuaikan jika perlu
      await axiosInstance.post('/logout');

      // 2. Hapus token dari AsyncStorage di sisi klien
      // Pastikan key 'userToken' sama dengan yang Anda gunakan saat login
      await AsyncStorage.removeItem('userToken');
      
      // 3. Update state global (opsional, tapi sangat direkomendasikan)
      logout(); // Mereset state user menjadi null
      
      // 4. Arahkan pengguna ke halaman sign-in
      // `replace` digunakan agar pengguna tidak bisa kembali ke halaman sebelumnya
      router.replace('./sign-in');

    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Gagal untuk logout, silakan coba lagi.");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya, Keluar",
          onPress: handleLogout, // Panggil fungsi logout jika pengguna setuju
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Secret</Text>
        <Text style={styles.profileLocation}>Subang, Jawa Barat</Text>
      </View>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/property/OrderTrackingScreen")}
        >
          <Ionicons name="cube-outline" size={20} color="#555" />
          <Text style={styles.settingText}>Order tracking</Text>
          <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/property/HistoryBelanjaScreen")}
        >
          <Ionicons name="time-outline" size={20} color="#555" />
          <Text style={styles.settingText}>History belanja</Text>
          <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/property/AlamatPengirimanScreen")}
        >
          <Ionicons name="location-outline" size={20} color="#555" />
          <Text style={styles.settingText}>Metode & Alamat Pengiriman</Text>
          <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/property/PengaturanScreen")}
        >
          <Ionicons name="settings-outline" size={20} color="#555" />
          <Text style={styles.settingText}>Pengaturan</Text>
          <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => console.log("Logout pressed")}
        >
          <Ionicons name="log-out-outline" size={20} color="red" />
          <Text style={[styles.settingText, { color: "red" }]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 16 },
  profileHeader: { alignItems: "center", marginVertical: 24 },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D3D3D3",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  profileLocation: { fontSize: 14, color: "#6495ED" },
  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: { flex: 1, fontSize: 16, color: "#333", marginLeft: 10 },
});
