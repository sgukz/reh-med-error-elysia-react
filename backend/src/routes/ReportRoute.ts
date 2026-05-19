import { Elysia } from "elysia";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import moment from "moment";

//Config options
import config from "../configs/config";
import { DBSec } from '../plugins/db'

//Model
import ReportModel from "../models/ReportModel";
import MedErrorModel from "../models/MedErrorModel";

//Interface
import { GetMedErrorSummary1Options, GetMedErrorSummary2Options, GetMedErrorSummary6Options, GetMedErrorSummary7Options, GetMedErrorSummary8Options, GetDrugPairReportOptions, GetMedErrorSummary9Options, GetMedErrorSummary10Options, StatVolumeUpsertBody } from '../Interfaces/ReportInterface'
import _ from "lodash";
import 'moment/locale/th'; // นำเข้า locale ภาษาไทย

//Libs
import { formatDateTime } from '../libs/format-date'
import { readAuthTokenFromHeaders } from '../plugins/auth';

// ตั้ง locale เป็นไทย
moment.locale('th');

const { allowed, origin } = config;
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()));

const reports = new ReportModel(DBSec)
const mederror = new MedErrorModel(DBSec)

const ReportRoute = new Elysia({ prefix: `/reports` });

//Report 1
ReportRoute.get('/summary1', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary1Options
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate, depCode } = query as GetMedErrorSummary1Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {

            const GetMedErrorReportSummaryByDept = await reports.getReportSummary1({ firstDate, lastDate, depCode })
            if (!_.isEmpty(GetMedErrorReportSummaryByDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, reportList: GetMedErrorReportSummaryByDept };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.NOT_FOUND, reportList: [] };
            }
        }

    } catch (error) {
        console.error("[Report] error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});


//Using by ReportSummary2
ReportRoute.get('/summary2', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary2Options
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate, depCode } = query as GetMedErrorSummary2Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const wordsDepCode = typeof depCode === "string"
                ? depCode.split(",").map(s => s.trim()).filter(Boolean)
                : [];
            const depCodeArr = wordsDepCode.length === 0 ? "" : wordsDepCode;

            const GetMedErrorReportSummaryByDept = await reports.getReportSummary2({ firstDate, lastDate, depCode: depCodeArr })

            if (!_.isEmpty(GetMedErrorReportSummaryByDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, reportList: GetMedErrorReportSummaryByDept };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.NOT_FOUND, reportList: [] };
            }
        }

    } catch (error) {
        console.error("[Report] error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

// Using by ReportSummary3
ReportRoute.get('/summary3', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary2Options
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate, depCode } = query as GetMedErrorSummary2Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const wordsDepCode = typeof depCode === "string"
                ? depCode.split(",").map(s => s.trim()).filter(Boolean)
                : [];
            const depCodeArr = wordsDepCode.length === 0 ? "" : wordsDepCode;

            const GetMedErrorReportSummaryByDept = await reports.getReportSummary3({ firstDate, lastDate, depCode: depCodeArr })

            if (!_.isEmpty(GetMedErrorReportSummaryByDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, reportList: GetMedErrorReportSummaryByDept };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.NOT_FOUND, reportList: [] };
            }
        }

    } catch (error) {
        console.error("[Report] error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

//Using by ReportSummary5
ReportRoute.get('/summary5', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary2Options
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate, depCode } = query as GetMedErrorSummary2Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const wordsDepCode = typeof depCode === "string"
                ? depCode.split(",").map(s => s.trim()).filter(Boolean)
                : [];
            const depCodeArr = wordsDepCode.length === 0 ? "" : wordsDepCode;

            const GetMedErrorReportSummaryByDept = await reports.getReportSummary5({ firstDate, lastDate, depCode: depCodeArr })

            if (!_.isEmpty(GetMedErrorReportSummaryByDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, reportList: GetMedErrorReportSummaryByDept };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.NOT_FOUND, reportList: [] };
            }
        }

    } catch (error) {
        console.error("[Report] error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});


// Using by ReportSummary6 — สรุปอุบัติการณ์ที่ได้ RCA แล้ว
ReportRoute.get('/summary6', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary6Options
}) => {
    try {
        const headers = request.headers
        const { dateStart, dateEnd, errorType } = query as GetMedErrorSummary6Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        }

        // Validate dates — กัน SQL inject ผ่าน whereBetween (knex bind อยู่แล้ว แต่ตรวจ format กันรูปแบบเพี้ยน)
        const isYMD = (s: any) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
        if (!isYMD(dateStart) || !isYMD(dateEnd)) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: 'dateStart/dateEnd must be YYYY-MM-DD' };
        }
        if (dateStart > dateEnd) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: 'dateStart must be <= dateEnd' };
        }

        const reportList = await reports.getReportSummary6({ dateStart, dateEnd, errorType })

        // Build summary (analytics)
        const total = reportList.length;
        const E_PLUS = new Set(['E', 'F', 'G', 'H', 'I']);
        const HIGH_ALERT = 'High Alert Drugs';
        let levelEPlus = 0;
        let hadCount = 0;
        let rcaDaysSum = 0;
        let rcaDaysCount = 0;
        const typeCount = new Map<string, number>();
        const wardCount = new Map<string, number>();

        for (const r of reportList as any[]) {
            if (E_PLUS.has(String(r.error_level))) levelEPlus += 1;
            if (r.error_alert === HIGH_ALERT) hadCount += 1;
            const days = Number(r.rca_days);
            if (Number.isFinite(days) && days >= 0) {
                rcaDaysSum += days;
                rcaDaysCount += 1;
            }
            const tName = r.error_type_name || '';
            if (tName) typeCount.set(tName, (typeCount.get(tName) || 0) + 1);
            const wName = r.error_ward_name || '';
            if (wName) wardCount.set(wName, (wardCount.get(wName) || 0) + 1);
        }

        const pickTop = (m: Map<string, number>) => {
            let topKey = '';
            let topVal = -1;
            for (const [k, v] of m.entries()) {
                if (v > topVal) {
                    topKey = k;
                    topVal = v;
                }
            }
            return topKey;
        };

        const summary = {
            total,
            levelEPlus,
            hadCount,
            avgRcaDays: rcaDaysCount > 0 ? Number((rcaDaysSum / rcaDaysCount).toFixed(2)) : 0,
            topErrorType: pickTop(typeCount),
            topWard: pickTop(wardCount),
        };

        set.status = StatusCodes.OK;
        return { statusCode: StatusCodes.OK, reportList, summary };

    } catch (error) {
        console.error("[Report] summary6 error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

//Using by ReportSummary7
ReportRoute.get('/summary7', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary7Options
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate } = query as GetMedErrorSummary7Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const GetMedErrorReportSummaryByDept = await reports.getReportSummary7({ firstDate, lastDate })

            if (!_.isEmpty(GetMedErrorReportSummaryByDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, reportList: GetMedErrorReportSummaryByDept };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.NOT_FOUND, reportList: [] };
            }
        }

    } catch (error) {
        console.error("[Report] error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

// Using by ReportSummary8
ReportRoute.get('/summary8', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary8Options
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate, depCode, errorType, errorLevel, errorAlert } = query as GetMedErrorSummary8Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const wordsDepCode = typeof depCode === "string"
                ? depCode.split(",").map(s => s.trim()).filter(Boolean)
                : [];
            const depCodeArr = wordsDepCode.length === 0 ? "" : wordsDepCode;

            const errorLevelCode = typeof errorLevel === "string"
                ? errorLevel.split(",").map(s => s.trim()).filter(Boolean)
                : [];
            const errorLevelCodeArr = errorLevelCode.length === 0 ? "" : errorLevelCode;
            const HAD = {
                N: "ไม่ใช่ High Alert Drugs",
                Y: "High Alert Drugs",
            } as const;

            const errorAlertHAD = errorAlert && (errorAlert === 'N' || errorAlert === 'Y') ? HAD[errorAlert] : ''

            const dataCondition = { firstDate, lastDate, depCode: depCodeArr, errorType, errorLevel: errorLevelCodeArr, errorAlert: errorAlertHAD }

            const GetMedErrorReportSummaryByDept = await reports.getReportSummary8(dataCondition)

            if (!_.isEmpty(GetMedErrorReportSummaryByDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, reportList: GetMedErrorReportSummaryByDept };
            } else {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.NOT_FOUND, reportList: [] };
            }
        }

    } catch (error) {
        console.error("[Report] error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

// รายงานแยกรายละเอียด Error — subtype level, รองรับ compare 2 periods, มี Impact/Likelihood/Level
ReportRoute.get('/summary9', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetMedErrorSummary9Options
}) => {
    try {
        const headers = request.headers
        const { firstDateA, lastDateA, firstDateB, lastDateB, errorType } = query as GetMedErrorSummary9Options
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        }

        if (!firstDateA || !lastDateA || !errorType) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Missing required params: firstDateA, lastDateA, errorType` };
        }

        const ERROR_TYPE_NAMES: Record<number, string> = {
            1: 'Prescription Error',
            2: 'Dispensing Error',
            3: 'Pre-Administration Error',
            4: 'Administration Error',
            5: 'Processing Error',
            6: 'Transcribing Error',
        };
        const numType = Number(errorType);
        const errorTypeName = ERROR_TYPE_NAMES[numType] || '';

        const rows = await reports.getReportSummary9({ firstDateA, lastDateA, firstDateB, lastDateB, errorType });

        set.status = StatusCodes.OK;
        return {
            statusCode: StatusCodes.OK,
            errorType: numType,
            errorTypeName,
            compare: Boolean(firstDateB && lastDateB),
            reportList: rows || [],
        };

    } catch (error) {
        console.error("[Report] summary9 error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

// คู่ยาที่คลาดเคลื่อน (จัด=type 2, คีย์=type 5) — ใช้กับ ReportSummary4
ReportRoute.get('/drug-pair-summary', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: GetDrugPairReportOptions
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate, pairType } = query as GetDrugPairReportOptions
        const token = readAuthTokenFromHeaders(headers)
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

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        }

        if (!firstDate || !lastDate) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Missing firstDate or lastDate` };
        }

        const normalizedPairType: 'dispensing' | 'processing' =
            pairType === 'processing' ? 'processing' : 'dispensing';

        const rows = await reports.getDrugPairSummary({ firstDate, lastDate, pairType: normalizedPairType })

        set.status = StatusCodes.OK;
        return _.isEmpty(rows)
            ? { statusCode: StatusCodes.NOT_FOUND, reportList: [] }
            : { statusCode: StatusCodes.OK, reportList: rows };

    } catch (error) {
        console.error("[Report] drug-pair error");
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        };
    }
});

