import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

import _ from 'lodash';
import Iconify from '../../components/iconify';
import {
  getMedErrorDeptBySection,
  getDoctorAll,
  medErrorCreate,
  getErrorTypeByType,
  getErrorTypeByTypeList,
  getAnalysisData,
  getMedErrorPerson,
  getDrugItems,
  getMedErrorDeptBySectionMain,
  medErrorById,
} from '../../libs/MedError';
import { MedErrorLevel } from '../../data/DataMedError';
import { verifyToken } from '../../libs/Auth';

import { useAuth } from '../../contexts/AuthContext';

function formatDate(date) {
  const formatDate = new Date(date);
  const toTwoDigits = (num) => (num < 10 ? `0${num}` : num);
  return `${formatDate.getFullYear()}-${toTwoDigits(formatDate.getMonth() + 1)}-${toTwoDigits(formatDate.getDate())}`;
}

function popKeys(obj, keys) {
  const removed = {};

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      removed[key] = obj[key];
      delete obj[key];
    }
  });

  return removed;
}

const color = red[500];
const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', MySwal.stopTimer);
    toast.addEventListener('mouseleave', MySwal.resumeTimer);
  },
});

// MedErrorForm.propTypes = {
//   medError: PropTypes.array,
// };

const d = new Date();

export default function MedErrorForm({ userLogin }) {
  const [searchParams] = useSearchParams();
  const ac = searchParams.get('ac'); // จะได้เป็น string

  const id = ac ? +ac : null; // แปลงเป็น number ถ้ามีค่า
  const navigate = useNavigate();
  const auth = useAuth();
  const [user, setUser] = useState(userLogin);

  const [page, setPage] = useState('');
  const [value, setValue] = useState(dayjs(new Date()));
  const [department, setDepartment] = useState([
    {
      med_error_depcode: '',
      med_error_depname: '',
    },
  ]);
  const [departmentMain, setDepartmentMain] = useState([
    {
      med_error_depcode: '',
      med_error_depname: '',
    },
  ]);
  const [errerAnalysis, setErrerAnalysis] = useState([
    {
      error_analysis_id: '',
      error_analysis_name: '',
    },
  ]);
  const [errorTypeField, setErrorTypeField] = useState('');
  const [errorTypeWardField, setErrorTypeWardField] = useState('');
  const [errorTypeWardFieldCode, setErrorTypeWardFieldCode] = useState('');
  const [doctor, setDoctor] = useState([
    {
      doctor_code: '',
      doctor_name: '',
    },
  ]);
  const [labelErrorType, setLabelErrorType] = useState('');
  const [optionErrorType, setOptionErrorType] = useState([
    {
      error_type: '',
      error_type_list: '',
      error_type_list_detail: '',
    },
  ]);
  const [token, setToken] = useState(auth.accessToken);

  const [medErrorType, setMedErrorType] = useState([
    {
      error_type: '',
      error_type_name: '',
      error_field: '',
      error_field_ward: '',
      error_field_ward_code: '',
    },
  ]);

  // Section Form 2
  const [keyPerson, setKeyPerson] = useState([
    {
      error_key_person_name: '',
      error_key_sec: '',
      error_key_sec_name: '',
    },
  ]);

  const [processingPerson, setProcessingPerson] = useState([
    {
      error_key_person_name: '',
      error_key_sec: '',
    },
  ]);

  const [drugItem, setDrugItem] = useState([
    {
      icode: '',
      drugName: '',
      drug_prop_list: '',
    },
  ]);

  const [isShow, setIsShow] = useState({
    section4: false,
    section5: false,
  });
  // Section Form 2

  const [formRegister, setFormRegister] = useState({
    error_id: 0,
    error_section: page,
    error_datetime: '',
    error_date: formatDate(value),
    error_user: '',
    error_user_name: '',
    error_time: '',
    error_ward: '',
    error_ward_name: '',
    error_event: '',
    error_level: '',
    error_level_detail: '',
    error_clear: '',
    error_analysis_id: '',
    error_analysis: '',
    error_type: '',
    error_type_name: '',
    error_prescription_ward: '',
    error_prescription_ward_code: '',
    error_doctor_code: '',
    error_doctor: '',
    error_prescription: '',
    error_processing: '',
    error_processing_ward: '',
    error_processing_ward_code: '',
    error_dispensing: '',
    error_dispensing_ward: '',
    error_dispensing_ward_code: '',
    error_pre_administration: '',
    error_pre_administration_ward: '',
    error_pre_administration_ward_code: '',
    error_prescription_right: '',
    error_prescription_wrong: '',
    error_processing_right_icode: '',
    error_processing_right: '',
    error_processing_right_unit: '',
    error_processing_wrong_icode: '',
    error_processing_wrong: '',
    error_processing_wrong_unit: '',
    error_adminstration: '',
    error_adminstration_ward: '',
    error_adminstration_ward_code: '',
    error_dispensing_person: '',
    error_key_person: '',
    error_processing_person: '',
    error_alert: '',
    hn: '',
    an: '',
    app_new: 'Y',
  });

  // #ใช้งานอยู่
  const [formRegisterRule, setFormRegisterRule] = useState({
    error_time: {
      error: false,
      message: 'โปรดระบุ เวลาที่เกิดเหตุการณ์',
    },
    error_ward: {
      error: false,
      message: 'โปรดระบุ สถานที่เกิดเหตุ/พบเหตุ',
    },
    error_event: {
      error: false,
      message: 'โปรดระบุ เหตุการณ์ที่พบความคลาดเคลื่อน',
    },
    error_level: {
      error: false,
      message: 'โปรดระบุ ระดับความรุนแรง',
    },
    error_alert: {
      error: false,
      message: 'โปรดระบุ เป็นเหตุการณ์ที่เกี่ยวข้องกับยา High Alert Drugs (HAD) หรือไม่',
    },
    error_analysis: {
      error: false,
      message: 'โปรดเลือกรายการวิเคราะห์สาเหตุ',
    },
    error_type: {
      error: false,
      message: 'โปรดระบุ ประเภทของ Error',
    },
  });

  // #ใช้งานอยู่
  const onSubmitHandler = (event) => {
    const formFields = Object.keys(formRegister);
    let newFormValues = { ...formRegisterRule };

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formRegister[currentField];
      // console.log(currentField, ' >> ',formRegisterRule[currentField]);

      if (formRegisterRule[currentField] !== undefined) {
        if (currentValue === '') {
          newFormValues = {
            ...newFormValues,
            [currentField]: {
              ...newFormValues[currentField],
              error: true,
            },
          };
        } else {
          newFormValues = {
            ...newFormValues,
            [currentField]: {
              ...newFormValues[currentField],
              error: false,
            },
          };
        }
      }
    }
    setFormRegisterRule(newFormValues);
    const chkError = Object.keys(newFormValues);
    let isValid = 0;

    for (let index = 0; index < chkError.length; index++) {
      const currentErrorField = chkError[index];
      const currentErrorValue = newFormValues[currentErrorField];
      if (currentErrorValue.error) {
        isValid += 1;
      }
    }
    async function create() {
      const stringDateTime = moment(d.toISOString()).format('YYYY-MM-DD HH:mm:ss');
      formRegister.error_datetime = stringDateTime;
      const formRegis = await medErrorCreate(formRegister, token);
      const { statusCode, medErrorList } = formRegis.data;
      if (statusCode === 201 && medErrorList && !_.isEmpty(medErrorList)) {
        Toast.fire({
          icon: 'success',
          title: 'บันข้อมูลเรียบร้อย',
        });
        setTimeout(() => {
          navigate(`/lists/med`, { replace: true });
        }, 2000);
      } else if (statusCode === 200 && medErrorList && !_.isEmpty(medErrorList)) {
        Toast.fire({
          icon: 'success',
          title: 'อัพเดทข้อมูลเรียบร้อย',
        });
        setTimeout(() => {
          navigate(`/lists/med`, { replace: true });
        }, 2000);
      }
    }
    if (isValid === 0) {
      create();
    }
    event.preventDefault();
  };

  // #ใช้งานอยู่
  const handleChangeDate = (event) => {
    const dateValue = formatDate(event.$d);
    setFormRegister((prestate) => ({
      ...prestate,
      error_date: dateValue,
    }));
  };

  // #ใช้งานอยู่
  const handleChangeSelect = (event) => {
    const { name, value } = event.target;
    let newValueRule = { ...formRegisterRule };
    if (value !== '') {
      setFormRegister((prestate) => ({
        ...prestate,
        [name]: value,
      }));
      if (formRegisterRule[name]) {
        newValueRule = {
          ...newValueRule,
          [name]: {
            ...newValueRule[name],
            error: false,
          },
        };
      }
    } else {
      setFormRegister((prestate) => ({
        ...prestate,
        [name]: '',
      }));
      if (formRegisterRule[name]) {
        newValueRule = {
          ...newValueRule,
          [name]: {
            ...newValueRule[name],
            error: true,
          },
        };
      }
    }
    setFormRegisterRule(newValueRule);
  };

  // #ใช้งานอยู่
  const handleChangeErrorType = (event) => {
    const { name, value } = event.target;
    setFormRegister((preState) => ({
      ...preState,
      error_prescription: '',
      error_processing: '',
      error_dispensing: '',
      error_adminstration: '',
      error_prescription_ward: '',
      error_prescription_ward_code: '',
      error_dispensing_ward: '',
      error_dispensing_ward_code: '',
      error_pre_administration_ward: '',
      error_pre_administration_ward_code: '',
      error_adminstration_ward: '',
      error_adminstration_ward_code: '',
      error_processing_ward: '',
      error_processing_ward_code: '',
      error_doctor_code: '',
      error_doctor: '',
    }));

    const labelError = medErrorType.find((element) => element.error_type === +value);
    setErrorTypeField(labelError.error_field !== undefined ? labelError.error_field : '');
    setErrorTypeWardField(labelError.error_field_ward !== undefined ? labelError.error_field_ward : '');
    setErrorTypeWardFieldCode(labelError.error_field_ward_code !== undefined ? labelError.error_field_ward_code : '');
    setLabelErrorType(labelError !== undefined ? labelError.error_type_name : '');
    loadOptionErrorType(value);
    loadPerson(token, +value);
    if (+value === 2 || +value === 5) {
      loadDrugItems(token);
    }
    setFormRegister((prestate) => ({
      ...prestate,
      [name]: value,
      error_type_name: labelError.error_type_name !== undefined ? labelError.error_type_name : '',
    }));
  };

  // #ใช้งานอยู่
  const handleChangeAutoComplte = (nameInput, newValue) => {
    let newValueRule = { ...formRegisterRule };
    if (newValue !== null) {
      setFormRegister((prestate) => ({
        ...prestate,
        [nameInput]: newValue,
      }));
      if (formRegisterRule[nameInput]) {
        newValueRule = {
          ...newValueRule,
          [nameInput]: {
            ...newValueRule[nameInput],
            error: false,
          },
        };
      }
    } else {
      setFormRegister((prestate) => ({
        ...prestate,
        [nameInput]: '',
      }));
      if (formRegisterRule[nameInput]) {
        newValueRule = {
          ...newValueRule,
          [nameInput]: {
            ...newValueRule[nameInput],
            error: true,
          },
        };
      }
    }
    setFormRegisterRule(newValueRule);
  };

  // #ใช้งานอยู่
  const loadDepartmentMain = async (auth_token, active) => {
    const dept = await getMedErrorDeptBySectionMain(auth_token, active);
    const { statusCode, departmentList } = dept.data;
    if (statusCode === 200 && departmentList && !_.isEmpty(departmentList)) {
      setDepartmentMain(departmentList);
    }
  };
  // #ใช้งานอยู่
  const loadDepartment = async (auth_token, active) => {
    const dept = await getMedErrorDeptBySection(auth_token, active);
    const { statusCode, departmentList } = dept.data;
    if (statusCode === 200 && departmentList && !_.isEmpty(departmentList)) {
      setDepartment(departmentList);
    }
  };

  // #ใช้งานอยู่
  const loadAnalysis = async (auth_token) => {
    const getAnalysis = await getAnalysisData(auth_token);

    const { statusCode, analysisList } = getAnalysis.data;
    if (statusCode === 200 && analysisList && !_.isEmpty(analysisList)) {
      setErrerAnalysis(analysisList);
    }
  };

  // #ใช้งานอยู่
  const loadDoctor = async (auth_token) => {
    const doctor = await getDoctorAll(auth_token);
    const { statusCode, doctorList } = doctor.data;
    if (statusCode === 200 && doctorList && !_.isEmpty(doctorList)) {
      setDoctor(doctorList);
    }
  };

  // #ใช้งานอยู่
  const loadOptionErrorType = async (errorType) => {
    const typesList = await getErrorTypeByTypeList(token, errorType);
    const { statusCode, errorTypeList } = typesList.data;
    if (statusCode === 200 && errorTypeList && !_.isEmpty(errorTypeList)) {
      setOptionErrorType(errorTypeList);
    }
  };

  // #ใช้งานอยู่
  const loadErrorType = async (auth_token, pages) => {
    const ErrorType = await getErrorTypeByType(auth_token, pages);
    const { statusCode, errorTypeList } = ErrorType.data;

    if (statusCode === 200 && errorTypeList && !_.isEmpty(errorTypeList)) {
      setMedErrorType(errorTypeList);
    }
  };

  // #ใช้งานอยู่ Form 2 loadDrugItems
  const loadDrugItems = async (auth_token) => {
    const drugitem = await getDrugItems(auth_token);
    const { statusCode, drugitemList } = drugitem.data;
    if (statusCode === 200 && drugitemList && !_.isEmpty(drugitemList)) {
      setDrugItem(drugitemList);
    }
  };

  // #ใช้งานอยู่ formRegister.error_type === '5'
  const loadPerson = async (auth_token, id) => {
    const person = await getMedErrorPerson(auth_token);
    const { statusCode, personList } = person.data;
    if (statusCode === 200 && personList && !_.isEmpty(personList)) {
      const personKeyArray = personList.filter((val) => {
        return val.error_key_sec === 1 || val.error_key_sec === 3;
      });
      const personProcessArray = personList.filter((val) => val.error_key_sec === 2);
      if (id === 2 || id === 5) {
        setKeyPerson(personKeyArray);
        setProcessingPerson(personProcessArray);
        loadDrugItems(auth_token);
      }
    }
  };

  // ใช้งานอยู่ Form 2
  const checkErrorType = (value) => {
    if (value !== null) {
      const subString = value.split(' ');
      const ctrlSection4 = ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '3.1', '3.2', '4.1'];
      const ctrlSection5 = [
        '1.3',
        '2.10',
        '2.11',
        '2.12',
        '2.13',
        '2.14',
        '2.15',
        '2.16',
        '2.17',
        '2.18',
        '2.19',
        '2.20',
        '4.3',
      ];
      const chk4 = ctrlSection4.find((val) => val === subString[0].trim());
      const chk5 = ctrlSection5.find((val) => val === subString[0].trim());
      if (chk4 !== undefined) {
        setIsShow({
          section4: true,
          section5: false,
        });
      } else if (chk5 !== undefined) {
        setIsShow({
          section4: false,
          section5: true,
        });
      } else {
        setIsShow({
          section4: false,
          section5: false,
        });
      }
      setFormRegister((preState) => ({
        ...preState,
        error_doctor_code: '',
        error_doctor: '',
        error_key_person: '',
        error_processing_person: '',
        error_processing_right_icode: '',
        error_processing_right: '',
        error_processing_right_unit: '',
        error_processing_wrong_icode: '',
        error_processing_wrong: '',
        error_processing_wrong_unit: '',
        error_dispensing_person: '',
      }));
    } else {
      setIsShow({
        section4: false,
        section5: false,
      });
    }
  };

  // #ยังไม่ใช้งาน
  const loadEditData = async (errorId) => {
    // const getMedErrorById = await medErrorById(token, errorId);
    // const { statusCode, medErrorList, errorType, errorTypeList } = getMedErrorById.data;
    // if (statusCode === 200 && medErrorList && !_.isEmpty(medErrorList)) {
    //   const medErrorData = medErrorList[0] || {};
    //   setErrorTypeField(errorType[0].error_field);
    //   setErrorTypeWardField(errorType[0].error_field_ward);
    //   setErrorTypeWardFieldCode(errorType[0].error_field_ward_code);
    //   setLabelErrorType(errorType[0].error_type_name);
    //   setOptionErrorType(errorTypeList);
    //   setFormRegister(medErrorData);
    //   loadPerson(token, +errorType[0].error_type);
    //   if (+errorType[0].error_type === 2 || +errorType[0].error_type === 5) {
    //     loadDrugItems(token);
    //   }
    //   setFormRegister((prestate) => ({
    //     ...prestate,
    //     error_type: medErrorData.error_type.toString(),
    //     error_date: moment(medErrorData.error_date).format('YYYY-MM-DD'),
    //     error_type_name: errorType[0].error_type_name,
    //   }));
    // }
  };

  // #ใช้งานอยู่
  useEffect(() => {
    async function checkVerifyToken() {
      const auth_token = localStorage.getItem('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;
      if (statusCode === 200 && profile) {
        if (access_token) {
          const loginname = profile.loginname.substring(0, 3);
          let sections = 0;
          if (loginname.trim() === '103') {
            sections = 2;
          } else {
            sections = 1;
          }
          setPage(sections);
          loadErrorType(access_token, sections);
          loadDepartment(access_token, 'Y');
          loadDepartmentMain(access_token, 'Y');
          setFormRegister((prestate) => ({
            ...prestate,
            error_user: profile.loginname,
            error_user_name: profile.name,
            error_section: sections,
          }));
          setToken(access_token);
          setUser([profile]);
          loadAnalysis(access_token, 'Y');
          loadDoctor(access_token);
        } else {
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, [id]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          แบบเก็บข้อมูล Medication error {`${page === 1 ? 'โรงพยาบาลร้อยเอ็ด' : 'กลุ่มงานเภสัชกรรม'}`}
        </Typography>
      </Stack>
      <Card>
        <Box component="form" noValidate autoComplete="off" onSubmit={onSubmitHandler} sx={{ py: 5, px: 5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
              <InputLabel id="demo-simple-select-label">
                <Typography variant="span" style={{ color: color }}>
                  * จำเป็นต้องกรอก
                </Typography>
              </InputLabel>
              <DesktopDatePicker
                label="วัน/เดือน/ปี ที่พบเหตุการณ์"
                inputFormat="DD/MM/YYYY"
                value={formRegister.error_date}
                name="error_date"
                onChange={handleChangeDate}
                renderInput={(params) => <TextField {...params} />}
              />
              <FormControl fullWidth error={formRegisterRule.error_time.error}>
                <InputLabel id="demo-simple-select-label">
                  เวลาที่เกิดเหตุการณ์{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="error_time"
                  value={formRegister.error_time}
                  label="เวลาที่เกิดเหตุการณ์"
                  onChange={handleChangeSelect}
                >
                  <MenuItem value={'เวรเช้า ในเวลา'}>เวรเช้า ในเวลา</MenuItem>
                  <MenuItem value={'เวรเช้า นอกเวลา'}>เวรเช้า นอกเวลา</MenuItem>
                  <MenuItem value={'เวรบ่าย'}>เวรบ่าย</MenuItem>
                  <MenuItem value={'เวรดึก'}>เวรดึก</MenuItem>
                </Select>
                <FormHelperText>
                  {formRegisterRule.error_time.error && formRegisterRule.error_time.message}
                </FormHelperText>
              </FormControl>
              <TextField
                type="text"
                label={`ผู้รายงาน`}
                value={`${formRegister.error_user_name}`}
                id="error_user_name"
                name="error_user_name"
                InputProps={{
                  readOnly: true,
                }}
                variant="filled"
              />
              <FormControl error={formRegisterRule.error_ward.error}>
                <FormLabel id="error_ward_label">
                  สถานที่เกิดเหตุ/พบเหตุ{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <Autocomplete
                  fullWidth
                  disablePortal
                  options={department}
                  isOptionEqualToValue={(option, value) => option.med_error_depcode === formRegister.error_ward}
                  getOptionLabel={(option) => option.med_error_depname}
                  onChange={(event, newValue) => {
                    handleChangeAutoComplte(
                      'error_ward_name',
                      newValue !== null ? newValue.med_error_depname : newValue
                    );
                    handleChangeAutoComplte('error_ward', newValue !== null ? newValue.med_error_depcode : newValue);
                  }}
                  value={{
                    med_error_depcode: formRegister.error_ward,
                    med_error_depname: formRegister.error_ward_name,
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ค้นหาสถานที่เกิดเหตุ"
                      error={formRegisterRule.error_ward.error}
                      helperText={formRegisterRule.error_ward.error && formRegisterRule.error_ward.message}
                    />
                  )}
                />
              </FormControl>

              <FormControl error={formRegisterRule.error_event.error}>
                <FormLabel id="error_event_label">
                  เหตุการณ์ที่พบความคลาดเคลื่อน{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <TextField
                  type="text"
                  label={`(อธิบายรายละเอียด พร้อมระบุชื่อยาที่เกี่ยวข้อง)`}
                  value={`${formRegister.error_event}`}
                  id="error_event"
                  name="error_event"
                  onChange={handleChangeSelect}
                  error={formRegisterRule.error_event.error}
                  helperText={formRegisterRule.error_event.error && formRegisterRule.error_event.message}
                />
              </FormControl>
              <FormControl>
                <FormLabel id="error_hn_label">ระบุ HN คนไข้</FormLabel>
                <TextField
                  type="text"
                  label={`(กรณีคนไข้นอก)`}
                  value={`${formRegister.hn}`}
                  id="hn"
                  name="hn"
                  onChange={handleChangeSelect}
                />
              </FormControl>

              <FormControl>
                <FormLabel id="error_an_label">ระบุ AN คนไข้</FormLabel>
                <TextField
                  type="text"
                  label={`(กรณีผู้ป่วยใน)`}
                  value={`${formRegister.an}`}
                  id="an"
                  name="an"
                  onChange={handleChangeSelect}
                />
              </FormControl>

              <FormControl error={formRegisterRule.error_level.error}>
                <FormLabel id="error_level_label">
                  ระดับความรุนแรง{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>

                <Autocomplete
                  fullWidth
                  disablePortal
                  options={MedErrorLevel}
                  isOptionEqualToValue={(option, value) => option.med_error_level_code === formRegister.error_level}
                  getOptionLabel={(option) => `${option.med_error_level_code} ${option.med_error_level_detail}`}
                  onChange={(event, newValue) => {
                    handleChangeAutoComplte(
                      'error_level_detail',
                      newValue !== null ? newValue.med_error_level_detail : newValue
                    );
                    handleChangeAutoComplte(
                      'error_level',
                      newValue !== null ? newValue.med_error_level_code : newValue
                    );
                  }}
                  value={{
                    med_error_level_code: formRegister.error_level,
                    med_error_level_detail: formRegister.error_level_detail,
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เลือกระดับความรุนแรง"
                      error={formRegisterRule.error_level.error}
                      helperText={formRegisterRule.error_level.error && formRegisterRule.error_level.message}
                    />
                  )}
                />
              </FormControl>

              <FormControl error={formRegisterRule.error_alert.error}>
                <FormLabel id="error_alert_label">
                  เหตุการณ์ที่พบความคลาดเคลื่อน เป็นเหตุการณ์ที่เกี่ยวข้องกับยา High Alert Drugs (HAD) หรือไม่{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <RadioGroup
                  aria-labelledby="error_alert_label"
                  id="error_alert"
                  name="error_alert"
                  value={formRegister.error_alert}
                  onChange={handleChangeSelect}
                >
                  <FormControlLabel value="High Alert Drugs" control={<Radio />} label="High Alert Drugs" />
                  <FormControlLabel
                    value="ไม่ใช่ High Alert Drugs"
                    control={<Radio />}
                    label="ไม่ใช่ High Alert Drugs"
                  />
                </RadioGroup>
                <FormHelperText>
                  {formRegisterRule.error_alert.error && formRegisterRule.error_alert.message}
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel id="error_level_label">การแก้ไขปัญหาเบื้องต้น</FormLabel>
                <TextField
                  type="text"
                  value={`${formRegister.error_clear}`}
                  id="error_clear"
                  name="error_clear"
                  onChange={handleChangeSelect}
                  placeholder="ระบุการแก้ไขปัญหาเบื้องต้น"
                />
              </FormControl>

              <FormControl error={formRegisterRule.error_analysis.error}>
                <FormLabel id="error_analysis_label">
                  วิเคราะห์สาเหตุ{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>

                <Autocomplete
                  fullWidth
                  disablePortal
                  options={errerAnalysis}
                  isOptionEqualToValue={(option, value) => option.error_analysis_id === formRegister.error_analysis_id}
                  getOptionLabel={(option) => `${option.error_analysis_name}`}
                  onChange={(event, newValue) => {
                    handleChangeAutoComplte(
                      'error_analysis_id',
                      newValue !== null ? newValue.error_analysis_id : newValue
                    );
                    handleChangeAutoComplte(
                      'error_analysis',
                      newValue !== null ? newValue.error_analysis_name : newValue
                    );
                  }}
                  value={{
                    error_analysis_id: formRegister.error_analysis_id,
                    error_analysis_name: formRegister.error_analysis,
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เลือกรายการวิเคราะห์สาเหตุ"
                      error={formRegisterRule.error_analysis.error}
                      helperText={formRegisterRule.error_analysis.error && formRegisterRule.error_analysis.message}
                    />
                  )}
                />
              </FormControl>
              <FormControl error={formRegisterRule.error_type.error}>
                <FormLabel id="error_type_label">
                  ประเภทของ Error{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <RadioGroup
                  aria-labelledby="error_type_label"
                  id="error_type"
                  name="error_type"
                  value={formRegister.error_type}
                  onChange={handleChangeErrorType}
                >
                  {medErrorType.map((option) => (
                    <FormControlLabel
                      key={option.error_type}
                      value={`${option.error_type}`}
                      control={<Radio />}
                      label={`${option.error_type_name}`}
                    />
                  ))}
                </RadioGroup>
                <FormHelperText>
                  {formRegisterRule.error_type.error && formRegisterRule.error_type.message}
                </FormHelperText>
              </FormControl>
              {formRegister.error_type !== '' && (
                <>
                  {`${typeof formRegister.error_type} >> ${formRegister.error_type}`}
                  <br />
                  {`${typeof formRegister.error_section} >> ${formRegister.error_section}`}
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                      {labelErrorType}
                    </Typography>
                  </Divider>
                  <FormControl>
                    <FormLabel id={`${errorTypeWardField}_label`}>Ward/หน่วยงาน ที่เกี่ยวข้อง</FormLabel>
                    {`errorTypeWardFieldCode >> ${JSON.stringify(errorTypeWardFieldCode)}`}
                    {`errorTypeWardField >> ${JSON.stringify(errorTypeWardField)}`}
                    <br />
                    {`${errorTypeWardFieldCode} >> ${formRegister[errorTypeWardFieldCode]}`}
                    {`${errorTypeWardField} >> ${formRegister[errorTypeWardField]}`}
                    <Autocomplete
                      fullWidth
                      disablePortal
                      options={department}
                      isOptionEqualToValue={(option, value) =>
                        option.med_error_depcode === formRegister[errorTypeWardFieldCode]
                      }
                      getOptionLabel={(option) => option.med_error_depname}
                      value={{
                        med_error_code: formRegister[errorTypeWardFieldCode],
                        med_error_depname: formRegister[errorTypeWardField],
                      }}
                      onChange={(event, newValue) => {
                        setFormRegister((prestate) => ({
                          ...prestate,
                          [errorTypeWardField]: newValue !== null ? newValue.med_error_depname : '',
                          [errorTypeWardFieldCode]: newValue !== null ? newValue.med_error_depcode : '',
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="ค้นหาหน่วยงาน" />}
                    />
                  </FormControl>
                  {formRegister.error_type === '1' && (
                    <>
                      <FormControl>
                        <FormLabel id="error_doctor_label" className="mb-2">
                          แพทย์ผู้สั่งยา
                        </FormLabel>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          options={doctor}
                          isOptionEqualToValue={(option, value) =>
                            option.doctor_code === formRegister.error_doctor_code
                          }
                          getOptionLabel={(option) => option.doctor_name}
                          onChange={(event, newValue) => {
                            handleChangeAutoComplte(
                              'error_doctor',
                              newValue !== null ? newValue.doctor_name : newValue
                            );
                            handleChangeAutoComplte(
                              'error_doctor_code',
                              newValue !== null ? newValue.doctor_code : newValue
                            );
                          }}
                          value={{
                            doctor_name: formRegister.error_doctor,
                            doctor_code: formRegister.error_doctor_code,
                          }}
                          renderInput={(params) => <TextField {...params} label="ระบุชื่อแพทย์ผู้สั่งยา" />}
                        />
                      </FormControl>
                    </>
                  )}
                  <FormControl>
                    <FormLabel id={`${errorTypeField}_label`}>ประเภทของ {labelErrorType}</FormLabel>
                    <Autocomplete
                      fullWidth
                      disablePortal
                      options={optionErrorType}
                      isOptionEqualToValue={(option, value) =>
                        option.error_type_list_detail === formRegister[errorTypeField]
                      }
                      getOptionLabel={(option) => `${option.error_type_list_detail}`}
                      value={{ error_type_list_detail: formRegister[errorTypeField] }}
                      onChange={(event, newValue) => {
                        setFormRegister((prestate) => ({
                          ...prestate,
                          [errorTypeField]: newValue !== null ? newValue.error_type_list_detail : '',
                        }));
                        checkErrorType(newValue.error_type_list);
                      }}
                      renderInput={(params) => <TextField {...params} label={`เลือกประเภทของ ${labelErrorType}`} />}
                    />
                  </FormControl>
                  {formRegister.error_type === '2' && formRegister.error_section === 2 && (
                    <>
                      <FormControl>
                        <FormLabel id="error_dispensing_person_label">
                          ความคลาดเคลื่อนในการจ่ายยาที่เกิดขึ้น เกิดจาก (ระบุตัวบุคคล)
                        </FormLabel>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          id="error_dispensing_person"
                          name="error_dispensing_person"
                          options={keyPerson}
                          isOptionEqualToValue={(option, value) =>
                            option.error_key_person_name === formRegister.error_dispensing_person
                          }
                          getOptionLabel={(option) => `${option.error_key_person_name} (${option.error_key_sec_name})`}
                          onChange={(event, newValue) => {
                            setFormRegister((prestate) => ({
                              ...prestate,
                              error_dispensing_person: newValue !== null ? newValue.error_key_person_id : '',
                            }));
                          }}
                          renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                        />
                      </FormControl>
                    </>
                  )}
                  {formRegister.error_type === '5' && formRegister.error_section === 2 && (
                    <>
                      <FormControl>
                        <FormLabel id="error_key_person_label" className="mb-2">
                          ความคลาดเคลื่อนในการ key ยาที่เกิดขึ้น เกิดจาก
                        </FormLabel>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          id="error_key_person"
                          name="error_key_person"
                          options={keyPerson}
                          isOptionEqualToValue={(option, value) =>
                            option.error_key_person_name === formRegister.error_dispensing_person
                          }
                          getOptionLabel={(option) => `${option.error_key_person_name} (${option.error_key_sec_name})`}
                          onChange={(event, newValue) => {
                            setFormRegister((prestate) => ({
                              ...prestate,
                              error_key_person: newValue !== null ? newValue.error_key_person_id : '',
                            }));
                          }}
                          renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel id="error_processing_person_label" className="mb-2">
                          ความคลาดเคลื่อนในการจัดยาที่เกิดขึ้น เกิดจาก
                        </FormLabel>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          options={processingPerson}
                          isOptionEqualToValue={(option) =>
                            option.error_key_person_name === formRegister.error_processing_person
                          }
                          getOptionLabel={(option) => `${option.error_key_person_name} (${option.error_key_sec_name})`}
                          onChange={(event, newValue) => {
                            setFormRegister((prestate) => ({
                              ...prestate,
                              error_processing_person: newValue !== null ? newValue.error_key_person_id : '',
                            }));
                          }}
                          renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                        />
                      </FormControl>
                      {JSON.stringify(isShow)}
                      {isShow.section4 && (
                        <>
                          <Typography variant="h6" component="h2" sx={{ color: 'primary.main' }}>
                            คู่ยาที่พิมพ์/รับ order คลาดเคลื่อน
                          </Typography>

                          <FormControl>
                            <FormLabel id="error_processing_right_label" className="text-primary">
                              ยาที่แพทย์มี order
                            </FormLabel>
                            <Autocomplete
                              fullWidth
                              disablePortal
                              options={drugItem}
                              isOptionEqualToValue={(option, value) =>
                                option.icode === formRegister.error_processing_right_icode
                              }
                              getOptionLabel={(option) => option.drugName}
                              value={{
                                icode: formRegister.error_processing_right_icode,
                                drugName: formRegister.error_processing_right,
                              }}
                              onChange={(event, newValue) => {
                                setFormRegister((prestate) => ({
                                  ...prestate,
                                  error_processing_right_icode: newValue !== null ? newValue.icode : '',
                                  error_processing_right: newValue !== null ? newValue.drugName : '',
                                }));
                              }}
                              renderInput={(params) => <TextField {...params} placeholder="ค้นหาหน่วยงาน" />}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel id="error_processing_right_unit_label">จำนวนยาที่แพทย์สั่ง</FormLabel>
                            <TextField
                              type="number"
                              value={`${formRegister.error_processing_right_unit}`}
                              id="error_processing_right_unit"
                              name="error_processing_right_unit"
                              onChange={handleChangeSelect}
                              placeholder="ระบุจำนวนยา"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel id="error_processing_wrong_label" className="text-primary">
                              ยาที่พิมพ์/รับ order
                            </FormLabel>
                            <Autocomplete
                              fullWidth
                              disablePortal
                              options={drugItem}
                              isOptionEqualToValue={(option) =>
                                option.icode === formRegister.error_processing_wrong_icode
                              }
                              getOptionLabel={(option) => option.drugName}
                              onChange={(event, newValue) => {
                                setFormRegister((prestate) => ({
                                  ...prestate,
                                  error_processing_wrong_icode: newValue !== null ? newValue.icode : '',
                                  error_processing_wrong: newValue !== null ? newValue.drugName : '',
                                }));
                              }}
                              value={{
                                icode: formRegister.error_processing_wrong_icode,
                                drugName: formRegister.error_processing_wrong,
                              }}
                              renderInput={(params) => <TextField {...params} label="ระบุชื่อยา" />}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel id="error_processing_wrong_unit_label">จำนวนยาที่พิมพ์/รับ order</FormLabel>
                            <TextField
                              type="number"
                              value={`${formRegister.error_processing_wrong_unit}`}
                              id="error_processing_wrong_unit"
                              name="error_processing_wrong_unit"
                              onChange={handleChangeSelect}
                              placeholder="ระบุจำนวนยา"
                            />
                          </FormControl>
                        </>
                      )}

                      {isShow.section5 && (
                        <>
                          <Typography variant="h6" component="h2" sx={{ color: 'primary.main' }}>
                            คู่ยาที่จัดยาคลาดเคลื่อน
                          </Typography>
                          <FormControl>
                            <FormLabel id="error_processing_right_label" className="text-primary">
                              ยาที่แพทย์มี order
                            </FormLabel>
                            <Autocomplete
                              fullWidth
                              disablePortal
                              options={drugItem}
                              isOptionEqualToValue={(option, value) =>
                                option.icode === formRegister.error_processing_right_icode
                              }
                              getOptionLabel={(option) => option.drugName}
                              value={{
                                icode: formRegister.error_processing_right_icode,
                                drugName: formRegister.error_processing_right,
                              }}
                              onChange={(event, newValue) => {
                                setFormRegister((prestate) => ({
                                  ...prestate,
                                  error_processing_right_icode: newValue !== null ? newValue.icode : '',
                                  error_processing_right: newValue !== null ? newValue.drugName : '',
                                }));
                              }}
                              renderInput={(params) => <TextField {...params} placeholder="ค้นหาหน่วยงาน" />}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel id="error_processing_right_unit_label">จำนวนยาที่แพทย์สั่ง</FormLabel>
                            <TextField
                              type="number"
                              value={`${formRegister.error_processing_right_unit}`}
                              id="error_processing_right_unit"
                              name="error_processing_right_unit"
                              onChange={handleChangeSelect}
                              placeholder="ระบุจำนวนยา"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel id="error_processing_wrong_label" className="text-primary">
                              ยาที่พิมพ์/รับ order
                            </FormLabel>
                            <Autocomplete
                              fullWidth
                              disablePortal
                              options={drugItem}
                              isOptionEqualToValue={(option) =>
                                option.icode === formRegister.error_processing_wrong_icode
                              }
                              getOptionLabel={(option) => option.drugName}
                              onChange={(event, newValue) => {
                                setFormRegister((prestate) => ({
                                  ...prestate,
                                  error_processing_wrong_icode: newValue !== null ? newValue.icode : '',
                                  error_processing_wrong: newValue !== null ? newValue.drugName : '',
                                }));
                              }}
                              value={{
                                icode: formRegister.error_processing_wrong_icode,
                                drugName: formRegister.error_processing_wrong,
                              }}
                              renderInput={(params) => <TextField {...params} label="ระบุชื่อยา" />}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel id="error_processing_wrong_unit_label">จำนวนยาที่พิมพ์/รับ order</FormLabel>
                            <TextField
                              type="number"
                              value={`${formRegister.error_processing_wrong_unit}`}
                              id="error_processing_wrong_unit"
                              name="error_processing_wrong_unit"
                              onChange={handleChangeSelect}
                              placeholder="ระบุจำนวนยา"
                            />
                          </FormControl>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {formRegister.error_id === 0 && (
                <LoadingButton size="large" type="submit" variant="contained" sx={{ mt: 2 }}>
                  <Iconify icon={'material-symbols:save'} width={32} sx={{ mr: 1 }} color="success" /> {'บันทึก'}
                </LoadingButton>
              )}
              {formRegister.error_id > 0 && (
                <LoadingButton
                  size="large"
                  type="submit"
                  variant="contained"
                  color="warning"
                  sx={{ mt: 2, color: 'white' }}
                >
                  <Iconify icon={'material-symbols:edit'} width={32} sx={{ mr: 1 }} color="success" />{' '}
                  {'เปลี่ยนแปลงข้อมูล'}
                </LoadingButton>
              )}
            </Stack>
          </LocalizationProvider>
        </Box>
      </Card>
    </>
  );
}
