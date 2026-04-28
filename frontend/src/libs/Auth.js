import axios from 'axios';
import { API_ROUTE, API_METHOD, API_SECURITY } from '../utils/constants';

export function storeTokenInLocalStorage(tokenName, token) {
  return localStorage.setItem(tokenName, token);
}

export function getTokenFromLocalStorage(tokenName) {
  return localStorage.getItem(tokenName);
}

export function removeTokenFromLocalStorage(tokenName) {
  return localStorage.removeItem(tokenName);
}

function jsonHeader(token) {
  const header = {
    'Content-Type': 'application/json',
    'client-id': API_SECURITY.UUID,
  };
  if (token) header.Authorization = `Bearer ${token}`;
  return header;
}

export async function getAuthenticatedUser(userData) {
  const response = await axios({
    method: API_METHOD.POST,
    url: API_ROUTE.AUTH,
    headers: jsonHeader(),
    withCredentials: true,
    data: userData,
  });
  return response.data;
}

export async function refreshToken(token) {
  const response = await axios({
    method: API_METHOD.POST,
    url: API_ROUTE.REFRESH,
    headers: jsonHeader(token),
  });
  return response.data;
}

export async function verifyToken(token) {
  if (!token) return null;
  const response = await axios({
    method: API_METHOD.POST,
    url: API_ROUTE.PROFILE,
    headers: jsonHeader(token),
  });
  return response.data;
}
