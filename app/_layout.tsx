// File: app/_layout.tsx

import { AuthProvider, useAuth } from '../utils/AuthContext'; // Sesuaikan path ke AuthContext
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';

// Mencegah splash screen hilang otomatis sebelum aset (font) dimuat
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { user, isSessionLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // useEffect(() => {
  //   // Jika sesi selesai loading, kita bisa mulai navigasi
  //   if (!isSessionLoading) {
  //     const inAuthGroup = segments[0] === '(auth)';

  //     // Jika user tidak login dan tidak berada di halaman auth, lempar ke login
  //     if (!user && !inAuthGroup) {
  //       router.replace('/auth/sign-in');
  //     } 
  //     // Jika user sudah login dan masih di halaman auth, lempar ke home
  //     else if (user && inAuthGroup) {
  //       router.replace('/(tabs)/home');
  //     }
  //   }
  // }, [user, isSessionLoading, segments]);

  // Tampilkan loading indicator saat sesi sedang divalidasi
  // atau saat user belum siap dan navigasi belum di-redirect.
  if (isSessionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      {/* Tambahkan screen lain di luar tabs dan auth di sini jika ada */}
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle error saat memuat font
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Sembunyikan splash screen setelah font selesai dimuat
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Tampilkan splash screen
  }

  return (
    // 1. AuthProvider membungkus semua navigasi
    <AuthProvider>
      {/* 2. GestureHandler dibutuhkan untuk beberapa komponen UI */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <InitialLayout />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}