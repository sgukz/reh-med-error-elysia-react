import { Knex } from "knex";

export default class DashboardModel {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async getFiscalYearFromMedError() {
    return this.db('med_error')
      .select(
        this.db.raw('YEAR(error_date) + 543 AS error_year')
      )
      .groupByRaw('YEAR(error_date)')
      .orderBy('error_year', 'desc');

  }

  async getSummaryFromMedError(firstDate: Date, lastDate: Date): Promise<any[]> {
    return this.db("med_error")
      .select(
        this.db.raw(`
      CASE 
        WHEN MONTH(error_date) >= 10 
          THEN YEAR(error_date) + 544
        ELSE YEAR(error_date) + 543
      END AS fiscal_year_buddhist
    `),
        this.db.raw('COUNT(*) AS total_errors'),
        this.db.raw('COUNT(CASE WHEN error_type = 1 THEN 1 END) AS prescription_error'),
        this.db.raw('COUNT(CASE WHEN error_type = 2 THEN 1 END) AS dispensing_error'),
        this.db.raw('COUNT(CASE WHEN error_type = 3 THEN 1 END) AS pre_admin_error'),
        this.db.raw('COUNT(CASE WHEN error_type = 4 THEN 1 END) AS admin_error'),
        this.db.raw('COUNT(CASE WHEN error_type = 5 THEN 1 END) AS processing_error')
      )
      .whereBetween('error_date', [firstDate, lastDate]) // ✅ Filter by date range
      .groupByRaw(`
    CASE 
      WHEN MONTH(error_date) >= 10 
        THEN YEAR(error_date) + 544
      ELSE YEAR(error_date) + 543
    END
  `)
      .orderBy('fiscal_year_buddhist', 'desc');
  }

  async getErrorSummary(
    startDate?: string | Date,
    endDate?: string | Date
  ) {
    // // ฟังก์ชันช่วยเพิ่มเงื่อนไข WHERE error_date BETWEEN startDate AND endDate
    // const applyDateFilter = (query: any) => {
    //   if (startDate && endDate) {
    //     query.whereBetween('error_date', [startDate, endDate]);
    //   }
    // };

    const subquery1 = this.db('med_error_level as el')
      .leftJoin('med_error as me', function () {
        this.on('me.error_level', '=', 'el.med_error_level_code');
        if (startDate && endDate) {
          this.andOnBetween('me.error_date', [startDate, endDate]);
        }
      })
      .leftJoin('med_error_type as et', 'me.error_type', 'et.error_type')
      .select('el.med_error_level_code as error_level')
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 1 AND me.error_alert = 'High Alert Drugs' THEN 1 END),0) AS prescription_had`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 1 AND me.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END),0) AS prescription_nonhad`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 1 THEN 1 END),0) AS prescription_total`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 2 AND me.error_alert = 'High Alert Drugs' THEN 1 END),0) AS dispensing_had`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 2 AND me.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END),0) AS dispensing_nonhad`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 2 THEN 1 END),0) AS dispensing_total`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 3 AND me.error_alert = 'High Alert Drugs' THEN 1 END),0) AS preadmin_had`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 3 AND me.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END),0) AS preadmin_nonhad`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 3 THEN 1 END),0) AS preadmin_total`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 4 AND me.error_alert = 'High Alert Drugs' THEN 1 END),0) AS admin_had`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 4 AND me.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END),0) AS admin_nonhad`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 4 THEN 1 END),0) AS admin_total`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 5 AND me.error_alert = 'High Alert Drugs' THEN 1 END),0) AS processing_had`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 5 AND me.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END),0) AS processing_nonhad`))
      .select(this.db.raw(`COALESCE(COUNT(CASE WHEN et.error_type = 5 THEN 1 END),0) AS processing_total`))
      .select(this.db.raw(`COALESCE(COUNT(me.error_id), 0) AS total_all`))
      .groupBy('el.med_error_level_code');

    // Subquery 2 (รวมทั้งหมด)
    const subquery2 = this.db('med_error as me')
      .modify((query) => {
        if (startDate && endDate) {
          query.whereBetween('me.error_date', [startDate, endDate]);
        }
      })
      .select(this.db.raw(`'TOTAL' as error_level`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 1 AND error_alert = 'High Alert Drugs' THEN 1 END) AS prescription_had`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 1 AND error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS prescription_nonhad`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 1 THEN 1 END) AS prescription_total`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 2 AND error_alert = 'High Alert Drugs' THEN 1 END) AS dispensing_had`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 2 AND error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS dispensing_nonhad`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 2 THEN 1 END) AS dispensing_total`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 3 AND error_alert = 'High Alert Drugs' THEN 1 END) AS preadmin_had`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 3 AND error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS preadmin_nonhad`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 3 THEN 1 END) AS preadmin_total`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 4 AND error_alert = 'High Alert Drugs' THEN 1 END) AS admin_had`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 4 AND error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS admin_nonhad`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 4 THEN 1 END) AS admin_total`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 5 AND error_alert = 'High Alert Drugs' THEN 1 END) AS processing_had`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 5 AND error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) AS processing_nonhad`))
      .select(this.db.raw(`COUNT(CASE WHEN error_type = 5 THEN 1 END) AS processing_total`))
      .select(this.db.raw(`COUNT(*) AS total_all`));

    // Union ทั้งสอง subquery
    const unionQuery = this.db
      .select('*').from(subquery1.as('t1'))
      .unionAll([subquery2], true)  // true เพื่อ wrap subquery2 ด้วยวงเล็บ
      .orderByRaw(`CASE WHEN error_level = 'TOTAL' THEN 999 ELSE ASCII(error_level) END`);

    // const results = await unionQuery;

    // return results as ResultRow[];
    return unionQuery
  }

}