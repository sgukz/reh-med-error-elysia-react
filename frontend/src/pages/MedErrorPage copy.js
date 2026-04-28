import { useState, useEffect, useRef, Fragment } from 'react';
import { Helmet } from 'react-helmet-async';
import _, { filter } from 'lodash';
import { useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

// Start Form Register & Update
import dayjs from 'dayjs';
import moment from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormLabel from '@mui/material/FormLabel';
import Autocomplete from '@mui/material/Autocomplete';
import { red } from '@mui/material/colors';
import LoadingButton from '@mui/lab/LoadingButton';
// End Form Register & Update

import { styled } from '@mui/material/styles';

// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// MedError Level
import { MedErrorLevel } from '../data/DataMedError';
// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';
// Lib MedError
import {
  medError,
  medErrorDelete,
  getMedErrorDeptBySection,
  getAnalysisData,
  getErrorTypeByType,
  getDrugItems,
  getErrorTypeByTypeList,
  getMedErrorPerson,
  getDoctorAll,
  medErrorCreate,
  getPatientInfo,
  updateRCA,
} from '../libs/MedError';

// utils
import { formatDateTime } from '../utils/formatTime';
import { AdapterDateFnsTH } from '../utils/AdapterDateFnsTH';
import users from 'src/_mock/user';

const colorRed = red[500];

// Notify Toast Config
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
// Notify Toast Config

// Date Format Thai
function formatDate(date) {
  const formatDate = new Date(date);
  const toTwoDigits = (num) => (num < 10 ? `0${num}` : num);
  return `${formatDate.getFullYear()}-${toTwoDigits(formatDate.getMonth() + 1)}-${toTwoDigits(formatDate.getDate())}`;
}
// Date Format Thai

function formatDateTHString(dateInput) {
  const thaiMonths = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  const date = dayjs(dateInput);

  const day = date.date();
  const monthName = thaiMonths[date.month()]; // index 0-11
  const buddhistYear = date.year() + 543;

  return `${day} ${monthName} ${buddhistYear}`;
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

const TABLE_HEAD_MEDERROR = [
  { id: 'error_section', label: 'แบบฟอร์ม', alignRight: false, alignHead: 'center' },
  { id: 'error_date', label: 'วัน/เดือน/ปี ที่เกิดเหตุการณ์', alignRight: false, alignHead: 'center' },
  { id: 'error_time', label: 'เวลาที่พบเหตุการณ์', alignRight: false, alignHead: 'center' },
  { id: 'error_ward_name', label: 'สถานที่เกิดเหตุ/พบเหตุ', alignRight: false, alignHead: 'center' },
  { id: 'error_event', label: 'เหตุการณ์ที่พบ', alignRight: false, alignHead: 'center' },
  { id: 'error_level', label: 'ระดับความรุนแรง', alignRight: false, alignHead: 'center' },
  { id: 'error_clear', label: 'การแก้ไขปัญหาเบื้องต้น', alignRight: false, alignHead: 'center' },
  { id: 'error_analysis', label: 'วิเคราะห์สาเหตุ', alignRight: false, alignHead: 'center' },
  { id: 'error_doctor', label: 'แพทย์ผู้สั่งยา', alignRight: false, alignHead: 'center' },
  { id: 'error_type_name', label: 'ประเภทของ Error', alignRight: false, alignHead: 'center' },
  { id: 'error_type_detail', label: 'รายละเอียด Error', alignRight: false, alignHead: 'center' },
  { id: 'error_alert', label: 'เหตุการณ์ที่พบความคลาดเคลื่อน', alignRight: false, alignHead: 'center' },
  { id: '', label: 'จัดการ' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_mederror) =>
        _mederror.error_event.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _mederror.error_user_name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _mederror.error_time.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _mederror.error_ward_name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _mederror.error_type_detail.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _mederror.error_type_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export default function MedErrorPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState([]);
  const [token, setToken] = useState(getTokenFromLocalStorage('access_token'));

  const [valueErrorDate, setValueErrorDate] = useState(dayjs(new Date()));
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [department, setDepartment] = useState([
    {
      med_error_depcode: '',
      med_error_depname: '',
      med_error_is_active: 'Y',
    },
  ]);

  const [errerAnalysis, setErrerAnalysis] = useState([
    {
      error_analysis_id: '',
      error_analysis_name: '',
    },
  ]);

  const [medErrorType, setMedErrorType] = useState([
    {
      error_type: '',
      error_type_name: '',
      error_field: '',
      error_field_ward: '',
      error_field_ward_code: '',
    },
  ]);

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
    },
  ]);

  const [isShow, setIsShow] = useState({
    section4: false,
    section5: false,
  });

  const [errorTypeField, setErrorTypeField] = useState('');
  const [errorTypeWardField, setErrorTypeWardField] = useState('');
  const [errorTypeWardFieldCode, setErrorTypeWardFieldCode] = useState('');
  const [labelErrorType, setLabelErrorType] = useState('');
  const [optionErrorType, setOptionErrorType] = useState([
    {
      error_type: '',
      error_type_list: '',
      error_type_list_detail: '',
    },
  ]);

  const [doctor, setDoctor] = useState([
    {
      doctor_code: '',
      doctor_name: '',
    },
  ]);

  const [formRegister, setFormRegister] = useState({
    error_id: 0,
    error_section: 0,
    error_date: formatDate(valueErrorDate),
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

  // #ใช้งานอยู่ handleSectionWard
  const [isNotSelectWard, setIsNotSelectWard] = useState(false);

  // End Form Register & Update

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [open, setOpen] = useState(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isNotify, setIsNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState({
    type: '',
    title: '',
    text: '',
    sec: '',
  });

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selectedID, setSelectedID] = useState(null);
  const [orderBy, setOrderBy] = useState('error_datetime');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [medErrorData, setMedErrorData] = useState([]);
  const [medErrorShow, setMedErrorShow] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    dateStart: formatDate(dayjs().startOf('month')),
    dateEnd: formatDate(dayjs()), // วันนี้
  });

  const [sections, setSection] = useState('');

  // Patient Info
  const [patientInfo, setPatientInfo] = useState([]);

  // Filter by Date
  const [isUseFilterDate, setIsUseFilterDate] = useState(false);

  const handleOpenMenu = (event, error_id) => {
    setOpen(event.currentTarget);
    setSelectedID(error_id);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    event.preventDefault();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    event.preventDefault();
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  // #ใช้งานอยู่ <UserListToolbar>
  const handleFilterChangeDate = (event, elementName) => {
    setDateFilter((preState) => ({
      ...preState,
      [elementName]: formatDate(event),
    }));
  };
  // End </UserListToolbar>
  const handleEdit = (e, id) => {
    setIsShowModal(false);
    loadEditData(id);
    e.preventDefault();
  };

  const handleDelete = (e) => {
    setOpen(null);
    setIsOpenDelete(true);
    e.preventDefault();
  };

  const handleUpdateRCA = async (e, id, rca) => {
    const params = {
      error_id: id,
      is_rca: rca,
    };

    const UpdateStatusRCA = await updateRCA(token, params);
    const { statusCode, medErrorList } = UpdateStatusRCA.data;

    if (statusCode === 200 && medErrorList > 0) {
      Toast.fire({
        icon: 'success',
        title: 'อัพเดทข้อมูลเรียบร้อย',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    const deleleMedError = await medErrorDelete(id, token);

    const { statusCode, deleteMedError } = deleleMedError.data;

    if (statusCode === 200 && deleteMedError > 0) {
      Toast.fire({
        icon: 'success',
        title: 'ลบข้อมูลเรียบร้อย',
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    e.preventDefault();
  };

  const handleClose = (e) => {
    setIsOpenDelete(!true);
    e.preventDefault();
  };

  const handleNotifyClose = (e, sec) => {
    setIsNotify(!true);
    setNotifyMessage({
      type: '',
      title: '',
      text: '',
      sec: '',
    });
    let userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
    if (sec !== 'load') loadMedError(token, userLoginName);
    e.preventDefault();
  };

  const handleGoToRegister = (event) => {
    setIsOpenForm(true);
    const loginname = user[0].loginname.substring(0, 3);
    let sections = 0;
    if (loginname.trim() === '103') {
      sections = 2;
    } else {
      sections = 1;
    }
    setPage(sections);
    setFormRegister({
      error_id: 0,
      error_section: sections,
      error_date: formatDate(valueErrorDate),
      error_user: user[0].loginname,
      error_user_name: user[0].name,
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

    event.preventDefault();
  };

  const handleClickOpenModal = (event, errorId) => {
    setIsShowModal(true);
    setSelectedID(errorId);
    const data = filter(medErrorData, (_mederror) => _mederror.error_id === errorId);
    const patientHN = data[0].hn || data[0].an;
    loadPatientInfo(token, patientHN);
    setMedErrorShow(data);
    event.preventDefault();
  };

  const loadMedError = async (auth_token, error_user = '', section) => {
    try {
      setIsLoading(true);

      let GetMedError;

      if (sections || section === 'ALL') {
        // ไม่ส่งช่วงวันที่
        GetMedError = await medError(auth_token, error_user);
      } else {
        // ส่งช่วงวันที่ตามปกติ
        const hasDateRange = dateFilter.dateStart && dateFilter.dateEnd;

        GetMedError = await medError(
          auth_token,
          error_user,
          hasDateRange ? dateFilter.dateStart : '',
          hasDateRange ? dateFilter.dateEnd : ''
        );
      }

      const { statusCode, medErrorList } = GetMedError.data;
      console.log(statusCode, medErrorList);
      
      setTimeout(() => {
        setIsLoading(false);
        if (statusCode === 200 && medErrorList && !_.isEmpty(medErrorList)) {
          setMedErrorData(medErrorList);
        } else {
          setMedErrorData([]); // กรณีไม่พบข้อมูล
        }
        setIsOpen(false);
        setIsNotify(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      handleCatchAxios(error, 'load');
    }
  };

  const descriptionElementRef = useRef(null);

  const handleCatchAxios = (errorCatch, sec) => {
    if (errorCatch.response) {
      const { status } = errorCatch.response;
      if (status === 404) {
        setTimeout(() => {
          setIsLoading(false);
          Toast.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
          });
        }, 1000);
      } else {
        Toast.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดบางอย่าง',
        });
      }
    } else if (errorCatch.request) {
      Toast.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดบางอย่าง, ขออภัยในความไม่สะดวก!',
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดบางอย่าง, ขออภัยในความไม่สะดวก!',
      });
    }
    setIsOpen(false);
  };

  // Start Form Register & Update
  // #ใช้งานอยู่
  const handleChangeDate = (event) => {
    const dateValue = formatDate(event);
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
  const handleSectionWard = (nameInput, newValue) => {
    if (newValue !== '') {
      setFormRegister((prestate) => ({
        ...prestate,
        [nameInput]: newValue,
      }));
      setIsNotSelectWard(false);
    } else {
      setFormRegister((prestate) => ({
        ...prestate,
        [nameInput]: '',
      }));
      setIsNotSelectWard(true);
    }
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

  // #ใช้งานอยู่
  const loadDoctor = async (auth_token) => {
    const doctor = await getDoctorAll(auth_token);
    const { statusCode, doctorList } = doctor.data;
    if (statusCode === 200 && doctorList && !_.isEmpty(doctorList)) {
      setDoctor(doctorList);
    }
  };

  // #ใช้งานอยู่ handleChangeErrorType
  const loadOptionErrorType = async (auth_token, errorType) => {
    const typesList = await getErrorTypeByTypeList(auth_token, errorType);
    const { statusCode, errorTypeList } = typesList.data;
    if (statusCode === 200 && errorTypeList && !_.isEmpty(errorTypeList)) {
      setOptionErrorType(errorTypeList);
    }
  };

  // #ใช้งานอยู่
  const loadPatientInfo = async (auth_token, hn) => {
    try {
      if (hn !== '') {
        const patientDataList = await getPatientInfo(auth_token, hn);
        const { statusCode, patientInfoList } = patientDataList.data;
        if (statusCode === 200 && !_.isEmpty(patientInfoList)) {
          setPatientInfo(patientInfoList);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Toast.fire({
          icon: 'error',
          title: error.message,
        });
      }
    }
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

    const labelError = medErrorType.find((elementErrorType) => elementErrorType.error_type === +value);
    setErrorTypeField(labelError.error_field !== undefined ? labelError.error_field : '');
    setErrorTypeWardField(labelError.error_field_ward !== undefined ? labelError.error_field_ward : '');
    setErrorTypeWardFieldCode(labelError.error_field_ward_code !== undefined ? labelError.error_field_ward_code : '');
    setLabelErrorType(labelError !== undefined ? labelError.error_type_name : '');
    loadOptionErrorType(token, value);
    loadPerson(token, +value);
    if (+value === 2 || +value === 5) {
      loadDrugItems(token);
    }

    setFormRegister((prestate) => ({
      ...prestate,
      [name]: value,
      error_type_name: labelError.error_type_name !== undefined ? labelError.error_type_name : '',
    }));

    setIsShow({
      section4: false,
      section5: false,
    });
  };

  // ใช้งานอยู่ Form 2
  const checkErrorType = (value) => {
    if (value !== null) {
      const subString = value.split(' ');
      const ctrlSection4 = ['1.1', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '3.1', '3.2', '4.1'];
      const ctrlSection5 = ['2.15', '2.16', '2.17', '2.18', '2.19', '2.20', '4.2'];
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
      if (formRegister.error_type !== '1') {
        setFormRegister((preState) => ({
          ...preState,
          error_doctor_code: '',
          error_doctor: '',
        }));
      }
    } else {
      setIsShow({
        section4: false,
        section5: false,
      });
    }
  };

  // #ใช้งานอยู่ กลับสู่หน้าหลัก
  const handleGoToBack = (event) => {
    setIsOpenForm(false);
    const loginname = user[0].loginname.substring(0, 3);
    let sections = 0;
    if (loginname.trim() === '103') {
      sections = 2;
    } else {
      sections = 1;
    }
    setPage(sections);
    setFormRegister({
      error_id: 0,
      error_section: sections,
      error_date: formatDate(valueErrorDate),
      error_user: user[0].loginname,
      error_user_name: user[0].name,
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
    event.preventDefault();
  };

  // #ใช้อยู่ ปุ่มแสดงทั้งหมด
  const handleShowAll = () => {
    const userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
    setSection('ALL');

    // ปิด filter วันที่ก่อน
    setIsUseFilterDate(false);

    // ตั้งค่า dateFilter ใหม่ (แต่อาจยังไม่ทันใช้ใน loadMedError ถ้าใช้ state ตรงๆ)
    const newDateFilter = {
      dateStart: formatDate(dayjs().startOf('month')),
      dateEnd: formatDate(dayjs()),
    };

    setDateFilter(newDateFilter);

    // เรียกใช้ข้อมูลใหม่ โดยส่ง date โดยตรง
    loadMedError(token, userLoginName, 'ALL');
  };

  // #ใช้อยู่ ปุ่มแสดงทั้งหมด
  const handlwSearchWithDate = (e) => {
    let userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
    loadMedError(token, userLoginName, '');
    setIsUseFilterDate(true);
    setSection('');
    e.preventDefault();
  };

  // #ใช้งานอยู่
  const onSubmitHandler = (event) => {
    const formFields = Object.keys(formRegister);
    let newFormValues = { ...formRegisterRule };

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formRegister[currentField];

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
      try {
        formRegister.error_user = user[0].loginname;
        formRegister.error_user_name = user[0].name;

        const formRegis = await medErrorCreate(formRegister, token);

        const { statusCode, medErrorList } = formRegis.data;
        if (statusCode === 201 && medErrorList && !_.isEmpty(medErrorList)) {
          Toast.fire({
            icon: 'success',
            title: 'บันข้อมูลเรียบร้อย',
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (statusCode === 200 && medErrorList && !_.isEmpty(medErrorList)) {
          Toast.fire({
            icon: 'success',
            title: 'อัพเดทข้อมูลเรียบร้อย',
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          Toast.fire({
            icon: 'error',
            title: 'มีข้อผิดพลาด, กรุณาติดต่อผู้ดูแลระบบ',
          });
        }
      } catch (error) {
        Toast.fire({
          icon: 'error',
          title: 'มีข้อผิดพลาด, กรุณาติดต่อผู้ดูแลระบบ',
        });
      }
    }
    if (isValid === 0) {
      if (formRegister.error_type === '1' && formRegister.error_prescription_ward_code === '') {
        setIsNotSelectWard(true);
      } else if (formRegister.error_type === '2' && formRegister.error_dispensing_ward_code === '') {
        setIsNotSelectWard(true);
      } else if (formRegister.error_type === '3' && formRegister.error_pre_administration_ward_code === '') {
        setIsNotSelectWard(true);
      } else if (formRegister.error_type === '4' && formRegister.error_adminstration_ward_code === '') {
        setIsNotSelectWard(true);
      } else if (formRegister.error_type === '5' && formRegister.error_processing_ward_code === '') {
        setIsNotSelectWard(true);
      } else {
        setIsNotSelectWard(false);
        create();
      }
    }
    event.preventDefault();
  };

  const loadEditData = async (errorId) => {
    setIsOpenForm(true);
    // Med Error Data
    const medErrorShowData = medErrorShow[0];
    popKeys(medErrorShowData, [
      'error_dispensing_person_name',
      'error_key_person_name',
      'error_processing_person_name',
      'last_updated',
      'error_type_detail',
    ]);
    const labelError = medErrorType.find((_errorType) => _errorType.error_type === +medErrorShowData.error_type);

    setErrorTypeField(labelError.error_field);
    setErrorTypeWardField(labelError.error_field_ward);
    setErrorTypeWardFieldCode(labelError.error_field_ward_code);
    setLabelErrorType(labelError.error_type_name);
    loadPerson(token, medErrorShowData.error_type);

    if (+medErrorShowData.error_type === 2 || +medErrorShowData.error_type === 5) {
      loadDrugItems(token);
    }

    setFormRegister(medErrorShowData);
    setFormRegister((prestate) => ({
      ...prestate,
      error_id: +errorId,
      error_type: medErrorShowData.error_type.toString(),
      error_date: moment(medErrorShowData.error_date).format('YYYY-MM-DD'),
      error_level_old: medErrorShowData.error_level,
    }));
  };
  // End Form Register & Update

  useEffect(() => {
    async function checkVerifyToken() {
      setIsLoading(true);
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;
      if (statusCode === 200 && profile) {
        if (access_token) {
          let userLoginName = profile.rule && profile.rule === 9 ? '' : profile.loginname;
          const loginname = profile.loginname.substring(0, 3);
          let sections = 0;
          if (loginname.trim() === '103') {
            sections = 2;
          } else {
            sections = 1;
          }
          loadMedError(access_token, userLoginName);
          setToken(access_token);
          setUser([profile]);

          // Form Register & Update
          loadDepartment(access_token, 'Y');
          loadAnalysis(access_token, 'Y');
          loadDoctor(access_token);
          loadErrorType(access_token, sections);
          setFormRegister((prestate) => ({
            ...prestate,
            error_user: profile.loginname,
            error_user_name: profile.name,
            error_section: sections,
          }));
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, []);

  const emptyRowsMedError = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - medErrorData.length) : 0;

  const filteredMedError = applySortFilter(medErrorData, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredMedError.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> {isOpenForm ? 'Register' : 'Main'} | Medication error </title>
      </Helmet>

      <Container maxWidth="false">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          {isOpenForm ? (
            <Typography variant="h4" gutterBottom>
              แบบเก็บข้อมูล Medication error{' '}
              {`${formRegister.error_section === 1 ? 'โรงพยาบาลร้อยเอ็ด' : 'กลุ่มงานเภสัชกรรม'}`}
            </Typography>
          ) : (
            <>
              <Typography variant="h4" gutterBottom>
                ข้อมูล Medication error
              </Typography>
              <Button variant="contained" onClick={handleGoToRegister} startIcon={<Iconify icon="eva:plus-fill" />}>
                บันทึกข้อมูล Med Error
              </Button>
            </>
          )}
        </Stack>

        {isOpenForm ? (
          <Card>
            <Box component="form" noValidate autoComplete="off" onSubmit={onSubmitHandler} sx={{ py: 5, px: 5 }}>
              <LocalizationProvider dateAdapter={AdapterDateFnsTH}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                  <Button
                    variant="contained"
                    onClick={handleGoToBack}
                    startIcon={<Iconify icon="eva:arrow-ios-back-outline" />}
                  >
                    กลับไปยังหน้าแรก
                  </Button>
                </Stack>
                <Stack spacing={3}>
                  <InputLabel id="demo-simple-select-label">
                    <Typography variant="span" style={{ color: colorRed }}>
                      * จำเป็นต้องกรอก
                    </Typography>
                  </InputLabel>
                  <DesktopDatePicker
                    label="วัน/เดือน/ปี ที่พบเหตุการณ์"
                    inputFormat="d MMMM yyyy"
                    value={formRegister.error_date}
                    name="error_date"
                    onChange={handleChangeDate}
                    renderInput={(params) => <TextField {...params} />}
                  />
                  {/* {`error_date [${JSON.stringify(formRegister.error_date)}]`} */}

                  <FormControl fullWidth error={formRegisterRule.error_time.error}>
                    <InputLabel id="demo-simple-select-label">
                      เวลาที่เกิดเหตุการณ์{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
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
                    {/* {`error_time [${JSON.stringify(formRegister.error_time)}]`} */}
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
                      <Typography variant="span" style={{ color: colorRed }}>
                        *
                      </Typography>
                    </FormLabel>
                    <Autocomplete
                      fullWidth
                      options={department}
                      isOptionEqualToValue={(option, value) => option.med_error_depcode === formRegister.error_ward}
                      getOptionLabel={(option) => option.med_error_depname}
                      onChange={(event, newValue) => {
                        handleChangeAutoComplte(
                          'error_ward_name',
                          newValue !== null ? newValue.med_error_depname : newValue
                        );
                        handleChangeAutoComplte(
                          'error_ward',
                          newValue !== null ? newValue.med_error_depcode : newValue
                        );
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
                    {/* {`error_ward [${formRegister.error_ward}]\n`} */}
                    {/* {`error_ward_name [${formRegister.error_ward_name}]`} */}
                  </FormControl>

                  <FormControl error={formRegisterRule.error_event.error}>
                    <FormLabel id="error_event_label">
                      เหตุการณ์ที่พบความคลาดเคลื่อน{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
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
                    {/* {`error_event [${JSON.stringify(formRegister.error_event)}]`} */}
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
                    {/* {`hn [${JSON.stringify(formRegister.hn)}]`} */}
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
                    {/* {`an [${JSON.stringify(formRegister.an)}]`} */}
                  </FormControl>

                  <FormControl error={formRegisterRule.error_level.error}>
                    <FormLabel id="error_level_label">
                      ระดับความรุนแรง{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
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
                    {/* {`error_level [${formRegister.error_level}]\n`} */}
                    {/* {`error_level_detail [${formRegister.error_level_detail}]`} */}
                  </FormControl>

                  <FormControl error={formRegisterRule.error_alert.error}>
                    <FormLabel id="error_alert_label">
                      เหตุการณ์ที่พบความคลาดเคลื่อน เป็นเหตุการณ์ที่เกี่ยวข้องกับยา High Alert Drugs (HAD) หรือไม่{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
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
                    {/* {`error_alert [${JSON.stringify(formRegister.error_alert)}]`} */}
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
                    {/* {`error_clear [${JSON.stringify(formRegister.error_clear)}]`} */}
                  </FormControl>

                  <FormControl error={formRegisterRule.error_analysis.error}>
                    <FormLabel id="error_analysis_label">
                      วิเคราะห์สาเหตุ{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
                        *
                      </Typography>
                    </FormLabel>

                    <Autocomplete
                      fullWidth
                      disablePortal
                      options={errerAnalysis}
                      isOptionEqualToValue={(option, value) =>
                        option.error_analysis_id === formRegister.error_analysis_id
                      }
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
                    {/* {`error_analysis_id [${formRegister.error_analysis_id}]\n`} */}
                    {/* {`error_analysis [${formRegister.error_analysis}]`} */}
                  </FormControl>

                  <FormControl error={formRegisterRule.error_type.error}>
                    <FormLabel id="error_type_label">
                      ประเภทของ Error{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
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
                      {medErrorType.map((optionErrorType) => (
                        <FormControlLabel
                          key={optionErrorType.error_type}
                          value={`${optionErrorType.error_type}`}
                          control={<Radio />}
                          label={`${optionErrorType.error_type_name}`}
                        />
                      ))}
                    </RadioGroup>
                    {/* {`error_type [${JSON.stringify(
                      formRegister.error_type
                    )}] >> type(${typeof formRegister.error_type})\n`}
                    {`error_type_name [${JSON.stringify(formRegister.error_type_name)}]`} */}
                    <FormHelperText>
                      {formRegisterRule.error_type.error && formRegisterRule.error_type.message}
                    </FormHelperText>
                  </FormControl>
                  {formRegister.error_type !== '' && (
                    <>
                      {/* {`error_section ${typeof formRegister.error_section} >> [${formRegister.error_section}]`} */}
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                          {labelErrorType}
                        </Typography>
                      </Divider>
                      <FormControl error={isNotSelectWard}>
                        <FormLabel id={`${errorTypeWardField}_label`}>
                          Ward/หน่วยงาน ที่เกี่ยวข้อง{' '}
                          <Typography variant="span" style={{ color: colorRed }}>
                            *
                          </Typography>
                        </FormLabel>
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
                            handleSectionWard(errorTypeWardField, newValue !== null ? newValue.med_error_depname : '');
                            handleSectionWard(
                              errorTypeWardFieldCode,
                              newValue !== null ? newValue.med_error_depcode : ''
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="ค้นหาหน่วยงาน"
                              error={isNotSelectWard}
                              helperText={isNotSelectWard && `กรุณาเลือก Ward/หน่วยงาน ที่เกี่ยวข้อง`}
                            />
                          )}
                        />
                      </FormControl>
                      {/* {`errorTypeWardFieldCode >> [${JSON.stringify(errorTypeWardFieldCode)}] ==> ${
                        formRegister[errorTypeWardFieldCode]
                      } \n`}
                      <br />
                      {`errorTypeWardField >> [${JSON.stringify(errorTypeWardField)}] ==> ${
                        formRegister[errorTypeWardField]
                      } \n`}
                      <br /> */}

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
                                setFormRegister((prestate) => ({
                                  ...prestate,
                                  error_doctor_code: newValue !== null ? newValue.doctor_code : '',
                                  error_doctor: newValue !== null ? newValue.doctor_name : '',
                                }));
                              }}
                              value={{
                                doctor_name: formRegister.error_doctor,
                                doctor_code: formRegister.error_doctor_code,
                              }}
                              renderInput={(params) => <TextField {...params} label="ระบุชื่อแพทย์ผู้สั่งยา" />}
                            />
                            {/* {`error_doctor_code [${JSON.stringify(formRegister.error_doctor_code)}] \n`}
                            {`error_doctor [${JSON.stringify(formRegister.error_doctor)}]`} */}
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
                      {/* {`errorTypeField[${errorTypeField}] >> [${JSON.stringify(formRegister[errorTypeField])}]`} */}
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
                              getOptionLabel={(option) =>
                                `${option.error_key_person_name} (${option.error_key_sec_name})`
                              }
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
                          {/* <FormControl>
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
                              getOptionLabel={(option) =>
                                `${option.error_key_person_name} (${option.error_key_sec_name})`
                              }
                              onChange={(event, newValue) => {
                                setFormRegister((prestate) => ({
                                  ...prestate,
                                  error_key_person: newValue !== null ? newValue.error_key_person_id : '',
                                }));
                              }}
                              renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                            />
                          </FormControl> */}
                          {/* {JSON.stringify(isShow)} */}
                          {isShow.section4 && (
                            <>
                              <Typography variant="h6" component="h2" sx={{ color: 'primary.main' }}>
                                คู่ยาที่พิมพ์/รับ order คลาดเคลื่อน
                              </Typography>

                              <FormControl>
                                <FormLabel id="error_processing_person_label" className="mb-2">
                                  ความคลาดเคลื่อนในการพิมพ์ที่เกิดขึ้น เกิดจาก
                                </FormLabel>
                                <Autocomplete
                                  fullWidth
                                  disablePortal
                                  options={processingPerson}
                                  isOptionEqualToValue={(option) =>
                                    option.error_key_person_name === formRegister.error_processing_person
                                  }
                                  getOptionLabel={(option) =>
                                    `${option.error_key_person_name} (${option.error_key_sec_name})`
                                  }
                                  onChange={(event, newValue) => {
                                    setFormRegister((prestate) => ({
                                      ...prestate,
                                      error_processing_person: newValue !== null ? newValue.error_key_person_id : '',
                                    }));
                                  }}
                                  renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                                />
                              </FormControl>

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
                                  getOptionLabel={(option) =>
                                    `${option.error_key_person_name} (${option.error_key_sec_name})`
                                  }
                                  onChange={(event, newValue) => {
                                    setFormRegister((prestate) => ({
                                      ...prestate,
                                      error_processing_person: newValue !== null ? newValue.error_key_person_id : '',
                                    }));
                                  }}
                                  renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                                />
                              </FormControl>
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
                                  ยาที่จัดผิด
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
                                <FormLabel id="error_processing_wrong_unit_label">จำนวนที่จัดผิด</FormLabel>
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
                      <Iconify icon={'eva:save-outline'} width={32} sx={{ mr: 1 }} color="success" /> {'บันทึก'}
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
                      <Iconify icon={'eva:edit-2-outline'} width={32} sx={{ mr: 1 }} color="success" />{' '}
                      {'เปลี่ยนแปลงข้อมูล'}
                    </LoadingButton>
                  )}
                </Stack>
              </LocalizationProvider>
            </Box>
          </Card>
        ) : (
          <Card>
            <UserListToolbar
              filterName={filterName}
              onFilterName={handleFilterByName}
              onFilterDate={handleFilterChangeDate}
              dateStart={dateFilter.dateStart}
              dateEnd={dateFilter.dateEnd}
            />
            <Grid container spacing={1} sx={{ paddingLeft: '24px' }}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Stack direction="row" alignItems="center" justifyContent="flex-start" mb={2}>
                  <Stack mr={2}>
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        handlwSearchWithDate(e);
                      }}
                      startIcon={<Iconify icon="eva:search-fill" />}
                      sx={{ paddingRight: '8px' }}
                    >
                      ค้นหาจากวันที่
                    </Button>
                  </Stack>
                  <Stack>
                    <Button variant="contained" onClick={handleShowAll} startIcon={<Iconify icon="eva:sync-fill" />}>
                      แสดงทั้งหมด
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} mb={2}>
                {sections === 'ALL' ? (
                  <Typography variant="body1">แสดงทั้งหมด</Typography>
                ) : (
                  <Typography variant="body1">
                    ข้อมูลวันที่{' '}
                    {new Date(dateFilter.dateStart).getTime() === new Date(dateFilter.dateEnd).getTime()
                      ? formatDateTime(dateFilter.dateStart)
                      : `${formatDateTime(dateFilter.dateStart)} ถึง ${formatDateTime(dateFilter.dateEnd)}`}
                  </Typography>
                )}

                <Typography variant="h6">
                  {medErrorData.length > 0 ? `ทั้งหมด ${medErrorData.length} รายการ` : ''}
                </Typography>
              </Grid>
            </Grid>
            <Scrollbar>
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD_MEDERROR}
                    rowCount={medErrorData.length}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    <Backdrop
                      sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 10,
                        textAlign: 'center',
                      }}
                      open={isLoading}
                      onClick={handleClose}
                    >
                      <CircularProgress color="inherit" sx={{ mr: 1 }} />
                      <Typography variant="body1">{'กำลังโหลดข้อมูล...'}</Typography>
                    </Backdrop>
                    {filteredMedError.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const {
                        error_id,
                        error_section,
                        error_date,
                        error_time,
                        error_ward_name,
                        error_event,
                        error_level,
                        error_clear,
                        error_analysis,
                        error_doctor,
                        error_type_name,
                        error_alert,
                        error_type_detail,
                        is_rca,
                      } = row;
                      return (
                        <Tooltip title="ดูเพิ่มเติม" key={error_id}>
                          <TableRow hover style={{ cursor: 'pointer' }} tabIndex={-1}>
                            <TableCell align="center" onClick={(e) => handleClickOpenModal(e, error_id)}>
                              <Button
                                color={is_rca === 'Y' ? 'success' : undefined}
                                startIcon={is_rca === 'Y' ? <Iconify icon="eva:checkmark-circle-outline" /> : undefined}
                              >
                                {error_section !== '' ? (error_section === 1 ? ' รพ.ร้อยเอ็ด' : ' เภสัชกรรม') : ''}
                              </Button>
                            </TableCell>
                            <TableCell align="center" onClick={(e) => handleClickOpenModal(e, error_id)}>
                              {error_date !== '' ? formatDateTime(error_date, 1) : ''}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_time}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_ward_name}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '300px',
                              }}
                            >
                              {error_event}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100px',
                              }}
                            >
                              {error_level}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '300px',
                              }}
                            >
                              {error_clear}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_analysis}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_doctor}
                            </TableCell>
                            <TableCell
                              align="center"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_type_name}
                            </TableCell>
                            <TableCell
                              align="left"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_type_detail}
                            </TableCell>
                            <TableCell
                              align="center"
                              onClick={(e) => handleClickOpenModal(e, error_id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '200px',
                              }}
                            >
                              {error_alert}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="จัดการ">
                                <IconButton
                                  size="large"
                                  color="info"
                                  onClick={(event) => handleOpenMenu(event, error_id)}
                                >
                                  <Iconify icon={'eva:settings-2-outline'} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        </Tooltip>
                      );
                    })}
                    {emptyRowsMedError > 0 && (
                      <TableRow style={{ height: 53 * emptyRowsMedError }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                  {isNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <Paper
                            sx={{
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="h6" paragraph>
                              ไม่พบข้อมูล
                            </Typography>

                            <Typography variant="body2">
                              ไม่มีผลลัพธ์ที่ค้นหา &nbsp;
                              <strong>&quot;{filterName}&quot;</strong>.
                              <br /> กรุณาลองใหม่อีกครั้ง
                            </Typography>
                          </Paper>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                  {medErrorData.length === 0 && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <Paper
                            sx={{
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="body2">ไม่มีข้อมูล</Typography>
                          </Paper>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 100]}
              component="div"
              count={medErrorData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        )}
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={(e) => handleEdit(e, selectedID)}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          แก้ไข
        </MenuItem>

        <MenuItem onClick={(e) => handleDelete(e, selectedID)} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          ลบ
        </MenuItem>
      </Popover>
      <Dialog
        open={Boolean(isShowModal)}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {medErrorShow.length > 0 &&
          medErrorShow.map((dataMedError) => {
            const {
              error_id,
              error_section,
              error_date,
              error_datetime,
              error_user_name,
              error_time,
              error_ward_name,
              error_event,
              error_level,
              error_level_detail,
              error_clear,
              error_analysis,
              error_type,
              error_type_name,
              error_prescription_ward,
              error_doctor,
              error_prescription,
              error_processing,
              error_processing_ward,
              error_dispensing,
              error_dispensing_ward,
              error_pre_administration,
              error_pre_administration_ward,
              error_processing_right,
              error_processing_right_unit,
              error_processing_wrong,
              error_processing_wrong_unit,
              error_adminstration,
              error_adminstration_ward,
              error_dispensing_person,
              error_key_person,
              error_processing_person,
              error_alert,
              error_dispensing_person_name,
              error_key_person_name,
              error_processing_person_name,
              is_rca,
            } = dataMedError;
            return (
              <Fragment key={error_id}>
                <DialogTitle id="scroll-dialog-title">
                  รายละเอียดข้อมูล Medication error{' '}
                  {`${error_section === 1 ? 'โรงพยาบาลร้อยเอ็ด' : 'กลุ่มงานเภสัชกรรม'}`}
                </DialogTitle>
                <DialogContent dividers ref={descriptionElementRef} tabIndex={-1}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6} md={6}>
                        <Item>
                          <Typography variant="h6">วัน/เดือน/ปี ที่พบเหตุการณ์</Typography>
                          <Typography variant="body2">
                            {`${error_date !== '' ? formatDateTime(error_date, '') : ''}`}
                          </Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={6} md={6}>
                        <Item>
                          <Typography variant="h6">วัน/เดือน/ปี ที่บันทึก</Typography>
                          <Typography variant="body2">
                            {`${error_datetime !== '' ? formatDateTime(error_datetime, 2) : ''}`}
                          </Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={6} md={6}>
                        <Item>
                          <Typography variant="h6">ผู้บันทึก</Typography>
                          <Typography variant="body2">{error_user_name}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={6} md={6}>
                        <Item>
                          <Typography variant="h6">สถานที่เกิดเหตุการณ์</Typography>
                          <Typography variant="body2">{error_ward_name}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={6} md={6}>
                        <Item>
                          <Typography variant="h6">เวลาที่เกิดเหตุการณ์</Typography>
                          <Typography variant="body2">{error_time}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">เหตุการณ์ที่พบ</Typography>
                          <Typography variant="body2">{error_event}</Typography>
                        </Item>
                      </Grid>
                      {patientInfo.length > 0 && (
                        <>
                          <Grid item xs={6} md={6}>
                            <Item>
                              <Typography variant="h6">{`${patientInfo[0].an !== null ? 'AN' : 'HN'}`}</Typography>
                              <Typography variant="body2">
                                {`${patientInfo[0].an !== null ? patientInfo[0].an : patientInfo[0].hn}`}
                              </Typography>
                            </Item>
                          </Grid>
                          <Grid item xs={6} md={6}>
                            <Item>
                              <Typography variant="h6">ชื่อ-สกุลผู้ป่วย</Typography>
                              <Typography variant="body2">{patientInfo[0].patient_name}</Typography>
                            </Item>
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">ระดับความรุนแรง</Typography>
                          <Typography variant="body2">{`${error_level} : ${error_level_detail}`}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">เป็นเหตุการณ์ที่เกี่ยวข้องกับยา High Alert Drugs (HAD)</Typography>
                          <Typography variant="body2">{error_alert}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">การแก้ไขปัญหาเบื้องต้น</Typography>
                          <Typography variant="body2">{error_clear}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">วิเคราะห์สาเหตุ</Typography>
                          <Typography variant="body2">{error_analysis}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">ประเภทของ Error</Typography>
                          <Typography variant="body2">{error_type_name}</Typography>
                        </Item>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">Ward/หน่วยงาน ที่เกี่ยวข้อง</Typography>
                          <Typography variant="body2">
                            {error_prescription_ward}
                            {error_processing_ward}
                            {error_dispensing_ward}
                            {error_pre_administration_ward}
                            {error_adminstration_ward}
                          </Typography>
                        </Item>
                      </Grid>
                      {error_type === 1 && (
                        <Grid item xs={12} md={12}>
                          <Item>
                            <Typography variant="h6">แพทย์ผู้สั่งยา</Typography>
                            <Typography variant="body2">{error_doctor !== '' ? error_doctor : '-'}</Typography>
                          </Item>
                        </Grid>
                      )}
                      <Grid item xs={12} md={12}>
                        <Item>
                          <Typography variant="h6">{`ประเภท ${error_type_name}`}</Typography>
                          <Typography variant="body2">
                            {error_prescription}
                            {error_processing}
                            {error_dispensing}
                            {error_pre_administration}
                            {error_adminstration}
                          </Typography>
                        </Item>
                      </Grid>
                      {error_type === 2 && error_dispensing_person !== '' && (
                        <Grid item xs={12} md={12}>
                          <Item>
                            <Typography variant="h6">ความคลาดเคลื่อนในการจ่ายยาที่เกิดขึ้น เกิดจาก</Typography>
                            <Typography variant="body2">
                              {error_dispensing_person !== '' ? error_dispensing_person_name : '-'}
                            </Typography>
                          </Item>
                        </Grid>
                      )}
                      {error_type === 5 && (
                        <>
                          <Grid item xs={6} md={6}>
                            <Item>
                              <Typography variant="h6">ความคลาดเคลื่อนในการ key ยาที่เกิดขึ้น เกิดจาก</Typography>
                              <Typography variant="body2">
                                {error_key_person !== '' ? error_key_person_name : '-'}
                              </Typography>
                            </Item>
                          </Grid>
                          <Grid item xs={6} md={6}>
                            <Item>
                              <Typography variant="h6">ความคลาดเคลื่อนในการจัดยาที่เกิดขึ้น เกิดจาก</Typography>
                              <Typography variant="body2">
                                {error_processing_person !== '' ? error_processing_person_name : '-'}
                              </Typography>
                            </Item>
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <Grid container spacing={1}>
                              <Grid item xs={6} md={6}>
                                <Item>
                                  <Typography variant="h6">ชื่อยาที่แพทย์มี order</Typography>
                                  <Typography variant="body2">
                                    {error_processing_right !== '' ? error_processing_right : '-'}
                                  </Typography>
                                  <Typography variant="body2">{`จำนวนยา:  ${
                                    error_processing_right_unit !== '' ? error_processing_right_unit : '-'
                                  }`}</Typography>
                                </Item>
                              </Grid>
                              <Grid item xs={6} md={6}>
                                <Item>
                                  <Typography variant="h6">ชื่อยาที่จัดผิด</Typography>
                                  <Typography variant="body2">
                                    {error_processing_wrong !== '' ? error_processing_wrong : '-'}
                                  </Typography>
                                  <Typography variant="body2">{`จำนวนที่จัดผิด:  ${
                                    error_processing_wrong_unit !== '' ? error_processing_wrong_unit : '-'
                                  }`}</Typography>
                                </Item>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </DialogContent>
              </Fragment>
            );
          })}
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => handleUpdateRCA(e, selectedID, medErrorShow[0]?.is_rca === 'Y' ? 'N' : 'Y')}
            color={medErrorShow[0]?.is_rca === 'Y' ? 'success' : undefined}
            startIcon={medErrorShow[0]?.is_rca === 'Y' ? <Iconify icon="eva:checkmark-circle-outline" /> : undefined}
          >
            {medErrorShow[0]?.is_rca === 'Y' ? 'ข้อมูลได้รับการ RCA แล้ว' : 'ยืนยันข้อมูลได้รับการ RCA'}
          </Button>
          <Button variant="outlined" color="warning" size="small" onClick={(e) => handleEdit(e, selectedID)}>
            แก้ไขข้อมล
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => setIsShowModal(false)}>
            ปิด
          </Button>
          {JSON.stringify(user)}
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(isOpenDelete)}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ bgcolor: '#c62828', color: 'common.white' }}>
          ยืนยันการลบข้อมูล
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            ต้องการลบข้อมูล Medication error หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={(e) => handleConfirmDelete(e, selectedID)} autoFocus sx={{ color: 'error.main' }}>
            <Iconify icon={'eva:trash-2-outline'} /> ยืนยัน
          </Button>
          <Button onClick={handleClose}>
            <Iconify icon={'eva:close-outline'} /> ปิด
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(isNotify)}
        onClose={handleNotifyClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={isNotify}
        maxWidth={'sm'}
      >
        <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'common.white' }}>
          <Iconify icon={'eva:bell-outline'} /> {'แจ้งเตือน'}
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            {notifyMessage.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => handleNotifyClose(e, notifyMessage.sec)} sx={{ color: 'error.main' }}>
            <Iconify icon={'material-symbols:close'} /> ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
