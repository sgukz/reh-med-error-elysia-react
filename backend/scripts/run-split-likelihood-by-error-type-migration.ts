import { DBSec } from '../src/plugins/db';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, '../migrations/2026-05-22_split_likelihood_criteria_by_error_type.sql'),
            'utf-8'
        );

        // ตัดบรรทัด comment (--) ออกก่อน split ด้วย ; กัน statement ที่เป็น comment ล้วน
        const statements = sql
            .split('\n')
            .filter((line) => !line.trim().startsWith('--'))
            .join('\n')
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        for (const stmt of statements) {
            console.log(`[run] Executing statement...`);
            await DBSec.raw(stmt);
        }

        console.log(`[ok] Migration 2026-05-22_split_likelihood_criteria_by_error_type applied successfully`);

        // ตรวจผลลัพธ์ — ควรได้ 6 ประเภท × 6 ระดับ = 36 แถว
        const verify = await DBSec.raw(
            `SELECT error_type, COUNT(*) as cnt FROM med_error_likelihood_criteria GROUP BY error_type ORDER BY error_type`
        );
        console.log(`[verify] rows per error_type:`, Array.isArray(verify) ? verify[0] : verify);

        await DBSec.destroy();
        process.exit(0);
    } catch (err) {
        console.error('[error]', err);
        await DBSec.destroy();
        process.exit(1);
    }
}

main();
