import { Elysia } from "elysia";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import moment from "moment";

//Config options
import config from "../configs/config";
import { DBSec } from '../plugins/db'

//Model
import ReportModel from "../models/ReportModel";

//Interface
import { GetMedErrorSummary1Options, GetMedErrorSummary2Options, GetMedErrorSummary7Options, GetMedErrorSummary8Options } from '../Interfaces/ReportInterface'
import _ from "lodash";
import 'moment/locale/th'; // นำเข้า locale ภาษาไทย

//Libs
import { formatDateTime } from '../libs/format-date'

// ตั้ง locale เป็นไทย
moment.locale('th');

const { allowed, origin } = config;
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()));

const reports = new ReportModel(DBSec)

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

export default ReportRoute

