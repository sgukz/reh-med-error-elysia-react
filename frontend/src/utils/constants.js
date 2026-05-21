const API_BASE = process.env.REACT_APP_API_URL;

export const API_ROUTE = {
  AUTH: `${API_BASE}/auth/login`,
  REFRESH: `${API_BASE}/auth/refresh`,
  PROFILE: `${API_BASE}/auth/profile`,
  LOGOUT: `${API_BASE}/auth/logout`,
  DOCTOR_ALL: `${API_BASE}/med-error/doctor`,
  PERSON_ALL: `${API_BASE}/med-error/person`,
  DRUGITEM_ALL: `${API_BASE}/med-error/drugitems`,
  MEDERROR: `${API_BASE}/med-error/med-error`,
  DEPARTMENT: `${API_BASE}/med-error/get-dept`,
  DEPARTMENT_CREATE: `${API_BASE}/med-error/create-dept`,
  DEPARTMENT_DELETE: `${API_BASE}/med-error/delete-dept`,
  PERSON_CREATE: `${API_BASE}/med-error/create-person`,
  PERSON_DELETE: `${API_BASE}/med-error/delete-person`,
  ERROR_TYPE: `${API_BASE}/med-error/get-error-type`,
  ERROR_TYPE_LIST: `${API_BASE}/med-error/get-error-type-list`,
  ERROR_TYPE_LIST_CREATE: `${API_BASE}/med-error/create-error-type-list`,
  ERROR_TYPE_LIST_DELETE: `${API_BASE}/med-error/delete-error-type-list`,
  ANALYSIS: `${API_BASE}/med-error/get-analysis`,
  ANALYSIS_CREATE: `${API_BASE}/med-error/create-analysis`,
  ANALYSIS_DELETE: `${API_BASE}/med-error/delete-analysis`,
  PATIENT_INFO: `${API_BASE}/med-error/get-patient-info`,
  DASHBOARD_MEDERROR: `${API_BASE}/med-error/dashboard/mederror`,
  REPORT_MEDERROR: `${API_BASE}/med-error/reports`,
  LIKELIHOOD: `${API_BASE}/med-error/likelihood`,
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
