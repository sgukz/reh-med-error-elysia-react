// ตรวจ index + ขนาดตารางที่ใช้ในรายงาน เพื่อชี้จุดที่ควรเพิ่ม index
import { DBSec } from '../src/plugins/db';

const TABLES = ['med_error', 'med_error_dept', 'med_error_type_list', 'med_error_type', 'med_error_stat_volume'];

async function main() {
    try {
        for (const tbl of TABLES) {
            // ขนาด + จำนวนแถว
            const stats = await DBSec.raw(
                `SELECT TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
                 FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
                [tbl]
            );
            const statsRow = Array.isArray(stats) ? stats[0]?.[0] : null;
            console.log(`\n=== ${tbl} ===`);
            if (statsRow) {
                console.log(`rows≈${statsRow.TABLE_ROWS}  data=${(statsRow.DATA_LENGTH / 1024 / 1024).toFixed(1)}MB  index=${(statsRow.INDEX_LENGTH / 1024 / 1024).toFixed(1)}MB`);
            }

            // Index ปัจจุบัน
            const idx = await DBSec.raw(
                `SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX, NON_UNIQUE
                 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                 ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
                [tbl]
            );
            const idxRows = Array.isArray(idx) ? idx[0] : idx;
            console.table(idxRows);
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
