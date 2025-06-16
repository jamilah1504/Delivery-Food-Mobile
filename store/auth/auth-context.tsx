import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { useStorageState } from "../../hooks/useStorageState";
import axios, { AxiosError } from "axios";

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  session?: {
    id: number;
    email: string;
    name: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  session: null,
  isLoading: false,
  error: null,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    // Check existing session on mount
    if (session) {
      validateSession();
    }
  }, []);

  const validateSession = async () => {
    try {
      if (!session) {
        setSession(null);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(session).token}`,
        },
      });

      if (!response.data.valid) {
        setSession(null);
      }
    } catch (err) {
      setSession(null);
    }
  };

  const handleError = (error: unknown) => {
    if (!(error instanceof Error)) {
      setError("An unknown error occurred");
      return;
    }

    const axiosError = error as AxiosError<{ message?: string }>;

    let errorMessage = "An error occurred. Please try again.";

    if (axiosError.response?.data?.message) {
      setError(axiosError.response.data.message);
    } else if (axiosError.response) {
      switch (axiosError.response.status) {
        case 400:
          errorMessage = "Invalid request data.";
          break;
        case 401:
          errorMessage = "Invalid credentials.";
          break;
        case 409:
          errorMessage = "Email already exists.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
      }
    }

    setError(errorMessage);
  };

  const value: AuthContextType = {
    signIn: async (email, password) => {
      setError(null);
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        setSession(
          JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            token: response.data.token,
          })
        );
      } catch (err) {
        handleError(err);
      }
    },

    signOut: async () => {
      setError(null);
      try {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${
                session ? JSON.parse(session).token : ""
              }`,
            },
          }
        );
        setSession(null);
      } catch (err) {
        handleError(err);
      }
    },

    signUp: async (email, password, name) => {
      setError(null);
      try {
        const response = await axios.post(`${API_URL}/auth/register`, {
          email,
          password,
          name,
        });

        setSession(
          JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            token: response.data.token,
          })
        );
      } catch (err) {
        handleError(err);
      }
    },

    session: session ? JSON.parse(session) : null,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
