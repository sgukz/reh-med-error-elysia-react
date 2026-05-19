import React, { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getReportSummary9 } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN } from '../../utils/formatTime';
import { MedErrorTypeAll } from '../../data/DataMedError';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderColor: theme.palette.common.white,
    fontWeight: 700,
    fontSize: 13,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12.5,
  },
}));

// สีของ Level cell (Impact + Likelihood) — อิงจากภาพอ้างอิง
const levelCellStyle = (level) => {
  if (level === null || level === undefined || Number.isNaN(level)) {
    return { backgroundColor: '#f5f5f5', color: '#9e9e9e' };
  }
  if (level <= 3) return { backgroundColor: '#80deea', color: '#004d40', fontWeight: 700 }; // cyan
  if (level <= 6) return { backgroundColor: '#a5d6a7', color: '#1b5e20', fontWeight: 700 }; // green
  if (level <= 7) return { backgroundColor: '#fff59d', color: '#827717', fontWeight: 700 }; // yellow
  return { backgroundColor: '#ef9a9a', color: '#b71c1c', fontWeight: 800 }; // red 8+
};

// สีของ Δ% — เพิ่ม=แดง, ลด=เขียว, 0/null=เทา
const deltaCellStyle = (deltaPct) => {
  if (deltaPct === null || deltaPct === undefined || Number.isNaN(deltaPct)) {
    return { color: '#9e9e9e' };
  }
  if (deltaPct > 0) return { color: '#c62828', fontWeight: 700 };
  if (deltaPct < 0) return { color: '#2e7d32', fontWeight: 700 };
  return { color: '#616161' };
};

// คำนวณ Δ% (B vs A): null ถ้า A=0
const calcDeltaPct = (a, b) => {
  if (a === 0 || a === null || a === undefined) return null;
  return Math.round(((b - a) / a) * 100);
};

