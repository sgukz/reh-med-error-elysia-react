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

export interface GetMedErrorSummary9Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    errorType?: string; // 1-6
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