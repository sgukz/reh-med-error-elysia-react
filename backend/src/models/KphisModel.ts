import { Knex } from "knex";
export default class KphisModel {
    private db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    async getClinicalSummary(an: string) {
        const query = this.db("kphis.ipd_dr_admission_note AS ki")
            .leftJoin("kphis.ipd_summary_2 AS is2", "ki.an", "is2.an")
            .leftJoin("hos.ipt AS i", "ki.an", "i.an")
            .leftJoin("hos.an_stat AS a", "ki.an", "a.an")
            .leftJoin("hos.opdscreen AS os", "i.vn", "os.vn")
            .leftJoin("hos.ward AS w", "i.ward", "w.ward")
            .leftJoin("hos.patient AS p", "i.hn", "p.hn")
            .leftJoin("hos.vn_stat as v", "i.vn", "v.vn")
            .leftJoin("hos.oapp AS oa", "i.vn", "oa.vn")
            .leftJoin("kphis.ipd_summary_attending_doctor AS isad", "is2.summary_id", "isad.summary_id")
            .leftJoin("kphis.ipd_summary_approve_doctor AS isappd", "is2.summary_id", "isappd.summary_id")
            .leftJoin("hos.doctor AS doc", "isad.summary_attending_doctor", "doc.code")
            .leftJoin("hos.doctor AS doc_app", "isappd.summary_approve_doctor", "doc_app.code")
            .leftJoin("hos.hospcode AS h", "h.hospcode", "is2.hospital_refer")
            .leftJoin('hos.thaiaddress as tc', (join) => {
                join.on('p.chwpart', '=', 'tc.chwpart')
                    .andOn('tc.amppart', '=', this.db.client.raw('?', ['00']))
                    .andOn('tc.tmbpart', '=', this.db.client.raw('?', ['00']));
            })
            .leftJoin('hos.thaiaddress as ta', (join) => {
                join.on('p.chwpart', '=', 'ta.chwpart')
                    .andOn('p.amppart', '=', 'ta.amppart')
                    .andOn('ta.tmbpart', '=', this.db.client.raw('?', ['00']));
            })
            .leftJoin('hos.thaiaddress as tt', function () {
                this.on('p.chwpart', '=', 'tt.chwpart')
                    .andOn('p.amppart', '=', 'tt.amppart')
                    .andOn('p.tmbpart', '=', 'tt.tmbpart');
            })
            .leftJoin("kphis.ipd_summary_pre_admission_comorbidity AS ispac", "is2.summary_id", "ispac.summary_id")
            .leftJoin("kphis.ipd_summary_post_admission_comorbidity AS ispostac", "is2.summary_id", "ispostac.summary_id")
            .leftJoin("kphis.ipd_summary_other_diagnosis AS isod", "is2.summary_id", "isod.summary_id")
            .leftJoin("kphis.ipd_summary_external_cause AS isec", "is2.summary_id", "isec.summary_id")
            .select([
                this.db.raw("CONCAT(p.pname, p.fname, ' ', p.lname) AS patient_name"),
                "a.age_y AS age",
                "i.hn",
                "i.an",
                "w.name AS ward",
                this.db.raw("CONCAT(i.regdate) as regdate"),
                this.db.raw("CASE WHEN i.dchdate IS NULL THEN '' ELSE i.dchdate END AS dchdate"),
                this.db.raw("CASE WHEN ki.medical_history IS NOT NULL THEN CONCAT('CC: ', ki.chief_complaints, '\nPE: ', ki.medical_history) ELSE '' END AS history"),
                this.db.raw("CASE WHEN ki.chief_complaints IS NOT NULL THEN ki.chief_complaints ELSE '' END as cc"),
                this.db.raw("CASE WHEN ki.medical_history IS NOT NULL THEN ki.medical_history ELSE '' END as pe"),
                this.db.raw("'' AS investigations"),
                this.db.raw("CONCAT(is2.principal_diagnosis,CASE WHEN ispac.pre_admission_comorbidity_detail IS NOT NULL THEN CONCAT('\n', ispac.pre_admission_comorbidity_detail) ELSE '' END, CASE WHEN ispostac.post_admission_comorbidity_detail IS NOT NULL THEN CONCAT('\n',ispostac.post_admission_comorbidity_detail) ELSE '' END ,CASE WHEN isod.other_diagnosis_detail IS NOT NULL THEN CONCAT('\n',isod.other_diagnosis_detail) ELSE '' END,CASE WHEN isec.external_cause_detail IS NOT NULL THEN CONCAT('\n',isec.external_cause_detail) ELSE '' END) as diagnosis"),
                this.db.raw("CASE WHEN ki.disease_detail IS NOT NULL THEN ki.disease_detail ELSE '' END AS underlying"),
                this.db.raw("CASE WHEN oa.nextdate IS NOT NULL THEN CONCAT(oa.nextdate, ' ', oa.note) ELSE '' END AS follow_up"),
                this.db.raw("CASE WHEN is2.hospital_refer IS NULL THEN '' ELSE CONCAT(h.hospcode, ' ', h.hosptype, ' ', h.name ) END AS refer"),
                "is2.discharge_type",
                this.db.raw("CASE WHEN isad.summary_attending_doctor IS NOT NULL THEN CONCAT(doc.pname,doc.fname, ' ', doc.lname, ' ',doc.licenseno) ELSE '' END AS attending_doctor"),
                this.db.raw("CASE WHEN isappd.summary_approve_doctor IS NOT NULL THEN CONCAT(doc_app.pname,doc_app.fname, ' ', doc_app.lname, ' ',doc_app.licenseno) ELSE '' END AS approve_doctor"),
                "p.informaddr AS full_address",
                "p.addrpart",
                "p.moopart",
                "tt.name AS SubDistrict",
                "ta.name AS District",
                "tc.name AS Province",
            ])
            .where("ki.an", an)
        return await query
    }

