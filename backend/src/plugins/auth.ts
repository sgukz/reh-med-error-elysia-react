// Auth helpers ใช้ร่วมระหว่าง AuthRoute และ protected routes
// รองรับการเปลี่ยนผ่านจาก Bearer header → HTTP-only cookie โดยอ่านได้ทั้งคู่
// (Authorization header ก่อน → fallback Cookie header)

import config from '../configs/config';

const COOKIE_NAME = config.cookieName;

// อ่าน token จาก headers (Authorization Bearer หรือ Cookie)
// ใช้ใน protected route handler ได้เลยโดยไม่ต้องแตะ destructure
export function readAuthTokenFromHeaders(headers: Headers): string | null {
    // 1) Authorization: Bearer <token>
    const auth = headers.get('authorization');
    if (auth) {
        const parts = auth.split(' ');
        if (parts.length === 2 && parts[1]) return parts[1];
    }

    // 2) Cookie: access_token=<token>
    const cookieHeader = headers.get('cookie');
    if (cookieHeader) {
        const safeName = COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = cookieHeader.match(new RegExp(`(?:^|; )${safeName}=([^;]+)`));
        if (match && match[1]) {
            try {
                return decodeURIComponent(match[1]);
            } catch {
                return match[1];
            }
        }
    }
    return null;
}

// ตั้ง cookie หลัง login สำเร็จ — รวม options ทั้งหมดในที่เดียวเพื่อความสอดคล้อง
export function setAuthCookie(cookie: any, token: string): void {
    if (!cookie || !cookie[COOKIE_NAME]) return;
    cookie[COOKIE_NAME].set({
        value: token,
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: config.cookieSameSite,
        path: '/',
        maxAge: config.cookieMaxAgeSec,
    });
}

// ลบ cookie ตอน logout / token หมดอายุ
export function clearAuthCookie(cookie: any): void {
    if (!cookie || !cookie[COOKIE_NAME]) return;
    cookie[COOKIE_NAME].set({
        value: '',
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: config.cookieSameSite,
        path: '/',
        maxAge: 0,
    });
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
