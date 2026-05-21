import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import _, { filter } from 'lodash';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { red } from '@mui/material/colors';

// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Hook form
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead } from '../sections/@dashboard/user';

// Lib MedError
import { errorTypeListCreate, errorTypeListDelete, getErrorTypeByTypeList } from '../libs/MedError';

// Lib Auth
import { verifyToken } from '../libs/Auth';

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

// Schema form Error Type List
const errorTypeListSchema = z.object({
  error_type: z
    .number({
      required_error: 'โปรดเลือกประเภท Error',
      invalid_type_error: 'โปรดเลือกประเภท Error',
    })
    .min(1, { message: 'โปรดเลือกประเภท Error' }), // ค่า `0` หรือ `undefined` ถือว่าไม่ถูกต้อง

  error_type_list: z
    .string({
      required_error: 'โปรดระบุ ID รายละเอียด Error',
      invalid_type_error: 'โปรดระบุ ID รายละเอียด Error',
    })
    .min(1, { message: 'โปรดระบุ ID รายละเอียด Error' }), // ห้ามเป็นค่าว่าง

  error_type_list_detail: z
    .string({
      required_error: 'โปรดระบุรายละเอียด Error',
      invalid_type_error: 'โปรดระบุรายละเอียด Error',
    })
    .min(1, { message: 'โปรดระบุรายละเอียด Error' }), // ห้ามเป็นค่าว่าง

  is_active: z.enum(['Y', 'N'], {
    errorMap: () => ({ message: 'โปรดเลือกสถานะการใช้งาน' }),
  }), // ตรวจสอบให้เลือกเฉพาะ 'Y' หรือ 'N'
  type_id: z.number(),
  impact_score: z
    .union([z.number().int().min(1).max(5), z.null()])
    .optional()
    .nullable(),
});

// สี Chip ของ Impact: 1-2 เขียว, 3 เหลือง, 4 ส้ม, 5 แดง
const impactChipColor = (score) => {
  if (score === 1 || score === 2) return 'success';
  if (score === 3) return 'warning';
  if (score === 4) return 'warning';
  if (score === 5) return 'error';
  return 'default';
};

const color = red[500];

