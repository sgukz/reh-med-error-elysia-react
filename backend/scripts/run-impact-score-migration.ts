// Migration runner — เพิ่ม column impact_score ใน med_error_type_list
// รันด้วย: bun run scripts/run-impact-score-migration.ts
// idempotent: ถ้า column มีอยู่แล้วจะข้ามไป

import { DBSec } from '../src/plugins/db';

const TABLE = 'med_error_type_list';
const COLUMN = 'impact_score';

async function main() {
    try {
        // เช็คก่อนว่า column มีอยู่แล้วหรือยัง (idempotent)
        const existing = await DBSec.raw(
            `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?`,
            [TABLE, COLUMN]
        );

        // mysql2 raw returns [rows, fields]
        const rows = Array.isArray(existing) ? existing[0] : existing;

        if (Array.isArray(rows) && rows.length > 0) {
            console.log(`[skip] ${TABLE}.${COLUMN} มีอยู่แล้ว:`, rows[0]);
        } else {
            console.log(`[run] ALTER TABLE ${TABLE} ADD COLUMN ${COLUMN} TINYINT NULL ...`);
            await DBSec.raw(
                `ALTER TABLE ${TABLE}
                 ADD COLUMN ${COLUMN} TINYINT NULL
                 COMMENT 'คะแนน Impact 1-5; ใช้คำนวณ risk = impact + likelihood'`
            );
            console.log(`[ok] เพิ่ม ${TABLE}.${COLUMN} สำเร็จ`);
        }

        // ยืนยันสภาพ schema หลัง migrate
        const verify = await DBSec.raw(
            `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [TABLE]
        );
        const verifyRows = Array.isArray(verify) ? verify[0] : verify;
        console.log(`\n[verify] schema ${TABLE}:`);
        console.table(verifyRows);

        await DBSec.destroy();
        process.exit(0);
    } catch (err) {
        console.error('[error]', err);
        await DBSec.destroy();
        process.exit(1);
    }
}

main();
