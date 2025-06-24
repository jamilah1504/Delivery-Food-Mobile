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

    // Cek apakah rute saat ini berada di dalam grup '(auth)'
    // Contoh: '/(auth)/sign-in' -> segments akan menjadi ['(auth)', 'sign-in']
    const inAuthGroup = segments[0] === 'auth';

    // Jika pengguna memiliki token tapi masih di halaman auth, arahkan ke home.
    if (token && inAuthGroup) {
      router.replace('/(tabs)/home'); 
    } 
    // Jika pengguna TIDAK punya token dan TIDAK sedang di grup auth,
    // artinya mereka mencoba mengakses halaman yang dilindungi.
    // Arahkan ke halaman sign-in sebagai default.
    else if (!token && !inAuthGroup) {
      router.replace('/auth/sign-in');
    }
    // Jika kondisi di atas tidak terpenuhi, biarkan saja.
    // Ini mencakup kasus di mana:
    // 1. Pengguna tidak punya token, TAPI sudah di dalam grup auth (misal: di sign-in atau sign-up).
    //    Ini memungkinkan navigasi dari sign-in ke sign-up.
    // 2. Pengguna punya token dan tidak di grup auth (sudah di dalam aplikasi).

  }, [token, isLoading, segments]); // Jalankan efek ini jika dependensi berubah

  // Tampilkan loading indicator saat context sedang memeriksa token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Tampilkan stack navigasi setelah loading selesai
  // Pastikan struktur rute Anda sesuai dengan file di direktori /app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Grup untuk halaman setelah login */}
      <Stack.Screen name="(tabs)" /> 
      {/* Grup untuk halaman autentikasi (sign-in, sign-up, dll) */}
      <Stack.Screen name="auth" /> 
      {/* Rute lainnya di luar grup utama */}
      <Stack.Screen name="property" /> 
      {/* Anda tidak perlu mendefinisikan screen di sini jika sudah diatur oleh layout di dalam grup */}
      {/* Contoh: (auth)/_layout.js akan menangani 'sign-in' dan 'sign-up' */}
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