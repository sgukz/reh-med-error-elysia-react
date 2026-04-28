import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import moment from "moment";

//Config options
import config from "../configs/config";
import { DBSec } from '../plugins/db'

//Model
import DashboardModel from "../models/DashboardModel";

//Interface
import { SummaryFromMedError } from '../Interfaces/DashboardInterface'
import _ from "lodash";
import 'moment/locale/th'; // นำเข้า locale ภาษาไทย

// ตั้ง locale เป็นไทย
moment.locale('th');

const { allowed, origin } = config;
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()));

const dashboard = new DashboardModel(DBSec)

const DashboardRoute = new Elysia({ prefix: `/dashboard` });

//Get doctor data from his
DashboardRoute.get('/mederror', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
    query: SummaryFromMedError
}) => {
    try {
        const headers = request.headers
        const { firstDate, lastDate } = query as SummaryFromMedError
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
            const GetFiscalYearFromMedError = await dashboard.getFiscalYearFromMedError();
            if (!_.isEmpty(GetFiscalYearFromMedError)) {
                const fiscalYearList = GetFiscalYearFromMedError.map(row => row.error_year.toString());
                const GetSummaryFromMedError = await dashboard.getSummaryFromMedError(firstDate, lastDate)
                const GetSummaryWithErrorType = await dashboard.getErrorSummary(firstDate, lastDate)
                if (!_.isEmpty(GetSummaryFromMedError)) {
                    const response = GetSummaryFromMedError.map(row => ({
                        fiscalYear: row.fiscal_year_buddhist,
                        total: Number(row.total_errors),
                        data: [
                            { label: 'Prescription Error', value: Number(row.prescription_error) },
                            { label: 'Dispensing Error', value: Number(row.dispensing_error) },
                            { label: 'Pre-Adminstration Error', value: Number(row.pre_admin_error) },
                            { label: 'Adminstration Error', value: Number(row.admin_error) },
                            { label: 'Processing Error', value: Number(row.processing_error) }
                        ]
                    }));

                    return { statusCode: StatusCodes.OK, fiscalYearList: fiscalYearList, summaryList: response, summaryErrorTypeList: GetSummaryWithErrorType };
                } else {
                    return { statusCode: StatusCodes.OK, fiscalYearList: fiscalYearList, summaryList: [] };
                }
            }
        }

    } catch (error) {
        console.log(error);

        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});

export default DashboardRoute

