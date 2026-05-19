export interface GetMedErrorSummary1Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    depCode?: string;  // ถ้าระบุ จะ filter ด้วย error_ward
}

export interface GetMedErrorSummary2Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    depCode?: string | string[];  // ถ้าระบุ จะ filter ด้วย error_ward
}

export interface GetMedErrorSummary3Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    depCode?: string | string[];  // ถ้าระบุ จะ filter ด้วย error_ward
}

export interface GetMedErrorSummary7Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
}

// รายงานแยกรายละเอียด Error — subtype detail + Impact + Likelihood + Level
// รองรับเปรียบเทียบ 2 ช่วงเวลา (Period A + Period B optional)
export interface GetMedErrorSummary9Options {
    firstDateA: string; // YYYY-MM-DD — Period A เริ่มต้น (required)
    lastDateA: string;  // YYYY-MM-DD — Period A สิ้นสุด (required)
    firstDateB?: string; // YYYY-MM-DD — Period B เริ่มต้น (optional, สำหรับ compare)
    lastDateB?: string;  // YYYY-MM-DD — Period B สิ้นสุด
    errorType: string | number; // 1-6 (required)
}

export interface Summary9Row {
    type_id: number;
    error_type: number;
    error_type_list: string;
    error_type_list_detail: string;
    impact_score: number | null;
    likelihood_score: number | null;
    had_a: number;
    non_had_a: number;
    total_a: number;
    had_b?: number;
    non_had_b?: number;
    total_b?: number;
}

export interface GetMedErrorSummary8Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    depCode?: string | string[];
    errorLevel?: string | string[];
    errorType?: string;
    errorAlert?: string;

}

// คู่ยาที่คลาดเคลื่อน — ใช้กับ /reports/drug-pair-summary
export interface GetDrugPairReportOptions {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    pairType: 'dispensing' | 'processing'; // dispensing=type 2 (จัด), processing=type 5 (คีย์)
}

export interface DrugPairRow {
    drug_right: string;
    drug_wrong: string;
    count: number;
}

// รายงานสรุปอุบัติการณ์ที่ได้ RCA แล้ว — Summary6
export interface GetMedErrorSummary6Options {
    dateStart: string;  // YYYY-MM-DD
    dateEnd: string;    // YYYY-MM-DD
    errorType?: string | number;  // 0 = ทั้งหมด, 1-6 = filter
}

export interface Summary6Row {
    error_id: number;
    error_section: number;
    error_date: string;
    error_time: string;
    error_ward_name: string;
    error_event: string;
    error_level: string;
    error_level_detail: string;
    error_clear: string;
    error_analysis: string;
    error_type: number;
    error_type_name: string;
    error_type_detail: string;
    error_alert: string;
    error_doctor: string;
    error_user_name: string;
    is_rca: string;
    rca_text: string;
    rca_by: string;
    updated_rca: string;
    rca_days: number | null;
}

export interface Summary6Stats {
    total: number;
    levelEPlus: number;
    hadCount: number;
    avgRcaDays: number;
    topErrorType: string;
    topWard: string;
}

// รายงานสถิติจำนวนใบสั่งยา (OPD) / วันนอน (IPD) — Summary10
export interface GetMedErrorSummary10Options {
    fiscalYear: string | number; // ปี พ.ศ. (e.g. 2567) — backend converts to CE range
}

// ข้อมูลจำนวนวันนอน/ใบสั่งยาที่แอดมินกรอก
export interface StatVolumeRow {
    stat_id?: number;
    stat_year: number;   // ปี ค.ศ.
    stat_month: number;  // 1-12
    ipd_patient_days: number;
    opd_prescriptions: number;
    updated_by?: string;
    updated_at?: string;
}

export interface StatVolumeUpsertBody {
    fiscalYear: number;  // ปี พ.ศ.
    rows: Array<{
        stat_month: number;
        ipd_patient_days: number;
        opd_prescriptions: number;
    }>;
    updated_by?: string;
}