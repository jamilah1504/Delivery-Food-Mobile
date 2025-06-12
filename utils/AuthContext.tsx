import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/axiosInstance"; // Use your configured axios instance

// Define proper User interface
interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  [key: string]: any; // Allow for additional properties
}

interface AuthContextProps {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Get stored token and user data
        const [storedToken, storedUserData] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user")
        ]);

        if (storedToken && storedUserData) {
          try {
            const parsedUser = JSON.parse(storedUserData);
            
            // Set axios authorization header
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            
            // Optional: Verify token with API
            try {
              const response = await api.get("/auth/me"); // or your user profile endpoint
              setUser(response.data.user || response.data);
              setToken(storedToken);
            } catch (apiError) {
              console.log("Token verification failed, using stored user data");
              // If API call fails, use stored user data (token might still be valid)
              setUser(parsedUser);
              setToken(storedToken);
            }
          } catch (parseError) {
            console.error("Failed to parse stored user data:", parseError);
            // Clear corrupted data
            await AsyncStorage.multiRemove(["token", "user"]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear potentially corrupted data
        await AsyncStorage.multiRemove(["token", "user"]);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Update axios header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (newToken: string, newUser: User) => {
    try {
      // Store in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem("token", newToken),
        AsyncStorage.setItem("user", JSON.stringify(newUser))
      ]);

      // Update state
      setToken(newToken);
      setUser(newUser);
      
      // Set axios authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      console.log("Login successful, user authenticated");
    } catch (error) {
      console.error("Failed to store auth data:", error);
      throw new Error("Failed to save login information");
    }
  };

  const logout = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(["token", "user"]);
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Remove axios authorization header
      delete api.defaults.headers.common["Authorization"];
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Failed to clear auth data:", error);
      // Still clear state even if AsyncStorage fails
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const isAuthenticated = Boolean(token && user);

  const contextValue: AuthContextProps = {
    token,
    user,
    login,
    logout,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};