    async getClinicalSummaryRefer(an: string) {
        const query = this.db("kphis.ipd_dr_admission_note AS ki")
            .leftJoin("kphis.ipd_summary_2 AS is2", "ki.an", "is2.an")
            .leftJoin("hos.ipt AS i", "ki.an", "i.an")
            .leftJoin("hos.an_stat AS a", "ki.an", "a.an")
            .leftJoin("hos.opdscreen AS os", "i.vn", "os.vn")
            .leftJoin("hos.ward AS w", "i.ward", "w.ward")
            .leftJoin("hos.patient AS p", "i.hn", "p.hn")
            .leftJoin("hos.vn_stat as v", "i.vn", "v.vn")
            .leftJoin("hos.oapp AS oa", "i.vn", "oa.vn")
            .leftJoin("kphis.ipd_summary_attending_doctor AS isad", "is2.summary_id", "isad.summary_id")
            .leftJoin("kphis.ipd_summary_approve_doctor AS isappd", "is2.summary_id", "isappd.summary_id")
            .leftJoin("hos.doctor AS doc", "isad.summary_attending_doctor", "doc.code")
            .leftJoin("hos.doctor AS doc_app", "isappd.summary_approve_doctor", "doc_app.code")
            .leftJoin("hos.hospcode AS h", "h.hospcode", "is2.hospital_refer")
            .leftJoin('hos.thaiaddress as tc', (join) => {
                join.on('p.chwpart', '=', 'tc.chwpart')
                    .andOn('tc.amppart', '=', this.db.client.raw('?', ['00']))
                    .andOn('tc.tmbpart', '=', this.db.client.raw('?', ['00']));
            })
            .leftJoin('hos.thaiaddress as ta', (join) => {
                join.on('p.chwpart', '=', 'ta.chwpart')
                    .andOn('p.amppart', '=', 'ta.amppart')
                    .andOn('ta.tmbpart', '=', this.db.client.raw('?', ['00']));
            })
            .leftJoin('hos.thaiaddress as tt', function () {
                this.on('p.chwpart', '=', 'tt.chwpart')
                    .andOn('p.amppart', '=', 'tt.amppart')
                    .andOn('p.tmbpart', '=', 'tt.tmbpart');
            })
            .leftJoin("kphis.ipd_summary_pre_admission_comorbidity AS ispac", "is2.summary_id", "ispac.summary_id")
            .leftJoin("kphis.ipd_summary_post_admission_comorbidity AS ispostac", "is2.summary_id", "ispostac.summary_id")
            .leftJoin("kphis.ipd_summary_other_diagnosis AS isod", "is2.summary_id", "isod.summary_id")
            .leftJoin("kphis.ipd_summary_external_cause AS isec", "is2.summary_id", "isec.summary_id")
            .select([
                this.db.raw("CONCAT(p.pname, p.fname, ' ', p.lname) AS patient_name"),
                "a.age_y AS age",
                "i.hn",
                "i.an",
                "w.name AS ward",
                this.db.raw("CONCAT(i.regdate) as regdate"),
                this.db.raw("CASE WHEN i.dchdate IS NULL THEN '' ELSE i.dchdate END AS dchdate"),
                this.db.raw("CASE WHEN ki.medical_history IS NOT NULL THEN CONCAT('CC: ', ki.chief_complaints, '\\nPE: ', ki.medical_history) ELSE '' END AS history"),
                this.db.raw("CASE WHEN ki.chief_complaints IS NOT NULL THEN ki.chief_complaints ELSE '' END as cc"),
                this.db.raw("CASE WHEN ki.medical_history IS NOT NULL THEN ki.medical_history ELSE '' END as pe"),
                this.db.raw("CASE WHEN ki.family_medical_history_detail IS NOT NULL THEN CONCAT(ki.family_medical_history_detail,'') ELSE '' END AS family_medical_history"),
                this.db.raw("'' AS investigations"),
                this.db.raw("CONCAT(is2.principal_diagnosis,CASE WHEN ispac.pre_admission_comorbidity_detail IS NOT NULL THEN CONCAT('\n', ispac.pre_admission_comorbidity_detail) ELSE '' END, CASE WHEN ispostac.post_admission_comorbidity_detail IS NOT NULL THEN CONCAT('\n',ispostac.post_admission_comorbidity_detail) ELSE '' END ,CASE WHEN isod.other_diagnosis_detail IS NOT NULL THEN CONCAT('\n',isod.other_diagnosis_detail) ELSE '' END,CASE WHEN isec.external_cause_detail IS NOT NULL THEN CONCAT('\n',isec.external_cause_detail) ELSE '' END) as diagnosis"),
                this.db.raw("CASE WHEN ki.disease_detail IS NOT NULL THEN ki.disease_detail ELSE '' END AS underlying"),
                this.db.raw("CASE WHEN oa.nextdate IS NOT NULL THEN CONCAT(oa.nextdate, ' ', oa.note) ELSE '' END AS follow_up"),
                this.db.raw("CASE WHEN is2.hospital_refer IS NULL THEN '' ELSE CONCAT(h.hospcode, ' ', h.hosptype, ' ', h.name ) END AS refer"),
                "is2.discharge_type",
                this.db.raw("CASE WHEN isad.summary_attending_doctor IS NOT NULL THEN CONCAT(doc.pname,doc.fname, ' ', doc.lname, ' ',doc.licenseno) ELSE '' END AS attending_doctor"),
                this.db.raw("CASE WHEN isappd.summary_approve_doctor IS NOT NULL THEN CONCAT(doc_app.pname,doc_app.fname, ' ', doc_app.lname, ' ',doc_app.licenseno) ELSE '' END AS approve_doctor"),
                "p.informaddr AS full_address",
                "p.addrpart",
                "p.moopart",
                "tt.name AS SubDistrict",
                "ta.name AS District",
                "tc.name AS Province",
            ])
            .where("ki.an", an)
        return query
    }

