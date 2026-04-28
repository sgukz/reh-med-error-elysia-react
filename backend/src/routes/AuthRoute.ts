import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

import config from "../configs/config";
import { DBMain, DBSec } from '../plugins/db'
import AuthModel from "../models/AuthModel";
import HISModel from "../models/HISModel";
import MedErrorModel from "../models/MedErrorModel";
import _ from "lodash";

const { prefix, jwtSecret, allowed, origin, mode_env } = config;

const JWT_SECRET = jwtSecret || "";
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()).filter(Boolean));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()).filter(Boolean));

const AuthRoute = new Elysia({ prefix: `${prefix}/auth` });
const auth = new AuthModel();
const hos = new HISModel(DBMain);
const mederror = new MedErrorModel(DBSec);

// ตั้งค่า JWT
AuthRoute.use(
    jwt({
        name: "jwt",
        secret: JWT_SECRET,
        exp: "1d",
    })
);

// ฟังก์ชันตรวจสอบ Input ขั้นต้น (ความยาว + รูปแบบ)
const sanitizeInput = (input: string): string | null => {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();
    if (trimmed.length === 0 || trimmed.length > 64) return null;
    return trimmed;
};

// อ่าน origin จาก request (รองรับ referer fallback)
function resolveOrigin(headers: Headers): string | null {
    const o = headers.get("origin");
    if (o) return o;
    const referer = headers.get("referer");
    if (!referer) return null;
    try {
        return new URL(referer).origin;
    } catch {
        return null;
    }
}

// เข้าสู่ระบบ (Login)
AuthRoute.post("/login", async ({ jwt, request, body, set }: any) => {
    try {
        const headers = request.headers;
        const { userName, userPass } = body as { userName: string, userPass: string };
        const client_id = headers.get('client-id') || '';
        const origin = resolveOrigin(headers);

        const loginname = sanitizeInput(userName);
        const loginpwd = sanitizeInput(userPass);

        if (!loginname || !loginpwd) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Invalid input [${StatusCodes.BAD_REQUEST}]` };
        }

        if (ALLOWED_ORIGINS.size > 0 && (!origin || !ALLOWED_ORIGINS.has(origin))) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!client_id || !ALLOWED_CLIENTS.has(client_id)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        const getGUID = await auth.getAuth(DBSec, jwtSecret || '', client_id, mode_env || '');

        if (!getGUID || _.isEmpty(getGUID)) {
            set.status = StatusCodes.NOT_FOUND;
            return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]` };
        }

        const { client_id: registeredClientId, app_name, mode, is_activate } = getGUID[0];
        if (!app_name || !mode || is_activate !== 'Y' || mode !== mode_env || _.isNull(registeredClientId)) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Data does not match [${StatusCodes.BAD_REQUEST}] !` };
        }

        const CheckLogin = await hos.login(loginname, loginpwd);
        if (_.isEmpty(CheckLogin)) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Invalid username or password` };
        }

        const { loginname: hisLoginName, name, department, entryposition, groupname, sex } = CheckLogin[0] || {};
        const authAccess = await mederror.getMedErrorAccess(loginname);
        const { rule } = authAccess[0] || {};
        const randomAvatar = sex === '1'
            ? `male/avatar_${getRandomNumber(1, 14)}.jpg`
            : `female/avatar_${getRandomNumber(1, 11)}.jpg`;
        const opduserObj = {
            loginname: hisLoginName,
            name,
            department,
            entryposition,
            groupname,
            url_avatar: randomAvatar,
            rule: rule ?? null,
        };
        const token = await jwt.sign(opduserObj);
        return { statusCode: StatusCodes.OK, access_token: token };
    } catch (error) {
        console.error("[Auth] /login error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
    }
});

// Refresh Token
AuthRoute.post("/refresh", async ({ jwt, request, set }: any) => {
    try {
        const headers = request.headers;
        const refreshToken = headers.get('authorization')?.split(" ")[1] || '';
        const client_id = headers.get('client-id') || '';
        const origin = resolveOrigin(headers);

        if (ALLOWED_ORIGINS.size > 0 && (!origin || !ALLOWED_ORIGINS.has(origin))) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allowed origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!client_id || !ALLOWED_CLIENTS.has(client_id)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allowed client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!refreshToken) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Missing refresh token` };
        }

        try {
            const decoded = await jwt.verify(refreshToken);
            if (!decoded) {
                set.status = StatusCodes.UNAUTHORIZED;
                return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Invalid refresh token` };
            }
            // ลบ exp/iat ก่อน sign ใหม่ ป้องกันค่าค้างจาก token เดิม
            const { exp, iat, ...payload } = decoded as any;
            const newAccessToken = await jwt.sign(payload);
            return { statusCode: StatusCodes.OK, access_token: newAccessToken };
        } catch {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Invalid or expired refresh token` };
        }
    } catch (error) {
        console.error("[Auth] /refresh error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
    }
});

// Get Profile
AuthRoute.post('/profile', async ({ jwt, set, request }: any) => {
    try {
        const headers = request.headers;
        const token = headers.get('authorization')?.split(" ")[1] || '';
        const clientId = headers.get("client-id");
        const originAllow = resolveOrigin(headers);

        if (ALLOWED_ORIGINS.size > 0 && (!originAllow || !ALLOWED_ORIGINS.has(originAllow))) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed` };
        }
        set.status = StatusCodes.OK;
        return { statusCode: StatusCodes.OK, profile: payload, access_token: token };
    } catch (error) {
        console.error("[Auth] /profile error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
    }
});

function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default AuthRoute;
