import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getProfileUser } from "../libs/Auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      if (accessToken) {
        const CheckAuth = await getProfileUser(accessToken);
        if (CheckAuth) {
          setAccessToken(CheckAuth.access_token);
          setUser(CheckAuth.profile);
        }
      }
    } catch (error) {
      setError(error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  

  const login = (token) => {
    setAccessToken(token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    // axios.post("/api/auth/logout", {}, { withCredentials: true });
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
