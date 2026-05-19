import { Knex } from "knex";

import { GetMedErrorSummary1Options, GetMedErrorSummary3Options, GetMedErrorSummary6Options, GetMedErrorSummary7Options, GetMedErrorSummary8Options, GetDrugPairReportOptions, GetMedErrorSummary9Options, GetMedErrorSummary10Options, StatVolumeUpsertBody } from '../Interfaces/ReportInterface'

export default class ReportModel {
    private db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    // Using Report 1
    async getReportSummary1(
        options: GetMedErrorSummary1Options
    ) {
        const { firstDate, lastDate, depCode } = options;

        const query = this.db('med_error as m')
            .select(
                'd.med_error_depcode',
                'd.med_error_depname',
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_i`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_i`),
                // รวมผลรวม HAD / non-HAD / ทั้งหมด
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) as had_total`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_total`),
                this.db.raw(`COUNT(m.error_id) as total`)
            )
            .join('med_error_dept as d', 'm.error_ward', 'd.med_error_depcode')
            .whereBetween('m.error_date', [firstDate, lastDate])
            .groupBy('d.med_error_depcode', 'd.med_error_depname')
            .orderBy('d.med_error_depname');

        if (depCode) {
            query.andWhere('m.error_ward', depCode);
        }

        return await query;
    }

    // Using Report 2
    async getReportSummary2(options: GetMedErrorSummary3Options) {
        const { firstDate, lastDate, depCode } = options;

        const query = this.db("med_error_type as t")
            .select(
                "t.error_type",
                "t.error_type_name",
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_i`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_i`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) as had_total`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_total`),
                this.db.raw(`COUNT(m.error_id) as total`)
            )
            .leftJoin("med_error as m", (join) => {
                join.on("m.error_type", "=", "t.error_type")
                    .andOnBetween("m.error_date", [firstDate, lastDate])
                    .andOn((join2) => {
                        join2.orOn(this.db.client.raw("(t.error_type = 1 AND m.error_prescription_ward_code = ?)", [depCode]))
                            .orOn(this.db.client.raw("(t.error_type = 2 AND m.error_dispensing_ward_code = ?)", [depCode]))
                            .orOn(this.db.client.raw("(t.error_type = 3 AND m.error_pre_administration_ward_code = ?)", [depCode]))
                            .orOn(this.db.client.raw("(t.error_type = 4 AND m.error_adminstration_ward_code = ?)", [depCode]))
                            .orOn(this.db.client.raw("(t.error_type = 5 AND m.error_processing_ward_code = ?)", [depCode]));
                    });
            })
            .where('t.is_active', 'Y')
            .groupBy("t.error_type", "t.error_type_name")
            .orderBy("t.error_type", "asc");

        return query
    }
    // Using Report 3
    async getReportSummary3(options: GetMedErrorSummary3Options) {
        const { firstDate, lastDate, depCode } = options;

        const query = this.db('med_error_dept as d')
            .leftJoin('med_error as m', function () {
                this.on('d.med_error_depcode', '=', 'm.error_prescription_ward_code')
                    .orOn('d.med_error_depcode', '=', 'm.error_dispensing_ward_code')
                    .orOn('d.med_error_depcode', '=', 'm.error_pre_administration_ward_code')
                    .orOn('d.med_error_depcode', '=', 'm.error_adminstration_ward_code')
                    .orOn('d.med_error_depcode', '=', 'm.error_processing_ward_code');
            })
            .whereBetween('m.error_date', [firstDate, lastDate])
            .groupBy('d.med_error_depcode', 'd.med_error_depname')
            .orderBy('d.med_error_depname')
            .select(
                'd.med_error_depcode',
                'd.med_error_depname',
                // HAD ตาม error_level
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_i`),
                // ทั่วไปตาม error_level
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_i`),
                // รวม HAD / ทั่วไป / ทั้งหมด
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) as had_total`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_total`),
                this.db.raw(`COUNT(m.error_id) as total`)
            );

        // ถ้ามี depCode ให้ filter
        if (depCode) {
            if (Array.isArray(depCode)) {
                query.whereIn('d.med_error_depcode', depCode);
            } else {
                query.where('d.med_error_depcode', depCode);
            }
        }

        return await query;
    }

    async getReportSummary5(options: GetMedErrorSummary3Options) {
        const { firstDate, lastDate, depCode } = options;

        const query = this.db('med_error as m')
            .select(
                't.error_type',
                't.error_type_name',
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'High Alert Drugs' THEN 1 END) as had_i`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'A' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_a`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'B' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_b`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'C' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_c`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'D' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_d`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'E' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_e`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'F' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_f`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'G' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_g`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'H' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_h`),
                this.db.raw(`COUNT(CASE WHEN m.error_level = 'I' AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_i`),

                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) as had_total`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_total`),
                this.db.raw(`COUNT(m.error_id) as total`)
            )
            .join('med_error_type as t', 'm.error_type', 't.error_type')
            .whereBetween('m.error_date', [firstDate, lastDate])
            .groupBy('t.error_type', 't.error_type_name')
            .havingRaw('COUNT(m.error_id) > 0')
            .orderBy('t.error_type');

        if (depCode && Array.isArray(depCode) && depCode.length > 0) {
            query.whereIn('m.error_ward', depCode);
        }

        return await query;
    }

    // Using Report 6 — สรุปอุบัติการณ์ที่ได้ RCA แล้ว (is_rca = 'Y')
    async getReportSummary6(options: GetMedErrorSummary6Options) {
        const { dateStart, dateEnd, errorType } = options;

        const query = this.db('med_error as me')
            .select(
                'me.error_id',
                'me.error_section',
                this.db.raw("CONCAT(me.error_date, '') as error_date"),
                'me.error_time',
                'me.error_ward_name',
                'me.error_event',
                'me.error_level',
                'me.error_level_detail',
                'me.error_clear',
                'me.error_analysis',
                'me.error_type',
                'me.error_type_name',
                'me.error_alert',
                'me.error_doctor',
                'me.error_user_name',
                'me.is_rca',
                'me.rca_text',
                'me.rca_by',
                this.db.raw('CONCAT(me.updated_rca, \'\') as updated_rca'),
                this.db.raw(`
                    CASE me.error_type
                        WHEN 1 THEN me.error_prescription
                        WHEN 2 THEN me.error_dispensing
                        WHEN 3 THEN me.error_pre_administration
                        WHEN 4 THEN me.error_adminstration
                        WHEN 5 THEN me.error_processing
                        WHEN 6 THEN me.error_transcribing
                        ELSE ''
                    END AS error_type_detail
                `),
                this.db.raw('DATEDIFF(me.updated_rca, me.error_date) AS rca_days')
            )
            .where('me.is_rca', 'Y')
            .where('me.app_new', 'Y')
            .whereBetween('me.error_date', [dateStart, dateEnd])
            .orderBy('me.error_date', 'desc');

        const numType = Number(errorType);
        if (Number.isFinite(numType) && numType >= 1 && numType <= 6) {
            query.andWhere('me.error_type', numType);
        }

        return await query;
    }

    async getReportSummary7(options: GetMedErrorSummary7Options) {
        const { firstDate, lastDate } = options;

        const query = this.db('med_error as m')
            .select(
                'm.error_user_name',
                this.db.raw("COUNT(CASE WHEN m.error_type = 1 THEN 1 END) AS error_prescription"),
                this.db.raw("COUNT(CASE WHEN m.error_type = 2 THEN 2 END) AS error_dispensing"),
                this.db.raw("COUNT(CASE WHEN m.error_type = 3 THEN 3 END) AS error_pre_administration"),
                this.db.raw("COUNT(CASE WHEN m.error_type = 4 THEN 4 END) AS error_adminstration"),
                this.db.raw("COUNT(CASE WHEN m.error_type = 5 THEN 5 END) AS error_processing"),
                this.db.raw("COUNT(m.error_id)  AS total"),
            )
            .whereBetween('m.error_date', [firstDate, lastDate])
            .groupBy('m.error_user')
            .orderBy('total', 'desc');

        return await query;
    }

    // รายงานแยกรายละเอียด Error — แสดง subtype จาก med_error_type_list ของประเภท Error ที่เลือก
    // แต่ละแถว: ชื่อ subtype + HAD/Non-HAD/Total ของ Period A (+ Period B ถ้ามี) + Impact + Likelihood
    // Match subtype: m.<field_for_type> LIKE CONCAT(etl.error_type_list, ' %')
    async getReportSummary9(options: GetMedErrorSummary9Options) {
        const { firstDateA, lastDateA, firstDateB, lastDateB, errorType } = options;
        const numType = Number(errorType);
        const FIELD_MAP: Record<number, string> = {
            1: 'error_prescription',
            2: 'error_dispensing',
            3: 'error_pre_administration',
            4: 'error_adminstration',
            5: 'error_processing',
            6: 'error_transcribing',
        };
        const field = FIELD_MAP[numType];
        if (!field) return [];

        const db = this.db;
        const compare = Boolean(firstDateB && lastDateB);

        const selectCols: any[] = [
            'etl.type_id',
            'etl.error_type',
            'etl.error_type_list',
            'etl.error_type_list_detail',
            'etl.impact_score',
            'etl.likelihood_score',
            db.raw(
                `COUNT(CASE WHEN m.error_date BETWEEN ? AND ? AND m.error_alert = 'High Alert Drugs' THEN 1 END) AS had_a`,
                [firstDateA, lastDateA]
            ),
            db.raw(
                `COUNT(CASE WHEN m.error_date BETWEEN ? AND ? AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS non_had_a`,
                [firstDateA, lastDateA]
            ),
            db.raw(
                `COUNT(CASE WHEN m.error_date BETWEEN ? AND ? THEN 1 END) AS total_a`,
                [firstDateA, lastDateA]
            ),
        ];

        if (compare) {
            selectCols.push(
                db.raw(
                    `COUNT(CASE WHEN m.error_date BETWEEN ? AND ? AND m.error_alert = 'High Alert Drugs' THEN 1 END) AS had_b`,
                    [firstDateB!, lastDateB!]
                ),
                db.raw(
                    `COUNT(CASE WHEN m.error_date BETWEEN ? AND ? AND m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS non_had_b`,
                    [firstDateB!, lastDateB!]
                ),
                db.raw(
                    `COUNT(CASE WHEN m.error_date BETWEEN ? AND ? THEN 1 END) AS total_b`,
                    [firstDateB!, lastDateB!]
                )
            );
        }

        const query = db('med_error_type_list as etl')
            .select(selectCols)
            .leftJoin('med_error as m', function () {
                this.on('m.error_type', '=', 'etl.error_type')
                    .andOn(db.raw(`m.${field} LIKE CONCAT(etl.error_type_list, ' %')`));
            })
            .where('etl.error_type', numType)
            .andWhere('etl.is_active', 'Y')
            .groupBy(
                'etl.type_id',
                'etl.error_type',
                'etl.error_type_list',
                'etl.error_type_list_detail',
                'etl.impact_score',
                'etl.likelihood_score'
            )
            .orderBy('etl.error_type_list');

        return await query;
    }

    // Using Report Summary 8 
    async getReportSummary8(options: GetMedErrorSummary8Options) {
        const { firstDate, lastDate, depCode, errorType, errorLevel, errorAlert } = options;
        const query = this.db('med_error as m')
            .select(
                this.db.raw('CONCAT(m.error_datetime) as med_error_datetime'),
                this.db.raw('CONCAT(m.error_date) as med_error_date'),
                'm.error_time',
                'm.error_ward_name',
                'm.error_event',
                'm.error_level',
                'm.error_clear',
                'm.error_analysis',
                'm.error_type_name',
                'm.error_alert',
                // 2. เงื่อนไขแสดงชื่อ Ward (Involved Ward) ตามประเภทความผิดพลาด
                this.db.raw(`
            CASE 
                WHEN m.error_prescription != '' AND m.error_prescription IS NOT NULL THEN m.error_prescription_ward
                WHEN m.error_dispensing != '' AND m.error_dispensing IS NOT NULL THEN m.error_dispensing_ward
                WHEN m.error_pre_administration != '' AND m.error_pre_administration IS NOT NULL THEN m.error_pre_administration_ward
                WHEN m.error_adminstration != '' AND m.error_adminstration IS NOT NULL THEN m.error_adminstration_ward
                WHEN m.error_processing != '' AND m.error_processing IS NOT NULL THEN m.error_processing_ward
                WHEN m.error_transcribing != '' AND m.error_transcribing IS NOT NULL THEN m.error_transcribing_ward
                ELSE ''
            END AS involved_ward_name
        `),

                // 3. เงื่อนไขรายละเอียดเนื้อหา Error (Error Detail)
                this.db.raw(`
            CASE m.error_type
                WHEN 1 THEN m.error_prescription
                WHEN 2 THEN m.error_dispensing
                WHEN 3 THEN m.error_pre_administration
                WHEN 4 THEN m.error_adminstration
                WHEN 5 THEN m.error_processing
                WHEN 6 THEN m.error_transcribing
                ELSE ''
            END AS error_type_detail
        `)
            )
            .whereBetween('m.error_date', [firstDate, lastDate])
            .orderBy('m.error_date', 'desc');

        if (depCode) {
            if (Array.isArray(depCode)) {
                query.whereIn('m.error_ward', depCode);
            }
        }

        if (errorLevel) {
            if (Array.isArray(errorLevel)) {
                query.whereIn('m.error_level', errorLevel);
            }
        }

        if (errorType) {
            query.andWhere('m.error_type', errorType);
        }

        if (errorAlert) {
            query.andWhere('m.error_alert', errorAlert);
        }

        return await query
    }

    // คู่ยาที่คลาดเคลื่อน — group by (ยาที่ถูก, ยาที่คลาดเคลื่อน), เรียง count desc
    async getDrugPairSummary(options: GetDrugPairReportOptions) {
        const { firstDate, lastDate, pairType } = options;

        // map pairType → (error_type, ฟิลด์คู่)
        // dispensing (จัด)  = error_type 2 → ใช้ error_prescription_right/wrong
        // processing (คีย์) = error_type 5 → ใช้ error_processing_right/wrong
        const config = pairType === 'processing'
            ? { errorType: 5, fieldRight: 'error_processing_right', fieldWrong: 'error_processing_wrong' }
            : { errorType: 2, fieldRight: 'error_prescription_right', fieldWrong: 'error_prescription_wrong' };

        const { errorType, fieldRight, fieldWrong } = config;

        return await this.db('med_error as m')
            .select(
                this.db.raw(`TRIM(m.${fieldRight}) as drug_right`),
                this.db.raw(`TRIM(m.${fieldWrong}) as drug_wrong`),
                this.db.raw('COUNT(*) as count')
            )
            .where('m.error_type', errorType)
            .andWhereBetween('m.error_date', [firstDate, lastDate])
            .andWhereRaw(`m.${fieldRight} IS NOT NULL AND TRIM(m.${fieldRight}) <> ''`)
            .andWhereRaw(`m.${fieldWrong} IS NOT NULL AND TRIM(m.${fieldWrong}) <> ''`)
            .groupByRaw(`TRIM(m.${fieldRight}), TRIM(m.${fieldWrong})`)
            .orderBy('count', 'desc');
    }

    // ========================================================================
    // ReportSummary10 — สถิติจำนวนใบสั่งยา (OPD) + วันนอน (IPD)
    // ปีงบประมาณ พ.ศ. 2567 = ตค.2023 - กย.2024 (ปี ค.ศ. 2023 ตค-ธค + 2024 มค-กย)
    // ========================================================================

    // แปลงปีงบประมาณ พ.ศ. → ช่วงปี/เดือน (ค.ศ.) ของ 12 เดือนในปีงบ
    private fiscalYearToMonths(fiscalYearBE: number): Array<{ year: number; month: number }> {
        const ceStart = fiscalYearBE - 543 - 1; // ปี ค.ศ. ที่เริ่มต้นปีงบ (ตค.)
        const ceEnd = fiscalYearBE - 543;       // ปี ค.ศ. ที่จบปีงบ (กย.)
        const months: Array<{ year: number; month: number }> = [];
        for (let m = 10; m <= 12; m += 1) months.push({ year: ceStart, month: m });
        for (let m = 1; m <= 9; m += 1) months.push({ year: ceEnd, month: m });
        return months;
    }

    // ดึง TABLE 0 — return 12 rows เรียงตามลำดับปีงบ (ตค.-กย.), เติม 0 ถ้ายังไม่มีในตาราง
    async getStatVolume(fiscalYearBE: number) {
        const months = this.fiscalYearToMonths(fiscalYearBE);
        const ceYears = Array.from(new Set(months.map(m => m.year)));

        const existing = await this.db('med_error_stat_volume')
            .select('stat_id', 'stat_year', 'stat_month', 'ipd_patient_days', 'opd_prescriptions', 'updated_by',
                this.db.raw('CONCAT(updated_at) as updated_at'))
            .whereIn('stat_year', ceYears)
            .whereIn('stat_month', months.map(m => m.month));

        const map = new Map<string, any>();
        existing.forEach((r: any) => map.set(`${r.stat_year}-${r.stat_month}`, r));

        return months.map(({ year, month }) => {
            const row = map.get(`${year}-${month}`);
            return {
                stat_id: row?.stat_id ?? null,
                stat_year: year,
                stat_month: month,
                ipd_patient_days: row ? Number(row.ipd_patient_days) : 0,
                opd_prescriptions: row ? Number(row.opd_prescriptions) : 0,
                updated_by: row?.updated_by ?? null,
                updated_at: row?.updated_at ?? null,
            };
        });
    }

    // upsert ทีละแถวด้วย INSERT ... ON DUPLICATE KEY UPDATE (ใช้ unique key uq_year_month)
    async upsertStatVolume(body: StatVolumeUpsertBody): Promise<number> {
        const { fiscalYear, rows, updated_by } = body;
        if (!Array.isArray(rows) || rows.length === 0) return 0;
        const months = this.fiscalYearToMonths(fiscalYear);
        const monthToYear = new Map<number, number>();
        months.forEach(({ year, month }) => monthToYear.set(month, year));

        let affected = 0;
        for (const r of rows) {
            const ceYear = monthToYear.get(Number(r.stat_month));
            if (!ceYear) continue;
            const ipd = Number.isFinite(Number(r.ipd_patient_days)) ? Number(r.ipd_patient_days) : 0;
            const opd = Number.isFinite(Number(r.opd_prescriptions)) ? Number(r.opd_prescriptions) : 0;
            await this.db.raw(
                `INSERT INTO med_error_stat_volume (stat_year, stat_month, ipd_patient_days, opd_prescriptions, updated_by)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   ipd_patient_days = VALUES(ipd_patient_days),
                   opd_prescriptions = VALUES(opd_prescriptions),
                   updated_by = VALUES(updated_by)`,
                [ceYear, Number(r.stat_month), ipd, opd, updated_by || null]
            );
            affected += 1;
        }
        return affected;
    }

    // นับ Error แยก HAD/Non-HAD ตามเดือน × error_type × ward_group (IPD/OPD)
    // IPD = med_error_dep_group_id 2; OPD = 1, 5, 6
    async getReportSummary10(options: GetMedErrorSummary10Options) {
        const fiscalYearBE = Number(options.fiscalYear);
        const months = this.fiscalYearToMonths(fiscalYearBE);
        const ceStart = months[0].year;       // ตค. start year
        const ceEnd = months[months.length - 1].year; // กย. end year
        const firstDate = `${ceStart}-10-01`;
        const lastDate = `${ceEnd}-09-30`;

        const rows = await this.db('med_error as m')
            .select(
                'm.error_type',
                this.db.raw('MONTH(m.error_date) AS error_month'),
                this.db.raw('YEAR(m.error_date) AS error_year'),
                this.db.raw(`CASE
                    WHEN d.med_error_dep_group_id = 2 THEN 'IPD'
                    WHEN d.med_error_dep_group_id IN (1,5,6) THEN 'OPD'
                    ELSE 'OTHER'
                END AS ward_group`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) AS had_count`),
                this.db.raw(`COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS non_had_count`),
                this.db.raw('COUNT(*) AS total_count')
            )
            .innerJoin('med_error_dept as d', 'm.error_ward', 'd.med_error_depcode')
            .whereBetween('m.error_date', [firstDate, lastDate])
            .whereIn('d.med_error_dep_group_id', [1, 2, 5, 6])
            .whereIn('m.error_type', [1, 2, 3, 4, 5, 6])
            .groupByRaw(`m.error_type, MONTH(m.error_date), YEAR(m.error_date), ward_group`)
            .orderByRaw(`m.error_type ASC, error_year ASC, error_month ASC`);

        // แปลงตัวเลข + ตัด OTHER (กันกรณี ward group ไม่ตรง mapping)
        return rows
            .filter((r: any) => r.ward_group === 'IPD' || r.ward_group === 'OPD')
            .map((r: any) => ({
                error_type: Number(r.error_type),
                error_month: Number(r.error_month),
                error_year: Number(r.error_year),
                ward_group: r.ward_group,
                had_count: Number(r.had_count) || 0,
                non_had_count: Number(r.non_had_count) || 0,
                total_count: Number(r.total_count) || 0,
            }));
    }

}