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

export async function getAuthenticatedUser(userData) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
    };

    const response = await axios({
      method: API_METHOD.POST,
      url: API_ROUTE.AUTH,
      headers: header,
      withCredentials: true,
      data: userData,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

export async function getProfileUser(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const response = await axios({
      method: API_METHOD.POST,
      url: API_ROUTE.PERSON_ALL,
      headers: header,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

export async function refreshToken(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const response = await axios({
      method: API_METHOD.POST,
      url: API_ROUTE.REFRESH,
      headers: header,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

export async function verifyToken(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const response = await axios({
      method: API_METHOD.POST,
      url: API_ROUTE.PROFILE,
      headers: header,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

export async function getAuthenticatedVerify(accessToken) {
  return accessToken;
}