    async getTreatments(an: string): Promise<any[]> {
        return this.db.raw(`
            SELECT CONCAT(concat(di.name, ' ', di.strength, ' ',di.units), '',oi.order_item_detail) as continuous_drug,
             (   select off_by_order_item.order_item_id
                from kphis.ipd_order_item off_by_order_item
                join kphis.ipd_order off_by_order on off_by_order_item.order_id = off_by_order.order_id and off_by_order.an = off_by_order_item.an
                and off_by_order.order_confirm = 'Y'
                where off_by_order_item.off_order_item_id = oi.order_item_id
                and off_by_order_item.order_item_type = 'off'
                and off_by_order.an = oi.an
                limit 1
            ) as off_by_order_item_id
            FROM kphis.ipd_order_item oi
            join kphis.ipd_order o on o.order_id = oi.order_id
            left outer join hos.drugitems di on di.icode = oi.icode
            WHERE oi.an = '${an}'
            and oi.order_item_type='med'
            and o.order_type='continuous'
            and o.order_confirm = 'Y'
            having off_by_order_item_id is null
            order by oi.order_item_id`)
    }

    async getHomeMed(an: string): Promise<any[]> {
        return this.db.raw(`
            SELECT CONCAT(concat(di.name, ' ', di.strength, ' ',di.units), '',oi.order_item_detail) as continuous_drug,
             (   select off_by_order_item.order_item_id
                from kphis.ipd_order_item off_by_order_item
                join kphis.ipd_order off_by_order on off_by_order_item.order_id = off_by_order.order_id and off_by_order.an = off_by_order_item.an
                and off_by_order.order_confirm = 'Y'
                where off_by_order_item.off_order_item_id = oi.order_item_id
                and off_by_order_item.order_item_type = 'off'
                and off_by_order.an = oi.an
                limit 1
            ) as off_by_order_item_id
            FROM kphis.ipd_order_item oi
            join kphis.ipd_order o on o.order_id = oi.order_id
            left outer join hos.drugitems di on di.icode = oi.icode
            WHERE oi.an = '${an}'
            and oi.order_item_type='home-medication'
            and o.order_confirm = 'Y'
            having off_by_order_item_id is null
            order by oi.order_item_id`)
    }

