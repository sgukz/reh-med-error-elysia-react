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
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()));

const AuthRoute = new Elysia({ prefix: `${prefix}/auth` });
const auth = new AuthModel();
const hos = new HISModel(DBMain);
const mederror = new MedErrorModel(DBSec);

// // Function สำหรับดึง IP Address จาก Request
// const getClientIP = (request: Request) => {
//     return request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || request.headers.get('remote-addr') || request.headers.get('origin')
// }

// ตั้งค่า JWT
AuthRoute.use(
    jwt({
        name: "jwt",
        secret: JWT_SECRET,
        exp: "1d",
    })
);

// ฟังก์ชันตรวจสอบ Input (ป้องกัน SQL Injection)
const sanitizeInput = (input: string): string | null => {
    if (!input || typeof input !== "string") return null;
    if (input.length > 36) return null; // จำกัดความยาว
    return input.trim();
};

// เข้าสู่ระบบ (Login)
AuthRoute.post("/login", async ({ jwt, request, body, set }: any) => {
    try {
        const header = request.headers
        const { userName, userPass } = body as { userName: string, userPass: string };
        const client_id = header.get('client-id') || '';
        let origin = header.get("origin");

        if (!origin) {
            const referer = header.get("referer");
            if (referer) {
                try {
                    origin = new URL(referer).origin;
                } catch (e) {
                }
            }
        }
        const ip = header.get("ip") || "";
        const loginname = sanitizeInput(userName);
        const loginpwd = sanitizeInput(userPass);

        if (!loginname && !loginpwd) {
            set.status = StatusCodes.OK
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Invalide input [${StatusCodes.BAD_REQUEST}]` };
        }

        if (!origin && !ALLOWED_ORIGINS.has(origin)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!client_id || !ALLOWED_CLIENTS.has(client_id)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        const getGUID = await auth.getAuth(DBSec, jwtSecret || '', client_id, mode_env || '');

        if (!getGUID || _.isEmpty(getGUID)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]` };
        } else {
            const { client_id, app_name, mode, is_activate } = getGUID[0]
            if (app_name && mode) {
                if (is_activate === 'Y' && mode === mode_env && !_.isNull(client_id)) {
                    const CheckLogin = await hos.login(userName, userPass);
                    if (!_.isEmpty(CheckLogin)) {
                        const { loginname, name, department, entryposition, groupname, sex } = CheckLogin[0] || {}
                        const authAccess = await mederror.getMedErrorAccess(userName);

                        const { rule } = authAccess[0] || {};
                        const randomAvatar = sex === '1' ? `male/avatar_${getRandomNumber(1, 14)}.jpg` : `female/avatar_${getRandomNumber(1, 11)}.jpg`
                        const opduserObj = { loginname, name, department, entryposition, groupname, url_avatar: randomAvatar, rule: rule ? rule : null }
                        const token = await jwt.sign(opduserObj);
                        return { access_token: token };
                    } else {
                        set.status = StatusCodes.OK;
                        return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Data does not match [${StatusCodes.BAD_REQUEST}] !` };
                    }
                } else {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Data does not match [${StatusCodes.BAD_REQUEST}] !` };
                }
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Invalid data [${StatusCodes.BAD_REQUEST}]` };
            }
        }
    } catch (error) {

        if (error instanceof Error) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});

// Refresh Token
AuthRoute.post("/refresh", async ({ jwt, request, body, set }: any) => {
    try {
        const header = request.headers;
        const refreshToken = header.get('authorization')?.split(" ")[1]
        const client_id = header.get('client-id') || '';
        let origin = header.get("origin");

        if (!origin) {
            const referer = header.get("referer");
            if (referer) {
                try {
                    origin = new URL(referer).origin;
                } catch (e) {

                }
            }
        }

        // ตรวจสอบ origin ว่าอนุญาตให้ทำการเชื่อมต่อหรือไม่
        if (!origin || !ALLOWED_ORIGINS.has(origin)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allowed origin [${StatusCodes.FORBIDDEN}]` };
        }

        // ตรวจสอบ client_id ว่าอนุญาตให้เชื่อมต่อหรือไม่
        if (!client_id || !ALLOWED_CLIENTS.has(client_id)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allowed client [${StatusCodes.FORBIDDEN}]` };
        }

        // ตรวจสอบและรีเฟรช access token
        try {
            const decoded = await jwt.verify(refreshToken, jwtSecret || '');
            if (decoded) {
                // รีเฟรช token
                const newAccessToken = await jwt.sign(decoded);
                return { access_token: newAccessToken };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Invalid refresh token [${StatusCodes.UNAUTHORIZED}]` };
            }
        } catch (err) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Invalid or expired refresh token [${StatusCodes.UNAUTHORIZED}]` };
        }
    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});


//Get Profile
AuthRoute.post('/profile', async ({
    jwt,
    set,
    request
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
}) => {
    try {
        const headers = request.headers
        const token = headers.get('authorization')?.split(" ")[1]
        const clientId = headers.get("client-id")
        let originAllow = headers.get("origin");

        if (!originAllow) {
            const referer = headers.get("referer");
            if (referer) {
                try {
                    originAllow = new URL(referer).origin;
                } catch (e) {
                }
            }
        }

        if (!originAllow && !ALLOWED_ORIGINS.has(originAllow || "")) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.OK, profile: payload, access_token: token };
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});

function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default AuthRoute;


