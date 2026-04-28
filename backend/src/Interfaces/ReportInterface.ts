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

export interface GetMedErrorSummary8Options {
    firstDate: string; // YYYY-MM-DD
    lastDate: string;   // YYYY-MM-DD
    depCode?: string | string[];
    errorLevel?: string | string[];
    errorType?: string;
    errorAlert?: string;

}