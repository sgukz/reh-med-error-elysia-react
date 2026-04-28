import { useMemo } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { API_SECURITY } from "./constants";

const API_URL = process.env.REACT_APP_API_URL;

export function useAxios() {
  const { accessToken } = useAuth();
  const API = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        "client-id": API_SECURITY.UUID,
      },
    });

    // ดักจับ Request และใส่ Access Token
    instance.interceptors.request.use(
      async (config) => {

        let token = accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [accessToken]);

  return API;
}
