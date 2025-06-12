import axios from "axios";

export async function checkTokenExpired(): Promise<boolean> {
    const token = localStorage.getItem("token");
  
    if (!token) return true;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
  
      // Kalau token masih valid, return false
      if (now <= expiry) return false;
  
      // Token expired, cek apakah ada refresh_token
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return true;
  
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/refresh", {
        //const response = await axios.post("http://difest.himatikom-polsub.id/api/refresh", {
          refresh_token: refreshToken,
        });
  
        const newToken = response.data.token;
  
        localStorage.setItem("token", newToken);
        localStorage.removeItem("refresh_token"); // hanya hapus kalau berhasil
        return false;
      } catch (error) {
        console.error("Gagal refresh token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        return true;
      }
    } catch (e) {
      console.error("Error parsing token:", e);
      return true;
    }
  }
  