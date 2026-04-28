import { Knex } from "knex";

export default class HISModel {
    private db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    async login(uLogin: string, uPwd: string) {
        return this.db("opduser AS o")
            .select(
                "o.loginname",
                "o.name",
                "o.accessright",
                "o.department",
                "o.entryposition",
                "o.groupname",
                "d.sex"
            )
            .leftJoin("doctor AS d", 'o.doctorcode', 'd.code')
            .where("o.loginname", uLogin)
            .andWhere(function () {
                this.whereRaw(`o.passweb = LOWER(MD5('${uPwd}')) OR o.passweb = UPPER(MD5('${uPwd}'))`)
            })
            .andWhere("o.account_disable", 'N')
            .limit(1)
    }

    async getDoctorAll() {
        return this.db.raw(`
            SELECT
                d.code doctor_code,
                d.name AS doctor_name,
                d.licenseno, 
                o.groupname
            FROM doctor AS d
                LEFT JOIN opduser AS o ON d.code = o.doctorcode
            WHERE d.active <> 'N'
                AND o.account_disable = 'N'
                AND (d.licenseno <> '' AND (d.licenseno LIKE 'ว%' OR d.licenseno LIKE 'ท%'))
                AND o.groupname <> ''
            ORDER BY d.name ASC
            `)
    }
    
    async getDrugItemAll() {
        return this.db("drugitems AS d")
            .select("d.icode",
                this.db.raw(
                    `CONCAT(d.name," ", d.strength, " ", d.units, " ", d.dosageform) as "drugName"`
                )
            )
            .where("d.istatus", "Y")
            .orderBy("d.name")
    }

    async getPatientInfo(hn: string) {
        return this.db.raw(`
            (SELECT 
                p.hn, 
                null AS an, 
                CONCAT(p.pname, p.fname, ' ', p.lname) AS patient_name
            FROM patient AS p
            WHERE p.hn = LPAD('${hn}', 9, '0')LIMIT 1)
            UNION
            (SELECT p.hn, i.an, CONCAT(p.pname, p.fname, ' ', p.lname) AS patient_name
            FROM ipt AS i
                JOIN patient AS p ON p.hn = i.hn
            WHERE i.an = '${hn}' LIMIT 1) LIMIT 1`)  
    }
}