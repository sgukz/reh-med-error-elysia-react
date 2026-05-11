import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import moment from "moment";
import config from "../configs/config";
import { DBMain, DBSec } from '../plugins/db'
import HISModel from "../models/HISModel";
import MedErrorModel from "../models/MedErrorModel";

import {
    DoctorData,
    DrugItemData,
    TypeError,
    TypeErrorList,
    TypeErrorListCreate,
    TypeErrorListDelete,
    PersonData,
    PersonCreate,
    PersonDelete,
    DepartmentQuery,
    DepartmentData,
    DepartmentCreate,
    DepartmentDelete,
    AnalysisQuery,
    AnalysisData,
    AnalysisDelete,
    MedErrerQuery,
    MedErrorDataList,
    MedErrorCreate,
    MedErrorDelete,
    PatientInfoQuery,
    MedErrorUpdateRCA
} from '../Interfaces/MedErrorInterface'

import _ from "lodash";

// Using Route
import DashboardRoute from "./DashboardRoute";
import ReportRoute from "./ReportRoute";
import { readAuthTokenFromHeaders } from '../plugins/auth';
import 'moment/locale/th'; // นำเข้า locale ภาษาไทย
import { formatDateTime } from "../libs/format-date";
import axios from "axios";

// ตั้ง locale เป็นไทย
moment.locale('th');

const { prefix, jwtSecret, allowed, origin, MOPH_CLIENT_ID, MOPH_SECRET_ID } = config;

const JWT_SECRET = jwtSecret || "";
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()));

//Model
const hos = new HISModel(DBMain);
const mederror = new MedErrorModel(DBSec);

// ส่งข้อความผ่าน MOPH alert (ไม่ throw ออกไปทำ request หลักล้มเหลว)
async function reply(formatMessage: any): Promise<void> {
    try {
        const headers = {
            "Content-Type": "application/json",
            "client-key": MOPH_CLIENT_ID,
            "secret-key": MOPH_SECRET_ID,
        };
        const arrayMessages = Array.isArray(formatMessage) ? formatMessage : [formatMessage];
        const BASE_URL = `https://morpromt2f.moph.go.th/api/notify/send`;
        await axios.post(BASE_URL, { messages: arrayMessages }, { headers, timeout: 5000 });
    } catch (error) {
        console.error("MOPH notify failed");
    }
}

const MedErrorRoute = new Elysia({ prefix: `${prefix}/med-error` });

// ตั้งค่า JWT
MedErrorRoute.use(
    jwt({
        name: "jwt",
        secret: JWT_SECRET,
        exp: "1d",
    })
);

MedErrorRoute.use(DashboardRoute)
MedErrorRoute.use(ReportRoute)

