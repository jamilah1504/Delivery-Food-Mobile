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

// *PERUBAHAN 1: Impor useAuth dari context Anda
import { useAuth } from "../../utils/AuthContext"; // Sesuaikan path jika perlu
import axios from 'axios';
import { Link } from 'expo-router'; // 1. Impor Link

// Tipe untuk response API
interface User {
  id: number;
  name: string;
  email: string;
  // Tambahkan properti user lain jika ada
}

interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

export default function SignIn() {
  // *PERUBAHAN 2: Dapatkan fungsi setToken dari useAuth
  const { login } = useAuth();
  
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

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post<AuthResponse>(
        `http://192.168.43.146:8000/api/login`, // Pastikan IP Address ini bisa diakses dari perangkat Anda
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

      // *PERUBAHAN 3: Gunakan setToken dari context! Ini adalah perbaikan utamanya.
      // Ini akan memperbarui state DAN menyimpan token ke SecureStore.
      await login(token, user);

      // Alert ini sekarang opsional, karena navigasi akan terjadi secara otomatis
      // dari _layout.tsx. Tapi tidak apa-apa untuk menampilkannya.
      Alert.alert("Login Berhasil", `Selamat datang, ${user.name}!`);

      // Navigasi tidak lagi wajib di sini karena _layout.tsx akan menanganinya
      // ketika `token` di context berubah. Namun, untuk transisi yang lebih cepat,
      // Anda bisa tetap menyimpannya.
      router.replace('/(tabs)/home');

    } catch (error: any) {
      Alert.alert(
        "Login Gagal",
        error.response?.data?.message || "Email atau password salah."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // *PERUBAHAN: Pastikan ScrollView juga memiliki background putih
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}>
      <ThemedView style={styles.wrapper}>
        {/* *PERUBAHAN: ThemedView ini juga dipastikan putih lewat styles.inputContainer */}
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
              // *PERUBAHAN: Menambahkan style={{ backgroundColor: 'transparent' }} untuk menghilangkan bg di ikon mata
              <ThemedPressable 
                onPress={() => setPasswordVisible((prev) => !prev)}
                style={{ backgroundColor: 'transparent' }}
              >
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

          {/* *PERUBAHAN 4: Perbaiki path navigasi ke halaman daftar */}
        <ThemedText
          onPress={() => {
            router.push("/auth/sign-up"); // Path absolut ke halaman sign-up
          }}
          style={styles.linkText}
          accessibilityRole="button"

        >
          Belum punya akun? Daftar
        </ThemedText> 
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// Styles tetap sama, sudah diatur dengan background putih
const styles = ScaledSheet.create({
    wrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: "20@ms",
      backgroundColor: "#fff", // <-- Latar belakang sudah putih
    },
    inputContainer: {
      flex: 1,
      justifyContent: "center",
      gap: "15@ms",
      width: "85%",
      maxWidth: 400,
      backgroundColor: "#fff", // <-- Latar belakang sudah putih
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
      color: "#000"
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