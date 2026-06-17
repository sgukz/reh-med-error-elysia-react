import React, { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import { styled, alpha } from '@mui/material/styles';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';

import { getReportSummary8, getMedErrorDeptBySection } from '../../libs/MedError';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { MedErrorLevel, MedErrorTypeAll } from '../../data/DataMedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN , formatDateRange} from '../../utils/formatTime';

// ============================================================================
// Constants
// ============================================================================

// สีระดับความรุนแรง — ไล่ตามระดับอันตราย (เหมือน ReportSummary6)
const SEVERITY_COLORS = {
  A: { bg: 'rgba(148, 163, 184, 0.06)', chipSx: { bgcolor: '#94a3b8', color: '#fff' }, desc: 'ไม่มีความคลาดเคลื่อน' },
  B: { bg: 'rgba(34, 197, 94, 0.06)',   chipSx: { bgcolor: '#22c55e', color: '#fff' }, desc: 'ไม่ถึงตัวผู้ป่วย' },
  C: { bg: 'rgba(16, 185, 129, 0.06)',  chipSx: { bgcolor: '#10b981', color: '#fff' }, desc: 'ถึงผู้ป่วย ไม่อันตราย' },
  D: { bg: 'rgba(6, 182, 212, 0.06)',   chipSx: { bgcolor: '#06b6d4', color: '#fff' }, desc: 'ต้องติดตามเพิ่ม' },
  E: { bg: 'rgba(245, 158, 11, 0.10)',  chipSx: { bgcolor: '#f59e0b', color: '#fff' }, desc: 'อันตรายชั่วคราว ต้องรักษา' },
  F: { bg: 'rgba(234, 88, 12, 0.10)',   chipSx: { bgcolor: '#ea580c', color: '#fff' }, desc: 'ต้องนอน รพ. / ยืดเวลารักษา' },
  G: { bg: 'rgba(239, 68, 68, 0.08)',   chipSx: { bgcolor: '#ef4444', color: '#fff' }, desc: 'อันตรายถาวร' },
  H: { bg: 'rgba(220, 38, 38, 0.10)',   chipSx: { bgcolor: '#dc2626', color: '#fff' }, desc: 'เกือบเสียชีวิต' },
  I: { bg: 'rgba(127, 29, 29, 0.14)',   chipSx: { bgcolor: '#7f1d1d', color: '#fff' }, desc: 'เสียชีวิต' },
};

const HAD_LABEL = 'High Alert Drugs';

// คำนวณต้นปีงบ (ตค ปีก่อน → กย ปีนี้)
const startOfFiscalYear = () => {
  const now = dayjs();
  const month = now.month() + 1;
  const ceYear = month >= 10 ? now.year() : now.year() - 1;
  return dayjs(`${ceYear}-10-01`);
};

// Quick date-range presets
const DATE_PRESETS = [
  { key: '7d', label: '7 วัน', range: () => [dayjs().subtract(6, 'day'), dayjs()] },
  { key: '30d', label: '30 วัน', range: () => [dayjs().subtract(29, 'day'), dayjs()] },
  { key: 'tm', label: 'เดือนนี้', range: () => [dayjs().startOf('month'), dayjs()] },
  { key: 'lm', label: 'เดือนก่อน', range: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
  { key: 'fy', label: 'ปีงบประมาณ', range: () => [startOfFiscalYear(), dayjs()] },
];

// ============================================================================
// Styled — โทน teal ตามธีมหลัก
// ============================================================================
const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderColor: theme.palette.common.white,
    fontWeight: 700,
    fontSize: 13,
    padding: '10px 12px',
    whiteSpace: 'nowrap',
    '& .MuiTableSortLabel-root, & .MuiTableSortLabel-root:hover, & .MuiTableSortLabel-root.Mui-active': {
      color: theme.palette.common.white,
    },
    '& .MuiTableSortLabel-icon': {
      color: `${theme.palette.common.white} !important`,
    },
  },
}));

const BodyCell = styled(TableCell)(() => ({
  fontSize: 12.5,
  padding: '8px 12px',
  verticalAlign: 'top',
  borderBottom: '1px solid rgba(145, 158, 171, 0.12)',
}));

