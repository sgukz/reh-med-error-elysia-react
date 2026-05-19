// เพิ่ม indexes สำหรับ Report performance — idempotent (เช็คก่อนเพิ่ม)
// รัน: bun run scripts/run-report-indexes-migration.ts

import { DBSec } from '../src/plugins/db';

type Job = {
    table: string;
    indexName: string;
    columns: string[]; // สำหรับ ALTER TABLE statement
};

const JOBS: Job[] = [
    { table: 'med_error', indexName: 'idx_error_date', columns: ['error_date'] },
    { table: 'med_error', indexName: 'idx_error_type_date', columns: ['error_type', 'error_date'] },
    { table: 'med_error', indexName: 'idx_error_ward', columns: ['error_ward'] },
    { table: 'med_error_type_list', indexName: 'idx_etl_type_active', columns: ['error_type', 'is_active'] },
];

async function indexExists(table: string, indexName: string): Promise<boolean> {
    const res = await DBSec.raw(
        `SELECT 1 AS exist FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
         LIMIT 1`,
        [table, indexName]
    );
    const rows = Array.isArray(res) ? res[0] : res;
    return Array.isArray(rows) && rows.length > 0;
}

async function main() {
    try {
        for (const job of JOBS) {
            const exists = await indexExists(job.table, job.indexName);
            if (exists) {
                console.log(`[skip] ${job.table}.${job.indexName} มีอยู่แล้ว`);
                continue;
            }
            const cols = job.columns.map((c) => `\`${c}\``).join(', ');
            const sql = `ALTER TABLE \`${job.table}\` ADD INDEX \`${job.indexName}\` (${cols})`;
            console.log(`[run] ${sql}`);
            const t0 = Date.now();
            await DBSec.raw(sql);
            console.log(`[ok]  ${job.indexName} สร้างใน ${Date.now() - t0}ms`);
        }

        console.log('\n[verify] indexes ปัจจุบัน:');
        for (const tbl of ['med_error', 'med_error_type_list']) {
            const idx = await DBSec.raw(
                `SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols, NON_UNIQUE
                 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                 GROUP BY INDEX_NAME, NON_UNIQUE`,
                [tbl]
            );
            const rows = Array.isArray(idx) ? idx[0] : idx;
            console.log(`\n${tbl}:`);
            console.table(rows);
        }

        await DBSec.destroy();
        process.exit(0);
    } catch (err) {
        console.error('[error]', err);
        await DBSec.destroy();
        process.exit(1);
    }
}

main();