const formatDeltaPct = (deltaPct) => {
  if (deltaPct === null || deltaPct === undefined || Number.isNaN(deltaPct)) return '—';
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct}%`;
};

const ReportSummary9 = () => {
  const navigate = useNavigate();

  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const startOfPrevMonth = today.subtract(1, 'month').startOf('month');
  const endOfPrevMonth = today.subtract(1, 'month').endOf('month');

  // Period A (required)
  const [firstDateA, setFirstDateA] = useState(startOfMonth);
  const [lastDateA, setLastDateA] = useState(today);
  // Period B (optional, สำหรับเปรียบเทียบ)
  const [compareMode, setCompareMode] = useState(false);
  const [firstDateB, setFirstDateB] = useState(startOfPrevMonth);
  const [lastDateB, setLastDateB] = useState(endOfPrevMonth);

  const [selectedErrorType, setSelectedErrorType] = useState(MedErrorTypeAll[0]);

  const [token, setToken] = useState(null);
  const [rows, setRows] = useState([]);
  const [errorTypeName, setErrorTypeName] = useState('');
  const [isCompareResult, setIsCompareResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadReport = useCallback(
    async (authToken, options) => {
      if (!authToken) return;
      const { errType, periodA, periodB, withCompare } = options;
      if (!errType?.error_type) return;
      setIsLoading(true);
      try {
        const params = {
          errorType: errType.error_type,
          firstDateA: periodA.firstDate,
          lastDateA: periodA.lastDate,
        };
        if (withCompare && periodB) {
          params.firstDateB = periodB.firstDate;
          params.lastDateB = periodB.lastDate;
        }
        const res = await getReportSummary9(authToken, params);
        const data = res?.data ?? {};
        if (data.statusCode === 200 && Array.isArray(data.reportList)) {
          setRows(data.reportList);
          setErrorTypeName(data.errorTypeName || '');
          setIsCompareResult(Boolean(data.compare));
        } else {
          setRows([]);
          setErrorTypeName('');
          setIsCompareResult(false);
        }
      } catch (_e) {
        setRows([]);
        setErrorTypeName('');
        setIsCompareResult(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // เรียก load เมื่อ filter เปลี่ยน — ใช้ค่าจาก state ตอนเรียก
  const triggerLoad = useCallback(
    (overrides = {}) => {
      const periodA = {
        firstDate: formatDateEN(overrides.firstDateA ?? firstDateA),
        lastDate: formatDateEN(overrides.lastDateA ?? lastDateA),
      };
      const useCompare = overrides.compareMode ?? compareMode;
      const periodB = useCompare
        ? {
            firstDate: formatDateEN(overrides.firstDateB ?? firstDateB),
            lastDate: formatDateEN(overrides.lastDateB ?? lastDateB),
          }
        : null;
      loadReport(token, {
        errType: overrides.errType ?? selectedErrorType,
        periodA,
        periodB,
        withCompare: useCompare,
      });
    },
    [token, selectedErrorType, firstDateA, lastDateA, compareMode, firstDateB, lastDateB, loadReport]
  );

  useEffect(() => {
    async function checkVerifyToken() {
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token: newToken } = verify ?? {};
      if (statusCode === 200 && profile) {
        setToken(newToken || null);
        // โหลดข้อมูลครั้งแรกด้วย Period A เดือนปัจจุบัน + ประเภท Error แรก
        loadReport(newToken, {
          errType: MedErrorTypeAll[0],
          periodA: { firstDate: formatDateEN(startOfMonth), lastDate: formatDateEN(today) },
          periodB: null,
          withCompare: false,
        });
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // คำนวณ rows ที่มี derived fields (total, delta, level)
  const enrichedRows = useMemo(() => {
    return rows.map((r) => {
      const hadA = Number(r.had_a) || 0;
      const nonHadA = Number(r.non_had_a) || 0;
      const totalA = Number(r.total_a) || 0;
      const hadB = isCompareResult ? Number(r.had_b) || 0 : 0;
      const nonHadB = isCompareResult ? Number(r.non_had_b) || 0 : 0;
      const totalB = isCompareResult ? Number(r.total_b) || 0 : 0;
      const impact = r.impact_score === null || r.impact_score === undefined ? null : Number(r.impact_score);
      const likelihood =
        r.likelihood_score === null || r.likelihood_score === undefined ? null : Number(r.likelihood_score);
      const level = impact !== null && likelihood !== null ? impact + likelihood : null;
      const deltaPct = isCompareResult ? calcDeltaPct(totalA, totalB) : null;
      return {
        ...r,
        hadA,
        nonHadA,
        totalA,
        hadB,
        nonHadB,
        totalB,
        impact,
        likelihood,
        level,
        deltaPct,
      };
    });
  }, [rows, isCompareResult]);

  // แถวผลรวม
  const totalsRow = useMemo(() => {
    return enrichedRows.reduce(
      (acc, r) => {
        acc.hadA += r.hadA;
        acc.nonHadA += r.nonHadA;
        acc.totalA += r.totalA;
        if (isCompareResult) {
          acc.hadB += r.hadB;
          acc.nonHadB += r.nonHadB;
          acc.totalB += r.totalB;
        }
        return acc;
      },
      { hadA: 0, nonHadA: 0, totalA: 0, hadB: 0, nonHadB: 0, totalB: 0 }
    );
  }, [enrichedRows, isCompareResult]);

  const totalsDeltaPct = isCompareResult ? calcDeltaPct(totalsRow.totalA, totalsRow.totalB) : null;

  const incompleteRowCount = enrichedRows.filter((r) => r.level === null).length;

  // Filter handlers
  const handleFirstA = (newDate) => {
    setFirstDateA(newDate);
    if (newDate && lastDateA) triggerLoad({ firstDateA: newDate });
  };
  const handleLastA = (newDate) => {
    setLastDateA(newDate);
    if (firstDateA && newDate) triggerLoad({ lastDateA: newDate });
  };
  const handleFirstB = (newDate) => {
    setFirstDateB(newDate);
    if (compareMode && newDate && lastDateB) triggerLoad({ firstDateB: newDate });
  };
  const handleLastB = (newDate) => {
    setLastDateB(newDate);
    if (compareMode && firstDateB && newDate) triggerLoad({ lastDateB: newDate });
  };
  const handleErrTypeChange = (_e, value) => {
    if (!value) return;
    setSelectedErrorType(value);
    triggerLoad({ errType: value });
  };
  const handleCompareToggle = (e) => {
    const next = e.target.checked;
    setCompareMode(next);
    triggerLoad({ compareMode: next });
  };

  // Excel Export — รูปแบบเดียวกับ Report 4 (json_to_sheet ตรงๆ, header เป็นภาษาไทย)
  const handleExportExcel = () => {
    if (_.isEmpty(enrichedRows)) return;

    const dataForExcel = enrichedRows.map((r) => {
      const base = {
        'รายละเอียด Error': `${r.error_type_list} ${r.error_type_list_detail}`,
        'HAD (A)': r.hadA,
        'Non-HAD (A)': r.nonHadA,
        'รวม (A)': r.totalA,
      };
      if (isCompareResult) {
        Object.assign(base, {
          'HAD (B)': r.hadB,
          'Non-HAD (B)': r.nonHadB,
          'รวม (B)': r.totalB,
          'Δ%': r.deltaPct === null ? '' : `${r.deltaPct > 0 ? '+' : ''}${r.deltaPct}%`,
        });
      }
      Object.assign(base, {
        Impact: r.impact ?? '',
        Likelihood: r.likelihood ?? '',
        Level: r.level ?? '',
      });
      return base;
    });

    // แถวผลรวมท้ายตาราง
    const totalsBase = {
      'รายละเอียด Error': 'ผลรวม',
      'HAD (A)': totalsRow.hadA,
      'Non-HAD (A)': totalsRow.nonHadA,
      'รวม (A)': totalsRow.totalA,
    };
    if (isCompareResult) {
      Object.assign(totalsBase, {
        'HAD (B)': totalsRow.hadB,
        'Non-HAD (B)': totalsRow.nonHadB,
        'รวม (B)': totalsRow.totalB,
        'Δ%': totalsDeltaPct === null ? '' : `${totalsDeltaPct > 0 ? '+' : ''}${totalsDeltaPct}%`,
      });
    }
    Object.assign(totalsBase, { Impact: '', Likelihood: '', Level: '' });
    dataForExcel.push(totalsBase);

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'แยกรายละเอียด Error');
    const fileName = `รายงานแยกรายละเอียด_Error_${errorTypeName || ''}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const periodALabel =
    formatDateEN(firstDateA) === formatDateEN(lastDateA)
      ? formatDateTime(formatDateEN(firstDateA))
      : `${formatDateTime(formatDateEN(firstDateA))} - ${formatDateTime(formatDateEN(lastDateA))}`;
  const periodBLabel = isCompareResult
    ? formatDateEN(firstDateB) === formatDateEN(lastDateB)
      ? formatDateTime(formatDateEN(firstDateB))
      : `${formatDateTime(formatDateEN(firstDateB))} - ${formatDateTime(formatDateEN(lastDateB))}`
    : '';

  return (
    <Box>
      <Stack direction="column">
        <Typography variant="h6">รายงานแยกรายละเอียด Error</Typography>
        <Typography variant="body2" color="text.secondary">
          แสดงรายการ subtype ของประเภท Error ที่เลือก พร้อม HAD/Non-HAD, Impact, Likelihood และ Level (Impact + Likelihood)
        </Typography>
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 2, py: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: 'primary.main' }}>
              ช่วง A:
            </Typography>
            <DatePicker
              label="วันที่"
              value={firstDateA}
              onChange={handleFirstA}
              inputFormat="d MMMM yyyy"
              disableMaskedInput
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
            />
            <DatePicker
              label="ถึงวันที่"
              value={lastDateA}
              onChange={handleLastA}
              inputFormat="d MMMM yyyy"
              disableMaskedInput
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
            />

            <Autocomplete
              options={MedErrorTypeAll}
              value={selectedErrorType}
              onChange={handleErrTypeChange}
              getOptionLabel={(option) => (option ? option.error_type_name : '')}
              isOptionEqualToValue={(option, value) => option?.error_type === value?.error_type}
              size="small"
              sx={{ width: 280 }}
              disableClearable
              renderInput={(params) => (
                <TextField {...params} label="ประเภท Error *" placeholder="เลือก 1 ประเภท" />
              )}
            />

            <FormControlLabel
              sx={{ ml: 1 }}
              control={<Switch size="small" checked={compareMode} onChange={handleCompareToggle} />}
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>เปรียบเทียบช่วง B</Typography>}
            />

            {compareMode && (
              <>
                <Typography variant="body2" sx={{ fontWeight: 600, ml: 1, color: 'warning.dark' }}>
                  ช่วง B:
                </Typography>
                <DatePicker
                  label="วันที่"
                  value={firstDateB}
                  onChange={handleFirstB}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
                />
                <DatePicker
                  label="ถึงวันที่"
                  value={lastDateB}
                  onChange={handleLastB}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
                />
              </>
            )}
          </Box>
        </LocalizationProvider>
      </Stack>

      {incompleteRowCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<Iconify icon="eva:alert-triangle-outline" />}>
          มี {incompleteRowCount} รายการที่ยังไม่ได้ระบุ Impact หรือ Likelihood ครบ → คอลัมน์ Level จะแสดง "—". กรุณาไปที่หน้า{' '}
          <b>"ข้อมูลรายละเอียดประเภท Error"</b> เพื่อกำหนดคะแนน
        </Alert>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="column">
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            {errorTypeName || (selectedErrorType?.error_type_name ?? '')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ช่วง A: {periodALabel}
            {isCompareResult && (
              <>
                {' '}| ช่วง B: <b style={{ color: '#ed6c02' }}>{periodBLabel}</b>
              </>
            )}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:file-text-fill" />}
          onClick={handleExportExcel}
          disabled={_.isEmpty(enrichedRows)}
          color={_.isEmpty(enrichedRows) ? 'inherit' : 'primary'}
        >
          Export Excel
        </Button>
      </Stack>

      <Scrollbar>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell rowSpan={2} sx={{ minWidth: 280 }}>
                  รายละเอียด Error
                </StyledTableCell>
                <StyledTableCell colSpan={3} align="center">
                  ช่วง A
                </StyledTableCell>
                {isCompareResult && (
                  <>
                    <StyledTableCell colSpan={3} align="center" sx={{ backgroundColor: '#ed6c02' }}>
                      ช่วง B
                    </StyledTableCell>
                    <StyledTableCell rowSpan={2} align="center">
                      Δ%
                    </StyledTableCell>
                  </>
                )}
                <StyledTableCell rowSpan={2} align="center">
                  Impact
                </StyledTableCell>
                <StyledTableCell rowSpan={2} align="center">
                  Likelihood
                </StyledTableCell>
                <StyledTableCell rowSpan={2} align="center">
                  Level
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell align="center">HAD</StyledTableCell>
                <StyledTableCell align="center">Non-HAD</StyledTableCell>
                <StyledTableCell align="center">รวม</StyledTableCell>
                {isCompareResult && (
                  <>
                    <StyledTableCell align="center" sx={{ backgroundColor: '#ed6c02' }}>HAD</StyledTableCell>
                    <StyledTableCell align="center" sx={{ backgroundColor: '#ed6c02' }}>Non-HAD</StyledTableCell>
                    <StyledTableCell align="center" sx={{ backgroundColor: '#ed6c02' }}>รวม</StyledTableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isCompareResult ? 11 : 7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={22} sx={{ mr: 1 }} />
                    <Typography variant="body2" component="span">กำลังโหลดข้อมูล...</Typography>
                  </TableCell>
                </TableRow>
              ) : _.isEmpty(enrichedRows) ? (
                <TableRow>
                  <TableCell colSpan={isCompareResult ? 11 : 7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      ไม่มีข้อมูล / กรุณาเลือกประเภท Error แล้วเลือกช่วงวันที่
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {enrichedRows.map((r) => (
                    <TableRow key={r.type_id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {r.error_type_list} {r.error_type_list_detail}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{r.hadA || ''}</TableCell>
                      <TableCell align="center">{r.nonHadA || ''}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{r.totalA || ''}</TableCell>
                      {isCompareResult && (
                        <>
                          <TableCell align="center" sx={{ backgroundColor: '#fff8e1' }}>{r.hadB || ''}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: '#fff8e1' }}>{r.nonHadB || ''}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#fff8e1' }}>{r.totalB || ''}</TableCell>
                          <TableCell align="center" sx={deltaCellStyle(r.deltaPct)}>{formatDeltaPct(r.deltaPct)}</TableCell>
                        </>
                      )}
                      <TableCell align="center">{r.impact ?? '—'}</TableCell>
                      <TableCell align="center">{r.likelihood ?? '—'}</TableCell>
                      <TableCell align="center" sx={levelCellStyle(r.level)}>
                        {r.level ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* แถว ผลรวม */}
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>ผลรวม</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{totalsRow.hadA}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{totalsRow.nonHadA}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{totalsRow.totalA}</TableCell>
                    {isCompareResult && (
                      <>
                        <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: '#fff3e0' }}>{totalsRow.hadB}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: '#fff3e0' }}>{totalsRow.nonHadB}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, backgroundColor: '#fff3e0' }}>{totalsRow.totalB}</TableCell>
                        <TableCell align="center" sx={deltaCellStyle(totalsDeltaPct)}>{formatDeltaPct(totalsDeltaPct)}</TableCell>
                      </>
                    )}
                    <TableCell align="center">—</TableCell>
                    <TableCell align="center">—</TableCell>
                    <TableCell align="center">—</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Box>
  );
};

export default ReportSummary9;
