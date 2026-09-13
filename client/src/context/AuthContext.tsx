import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // CHECK / REFRESH USER
  // =========================
  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch (error: any) {
      console.error("Refresh user error:", error);

      // Only log the user out when the backend
      // explicitly says the authentication is invalid.
      if (error.response?.status === 401) {
        setUser(null);
      }

      // For network errors, Render cold starts,
      // 5xx errors, etc., keep the existing user state.
    } finally {
      setLoading(false);
    }
  };

  // Check authentication when app starts
  useEffect(() => {
    refreshUser();
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    try {
      await api.post("/auth/logout");

      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// useAuth HOOK
// =========================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};