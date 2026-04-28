import axios from 'axios';
import { API_ROUTE, API_SECURITY, API_METHOD } from '../utils/constants';

function authHeader(token) {
  return {
    'Content-Type': 'application/json',
    'client-id': API_SECURITY.UUID,
    Authorization: `Bearer ${token}`,
  };
}

export function getMedErrorDeptBySectionMain(token, active) {
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.DEPARTMENT}?med_error_section=1&med_error_is_active=${active}`,
    headers: authHeader(token),
  });
}

export function getMedErrorDeptBySection(token, active) {
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.DEPARTMENT}?med_error_is_active=${active}`,
    headers: authHeader(token),
  });
}

export function getMedErrorDeptAll(token) {
  return axios({
    method: API_METHOD.GET,
    url: API_ROUTE.DEPARTMENT,
    headers: authHeader(token),
  });
}

export function deptCreate(formData, token) {
  return axios({
    method: API_METHOD.POST,
    url: API_ROUTE.DEPARTMENT_CREATE,
    headers: authHeader(token),
    data: formData,
  });
}

export function deptDelete(formData, token) {
  const deptId = formData !== undefined ? `?med_error_depcode=${formData}` : '';
  return axios({
    method: API_METHOD.DELETE,
    url: `${API_ROUTE.DEPARTMENT_DELETE}${deptId}`,
    headers: authHeader(token),
  });
}

export function getDoctorAll(token) {
  return axios({
    method: API_METHOD.GET,
    url: API_ROUTE.DOCTOR_ALL,
    headers: authHeader(token),
  });
}

export function getMedErrorPerson(token) {
  return axios({
    method: API_METHOD.GET,
    url: API_ROUTE.PERSON_ALL,
    headers: authHeader(token),
  });
}

export function personCreate(formData, token) {
  return axios({
    method: API_METHOD.POST,
    url: API_ROUTE.PERSON_CREATE,
    headers: authHeader(token),
    data: formData,
  });
}

export function personDelete(formData, token) {
  const personId = formData !== undefined ? `?error_key_person_id=${formData}` : '';
  return axios({
    method: API_METHOD.DELETE,
    url: `${API_ROUTE.PERSON_DELETE}${personId}`,
    headers: authHeader(token),
  });
}

export function getDrugItems(token) {
  return axios({
    method: API_METHOD.GET,
    url: API_ROUTE.DRUGITEM_ALL,
    headers: authHeader(token),
  });
}

export function medErrorCreate(formData, token) {
  return axios({
    method: API_METHOD.POST,
    url: API_ROUTE.MEDERROR,
    headers: authHeader(token),
    data: formData,
  });
}

export function medErrorDelete(formData, token) {
  const errorId = formData !== undefined ? `?error_id=${formData}` : '';
  return axios({
    method: API_METHOD.DELETE,
    url: `${API_ROUTE.MEDERROR}${errorId}`,
    headers: authHeader(token),
  });
}

export function medError(token, user = '', dateStart = '', dateEnd = '') {
  const params = new URLSearchParams();
  if (user) params.append('error_user', user);
  if (dateStart) params.append('dateStart', dateStart);
  if (dateEnd) params.append('dateEnd', dateEnd);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.MEDERROR}${queryString}`,
    headers: authHeader(token),
  });
}

export function getErrorTypeByType(token, types) {
  const sec = types !== undefined ? `?sec=${types}` : '';
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.ERROR_TYPE}${sec}`,
    headers: authHeader(token),
  });
}

export function getErrorTypeByTypeList(token, errorType) {
  const id = errorType !== undefined ? `?id=${errorType}` : '';
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.ERROR_TYPE_LIST}${id}`,
    headers: authHeader(token),
  });
}

export function errorTypeListCreate(formData, token) {
  return axios({
    method: API_METHOD.POST,
    url: API_ROUTE.ERROR_TYPE_LIST_CREATE,
    headers: authHeader(token),
    data: formData,
  });
}

export function errorTypeListDelete(formData, token) {
  const typeId = formData !== undefined ? `?type_id=${formData}` : '';
  return axios({
    method: API_METHOD.DELETE,
    url: `${API_ROUTE.ERROR_TYPE_LIST_DELETE}${typeId}`,
    headers: authHeader(token),
  });
}

export function getAnalysisData(token, active) {
  const isActive = active !== undefined ? `?is_active=Y` : '';
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.ANALYSIS}${isActive}`,
    headers: authHeader(token),
  });
}

export function analysisCreate(formData, token) {
  return axios({
    method: API_METHOD.POST,
    url: API_ROUTE.ANALYSIS_CREATE,
    headers: authHeader(token),
    data: formData,
  });
}

export function analysisDelete(formData, token) {
  const analysisId = formData !== undefined ? `?error_analysis_id=${formData}` : '';
  return axios({
    method: API_METHOD.DELETE,
    url: `${API_ROUTE.ANALYSIS_DELETE}${analysisId}`,
    headers: authHeader(token),
  });
}

export function getPatientInfo(token, hn) {
  return axios({
    method: API_METHOD.GET,
    url: `${API_ROUTE.PATIENT_INFO}?hn=${hn}`,
    headers: authHeader(token),
  });
}

export function getSummaryFromMedError(token, range) {
  return axios.get(API_ROUTE.DASHBOARD_MEDERROR, {
    headers: authHeader(token),
    params: {
      firstDate: range?.firstDate,
      lastDate: range?.lastDate,
    },
  });
}

function buildReportSummary(path) {
  return (token, conditions = {}) => {
    const params = new URLSearchParams();
    Object.entries(conditions).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });
    const url = `${API_ROUTE.REPORT_MEDERROR}/${path}${params.toString() ? `?${params.toString()}` : ''}`;
    return axios({
      method: API_METHOD.GET,
      url,
      headers: authHeader(token),
    });
  };
}

export const getReportSummary1 = buildReportSummary('summary1');
export const getReportSummary2 = buildReportSummary('summary2');
export const getReportSummary3 = buildReportSummary('summary3');
export const getReportSummary5 = buildReportSummary('summary5');
export const getReportSummary7 = buildReportSummary('summary7');

// summary8 มีพารามิเตอร์ extra ที่ต้องส่งแม้ค่าว่างเพื่อ backend
export function getReportSummary8(token, conditional) {
  const { firstDate, lastDate, depCode, errorType, errorLevel, errorAlert } = conditional ?? {};
  const params = new URLSearchParams();
  if (firstDate) params.append('firstDate', firstDate);
  if (lastDate) params.append('lastDate', lastDate);
  if (depCode) params.append('depCode', depCode);
  if (errorLevel) params.append('errorLevel', errorLevel);
  params.append('errorType', errorType ?? '');
  params.append('errorAlert', errorAlert ?? '');
  const url = `${API_ROUTE.REPORT_MEDERROR}/summary8?${params.toString()}`;
  return axios({
    method: API_METHOD.GET,
    url,
    headers: authHeader(token),
  });
}

export function updateRCA(token, dataObject) {
  const { error_id, is_rca, rca_text, rca_by } = dataObject ?? {};
  const params = new URLSearchParams();
  if (error_id) params.append('error_id', error_id);
  if (is_rca) params.append('is_rca', is_rca);
  if (rca_text) params.append('rca_text', rca_text);
  if (rca_by) params.append('rca_by', rca_by);
  return axios({
    method: API_METHOD.PUT,
    url: `${API_ROUTE.MEDERROR}?${params.toString()}`,
    headers: authHeader(token),
  });
}
