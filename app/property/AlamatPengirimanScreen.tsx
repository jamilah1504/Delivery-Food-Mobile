import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Pastikan Anda menginstal @expo/vector-icons
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

export default function AlamatPengirimanScreen() {
  const navigation = useNavigation(); // Inisialisasi navigation
  const [recipientName, setRecipientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State untuk mengatur mode edit

  const handleSaveAddress = async () => {
    if (
      !recipientName ||
      !phoneNumber ||
      !address ||
      !city ||
      !postalCode ||
      !province
    ) {
      Alert.alert("Error", "Semua field harus diisi!");
      return;
    }

    const addressData = {
      recipientName,
      phoneNumber,
      address,
      city,
      postalCode,
      province,
    };

    try {
      await AsyncStorage.setItem("userAddress", JSON.stringify(addressData));
      setSavedAddress(addressData);
      Alert.alert("Sukses", "Alamat berhasil disimpan!");
      setIsEditing(false); // Keluar dari mode edit setelah menyimpan
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan alamat!");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchSavedAddress = async () => {
      try {
        const savedData = await AsyncStorage.getItem("userAddress");
        if (savedData) {
          const address = JSON.parse(savedData);
          setSavedAddress(address);
          setRecipientName(address.recipientName);
          setPhoneNumber(address.phoneNumber);
          setAddress(address.address);
          setCity(address.city);
          setPostalCode(address.postalCode);
          setProvince(address.province);
        }
      } catch (error) {
        console.error("Gagal mengambil alamat:", error);
      }
    };

    fetchSavedAddress();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Alamat Pengiriman</Text>

      {savedAddress ? (
        <>
          <View style={styles.savedAddressContainer}>
            <Text style={styles.savedAddressTitle}>Nama Penerima</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{savedAddress.recipientName}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setRecipientName(savedAddress.recipientName);
                }}
              >
                <Ionicons name="pencil" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.savedAddressContainer}>
            <Text style={styles.savedAddressTitle}>Nomor Telepon</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{savedAddress.phoneNumber}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setPhoneNumber(savedAddress.phoneNumber);
                }}
              >
                <Ionicons name="pencil" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.savedAddressContainer}>
            <Text style={styles.savedAddressTitle}>Alamat</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{savedAddress.address}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setAddress(savedAddress.address);
                }}
              >
                <Ionicons name="pencil" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.savedAddressContainer}>
            <Text style={styles.savedAddressTitle}>Kota</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{savedAddress.city}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setCity(savedAddress.city);
                }}
              >
                <Ionicons name="pencil" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.savedAddressContainer}>
            <Text style={styles.savedAddressTitle}>Kode Pos</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{savedAddress.postalCode}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setPostalCode(savedAddress.postalCode);
                }}
              >
                <Ionicons name="pencil" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.savedAddressContainer}>
            <Text style={styles.savedAddressTitle}>Provinsi</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{savedAddress.province}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setProvince(savedAddress.province);
                }}
              >
                <Ionicons name="pencil" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveAddress}
            >
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nama Penerima"
            value={recipientName}
            onChangeText={setRecipientName}
          />
          <TextInput
            style={styles.input}
            placeholder="Nomor Telepon"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Alamat"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Kota"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Kode Pos"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Provinsi"
            value={province}
            onChangeText={setProvince}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAddress}
          >
            <Text style={styles.saveButtonText}>Simpan Alamat</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  savedAddressContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  savedAddressTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },
});
