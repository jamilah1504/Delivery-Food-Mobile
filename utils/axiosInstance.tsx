import axios from "axios";
import { checkTokenExpired } from "./checktokenexpired";
//import BASEURL from "./constants"

const axiosInstance = axios.create({
  //baseURL: "https://difest.himatikom-polsub.id/api",
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json", // Default content type
  },
});

// Request Interceptor untuk menambahkan Authorization header dan refresh token jika perlu
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    // Check token expired
    if (token) {
      
        config.headers.Authorization = `Bearer ${token}`; // Token masih valid
    }

    // Tambahkan header untuk multipart/form-data jika body berupa FormData
    if (config.headers["Content-Type"] === "multipart/form-data") {
      config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`; // Menambahkan token jika diperlukan
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor untuk menangani error 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.replace("/"); // Pastikan pengalihan ini berhasil
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