// ========================================================================
// ReportSummary10 — สถิติจำนวนใบสั่งยา (OPD) + วันนอน (IPD)
// ========================================================================

// Validate fiscalYear — ต้องเป็น integer ในช่วงที่สมเหตุสมผล (พ.ศ. 2400-2700)
function parseFiscalYear(v: unknown): { ok: true; value: number } | { ok: false; msg: string } {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return { ok: false, msg: 'fiscalYear must be an integer' };
    }
    if (n < 2400 || n > 2700) {
        return { ok: false, msg: 'fiscalYear must be between 2400 and 2700 (BE)' };
    }
    return { ok: true, value: n };
}

// Validate stat-volume rows — month 1-12, volumes >= 0
function validateStatVolumeRows(rows: any[]): { ok: true; rows: Array<{ stat_month: number; ipd_patient_days: number; opd_prescriptions: number }> } | { ok: false; msg: string } {
    if (!Array.isArray(rows) || rows.length === 0) {
        return { ok: false, msg: 'rows must be a non-empty array' };
    }
    if (rows.length > 12) {
        return { ok: false, msg: 'rows must have at most 12 items' };
    }
    const normalized: Array<{ stat_month: number; ipd_patient_days: number; opd_prescriptions: number }> = [];
    const seenMonths = new Set<number>();
    for (let i = 0; i < rows.length; i += 1) {
        const r = rows[i];
        const m = Number(r?.stat_month);
        if (!Number.isInteger(m) || m < 1 || m > 12) {
            return { ok: false, msg: `rows[${i}].stat_month must be integer 1-12` };
        }
        if (seenMonths.has(m)) {
            return { ok: false, msg: `rows[${i}].stat_month duplicated (${m})` };
        }
        seenMonths.add(m);
        const ipd = Number(r?.ipd_patient_days);
        const opd = Number(r?.opd_prescriptions);
        if (!Number.isFinite(ipd) || ipd < 0) {
            return { ok: false, msg: `rows[${i}].ipd_patient_days must be >= 0` };
        }
        if (!Number.isFinite(opd) || opd < 0) {
            return { ok: false, msg: `rows[${i}].opd_prescriptions must be >= 0` };
        }
        normalized.push({ stat_month: m, ipd_patient_days: ipd, opd_prescriptions: opd });
    }
    return { ok: true, rows: normalized };
}

