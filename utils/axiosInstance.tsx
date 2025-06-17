// File: utils/axiosInstance.js

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
const baseURL = "http://127.0.0.1:8000/api"; 
// const baseURL = "http://192.168.43.146:8000/api"; 


const axiosInstance = axios.create({
  baseURL,
  // Timeout untuk mencegah request menggantung selamanya
  timeout: 10000, 
  headers: {
    "Accept": 'application/json',
  },
});


// ======================================================================
// INTERCEPTOR REQUEST: MENAMBAHKAN BEARER TOKEN SECARA OTOMATIS
// ======================================================================
// Interceptor ini akan berjalan SETIAP KALI ada request yang dibuat
// menggunakan `axiosInstance`.
axiosInstance.interceptors.request.use(
  async (config) => {
    // 1. Ambil token dari AsyncStorage.
    const token = await AsyncStorage.getItem('userToken');

    // 2. Jika token ada, tambahkan ke header Authorization.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Menangani FormData untuk upload file.
    // Jika data adalah FormData, biarkan Axios yang mengatur header Content-Type.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
    // 4. Untuk request JSON biasa, pastikan header-nya benar.
      config.headers['Content-Type'] = 'application/json';
    }
    
    // 5. Kembalikan config yang sudah dimodifikasi agar request bisa dilanjutkan.
    return config;
  },
  (error) => {
    // Jika ada error saat persiapan request, langsung reject.
    return Promise.reject(error);
  }
);


// ======================================================================
// INTERCEPTOR RESPONSE: MENANGANI AUTO-LOGOUT SAAT TOKEN EXPIRED
// ======================================================================
let logoutHandler;

export const injectLogout = (logoutFunction) => {
  logoutHandler = logoutFunction;
};

// Interceptor ini akan berjalan SETIAP KALI ada response yang diterima.
axiosInstance.interceptors.response.use(
  // Jika response sukses (status 2xx), langsung kembalikan.
  (response) => response,
  
  // Jika response gagal (status bukan 2xx), jalankan fungsi ini.
  async (error) => {
    const originalRequest = error.config; // Request asli yang menyebabkan error

    // Cek jika error disebabkan oleh token tidak valid (status 401 Unauthorized)
    // dan request ini bukan request untuk refresh token (menghindari loop tak terbatas).
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log("Token tidak valid atau expired. Menjalankan auto-logout.");
      
      // Panggil fungsi logout yang telah di-inject dari AuthContext.
      if (typeof logoutHandler === 'function') {
        await logoutHandler();
      }
    }

    // Kembalikan error agar bisa ditangani lebih lanjut di tempat pemanggilan API (misal di dalam blok catch).
    return Promise.reject(error);
  }
);


export default axiosInstance;