// ============================================================================
// Table columns
// ============================================================================
const COLUMNS = [
  { key: 'idx', label: 'ลำดับ', sortable: false, width: 56 },
  { key: 'med_error_datetime', label: 'เวลาที่บันทึก', sortable: true, width: 140 },
  { key: 'med_error_date', label: 'วัน/เดือน/ปี ที่พบ', sortable: true, width: 120 },
  { key: 'error_time', label: 'เวลาเกิดเหตุ', sortable: true, width: 85 },
  { key: 'error_ward_name', label: 'สถานที่เกิดเหตุ', sortable: true, width: 160 },
  { key: 'involved_ward_name', label: 'หน่วยงานที่เกี่ยวข้อง', sortable: true, width: 160 },
  { key: 'error_event', label: 'เหตุการณ์ที่พบ', sortable: true, width: 220 },
  { key: 'error_level', label: 'ระดับความรุนแรง', sortable: true, width: 110 },
  { key: 'error_clear', label: 'การแก้ไขเบื้องต้น', sortable: false, width: 200 },
  { key: 'error_analysis', label: 'วิเคราะห์สาเหตุ', sortable: false, width: 180 },
  { key: 'error_type_name', label: 'ประเภท Error', sortable: true, width: 150 },
  { key: 'error_type_detail', label: 'รายละเอียด Error', sortable: false, width: 200 },
  { key: 'error_alert', label: 'ความคลาดเคลื่อน', sortable: true, width: 120 },
];

