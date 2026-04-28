// notifyTelegram.ts
import axios from "axios";
import { z } from "zod";

// สร้าง schema พร้อม parse_mode แบบ optional
const NotifyTelegramSchema = z.object({
    token: z.string().min(1, "Telegram Bot Token is required"),
    chatId: z.union([z.string(), z.number()]),
    message: z.string().min(1, "Message cannot be empty"),
});

type NotifyTelegramParams = z.infer<typeof NotifyTelegramSchema>;

/**
 * ส่งข้อความไปยัง Telegram Bot
 * @param params - token, chatId, message, [parse_mode]
 * @returns Promise<boolean>
 */
export async function notifyTelegram(params: NotifyTelegramParams): Promise<boolean> {
    // ตรวจสอบข้อมูลก่อนส่ง
    const parsed = NotifyTelegramSchema.safeParse(params);
    if (!parsed.success) {
        console.error("Invalid input:", parsed.error.format());
        return false;
    }

    const { token, chatId, message } = parsed.data;

    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                chat_id: chatId,
                text: message,
                parse_mode: "MarkdownV2",
            }
        );

        return response.data.ok === true;
    } catch (error) {
        console.log(error);
        
        if (error instanceof Error) {
            console.error("Telegram API Error::", error.message);
        }
        return false;
    }
}
