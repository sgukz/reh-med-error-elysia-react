import { useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_SECURITY } from './constants';
import { removeTokenFromLocalStorage } from '../libs/Auth';

const API_URL = process.env.REACT_APP_API_URL;

export function useAxios() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const API = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      withCredentials: true,
      timeout: 30000,
      headers: {
        'client-id': API_SECURITY.UUID,
      },
    });
    // ตั้งครั้งเดียวพอ — request interceptor จะอ่าน accessToken ปัจจุบันเอง
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reqId = API.interceptors.request.use(
      (config) => {
        const token = accessToken || localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resId = API.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // session หมดอายุ → ล้าง state แล้วกลับหน้า login
          removeTokenFromLocalStorage('access_token');
          if (typeof logout === 'function') logout();
          navigate('/login', { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.request.eject(reqId);
      API.interceptors.response.eject(resId);
    };
  }, [API, accessToken, logout, navigate]);

  return API;
}
