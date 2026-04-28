import { Knex } from "knex";
export default class KphisMentalModel {
    private db: Knex;

    constructor(db: Knex) {
        this.db = db;
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
            .select("*")
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