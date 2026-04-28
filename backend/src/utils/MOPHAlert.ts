import * as dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';
dotenv.config();
// ปรับตามรูปแบบ message ที่คุณใช้จริง
export interface LineMessage {
    // อย่างน้อย type/text ถ้าเป็นข้อความธรรมดา
    type: string;
    [key: string]: any;
}

export interface MophNotifyResponse {
    status: number | string;
    message: string;
    [key: string]: any;
}

const ClientID = process.env.MOPH_APT_URL ?? ""
const SecretID = process.env.MOPH_CLIENT_ID ?? ""

/**
 * ส่งข้อความไปยัง MOPH Notify / LINE OA proxy
 */
export async function sendReplyLineMessaging(
    formatMessage: any
): Promise<any> {
    const headers = {
        'Content-Type': 'application/json',
        'client-key': ClientID,
        'secret-key': SecretID,
    };

    const BASE_URL = `https://morpromt2f.moph.go.th/api/notify/send`;

    const payload = {
        messages: [formatMessage],
    };

    try {
        const response = await axios.post(BASE_URL, payload, { headers });

        const { status, message } = response.data;
        console.log(`Status[${status}]`, `Message >> ${message}`);

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // log ให้เห็นรายละเอียดก่อน
            console.error('sendReplyLineMessaging Axios error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        } else {
            console.error('sendReplyLineMessaging unknown error:', error);
            throw new Error('An unexpected error occurred while sending LINE message');
        }
    }
}