const TABLE_HEAD_ERROR_TYPE = [
  { id: 'error_type_list', label: '#', alignHead: 'center' },
  { id: 'error_type_name', label: 'ประเภท', alignRight: false, alignHead: 'left' },
  { id: 'error_type_list_detail', label: 'รายละเอียด Error', alignRight: false, alignHead: 'left' },
  { id: 'impact_score', label: 'Impact', alignRight: false, alignHead: 'center' },
  { id: 'is_active', label: 'สถานะ', alignRight: false, alignHead: 'center' },
  { id: '', label: 'จัดการ', alignHead: 'center' },
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

function applySortFilter(array, comparator, query, errorType, impactFilter, activeStatus) {
  let result = array;

  // filter by main error type
  if (errorType !== 'all') {
    result = result.filter((_t) => Number(_t.error_type) === Number(errorType));
  }

  // filter by impact
  if (impactFilter !== 'all') {
    if (impactFilter === 'none') {
      result = result.filter((_t) => _t.impact_score === null || _t.impact_score === undefined);
    } else {
      result = result.filter((_t) => Number(_t.impact_score) === Number(impactFilter));
    }
  }

  // filter by status
  if (activeStatus !== 'all') {
    result = result.filter((_t) => _t.is_active === activeStatus);
  }

  // filter by search query
  if (query) {
    result = filter(
      result,
      (_error_type) =>
        (_error_type.error_type_list_detail || '').toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        (_error_type.error_type_name || '').toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  // sort
  const stabilizedThis = result.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// import
export default function ErrorTypePage() {
  const navigate = useNavigate();
  const [, setIsOpen] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selectedID, setSelectedID] = useState(null);
  const [token, setToken] = useState(null);

  const [orderBy, setOrderBy] = useState('error_type_name');

  const [filterName, setFilterName] = useState('');
  const [filterErrorType, setFilterErrorType] = useState('all');
  const [filterImpact, setFilterImpact] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [medErrorType, setMedErrorType] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(errorTypeListSchema),
    defaultValues: {
      error_type: '',
      error_type_list: '',
      error_type_list_detail: '',
      is_active: 'Y',
      type_id: 0,
      impact_score: null,
    },
  });

  const [isNotify, setIsNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState({
    type: '',
    title: '',
    text: '',
    sec: '',
  });

  // Inline Impact Editor
  const [impactAnchor, setImpactAnchor] = useState(null);
  const [impactEditRow, setImpactEditRow] = useState(null);

  const handleOpenImpact = (event, row) => {
    setImpactAnchor(event.currentTarget);
    setImpactEditRow(row);
  };

  const handleCloseImpact = () => {
    setImpactAnchor(null);
    setImpactEditRow(null);
  };

  const handleSaveImpact = async (score) => {
    if (!impactEditRow) return;
    try {
      const payload = {
        error_type: impactEditRow.error_type,
        error_type_list: impactEditRow.error_type_list,
        error_type_list_detail: impactEditRow.error_type_list_detail,
        is_active: impactEditRow.is_active,
        type_id: impactEditRow.type_id,
        impact_score: score,
      };
      const res = await errorTypeListCreate(payload, token);
      const { statusCode } = res.data;
      if (statusCode === 200) {
        Toast.fire({ icon: 'success', title: 'อัปเดต Impact เรียบร้อย' });
        await loadMedErrorType(token);
      } else {
        Toast.fire({ icon: 'error', title: 'ไม่สามารถอัปเดต Impact ได้' });
      }
    } catch (error) {
      handleCatchAxios(error, 'impact_score');
    }
    handleCloseImpact();
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

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenMenu = (event, objPerson) => {
    setOpen(event.currentTarget);
    setSelectedID(objPerson);
  };

  const handleClose = (e) => {
    setIsOpenDelete(false);
    e.preventDefault();
  };

  const onSubmit = async (dataForm) => {
    try {
      const res = await errorTypeListCreate(dataForm, token);
      const { statusCode, errorTypeList, section, type_alert } = res.data;

      if (statusCode === 200 && Array.isArray(errorTypeList) && !_.isEmpty(errorTypeList)) {
        reset();

        setNotifyMessage({
          type: `${type_alert}.main`,
          title: 'แจ้งเตือน',
          text: section === 'create' ? 'บันทึกข้อมูลเรียบร้อย' : 'อัปเดตข้อมูลเรียบร้อย',
          sec: section,
        });

        await loadMedErrorType(token);
        setIsNotify(true);
        setIsOpenForm(false);
        setOpen(null);
      } else {
        Toast.fire({ icon: 'error', title: 'ไม่สามารถบันทึกข้อมูลได้' });
      }
    } catch (error) {
      handleCatchAxios(error, 'create');
    }
  };

  const handleClickOpenForm = () => {
    setSelectedID(null);
    setIsOpenForm(true);
    setIsOpenDelete(false);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setIsOpenDelete(false);
    reset();
  };

  const handleEdit = (e, id) => {
    const dataErrorTypeList = filter(medErrorType, (_error_type) => _error_type.type_id === id);
    setIsOpenForm(true);
    if (!_.isEmpty(dataErrorTypeList)) {
      const itemErrorType = dataErrorTypeList[0];
      const formEditData = {
        error_type: itemErrorType.error_type,
        error_type_list: itemErrorType.error_type_list,
        error_type_list_detail: itemErrorType.error_type_list_detail,
        is_active: itemErrorType.is_active,
        type_id: itemErrorType.type_id,
        impact_score:
          itemErrorType.impact_score === null || itemErrorType.impact_score === undefined
            ? null
            : Number(itemErrorType.impact_score),
      };
      reset(formEditData);
    }

    if (_.isEmpty(dataErrorTypeList)) {
      Toast.fire({ icon: 'error', title: 'ไม่พบข้อมูลประเภท Error นี้' });
      return;
    }

    e.preventDefault();
  };

  const handleDelete = (e) => {
    setOpen(null);
    setIsOpenDelete(true);
    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    try {
      const deleleErrorTypeList = await errorTypeListDelete(id, token);

      const { statusCode, errorTypeList } = deleleErrorTypeList.data;
      if (statusCode === 200 && errorTypeList > 0) {
        Toast.fire({
          icon: 'success',
          title: 'ลบข้อมูลเรียบร้อย',
        });
        setIsOpenDelete(false);
        loadMedErrorType(token);
        setOpen(null);
      }
    } catch (error) {
      handleCatchAxios(error, 'del');
    }
    e.preventDefault();
  };

  const handleCatchAxios = (errorCatch) => {
    if (errorCatch.response) {
      const { status } = errorCatch.response;
      if (status === 404) {
        setTimeout(() => {
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

  const loadMedErrorType = async (auth_token) => {
    try {
      setIsOpen(true); // เริ่มโหลด (ถ้าใช้เป็น loading)
      const res = await getErrorTypeByTypeList(auth_token, 0);
      const { errorTypeList, statusCode } = res.data;

      if (statusCode === 200 && Array.isArray(errorTypeList) && errorTypeList.length > 0) {
        setMedErrorType(errorTypeList);
      } else {
        setMedErrorType([]);
      }
    } catch (error) {
      handleCatchAxios(error, 'load');
    } finally {
      setIsOpen(false); // ปิด loading เสมอ
    }
  };

  const handleNotifyClose = (event, secOrReason) => {
    setIsNotify(false);
    setIsOpenForm(false);
    setNotifyMessage({ type: '', title: '', text: '', sec: '' });

    // ถ้ามาจากปุ่ม → secOrReason จะเป็น sec จริง
    if (secOrReason !== 'load' && secOrReason !== 'backdropClick' && secOrReason !== 'escapeKeyDown') {
      loadMedErrorType(token);
    }
  };

  useEffect(() => {
    const checkVerifyToken = async () => {
      // cookie จะถูกส่งให้ backend อัตโนมัติ ไม่ต้องอ่านจาก localStorage
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token } = verify || {};

      if (statusCode === 200 && profile && access_token) {
        setToken(access_token);
        loadMedErrorType(access_token);
      } else {
        navigate('/login', { replace: true });
      }
    };

    checkVerifyToken();
  }, [navigate]);

  // ตรวจรายการที่ยังไม่มี Impact (ต้องระบุก่อนใช้ในรายงานคำนวณ Risk)
  // หมายเหตุ: Likelihood คำนวณอัตโนมัติจากเกณฑ์ความถี่ในรายงาน — ไม่ต้องกำหนดต่อรายการที่นี่อีกแล้ว
  const isIncompleteRow = (r) => r.impact_score === null || r.impact_score === undefined;
  const incompleteCount = medErrorType.filter((r) => r.is_active === 'Y' && isIncompleteRow(r)).length;
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  const baseFilteredErrorType = applySortFilter(
    medErrorType,
    getComparator(order, orderBy),
    filterName,
    filterErrorType,
    filterImpact,
    filterActive
  );
  const filteredErrorType = showIncompleteOnly
    ? baseFilteredErrorType.filter(isIncompleteRow)
    : baseFilteredErrorType;

  const emptyRowsMedError = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredErrorType.length) : 0;
  const isNotFound =
    !filteredErrorType.length &&
    (!!filterName || filterErrorType !== 'all' || filterImpact !== 'all' || filterActive !== 'all' || showIncompleteOnly);

  // derive options
  const errorTypeOptions = useMemo(() => {
    const map = new Map();
    medErrorType.forEach((t) => {
      const id = Number(t.error_type);
      if (id && !map.has(id)) {
        map.set(id, { label: t.error_type_name || `ประเภท ${id}`, count: 0 });
      }
      if (id) map.get(id).count += 1;
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, v]) => ({ id, label: v.label, count: v.count }));
  }, [medErrorType]);

  const impactCounts = useMemo(() => {
    const c = { none: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    medErrorType.forEach((t) => {
      if (t.impact_score === null || t.impact_score === undefined) c.none += 1;
      else c[Number(t.impact_score)] = (c[Number(t.impact_score)] || 0) + 1;
    });
    return c;
  }, [medErrorType]);

  const activeCount = useMemo(() => medErrorType.filter((t) => t.is_active === 'Y').length, [medErrorType]);
  const inactiveCount = medErrorType.length - activeCount;

  const hasActiveFilter =
    !!filterName || filterErrorType !== 'all' || filterImpact !== 'all' || filterActive !== 'all' || showIncompleteOnly;

  const handleClearFilters = () => {
    setFilterName('');
    setFilterErrorType('all');
    setFilterImpact('all');
    setFilterActive('all');
    setShowIncompleteOnly(false);
    setPage(0);
  };

  const isEdit = Boolean(selectedID && selectedID.type_id);
  return (
    <>
      <Helmet>
        <title>ข้อมูลรายละเอียดประเภท Error | Medication error</title>
      </Helmet>
      <Container maxWidth="true">
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
                <Iconify icon="eva:layers-fill" width={24} sx={{ color: '#0d9488' }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  className="guk-gradient-text-teal"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
                >
                  ข้อมูลรายละเอียดประเภท Error
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: '#475569', mt: 0.5 }}>
                  จัดการรายละเอียดประเภท Error ของ Medication error แต่ละหมวด
                </Typography>
              </Box>
            </Box>
            <Button onClick={handleClickOpenForm} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
              เพิ่มรายละเอียดประเภท Error
            </Button>
          </Stack>
        </Box>

        {incompleteCount > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            icon={<Iconify icon="eva:alert-triangle-outline" />}
            action={
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showIncompleteOnly}
                    onChange={(e) => {
                      setShowIncompleteOnly(e.target.checked);
                      setPage(0);
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    แสดงเฉพาะรายการที่ขาด
                  </Typography>
                }
              />
            }
          >
            <AlertTitle sx={{ fontWeight: 700 }}>
              ยังมี {incompleteCount} รายการที่ใช้งานอยู่และยังไม่ได้กำหนด Impact
            </AlertTitle>
            กรุณาคลิกที่ Chip "—" ในคอลัมน์ Impact เพื่อกำหนดคะแนน — Likelihood จะถูกคำนวณอัตโนมัติจากความถี่ของอุบัติการณ์ในช่วงเวลาที่เลือก (ตั้งค่าได้ที่หน้า "เกณฑ์ Likelihood")
          </Alert>
        )}

        <Card>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ p: 2.5, pb: 1.5, flexWrap: 'wrap' }}
          >
            <OutlinedInput
              value={filterName}
              onChange={handleFilterByName}
              placeholder="ค้นหาประเภท / รายละเอียด"
              size="small"
              sx={{ minWidth: { xs: '100%', md: 260 } }}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                </InputAdornment>
              }
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="filter-error-type-label">ประเภทหลัก</InputLabel>
              <Select
                labelId="filter-error-type-label"
                value={filterErrorType}
                label="ประเภทหลัก"
                onChange={(e) => {
                  setFilterErrorType(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">ทั้งหมด ({medErrorType.length})</MenuItem>
                {errorTypeOptions.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label} ({t.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="filter-impact-label">Impact</InputLabel>
              <Select
                labelId="filter-impact-label"
                value={filterImpact}
                label="Impact"
                onChange={(e) => {
                  setFilterImpact(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value={1}>1 ({impactCounts[1] || 0})</MenuItem>
                <MenuItem value={2}>2 ({impactCounts[2] || 0})</MenuItem>
                <MenuItem value={3}>3 ({impactCounts[3] || 0})</MenuItem>
                <MenuItem value={4}>4 ({impactCounts[4] || 0})</MenuItem>
                <MenuItem value={5}>5 ({impactCounts[5] || 0})</MenuItem>
                <MenuItem value="none">ยังไม่ระบุ ({impactCounts.none || 0})</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="filter-active-label">สถานะ</InputLabel>
              <Select
                labelId="filter-active-label"
                value={filterActive}
                label="สถานะ"
                onChange={(e) => {
                  setFilterActive(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="Y">เปิดใช้งาน ({activeCount})</MenuItem>
                <MenuItem value="N">ปิดใช้งาน ({inactiveCount})</MenuItem>
              </Select>
            </FormControl>
            {hasActiveFilter && (
              <Button
                size="small"
                color="inherit"
                onClick={handleClearFilters}
                startIcon={<Iconify icon="eva:close-circle-outline" />}
              >
                ล้าง filter
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              แสดง <b style={{ color: '#0d9488' }}>{filteredErrorType.length}</b> จากทั้งหมด{' '}
              <b>{medErrorType.length}</b> รายการ
            </Typography>
          </Stack>
          <Scrollbar>
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD_ERROR_TYPE}
                  rowCount={filteredErrorType.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredErrorType.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { type_id, error_type_name, error_type_list, error_type_list_detail, is_active, impact_score } = row;

                    return (
                        <TableRow key={type_id} hover style={{ cursor: 'pointer' }} tabIndex={-1}>
                          <TableCell align="center" sx={{ fontFamily: 'monospace', color: '#64748b', fontSize: 13 }}>
                            {error_type_list}
                          </TableCell>
                          <TableCell align="left" sx={{ fontWeight: 500 }}>{error_type_name}</TableCell>
                          <TableCell align="left">{error_type_list_detail}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="คลิกเพื่อแก้ไข Impact" arrow>
                              <Box
                                onClick={(e) => handleOpenImpact(e, row)}
                                sx={{ cursor: 'pointer', display: 'inline-flex', '&:hover': { opacity: 0.7 } }}
                              >
                                {impact_score === null || impact_score === undefined ? (
                                  <Chip
                                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                                    size="small"
                                    label="ยังไม่ระบุ"
                                    color="warning"
                                    variant="outlined"
                                    icon={<Iconify icon="eva:alert-triangle-outline" width={14} />}
                                  />
                                ) : (
                                  <Chip
                                    sx={{ color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                                    size="small"
                                    label={impact_score}
                                    color={impactChipColor(Number(impact_score))}
                                  />
                                )}
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              sx={{
                                backgroundColor: is_active === 'Y' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: is_active === 'Y' ? '#16a34a' : '#dc2626',
                                border: is_active === 'Y' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                fontWeight: 600,
                              }}
                              label={`${is_active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="จัดการ">
                              <IconButton
                                size="large"
                                color="info"
                                onClick={(event) =>
                                  handleOpenMenu(event, {
                                    type_id: type_id,
                                    error_type_name: error_type_name,
                                    error_type_list_detail: error_type_list_detail,
                                  })
                                }
                              >
                                <Iconify icon={'eva:settings-2-outline'} />
                              </IconButton>
                            </Tooltip>
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
                            ไม่มีผลลัพธ์ตามเงื่อนไขที่เลือก กรุณาลองปรับ filter หรือคำค้นหา
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {medErrorType.length === 0 && (
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
            count={filteredErrorType.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="แถวต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count} รายการ`}
          />
        </Card>
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
        <MenuItem onClick={(e) => handleEdit(e, selectedID?.type_id)}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          แก้ไข
        </MenuItem>
        <Divider />
        <MenuItem onClick={(e) => handleDelete(e)} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          ลบ
        </MenuItem>
      </Popover>

      {/* Inline Impact Score Editor */}
      <Popover
        open={Boolean(impactAnchor)}
        anchorEl={impactAnchor}
        onClose={handleCloseImpact}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: { p: 1.5, borderRadius: 2, minWidth: 220 },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
          เลือก Impact Score
        </Typography>
        <Stack direction="row" spacing={0.5} justifyContent="center">
          {[1, 2, 3, 4, 5].map((score) => (
            <Chip
              key={score}
              label={score}
              size="medium"
              color={impactChipColor(score)}
              onClick={() => handleSaveImpact(score)}
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                minWidth: 36,
                '&:hover': { transform: 'scale(1.15)', boxShadow: 2 },
                transition: 'transform 0.15s',
                ...(impactEditRow?.impact_score === score && {
                  outline: '2px solid',
                  outlineOffset: 1,
                }),
              }}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Button
          fullWidth
          size="small"
          color="inherit"
          onClick={() => handleSaveImpact(null)}
          startIcon={<Iconify icon="eva:close-circle-outline" />}
          sx={{ color: 'text.secondary' }}
        >
          ล้างค่า
        </Button>
      </Popover>

      <Dialog
        open={Boolean(isOpenForm)}
        onClose={handleCloseForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={Boolean(isOpenForm)}
        maxWidth={'sm'}
      >
        <DialogTitle
          sx={{
            bgcolor: isEdit ? '#ffc400' : 'primary.dark',
            color: 'common.white',
          }}
        >
          {isEdit ? `แก้ไขรายละเอียดประเภท ${selectedID?.error_type_name ?? ''}` : 'เพิ่มรายละเอียดประเภท Error'}
        </DialogTitle>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} sx={{ py: 2, px: 2 }}>
          <DialogContent tabIndex={-1}>
            <Stack spacing={3}>
              <FormControl fullWidth error={!!errors.error_type}>
                <FormLabel id="error_type_label">
                  เลือกประเภท Error{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>

                <Controller
                  name="error_type"
                  control={control}
                  rules={{ required: 'โปรดเลือกประเภท Error' }} // กำหนด Required Message
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="error_type_label"
                      label="เลือกประเภท Error"
                      value={field.value || ''} // ตั้งค่าเริ่มต้นเป็นค่าว่างเพื่อให้ React ควบคุมค่าได้
                      onChange={(event) => field.onChange(Number(event.target.value))} // แปลงค่าเป็น Number
                    >
                      <MenuItem value={1}>Prescription Error</MenuItem>
                      <MenuItem value={2}>Dispensing Error</MenuItem>
                      <MenuItem value={3}>Pre-Administration Error</MenuItem>
                      <MenuItem value={4}>Administration Error</MenuItem>
                      <MenuItem value={5}>Processing Error</MenuItem>
                      <MenuItem value={6}>Transcribing Error</MenuItem>
                    </Select>
                  )}
                />

                {errors.error_type && <FormHelperText>{errors.error_type.message}</FormHelperText>}
              </FormControl>

              <FormControl error={!!errors.error_type_list}>
                <FormLabel id="error_type_list_label">
                  ID รายละเอียด Error{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>
                <Controller
                  name="error_type_list"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      placeholder="ระบุ ID รายละเอียด Error"
                      error={!!errors.error_type_list}
                      helperText={errors.error_type_list?.message}
                    />
                  )}
                />
              </FormControl>

              <FormControl error={!!errors.error_type_list_detail}>
                <FormLabel id="error_type_list_detail_label">
                  รายละเอียด Error{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <Controller
                  name="error_type_list_detail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      placeholder="ระบุรายละเอียด Error"
                      error={!!errors.error_type_list_detail}
                      helperText={errors.error_type_list_detail?.message}
                    />
                  )}
                />
              </FormControl>

              <FormControl fullWidth error={!!errors.impact_score}>
                <FormLabel id="impact_score_label">คะแนน Impact (1-5)</FormLabel>
                <Controller
                  name="impact_score"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="impact_score_label"
                      label="คะแนน Impact"
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const v = event.target.value;
                        field.onChange(v === '' ? null : Number(v));
                      }}
                    >
                      <MenuItem value="">
                        <em>— ไม่ระบุ —</em>
                      </MenuItem>
                      <MenuItem value={1}>1 — ต่ำมาก</MenuItem>
                      <MenuItem value={2}>2 — ต่ำ</MenuItem>
                      <MenuItem value={3}>3 — ปานกลาง</MenuItem>
                      <MenuItem value={4}>4 — สูง</MenuItem>
                      <MenuItem value={5}>5 — สูงมาก</MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>
                  ใช้คำนวณ Level (Impact + Likelihood) — Likelihood คำนวณอัตโนมัติจากความถี่ของอุบัติการณ์ในช่วงเวลาที่เลือก (ตั้งค่าได้ที่หน้า "เกณฑ์ Likelihood")
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth error={!!errors.is_active}>
                <FormLabel id="is_active_label">
                  สถานะการใช้งาน{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>

                <Controller
                  name="is_active"
                  control={control}
                  defaultValue="Y"
                  rules={{ required: 'กรุณาเลือกสถานะการใช้งาน' }}
                  render={({ field }) => (
                    <Select {...field} value={field.value ?? 'Y'} labelId="is_active_label" label="สถานะการใช้งาน">
                      <MenuItem value="Y" sx={{ color: 'success.dark' }}>
                        <Iconify icon={'material-symbols:check'} /> เปิดใช้งาน
                      </MenuItem>
                      <MenuItem value="N" sx={{ color: 'error.main' }}>
                        <Iconify icon={'material-symbols:close'} /> ปิดใช้งาน
                      </MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.is_active?.message}</FormHelperText>
              </FormControl>
              <Controller
                name="type_id"
                control={control}
                render={({ field }) => <TextField {...field} type="hidden" sx={{ display: 'none' }} />}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" size="small" type="submit">
              <Iconify icon={'material-symbols:save'} /> บันทึก
            </Button>
            <Button variant="contained" color="error" size="small" onClick={handleCloseForm}>
              <Iconify icon={'material-symbols:close'} /> ปิด
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(isNotify)}
        onClose={handleNotifyClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
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

      {/* Notify confirm delete */}
      <Dialog
        open={Boolean(isOpenDelete)}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{ bgcolor: '#c62828', color: 'common.white' }}>
          ยืนยันการลบข้อมูลรายละเอียด {`${selectedID?.error_type_name}`}
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            ต้องการลบ{' '}
            <b>
              <u>{`"${selectedID?.error_type_list_detail}"`}</u>
            </b>{' '}
            ใช่หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={(e) => handleConfirmDelete(e, selectedID?.type_id)} autoFocus sx={{ color: 'error.main' }}>
            <Iconify icon={'eva:trash-2-outline'} /> ยืนยัน
          </Button>
          <Button onClick={handleClose}>
            <Iconify icon={'eva:close-outline'} /> ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