// helper: origin + clientId + token check ใช้ร่วมหลาย endpoint summary10
async function authGate(headers: Headers, jwt: any, set: any) {
    const token = readAuthTokenFromHeaders(headers);
    const clientId = headers.get('client-id');
    let originAllow = headers.get('origin');
    if (!originAllow) {
        const referer = headers.get('referer');
        if (referer) {
            try { originAllow = new URL(referer).origin; } catch { /* ignore */ }
        }
    }
    if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
        set.status = StatusCodes.FORBIDDEN;
        return { ok: false, body: { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` } };
    }
    if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
        set.status = StatusCodes.FORBIDDEN;
        return { ok: false, body: { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` } };
    }
    if (!token) {
        set.status = StatusCodes.UNAUTHORIZED;
        return { ok: false, body: { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: 'Request missing Authorization Data' } };
    }
    const payload: any = await jwt.verify(token);
    if (!payload) {
        set.status = StatusCodes.UNAUTHORIZED;
        return { ok: false, body: { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: 'Identity verification failed' } };
    }
    return { ok: true as const, token, payload };
}

// GET /reports/summary10 — รวม statVolume + errorCounts ใน response เดียว
ReportRoute.get('/summary10', async ({ jwt, set, request, query }: any) => {
    try {
        const gate = await authGate(request.headers, jwt, set);
        if (!gate.ok) return gate.body;

        const { fiscalYear } = query as GetMedErrorSummary10Options;
        const fyCheck = parseFiscalYear(fiscalYear);
        if (!fyCheck.ok) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: fyCheck.msg };
        }
        const fiscalYearBE = fyCheck.value;

        const [statVolume, errorCounts] = await Promise.all([
            reports.getStatVolume(fiscalYearBE),
            reports.getReportSummary10({ fiscalYear: fiscalYearBE }),
        ]);

        set.status = StatusCodes.OK;
        return {
            statusCode: StatusCodes.OK,
            fiscalYear: fiscalYearBE,
            statVolume,
            errorCounts,
        };
    } catch (error) {
        console.error('[Report] summary10 error');
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
    }
});

