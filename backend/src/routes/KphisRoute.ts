import { Elysia } from "elysia";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import moment from "moment";
//Config options
import config from "../configs/config";
import { DBMain, DBKphis } from '../plugins/db'

//Model
import KphisModel from "../models/KphisModel";
import KphisMentalModel from "../models/KphisMentalModel";

//Interface
import { MentalFormCreate, MentalFormCreateSchema } from '../Interfaces/KphisInterface'

import _ from "lodash";
import 'moment/locale/th'; // นำเข้า locale ภาษาไทย

// ตั้ง locale เป็นไทย
moment.locale('th');

const { allowed, origin } = config;
const ALLOWED_CLIENTS = new Set((allowed || "").split(",").map(c => c.trim()));
const ALLOWED_ORIGINS = new Set((origin || "").split(",").map(o => o.trim()));

const kphis = new KphisModel(DBMain)
const mental = new KphisMentalModel(DBKphis)

const KphisRoute = new Elysia({ prefix: `/kphis` });

KphisRoute.get('/clinical-summary', async ({
    set,
    request,
    query
}: {
    set: { status: number };
    request: Request
    query: { an: string }
}) => {
    try {
        const headers = request.headers
        const { an } = query
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
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.FORBIDDEN;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if ((originAllow && ALLOWED_ORIGINS.has(originAllow || "")) && (clientId || ALLOWED_CLIENTS.has(clientId))) {
            const GetClinicalSummary: any = await kphis.getClinicalSummary(an)
            if (!_.isEmpty(GetClinicalSummary)) {
                const patientList = GetClinicalSummary[0]
                patientList.underlying = normalizeUnderlying(patientList.underlying);
                const GetTreatments: any = await kphis.getTreatments(an)
                const GetHomeMed: any = await kphis.getHomeMed(an)
                set.status = StatusCodes.OK
                return { statusCode: StatusCodes.OK, patientList: patientList, treatmentList: GetTreatments[0], homemedList: GetHomeMed[0] }
            }

            // // ### Debug
            // const GetClinicalSummary: any = await kphis.getClinicalSummary(an)
            // set.status = StatusCodes.OK
            // return { statusCode: StatusCodes.OK, patientList: GetClinicalSummary}
        }
    } catch (error) {
        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});

//Get doctor data from his
KphisRoute.get('/refer', async ({
    set,
    request,
    query
}: {
    set: { status: number };
    request: Request
    query: { an: string }
}) => {
    try {
        const headers = request.headers
        const { an } = query
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

        if ((originAllow && ALLOWED_ORIGINS.has(originAllow || "")) && (clientId || ALLOWED_CLIENTS.has(clientId))) {
            const GetClinicalSummary: any = await kphis.getClinicalSummaryRefer(an)
            if (!_.isEmpty(GetClinicalSummary)) {
                const GetTreatments: any = await kphis.getTreatments(an)
                const GetHomeMed: any = await kphis.getHomeMed(an)
                set.status = StatusCodes.OK
                return { statusCode: StatusCodes.OK, patientList: GetClinicalSummary, treatmentList: GetTreatments[0], homemedList: GetHomeMed[0] }
            }

            //### Debug
            // const GetClinicalSummary: any = await kphis.getClinicalSummary(an)
            // set.status = StatusCodes.OK
            // return { statusCode: StatusCodes.OK, patientList: GetClinicalSummary}
        }
    } catch (error) {

        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});

KphisRoute.post('/mental', async ({
    set,
    request,
    body
}: {
    set: { status: number };
    request: Request
    body: MentalFormCreate
}) => {
    try {
        const headers = request.headers
        const {
            an,
            patient_name,
            create_date,
            generalAppearance,
            speech,
            moodAffect,
            thought,
            perception,
            delusion,
            orientation,
            memory,
            concentration,
            intelligence,
            abstractReasoning,
            judgment,
            insight
        } = body

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

        if ((originAllow && ALLOWED_ORIGINS.has(originAllow || "")) && (clientId || ALLOWED_CLIENTS.has(clientId))) {
            const checkDataMental: any = await mental.checkData("kphis.form_mental", { an })
            if (!_.isEmpty(checkDataMental)) {
                const formMentalUpdate = {
                    patient_name,
                    create_date,
                    generalAppearance,
                    speech,
                    moodAffect,
                    thought,
                    perception,
                    delusion,
                    orientation,
                    memory,
                    concentration,
                    intelligence,
                    abstractReasoning,
                    judgment,
                    insight
                }
                const conditions = {
                    an
                }
                const UpdateMental = await mental.updateData("kphis.form_mental", formMentalUpdate, conditions)
                const GetPatient: any = await mental.getPatient(an)
                set.status = StatusCodes.OK
                return { statusCode: StatusCodes.OK, mentalList: GetPatient, UpdateMental }
            } else {
                // Create Section
                const formMental = {
                    an,
                    patient_name,
                    create_date,
                    generalAppearance,
                    speech,
                    moodAffect,
                    thought,
                    perception,
                    delusion,
                    orientation,
                    memory,
                    concentration,
                    intelligence,
                    abstractReasoning,
                    judgment,
                    insight,
                    created_date: DBMain.raw('CURRENT_TIMESTAMP') as unknown as Date
                }

                const CreateMental = await mental.saveData("kphis.form_mental", formMental)
                if (!_.isEmpty(CreateMental)) {
                    const GetPatient: any = await mental.getPatient(an)
                    set.status = StatusCodes.OK
                    return { statusCode: StatusCodes.OK, mentalList: GetPatient }
                } else {
                    set.status = StatusCodes.OK
                    return { statusCode: StatusCodes.BAD_REQUEST, statusMessage: `Mental - ${getReasonPhrase(StatusCodes.BAD_REQUEST)}` }
                }
            }
        }
    } catch (error) {

        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});
KphisRoute.get('/patient', async ({
    set,
    request,
    query
}: {
    set: { status: number };
    request: Request
    query: { an: string }
}) => {
    try {
        const headers = request.headers
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
        const { an } = query

        if (!originAllow && !ALLOWED_ORIGINS.has(originAllow || "")) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow origin [${StatusCodes.FORBIDDEN}]` };
        }

        if (!clientId || !ALLOWED_CLIENTS.has(clientId)) {
            set.status = StatusCodes.OK;
            return { statusCode: StatusCodes.FORBIDDEN, statusMessage: `Not allow client [${StatusCodes.FORBIDDEN}]` };
        }

        if ((originAllow && ALLOWED_ORIGINS.has(originAllow || "")) && (clientId || ALLOWED_CLIENTS.has(clientId))) {
            const checkDataMental: any = await mental.getPatient(an)
            if (!_.isEmpty(checkDataMental)) {
                set.status = StatusCodes.OK
                return { statusCode: StatusCodes.OK, patientData: checkDataMental }
            } else {
                set.status = StatusCodes.OK
                return { statusCode: StatusCodes.NOT_FOUND, patientData: [] }
            }
        }
    } catch (error) {

        if (error instanceof Error) {
            set.status = StatusCodes.INTERNAL_SERVER_ERROR;
            return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), message: error.message };
        }
    }
});


function normalizeUnderlying(input: string | null | undefined): string {
    if (!input) return "";
    return input
        // แทนที่กลุ่มของ ? (อย่างน้อย 1 ตัว) พร้อมช่องว่างรอบๆ เป็น " | "
        .replace(/\s*\?+\s*/g, " | ")
        // ตัดช่องว่างซ้ำซ้อน
        .replace(/\s{2,}/g, " ")
        // ตัด | ที่ต้น/ท้ายถ้ามี และ trim ปิดท้าย
        .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
        .trim();
}


export default KphisRoute

