import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    removeTokenFromLocalStorage('access_token');
  }, []);

  const login = useCallback((token) => {
    setAccessToken(token);
    storeTokenInLocalStorage('access_token', token);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function getProfile() {
      try {
        const auth_token = getTokenFromLocalStorage('access_token');
        if (!auth_token) return;
        const res = await verifyToken(auth_token);
        if (cancelled || !res) return;
        const { statusCode, profile, access_token } = res;
        if (statusCode === 200 && profile && access_token) {
          setAccessToken(access_token);
          setUser(profile);
        } else {
          // token หมดอายุ / ไม่ถูกต้อง → ล้างทิ้ง
          removeTokenFromLocalStorage('access_token');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Unknown error');
          // 401/403 ไม่ควรเก็บ token เก่า
          if (e?.response?.status === 401 || e?.response?.status === 403) {
            removeTokenFromLocalStorage('access_token');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    getProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, login, logout, error, loading }),
    [user, accessToken, login, logout, error, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
