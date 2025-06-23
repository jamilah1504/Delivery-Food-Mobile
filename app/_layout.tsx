import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../utils/AuthContext"; // Sesuaikan path jika perlu
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Komponen ini menangani logika navigasi utama.
 * Ia akan memeriksa status autentikasi dan mengarahkan pengguna
 * ke halaman yang sesuai (grup '(auth)' atau '(tabs)').
 */
const InitialLayout = () => {
  const { token, isLoading } = useAuth();
  const segments = useSegments(); // Mendapatkan path rute saat ini
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apa-apa jika masih loading
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Jika pengguna memiliki token tapi masih di halaman auth, arahkan ke home.
    if (token && inAuthGroup) {
      router.replace('/(tabs)/home'); 
    } 
    // Jika pengguna tidak punya token dan tidak sedang di halaman auth, arahkan ke login.
    else if (!token && !inAuthGroup) {
      router.replace('/auth/sign-in');
    }

  }, [token, isLoading, segments]); // Jalankan efek ini jika token atau status loading berubah

  // Tampilkan loading indicator saat context sedang memeriksa token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Tampilkan stack navigasi setelah loading selesai
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Rute utama aplikasi berada di dalam grup (tabs) */}
      <Stack.Screen name="(tabs)" /> 
      <Stack.Screen name="auth" /> 
      <Stack.Screen name="property" /> 
      {/* Rute autentikasi berada di root */}
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      {/* Tambahkan rute lain yang tidak termasuk dalam tabs atau auth di sini */}
    </Stack>
  );
};

/**
 * Ini adalah Root Layout yang sebenarnya.
 * Membungkus semua dengan AuthProvider agar state tersedia di mana saja.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}