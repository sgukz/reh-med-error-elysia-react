import { DBSec } from '../src/plugins/db';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../migrations/2026-05-21_create_likelihood_criteria_table.sql'), 'utf-8');
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const stmt of statements) {
            console.log(`[run] Executing statement...`);
            await DBSec.raw(stmt);
        }
        
        console.log(`[ok] Migration 2026-05-21_create_likelihood_criteria_table applied successfully`);

        const verify = await DBSec.raw(`SELECT COUNT(*) as count FROM med_error_likelihood_criteria`);
        console.log(`[verify] rows in med_error_likelihood_criteria:`, Array.isArray(verify) ? verify[0] : verify);

        await DBSec.destroy();
        process.exit(0);
    } catch (err) {
        console.error('[error]', err);
        await DBSec.destroy();
        process.exit(1);
    }
}

main();