// GET/doctor
MedErrorRoute.get('/doctor', async ({
    jwt,
    set,
    request,
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
}) => {
    try {
        const headers = request.headers
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
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const GetDoctorData: DoctorData[] = await hos.getDoctorAll();
            if (!_.isEmpty(GetDoctorData)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, doctorList: GetDoctorData[0] };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, doctorList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/drugitems
MedErrorRoute.get('/drugitems', async ({
    jwt,
    set,
    request,
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request
}) => {
    try {
        const headers = request.headers
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
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const GetDrugItemData: DrugItemData[] = await hos.getDrugItemAll();
            if (!_.isEmpty(GetDrugItemData)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, drugitemList: GetDrugItemData };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, drugitemList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/get-error-type
MedErrorRoute.get('/get-error-type', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: TypeError
}) => {
    try {
        const headers = request.headers
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
        const { sec, id } = query as { sec: number, id: number };

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            let ErrorTypeList: Array<number> = [];

            if (sec && _.isNumber(+sec)) {
                switch (+sec) {
                    case 1:
                        ErrorTypeList = [1, 2, 3, 4]
                        break;
                    case 2:
                        ErrorTypeList = [1, 2, 4, 5, 6]
                        break;
                    case 3:
                        ErrorTypeList = [1, 2, 3, 4, 5, 6]
                        break;
                }
            }
            if (id && _.isNumber(+id)) {
                ErrorTypeList.push(+id)
            }

            const ErrorType = await mederror.getErrorTypeByType(ErrorTypeList)
            if (!_.isEmpty(ErrorType) && ErrorType) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, errorTypeList: ErrorType };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, errorTypeList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/get-error-type-list
MedErrorRoute.get('/get-error-type-list', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: TypeErrorList
}) => {
    try {
        const headers = request.headers
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
        const { id } = query as { id: number };

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const ErrorTypeList = await mederror.getErrorTypeByTypeList(+id)
            if (!_.isEmpty(ErrorTypeList) && ErrorTypeList) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, errorTypeList: ErrorTypeList };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, errorTypeList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// POST/create-error-type-list
MedErrorRoute.post('/create-error-type-list', async ({
    jwt,
    set,
    request,
    body
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    body: TypeErrorListCreate
}) => {
    try {
        const headers = request.headers
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
        const ErrorTypeList = body as TypeErrorListCreate;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_type_list";
            const { error_type, error_type_list, error_type_list_detail, is_active, type_id, impact_score } = ErrorTypeList

            // Validate impact_score: ต้องเป็น null หรือ integer 1-5
            const normalizedImpact: number | null =
                impact_score === null || impact_score === undefined
                    ? null
                    : Number.isInteger(Number(impact_score)) && Number(impact_score) >= 1 && Number(impact_score) <= 5
                        ? Number(impact_score)
                        : NaN;
            if (Number.isNaN(normalizedImpact)) {
                set.status = StatusCodes.BAD_REQUEST;
                return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Invalid impact_score (ต้องเป็น null หรือ 1-5)` };
            }

            const formSaveData = {
                error_type: error_type,
                error_type_list: error_type_list,
                error_type_list_detail: error_type_list_detail,
                is_active: is_active,
                impact_score: normalizedImpact
            }
            if (type_id === 0) {
                const savedErrorTypeList = await mederror.saveData(tableName, formSaveData)
                if (!_.isEmpty(savedErrorTypeList) && savedErrorTypeList) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, errorTypeList: savedErrorTypeList, section: "create", type_alert: "success" };
                }
            } else {
                const conditionUpdate = {
                    type_id: type_id
                }
                const updateErrorTypeList = await mederror.updateData(tableName, formSaveData, conditionUpdate);

                return { statusCode: StatusCodes.OK, errorTypeList: [updateErrorTypeList], section: "update", type_alert: "warning" };
            }

        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// DELETE/delete-error-type-list
MedErrorRoute.delete('/delete-error-type-list', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: TypeErrorListDelete
}) => {
    try {
        const headers = request.headers
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
        const DeleteErrorType = query as TypeErrorListDelete;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_type_list";
            if (DeleteErrorType) {
                const deleteErrorTypeList = await mederror.deleteData(tableName, DeleteErrorType);

                if (deleteErrorTypeList > 0) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, errorTypeList: deleteErrorTypeList, section: "delete", type_alert: "success" };
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/person
MedErrorRoute.get('/person', async ({
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
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const GetPersonAll: PersonData[] = await mederror.getMedErrorPersonAll()
            if (!_.isEmpty(GetPersonAll)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, personList: GetPersonAll };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, personList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// POST/create-person
MedErrorRoute.post('/create-person', async ({
    jwt,
    set,
    request,
    body
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    body: PersonCreate
}) => {
    try {
        const headers = request.headers
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
        const personForm = body as PersonCreate;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_person";
            const { error_key_person_id, error_key_person_name, error_key_sec } = personForm
            const formSaveData = {
                error_key_person_name: error_key_person_name,
                error_key_sec: error_key_sec
            }

            if (!error_key_person_id) {
                const savedPerson = await mederror.saveData(tableName, formSaveData)
                if (!_.isEmpty(savedPerson) && savedPerson) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, personList: savedPerson, section: "create", type_alert: "success" };
                }
            } else {
                const conditionUpdate = {
                    error_key_person_id: error_key_person_id
                }
                const updatePerson = await mederror.updateData(tableName, formSaveData, conditionUpdate);
                return { statusCode: StatusCodes.OK, personList: [updatePerson], section: "update", type_alert: "warning" };
            }

        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// DELETE/delete-person
MedErrorRoute.delete('/delete-person', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: PersonDelete
}) => {
    try {
        const headers = request.headers
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
        const DeletePerson = query as PersonDelete;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_person";

            if (DeletePerson.error_key_person_id && DeletePerson.error_key_person_id !== 0) {
                const checkDeletePerson = await mederror.deleteData(tableName, DeletePerson);
                if (checkDeletePerson > 0) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, deletePerson: checkDeletePerson, section: "delete", type_alert: "success" };
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/get-dept
MedErrorRoute.get('/get-dept', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: DepartmentQuery
}) => {
    try {
        const headers = request.headers
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
        const DepartQuery = query as DepartmentQuery;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const GetDept: DepartmentData[] = (await mederror.getMedErrorDeptAll(DepartQuery)) || []
            if (GetDept && !_.isEmpty(GetDept)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, departmentList: GetDept };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, departmentList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// POST/create-dept
MedErrorRoute.post('/create-dept', async ({
    jwt,
    set,
    request,
    body
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    body: DepartmentCreate
}) => {
    try {
        const headers = request.headers
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

        if (!originAllow) {
            const referer = headers.get("referer");
            if (referer) {
                try {
                    originAllow = new URL(referer).origin;
                } catch (e) {
                }
            }
        }
        const departForm = body as DepartmentCreate;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_dept";
            const {
                med_error_depcode,
                med_error_depname,
                med_error_dep_group_id,
                med_error_is_active,
            } = departForm

            const formSaveData = {
                med_error_depname: med_error_depname,
                med_error_dep_group_id: med_error_dep_group_id,
                med_error_is_active: med_error_is_active,
            }
            if (med_error_depcode === 0) {
                const savedDepartment = await mederror.saveData(tableName, formSaveData)
                if (!_.isEmpty(savedDepartment) && savedDepartment) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, departList: savedDepartment, section: "create", type_alert: "success" };
                }
            } else {
                const conditionUpdate = {
                    med_error_depcode: med_error_depcode
                }
                const updateDepart = await mederror.updateData(tableName, formSaveData, conditionUpdate);
                return { statusCode: StatusCodes.OK, departList: [updateDepart], section: "update", type_alert: "warning" };
            }

        }

    } catch (error) {
        if (error instanceof Error) {

            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// DELETE/delete-dept
MedErrorRoute.delete('/delete-dept', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: DepartmentDelete
}) => {
    try {
        const headers = request.headers
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
        const DeleteDepartment = query as DepartmentDelete;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_dept";
            if (DeleteDepartment.med_error_depcode && DeleteDepartment.med_error_depcode !== 0) {
                const checkDeleteDepartment = await mederror.deleteData(tableName, DeleteDepartment);
                if (checkDeleteDepartment > 0) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, deleteDepart: checkDeleteDepartment, section: "delete", type_alert: "success" };
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/get-analysis
MedErrorRoute.get('/get-analysis', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: AnalysisQuery
}) => {
    try {
        const headers = request.headers
        const token = readAuthTokenFromHeaders(headers)
        const clientId = headers.get("client-id")
        // const originAllow = headers.get("origin")
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
        const { is_active } = query as AnalysisQuery
        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const GetAnalysisData: AnalysisData[] = (await mederror.getAnalysis(is_active)) || []
            if (GetAnalysisData && !_.isEmpty(GetAnalysisData)) {
                set.status = StatusCodes.OK;
                return { statusCode: StatusCodes.OK, analysisList: GetAnalysisData };
            } else {
                set.status = StatusCodes.NOT_FOUND;
                return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, analysisList: [] };
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// POST/create-analysis
MedErrorRoute.post('/create-analysis', async ({
    jwt,
    set,
    request,
    body
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    body: AnalysisData
}) => {
    try {
        const headers = request.headers
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
        const analysisForm = body as AnalysisData;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_analysis";
            const {
                error_analysis_id,
                error_analysis_name,
                is_active,
            } = analysisForm

            const formSaveData = {
                error_analysis_name: error_analysis_name,
                is_active: is_active,
            }

            if (!error_analysis_id) {
                const savedAnalysis = await mederror.saveData(tableName, formSaveData)
                if (!_.isEmpty(savedAnalysis) && savedAnalysis) {
                    set.status = StatusCodes.CREATED;
                    return { statusCode: StatusCodes.CREATED, analysisList: savedAnalysis, section: "create", type_alert: "success" };
                }
            } else {
                const conditionUpdate = {
                    error_analysis_id: error_analysis_id
                }
                const updateAnalysis = await mederror.updateData(tableName, formSaveData, conditionUpdate);
                return { statusCode: StatusCodes.OK, analysisList: [updateAnalysis], section: "update", type_alert: "warning" };
            }

        }

    } catch (error) {
        if (error instanceof Error) {

            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// DELELTE/delete-analysis
MedErrorRoute.delete('/delete-analysis', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: AnalysisDelete
}) => {
    try {
        const headers = request.headers
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
        const AnalysisDelete = query as AnalysisDelete;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.UNAUTHORIZED;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            const tableName = "med_error_analysis";
            if (AnalysisDelete.error_analysis_id && AnalysisDelete.error_analysis_id !== 0) {
                const checkDeleteAnalysis = await mederror.deleteData(tableName, AnalysisDelete);
                if (checkDeleteAnalysis > 0) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, deleteAnalysis: checkDeleteAnalysis, section: "delete", type_alert: "success" };
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/med-error
MedErrorRoute.get('/med-error', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: MedErrerQuery
}) => {
    try {
        const headers = request.headers
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
        const { error_user, error_id, dateStart, dateEnd } = query as MedErrerQuery;
        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
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
            // 1) ถ้ามี error_id -> ดึงรายตัว
            if ((!error_user || error_user === '') && error_id !== undefined && error_id !== '') {
                const GetMedErrorData: MedErrorDataList[] =
                    (await mederror.getMedErrorById(Number(error_id))) || [];

                set.status = StatusCodes.OK;
                return {
                    statusCode: StatusCodes.OK,
                    medErrorList: GetMedErrorData
                };
            }

            // 2) กรณี list ทั้งหมด / ตาม user / ตามวันที่
            const safeErrorUser = error_user || '';

            const safeDateStart =
                dateStart && dateStart.trim() !== '' ? dateStart : undefined;
            const safeDateEnd =
                dateEnd && dateEnd.trim() !== '' ? dateEnd : undefined;

            const GetMedErrorData: MedErrorDataList[] =
                (await mederror.getMedErrorAll(safeErrorUser, safeDateStart, safeDateEnd)) || [];

            // ไม่ว่ามี/ไม่มีข้อมูล ให้ตอบ 200 เสมอ แล้วให้ frontend เช็คว่า array ว่างไหม
            set.status = StatusCodes.OK;
            return {
                statusCode: StatusCodes.OK,
                medErrorList: GetMedErrorData
            };
        }
    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// POST/med-error
MedErrorRoute.post('/med-error', async ({
    jwt,
    set,
    request,
    body
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    body: MedErrorCreate
}) => {
    try {
        const headers = request.headers
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
        const MedErrorForm = body as MedErrorCreate;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
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
            const tableName = "med_error";
            const WhiteListAlert = ['D', 'E', 'F', 'G', 'H', 'I'];
            const currentDate = new Date().toString();
            const message = [
                'Medication Error',
                '',
                `🚨ระดับความรุนแรง: ${MedErrorForm.error_level}`,
                `📝เหตุการณ์ที่พบ: ${MedErrorForm.error_event}`,
                `🕧วันที่เกิดเหตุ: ${formatDateTime(MedErrorForm.error_date, 7)}, ${MedErrorForm.error_time}`,
                `⚠️ความคลาดเคลื่อน: ${MedErrorForm.error_alert}`,
                `👩‍⚕️ผู้บันทึก: ${MedErrorForm.error_user_name}`,
                `🏥สถานที่เกิดเหตุ/พบเหตุ: ${MedErrorForm.error_ward_name}`,
                `🕧วันที่บันทึก: ${formatDateTime(currentDate, 1)}`,
            ].join('\n');
            const formatMessageLine = {
                type: 'text',
                text: message
            }
            if (MedErrorForm.error_id === 0) {
                popKeys(MedErrorForm, ['error_analysis_id'])
                MedErrorForm.error_datetime = DBSec.raw('CURRENT_TIMESTAMP') as unknown as Date;
                if (MedErrorForm.error_section !== 0 && MedErrorForm.error_user !== "") {
                    const savedMedError = await mederror.saveData(tableName, MedErrorForm)
                    if (!_.isEmpty(savedMedError) && savedMedError) {
                        if (WhiteListAlert.includes(MedErrorForm.error_level.trim())) {
                            reply(formatMessageLine)
                        }
                        set.status = StatusCodes.OK;
                        return { statusCode: StatusCodes.CREATED, medErrorList: savedMedError, section: "create", type_alert: "success" };
                    }
                } else {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.BAD_REQUEST, medErrorList: [], section: "create", type_alert: "error" };
                }
            } else {
                const conditionUpdate = {
                    error_id: MedErrorForm.error_id
                }

                const error_level_old = MedErrorForm?.error_level_old
                popKeys(MedErrorForm, ['error_analysis_id'])
                popKeys(MedErrorForm, ['error_level_old'])
                popKeys(MedErrorForm, ['error_datetime'])
                // popKeys(MedErrorForm, ['error_transcribing'])
                // popKeys(MedErrorForm, ['error_transcribing_ward_code'])
                // popKeys(MedErrorForm, ['error_transcribing_ward'])
                popKeys(MedErrorForm, ['rca_text'])
                popKeys(MedErrorForm, ['updated_rca'])
                popKeys(MedErrorForm, ['is_rca'])

                // console.log("POST /med-error >> Update >> ", MedErrorForm);
                if (error_level_old !== MedErrorForm.error_level.trim()) {
                    const updateMedError = await mederror.updateData(tableName, MedErrorForm, conditionUpdate);
                    if (updateMedError > 0) {
                        if (WhiteListAlert.includes(MedErrorForm.error_level.trim())) {
                            // await lineClient.pushMessage("U0ce66a9d268b3f1d81d04b30631acc87", {
                            //     type: 'text',
                            //     text: message,
                            // });
                            reply(formatMessageLine)
                        }
                        set.status = StatusCodes.OK;
                        return { statusCode: StatusCodes.OK, medErrorList: [updateMedError], section: "update", type_alert: "warning" };
                    }
                } else {
                    const updateMedError = await mederror.updateData(tableName, MedErrorForm, conditionUpdate);
                    if (updateMedError > 0) {
                        set.status = StatusCodes.OK;
                        return { statusCode: StatusCodes.OK, medErrorList: [updateMedError], section: "update", type_alert: "warning" };
                    }
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// DELETE/med-error
MedErrorRoute.delete('/med-error', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: MedErrorDelete
}) => {
    try {
        const headers = request.headers
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
        const MedErrorDelete = query as MedErrorDelete;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
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
            const tableName = "med_error";
            if (MedErrorDelete.error_id !== 0) {
                const GetMedErrorData: MedErrorDataList[] = (await mederror.getMedErrorById(MedErrorDelete.error_id)) || []
                if (GetMedErrorData && !_.isEmpty(GetMedErrorData)) {
                    const { error_id } = GetMedErrorData[0]
                    const conditions_delete = {
                        error_id: error_id
                    }
                    const checkDeleteMedError = await mederror.deleteData(tableName, conditions_delete);
                    if (checkDeleteMedError > 0) {
                        set.status = StatusCodes.OK;
                        return { statusCode: StatusCodes.OK, deleteMedError: checkDeleteMedError, section: "delete", type_alert: "success" };
                    }
                }

            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// PUT/med-error
MedErrorRoute.put('/med-error', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: MedErrorUpdateRCA
}) => {
    try {
        const headers = request.headers
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
        const MedErrorUpdateRCA = query;

        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
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
            const tableName = "med_error";
            if (MedErrorUpdateRCA.error_id !== 0) {
                const DataUpdate = {
                    update: {
                        is_rca: MedErrorUpdateRCA.is_rca,
                        rca_text: MedErrorUpdateRCA.rca_text,
                        rca_by: MedErrorUpdateRCA.rca_by,
                        updated_rca: DBSec.raw('CURRENT_TIMESTAMP') as unknown as Date
                    },
                    conditions: {
                        error_id: MedErrorUpdateRCA.error_id
                    }
                }
                const UpdateData = await mederror.updateData(tableName, DataUpdate.update, DataUpdate.conditions)
                if (UpdateData > 0) {
                    const GetMedErrorData: any = (await mederror.getMedErrorById(MedErrorUpdateRCA.error_id))
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, medErrorList: UpdateData, section: "update", type_alert: "warning", medErrorData: GetMedErrorData };
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

// GET/get-patient-info
MedErrorRoute.get('/get-patient-info', async ({
    jwt,
    set,
    request,
    query
}: {
    jwt: { verify: (token: string) => Promise<string> };
    set: { status: number };
    request: Request,
    query: PatientInfoQuery
}) => {
    try {
        const headers = request.headers
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
        const { hn } = query as PatientInfoQuery
        if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if (!token) {
            set.status = StatusCodes.BAD_REQUEST;
            return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Request missing Authorization Data❌` };
        }

        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.UNAUTHORIZED, statusMessage: `Identity verification failed❌` };
        } else {
            if (hn !== undefined && hn !== "") {
                const dataHN = hn.trim()
                const GetPatientInfo = await hos.getPatientInfo(dataHN)
                if (GetPatientInfo && !_.isEmpty(GetPatientInfo)) {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.OK, patientInfoList: GetPatientInfo[0] };
                } else {
                    set.status = StatusCodes.OK;
                    return { statusCode: StatusCodes.NOT_FOUND, statusMessage: `Not found [${StatusCodes.NOT_FOUND}]`, patientInfoList: [] };
                }
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
        }
    }
});

function formatDateTimeTH(date: Date | string): string {
    const m = moment(date);
    if (!m.isValid()) {
        throw new Error('Invalid date');
    }

    return m.format('D/M/YYYY');
}

function popKeys(obj: Record<string, any>, keys: Array<string>) {
    const removed: { [key: string]: any } = {};

    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            removed[key] = obj[key];
            delete obj[key];
        }
    });

    return removed;
}

export default MedErrorRoute;



