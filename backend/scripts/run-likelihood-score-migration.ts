// Migration runner — เพิ่ม column likelihood_score ใน med_error_type_list
// รันด้วย: bun run scripts/run-likelihood-score-migration.ts
// idempotent: ถ้า column มีอยู่แล้วจะข้ามไป

import { DBSec } from '../src/plugins/db';

const TABLE = 'med_error_type_list';
const COLUMN = 'likelihood_score';

async function main() {
    try {
        const existing = await DBSec.raw(
            `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?`,
            [TABLE, COLUMN]
        );

        const rows = Array.isArray(existing) ? existing[0] : existing;

        if (Array.isArray(rows) && rows.length > 0) {
            console.log(`[skip] ${TABLE}.${COLUMN} มีอยู่แล้ว:`, rows[0]);
        } else {
            console.log(`[run] ALTER TABLE ${TABLE} ADD COLUMN ${COLUMN} TINYINT NULL ...`);
            await DBSec.raw(
                `ALTER TABLE ${TABLE}
                 ADD COLUMN ${COLUMN} TINYINT NULL
                 COMMENT 'คะแนน Likelihood 1-5; ใช้คู่กับ impact_score คำนวณ Level = Impact + Likelihood'`
            );
            console.log(`[ok] เพิ่ม ${TABLE}.${COLUMN} สำเร็จ`);
        }

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