    async getPatient(an: string) {
        const query = this.db("kphis.ipd_dr_admission_note AS ki")
            .leftJoin("kphis.ipd_summary_2 AS is2", "ki.an", "is2.an")
            .leftJoin("hos.ipt AS i", "ki.an", "i.an")
            .leftJoin("hos.an_stat AS a", "ki.an", "a.an")
            .leftJoin("hos.patient AS p", "i.hn", "p.hn")
            .leftJoin("kphis.ipd_dr_admission_note_item AS idani", "ki.admission_note_id", "idani.admission_note_id")
            .leftJoin("hos.doctor AS doc", "idani.admission_note_doctor", "doc.code")
            .leftJoin("kphis.form_mental AS fm", "ki.an", "fm.an")
            .select([
                this.db.raw("CONCAT(p.pname, p.fname, ' ', p.lname) AS patient_name"),
                "i.an",
                this.db.raw("CONCAT(i.regdate) as regdate"),
                "ki.impression",
                this.db.raw("CONCAT(doc.pname,doc.fname, ' ', doc.lname, ' ',doc.licenseno) AS attending_doctor"),
                this.db.raw("CASE WHEN fm.generalAppearance IS NOT NULL THEN fm.generalAppearance ELSE '' END as generalAppearance"),
                this.db.raw("CASE WHEN fm.speech IS NOT NULL THEN fm.speech ELSE '' END as speech"),
                this.db.raw("CASE WHEN fm.moodAffect IS NOT NULL THEN fm.moodAffect ELSE '' END as moodAffect"),
                this.db.raw("CASE WHEN fm.thought IS NOT NULL THEN fm.thought ELSE '' END as thought"),
                this.db.raw("CASE WHEN fm.perception IS NOT NULL THEN fm.perception ELSE '' END as perception"),
                this.db.raw("CASE WHEN fm.delusion IS NOT NULL THEN fm.delusion ELSE '' END as delusion"),
                this.db.raw("CASE WHEN fm.orientation IS NOT NULL THEN fm.orientation ELSE '' END as orientation"),
                this.db.raw("CASE WHEN fm.memory IS NOT NULL THEN fm.memory ELSE '' END as memory"),
                this.db.raw("CASE WHEN fm.concentration IS NOT NULL THEN fm.concentration ELSE '' END as concentration"),
                this.db.raw("CASE WHEN fm.intelligence IS NOT NULL THEN fm.intelligence ELSE '' END as intelligence"),
                this.db.raw("CASE WHEN fm.abstractReasoning IS NOT NULL THEN fm.abstractReasoning ELSE '' END as abstractReasoning"),
                this.db.raw("CASE WHEN fm.judgment IS NOT NULL THEN fm.judgment ELSE '' END as judgment"),
                this.db.raw("CASE WHEN fm.insight IS NOT NULL THEN fm.insight ELSE '' END as insight"),
            ])
            .where("ki.an", an)
        return query
    }

    async checkData(tableName: string, conditions: object) {
        return this.db(tableName)
            .select()
            .where(conditions)
            .limit(1)
    }

    async saveData(tableName: string, dataObj: object) {
        return this.db(tableName)
            .insert(dataObj)
    }

    async updateData(tableName: string, dataObj: object, conditions: object) {
        return this.db(tableName)
            .update(dataObj)
            .where(conditions)
    }


}