// ============================================================================
// Main component
// ============================================================================
const ReportSummary8 = () => {
  const navigate = useNavigate();

  const [firstDate, setFirstDate] = useState(dayjs().startOf('month'));
  const [lastDate, setLastDate] = useState(dayjs());
  const [token, setToken] = useState(null);

  const [dataReport, setDataReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [selectedDepCode, setSelectedDepCode] = useState([]);
  const [selectedErrorLevel, setSelectedErrorLevel] = useState([]);
  const [selectedErrorLevelCode, setSelectedErrorLevelCode] = useState([]);
  const [selectedErrorType, setSelectedErrorType] = useState('');
  const [selectedErrorTypeCode, setSelectedErrorTypeCode] = useState('');
  const [selectedErrorAlert, setSelectedErrorAlert] = useState('');
  const [loading, setLoading] = useState(true);

  // Table state
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('med_error_date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // ============================================================================
  // Data loading
  // ============================================================================
  const buildFilter = useCallback((overrides = {}) => ({
    firstDate: formatDateEN(overrides.firstDate ?? firstDate),
    lastDate: formatDateEN(overrides.lastDate ?? lastDate),
    depCode: overrides.depCode ?? selectedDepCode,
    errorType: overrides.errorType ?? selectedErrorTypeCode ?? '',
    errorLevel: overrides.errorLevel ?? selectedErrorLevelCode,
    errorAlert: overrides.errorAlert ?? selectedErrorAlert ?? '',
  }), [firstDate, lastDate, selectedDepCode, selectedErrorTypeCode, selectedErrorLevelCode, selectedErrorAlert]);

  const loadReportResult = useCallback(async (authToken, filter) => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const res = await getReportSummary8(authToken, filter);
      const { statusCode, reportList } = res?.data ?? {};
      if (statusCode === 200 && !_.isEmpty(reportList)) {
        setDataReport(reportList);
      } else {
        setDataReport([]);
      }
    } catch (_e) {
      setDataReport([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async (authToken) => {
    try {
      const result = await getMedErrorDeptBySection(authToken, 'Y');
      const { statusCode, departmentList } = result?.data ?? {};
      if (statusCode === 200 && !_.isEmpty(departmentList)) {
        setDepartments(departmentList);
      }
    } catch (_e) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const verify = await verifyToken(null);
      const { statusCode, access_token } = verify ?? {};
      if (statusCode === 200 && access_token) {
        setToken(access_token);
        fetchDepartments(access_token);
        const initFilter = {
          firstDate: formatDateEN(dayjs().startOf('month')),
          lastDate: formatDateEN(dayjs()),
          depCode: [],
          errorType: '',
          errorLevel: [],
          errorAlert: '',
        };
        loadReportResult(access_token, initFilter);
      } else {
        navigate('/login', { replace: true });
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // Filter handlers
  // ============================================================================
  const triggerLoad = (overrides) => {
    if (!token) return;
    const filter = buildFilter(overrides);
    loadReportResult(token, filter);
    setPage(0);
  };

  const handleFirstDateChange = (d) => {
    setFirstDate(d);
    triggerLoad({ firstDate: d });
  };
  const handleLastDateChange = (d) => {
    setLastDate(d);
    triggerLoad({ lastDate: d });
  };

  const applyPreset = (presetKey) => {
    const preset = DATE_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    const [d1, d2] = preset.range();
    setFirstDate(d1);
    setLastDate(d2);
    triggerLoad({ firstDate: d1, lastDate: d2 });
  };

  const handleChangeDeps = (_event, value) => {
    setSelectedDeps(value);
    const depCodes = value.map((item) => item.med_error_depcode);
    setSelectedDepCode(depCodes);
    triggerLoad({ depCode: depCodes });
  };

  const handleChangeErrorLevel = (_event, value) => {
    setSelectedErrorLevel(value);
    const levelCodes = value.map((item) => item.med_error_level_code);
    setSelectedErrorLevelCode(levelCodes);
    triggerLoad({ errorLevel: levelCodes });
  };

  const handleChangeErrorType = (_event, value) => {
    setSelectedErrorType(value);
    const typeCode = value?.error_type ?? '';
    setSelectedErrorTypeCode(typeCode);
    triggerLoad({ errorType: typeCode });
  };

  const handleChangeErrorAlert = (event) => {
    const v = event.target.value;
    setSelectedErrorAlert(v);
    triggerLoad({ errorAlert: v });
  };

  // ============================================================================
  // Computed label for subtitle
  // ============================================================================
  const filterSummary = useMemo(() => {
    const typeName = selectedErrorType ? selectedErrorType?.error_type_name : 'ทั้งหมด';
    const dateRange = formatDateRange(firstDate, lastDate);
    return { typeName, dateRange };
  }, [selectedErrorType, firstDate, lastDate]);

  // ============================================================================
  // Client-side search + sort + pagination
  // ============================================================================
  const filtered = useMemo(() => {
    if (!search.trim()) return dataReport;
    const q = search.trim().toLowerCase();
    return dataReport.filter((r) =>
      [r.error_event, r.error_ward_name, r.involved_ward_name, r.error_clear, r.error_analysis, r.error_type_name, r.error_type_detail, r.error_alert]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [dataReport, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = String(a?.[orderBy] ?? '');
      const bv = String(b?.[orderBy] ?? '');
      if (av < bv) return order === 'asc' ? -1 : 1;
      if (av > bv) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, orderBy, order]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleSort = (key) => {
    if (orderBy === key) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(key);
      setOrder('desc');
    }
  };

  // ============================================================================
  // Excel Export — ใช้ sorted (ทั้งหมดหลัง filter)
  // ============================================================================
  const handleExportExcel = () => {
    if (isLoading || sorted.length === 0) return;
    const rows = sorted.map((row, index) => ({
      'ลำดับ': index + 1,
      'เวลาที่บันทึก': formatDateTime(row.med_error_datetime, 5),
      'วัน/เดือน/ปี ที่พบเหตุการณ์': formatDateTime(row.med_error_date, 1),
      'เวลาที่เกิดเหตุการณ์': row.error_time || '',
      'สถานที่เกิดเหตุการณ์': row.error_ward_name || '',
      'หน่วยงานที่เกี่ยวข้อง': row.involved_ward_name || '',
      'เหตุการณ์ที่พบ': row.error_event || '',
      'ระดับความรุนแรง': row.error_level || '',
      'การแก้ไขปัญหาเบื้องต้น': row.error_clear || '',
      'วิเคราะห์สาเหตุ': row.error_analysis || '',
      'ประเภท Error': row.error_type_name || '',
      'รายละเอียด Error': row.error_type_detail || '',
      'ความคลาดเคลื่อน': row.error_alert || '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'รายงานความคลาดเคลื่อน');
    const fileName = `report-summary8-${formatDateEN(firstDate)}-${formatDateEN(lastDate)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Box>
      {/* ==================== Header Card (Glass) ==================== */}
      <Box
        className="guk-glass guk-anim-fade-up"
        sx={{
          mb: 3,
          borderRadius: '20px',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack spacing={2}>
          {/* Row 1: Title + Export */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
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
                <Iconify icon="eva:file-text-fill" width={24} sx={{ color: '#0d9488' }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  className="guk-gradient-text-teal"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {`รายงานความคลาดเคลื่อน (${filterSummary.typeName})`}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: '#475569', mt: 0.5 }}>
                  ช่วง <Box component="span" sx={{ fontWeight: 700, color: '#0d9488' }}>{filterSummary.dateRange}</Box>
                  {selectedDeps.length > 0 && (
                    <>
                      {' · '}หน่วยงาน{' '}
                      <Box component="span" sx={{ fontWeight: 700, color: '#0d9488' }}>{selectedDeps.length} แห่ง</Box>
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:download-fill" />}
              onClick={handleExportExcel}
              disabled={isLoading || sorted.length === 0}
              sx={{
                background: sorted.length > 0 ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' : undefined,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: sorted.length > 0 ? '0 4px 14px -4px rgba(13, 148, 136, 0.4)' : 'none',
                '&:hover': {
                  background: sorted.length > 0 ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' : undefined,
                },
              }}
            >
              Export Excel
            </Button>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(153, 246, 228, 0.3)' }} />

          {/* Quick presets */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mr: 0.5 }}>
              ช่วงเวลายอดนิยม:
            </Typography>
            <ButtonGroup
              size="small"
              variant="outlined"
              sx={{
                '& .MuiButton-root': {
                  textTransform: 'none',
                  borderColor: 'rgba(13, 148, 136, 0.3)',
                  color: '#0d9488',
                  fontWeight: 600,
                  fontSize: 12,
                  px: 1.25,
                  py: 0.25,
                  '&:hover': {
                    backgroundColor: 'rgba(20, 184, 166, 0.08)',
                    borderColor: '#0d9488',
                  },
                },
              }}
            >
              {DATE_PRESETS.map((p) => (
                <Button key={p.key} onClick={() => applyPreset(p.key)}>
                  {p.label}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>

          {/* Filters — 2 rows compact */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
            <Grid container spacing={1.5}>
              {/* Row 1: dates + department + error type */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={firstDate}
                  onChange={handleFirstDateChange}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      onClick={params.inputProps.onClick}
                      InputProps={{ ...params.InputProps, readOnly: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="ถึงวันที่"
                  value={lastDate}
                  onChange={handleLastDateChange}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      onClick={params.inputProps.onClick}
                      InputProps={{ ...params.InputProps, readOnly: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={departments}
                  value={selectedDeps}
                  onChange={handleChangeDeps}
                  getOptionLabel={(option) => option.med_error_depname}
                  isOptionEqualToValue={(option, value) => option.med_error_depcode === value.med_error_depcode}
                  loading={loading}
                  size="small"
                  renderOption={(props, option, { selected }) => {
                    // eslint-disable-next-line react/prop-types
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <FormControlLabel
                          control={<Checkbox checked={selected} size="small" />}
                          label={<ListItemText primary={option.med_error_depname} primaryTypographyProps={{ fontSize: 13 }} />}
                        />
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="เลือกหน่วยงาน"
                      placeholder="ค้นหา"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  options={MedErrorTypeAll}
                  value={selectedErrorType || null}
                  onChange={handleChangeErrorType}
                  getOptionLabel={(option) => (option ? option.error_type_name : '')}
                  isOptionEqualToValue={(option, value) => (value ? option.error_type === value.error_type : false)}
                  size="small"
                  renderOption={(props, option) => {
                    // eslint-disable-next-line react/prop-types
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <ListItemText primary={option.error_type_name} primaryTypographyProps={{ fontSize: 13 }} />
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="ประเภท Error" placeholder="ทั้งหมด" />
                  )}
                />
              </Grid>

              {/* Row 2: error level + HAD */}
              <Grid item xs={12} sm={6} md={6}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={MedErrorLevel}
                  value={selectedErrorLevel}
                  onChange={handleChangeErrorLevel}
                  getOptionLabel={(option) => option.med_error_level_code}
                  isOptionEqualToValue={(option, value) => option.med_error_level_code === value.med_error_level_code}
                  size="small"
                  renderOption={(props, option, { selected }) => {
                    // eslint-disable-next-line react/prop-types
                    const { key, ...optionProps } = props;
                    const sev = SEVERITY_COLORS[option.med_error_level_code];
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox checked={selected} size="small" sx={{ mr: 0.5 }} />
                        <Chip label={option.med_error_level_code} size="small" sx={{ mr: 1, fontWeight: 700, borderRadius: '8px', minWidth: 28, ...sev?.chipSx }} />
                        <Typography variant="body2" sx={{ fontSize: 12.5 }}>{sev?.desc || option.med_error_level_code}</Typography>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="ระดับความรุนแรง" placeholder="เลือกได้หลายระดับ" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="rs8-error-alert-label">ความคลาดเคลื่อน (HAD)</InputLabel>
                  <Select
                    labelId="rs8-error-alert-label"
                    id="rs8-error-alert"
                    value={selectedErrorAlert}
                    label="ความคลาดเคลื่อน (HAD)"
                    onChange={handleChangeErrorAlert}
                  >
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="Y" sx={{ color: '#FF4842', fontWeight: 600 }}>
                      High Alert Drugs
                    </MenuItem>
                    <MenuItem value="N">ไม่ใช่ High Alert Drugs</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Stack>
      </Box>

      {/* ==================== Search bar + count ==================== */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          placeholder="ค้นหา เหตุการณ์ / สถานที่ / สาเหตุ ..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{
            width: 400,
            maxWidth: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#fff',
              '&:hover fieldset': { borderColor: '#5eead4' },
              '&.Mui-focused fieldset': { borderColor: '#0d9488' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={20} sx={{ color: '#0d9488' }} />
              </InputAdornment>
            ),
          }}
        />
        <Chip
          icon={<Iconify icon="eva:layers-fill" width={16} />}
          label={isLoading ? 'กำลังโหลด...' : `${sorted.length.toLocaleString()} รายการ`}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: '10px',
            borderColor: 'rgba(13, 148, 136, 0.3)',
            color: '#0d9488',
            fontWeight: 600,
            fontSize: '0.75rem',
            '& .MuiChip-icon': { color: '#14b8a6' },
          }}
        />
      </Stack>

      {/* ==================== Table ==================== */}
      <Paper
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(145, 158, 171, 0.12)',
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        }}
      >
        <Scrollbar>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {COLUMNS.map((c) => (
                    <StyledHeadCell key={c.key} sx={{ minWidth: c.width }}>
                      {c.sortable ? (
                        <TableSortLabel
                          active={orderBy === c.key}
                          direction={orderBy === c.key ? order : 'asc'}
                          onClick={() => handleSort(c.key)}
                        >
                          {c.label}
                        </TableSortLabel>
                      ) : c.label}
                    </StyledHeadCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <BodyCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={1.5}>
                        <CircularProgress size={28} sx={{ color: '#0d9488' }} />
                        <Typography variant="body2" color="text.secondary">กำลังโหลดข้อมูล...</Typography>
                      </Stack>
                    </BodyCell>
                  </TableRow>
                )}
                {!isLoading && paged.length === 0 && (
                  <TableRow>
                    <BodyCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={1}>
                        <Iconify icon="eva:inbox-fill" width={48} sx={{ color: '#C4CDD5' }} />
                        <Typography variant="body2" color="text.secondary">ไม่พบข้อมูลในช่วงเวลาที่เลือก</Typography>
                      </Stack>
                    </BodyCell>
                  </TableRow>
                )}
                {!isLoading && paged.map((r, i) => {
                  const sev = SEVERITY_COLORS[String(r.error_level || '').toUpperCase()] || null;
                  const isHad = r.error_alert === HAD_LABEL;
                  // แยกสีพื้นหลัง: HAD = แดงอ่อน, Non-HAD = ฟ้าจาง, ซ้อนกับ severity
                  const hadBg = isHad ? 'rgba(255, 72, 66, 0.06)' : 'rgba(59, 130, 246, 0.03)';
                  const rowBg = sev?.bg || hadBg;
                  const leftBorder = isHad ? '3px solid #FF4842' : '3px solid transparent';
                  return (
                    <TableRow
                      key={`${r.error_id || r.med_error_id}-${i}`}
                      sx={{
                        backgroundColor: rowBg,
                        borderLeft: leftBorder,
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: (t) => alpha(t.palette.primary.lighter, 0.35) },
                      }}
                    >
                      <BodyCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{page * rowsPerPage + i + 1}</BodyCell>
                      <BodyCell>{formatDateTime(r.med_error_datetime, 5)}</BodyCell>
                      <BodyCell>{formatDateTime(r.med_error_date, 1)}</BodyCell>
                      <BodyCell>{r.error_time || ''}</BodyCell>
                      <BodyCell>{r.error_ward_name || ''}</BodyCell>
                      <BodyCell>{r.involved_ward_name || ''}</BodyCell>
                      <BodyCell sx={{ maxWidth: 260 }}>
                        <Tooltip title={r.error_event || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                            {r.error_event || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell>
                        {sev ? (
                          <Tooltip title={`${r.error_level}: ${sev.desc}`} arrow placement="top">
                            <Chip label={r.error_level} size="small" sx={{ fontWeight: 700, borderRadius: '8px', minWidth: 32, ...sev.chipSx }} />
                          </Tooltip>
                        ) : (r.error_level || '-')}
                      </BodyCell>
                      <BodyCell sx={{ maxWidth: 240 }}>
                        <Tooltip title={r.error_clear || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                            {r.error_clear || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell sx={{ maxWidth: 220 }}>
                        <Tooltip title={r.error_analysis || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {r.error_analysis || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell sx={{ fontSize: 11.5 }}>{r.error_type_name || ''}</BodyCell>
                      <BodyCell sx={{ maxWidth: 240 }}>
                        <Tooltip title={r.error_type_detail || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                            {r.error_type_detail || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell>
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
                      </BodyCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10) || 25); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="แถวต่อหน้า"
          sx={{
            borderTop: '1px solid rgba(145, 158, 171, 0.12)',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.8rem',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default ReportSummary8;
