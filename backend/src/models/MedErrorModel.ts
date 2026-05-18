import { Knex } from "knex";

export default class MedErrorModel {
    private db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    //Using for Endpoint /get-med-error
    async getMedErrorAll(error_user: string, dateStart?: string, dateEnd?: string) {
        const query = this.db("med_error AS me")
            .select("me.*",
                this.db.raw("CONCAT(me.error_datetime) as error_datetime"),
                this.db.raw("CONCAT(me.last_updated) as last_updated"),
                this.db.raw("CONCAT(me.updated_rca) as updated_rca"),
                "mp_dp.error_key_person_name AS error_dispensing_person_name",
                "mp_kp.error_key_person_name AS error_key_person_name",
                "mp_pp.error_key_person_name AS error_processing_person_name",
                "mp_tsb.error_key_person_name AS error_transcribing_person_name",
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
                this.db.raw(`CONCAT(me.error_date, '') AS error_date`)
            )
            .leftOuterJoin("med_error_person AS mp_dp", "me.error_dispensing_person", "mp_dp.error_key_person_id")
            .leftOuterJoin("med_error_person AS mp_kp", "me.error_key_person", "mp_kp.error_key_person_id")
            .leftOuterJoin("med_error_person AS mp_pp", "me.error_processing_person", "mp_pp.error_key_person_id")
            .leftOuterJoin("med_error_person AS mp_tsb", "me.error_transcribing_person", "mp_tsb.error_key_person_id")
            .where("me.app_new", "Y")
            .orderBy("me.error_datetime", "DESC");

        if (error_user) {
            query.andWhere("me.error_user", error_user);
        }

        if (dateStart && dateEnd) {
            query.andWhereBetween("me.error_date", [dateStart, dateEnd]);
        }

        return query;
    }

    //Using for Endpoint /delete-med-error checking data found in med_error
    async getMedErrorById(error_id: number) {
        if (error_id && error_id !== 0) {
            return this.db("med_error AS me")
                .select("me.*",
                    this.db.raw("CONCAT(me.error_datetime) as error_date"),
                    this.db.raw("CONCAT(me.error_datetime) as error_datetime"),
                    this.db.raw("CONCAT(me.last_updated) as last_updated"),
                    this.db.raw("CONCAT(me.updated_rca) as updated_rca"),
                    "mp_dp.error_key_person_name AS error_dispensing_person_name",
                    "mp_kp.error_key_person_name AS error_key_person_name",
                    "mp_pp.error_key_person_name AS error_processing_person_name",
                    "mp_tsb.error_key_person_name AS error_transcribing_person_name",
                )
                .leftOuterJoin("med_error_person AS mp_dp", "me.error_dispensing_person", "mp_dp.error_key_person_id")
                .leftOuterJoin("med_error_person AS mp_kp", "me.error_key_person", "mp_kp.error_key_person_id")
                .leftOuterJoin("med_error_person AS mp_pp", "me.error_processing_person", "mp_pp.error_key_person_id")
                .leftOuterJoin("med_error_person AS mp_tsb", "me.error_transcribing_person", "mp_tsb.error_key_person_id")
                .where({
                    "me.app_new": 'Y',
                    "me.error_id": error_id
                })
                .limit(1);

        }
    }

    //Check authorized
    async getMedErrorAccess(loginname: string) {
        return this.db("med_error_access")
            .select()
            .where("active", 1)
            .andWhere("loginname", loginname)
            .limit(1)
    }

    async getErrorTypeByType(errorTypeList: Array<number>) {
        let query = this.db("med_error_type AS etl")
            .select("etl.error_type", "etl.error_type_name", "etl.error_field", "etl.error_field_ward", "etl.error_field_ward_code")
            .orderBy("etl.error_type")
        if (errorTypeList.length > 0) {
            query.whereIn("etl.error_type", errorTypeList)
        }
        return query
    }

    getErrorTypeByTypeList(errorType: number) {
        if (errorType !== undefined && errorType !== 0) {
            return this.db("med_error_type_list AS etl")
                .select("etl.error_type", "etl.error_type_list", this.db.raw(`CONCAT(etl.error_type_list,' ',etl.error_type_list_detail) AS error_type_list_detail`))
                .where("etl.error_type", errorType)
                .andWhere("etl.is_active", "Y")
        } else {
            return this.db("med_error_type_list AS etl")
                .select("etl.type_id", "etl.error_type", "et.error_type_name", "etl.error_type_list", "etl.error_type_list_detail", "etl.is_active", "etl.impact_score", "etl.likelihood_score")
                .leftJoin("med_error_type AS et", "etl.error_type", "et.error_type")
                .orderBy([{ column: 'etl.error_type', order: "asc" }, { column: 'etl.type_id', order: 'asc' }]);
        }
    }

    async getMedErrorPersonAll() {
        return this.db("med_error_person AS p")
            .select()
            .leftJoin("med_error_key_sec AS k", "p.error_key_sec", "k.error_key_sec_id")
            .orderBy("p.error_key_sec")
    }

    async getMedErrorDeptAll(conditionsDept: object = {}) {
        return this.db("med_error_dept AS dep")
            .select("*", "dep.med_error_dep_group_id")
            .leftJoin("med_error_dep_group AS dg", "dep.med_error_dep_group_id", "dg.med_error_dep_group_id")
            .modify((query) => {
                if (Object.keys(conditionsDept).length > 0) {
                    query.where(conditionsDept);
                }
            })
            .orderBy("dep.med_error_depname");
    }

    async getAnalysis(is_active: string) {
        if (is_active && is_active !== "") {
            return this.db("med_error_analysis")
                .select()
                .where("is_active", is_active)
                .orderBy("error_analysis_name")
        } else {
            return this.db("med_error_analysis")
                .select()
                .orderBy("error_analysis_name")
        }

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

    async deleteData(tableName: string, conditions: object) {
        return this.db(tableName)
            .where(conditions)
            .del()
    }

}