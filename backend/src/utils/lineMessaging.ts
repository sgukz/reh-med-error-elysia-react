// src/utils/lineMessaging.ts

export type LineTextMessage = {
  type: 'text';
  text: string;
};

export type LineMessage = LineTextMessage; // ถ้าจะเพิ่ม type อื่นค่อย union เพิ่มทีหลัง

export interface LineMessagingConfig {
  /** Channel access token ของ LINE OA (Messaging API) */
  channelAccessToken: string;
  /** base URL ของ Messaging API (เปลี่ยนได้ ถ้า LINE เปลี่ยนเวอร์ชัน) */
  baseUrl?: string;
}

export interface LineApiResponse {
  message?: string;
  [key: string]: unknown;
}

export class LineMessagingClient {
  private channelAccessToken: string;
  private baseUrl: string;

  constructor(config: LineMessagingConfig) {
    if (!config.channelAccessToken) {
      throw new Error('LINE channelAccessToken is required');
    }

    this.channelAccessToken = config.channelAccessToken;
    this.baseUrl = config.baseUrl ?? 'https://api.line.me/v2/bot';
  }

  private async post(
    path: string,
    body: unknown
  ): Promise<Response> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as LineApiResponse;
      const errMsg = data.message ?? res.statusText;
      throw new Error(
        `LINE API error ${res.status}: ${errMsg}`
      );
    }

    return res;
  }

  /**
   * ส่งข้อความแบบ push ไปยัง userId / groupId / roomId
   * docs: https://developers.line.biz/en/reference/messaging-api/#send-push-message
   */
  async pushMessage(
    to: string,
    messages: LineMessage | LineMessage[]
  ): Promise<void> {
    const arrayMessages = Array.isArray(messages) ? messages : [messages];

    await this.post('/message/push', {
      to,
      messages: arrayMessages,
    });
  }

  /**
   * ส่งข้อความแบบ reply โดยใช้ replyToken จาก webhook
   * docs: https://developers.line.biz/en/reference/messaging-api/#send-reply-message
   */
  async replyMessage(
    replyToken: string,
    messages: LineMessage | LineMessage[]
  ): Promise<void> {
    const arrayMessages = Array.isArray(messages) ? messages : [messages];

    await this.post('/message/reply', {
      replyToken,
      messages: arrayMessages,
    });
  }

  /**
   * ส่งข้อความแบบ multicast (ส่งให้ userIds หลายคน)
   * docs: https://developers.line.biz/en/reference/messaging-api/#send-multicast-message
   */
  async multicast(
    to: string[],
    messages: LineMessage | LineMessage[]
  ): Promise<void> {
    const arrayMessages = Array.isArray(messages) ? messages : [messages];

    await this.post('/message/multicast', {
      to,
      messages: arrayMessages,
    });
  }
}

/**
 * helper สั้น ๆ: ส่ง text แบบ push ไม่ต้องสร้าง client เอง
 */
export async function pushTextMessage(
  channelAccessToken: string,
  to: string,
  text: string
): Promise<void> {
  const client = new LineMessagingClient({ channelAccessToken });
  await client.pushMessage(to, { type: 'text', text });
}

/**
 * helper สั้น ๆ: ส่ง text แบบ reply
 */
export async function replyTextMessage(
  channelAccessToken: string,
  replyToken: string,
  text: string
): Promise<void> {
  const client = new LineMessagingClient({ channelAccessToken });
  await client.replyMessage(replyToken, { type: 'text', text });
}
