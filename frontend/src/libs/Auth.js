import axios from 'axios';
import { API_ROUTE, API_METHOD, API_SECURITY } from '../utils/constants';



export function removeTokenFromLocalStorage() {
  // เผื่อกรณีมีค่าเก่าตกค้างจากเวอร์ชันก่อน ก็ลบทิ้งให้สะอาด
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  } catch (_e) {
    /* ignore */
  }
}

function jsonHeader(token) {
  const header = {
    'Content-Type': 'application/json',
    'client-id': API_SECURITY.UUID,
  };
  // ถ้ามี token ส่งใน Authorization header ด้วย (backend รองรับทั้ง cookie + header)
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
    withCredentials: true,
  });
  return response.data;
}

// ตรวจสอบสถานะ login — ใช้ cookie เป็นหลัก, header เป็น fallback
// เลิก bail ตอน token=null เพราะ cookie จะถูกส่งโดย browser อัตโนมัติ
export async function verifyToken(token) {
  try {
    const response = await axios({
      method: API_METHOD.POST,
      url: API_ROUTE.PROFILE,
      headers: jsonHeader(token),
      withCredentials: true,
    });
    return response.data;
  } catch (_e) {
    return { statusCode: 401, profile: null };
  }
}

// Logout — เรียก backend เพื่อล้าง HTTP-only cookie
export async function logout() {
  try {
    await axios({
      method: API_METHOD.POST,
      url: API_ROUTE.LOGOUT,
      headers: jsonHeader(),
      withCredentials: true,
    });
  } catch (_e) {
    // เงียบ — แม้ล้มก็ต้องเดินต่อไปหน้า login ฝั่ง client
  }
}
