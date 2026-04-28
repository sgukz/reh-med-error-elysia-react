import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Iconify from '../../components/iconify';
import { MedErrorLevel, MedErrorAnalysisPharm, MedErrorTypeListPharm } from '../../data/DataMedError';
import {
  getKSKDepartmentAndWard,
  getDoctorAll,
  getMedErrorPerson,
  getDrugItems,
  medErrorCreate,
  getErrorTypeByType,
  getErrorTypeByTypeList,
} from '../../libs/MedError';
import { getTokenFromLocalStorage, getAuthenticatedUser } from '../../libs/Auth';

function formatDate(date) {
  const formatDate = new Date(date);
  const toTwoDigits = (num) => (num < 10 ? `0${num}` : num);
  return `${formatDate.getFullYear()}-${toTwoDigits(formatDate.getMonth() + 1)}-${toTwoDigits(formatDate.getDate())}`;
}
const color = red[500];
const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
  toast: true,
  position: 'center',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', MySwal.stopTimer);
    toast.addEventListener('mouseleave', MySwal.resumeTimer);
  },
});

MedErrorPharmForm.propTypes = {
  medError: PropTypes.array,
};

const d = new Date();
const stringDateTime = moment(d.toISOString()).format('YYYY-MM-DD HH:mm:ss');

