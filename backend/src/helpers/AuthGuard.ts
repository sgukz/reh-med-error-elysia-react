import { StatusCodes } from "http-status-codes";
import config from "../configs/config";

const ALLOWED_CLIENTS = new Set(
    (config.allowed || "").split(",").map((c) => c.trim()).filter(Boolean)
);
const ALLOWED_ORIGINS = new Set(
    (config.origin || "").split(",").map((o) => o.trim()).filter(Boolean)
);

export interface GuardSuccess {
    ok: true;
    payload: any;
    token: string;
}

export interface GuardFailure {
    ok: false;
    statusCode: number;
    statusMessage: string;
}

export type GuardResult = GuardSuccess | GuardFailure;

function resolveOrigin(headers: Headers): string | null {
    const origin = headers.get("origin");
    if (origin) return origin;
    const referer = headers.get("referer");
    if (!referer) return null;
    try {
        return new URL(referer).origin;
    } catch {
        return null;
    }
}

/**
 * ตรวจสอบ Origin + Client ID + JWT token
 * - คืน { ok: true, payload, token } เมื่อผ่าน
 * - คืน { ok: false, statusCode, statusMessage } เมื่อไม่ผ่าน
 *
 * options.requireToken=false จะข้ามการตรวจ token (ใช้สำหรับ /auth/login)
 */
export async function verifyRequest(
    request: Request,
    jwtVerifier?: { verify: (token: string) => Promise<any> },
    options: { requireToken?: boolean } = { requireToken: true }
): Promise<GuardResult> {
    const headers = request.headers;
    const origin = resolveOrigin(headers);
    const clientId = headers.get("client-id") || "";

    if (ALLOWED_ORIGINS.size > 0 && (!origin || !ALLOWED_ORIGINS.has(origin))) {
        return {
            ok: false,
            statusCode: StatusCodes.FORBIDDEN,
            statusMessage: "Origin ไม่ได้รับอนุญาต",
        };
    }

    if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
        return {
            ok: false,
            statusCode: StatusCodes.FORBIDDEN,
            statusMessage: "Client ไม่ได้รับอนุญาต",
        };
    }

    if (options.requireToken === false) {
        return { ok: true, payload: null, token: "" };
    }

    const auth = headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) {
        return {
            ok: false,
            statusCode: StatusCodes.UNAUTHORIZED,
            statusMessage: "ไม่พบข้อมูล Authorization",
        };
    }

    if (!jwtVerifier) {
        return {
            ok: false,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: "ระบบตรวจสอบ token ไม่พร้อมใช้งาน",
        };
    }

    try {
        const payload = await jwtVerifier.verify(token);
        if (!payload) {
            return {
                ok: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                statusMessage: "Token ไม่ถูกต้องหรือหมดอายุ",
            };
        }
        return { ok: true, payload, token };
    } catch {
        return {
            ok: false,
            statusCode: StatusCodes.UNAUTHORIZED,
            statusMessage: "Token ไม่ถูกต้องหรือหมดอายุ",
        };
    }
}

/**
 * แปลง error object → ข้อความ generic ที่ปลอดภัย (ไม่ leak DB detail)
 */
export function safeErrorMessage(_error: unknown): string {
    return "เกิดข้อผิดพลาดภายในระบบ";
}
