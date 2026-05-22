import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
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
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';


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

import { styled, alpha } from '@mui/material/styles';



// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// MedError Level
import { MedErrorLevel } from '../data/DataMedError';
// components
import Iconify from '../components/iconify';

// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// Lib Auth
import { verifyToken } from '../libs/Auth';
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

// ============================================================================
// Constants
// ============================================================================

// สีระดับความรุนแรง — ไล่ตามระดับอันตราย (เหมือน ReportSummary6)
const SEVERITY_COLORS = {
  A: { bg: 'rgba(148, 163, 184, 0.06)', chipSx: { bgcolor: '#94a3b8', color: '#fff' }, desc: 'ไม่มีความคลาดเคลื่อน' },
  B: { bg: 'rgba(34, 197, 94, 0.06)', chipSx: { bgcolor: '#22c55e', color: '#fff' }, desc: 'ไม่ถึงตัวผู้ป่วย' },
  C: { bg: 'rgba(16, 185, 129, 0.06)', chipSx: { bgcolor: '#10b981', color: '#fff' }, desc: 'ถึงผู้ป่วย ไม่อันตราย' },
  D: { bg: 'rgba(6, 182, 212, 0.06)', chipSx: { bgcolor: '#06b6d4', color: '#fff' }, desc: 'ต้องติดตามเพิ่ม' },
  E: { bg: 'rgba(245, 158, 11, 0.10)', chipSx: { bgcolor: '#f59e0b', color: '#fff' }, desc: 'อันตรายชั่วคราว ต้องรักษา' },
  F: { bg: 'rgba(234, 88, 12, 0.10)', chipSx: { bgcolor: '#ea580c', color: '#fff' }, desc: 'ต้องนอน รพ. / ยืดเวลารักษา' },
  G: { bg: 'rgba(239, 68, 68, 0.08)', chipSx: { bgcolor: '#ef4444', color: '#fff' }, desc: 'อันตรายถาวร' },
  H: { bg: 'rgba(220, 38, 38, 0.10)', chipSx: { bgcolor: '#dc2626', color: '#fff' }, desc: 'เกือบเสียชีวิต' },
  I: { bg: 'rgba(127, 29, 29, 0.14)', chipSx: { bgcolor: '#7f1d1d', color: '#fff' }, desc: 'เสียชีวิต' },
};

const HAD_LABEL = 'High Alert Drugs';

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

