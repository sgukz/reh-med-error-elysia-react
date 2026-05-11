import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { verifyToken, logout as apiLogout, removeTokenFromLocalStorage } from '../libs/Auth';

const AuthContext = createContext(null);

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function AuthProvider({ children }) {
  // accessToken ยังคงเก็บใน memory state ระหว่าง transition เผื่อ component เก่ายังอ้างอิงผ่าน useAuth()
  // แต่ source of truth จริงคือ HTTP-only cookie ฝั่ง backend
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    // เคลียร์ค่าเก่าใน localStorage (กรณีมีตกค้างจากเวอร์ชันก่อน) + เรียก backend ล้าง cookie
    removeTokenFromLocalStorage('access_token');
    await apiLogout();
  }, []);

  const login = useCallback((token) => {
    // backend set cookie ให้แล้ว — ฝั่ง client เก็บ access_token ใน memory เผื่อใช้ระหว่าง transition
    setAccessToken(token);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function getProfile() {
      try {
        // cookie จะถูกส่งให้ backend อัตโนมัติ ไม่ต้องอ่านจาก localStorage
        const res = await verifyToken(null);
        if (cancelled || !res) {
          setLoading(false);
          return;
        }
        const { statusCode, profile, access_token } = res;
        if (statusCode === 200 && profile) {
          if (access_token) setAccessToken(access_token);
          setUser(profile);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Unknown error');
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
