// Migration runner — สร้างตาราง med_error_stat_volume
// รันด้วย: bun run scripts/run-stat-volume-migration.ts
// idempotent: ถ้าตารางมีอยู่แล้วจะข้ามไป (CREATE TABLE IF NOT EXISTS)

import { DBSec } from '../src/plugins/db';

const TABLE = 'med_error_stat_volume';

async function main() {
    try {
        // เช็คก่อนว่ามี table อยู่แล้วหรือยัง
        const existing = await DBSec.raw(
            `SELECT TABLE_NAME, TABLE_COMMENT
             FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [TABLE]
        );
        const rows = Array.isArray(existing) ? existing[0] : existing;

        if (Array.isArray(rows) && rows.length > 0) {
            console.log(`[skip] ตาราง ${TABLE} มีอยู่แล้ว:`, rows[0]);
        } else {
            console.log(`[run] CREATE TABLE ${TABLE} ...`);
            await DBSec.raw(
                `CREATE TABLE IF NOT EXISTS ${TABLE} (
                    stat_id           INT AUTO_INCREMENT PRIMARY KEY,
                    stat_year         INT NOT NULL              COMMENT 'ปี ค.ศ.',
                    stat_month        INT NOT NULL              COMMENT 'เดือน 1-12',
                    ipd_patient_days  DECIMAL(12,2) DEFAULT 0   COMMENT 'จำนวนวันนอน IPD',
                    opd_prescriptions DECIMAL(12,2) DEFAULT 0   COMMENT 'จำนวนใบสั่งยา OPD',
                    updated_by        VARCHAR(100) DEFAULT NULL COMMENT 'ผู้อัปเดต (loginname)',
                    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_year_month (stat_year, stat_month)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ข้อมูลปริมาณ IPD/OPD รายเดือนสำหรับ ReportSummary10'`
            );
            console.log(`[ok] สร้างตาราง ${TABLE} สำเร็จ`);
        }

        const verify = await DBSec.raw(
            `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
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
