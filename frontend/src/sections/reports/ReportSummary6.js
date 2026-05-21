import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import { styled, alpha } from '@mui/material/styles';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';

import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getReportSummary6 } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN } from '../../utils/formatTime';

// ============================================================================
// Constants
// ============================================================================
const ERROR_TYPES = [
  { id: 0, name: 'ทั้งหมด' },
  { id: 1, name: 'Prescription Error' },
  { id: 2, name: 'Dispensing Error' },
  { id: 3, name: 'Pre-Administration Error' },
  { id: 4, name: 'Administration Error' },
  { id: 5, name: 'Processing Error' },
  { id: 6, name: 'Transcribing Error' },
];

const SEVERITY_COLORS = {
  A: { bg: 'rgba(34, 197, 94, 0.06)', chipColor: 'success', label: 'A' },
  B: { bg: 'rgba(34, 197, 94, 0.06)', chipColor: 'success', label: 'B' },
  C: { bg: 'rgba(34, 197, 94, 0.06)', chipColor: 'success', label: 'C' },
  D: { bg: 'rgba(34, 197, 94, 0.06)', chipColor: 'success', label: 'D' },
  E: { bg: 'rgba(255, 193, 7, 0.08)', chipColor: 'warning', label: 'E' },
  F: { bg: 'rgba(255, 193, 7, 0.08)', chipColor: 'warning', label: 'F' },
  G: { bg: 'rgba(255, 72, 66, 0.06)', chipColor: 'error', label: 'G' },
  H: { bg: 'rgba(255, 72, 66, 0.06)', chipColor: 'error', label: 'H' },
  I: { bg: 'rgba(255, 72, 66, 0.06)', chipColor: 'error', label: 'I' },
};

const HAD_LABEL = 'High Alert Drugs';

// คำนวณต้นปีงบ (ตค ปีก่อน → กย ปีนี้)
const startOfFiscalYear = () => {
  const now = dayjs();
  const month = now.month() + 1; // 1-12
  const ceYear = month >= 10 ? now.year() : now.year() - 1;
  return dayjs(`${ceYear}-10-01`);
};

