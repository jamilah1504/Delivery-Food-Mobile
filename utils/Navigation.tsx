// Ubah file ini

import React from 'react';
// 1. Import komponen yang dibutuhkan dari react-native
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from './AuthContext'; // Pastikan path ini benar

// Import screen Anda
import HomeScreen from '../app/(tabs)/home';
import Profile from '../app/(tabs)/profile';
import LoginScreen from '../app/auth/sign-in';
import RegisterScreen from '../app/auth/sign-up';
import { Tabs } from 'expo-router';
import Keranjang from '../app/(tabs)/keranjang';

const Stack = createNativeStackNavigator();

// 2. Buat komponen LoadingScreen sederhana di sini
const LoadingScreen = () => {
  return (
    // View ini akan mengisi seluruh layar dan menempatkan isinya di tengah
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};

const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  // 3. Tambahkan kondisi untuk menampilkan LoadingScreen
  // Saat context sedang memeriksa token, isLoading akan true.
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator>
      {token ? (
        // Stack untuk pengguna yang sudah login
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        
        // Tambahkan screen lain untuk bagian 'app' di sini
      ) : (
        // Stack untuk pengguna yang belum login
        <>
        
          
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// 4. Tambahkan StyleSheet untuk styling LoadingScreen
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF' // Ganti warna latar belakang jika perlu
  },
});

export default AppNavigator;