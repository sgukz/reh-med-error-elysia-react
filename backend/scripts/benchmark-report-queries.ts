// Benchmark + EXPLAIN ของ query รายงานหลัก หลังเพิ่ม indexes
import { DBSec } from '../src/plugins/db';

async function explainAndTime(label: string, fn: () => Promise<any>, explainSql?: { sql: string; bindings: any[] }) {
    if (explainSql) {
        const expl = await DBSec.raw(`EXPLAIN ${explainSql.sql}`, explainSql.bindings);
        const rows = Array.isArray(expl) ? expl[0] : expl;
        console.log(`\n=== EXPLAIN: ${label} ===`);
        console.table(rows);
    }
    const t0 = Date.now();
    const result = await fn();
    const ms = Date.now() - t0;
    const count = Array.isArray(result) ? result.length : 'n/a';
    console.log(`[time] ${label}: ${ms}ms  (rows: ${count})`);
}

async function main() {
    try {
        // 1. Summary10 — main aggregation
        await explainAndTime(
            'Summary10 errorCounts (FY 2567)',
            async () =>
                DBSec('med_error as m')
                    .select(
                        'm.error_type',
                        DBSec.raw('MONTH(m.error_date) AS error_month'),
                        DBSec.raw('YEAR(m.error_date) AS error_year'),
                        DBSec.raw("CASE WHEN d.med_error_dep_group_id = 2 THEN 'IPD' WHEN d.med_error_dep_group_id IN (1,5,6) THEN 'OPD' ELSE 'OTHER' END AS ward_group"),
                        DBSec.raw("COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) AS had_count"),
                        DBSec.raw("COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS non_had_count"),
                        DBSec.raw('COUNT(*) AS total_count')
                    )
                    .innerJoin('med_error_dept as d', 'm.error_ward', 'd.med_error_depcode')
                    .whereBetween('m.error_date', ['2023-10-01', '2024-09-30'])
                    .whereIn('d.med_error_dep_group_id', [1, 2, 5, 6])
                    .whereIn('m.error_type', [1, 2, 3, 4, 5, 6])
                    .groupByRaw('m.error_type, MONTH(m.error_date), YEAR(m.error_date), ward_group'),
            {
                sql: `SELECT m.error_type, MONTH(m.error_date), YEAR(m.error_date)
                      FROM med_error m
                      INNER JOIN med_error_dept d ON m.error_ward = d.med_error_depcode
                      WHERE m.error_date BETWEEN ? AND ?
                        AND d.med_error_dep_group_id IN (1,2,5,6)
                        AND m.error_type IN (1,2,3,4,5,6)
                      GROUP BY m.error_type, MONTH(m.error_date), YEAR(m.error_date)`,
                bindings: ['2023-10-01', '2024-09-30'],
            }
        );

        // 2. Summary1 — group by ward
        await explainAndTime(
            'Summary1 by ward (Jan 2024)',
            async () =>
                DBSec('med_error as m')
                    .select('d.med_error_depcode', 'd.med_error_depname', DBSec.raw('COUNT(*) as total'))
                    .join('med_error_dept as d', 'm.error_ward', 'd.med_error_depcode')
                    .whereBetween('m.error_date', ['2024-01-01', '2024-01-31'])
                    .groupBy('d.med_error_depcode', 'd.med_error_depname'),
            {
                sql: `SELECT d.med_error_depcode, COUNT(*) FROM med_error m
                      JOIN med_error_dept d ON m.error_ward = d.med_error_depcode
                      WHERE m.error_date BETWEEN ? AND ?
                      GROUP BY d.med_error_depcode`,
                bindings: ['2024-01-01', '2024-01-31'],
            }
        );

        // 3. Summary9 — subtype LEFT JOIN LIKE
        await explainAndTime(
            'Summary9 subtype (type=5, FY 2567)',
            async () =>
                DBSec('med_error_type_list as etl')
                    .select('etl.error_type_list', DBSec.raw('COUNT(m.error_id) as cnt'))
                    .leftJoin('med_error as m', function () {
                        this.on('m.error_type', '=', 'etl.error_type')
                            .andOn(DBSec.raw(`m.error_processing LIKE CONCAT(etl.error_type_list, ' %')`));
                    })
                    .where('etl.error_type', 5)
                    .andWhere('etl.is_active', 'Y')
                    .groupBy('etl.type_id', 'etl.error_type_list')
        );

        await DBSec.destroy();
        process.exit(0);
    } catch (err) {
        console.error('[error]', err);
        await DBSec.destroy();
        process.exit(1);
    }
}

main();
