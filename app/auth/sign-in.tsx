import { ThemedPressable } from "@/components/ThemedPressable";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { ms, ScaledSheet } from "react-native-size-matters";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";

// 1. Import axiosInstance dan AsyncStorage secara langsung
import axiosInstance from "../../utils/axiosInstance"; // Sesuaikan path
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "../../utils/AuthContext"; // Asumsi tipe ada di context

import axios from 'axios';

// Tipe untuk response API
interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

export default function SignIn() {
  // 2. Gunakan state loading lokal, bukan dari context
  const [isLoading, setIsLoading] = useState(false);
  const { height: windowHeight, width } = useWindowDimensions();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };
    const emailRegex = /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = "Format email tidak valid.";
      isValid = false;
    }

    if (!form.password || form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 3. Fungsi handleSubmit diubah untuk memanggil axiosInstance
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    console.log('[SignIn Component] Mencoba login dengan data:', form);

    setIsLoading(true); // Mulai loading
    try {
      // Panggil axiosInstance secara langsung
      const response = await axios.post<AuthResponse>(
        `http://127.0.0.1:8000/api/login`,
        {
          email: form.email,
          password: form.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );


      const { user, token } = response.data.data;

      // Simpan token dan data user secara manual ke AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // Tampilkan alert sukses dan navigasi secara manual
      Alert.alert("Login Berhasil", `Selamat datang, ${user.name}!`);
      router.replace("/home"); // Arahkan ke halaman utama

    } catch (error: any) {
      // Tangkap error langsung dari axios
      Alert.alert(
        "Login Gagal",
        error.response?.data?.message || "Email atau password salah."
      );
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  // ... (Sisa kode JSX tetap sama persis)
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={styles.wrapper}>
        <ThemedView style={styles.inputContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <ThemedText style={styles.title} type="title">
            TNDH Company
          </ThemedText>

          <ThemedTextInput
            placeholder="Alamat Email"
            value={form.email}
            onChangeText={(text) => handleInputChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            validationError={!!errors.email}
            validationErrorMessage={errors.email}
          />

          <ThemedTextInput
            placeholder="Password"
            value={form.password}
            onChangeText={(text) => handleInputChange("password", text)}
            secureTextEntry={!isPasswordVisible}
            validationError={!!errors.password}
            validationErrorMessage={errors.password}
            icon={
              <ThemedPressable onPress={() => setPasswordVisible((prev) => !prev)}>
                {isPasswordVisible ? (
                  <Feather name="eye-off" size={ms(22)} />
                ) : (
                  <AntDesign name="eyeo" size={ms(22)} />
                )}
              </ThemedPressable>
            }
          />

          <ThemedPressable
            disabled={isLoading}
            onPress={handleSubmit}
            style={isLoading ? styles.buttonDisabled : {}}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText>Login</ThemedText>
            )}
          </ThemedPressable>

          <ThemedText
            onPress={() => router.push("/auth/sign-up")} // Diperbaiki di sini
            style={styles.linkText}
            type="link"
          >
            Belum punya akun? Daftar
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// ... (Kode styles tetap sama persis)
const styles = ScaledSheet.create({
    wrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: "20@ms",
    },
    inputContainer: {
      flex: 1,
      justifyContent: "center",
      gap: "15@ms",
      width: "85%",
      maxWidth: 400,
    },
    logo: {
      width: "70%",
      aspectRatio: 3 / 1,
      resizeMode: "contain",
      alignSelf: "center",
      marginBottom: "10@ms",
    },
    title: {
      textAlign: "center",
      marginBottom: "20@ms",
    },
    buttonDisabled: {
      backgroundColor: "#ccc",
    },
    linkText: {
      color: "#4CAF50",
      textAlign: "center",
      marginTop: "10@ms",
    },
  });