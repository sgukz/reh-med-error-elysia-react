import { Knex } from "knex";

export type DbStatus =
    | { ok: true; latencyMs: number; dbName?: string }
    | { ok: false; error: string; dbName?: string };

/** ดึงชื่อ Database จาก config ของ Knex (รองรับทั้ง object และ connection string) */
export function getDbName(db: Knex): string | undefined {
    const cfg = (db.client.config as any)?.connection;
    try {
        if (!cfg) return undefined;

        if (typeof cfg === "string") {
            // รองรับ mysql:// และ mysql2://
            const u = new URL(cfg);
            const nameFromPath = u.pathname.replace(/^\//, "") || undefined;
            // บางไลบรารีอาจใส่เป็น ?database=name
            const nameFromQuery = u.searchParams.get("database") || u.searchParams.get("db");
            return nameFromPath || nameFromQuery || undefined;
        }
        if (typeof cfg === "object") {
            return cfg.database ?? undefined;
        }
    } catch {
        /* ignore */
    }
    return undefined;
}

export async function checkDb(db: Knex, timeoutMs = 3000): Promise<DbStatus> {
    const dbName = getDbName(db);
    const client = ((db.client as any)?.config?.client ?? "mysql2") as string;

    // เลือกคำสั่ง ping ตาม dialect
    const pingSql =
        client === "oracledb" ? "SELECT 1 FROM DUAL" : "SELECT 1";

    const start = Date.now();
    const ping = db.raw(pingSql);
    const timeout = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("PING_TIMEOUT")), timeoutMs)
    );

    try {
        await Promise.race([ping, timeout]);
        return { ok: true, latencyMs: Date.now() - start, dbName };
    } catch (e: any) {
        const code = e?.code || e?.errno || e?.message || "UNKNOWN_ERROR";

        // แปลง error code ให้เข้าใจง่าย (ครอบคลุม MySQL ที่พบบ่อย)
        const msg =
            code === "ETIMEDOUT" ? "Connection timed out" :
                code === "ECONNREFUSED" ? "Connection refused" :
                    code === "EHOSTUNREACH" ? "Host unreachable" :
                        code === "ENOTFOUND" ? "Host not found (DNS)" :
                            code === "PROTOCOL_CONNECTION_LOST" ? "Protocol connection lost" :
                                code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR" ? "Fatal protocol error (prior failure)" :
                                    code === "ER_ACCESS_DENIED_ERROR" ? "Invalid MySQL credentials" :
                                        code === "ER_BAD_DB_ERROR" ? "Database does not exist" :
                                            code === "ER_CON_COUNT_ERROR" ? "Too many connections" :
                                                code === "PING_TIMEOUT" ? `No response within ${timeoutMs}ms` :
                                                    String(code);

        return { ok: false, error: msg, dbName };
    }
}
