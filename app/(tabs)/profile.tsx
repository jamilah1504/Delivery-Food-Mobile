import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import axiosInstance from "../../utils/axiosInstance"; 
import { useAuth } from "../../utils/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Dapatkan fungsi logout dari context

  // Fungsi untuk menangani proses logout
  const handleLogout = async () => {
    try {
      // Panggil API backend untuk meng-invalidate token di server.
      await axiosInstance.post('/logout');
    } catch (apiError) {
      console.error("API logout failed, logging out client-side anyway:", apiError);
      // Tetap lanjutkan proses logout di sisi client meskipun API gagal
    } finally {
      // Panggil fungsi logout dari context.
      // Ini akan menghapus token dari state & penyimpanan, lalu memicu redirect.
      logout();
      
      // Navigasi ke halaman login untuk memastikan pengguna keluar
      router.replace('/sign-in');
    }
  };

  // Fungsi untuk menampilkan dialog konfirmasi sebelum logout
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
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileLocation}>Lokasi Pengguna</Text>
      </View>

      <View style={styles.settingsContainer}>
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

        {/* Tombol ini sekarang memanggil fungsi confirmLogout */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={confirmLogout}
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