export default function MedErrorPharmForm({ medError }) {
  const navigate = useNavigate();
  const [value, setValue] = useState(dayjs(new Date()));
  const [defaultErrerAnalysis, setDefaultErrerAnalysis] = useState([]);
  const [departmentMain, setDepartmentMain] = useState([
    {
      med_error_depcode: '',
      med_error_depname: '',
    },
  ]);

  const [keyPerson, setKeyPerson] = useState([
    {
      error_key_person_name: '',
      error_key_sec: '',
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
    },
  ]);

  const [isShow, setIsShow] = useState({
    section4: false,
    section5: false,
  });
  const [errorTypeField, setErrorTypeField] = useState('');
  const [errorTypeWardField, setErrorTypeWardField] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [labelErrorType, setLabelErrorType] = useState('');
  const [optionErrorType, setOptionErrorType] = useState([
    {
      error_type: '',
      error_type_list: '',
      error_type_list_detail: '',
    },
  ]);
  const [token, setToken] = useState(getTokenFromLocalStorage('token_med_error'));

  const [medErrorTypePharm, setMedErrorTypePharm] = useState([
    {
      error_type: '',
      error_type_name: '',
      error_field: '',
      error_field_ward: '',
    },
  ]);

  const [formRegister, setFormRegister] = useState({
    error_section: 2,
    error_datetime: stringDateTime,
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
    error_analysis: '',
    error_type: '',
    error_type_name: '',
    error_prescription_ward: '',
    error_doctor: '',
    error_prescription: '',
    error_processing: '',
    error_processing_ward: '',
    error_dispensing: '',
    error_dispensing_ward: '',
    error_pre_administration: '',
    error_pre_administration_ward: '',
    error_prescription_right: '',
    error_prescription_wrong: '',
    error_processing_right: '',
    error_processing_right_unit: '',
    error_processing_wrong: '',
    error_processing_wrong_unit: '',
    error_adminstration: '',
    error_adminstration_ward: '',
    error_dispensing_person: '',
    error_key_person: '',
    error_processing_person: '',
    error_alert: '',
    app_new: 'Y',
  });

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
    error_clear: {
      error: false,
      message: 'โปรดระบุ การแก้ไขปัญหาเบื้องต้น',
    },
    error_analysis: {
      error: false,
      message: 'โปรดระบุ วิเคราะห์สาเหตุ',
    },
    error_type: {
      error: false,
      message: 'โปรดระบุ ประเภทของ Error',
    },
  });

  const onSubmitHandler = (event) => {
    const formFields = Object.keys(formRegister);
    let newFormValues = { ...formRegisterRule };
    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formRegister[currentField];
      if (currentValue === '') {
        if (formRegisterRule[currentField]) {
          newFormValues = {
            ...newFormValues,
            [currentField]: {
              ...newFormValues[currentField],
              error: true,
            },
          };
        }
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
      const formRegis = await medErrorCreate(formRegister, token);
      const { data } = formRegis;
      if (data.status_code === 200) {
        Toast.fire({
          icon: data.type,
          title: data.msg,
        });
        const { search } = window.location.search;
        const params = new URLSearchParams(search);
        const pages = +params.get('ac');
        setTimeout(() => {
          navigate(`/lists/med?ac=${pages}`, { replace: true });
        }, 3100);
      }
    }
    if (isValid === 0) {
      create();
    }
    event.preventDefault();
  };

  const handleChangeDate = (event) => {
    // console.log(event.$d);
    const dateValue = formatDate(event.$d);
    setFormRegister((prestate) => ({
      ...prestate,
      error_date: dateValue,
    }));
  };

  const handleChangeSelect = (event) => {
    const { name, value } = event.target;
    setFormRegister((prestate) => ({
      ...prestate,
      [name]: value,
    }));
  };

  const handleChangeErrorType = (event) => {
    const { name, value } = event.target;
    setFormRegister((preState) => ({
      ...preState,
      error_prescription: '',
      error_processing: '',
      error_dispensing: '',
      error_adminstration: '',
      error_doctor: '',
      error_key_person: '',
      error_processing_person: '',
      error_processing_right: '',
      error_processing_right_unit: '',
      error_processing_wrong: '',
      error_processing_wrong_unit: '',
      error_prescription_ward: '',
      error_dispensing_person: '',
      error_processing_ward: '',
      error_dispensing_ward: '',
      error_adminstration_ward: '',
    }));
    const labelError = medErrorTypePharm.find((element) => element.error_type === +value);
    setErrorTypeField(labelError.error_field !== undefined ? labelError.error_field : '');
    setErrorTypeWardField(labelError.error_field_ward !== undefined ? labelError.error_field_ward : '');
    setLabelErrorType(labelError !== undefined ? labelError.error_type_name : '');
    loadOptionErrorType(value);
    loadPerson(+value);
    setFormRegister((prestate) => ({
      ...prestate,
      [name]: value,
      error_type_name: labelError.error_type_name !== undefined ? labelError.error_type_name : '',
    }));
    loadDepartmentMain();
    if (+value === 2 || +value === 5) {
      loadDrugItems();
    }
    let newValueRule = { ...formRegisterRule };
    newValueRule = {
      ...newValueRule,
      [name]: {
        ...newValueRule[name],
        error: false,
      },
    };
    setFormRegisterRule(newValueRule);
  };

  const handleChangeAutoComplte = (nameInput, newValue) => {
    let newValueRule = { ...formRegisterRule };
    if (newValue !== null) {
      setFormRegister((prestate) => ({
        ...prestate,
        [nameInput]: newValue,
      }));
      newValueRule = {
        ...newValueRule,
        [nameInput]: {
          ...newValueRule[nameInput],
          error: false,
        },
      };
    } else {
      setFormRegister((prestate) => ({
        ...prestate,
        [nameInput]: '',
      }));
      newValueRule = {
        ...newValueRule,
        [nameInput]: {
          ...newValueRule[nameInput],
          error: true,
        },
      };
    }
    setFormRegisterRule(newValueRule);
  };

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
        error_doctor: '',
        error_key_person: '',
        error_processing_person: '',
        error_processing_right: '',
        error_processing_right_unit: '',
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

  const loadDepartmentMain = async () => {
    const dept = await getKSKDepartmentAndWard(token);
    const { data } = dept.data;
    setDepartmentMain(data);
  };

  const loadDoctor = async () => {
    const doctor = await getDoctorAll(token);
    const { data } = doctor;
    setDoctor(data.data);
  };

  const loadDrugItems = async () => {
    const drugitem = await getDrugItems(token);
    const { data } = drugitem;
    setDrugItem(data.data);
  };

  const loadOptionErrorType = async (errorType) => {
    const typesList = await getErrorTypeByTypeList(token, errorType);
    const { data } = typesList.data;
    setOptionErrorType(data);
  };

  const loadErrorType = async () => {
    const ErrorType = await getErrorTypeByType(token, 2);
    const { data } = ErrorType.data;
    setMedErrorTypePharm(data);
  };

  const loadPerson = async (id) => {
    const person = await getMedErrorPerson(token);
    const { data } = person;
    const personData = data.data;
    const personKeyArray = personData.filter((val) => {
      return val.error_key_sec === 1 || val.error_key_sec === 3;
    });
    const personProcessArray = personData.filter((val) => val.error_key_sec === 2);
    if (id === 2 || id === 5) {
      setKeyPerson(personKeyArray);
      setProcessingPerson(personProcessArray);
      loadDrugItems();
    }
  };

  const loadEditData = () => {
    if (medError.length > 0) {
      const labelError = medErrorTypePharm.find((element) => element.error_type === +medError[0].error_type);
      setErrorTypeField(labelError.error_field !== undefined ? labelError.error_field : '');
      setErrorTypeWardField(labelError.error_field_ward !== undefined ? labelError.error_field_ward : '');
      setLabelErrorType(labelError !== undefined ? labelError.error_type_name : '');
      loadOptionErrorType(+medError[0].error_type);
      let error_analysis = medError[0]?.error_analysis;
      let subAnalysis = error_analysis.split(',');
      let dataAnalysis = [];
      let arrAnalysis = [];
      if (subAnalysis.length > 1) {
        subAnalysis.forEach((element) => {
          let jsonData = {
            med_error_analysis: element,
          };
          arrAnalysis.push(jsonData);
        });
        dataAnalysis = arrAnalysis;
      } else {
        dataAnalysis = error_analysis;
      }
      setDefaultErrerAnalysis(dataAnalysis);
      loadPerson(+medError[0].error_type);
      checkErrorType(medError[0][labelError.error_field]);
      setFormRegister(...medError);
      setFormRegister((prestate) => ({
        ...prestate,
        error_type: medError[0].error_type.toString(),
        error_datetime: moment(medError[0].error_datetime).format('YYYY-MM-DD HH:mm:ss'),
        error_date: moment(medError[0].error_date).format('YYYY-MM-DD'),
      }));
    }
  };

  useEffect(() => {
    async function verifyToken() {
      const authen = await getAuthenticatedUser();
      const { status_code, data } = authen;
      if (status_code === 200) {
        setFormRegister((prestate) => ({
          ...prestate,
          error_user: data[0].loginname,
          error_user_name: data[0].name,
        }));
        loadDoctor();
        loadDepartmentMain();
        loadEditData();
        loadErrorType();
      }
    }

    verifyToken();
  }, []);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          แบบเก็บข้อมูล Medication error กลุ่มงานเภสัชกรรม รพ.ร้อยเอ็ด
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
                  options={departmentMain}
                  isOptionEqualToValue={(option) => option.med_error_depcode === formRegister.error_ward}
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
                <FormLabel id="error_ward_label">
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
                  isOptionEqualToValue={(option) => option.med_error_level_code === formRegister.error_level}
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

              <FormControl error={formRegisterRule.error_clear.error}>
                <FormLabel id="error_level_label">
                  การแก้ไขปัญหาเบื้องต้น{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <TextField
                  type="text"
                  value={`${formRegister.error_clear}`}
                  id="error_clear"
                  name="error_clear"
                  onChange={handleChangeSelect}
                  placeholder="ระบุการแก้ไขปัญหาเบื้องต้น"
                  error={formRegisterRule.error_clear.error}
                  helperText={formRegisterRule.error_clear.error && formRegisterRule.error_clear.message}
                />
              </FormControl>

              <FormControl error={formRegisterRule.error_analysis.error}>
                <FormLabel id="error_level_label">
                  วิเคราะห์สาเหตุ{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <Autocomplete
                  multiple
                  id="tags-filled"
                  freeSolo
                  options={MedErrorAnalysisPharm}
                  value={defaultErrerAnalysis}
                  getOptionLabel={(option) => option.med_error_analysis}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      return <Chip variant="outlined" label={option.med_error_analysis} {...getTagProps({ index })} />;
                    })
                  }
                  onChange={(event, newValue) => {
                    const nameInput = 'error_analysis';
                    let newValueRule = { ...formRegisterRule };

                    if (newValue.length > 0) {
                      // console.log(newValue);
                      let arrayNewValue = {};
                      newValue.map((value, index) => {
                        if (typeof value === 'string') {
                          newValue.splice(index, 1);
                          arrayNewValue = { med_error_analysis: value };
                          newValue.push(arrayNewValue);
                        }
                        return value;
                      });
                      setDefaultErrerAnalysis(newValue);
                      const joinValue = newValue.map((val) => val.med_error_analysis);
                      setFormRegister((prestate) => ({
                        ...prestate,
                        [nameInput]: joinValue.join(),
                      }));
                      newValueRule = {
                        ...newValueRule,
                        [nameInput]: {
                          ...newValueRule[nameInput],
                          error: false,
                        },
                      };
                    } else {
                      setDefaultErrerAnalysis([]);
                      setFormRegister((prestate) => ({
                        ...prestate,
                        [nameInput]: '',
                      }));
                      newValueRule = {
                        ...newValueRule,
                        [nameInput]: {
                          ...newValueRule[nameInput],
                          error: true,
                        },
                      };
                    }
                    setFormRegisterRule(newValueRule);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="สามารถระบุสาเหตุอื่นๆ นอกจากที่มีให้เลือกได้"
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
                  {medErrorTypePharm.map((option) => (
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
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                      {labelErrorType}
                    </Typography>
                  </Divider>

                  <FormControl>
                    <FormLabel id={`${errorTypeWardField}_label`}>
                      Ward/หน่วยงาน ที่เกี่ยวข้อง{' '}
                      <Typography variant="span" style={{ color: color }}>
                        *
                      </Typography>
                    </FormLabel>
                    <Autocomplete
                      fullWidth
                      disablePortal
                      options={departmentMain}
                      isOptionEqualToValue={(option) => option.med_error_depname === formRegister[errorTypeWardField]}
                      getOptionLabel={(option) => option.med_error_depname}
                      value={{
                        med_error_depcode: Math.floor(Math.random() * 1000),
                        med_error_depname: formRegister[errorTypeWardField],
                      }}
                      onChange={(event, newValue) => {
                        setFormRegister((prestate) => ({
                          ...prestate,
                          [errorTypeWardField]: newValue !== null ? newValue.med_error_depname : '',
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
                          isOptionEqualToValue={(option) => option.name === formRegister.error_doctor}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            handleChangeAutoComplte('error_doctor', newValue !== null ? newValue.name : newValue);
                          }}
                          value={{ code: Math.floor(Math.random() * 1000), name: formRegister.error_doctor }}
                          renderInput={(params) => <TextField {...params} label="ระบุชื่อแพทย์ผู้สั่งยา" />}
                        />
                      </FormControl>
                    </>
                  )}
                  <FormControl>
                    <FormLabel id={`${errorTypeField}_label`}>
                      ประเภทของ {labelErrorType}{' '}
                      <Typography variant="span" style={{ color: color }}>
                        *
                      </Typography>
                    </FormLabel>
                    <Autocomplete
                      fullWidth
                      disablePortal
                      options={optionErrorType}
                      isOptionEqualToValue={(option) => option.error_type_list_detail === formRegister[errorTypeField]}
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

                  {formRegister.error_type === '5' && (
                    <>
                      <FormControl>
                        <FormLabel id="error_key_person_label" className="mb-2">
                          ความคลาดเคลื่อนในการ key ยาที่เกิดขึ้น เกิดจาก
                        </FormLabel>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          options={keyPerson}
                          isOptionEqualToValue={(option) =>
                            option.error_key_person_name === formRegister.error_key_person
                          }
                          getOptionLabel={(option) => option.error_key_person_name}
                          onChange={(event, newValue) => {
                            handleChangeAutoComplte(
                              'error_key_person',
                              newValue !== null ? newValue.error_key_person_name : newValue
                            );
                          }}
                          value={{ error_key_person_name: formRegister.error_key_person }}
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
                          getOptionLabel={(option) => option.error_key_person_name}
                          onChange={(event, newValue) => {
                            handleChangeAutoComplte(
                              'error_processing_person',
                              newValue !== null ? newValue.error_key_person_name : newValue
                            );
                          }}
                          value={{ error_key_person_name: formRegister.error_processing_person }}
                          renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                        />
                      </FormControl>
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
                              isOptionEqualToValue={(option) => option.drugName === formRegister.error_processing_right}
                              getOptionLabel={(option) => option.drugName}
                              onChange={(event, newValue) => {
                                handleChangeAutoComplte(
                                  'error_processing_right',
                                  newValue !== null ? newValue.drugName : newValue
                                );
                              }}
                              value={{
                                icode: Math.floor(Math.random() * 1000),
                                drugName: formRegister.error_processing_right,
                              }}
                              renderInput={(params) => <TextField {...params} label="ระบุชื่อยา" />}
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
                              ชื่อยาที่พิมพ์/รับ order
                            </FormLabel>
                            <Autocomplete
                              fullWidth
                              disablePortal
                              options={drugItem}
                              isOptionEqualToValue={(option) => option.drugName === formRegister.error_processing_wrong}
                              getOptionLabel={(option) => option.drugName}
                              onChange={(event, newValue) => {
                                handleChangeAutoComplte(
                                  'error_processing_wrong',
                                  newValue !== null ? newValue.drugName : newValue
                                );
                              }}
                              value={{
                                icode: Math.floor(Math.random() * 1000),
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
                              isOptionEqualToValue={(option) => option.drugName === formRegister.error_processing_right}
                              getOptionLabel={(option) => option.drugName}
                              onChange={(event, newValue) => {
                                handleChangeAutoComplte(
                                  'error_processing_right',
                                  newValue !== null ? newValue.drugName : newValue
                                );
                              }}
                              value={{
                                icode: Math.floor(Math.random() * 1000),
                                drugName: formRegister.error_processing_right,
                              }}
                              renderInput={(params) => <TextField {...params} label="ระบุชื่อยา" />}
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
                              ชื่อยาที่พิมพ์/รับ order
                            </FormLabel>
                            <Autocomplete
                              fullWidth
                              disablePortal
                              options={drugItem}
                              isOptionEqualToValue={(option) => option.drugName === formRegister.error_processing_wrong}
                              getOptionLabel={(option) => option.drugName}
                              onChange={(event, newValue) => {
                                handleChangeAutoComplte(
                                  'error_processing_wrong',
                                  newValue !== null ? newValue.drugName : newValue
                                );
                              }}
                              value={{
                                icode: Math.floor(Math.random() * 1000),
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
                  {formRegister.error_type === '2' && (
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
                          options={keyPerson.map((option) => option.error_key_person_name)}
                          onChange={(event, newValue) => {
                            setFormRegister((prestate) => ({
                              ...prestate,
                              error_dispensing_person: newValue,
                            }));
                          }}
                          renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                        />
                      </FormControl>
                    </>
                  )}
                </>
              )}
              <LoadingButton size="large" type="submit" variant="contained" sx={{ mt: 2 }}>
                <Iconify icon={'material-symbols:save'} width={32} sx={{ mr: 1 }} /> {'บันทึก'}
              </LoadingButton>
            </Stack>
          </LocalizationProvider>
        </Box>
      </Card>
    </>
  );
}
