// src/context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { injectLogout } from './axiosInstance';

// ===================================================================
// TIPE DATA
// ===================================================================

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: UserRole;
  phone_number?: string;
  profile_photo_url?: string;
}

interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

// Peningkatan 1: Tipe Context yang lebih kaya
interface AuthContextType {
  user: User | null;
  /** `true` saat proses login/register sedang berjalan. */
  isAuthLoading: boolean;
  /** `true` saat sesi sedang divalidasi saat app start. */
  isSessionLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Fungsi untuk memeriksa peran pengguna. */
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// ===================================================================
// KODE KONTEKS OTENTIKASI
// ===================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setAuthLoading] = useState<boolean>(false);
  const [isSessionLoading, setSessionLoading] = useState<boolean>(true);

  // Fungsi `logout` yang dimemoize
  const logout = useCallback(async (): Promise<void> => {
    console.log("Menjalankan fungsi logout...");
    setUser(null);
    await AsyncStorage.multiRemove(['userToken', 'userData']);
  }, []);

  // useEffect utama, hanya berjalan sekali
  useEffect(() => {
    injectLogout(logout);

    // Peningkatan 2: Validasi sesi ke backend
    const validateSession = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setSessionLoading(false);
        return;
      }
      
      try {
        // Lakukan request ke endpoint yang dilindungi untuk memvalidasi token
        const response = await apiClient.get<{ user: User }>('/user'); // Asumsi endpoint `/api/user` ada
        // Jika berhasil, user dari respons adalah data ter-update
        const latestUser = response.data.user; 
        setUser(latestUser);
        // Perbarui data user di storage jika perlu
        await AsyncStorage.setItem('userData', JSON.stringify(latestUser));
      } catch (error) {
        console.log('Validasi token gagal, sesi tidak valid.', error);
        await logout(); // Jika token tidak valid, hapus sesi
      } finally {
        setSessionLoading(false);
      }
    };
    
    validateSession();
  }, [logout]);

  const handleAuthSuccess = async (userData: User, userToken: string): Promise<void> => {
    setUser(userData);
    await AsyncStorage.setItem('userToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setAuthLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/login', { email, password });
      await handleAuthSuccess(response.data.data.user, response.data.data.token);
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Login gagal.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    setAuthLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/register', { name, email, password });
      await handleAuthSuccess(response.data.data.user, response.data.data.token);
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Registrasi gagal.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Peningkatan 3: Fungsi helper untuk RBAC (Role-Based Access Control)
  const hasRole = useCallback((requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) {
      return false;
    }
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }, [user]);

  return (
    <AuthContext.Provider value={{ login, logout, register, user, isAuthLoading, isSessionLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk menggunakan context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};