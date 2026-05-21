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
  A: { bg: '#e8f5e9', chipColor: 'success', label: 'A' },
  B: { bg: '#e8f5e9', chipColor: 'success', label: 'B' },
  C: { bg: '#e8f5e9', chipColor: 'success', label: 'C' },
  D: { bg: '#e8f5e9', chipColor: 'success', label: 'D' },
  E: { bg: '#fff8e1', chipColor: 'warning', label: 'E' },
  F: { bg: '#fff8e1', chipColor: 'warning', label: 'F' },
  G: { bg: '#ffebee', chipColor: 'error', label: 'G' },
  H: { bg: '#ffebee', chipColor: 'error', label: 'H' },
  I: { bg: '#ffebee', chipColor: 'error', label: 'I' },
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
// Styled
// ============================================================================
const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 700,
    fontSize: 12.5,
    padding: '8px 10px',
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
  fontSize: 12,
  padding: '6px 10px',
  verticalAlign: 'top',
}));

// ============================================================================
// Sub-components
// ============================================================================
const StatCard = ({ icon, color, label, value, sub }) => (
  <Card sx={{ height: '100%', boxShadow: 2 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Avatar sx={{ bgcolor: (t) => alpha(t.palette[color]?.main || t.palette.primary.main, 0.15), color: `${color}.main`, width: 48, height: 48 }}>
        <Iconify icon={icon} width={24} />
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2, mt: 0.25 }} noWrap title={String(value ?? '')}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary" noWrap title={sub}>{sub}</Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

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
    return <Chip label="-" size="small" variant="outlined" />;
  }
  const n = Number(days);
  let color = 'default';
  if (n <= 7) color = 'success';
  else if (n <= 30) color = 'warning';
  else color = 'error';
  return <Chip label={`${n} วัน`} size="small" color={color} sx={{ fontWeight: 600 }} />;
};

RcaDaysChip.propTypes = {
  days: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

// ============================================================================
// Main component
// ============================================================================
const COLUMNS = [
  { key: 'idx', label: 'ลำดับ', sortable: false, width: 60 },
  { key: 'error_date', label: 'วันที่เกิดเหตุ', sortable: true, width: 120 },
  { key: 'error_time', label: 'เวลา', sortable: true, width: 80 },
  { key: 'error_ward_name', label: 'สถานที่เกิดเหตุ', sortable: true, width: 160 },
  { key: 'error_event', label: 'เหตุการณ์', sortable: true, width: 220 },
  { key: 'error_level', label: 'ระดับความรุนแรง', sortable: true, width: 110 },
  { key: 'error_type_name', label: 'ประเภท Error', sortable: true, width: 160 },
  { key: 'error_type_detail', label: 'รายละเอียด Error', sortable: false, width: 200 },
  { key: 'error_analysis', label: 'วิเคราะห์สาเหตุ', sortable: false, width: 180 },
  { key: 'error_alert', label: 'HAD', sortable: true, width: 110 },
  { key: 'error_clear', label: 'การแก้ไขเบื้องต้น', sortable: false, width: 200 },
  { key: 'error_doctor', label: 'แพทย์ผู้สั่ง', sortable: true, width: 140 },
  { key: 'rca_text', label: 'รายละเอียด RCA', sortable: false, width: 220 },
  { key: 'rca_by', label: 'RCA โดย', sortable: true, width: 140 },
  { key: 'updated_rca', label: 'วันที่ RCA', sortable: true, width: 140 },
  { key: 'rca_days', label: 'ระยะเวลา (วัน)', sortable: true, width: 120 },
  { key: 'error_user_name', label: 'ผู้บันทึก', sortable: true, width: 140 },
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

  // Refire เมื่อเปลี่ยน filter (debounce-less; แต่ user เปลี่ยนค่าทีละครั้ง ไม่หนัก)
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
      {/* Filter bar */}
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6">สรุปอุบัติการณ์ที่ได้ RCA แล้ว</Typography>
              <Typography variant="body2" color="text.secondary">
                แสดงเฉพาะรายการที่ <Box component="span" sx={{ fontWeight: 700 }}>is_rca = &quot;Y&quot;</Box>
              </Typography>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
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
                    sx={{ minWidth: 160 }}
                    onClick={params.inputProps.onClick}
                    InputProps={{ ...params.InputProps, readOnly: true }}
                  />
                )}
              />
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
                    sx={{ minWidth: 160 }}
                    onClick={params.inputProps.onClick}
                    InputProps={{ ...params.InputProps, readOnly: true }}
                  />
                )}
              />
            </LocalizationProvider>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="error-type-label">ประเภท Error</InputLabel>
              <Select labelId="error-type-label" label="ประเภท Error" value={errorType} onChange={handleErrorTypeChange}>
                {ERROR_TYPES.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify icon="eva:file-text-fill" />}
              onClick={handleExportExcel}
              disabled={isLoading || data.length === 0}
            >
              Export Excel
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
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

      {/* Search */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <TextField
          size="small"
          placeholder="ค้นหา (เหตุการณ์ / หน่วยงาน / RCA / ผู้บันทึก)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 360, maxWidth: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={18} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {isLoading ? 'กำลังโหลดข้อมูล...' : `แสดง ${sorted.length.toLocaleString()} รายการ`}
        </Typography>
      </Stack>

      {/* Table */}
      <Paper sx={{ boxShadow: 2 }}>
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
                    <BodyCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={22} sx={{ mr: 1 }} />
                      <Typography component="span" variant="body2">กำลังโหลดข้อมูล...</Typography>
                    </BodyCell>
                  </TableRow>
                )}
                {!isLoading && paged.length === 0 && (
                  <TableRow>
                    <BodyCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">ไม่พบข้อมูลในช่วงเวลาที่เลือก</Typography>
                    </BodyCell>
                  </TableRow>
                )}
                {!isLoading && paged.map((r, i) => {
                  const sev = SEVERITY_COLORS[String(r.error_level || '').toUpperCase()] || null;
                  const isHad = r.error_alert === HAD_LABEL;
                  return (
                    <TableRow key={`${r.error_id}-${i}`} sx={{ backgroundColor: sev?.bg || 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>
                      <BodyCell>{page * rowsPerPage + i + 1}</BodyCell>
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
                          <Chip label={r.error_level} size="small" color={sev.chipColor} sx={{ fontWeight: 700 }} />
                        ) : (r.error_level || '-')}
                      </BodyCell>
                      <BodyCell>{r.error_type_name || ''}</BodyCell>
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
                          sx={{ fontWeight: 600 }}
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
        />
      </Paper>
    </Box>
  );
};

export default ReportSummary6;
