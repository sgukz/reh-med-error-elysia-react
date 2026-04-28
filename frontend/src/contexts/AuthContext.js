import { createContext, useContext, useState, useEffect } from 'react';
import {
  verifyToken,
  storeTokenInLocalStorage,
  getTokenFromLocalStorage,
  removeTokenFromLocalStorage,
} from '../libs/Auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const auth_token = getTokenFromLocalStorage('access_token');
      if (auth_token) {
        const CheckAuth = await verifyToken(auth_token);
        const { statusCode, profile, access_token } = CheckAuth;

        if (statusCode === 200 && profile) {
          if (access_token) {
            setAccessToken(access_token);
            setUser(profile);
          }
        }
      }
    } catch (error) {
      setError(error?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    setAccessToken(token);
    storeTokenInLocalStorage('access_token', token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    removeTokenFromLocalStorage('access_token');
  };

  useEffect(() => {
    getProfile();
  }, []);

  return <AuthContext.Provider value={{ user, accessToken, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
