import React from 'react';
import { AuthProvider } from '../../utils/AuthContext'; // Sesuaikan path
import AppNavigator from '../../utils/Navigation'; // Sesuaikan path

/**
 * Ini adalah Root Layout untuk seluruh aplikasi.
 * Semua rute akan dirender di dalam layout ini.
 */
export default function RootLayout() {
  return (
    // 1. AuthProvider membungkus semua navigasi agar state auth tersedia di mana saja.
    <AuthProvider>
      {/* 2. AppNavigator sekarang tidak lagi memiliki NavigationContainer-nya sendiri,
           sehingga aman untuk dirender di sini. Logika di dalamnya akan menentukan
           stack mana (Auth atau App) yang akan ditampilkan.
      */}
      <AppNavigator />
    </AuthProvider>
  );
}
