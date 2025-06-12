import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.43.146:8000/api",
  //baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json", // Default content type
  },
});

// Jika Anda masih perlu menangani multipart/form-data secara khusus
// (misalnya untuk API yang tidak memerlukan token tapi butuh header spesifik),
// Anda bisa menggunakan interceptor yang lebih sederhana.
// Namun, jika tidak ada perlakuan khusus, interceptor tidak diperlukan sama sekali.

// Contoh jika Anda ingin tetap bisa menangani FormData tanpa token:
axiosInstance.interceptors.request.use(
  (config) => {
    // Axios biasanya akan mengatur header 'Content-Type' untuk FormData secara otomatis.
    // Jadi, blok ini seringkali tidak diperlukan kecuali ada logika kustom lain.
    if (config.data instanceof FormData) {
      // Hapus header Content-Type agar browser dapat mengaturnya
      // secara otomatis dengan boundary yang benar.
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;