const createInitialFormRegister = (user, section, date = formatDate(dayjs())) => ({
  error_id: 0,
  error_section: section,
  error_date: date,
  error_user: user?.loginname || '',
  error_user_name: user?.name || '',
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
  error_transcribing_person: '',
  error_transcribing: '',
  error_transcribing_ward_code: '',
  error_transcribing_ward: '',
  error_transcribing_right_icode: '',
  error_transcribing_right: '',
  error_transcribing_right_unit: '',
  error_transcribing_wrong_icode: '',
  error_transcribing_wrong: '',
  error_transcribing_wrong_unit: '',
  error_alert: '',
  hn: '',
  an: '',
  app_new: 'Y',
});

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
  { id: 'error_section', label: 'แบบฟอร์ม', alignRight: false, alignHead: 'center', minWidth: 90 },
  { id: 'error_date', label: 'วัน/เดือน/ปี ที่เกิดเหตุการณ์', alignRight: false, alignHead: 'center', minWidth: 180 },
  { id: 'error_time', label: 'เวลาที่พบเหตุการณ์', alignRight: false, alignHead: 'center', minWidth: 140 },
  { id: 'error_ward_name', label: 'สถานที่เกิดเหตุ/พบเหตุ', alignRight: false, alignHead: 'center', minWidth: 180 },
  { id: 'error_event', label: 'เหตุการณ์ที่พบ', alignRight: false, alignHead: 'center', minWidth: 220 },
  { id: 'error_level', label: 'ระดับความรุนแรง', alignRight: false, alignHead: 'center', minWidth: 130 },
  { id: 'error_clear', label: 'การแก้ไขปัญหาเบื้องต้น', alignRight: false, alignHead: 'center', minWidth: 180 },
  { id: 'error_analysis', label: 'วิเคราะห์สาเหตุ', alignRight: false, alignHead: 'center', minWidth: 160 },
  { id: 'error_doctor', label: 'แพทย์ผู้สั่งยา', alignRight: false, alignHead: 'center', minWidth: 140 },
  { id: 'error_type_name', label: 'ประเภทของ Error', alignRight: false, alignHead: 'center', minWidth: 150 },
  { id: 'error_type_detail', label: 'รายละเอียด Error', alignRight: false, alignHead: 'center', minWidth: 160 },
  { id: 'error_alert', label: 'เหตุการณ์ที่พบความคลาดเคลื่อน', alignRight: false, alignHead: 'center', minWidth: 220 },
  { id: 'error_user_name', label: 'ผู้บันทึก', alignRight: false, alignHead: 'center', minWidth: 140 },
  { id: '', label: 'จัดการ', minWidth: 100 },
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
  const [token, setToken] = useState(null);

  const [valueErrorDate] = useState(dayjs(new Date()));
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [department, setDepartment] = useState([]);

  const [errerAnalysis, setErrerAnalysis] = useState([]);

  const [medErrorType, setMedErrorType] = useState([]);

  const [keyPerson, setKeyPerson] = useState([]);

  const [processingPerson, setProcessingPerson] = useState([]);

  const [drugItem, setDrugItem] = useState([]);

  const [isShow, setIsShow] = useState({
    section4: false,
    section5: false,
    section6: false,
  });

  const [errorTypeField, setErrorTypeField] = useState('');
  const [errorTypeWardField, setErrorTypeWardField] = useState('');
  const [errorTypeWardFieldCode, setErrorTypeWardFieldCode] = useState('');
  const [labelErrorType, setLabelErrorType] = useState('');
  const [optionErrorType, setOptionErrorType] = useState([]);

  const [doctor, setDoctor] = useState([]);

  const [formRegister, setFormRegister] = useState(() => createInitialFormRegister(undefined, 0, formatDate(dayjs())));

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

  const [, setIsOpen] = useState(false);
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

  const [filterDeps, setFilterDeps] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [filterLevels, setFilterLevels] = useState([]);
  const [filterAlert, setFilterAlert] = useState('ALL');

  const [sections, setSection] = useState('');

  // Dual Scrollbar Refs
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(2200);

  const handleTopScroll = (e) => {
    if (bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleBottomScroll = (e) => {
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };


  // Patient Info
  const [patientInfo, setPatientInfo] = useState([]);

  // Filter by Date
  const [, setIsUseFilterDate] = useState(false);

  // State RCA
  const [showRcaInput, setShowRcaInput] = useState(false);
  const [rcaDetail, setRcaDetail] = useState('');

  const [defaultErrorAnalysis, setDefaultErrorAnalysis] = useState([]);

  const currentUser = user[0] || null;

  const canManageRow = (row) => {
    if (!currentUser) return false;

    // rule 9 แก้ไข/ลบได้ทุกแถว
    if (currentUser.rule === 9) return true;

    // คนอื่น แก้ได้เฉพาะแถวที่ตัวเองเป็นคนบันทึก
    return row.error_user === currentUser.loginname;
  };

  const ensureCanManageById = (id) => {
    if (!currentUser) return false;

    const row = medErrorData.find((item) => item.error_id === id) || medErrorShow.find((item) => item.error_id === id);

    if (!row) {
      Toast.fire({
        icon: 'error',
        title: 'ไม่พบข้อมูลรายการนี้',
      });
      return false;
    }

    if (!canManageRow(row)) {
      Toast.fire({
        icon: 'error',
        title: 'คุณไม่มีสิทธิ์แก้ไข/ลบรายการนี้',
      });
      return false;
    }

    return true;
  };

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
    e.preventDefault();

    if (!ensureCanManageById(id)) return;

    setIsShowModal(false);
    loadEditData(id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (!ensureCanManageById(selectedID)) return;

    setOpen(null);
    setIsOpenDelete(true);
  };

  const handleUpdateRCA = async (e, id, is_rca, rca_detail = '') => {
    const nameRCA = user[0].rule && user[0].rule === 9 ? user[0].name : '';
    const params = {
      error_id: id,
      is_rca: is_rca,
      rca_text: rca_detail,
      rca_by: nameRCA,
    };

    const UpdateStatusRCA = await updateRCA(token, params);
    const { statusCode, medErrorList, medErrorData } = UpdateStatusRCA.data;

    if (statusCode === 200 && medErrorList > 0) {
      Toast.fire({
        icon: 'success',
        title: 'อัพเดทข้อมูลเรียบร้อย',
      });
      setShowRcaInput(false);
      setMedErrorShow(medErrorData);
      setRcaDetail(medErrorData[0].rca_text);
      const userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
      await loadMedError(token, userLoginName);
    }

    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    e.preventDefault();
    if (!ensureCanManageById(id)) return;

    const deleleMedError = await medErrorDelete(id, token);

    const { statusCode, deleteMedError } = deleleMedError.data;

    if (statusCode === 200 && deleteMedError > 0) {
      Toast.fire({
        icon: 'success',
        title: 'ลบข้อมูลเรียบร้อย',
      });

      const userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
      await loadMedError(token, userLoginName);
    }
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
    event.preventDefault();
    setIsOpenForm(true);

    const loginname = user[0].loginname.substring(0, 3);
    const sections = loginname.trim() === '103' ? 2 : 1;

    setPage(sections);
    setFormRegister(createInitialFormRegister(user[0], sections, formatDate(valueErrorDate)));
  };

  const handleClickOpenModal = (event, errorId) => {
    event.preventDefault();

    setIsShowModal(true);
    setSelectedID(errorId);
    const data = filter(medErrorData, (_mederror) => _mederror.error_id === errorId);
    const patientHN = data[0].hn || data[0].an;
    loadPatientInfo(token, patientHN);
    setMedErrorShow(data);

    setShowRcaInput(false);
    setRcaDetail(data[0].rca_text || '');
  };

  const loadMedError = async (auth_token, error_user = '', ignoreDate = false) => {
    setIsLoading(true);

    try {
      let GetMedError;

      if (ignoreDate) {
        GetMedError = await medError(auth_token, error_user);
      } else {
        const hasDateRange = dateFilter.dateStart && dateFilter.dateEnd;

        GetMedError = await medError(
          auth_token,
          error_user,
          hasDateRange ? dateFilter.dateStart : '',
          hasDateRange ? dateFilter.dateEnd : ''
        );
      }

      const { statusCode, medErrorList } = GetMedError.data;

      if (statusCode === 200 && medErrorList && !_.isEmpty(medErrorList)) {
        setMedErrorData(medErrorList);
      } else {
        setMedErrorData([]);
      }

      setIsOpen(false);
      setIsNotify(false);
    } catch (error) {
      handleCatchAxios(error, 'load');
    } finally {
      setIsLoading(false);
    }
  };

  const descriptionElementRef = useRef(null);

  const handleCatchAxios = (errorCatch) => {
    if (errorCatch.response) {
      const { status } = errorCatch.response;
      if (status === 404) {
        setTimeout(() => {
          setIsLoading(false);
          // Toast.fire({
          //   icon: 'error',
          //   title: 'ไม่พบข้อมูล',
          // });
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
  const loadErrorType = async (auth_token, pages, isAdmin) => {
    try {
      // ถ้าเป็นแอดมินใช้ 3, ถ้าไม่ใช่ใช้ค่าที่ส่งมา
      const pageToUse = isAdmin ? 3 : pages;

      const ErrorType = await getErrorTypeByType(auth_token, pageToUse);
      const { statusCode, errorTypeList } = ErrorType.data;

      if (statusCode === 200 && errorTypeList && !_.isEmpty(errorTypeList)) {
        setMedErrorType(errorTypeList);
      } else {
        // กันเคสไม่เจอข้อมูล
        setMedErrorType([]);
      }
    } catch (error) {
      // ถ้ามีฟังก์ชัน handleCatchAxios อยู่แล้วก็เรียกใช้ได้เลย
      // handleCatchAxios(error, 'loadErrorType');
      console.error('loadErrorType error:', error);
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
    try {
      const errorTypeId = Number(id); // กันกรณีส่งมาเป็น string

      const resp = await getMedErrorPerson(auth_token);
      const { statusCode, personList } = resp.data || {};

      if (statusCode !== 200 || !Array.isArray(personList) || _.isEmpty(personList)) {
        // ถ้า API fail หรือไม่มีข้อมูล → เคลียร์ state ทิ้ง ป้องกันข้อมูลค้าง
        setKeyPerson([]);
        setProcessingPerson([]);
        return;
      }

      const personKeyArray = personList.filter((val) => val.error_key_sec === 1 || val.error_key_sec === 3);
      const personProcessArray = personList.filter((val) => val.error_key_sec === 2);

      // ใช้ errorTypeId แทน id เฉย ๆ เพื่อเคลียร์ความสับสนว่าต้องเป็น number
      if ([2, 5, 6].includes(errorTypeId)) {
        setKeyPerson(personKeyArray);
        if (errorTypeId === 6) {
          setProcessingPerson(personList);
        } else {
          setProcessingPerson(personProcessArray);
        }

        // ตาม logic เดิม: 2, 5, 6 ทั้งหมดเรียก loadDrugItems
        loadDrugItems(auth_token);
      } else {
        // ถ้าไม่ใช่ type ที่ใช้งาน → เคลียร์ state ป้องกันแสดง option เก่าค้าง
        setKeyPerson([]);
        setProcessingPerson([]);
      }
    } catch (error) {
      setKeyPerson([]);
      setProcessingPerson([]);
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
    const { name, value } = event.target; // value จาก Radio / Select เป็น string
    const valueStr = String(value);

    // หา config ของ error type ที่เลือก
    const labelError = medErrorType.find((elementErrorType) => String(elementErrorType.error_type) === valueStr);

    // ดึงค่า field ต่าง ๆ แบบปลอดภัย
    const errorField = labelError?.error_field ?? '';
    const errorFieldWard = labelError?.error_field_ward ?? '';
    const errorFieldWardCode = labelError?.error_field_ward_code ?? '';
    const errorTypeName = labelError?.error_type_name ?? '';

    // set state สำหรับฟิลด์ที่เกี่ยวกับประเภท error
    setErrorTypeField(errorField);
    setErrorTypeWardField(errorFieldWard);
    setErrorTypeWardFieldCode(errorFieldWardCode);
    setLabelErrorType(errorTypeName);

    // โหลด options ตาม error type
    loadOptionErrorType(token, valueStr);
    loadPerson(token, valueStr); // ถ้า backend ต้องการ number ค่อยแปลงเป็น Number(valueStr)

    // กรณี type 2 และ 5 ต้องโหลด drug item
    if (valueStr === '2' || valueStr === '5' || valueStr === '6') {
      loadDrugItems(token);
    }

    // เคลียร์ field ที่ต้อง reset เมื่อเปลี่ยนประเภท error + set error_type ใหม่
    setFormRegister((prev) => ({
      ...prev,
      // clear ฟิลด์ที่ไม่เกี่ยวกับ type ใหม่
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
      error_transcribing: '',
      error_transcribing_ward_code: '',
      error_transcribing_ward: '',

      // set type ใหม่
      [name]: valueStr, // โดยมาก name = 'error_type'
      error_type_name: errorTypeName,
    }));

    // reset การแสดง section 4, 5
    setIsShow((prev) => ({
      ...prev,
      section4: false,
      section5: false,
      section6: false,
    }));
  };

  // ใช้งานอยู่ Form 2
  const checkErrorType = (value, errorType) => {
    // value: ค่าที่ส่งมาจาก error_type_list (เช่น "2.1 xxx") หรือ null
    if (typeof value === 'string' && value.trim() !== '') {
      const [firstTokenRaw] = value.split(' ');
      const firstToken = firstTokenRaw.trim();

      const ctrlSection4 = ['1.1', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '3.1', '3.2', '4.1'];
      const ctrlSection5 = ['2.15', '2.16', '2.17', '2.18', '2.19', '2.20', '4.2'];
      const ctrlSection6 = ['1.1', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '3.1', '3.2', '4.1'];

      let nextShow = {
        section4: false,
        section5: false,
        section6: false,
      };

      if (ctrlSection4.includes(firstToken) && errorType === '4') {
        nextShow = { section4: true, section5: false, section6: false };
      } else if (ctrlSection5.includes(firstToken) && errorType === '5') {
        nextShow = { section4: false, section5: true, section6: false };
      } else if (ctrlSection6.includes(firstToken) && errorType === '6') {
        nextShow = { section4: false, section5: false, section6: true };
      }

      setIsShow(nextShow);

      // เคลียร์ค่าใน formRegister ที่เกี่ยวข้องกับ section เหล่านี้
      setFormRegister((prev) => {
        const base = {
          ...prev,
          error_key_person: '',
          error_processing_person: '',
          error_processing_right_icode: '',
          error_processing_right: '',
          error_processing_right_unit: '',
          error_processing_wrong_icode: '',
          error_processing_wrong: '',
          error_processing_wrong_unit: '',
          error_dispensing_person: '',
          error_transcribing_right_icode: '',
          error_transcribing_right: '',
          error_transcribing_right_unit: '',
          error_transcribing_wrong_icode: '',
          error_transcribing_wrong: '',
          error_transcribing_wrong_unit: '',
        };

        // ถ้าไม่ใช่ error_type = '1' ให้เคลียร์ข้อมูลหมอด้วย
        if (prev.error_type !== '1') {
          base.error_doctor_code = '';
          base.error_doctor = '';
        }

        return base;
      });
    } else {
      // กรณี value เป็น null, undefined, หรือ string ว่าง → ปิดทุก section
      setIsShow({
        section4: false,
        section5: false,
        section6: false,
      });
      // ถ้าต้องการให้เคลียร์ field ด้วยเวลายกเลิกการเลือก ก็สามารถเพิ่ม setFormRegister แบบเดียวกับด้านบนได้
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
    setFormRegister(createInitialFormRegister(user[0], sections, formatDate(valueErrorDate)));
    event.preventDefault();
  };

  // #ใช้อยู่ ปุ่มแสดงทั้งหมด
  const handleShowAll = () => {
    const userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
    setSection('ALL');
    setIsUseFilterDate(false);
    setDateFilter({
      dateStart: formatDate(dayjs().startOf('month')),
      dateEnd: formatDate(dayjs()),
    });
    setFilterDeps([]);
    setFilterType(null);
    setFilterLevels([]);
    setFilterAlert('ALL');

    loadMedError(token, userLoginName, true); // ignoreDate = true
  };

  // #ใช้อยู่ ปุ่มแสดงทั้งหมด
  const handleSearchWithDate = () => {
    const userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
    setIsUseFilterDate(true);
    setSection('');
    loadMedError(token, userLoginName, false);
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
    async function createOrUpdate() {
      try {
        // Clone the formRegister to avoid mutating the state directly
        // and to handle conditional field removal for Admins
        const payload = { ...formRegister };

        if (user[0].rule === 9 && formRegister.error_id > 0) {
          // If Admin is updating (error_id > 0), DO NOT update the user/reporter info
          // so the original reporter remains in the record.
          delete payload.error_user;
          delete payload.error_user_name;
        } else {
          // Normal user or New record: Set the user info to the current user
          payload.error_user = user[0].loginname;
          payload.error_user_name = user[0].name;
        }

        const formRegis = await medErrorCreate(payload, token);

        const { statusCode, medErrorList } = formRegis.data;
        if ((statusCode === 201 || statusCode === 200) && medErrorList && !_.isEmpty(medErrorList)) {
          Toast.fire({
            icon: 'success',
            title: statusCode === 201 ? 'บันทึกข้อมูลเรียบร้อย' : 'อัพเดทข้อมูลเรียบร้อย',
          });

          const userLoginName = user[0].rule && user[0].rule === 9 ? '' : user[0].loginname;
          // alert(sections);
          if (sections === 'ALL') {
            await loadMedError(token, userLoginName, true); // refresh table
          } else {
            await loadMedError(token, userLoginName, false); // refresh table
          }

          setIsOpenForm(false); // กลับไปหน้าหลัก
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
      const wardFieldMapping = {
        1: 'error_prescription_ward_code',
        2: 'error_dispensing_ward_code',
        3: 'error_pre_administration_ward_code',
        4: 'error_adminstration_ward_code',
        5: 'error_processing_ward_code',
        6: 'error_transcribing_ward_code',
      };

      const fieldNameToCheck = wardFieldMapping[formRegister.error_type];

      if (fieldNameToCheck && formRegister[fieldNameToCheck] === '') {
        setIsNotSelectWard(true);
      } else {
        setIsNotSelectWard(false);
        createOrUpdate();
      }
    }
    event.preventDefault();
  };

  const loadEditData = async (errorId) => {
    setIsOpenForm(true);

    // 1) หาแถวที่จะเอามา edit ให้ชัดเจนก่อน
    let sourceRow = null;

    // ถ้า medErrorShow[0] มีและ error_id ตรงกับที่ขอ ก็ใช้เลย
    if (medErrorShow?.[0] && medErrorShow[0].error_id === errorId) {
      sourceRow = medErrorShow[0];
    } else {
      // ถ้าไม่ตรง / ว่าง ให้ไปหาใน medErrorData
      sourceRow = medErrorData.find((item) => item.error_id === errorId);
    }

    if (!sourceRow) {
      // กันกรณีหาไม่เจอ
      Toast.fire({
        icon: 'error',
        title: 'ไม่พบข้อมูลรายการนี้',
      });
      return;
    }

    // 2) clone object ก่อนจะไปลบ key (กัน mutate state)
    const medErrorShowData = { ...sourceRow };

    popKeys(medErrorShowData, [
      'error_dispensing_person_name',
      'error_key_person_name',
      'error_processing_person_name',
      'last_updated',
      'error_type_detail',
    ]);

    // 3) เตรียมข้อมูล error_type ให้เป็น string ใช้งานง่าย (Radio ใช้ string)
    const errorTypeValue = medErrorShowData.error_type != null ? medErrorShowData.error_type.toString() : '';

    const labelError = medErrorType.find((_errorType) => _errorType.error_type.toString() === errorTypeValue);

    // console.log('labelError >> ', labelError);
    // console.log('errorTypeValue >> ', errorTypeValue);

    if (labelError) {
      setErrorTypeField(labelError.error_field);
      setErrorTypeWardField(labelError.error_field_ward);
      setErrorTypeWardFieldCode(labelError.error_field_ward_code);
      setLabelErrorType(labelError.error_type_name);

      // โหลดบุคคลตามประเภท error
      loadPerson(token, errorTypeValue);

      // loadOptionErrorType
      loadOptionErrorType(token, errorTypeValue);

      const fieldValue = medErrorShowData[labelError.error_field];
      checkErrorType(fieldValue, errorTypeValue);

      const { error_analysis } = medErrorShowData;
      let subAnalysis = error_analysis.split(',');
      let dataAnalysis = [];
      let arrAnalysis = [];

      if (subAnalysis.length > 1) {
        subAnalysis.forEach((element) => {
          let jsonData = {
            error_analysis_name: element,
          };
          arrAnalysis.push(jsonData);
        });
        dataAnalysis = arrAnalysis;
      } else {
        dataAnalysis = subAnalysis;
      }
      setDefaultErrorAnalysis(dataAnalysis);
    } else {
      // กันกรณีหาไม่เจอ type
      setErrorTypeField('');
      setErrorTypeWardField('');
      setErrorTypeWardFieldCode('');
      setLabelErrorType('');
    }

    // 4) บาง type ต้องโหลด drug item เพิ่ม
    if (errorTypeValue === '2' || errorTypeValue === '5' || errorTypeValue === '6') {
      loadDrugItems(token);
    }

    // 5) set form ครั้งเดียวให้ครบ
    const updatedForm = {
      ...medErrorShowData,
      error_id: Number(errorId),
      error_type: errorTypeValue,
      error_date: moment(medErrorShowData.error_date).format('YYYY-MM-DD'),
      error_level_old: medErrorShowData.error_level,
    };

    // console.log(updatedForm);

    setFormRegister(updatedForm);
  };

  // End Form Register & Update

  useEffect(() => {
    async function checkVerifyToken() {
      setIsLoading(true);
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token } = verify || {};
      if (statusCode === 200 && profile) {
        if (access_token) {
          let userLoginName = profile.rule && profile.rule === 9 ? '' : profile.loginname;
          const isAdmin = profile.rule === 9;
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
          loadErrorType(access_token, sections, isAdmin);
          setFormRegister((prev) =>
            createInitialFormRegister(profile, sections, prev.error_date || formatDate(dayjs()))
          );
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, []);

  const emptyRowsMedError = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - medErrorData.length) : 0;

  const filteredMedError = useMemo(() => {
    let result = medErrorData;
    if (filterDeps.length > 0) {
      const depNames = filterDeps.map((d) => d.med_error_depname);
      result = result.filter((item) => depNames.includes(item.error_ward_name));
    }
    if (filterType) {
      result = result.filter((item) => item.error_type_name === filterType.error_type_name);
    }
    if (filterLevels.length > 0) {
      const levels = filterLevels.map((l) => l.med_error_level_code);
      result = result.filter((item) => levels.includes(item.error_level));
    }
    if (filterAlert && filterAlert !== 'ALL') {
      const alertVal = filterAlert === 'HAD' ? HAD_LABEL : 'ไม่ใช่ High Alert Drugs';
      result = result.filter((item) => item.error_alert === alertVal);
    }
    return applySortFilter(result, getComparator(order, orderBy), filterName);
  }, [medErrorData, order, orderBy, filterName, filterDeps, filterType, filterLevels, filterAlert]);

  useEffect(() => {
    if (bottomScrollRef.current) {
      const actualWidth = bottomScrollRef.current.scrollWidth;
      if (actualWidth > 0 && actualWidth !== tableWidth) {
        setTableWidth(actualWidth);
      }
    }
  }, [medErrorData, filteredMedError, tableWidth]);

  const isNotFound = !filteredMedError.length && !!filterName;

  const selectedRow = medErrorShow[0] || null;
  const canManageSelected = selectedRow ? canManageRow(selectedRow) : false;
  const canUpdateRca = currentUser?.rule === 9 && !!selectedRow;
  const selectedTranscribingPerson =
    processingPerson.find((p) => String(p.error_key_person_id) === String(formRegister.error_transcribing_person)) ||
    null;
  const selectedTranscribingRightDrug =
    drugItem.find((d) => d.icode === formRegister.error_transcribing_right_icode) || null;

  const selectedErrorLevel = MedErrorLevel.find((opt) => opt.med_error_level_code === formRegister.error_level) || null;

  return (
    <>
      <Helmet>
        <title> {isOpenForm ? 'Register' : 'Main'} | Medication error </title>
      </Helmet>

      <Container maxWidth="false">
        <Box
          className="guk-glass guk-anim-fade-up"
          sx={{ mb: 3, borderRadius: '20px', p: { xs: 2, sm: 2.5 } }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(94,234,212,0.3), rgba(110,231,183,0.3))',
                  border: '1px solid rgba(153, 246, 228, 0.7)',
                }}
              >
                <Iconify icon={isOpenForm ? 'eva:edit-fill' : 'eva:file-text-fill'} width={24} sx={{ color: '#0d9488' }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  className="guk-gradient-text-teal"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
                >
                  {isOpenForm
                    ? `แบบเก็บข้อมูล Medication error ${formRegister.error_section === 1 ? 'โรงพยาบาลร้อยเอ็ด' : 'กลุ่มงานเภสัชกรรม'}`
                    : 'ข้อมูล Medication error'}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: '#475569', mt: 0.5 }}>
                  {isOpenForm
                    ? 'กรอกข้อมูลรายละเอียดอุบัติการณ์ Medication error'
                    : 'รายการอุบัติการณ์ Medication error ที่บันทึกในระบบ'}
                </Typography>
              </Box>
            </Box>
            {!isOpenForm && (
              <Button variant="contained" onClick={handleGoToRegister} startIcon={<Iconify icon="eva:plus-fill" />}>
                บันทึกข้อมูล Med Error
              </Button>
            )}
          </Stack>
        </Box>

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
                    inputFormat="d MMMM yyyy" disableMaskedInput
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
                      isOptionEqualToValue={(option) => option.med_error_depcode === formRegister.error_ward}
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
                      isOptionEqualToValue={(option) => option.med_error_level_code === formRegister.error_level}
                      getOptionLabel={(option) => {
                        if (!option) return '';
                        if (typeof option === 'string') return option;
                        const code = option.med_error_level_code ?? '';
                        const detail = option.med_error_level_detail ?? '';
                        return `${code} ${detail}`.trim();
                      }}
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
                      value={selectedErrorLevel}
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
                    {/* {`error_analysis [${JSON.stringify(formRegister.error_analysis)}]`} */}
                    <FormLabel id="error_level_label">
                      วิเคราะห์สาเหตุ{' '}
                      <Typography variant="span" style={{ color: colorRed }}>
                        *
                      </Typography>
                    </FormLabel>
                    <Autocomplete
                      multiple
                      id="tags-filled"
                      freeSolo
                      options={Array.isArray(errerAnalysis) ? errerAnalysis : []}
                      // value ต้องเป็น array เสมอ
                      value={Array.isArray(defaultErrorAnalysis) ? defaultErrorAnalysis : []}
                      getOptionLabel={(option) => {
                        if (!option) return '';
                        if (typeof option === 'string') return option;
                        return option.error_analysis_name ?? '';
                      }}
                      renderTags={(tagValue, getTagProps) => {
                        const items = Array.isArray(tagValue) ? tagValue : [];
                        return items.map((option, index) => {
                          const label = typeof option === 'string' ? option : option.error_analysis_name ?? '';

                          return <Chip key={index} variant="outlined" label={label} {...getTagProps({ index })} />;
                        });
                      }}
                      onChange={(event, newValue) => {
                        const nameInput = 'error_analysis';
                        let newValueRule = { ...formRegisterRule };

                        // กันไว้ก่อนว่า newValue จะต้องเป็น array
                        const list = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];

                        // แปลง string (freeSolo) → object ให้หมด
                        const normalized = list.map((val) =>
                          typeof val === 'string' ? { error_analysis_name: val } : val
                        );

                        if (normalized.length > 0) {
                          setDefaultErrorAnalysis(normalized);

                          const joinValue = normalized.map((val) => val?.error_analysis_name ?? '').filter(Boolean); // ตัด empty

                          setFormRegister((prestate) => ({
                            ...prestate,
                            [nameInput]: joinValue.join(','), // เก็บใน form เป็น string คั่นด้วย ,
                          }));

                          newValueRule = {
                            ...newValueRule,
                            [nameInput]: {
                              ...newValueRule[nameInput],
                              error: false,
                            },
                          };
                        } else {
                          // กรณีลบ tag ทั้งหมด
                          setDefaultErrorAnalysis([]);

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
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                          {labelErrorType}
                        </Typography>
                      </Divider>
                      <FormControl error={isNotSelectWard}>
                        {/* {`[${errorTypeWardFieldCode}] ${errorTypeWardField} >> [${formRegister[errorTypeWardFieldCode]}] ${formRegister[errorTypeWardField]}`} */}
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
                          isOptionEqualToValue={(option) =>
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
                              isOptionEqualToValue={(option) =>
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
                        {/* {`[${errorTypeField}]  >> ${formRegister[errorTypeField]}`} */}
                        <FormLabel id={`${errorTypeField}_label`}>ประเภทของ {labelErrorType}</FormLabel>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          options={optionErrorType}
                          isOptionEqualToValue={(option) =>
                            option.error_type_list_detail === formRegister[errorTypeField]
                          }
                          getOptionLabel={(option) => `${option.error_type_list_detail}`}
                          value={{ error_type_list_detail: formRegister[errorTypeField] }}
                          onChange={(event, newValue) => {
                            setFormRegister((prestate) => ({
                              ...prestate,
                              [errorTypeField]: newValue ? newValue.error_type_list_detail : '',
                            }));
                            checkErrorType(newValue ? newValue.error_type_list : null, formRegister.error_type);
                          }}
                          renderInput={(params) => <TextField {...params} label={`เลือกประเภทของ ${labelErrorType}`} />}
                        />
                      </FormControl>
                      {/* {`errorTypeField[${errorTypeField}] >> [${JSON.stringify(formRegister[errorTypeField])}]`} */}
                      {formRegister.error_type === '2' &&
                        (formRegister.error_section === 2 || currentUser?.rule === 9) && (
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
                                isOptionEqualToValue={(option) =>
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
                      {formRegister.error_type === '5' &&
                        (formRegister.error_section === 2 || currentUser?.rule === 9) && (
                          <>
                            {isShow.section4 && (
                              <>
                                <Typography variant="h6" component="h2" sx={{ color: 'primary.main' }}>
                                  คู่ยาที่พิมพ์/รับ order คลาดเคลื่อน
                                </Typography>

                                <FormControl>
                                  <FormLabel id="error_processing_person_label" className="mb-2">
                                    ความคลาดเคลื่อนในการพิมพ์ที่เกิดขึ้น เกิดจาก (ระบุตัวบุคคล)
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
                                    isOptionEqualToValue={(option) =>
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
                                  <FormLabel id="error_processing_wrong_unit_label">
                                    จำนวนยาที่พิมพ์/รับ order
                                  </FormLabel>
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
                                    isOptionEqualToValue={(option) =>
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
                      {/* {`<< error_type >> => [${formRegister.error_type}] | << error_section >> => [${
                        formRegister.error_section
                      }] | << rule >> => [${currentUser?.rule}] << isShow >> => ${JSON.stringify(isShow)}`} */}
                      {formRegister.error_type === '6' &&
                        (formRegister.error_section === 2 || currentUser?.rule === 9) && (
                          <>
                            {isShow.section6 && (
                              <>
                                <Typography variant="h6" component="h2" sx={{ color: 'primary.main' }}>
                                  คู่ยาที่พิมพ์/รับ order คลาดเคลื่อน
                                </Typography>
                                <FormControl>
                                  <FormLabel id="error_transcribing_person_label" className="mb-2">
                                    ความคลาดเคลื่อนในการพิมพ์/รับ order ที่เกิดขึ้น เกิดจาก
                                  </FormLabel>

                                  <Autocomplete
                                    fullWidth
                                    disablePortal
                                    options={processingPerson}
                                    value={
                                      processingPerson.find(
                                        (item) =>
                                          String(item.error_key_person_id) ===
                                          String(
                                            selectedTranscribingPerson?.error_key_person_id ||
                                            selectedTranscribingPerson
                                          )
                                      ) || null
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                      String(option.error_key_person_id) === String(value.error_key_person_id)
                                    }
                                    getOptionLabel={(option) => {
                                      if (!option) return '';
                                      if (typeof option === 'string') return option;
                                      return option.error_key_person_name ?? '';
                                    }}
                                    renderOption={(props, option) => {
                                      // eslint-disable-next-line react/prop-types
                                      const { key, ...otherProps } = props;
                                      return (
                                        <li key={key} {...otherProps}>
                                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 500 }}>{option.error_key_person_name}</span>
                                            <Typography variant="body2" color="text.secondary">
                                              {option.error_key_sec_name || '-'}
                                            </Typography>
                                          </div>
                                        </li>
                                      );
                                    }}
                                    onChange={(event, newValue) => {
                                      setFormRegister((prev) => ({
                                        ...prev,
                                        error_transcribing_person: newValue ? newValue.error_key_person_id : '',
                                      }));
                                    }}
                                    renderInput={(params) => <TextField {...params} label="(ระบุตัวบุคคล)" />}
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel id="error_transcribing_right_label" className="text-primary">
                                    ยาที่แพทย์มี order
                                  </FormLabel>
                                  <Autocomplete
                                    fullWidth
                                    disablePortal
                                    options={drugItem}
                                    // ให้ค่า value เป็น object จากใน options
                                    value={selectedTranscribingRightDrug}
                                    // เทียบ option กับ value จาก options จริง ๆ
                                    isOptionEqualToValue={(option, value) => option.icode === value.icode}
                                    getOptionLabel={(option) => {
                                      if (!option) return '';
                                      if (typeof option === 'string') return option;
                                      return option.drugName ?? '';
                                    }}
                                    onChange={(event, newValue) => {
                                      setFormRegister((prestate) => ({
                                        ...prestate,
                                        error_transcribing_right_icode: newValue ? newValue.icode : '',
                                        error_transcribing_right: newValue ? newValue.drugName ?? '' : '',
                                      }));
                                    }}
                                    renderInput={(params) => <TextField {...params} placeholder="ค้นหายา" />}
                                  />
                                </FormControl>

                                <FormControl>
                                  <FormLabel id="error_transcribing_right_unit_label">จำนวนยาที่แพทย์สั่ง</FormLabel>
                                  <TextField
                                    type="number"
                                    value={`${formRegister.error_transcribing_right_unit}`}
                                    id="error_transcribing_right_unit"
                                    name="error_transcribing_right_unit"
                                    onChange={handleChangeSelect}
                                    placeholder="ระบุจำนวนยา"
                                  />
                                </FormControl>
                                <FormControl>
                                  {/* {`error_transcribing_wrong_icode >> ${JSON.stringify(
                                  formRegister.error_transcribing_wrong_icode
                                )} \n`}
                                {`error_transcribing_wrong >> ${JSON.stringify(
                                  formRegister.error_transcribing_wrong
                                )} \n`} */}
                                  <FormLabel id="error_transcribing_wrong_label" className="text-primary">
                                    ยาที่พิมพ์/รับ order ผิด
                                  </FormLabel>
                                  <Autocomplete
                                    fullWidth
                                    disablePortal
                                    options={drugItem}
                                    isOptionEqualToValue={(option) =>
                                      option.icode === formRegister.error_transcribing_wrong_icode
                                    }
                                    getOptionLabel={(option) => option.drugName}
                                    onChange={(event, newValue) => {
                                      setFormRegister((prestate) => ({
                                        ...prestate,
                                        error_transcribing_wrong_icode: newValue !== null ? newValue.icode : '',
                                        error_transcribing_wrong: newValue !== null ? newValue.drugName : '',
                                      }));
                                    }}
                                    value={{
                                      icode: formRegister.error_transcribing_wrong_icode,
                                      drugName: formRegister.error_transcribing_wrong,
                                    }}
                                    renderInput={(params) => <TextField {...params} label="ระบุชื่อยา" />}
                                  />
                                </FormControl>
                                <FormControl>
                                  <FormLabel id="error_transcribing_wrong_unit_label">
                                    จำนวนที่พิมพ์/รับ order ผิด
                                  </FormLabel>
                                  <TextField
                                    type="number"
                                    value={formRegister.error_transcribing_wrong_unit}
                                    id="error_transcribing_wrong_unit"
                                    name="error_transcribing_wrong_unit"
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
            <Box sx={{ px: 3, pb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    multiple
                    size="small"
                    options={department}
                    getOptionLabel={(option) => option.med_error_depname}
                    value={filterDeps}
                    onChange={(e, value) => setFilterDeps(value)}
                    renderInput={(params) => <TextField {...params} label="สถานที่เกิดเหตุ" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    size="small"
                    options={medErrorType}
                    getOptionLabel={(option) => option.error_type_name}
                    value={filterType}
                    onChange={(e, value) => setFilterType(value)}
                    renderInput={(params) => <TextField {...params} label="ประเภท Error" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    size="small"
                    options={MedErrorLevel}
                    getOptionLabel={(option) => option.med_error_level_code}
                    isOptionEqualToValue={(option, value) => option.med_error_level_code === value.med_error_level_code}
                    value={filterLevels}
                    onChange={(e, value) => setFilterLevels(value)}
                    renderOption={(props, option, { selected }) => {
                      const sev = SEVERITY_COLORS[option.med_error_level_code];
                      return (
                        <li {...props}>
                          <Checkbox checked={selected} size="small" sx={{ mr: 0.5 }} />
                          <Chip label={option.med_error_level_code} size="small" sx={{ mr: 1, fontWeight: 700, borderRadius: '8px', minWidth: 28, ...sev?.chipSx }} />
                          <Typography variant="body2" sx={{ fontSize: 12.5 }}>{sev?.desc || option.med_error_level_code}</Typography>
                        </li>
                      );
                    }}
                    renderInput={(params) => <TextField {...params} variant="outlined" label="ระดับความรุนแรง" placeholder="เลือกได้หลายระดับ" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="alert-filter-label">ความคลาดเคลื่อน (HAD)</InputLabel>
                    <Select
                      labelId="alert-filter-label"
                      value={filterAlert}
                      label="ความคลาดเคลื่อน (HAD)"
                      onChange={(e) => setFilterAlert(e.target.value)}
                    >
                      <MenuItem value="ALL">ทั้งหมด</MenuItem>
                      <MenuItem value="HAD" sx={{ color: '#FF4842', fontWeight: 600 }}>
                        High Alert Drugs (HAD)
                      </MenuItem>
                      <MenuItem value="NON-HAD" sx={{ color: '#00B8D9', fontWeight: 600 }}>
                        ไม่ใช่ High Alert Drugs (Non-HAD)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            <Grid container spacing={1} sx={{ paddingLeft: '24px' }}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Stack direction="row" alignItems="center" justifyContent="flex-start" mb={2}>
                  <Stack mr={2}>
                    <Button
                      variant="contained"
                      onClick={handleSearchWithDate}
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
            <Box
              ref={topScrollRef}
              onScroll={handleTopScroll}
              sx={{ overflowX: 'auto', width: '100%', mb: 1 }}
            >
              <Box sx={{ height: '1px', width: `${tableWidth}px` }} />
            </Box>
            <TableContainer 
              ref={bottomScrollRef}
              onScroll={handleBottomScroll}
              sx={{ minWidth: 800, overflowX: 'auto' }}
            >
              <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD_MEDERROR}
                    rowCount={medErrorData.length}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {filteredMedError.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const {
                        error_id,
                        error_section,
                        error_date,
                        error_time,
                        error_ward_name,
                        error_user_name,
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

                      const canManage = canManageRow(row);
                      const sev = SEVERITY_COLORS[String(error_level || '').toUpperCase()] || null;
                      const isHad = error_alert === HAD_LABEL;
                      const hadBg = isHad ? 'rgba(255, 72, 66, 0.06)' : 'rgba(59, 130, 246, 0.03)';
                      const rowBg = sev?.bg || hadBg;
                      const leftBorder = isHad ? '3px solid #FF4842' : '3px solid transparent';

                      return (
                        <TableRow
                          hover
                          style={{ cursor: 'pointer' }}
                          tabIndex={-1}
                          key={error_id}
                          sx={{
                            backgroundColor: rowBg,
                            borderLeft: leftBorder,
                            transition: 'background-color 0.15s ease',
                            '&:hover': { backgroundColor: (t) => alpha(t.palette.primary.lighter, 0.35) },
                          }}
                        >
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
                            {sev ? (
                              <Tooltip title={`${error_level}: ${sev.desc}`} arrow placement="top">
                                <Chip label={error_level} size="small" sx={{ fontWeight: 700, borderRadius: '8px', minWidth: 32, ...sev.chipSx }} />
                              </Tooltip>
                            ) : (error_level || '-')}
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
                            <Chip
                              label={isHad ? 'HAD' : 'Non-HAD'}
                              size="small"
                              variant="filled"
                              sx={{
                                fontWeight: 600,
                                borderRadius: '8px',
                                fontSize: 11,
                                ...(isHad
                                  ? { bgcolor: '#FF4842', color: '#fff' }
                                  : { bgcolor: 'rgba(100, 116, 139, 0.12)', color: '#475569' }),
                              }}
                            />
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
                            {error_user_name}
                          </TableCell>

                          <TableCell align="right">
                            {canManage && (
                              <Tooltip title="จัดการ">
                                <IconButton
                                  size="large"
                                  color="info"
                                  onClick={(event) => handleOpenMenu(event, error_id)}
                                >
                                  <Iconify icon={'eva:settings-2-outline'} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
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
              error_transcribing_ward,
              error_transcribing_person,
              error_transcribing_person_name,
              error_transcribing,
              error_transcribing_right,
              error_transcribing_right_unit,
              error_transcribing_wrong,
              error_transcribing_wrong_unit,
              is_rca,
              rca_text,
              rca_by,
              updated_rca,
            } = dataMedError;

            const numericErrorType = Number(error_type || 0);
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
                            {`${error_datetime !== '' ? formatDateTime(error_datetime, 3) : ''}`}
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
                            {error_transcribing_ward}
                          </Typography>
                        </Item>
                      </Grid>
                      {numericErrorType === 1 && (
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
                            {error_transcribing}
                          </Typography>
                        </Item>
                      </Grid>
                      {numericErrorType === 2 && error_dispensing_person !== '' && (
                        <Grid item xs={12} md={12}>
                          <Item>
                            <Typography variant="h6">ความคลาดเคลื่อนในการจ่ายยาที่เกิดขึ้น เกิดจาก</Typography>
                            <Typography variant="body2">
                              {error_dispensing_person !== '' ? error_dispensing_person_name : '-'}
                            </Typography>
                          </Item>
                        </Grid>
                      )}
                      {numericErrorType === 5 && (
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
                                  <Typography variant="body2">{`จำนวนยา:  ${error_processing_right_unit !== '' ? error_processing_right_unit : '-'
                                    }`}</Typography>
                                </Item>
                              </Grid>
                              <Grid item xs={6} md={6}>
                                <Item>
                                  <Typography variant="h6">ชื่อยาที่จัดผิด</Typography>
                                  <Typography variant="body2">
                                    {error_processing_wrong !== '' ? error_processing_wrong : '-'}
                                  </Typography>
                                  <Typography variant="body2">{`จำนวนที่จัดผิด:  ${error_processing_wrong_unit !== '' ? error_processing_wrong_unit : '-'
                                    }`}</Typography>
                                </Item>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {numericErrorType === 6 && (
                        <>
                          <Grid item xs={12} md={12}>
                            <Item>
                              <Typography variant="h6">
                                ความคลาดเคลื่อนในการพิมพ์/รับ order ที่เกิดขึ้น เกิดจาก
                              </Typography>
                              <Typography variant="body2">
                                {error_transcribing_person !== '' ? error_transcribing_person_name : '-'}
                              </Typography>
                            </Item>
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <Grid container spacing={1}>
                              <Grid item xs={6} md={6}>
                                <Item>
                                  <Typography variant="h6">ชื่อยาที่แพทย์มี order</Typography>
                                  <Typography variant="body2">
                                    {error_transcribing_right !== '' ? error_transcribing_right : '-'}
                                  </Typography>
                                  <Typography variant="body2">{`จำนวนยา:  ${error_transcribing_right_unit !== '' ? error_transcribing_right_unit : '-'
                                    }`}</Typography>
                                </Item>
                              </Grid>
                              <Grid item xs={6} md={6}>
                                <Item>
                                  <Typography variant="h6">ชื่อยาที่พิมพ์/รับ order ผิด</Typography>
                                  <Typography variant="body2">
                                    {error_transcribing_wrong !== '' ? error_transcribing_wrong : '-'}
                                  </Typography>
                                  <Typography variant="body2">{`จำนวนที่จัดผิด:  ${error_transcribing_wrong_unit !== '' ? error_transcribing_wrong_unit : '-'
                                    }`}</Typography>
                                </Item>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {is_rca === 'Y' && (
                        <Grid item xs={12} md={12}>
                          <Item>
                            <Typography variant="h6">ข้อมูลได้รับการ RCA แล้ว</Typography>
                            <Typography variant="body1">
                              {rca_text !== null ? `รายละเอียด: ${rca_text}` : '-'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 12, marginTop: 2 }}>
                              {updated_rca !== null ? `RCA โดย: ${rca_by}` : '-'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 12 }}>
                              {updated_rca !== null ? `เมื่อวันที่: ${formatDateTime(updated_rca, 3)}` : '-'}
                            </Typography>
                          </Item>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </DialogContent>
              </Fragment>
            );
          })}
        <DialogActions>
          {canUpdateRca && (
            <>
              {/* โหมดกรอก/แก้ไข RCA */}
              {showRcaInput && (
                <>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <TextField
                      label="รายละเอียด RCA"
                      multiline
                      minRows={3}
                      fullWidth
                      value={rcaDetail}
                      onChange={(e) => setRcaDetail(e.target.value)}
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    startIcon={<Iconify icon="eva:checkmark-circle-outline" />}
                    onClick={(e) => handleUpdateRCA(e, selectedID, 'Y', rcaDetail)}
                    disabled={!rcaDetail.trim()}
                  >
                    {medErrorShow[0]?.is_rca === 'Y' ? 'บันทึกการแก้ไข RCA' : 'บันทึก RCA'}
                  </Button>
                </>
              )}

              {/* โหมดปกติ: ยังไม่คลิกแก้ไข/กรอก RCA */}
              {!showRcaInput && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowRcaInput(true)}
                  color={medErrorShow[0]?.is_rca === 'Y' ? 'success' : 'primary'}
                  startIcon={
                    medErrorShow[0]?.is_rca === 'Y' ? (
                      <Iconify icon="eva:edit-2-outline" />
                    ) : (
                      <Iconify icon="eva:checkmark-circle-outline" />
                    )
                  }
                >
                  {medErrorShow[0]?.is_rca === 'Y' ? 'แก้ไขรายละเอียด RCA' : 'ยืนยันข้อมูลได้รับการ RCA'}
                </Button>
              )}
            </>
          )}

          {canManageSelected && (
            <Button variant="outlined" color="warning" size="small" onClick={(e) => handleEdit(e, selectedID)}>
              แก้ไขข้อมูล
            </Button>
          )}

          {/* {canManageSelected && (
            <Button variant="outlined" color="error" size="small" onClick={(e) => handleConfirmDelete(e, selectedID)}>
              <Iconify icon={'eva:trash-2-outline'} /> ลบ
            </Button>
          )} */}

          <Button variant="outlined" color="error" size="small" onClick={() => setIsShowModal(false)}>
            ปิด
          </Button>
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
