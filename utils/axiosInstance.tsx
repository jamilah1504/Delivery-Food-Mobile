// File: utils/axiosInstance.js

import axios from "axios";
// Ganti AsyncStorage dengan SecureStore
import * as SecureStore from 'expo-secure-store';

// ======================================================================
// PENTING: PENGATURAN BASE URL
// ======================================================================
// Saat menjalankan aplikasi di emulator atau perangkat fisik,
// JANGAN PERNAH GUNAKAN 'localhost' atau '127.0.0.1'.
// Alamat tersebut mengacu ke perangkat itu sendiri, bukan ke komputer Anda.
//
// Cara menemukan alamat IP lokal Anda:
// - Windows: Buka Command Prompt, ketik `ipconfig`
// - macOS/Linux: Buka Terminal, ketik `ifconfig` atau `ip a`
// Cari alamat IPv4 Anda (misalnya: 192.168.1.7, 192.168.43.146, dll.)

// GANTI ALAMAT IP DI BAWAH INI SESUAI DENGAN ALAMAT IP KOMPUTER ANDA
const baseURL = "http://192.168.43.146:8000/api"; 
// const baseURL = "http://192.168.43.146:8000/api"; 
// File: utils/axiosInstance.js


// ... (kode baseURL tetap sama)

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000, 
  headers: {
    "Accept": 'application/json',
  },
});


// INTERCEPTOR REQUEST: MENAMBAHKAN BEARER TOKEN SECARA OTOMATIS
axiosInstance.interceptors.request.use(
  async (config) => {
    // 1. Ambil token dari SecureStore dengan kunci yang sama seperti di AuthContext.
    const token = await SecureStore.getItemAsync('user_token'); // <-- Kunci disamakan

    // 2. Jika token ada, tambahkan ke header Authorization.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token attached to request headers.'); // Pesan untuk debugging
    }

    // ... (sisa kode untuk FormData dan Content-Type tetap sama)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ... (Interceptor Response tetap sama)

export default axiosInstance;