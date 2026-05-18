//Type Doctor Data list
export interface DoctorData {
    doctor_code: string,
    doctor_name: string,
    licenseno: string,
    groupname: string
}


// Type DrugItem Data list
export interface DrugItemData {
    icode: string,
    drugName: string
}

// กำหนด Type ของข้อมูลที่ส่งมาใน Request
export interface TypeError {
    sec: number;
    id: number;
}

export interface TypeErrorList {
    id: number;
}

//Type 
export interface PersonData {
    error_key_person_id: number,
    error_key_person_name: string,
    error_key_sec: number,

}

//Type Create Error
export interface TypeErrorListCreate {
    error_type: number,
    error_type_list: string
    error_type_list_detail: string
    is_active: "Y" | "N",
    type_id: number | undefined | null,
    impact_score: number | null,
    likelihood_score: number | null
}

//Type Create Error
export interface TypeErrorListDelete {
    type_id: number
}

//Type Create Person
export interface PersonCreate {
    error_key_person_id: number | undefined | null
    error_key_person_name: string,
    error_key_sec: number
}

//Type Create Error
export interface PersonDelete {
    error_key_person_id: number
}

//Type Department Response
export interface DepartmentData {
    med_error_depcode: number,
    med_error_depname: string,
    med_error_dep_group_id: number;
    med_error_dep_group_detail: number;
    med_error_is_active: number,
}

//Type Department query params
export interface DepartmentQuery {
    med_error_section: number | undefined,
    med_error_is_active: number | undefined,
}

//Type Department Create
export interface DepartmentCreate {
    med_error_depcode: number,
    med_error_depname: string,
    med_error_dep_group_id: number
    med_error_is_active: 'Y' | 'N',
}

//Type Department Delete
export interface DepartmentDelete {
    med_error_depcode: number,
}

//Type Analysis Response & Create
export interface AnalysisData {
    error_analysis_id: number,
    error_analysis_name: string,
    is_active: 'Y' | 'N'
}

//Type Analysis Query
export interface AnalysisQuery {
    is_active: 'Y' | 'N',
}

//Type Analysis Delete
export interface AnalysisDelete {
    error_analysis_id: number,
}

// Type Create Med error 
export interface MedErrorCreate {
    updated_rca?: Date;
    error_id: number;
    error_section: number;
    error_datetime: Date; // ISO 8601 format
    error_date: string; // YYYY-MM-DD format
    error_user: string;
    error_user_name: string;
    error_time: string;
    error_ward: number;
    error_ward_name: string;
    error_event: string;
    error_level: string;
    error_level_detail: string;
    error_clear: string;
    error_analysis_id: number;
    error_analysis: string;
    error_type: string;
    error_type_name: string;
    error_prescription_ward: string;
    error_prescription_ward_code: string;
    error_doctor_code: string;
    error_doctor: string;
    error_prescription: string;
    error_processing: string;
    error_processing_ward: string;
    error_processing_ward_code: string;
    error_dispensing: string;
    error_dispensing_ward: string;
    error_dispensing_ward_code: number;
    error_pre_administration: string;
    error_pre_administration_ward: string;
    error_pre_administration_ward_code: string;
    error_prescription_right: string;
    error_prescription_wrong: string;
    error_processing_right: string;
    error_processing_wrong: string;
    error_adminstration: string;
    error_adminstration_ward: string;
    error_adminstration_ward_code: string;
    error_dispensing_person: string;
    error_key_person: string;
    error_processing_person: string;
    error_alert: string;
    hn: string;
    an: string;
    app_new: string;
    error_level_old?: string
}

// Type Med Error data list
export interface MedErrorDataList {
    error_id: number;
    error_section: number;
    error_datetime: string; // ISO 8601 format
    error_date: string; // YYYY-MM-DD format
    error_user: string;
    error_user_name: string;
    error_time: string;
    error_ward: number;
    error_ward_name: string;
    error_event: string;
    error_level: string;
    error_level_detail: string;
    error_clear: string;
    error_analysis_id: number;
    error_analysis: string;
    error_type: string;
    error_type_name: string;
    error_prescription_ward: string;
    error_prescription_ward_code: string;
    error_doctor_code: string;
    error_doctor: string;
    error_prescription: string;
    error_processing: string;
    error_processing_ward: string;
    error_processing_ward_code: string;
    error_dispensing: string;
    error_dispensing_ward: string;
    error_dispensing_ward_code: number;
    error_pre_administration: string;
    error_pre_administration_ward: string;
    error_pre_administration_ward_code: string;
    error_prescription_right: string;
    error_prescription_wrong: string;
    error_processing_right: string;
    error_processing_wrong: string;
    error_adminstration: string;
    error_adminstration_ward: string;
    error_adminstration_ward_code: string;
    error_dispensing_person: string;
    error_key_person: string;
    error_processing_person: string;
    error_dispensing_person_name: string;
    error_key_person_name: string;
    error_processing_person_name: string;
    error_alert: string;
    hn: string;
    an: string;
    app_new: string;
    error_type_detail: string
}

//Type MedError Query
export type MedErrerQuery = {
    error_user?: string;
    error_id?: string;
    dateStart?: string;
    dateEnd?: string;
}

//Type MedError Delete
export interface MedErrorDelete {
    error_id: number,
}

//Type MedError Edit RCA
export interface MedErrorUpdateRCA {
    error_id: number,
    is_rca: 'Y' | 'N'
    rca_text: string;
    rca_by: string;
}

// Type Save log
export interface SaveLog {
    log_id: number,
    service_channel: string,
    mode_env: 'SIT' | 'UAT' | 'PROD',
    endpoint: string,
    req_body: string,
    res_data: string,
    res_status: 200 | 201 | 400 | 401 | 403 | 404 | 500,
    service_version: string,
    client_ip: string,
    log_datetime: string,
}

// Type Query Patient information from HIS
export interface PatientInfoQuery {
    hn: string
}