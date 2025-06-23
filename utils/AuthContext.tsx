import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSegments, useRouter } from 'expo-router';

// 1. Definisikan interface untuk User
export interface User {
  id: number;
  name: string;
  email: string;
  // Tambahkan properti lain yang mungkin Anda dapatkan dari API
}

// 2. Perbarui tipe Context untuk menyertakan 'user' dan fungsi 'login'
type AuthContextType = {
  token: string | null;
  user: User | null; // <-- Tambahkan state untuk user
  login: (token: string, userData: User) => Promise<void>; // <-- Fungsi baru
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // <-- State baru untuk data user
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // 3. Muat token dan data user dari penyimpanan
        const storedToken = await SecureStore.getItemAsync('user_token');
        const storedUser = await SecureStore.getItemAsync('user_data');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser)); // <-- Parse data user dari string JSON
        }
      } catch (e) {
        console.error("Failed to load auth data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // 4. Buat fungsi 'login' yang menangani token dan data user
  const login = async (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    await SecureStore.setItemAsync('user_token', newToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData)); // <-- Simpan data user sebagai string JSON
  };

  // 5. Perbarui fungsi 'logout' untuk membersihkan data user juga
  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data'); // <-- Hapus data user
  };

  const value = {
    token,
    user, // <-- Sediakan user di dalam context
    login, // <-- Sediakan fungsi login
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}