// GET /reports/stat-volume — ดึงเฉพาะ TABLE 0
ReportRoute.get('/stat-volume', async ({ jwt, set, request, query }: any) => {
    try {
        const gate = await authGate(request.headers, jwt, set);
        if (!gate.ok) return gate.body;

        const { fiscalYear } = query as { fiscalYear?: string | number };
        const fyCheck = parseFiscalYear(fiscalYear);
        if (!fyCheck.ok) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: fyCheck.msg };
        }
        const rows = await reports.getStatVolume(fyCheck.value);
        set.status = StatusCodes.OK;
        return { statusCode: StatusCodes.OK, fiscalYear: fyCheck.value, statVolume: rows };
    } catch (error) {
        console.error('[Report] stat-volume GET error');
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
    }
});

// POST /reports/stat-volume — save/update TABLE 0 (admin only, rule === 9)
ReportRoute.post('/stat-volume', async ({ jwt, set, request, body }: any) => {
    try {
        const gate = await authGate(request.headers, jwt, set);
        if (!gate.ok) return gate.body;

        // Admin guard — เช็ค rule จาก med_error_access
        const loginname = gate.payload?.loginname;
        if (!loginname) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: 'Admin access required' };
        }
        const access = await mederror.getMedErrorAccess(loginname);
        const rule = Array.isArray(access) && access.length > 0 ? Number(access[0]?.rule) : null;
        if (rule !== 9) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: 'Admin access required' };
        }

        const payload = body as StatVolumeUpsertBody;
        const fyCheck = parseFiscalYear(payload?.fiscalYear);
        if (!fyCheck.ok) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: fyCheck.msg };
        }
        const rowsCheck = validateStatVolumeRows(payload?.rows);
        if (!rowsCheck.ok) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: rowsCheck.msg };
        }

        const affected = await reports.upsertStatVolume({
            fiscalYear: fyCheck.value,
            rows: rowsCheck.rows,
            updated_by: payload.updated_by || loginname,
        });

        // ส่งข้อมูลล่าสุดกลับให้ frontend อัปเดต state ได้ทันที
        const statVolume = await reports.getStatVolume(fyCheck.value);
        set.status = StatusCodes.OK;
        return { statusCode: StatusCodes.OK, affected, statVolume };
    } catch (error) {
        console.error('[Report] stat-volume POST error');
        set.status = StatusCodes.INTERNAL_SERVER_ERROR;
        return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
    }
});

export default ReportRoute

