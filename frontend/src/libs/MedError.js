import axios from 'axios';
import _ from 'lodash';
import { API_ROUTE, CLIENT, API_SECURITY, API_METHOD } from '../utils/constants';

export function getMedErrorDeptBySectionMain(token, active) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.DEPARTMENT}?med_error_section=1&med_error_is_active=${active}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function getMedErrorDeptBySection(token, active) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.DEPARTMENT}?med_error_is_active=${active}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function getKSKDepartmentAndWard(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.DEPARTMENT_AND_WARD_ALL}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function getMedErrorDeptAll(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.DEPARTMENT}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function deptCreate(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'POST',
      url: API_ROUTE.DEPARTMENT_CREATE,
      headers: header,
      data: formData,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function deptDelete(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const deptId = formData !== undefined ? `?med_error_depcode=${formData}` : '';
    const response = axios({
      method: 'DELETE',
      url: `${API_ROUTE.DEPARTMENT_DELETE}${deptId}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function getDoctorAll(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: API_ROUTE.DOCTOR_ALL,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function getMedErrorPerson(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: API_ROUTE.PERSON_ALL,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function personCreate(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'POST',
      url: API_ROUTE.PERSON_CREATE,
      headers: header,
      data: formData,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function personDelete(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const personId = formData !== undefined ? `?error_key_person_id=${formData}` : '';
    const response = axios({
      method: 'delete',
      url: `${API_ROUTE.PERSON_DELETE}${personId}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function getDrugItems(token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: API_ROUTE.DRUGITEM_ALL,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function medErrorCreate(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const response = axios({
      method: API_METHOD.POST,
      url: API_ROUTE.MEDERROR,
      headers: header,
      data: formData,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function medErrorDelete(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const errorId = formData !== undefined ? `?error_id=${formData}` : '';
    const response = axios({
      method: API_METHOD.DELETE,
      url: `${API_ROUTE.MEDERROR}${errorId}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function medError(token, user = '', dateStart = '', dateEnd = '') {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const params = new URLSearchParams();

    if (user) params.append('error_user', user);
    if (dateStart) params.append('dateStart', dateStart);
    if (dateEnd) params.append('dateEnd', dateEnd);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = axios({
      method: API_METHOD.GET,
      url: `${API_ROUTE.MEDERROR}${queryString}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function medErrorById(token, id) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.MEDERROR_ALL}?error_id=${id}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function getErrorTypeByType(token, types) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const sec = types !== undefined ? `?sec=${types}` : '';
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.ERROR_TYPE}${sec}`,
      headers: header,
    });
    return response;
  } catch (error) {
    return error;
  }
}

export function getErrorTypeByTypeList(token, errorType) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const id = errorType !== undefined ? `?id=${errorType}` : '';
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.ERROR_TYPE_LIST}${id}`,
      headers: header,
    });
    return response;
  } catch (error) {
    return error;
  }
}

export function errorTypeListCreate(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'POST',
      url: API_ROUTE.ERROR_TYPE_LIST_CREATE,
      headers: header,
      data: formData,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function errorTypeListDelete(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const typeId = formData !== undefined ? `?type_id=${formData}` : '';
    const response = axios({
      method: 'delete',
      url: `${API_ROUTE.ERROR_TYPE_LIST_DELETE}${typeId}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function getAnalysisData(token, active) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const isActive = active !== undefined ? `?is_active=Y` : '';
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.ANALYSIS}${isActive}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return JSON.stringify(error);
  }
}

export function analysisCreate(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'POST',
      url: API_ROUTE.ANALYSIS_CREATE,
      headers: header,
      data: formData,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function analysisDelete(formData, token) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const analysisId = formData !== undefined ? `?error_analysis_id=${formData}` : '';
    const response = axios({
      method: 'DELETE',
      url: `${API_ROUTE.ANALYSIS_DELETE}${analysisId}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function getPatientInfo(token, hn) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };
    const response = axios({
      method: 'GET',
      url: `${API_ROUTE.PATIENT_INFO}?hn=${hn}`,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

export function getSummaryFromMedError(token, range) {
  const header = {
    'Content-Type': 'application/json',
    'client-id': API_SECURITY.UUID,
    Authorization: `Bearer ${token}`,
  };

  return axios.get(API_ROUTE.DASHBOARD_MEDERROR, {
    headers: header,
    params: {
      firstDate: range?.firstDate,
      lastDate: range?.lastDate,
    },
  });
}

// Using with ReportSummary1
export function getReportSummary1(token, startAndEndDateOrDepcode) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { firstDate, lastDate, depCode } = startAndEndDateOrDepcode ?? {};

    const queryParams = new URLSearchParams();
    if (firstDate) queryParams.append('firstDate', firstDate);
    if (lastDate) queryParams.append('lastDate', lastDate);
    if (depCode) queryParams.append('depCode', depCode); // เพิ่มเฉพาะเมื่อมีค่า

    const url = `${API_ROUTE.REPORT_MEDERROR}/summary1?${queryParams.toString()}`;

    const response = axios({
      method: 'GET',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

// Using with ReportSummary2
export function getReportSummary2(token, startAndEndDateOrDepcode) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { firstDate, lastDate, depCode } = startAndEndDateOrDepcode ?? {};

    const queryParams = new URLSearchParams();
    if (firstDate) queryParams.append('firstDate', firstDate);
    if (lastDate) queryParams.append('lastDate', lastDate);
    if (depCode) queryParams.append('depCode', depCode); // เพิ่มเฉพาะเมื่อมีค่า

    const url = `${API_ROUTE.REPORT_MEDERROR}/summary2?${queryParams.toString()}`;

    const response = axios({
      method: 'GET',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

// Using with ReportSummary3
export function getReportSummary3(token, startAndEndDateOrDepcode) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { firstDate, lastDate, depCode } = startAndEndDateOrDepcode ?? {};

    const queryParams = new URLSearchParams();
    if (firstDate) queryParams.append('firstDate', firstDate);
    if (lastDate) queryParams.append('lastDate', lastDate);
    if (depCode) queryParams.append('depCode', depCode); // เพิ่มเฉพาะเมื่อมีค่า

    const url = `${API_ROUTE.REPORT_MEDERROR}/summary3?${queryParams.toString()}`;

    const response = axios({
      method: 'GET',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

// Using with ReportSummary5
export function getReportSummary5(token, startAndEndDateOrDepcode) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { firstDate, lastDate, depCode } = startAndEndDateOrDepcode ?? {};

    const queryParams = new URLSearchParams();
    if (firstDate) queryParams.append('firstDate', firstDate);
    if (lastDate) queryParams.append('lastDate', lastDate);
    if (depCode) queryParams.append('depCode', depCode); // เพิ่มเฉพาะเมื่อมีค่า

    const url = `${API_ROUTE.REPORT_MEDERROR}/summary5?${queryParams.toString()}`;

    const response = axios({
      method: 'GET',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

// Using with ReportSummary7
export function getReportSummary7(token, startAndEndDateOrDepcode) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { firstDate, lastDate } = startAndEndDateOrDepcode ?? {};

    const queryParams = new URLSearchParams();
    if (firstDate) queryParams.append('firstDate', firstDate);
    if (lastDate) queryParams.append('lastDate', lastDate);

    const url = `${API_ROUTE.REPORT_MEDERROR}/summary7?${queryParams.toString()}`;

    const response = axios({
      method: 'GET',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

// Using with ReportSummary8
export function getReportSummary8(token, Conditional) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { firstDate, lastDate, depCode, errorType, errorLevel, errorAlert } = Conditional ?? {};

    const errorTypeCode = errorType !== undefined ? errorType : '';
    const queryParams = new URLSearchParams();
    if (firstDate) queryParams.append('firstDate', firstDate);
    if (lastDate) queryParams.append('lastDate', lastDate);
    if (depCode) queryParams.append('depCode', depCode);
    if (errorLevel) queryParams.append('errorLevel', errorLevel);
    queryParams.append('errorType', errorTypeCode);
    queryParams.append('errorAlert', errorAlert);

    const url = `${API_ROUTE.REPORT_MEDERROR}/summary8?${queryParams.toString()}`;

    const response = axios({
      method: 'GET',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}

// Using with UpdateRCA
export function updateRCA(token, dateObject) {
  try {
    const header = {
      'Content-Type': 'application/json',
      'client-id': API_SECURITY.UUID,
      Authorization: `Bearer ${token}`,
    };

    const { error_id, is_rca, rca_text, rca_by } = dateObject ?? {};

    const queryParams = new URLSearchParams();
    if (error_id) queryParams.append('error_id', error_id);
    if (is_rca) queryParams.append('is_rca', is_rca);
    if (rca_text) queryParams.append('rca_text', rca_text);
    if (rca_text) queryParams.append('rca_text', rca_text);
    if (rca_by) queryParams.append('rca_by', rca_by);

    const url = `${API_ROUTE.MEDERROR}?${queryParams.toString()}`;

    const response = axios({
      method: 'PUT',
      url,
      headers: header,
    });

    return response;
  } catch (error) {
    return error;
  }
}
