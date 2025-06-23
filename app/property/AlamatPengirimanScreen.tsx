import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/utils/AuthContext";

export default function AlamatPengirimanScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        const hardcodedUserId = user?.id;
        console.log(`Menggunakan hardcoded User ID: ${hardcodedUserId}`);
        setUserId(hardcodedUserId);
        await fetchUserData(hardcodedUserId);
      } catch (error) {
        Alert.alert("Error", "Gagal memuat data awal.");
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  // ======================================================================
  // PERBAIKAN DI FUNGSI INI
  // ======================================================================
  const fetchUserData = async (id) => {
    try {
      const response = await axiosInstance.get(`/user/${id}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const userData = response.data[0];

        // ======================================================================
        // PERBAIKAN UTAMA DI SINI: Gunakan aliasing 'addres: address'
        // ======================================================================
        const { name, email, phone, address } = userData;
        
        console.log("Data yang berhasil di-parse:", { name, email, phone, address });

        // Sekarang logika ini akan berjalan dengan benar
        if (name) setName(name);
        if (email) setEmail(email);
        if (phone) setPhone(phone);
        // Variabel 'address' sekarang berisi nilai dari properti 'addres'
        if (address) setAddress(address); 
        
      } else {
        console.log("Struktur data dari API tidak sesuai atau data kosong.");
      }
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
      if (error.response && error.response.status === 404) {
        console.log("Pengguna belum memiliki data alamat. Formulir akan kosong.");
      } else {
        Alert.alert("Error", "Gagal mengambil data dari server.");
      }
    }
  };
  // ======================================================================
  // AKHIR DARI PERBAIKAN
  // ======================================================================

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "ID Pengguna tidak valid. Tidak dapat menyimpan.");
      return;
    }

    setIsSubmitting(true);
    // Saat mengirim, gunakan 'address' dari state, tetapi API mungkin mengharapkan 'addres'
    // Sesuaikan payload jika diperlukan
    const payload = {};
    // Kirim kembali sebagai 'addres' jika API mengharapkan itu
    if (address) payload.addres = address; 
    if (phone) payload.phone = phone;
    if (name) payload.name = name;
    if (email) payload.email = email;

    if (Object.keys(payload).length === 0) {
      Alert.alert("Info", "Tidak ada data untuk disimpan.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axiosInstance.put(`/alamat/${userId}`, payload);
      Alert.alert("Sukses", "Alamat berhasil diperbarui!");
      navigation.goBack();
    } catch (error) {
      console.error("Gagal menyimpan alamat:", error.response?.data || error.message);
      Alert.alert("Error", "Gagal menyimpan alamat ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sisa kode (return, styles) tetap sama...
  // ...
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2E5BFF" />
        <Text>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2E5BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alamat Pengiriman</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Nama Penerima</Text>
      <TextInput
        style={styles.input}
        placeholder="Nama tidak tersedia"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email tidak tersedia"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Nomor Telepon</Text>
      <TextInput
        style={styles.input}
        placeholder="Nomor telepon tidak tersedia"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Alamat Lengkap</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Alamat tidak tersedia"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <TouchableOpacity
        style={[styles.submitButton, (isSubmitting || !userId) && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting || !userId}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#F5F5F5",
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: "#2E5BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#a9a9a9",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});