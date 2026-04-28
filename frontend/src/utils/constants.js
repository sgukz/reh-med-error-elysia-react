export const API_ROUTE = {
  AUTH: `${process.env.REACT_APP_API_URL}/auth/login`,
  REFRESH: `${process.env.REACT_APP_API_URL}/auth/refresh`,
  PROFILE: `${process.env.REACT_APP_API_URL}/auth/profile`,
  VERIFY: `${process.env.REACT_APP_API_URL}/auth/verify`,
  DEPARTMENT_AND_WARD_ALL: `${process.env.REACT_APP_API_URL}/medError/getKSKDepartmentAndWard`,
  DOCTOR_ALL: `${process.env.REACT_APP_API_URL}/med-error/doctor`,
  PERSON_ALL: `${process.env.REACT_APP_API_URL}/med-error/person`,
  DRUGITEM_ALL: `${process.env.REACT_APP_API_URL}/med-error/drugitems`,
  MEDERROR: `${process.env.REACT_APP_API_URL}/med-error/med-error`,
  DEPARTMENT: `${process.env.REACT_APP_API_URL}/med-error/get-dept`,
  DEPARTMENT_CREATE: `${process.env.REACT_APP_API_URL}/med-error/create-dept`,
  DEPARTMENT_DELETE: `${process.env.REACT_APP_API_URL}/med-error/delete-dept`,
  PERSON_CREATE: `${process.env.REACT_APP_API_URL}/med-error/create-person`,
  PERSON_DELETE: `${process.env.REACT_APP_API_URL}/med-error/delete-person`,
  ERROR_TYPE: `${process.env.REACT_APP_API_URL}/med-error/get-error-type`,
  ERROR_TYPE_LIST: `${process.env.REACT_APP_API_URL}/med-error/get-error-type-list`,
  ERROR_TYPE_LIST_CREATE: `${process.env.REACT_APP_API_URL}/med-error/create-error-type-list`,
  ERROR_TYPE_LIST_UPDATE: `${process.env.REACT_APP_API_URL}/med-error/update-error-type-list`,
  ERROR_TYPE_LIST_DELETE: `${process.env.REACT_APP_API_URL}/med-error/delete-error-type-list`,
  ANALYSIS: `${process.env.REACT_APP_API_URL}/med-error/get-analysis`,
  ANALYSIS_CREATE: `${process.env.REACT_APP_API_URL}/med-error/create-analysis`,
  ANALYSIS_DELETE: `${process.env.REACT_APP_API_URL}/med-error/delete-analysis`,
  PATIENT_INFO: `${process.env.REACT_APP_API_URL}/med-error/get-patient-info`,
  DASHBOARD_MEDERROR: `${process.env.REACT_APP_API_URL}/med-error/dashboard/mederror`,
  REPORT_MEDERROR: `${process.env.REACT_APP_API_URL}/med-error/reports`,
};

export const API_SECURITY = {
  UUID: process.env.REACT_APP_CLIENT_ID,
};

export const CLIENT = {
  ID: process.env.REACT_APP_CLIENT_ID,
  TOKEN: process.env.REACT_APP_CLIENT_TOKEN,
};

export const API_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};