// ============================================================================
// Styled — ใช้โทน teal ตามธีมหลัก
// ============================================================================
const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: 12.5,
    padding: '10px 12px',
    whiteSpace: 'nowrap',
    borderBottom: 'none',
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
// Sub-components — StatCard ปรับใหม่ให้โทน teal
// ============================================================================
const STAT_CARD_CONFIGS = {
  primary: { gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', iconBg: 'rgba(13, 148, 136, 0.12)', iconColor: '#0d9488' },
  error: { gradient: 'linear-gradient(135deg, #B72136 0%, #FF4842 100%)', iconBg: 'rgba(255, 72, 66, 0.12)', iconColor: '#FF4842' },
  warning: { gradient: 'linear-gradient(135deg, #B78103 0%, #FFC107 100%)', iconBg: 'rgba(255, 193, 7, 0.12)', iconColor: '#B78103' },
  info: { gradient: 'linear-gradient(135deg, #0C53B7 0%, #1890FF 100%)', iconBg: 'rgba(24, 144, 255, 0.12)', iconColor: '#1890FF' },
  secondary: { gradient: 'linear-gradient(135deg, #1939B7 0%, #3366FF 100%)', iconBg: 'rgba(51, 102, 255, 0.12)', iconColor: '#3366FF' },
};

const StatCard = ({ icon, color, label, value, sub }) => {
  const config = STAT_CARD_CONFIGS[color] || STAT_CARD_CONFIGS.primary;
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: alpha(config.iconColor, 0.15),
        boxShadow: `0 2px 12px 0 ${alpha(config.iconColor, 0.08)}`,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px 0 ${alpha(config.iconColor, 0.16)}`,
        },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, px: 2.5 }}>
        <Avatar
          sx={{
            bgcolor: config.iconBg,
            color: config.iconColor,
            width: 52,
            height: 52,
            borderRadius: '14px',
          }}
          variant="rounded"
        >
          <Iconify icon={icon} width={26} />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.25, color: config.iconColor }} noWrap title={String(value ?? '')}>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary" noWrap title={sub} sx={{ fontSize: '0.7rem' }}>{sub}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sub: PropTypes.string,
};

// แสดง chip ระยะเวลา RCA (สีตามเกณฑ์)
const RcaDaysChip = ({ days }) => {
  if (days === null || days === undefined || !Number.isFinite(Number(days))) {
    return <Chip label="—" size="small" variant="outlined" sx={{ borderRadius: '8px', fontSize: 11 }} />;
  }
  const n = Number(days);
  let color = 'default';
  if (n <= 7) color = 'success';
  else if (n <= 30) color = 'warning';
  else color = 'error';
  return <Chip label={`${n} วัน`} size="small" color={color} sx={{ fontWeight: 600, borderRadius: '8px', fontSize: 11 }} />;
};

RcaDaysChip.propTypes = {
  days: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

// ============================================================================
// Main component
// ============================================================================
const COLUMNS = [
  { key: 'idx', label: 'ลำดับ', sortable: false, width: 56 },
  { key: 'error_date', label: 'วันที่เกิดเหตุ', sortable: true, width: 115 },
  { key: 'error_time', label: 'เวลา', sortable: true, width: 70 },
  { key: 'error_ward_name', label: 'สถานที่เกิดเหตุ', sortable: true, width: 160 },
  { key: 'error_event', label: 'เหตุการณ์', sortable: true, width: 220 },
  { key: 'error_level', label: 'ระดับความรุนแรง', sortable: true, width: 100 },
  { key: 'error_type_name', label: 'ประเภท Error', sortable: true, width: 150 },
  { key: 'error_type_detail', label: 'รายละเอียด Error', sortable: false, width: 200 },
  { key: 'error_analysis', label: 'วิเคราะห์สาเหตุ', sortable: false, width: 180 },
  { key: 'error_alert', label: 'HAD', sortable: true, width: 100 },
  { key: 'error_clear', label: 'การแก้ไขเบื้องต้น', sortable: false, width: 200 },
  { key: 'error_doctor', label: 'แพทย์ผู้สั่ง', sortable: true, width: 140 },
  { key: 'rca_text', label: 'รายละเอียด RCA', sortable: false, width: 220 },
  { key: 'rca_by', label: 'RCA โดย', sortable: true, width: 130 },
  { key: 'updated_rca', label: 'วันที่ RCA', sortable: true, width: 130 },
  { key: 'rca_days', label: 'ระยะเวลา (วัน)', sortable: true, width: 110 },
  { key: 'error_user_name', label: 'ผู้บันทึก', sortable: true, width: 130 },
];

const ReportSummary6 = () => {
  const navigate = useNavigate();

  const [firstDate, setFirstDate] = useState(startOfFiscalYear());
  const [lastDate, setLastDate] = useState(dayjs());
  const [errorType, setErrorType] = useState(0);
  const [token, setToken] = useState(null);

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    levelEPlus: 0,
    hadCount: 0,
    avgRcaDays: 0,
    topErrorType: '-',
    topWard: '-',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Table state
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('error_date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadReport = useCallback(async (authToken, params) => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const res = await getReportSummary6(authToken, params);
      const body = res?.data ?? {};
      if (body.statusCode === 200) {
        setData(Array.isArray(body.reportList) ? body.reportList : []);
        setSummary(body.summary || {
          total: 0, levelEPlus: 0, hadCount: 0, avgRcaDays: 0, topErrorType: '-', topWard: '-',
        });
      } else {
        setData([]);
        setSummary({ total: 0, levelEPlus: 0, hadCount: 0, avgRcaDays: 0, topErrorType: '-', topWard: '-' });
      }
    } catch (_e) {
      setData([]);
      setSummary({ total: 0, levelEPlus: 0, hadCount: 0, avgRcaDays: 0, topErrorType: '-', topWard: '-' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token } = verify ?? {};
      if (statusCode === 200 && profile && access_token) {
        setToken(access_token);
        loadReport(access_token, {
          dateStart: formatDateEN(startOfFiscalYear()),
          dateEnd: formatDateEN(dayjs()),
          errorType: 0,
        });
      } else {
        navigate('/login', { replace: true });
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refire เมื่อเปลี่ยน filter
  const triggerLoad = (nextFirst, nextLast, nextType) => {
    if (!token) return;
    if (!nextFirst || !nextLast) return;
    loadReport(token, {
      dateStart: formatDateEN(nextFirst),
      dateEnd: formatDateEN(nextLast),
      errorType: nextType ?? 0,
    });
  };

  const handleFirstDateChange = (d) => {
    setFirstDate(d);
    setPage(0);
    triggerLoad(d, lastDate, errorType);
  };
  const handleLastDateChange = (d) => {
    setLastDate(d);
    setPage(0);
    triggerLoad(firstDate, d, errorType);
  };
  const handleErrorTypeChange = (e) => {
    const v = Number(e.target.value);
    setErrorType(v);
    setPage(0);
    triggerLoad(firstDate, lastDate, v);
  };

  // ============================================================================
  // Client-side filter (search) + sort
  // ============================================================================
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      return [r.error_event, r.error_ward_name, r.rca_text, r.error_user_name, r.error_doctor, r.error_type_name, r.error_type_detail]
        .some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [data, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av = a?.[orderBy];
      let bv = b?.[orderBy];
      // numeric for rca_days
      if (orderBy === 'rca_days') {
        av = Number.isFinite(Number(av)) ? Number(av) : -Infinity;
        bv = Number.isFinite(Number(bv)) ? Number(bv) : -Infinity;
        return order === 'asc' ? av - bv : bv - av;
      }
      av = String(av ?? '');
      bv = String(bv ?? '');
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
  // Excel Export — 2 sheets
  // ============================================================================
  const handleExportExcel = () => {
    if (isLoading) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: สรุป
    const sheet1 = [
      ['สรุปอุบัติการณ์ที่ได้ RCA แล้ว'],
      [`ช่วงวันที่: ${formatDateEN(firstDate)} ถึง ${formatDateEN(lastDate)}`],
      [`ประเภท Error: ${ERROR_TYPES.find((t) => t.id === errorType)?.name || 'ทั้งหมด'}`],
      [],
      ['รายการ', 'ค่า'],
      ['จำนวน RCA ทั้งหมด', summary.total],
      ['ระดับ E ขึ้นไป', summary.levelEPlus],
      ['High Alert Drugs (HAD)', summary.hadCount],
      ['เวลาตอบสนอง RCA เฉลี่ย (วัน)', summary.avgRcaDays],
      ['ประเภท Error พบบ่อยสุด', summary.topErrorType || '-'],
      ['หน่วยงานพบบ่อยสุด', summary.topWard || '-'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet1), 'สรุป RCA');

    // Sheet 2: รายละเอียด — ใช้ sorted (ทั้งหมดที่ผ่าน filter) ไม่ใช่แค่ page ปัจจุบัน
    const rows = sorted.map((r, i) => ({
      ลำดับ: i + 1,
      'วันที่เกิดเหตุ': formatDateTime(r.error_date, 1),
      'เวลา': r.error_time || '',
      'สถานที่เกิดเหตุ': r.error_ward_name || '',
      'เหตุการณ์': r.error_event || '',
      'ระดับความรุนแรง': r.error_level || '',
      'ประเภท Error': r.error_type_name || '',
      'รายละเอียด Error': r.error_type_detail || '',
      'วิเคราะห์สาเหตุ': r.error_analysis || '',
      'HAD': r.error_alert || '',
      'การแก้ไขเบื้องต้น': r.error_clear || '',
      'แพทย์ผู้สั่ง': r.error_doctor || '',
      'รายละเอียด RCA': r.rca_text || '',
      'RCA โดย': r.rca_by || '',
      'วันที่ RCA': r.updated_rca || '',
      'ระยะเวลา (วัน)': r.rca_days ?? '',
      'ผู้บันทึก': r.error_user_name || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'รายละเอียด RCA');

    const fileName = `report-rca-summary6-${formatDateEN(firstDate)}-${formatDateEN(lastDate)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Box>
      {/* ==================== Header Card (Glass — ตาม Dashboard) ==================== */}
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
                <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: '#0d9488' }} />
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
                  สรุปอุบัติการณ์ที่ได้ RCA แล้ว
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#475569', mt: 0.25 }}>
                  {/* แสดงเฉพาะรายการที่ <Box component="span" sx={{ fontWeight: 700, color: '#0d9488' }}>is_rca = &quot;Y&quot;</Box> */}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:file-text-fill" />}
              onClick={handleExportExcel}
              disabled={isLoading || data.length === 0}
              sx={{
                background: data.length > 0 ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' : undefined,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: data.length > 0 ? '0 4px 14px -4px rgba(13, 148, 136, 0.4)' : 'none',
                '&:hover': {
                  background: data.length > 0 ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' : undefined,
                },
              }}
            >
              Export Excel
            </Button>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(153, 246, 228, 0.3)' }} />

          {/* Row 2: Filters */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DatePicker
                  label="วันที่เริ่ม"
                  value={firstDate}
                  onChange={handleFirstDateChange}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{ minWidth: 170 }}
                      onClick={params.inputProps.onClick}
                      InputProps={{ ...params.InputProps, readOnly: true }}
                    />
                  )}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>ถึง</Typography>
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
                      sx={{ minWidth: 170 }}
                      onClick={params.inputProps.onClick}
                      InputProps={{ ...params.InputProps, readOnly: true }}
                    />
                  )}
                />
              </Stack>
            </LocalizationProvider>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="error-type-label">ประเภท Error</InputLabel>
              <Select labelId="error-type-label" label="ประเภท Error" value={errorType} onChange={handleErrorTypeChange}>
                {ERROR_TYPES.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Box>

      {/* ==================== Summary Cards ==================== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon="eva:clipboard-fill" color="primary" label="จำนวน RCA ทั้งหมด" value={summary.total.toLocaleString()} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon="eva:alert-triangle-fill" color="error" label="ระดับ E ขึ้นไป" value={summary.levelEPlus.toLocaleString()} sub="ถึงตัวผู้ป่วย" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon="mdi:pill" color="warning" label="High Alert Drugs" value={summary.hadCount.toLocaleString()} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon="eva:clock-fill" color="info" label="เวลาตอบสนอง RCA เฉลี่ย" value={`${summary.avgRcaDays || 0} วัน`} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon="eva:bar-chart-2-fill" color="secondary" label="ประเภท Error พบบ่อยสุด" value={summary.topErrorType || '-'} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon="mdi:hospital-building" color="primary" label="หน่วยงานพบบ่อยสุด" value={summary.topWard || '-'} />
        </Grid>
      </Grid>

      {/* ==================== Search bar ==================== */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          placeholder="ค้นหา (เหตุการณ์ / หน่วยงาน / RCA / ผู้บันทึก)"
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
          <TableContainer>
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
                  return (
                    <TableRow
                      key={`${r.error_id}-${i}`}
                      sx={{
                        backgroundColor: sev?.bg || 'inherit',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: (t) => alpha(t.palette.primary.lighter, 0.35) },
                      }}
                    >
                      <BodyCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{page * rowsPerPage + i + 1}</BodyCell>
                      <BodyCell>{formatDateTime(r.error_date, 1)}</BodyCell>
                      <BodyCell>{r.error_time || ''}</BodyCell>
                      <BodyCell>{r.error_ward_name || ''}</BodyCell>
                      <BodyCell sx={{ maxWidth: 260 }}>
                        <Tooltip title={r.error_event || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                            {r.error_event || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell>
                        {sev ? (
                          <Chip label={r.error_level} size="small" color={sev.chipColor} sx={{ fontWeight: 700, borderRadius: '8px', minWidth: 32 }} />
                        ) : (r.error_level || '-')}
                      </BodyCell>
                      <BodyCell sx={{ fontSize: 11.5 }}>{r.error_type_name || ''}</BodyCell>
                      <BodyCell sx={{ maxWidth: 240 }}>
                        <Tooltip title={r.error_type_detail || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                            {r.error_type_detail || ''}
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
                      <BodyCell>
                        <Chip
                          label={isHad ? 'HAD' : 'Non-HAD'}
                          size="small"
                          color={isHad ? 'warning' : 'default'}
                          variant={isHad ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600, borderRadius: '8px', fontSize: 11 }}
                        />
                      </BodyCell>
                      <BodyCell sx={{ maxWidth: 240 }}>
                        <Tooltip title={r.error_clear || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                            {r.error_clear || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell>{r.error_doctor || ''}</BodyCell>
                      <BodyCell sx={{ maxWidth: 260 }}>
                        <Tooltip title={r.rca_text || ''} arrow placement="top">
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                            {r.rca_text || ''}
                          </span>
                        </Tooltip>
                      </BodyCell>
                      <BodyCell>{r.rca_by || ''}</BodyCell>
                      <BodyCell>{r.updated_rca ? formatDateTime(r.updated_rca, 5) : ''}</BodyCell>
                      <BodyCell><RcaDaysChip days={r.rca_days} /></BodyCell>
                      <BodyCell>{r.error_user_name || ''}</BodyCell>
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

export default ReportSummary6;
