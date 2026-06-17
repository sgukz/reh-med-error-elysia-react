import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import _ from 'lodash';
// @mui
import { useTheme, styled, alpha } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


// DataPickerRange
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';


// sections
import { AppCurrentVisits, AppWidgetSummary } from '../sections/@dashboard/app';

// Lib Auth
import { verifyToken } from '../libs/Auth';
// Lib MedError
import { getSummaryFromMedError } from '../libs/MedError';
import { formatDateRange } from '../utils/formatTime';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    border: '1px solid #FFF',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    border: '1px solid #FFF',
  },
}));

function getFirstAndLastDateOfMonthShort(dateString) {
  const date = new Date(dateString);
  const today = new Date();

  // วันที่แรกของเดือนจาก dateString
  const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);

  const formatShortDate = (d) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return {
    firstDate: formatShortDate(firstDate),
    lastDate: formatShortDate(today),
  };
}

function getCurrentDateShort() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  const formatDate = new Date(date);
  const toTwoDigits = (num) => (num < 10 ? `0${num}` : num);
  return `${formatDate.getFullYear()}-${toTwoDigits(formatDate.getMonth() + 1)}-${toTwoDigits(formatDate.getDate())}`;
}

const monthObj = [
  { labelMonth: 'มกราคม', firstDate: '01-01' },
  { labelMonth: 'กุมภาพันธ์', firstDate: '02-01' },
  { labelMonth: 'มีนาคม', firstDate: '03-01' },
  { labelMonth: 'เมษายน', firstDate: '04-01' },
  { labelMonth: 'พฤษภาคม', firstDate: '05-01' },
  { labelMonth: 'มิถุนายน', firstDate: '06-01' },
  { labelMonth: 'กรกฎาคม', firstDate: '07-01' },
  { labelMonth: 'สิงหาคม', firstDate: '08-01' },
  { labelMonth: 'กันยายน', firstDate: '09-01' },
  { labelMonth: 'ตุลาคม', firstDate: '10-01' },
  { labelMonth: 'พฤศจิกายน', firstDate: '11-01' },
  { labelMonth: 'ธันวาคม', firstDate: '12-01' },
];


// สีระดับความรุนแรง
const SEVERITY_COLORS = {
  A: { bg: 'rgba(148, 163, 184, 0.06)', chipSx: { bgcolor: '#94a3b8', color: '#fff' } },
  B: { bg: 'rgba(34, 197, 94, 0.06)', chipSx: { bgcolor: '#22c55e', color: '#fff' } },
  C: { bg: 'rgba(16, 185, 129, 0.06)', chipSx: { bgcolor: '#10b981', color: '#fff' } },
  D: { bg: 'rgba(6, 182, 212, 0.06)', chipSx: { bgcolor: '#06b6d4', color: '#fff' } },
  E: { bg: 'rgba(245, 158, 11, 0.10)', chipSx: { bgcolor: '#f59e0b', color: '#fff' } },
  F: { bg: 'rgba(234, 88, 12, 0.10)', chipSx: { bgcolor: '#ea580c', color: '#fff' } },
  G: { bg: 'rgba(239, 68, 68, 0.08)', chipSx: { bgcolor: '#ef4444', color: '#fff' } },
  H: { bg: 'rgba(220, 38, 38, 0.10)', chipSx: { bgcolor: '#dc2626', color: '#fff' } },
  I: { bg: 'rgba(127, 29, 29, 0.14)', chipSx: { bgcolor: '#7f1d1d', color: '#fff' } },
};

const columns = [
  {
    category: 'Prescription error',
    subColumns: ['HAD', 'Non-HAD', 'Total'],
  },
  {
    category: 'Processing error',
    subColumns: ['HAD', 'Non-HAD', 'Total'],
  },
  {
    category: 'Dispensing error',
    subColumns: ['HAD', 'Non-HAD', 'Total'],
  },
  {
    category: 'Pre-administration error',
    subColumns: ['HAD', 'Non-HAD', 'Total'],
  },
  {
    category: 'Administration error',
    subColumns: ['HAD', 'Non-HAD', 'Total'],
  },
];

export default function DashboardAppPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const theme = useTheme();
  const today = new Date();

  // เดือน / ปีปัจจุบัน
  const currentMonth = today.getMonth(); // 0 - 11
  const currentYear = today.getFullYear();

  const monthSelected = monthObj[currentMonth]?.firstDate;
  const [selectedYear, setSelectedYear] = useState(currentYear + 543);

  // helper เดิมของคุณยังใช้ได้
  const [monthAndYearCurrent, setMonthAndYearCurrent] = useState(
    getFirstAndLastDateOfMonthShort(getCurrentDateShort())
  );

  const [fiscalYear, setFiscalYear] = useState([String(currentYear + 543)]);
  const [resultDashboard, setResultDashBoard] = useState([]);
  const [rowLabels, setRowLabels] = useState([]);

  // ✅ ใช้ Date ตรง ๆ ไม่ต้อง dayjs ตรงนี้
  const [firstDate, setFirstDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1) // วันที่ 1 ของเดือนนี้
  );
  const [lastDate, setLastDate] = useState(today);

  const stats = useMemo(() => {
    let totalErrors = 0;
    let totalHad = 0;
    let totalSevere = 0;

    (rowLabels || []).forEach(row => {
      if (row.error_level !== 'Total') {
        const rowTotal = Number(row.total_all || 0);
        totalErrors += rowTotal;

        totalHad += Number(row.prescription_had || 0) + 
                    Number(row.processing_had || 0) + 
                    Number(row.dispensing_had || 0) + 
                    Number(row.preadmin_had || 0) + 
                    Number(row.admin_had || 0);

        if (['E', 'F', 'G', 'H', 'I'].includes(row.error_level)) {
          totalSevere += rowTotal;
        }
      }
    });

    return { totalErrors, totalHad, totalSevere };
  }, [rowLabels]);


  const loadDashboardResult = useCallback(async (auth_token, monthAndYear) => {
    try {
      const GetSummaryFromMedError = await getSummaryFromMedError(auth_token, monthAndYear);
      const { statusCode, fiscalYearList, summaryList, summaryErrorTypeList } = GetSummaryFromMedError.data || {};

      if (statusCode === 200) {
        setFiscalYear(Array.isArray(fiscalYearList) && fiscalYearList.length > 0 ? fiscalYearList : []);
        setResultDashBoard(Array.isArray(summaryList) ? summaryList : []);
        setRowLabels(Array.isArray(summaryErrorTypeList) ? summaryErrorTypeList : []);
      } else {
        setFiscalYear([]);
        setResultDashBoard([]);
        setRowLabels([]);
      }
    } catch (error) {
      setFiscalYear([]);
      setResultDashBoard([]);
      setRowLabels([]);
    }
  }, []);

  const sendRange = useCallback(
    (start, end) => {
      if (!start || !end || !token) return;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const safeStart = startDate > endDate ? endDate : startDate;
      const formatted = {
        firstDate: formatDate(safeStart),
        lastDate: formatDate(endDate),
      };
      setMonthAndYearCurrent(formatted);
      loadDashboardResult(token, formatted);
    },
    [token, loadDashboardResult]
  );

  const handleFirstDateChange = useCallback(
    (newDate) => {
      if (!newDate) return;
      setFirstDate(newDate);
      sendRange(newDate, lastDate);
    },
    [lastDate, sendRange]
  );

  const handleLastDateChange = useCallback(
    (newDate) => {
      if (!newDate) return;
      setLastDate(newDate);
      sendRange(firstDate, newDate);
    },
    [firstDate, sendRange]
  );

  const handleYearChange = useCallback(
    (event) => {
      const { value } = event.target;
      const currentDateChanged = `${Number(value) - 543}-${monthSelected}`;
      setSelectedYear(value);
      const monthAndYearCurrentResult = getFirstAndLastDateOfMonthShort(currentDateChanged);
      setMonthAndYearCurrent(monthAndYearCurrentResult);
      loadDashboardResult(token, monthAndYearCurrentResult);
    },
    [monthSelected, token, loadDashboardResult]
  );

  const chartColors = useMemo(
    () => [
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ],
    [theme]
  );

  useEffect(() => {
    let cancelled = false;
    async function checkVerifyToken() {
      try {
        const verify = await verifyToken(null);
        if (cancelled || !verify) return;
        const { statusCode, access_token } = verify || {};
        if (statusCode === 200 && access_token) {
          setToken(access_token);
          loadDashboardResult(access_token, monthAndYearCurrent);
        } else {
          navigate('/login', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      className="guk-bg-mesh-teal-soft"
      sx={{
        position: 'relative',
        minHeight: '100%',
        mx: { xs: -2, lg: -2 },
        px: { xs: 2, lg: 2 },
        pt: 3,
        pb: 6,
        fontFamily: '"Prompt", sans-serif',
      }}
    >
      <Helmet>
        <title> Dashboard | Medication error </title>
      </Helmet>

      {/* Decorative blobs (โทน teal) */}
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box className="guk-blob guk-blob-teal-1 guk-anim-blob" sx={{ opacity: 0.55 }} />
        <Box className="guk-blob guk-blob-teal-2 guk-anim-blob" sx={{ opacity: 0.5 }} />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header card (glass) */}
        <Box
          className="guk-glass guk-anim-fade-up"
          sx={{
            mb: 3,
            borderRadius: '20px',
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Stack spacing={2} direction={'row'} alignItems="center" flexWrap="wrap">
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
                <Box component="span" sx={{ fontSize: 22 }}>📊</Box>
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  className="guk-gradient-text-teal"
                  sx={{
                    fontFamily: '"Prompt", sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  Executive Summary
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Prompt", sans-serif',
                    fontSize: 12,
                    color: '#475569',
                    mt: 0.25,
                  }}
                >
                  ภาพรวมรายงานความคลาดเคลื่อนทางยา · โรงพยาบาลร้อยเอ็ด
                </Typography>
              </Box>
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <DatePicker
                    label="เริ่มต้น"
                    value={firstDate}
                    onChange={handleFirstDateChange}
                    inputFormat="d MMMM yyyy" disableMaskedInput
                    renderInput={(params) => (
                      <TextField {...params} size="small" fullWidth onClick={params.inputProps.onClick} readOnly />
                    )}
                  />
                  <DatePicker
                    label="สิ้นสุด"
                    value={lastDate}
                    onChange={handleLastDateChange}
                    inputFormat="d MMMM yyyy" disableMaskedInput
                    renderInput={(params) => (
                      <TextField {...params} size="small" fullWidth onClick={params.inputProps.onClick} readOnly />
                    )}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small">
                <InputLabel id="year-select-label">ปีงบประมาณ</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={selectedYear}
                  label="ปีงบประมาณ"
                  onChange={handleYearChange}
                  sx={{ minWidth: 120 }}
                >
                  {fiscalYear.map((_year) => (
                    <MenuItem key={_year} value={_year}>
                      {_year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Box>
        
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={12}>
              <Box display="flex" alignItems="center" sx={{ pt: 3, pl: 3 }}>
                <Typography variant="h6">ภาพรวมอุบัติการณ์ความคลาดเคลื่อนทางยา (Executive Summary)</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4} md={4}>
              <AppWidgetSummary
                title="อุบัติการณ์ทั้งหมด (รายการ)"
                total={stats.totalErrors}
                icon={'ant-design:fund-filled'}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <AppWidgetSummary
                title="กลุ่มยา High Alert Drugs (รายการ)"
                total={stats.totalHad}
                icon={'ant-design:alert-filled'}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <AppWidgetSummary
                title="ความรุนแรงระดับ E-I (รายการ)"
                total={stats.totalSevere}
                icon={'ant-design:warning-filled'}
                color="error"
              />
            </Grid>
            
            <Grid item xs={12} sm={12} md={12}>
              <AppCurrentVisits
                title={`สัดส่วนประเภทความคลาดเคลื่อน ${formatDateRange(monthAndYearCurrent?.firstDate, monthAndYearCurrent?.lastDate)}`}
                chartData={_.isEmpty(resultDashboard) ? [] : resultDashboard[0].data}
                chartColors={chartColors}
              />
            </Grid>
          

          <Grid item xs={12} md={12} lg={12}>
            <Card>
              <Box display="flex" alignItems="center" sx={{ p: 3 }}>
                <Stack direction={'column'}>
                  <Typography variant="h6">ตารางจำนวน Medication Error แยกตามความรุนแรง</Typography>
                  <Typography variant="body1" style={{ fontSize: 14 }}>
  {`ข้อมูล${formatDateRange(monthAndYearCurrent?.firstDate, monthAndYearCurrent?.lastDate)}`}
</Typography>
                </Stack>
              </Box>
              <TableContainer sx={{ 
                bgcolor: 'background.paper', 
                boxShadow: (theme) => theme.customShadows.z8,
                borderRadius: 2,
                overflow: 'hidden',
                border: (theme) => `1px solid ${theme.palette.divider}`
              }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
                      <StyledTableCell align="center" rowSpan={2} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                        Level
                      </StyledTableCell>
                      {columns.map((col, index) => (
                        <StyledTableCell key={index} align="center" colSpan={col.subColumns.length} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                          {col.category}
                        </StyledTableCell>
                      ))}
                      <StyledTableCell rowSpan={2} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.8), color: '#fff !important' }}>Total</StyledTableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                      {columns.flatMap((col) =>
                        col.subColumns.map((sub, subIndex) => (
                          <StyledTableCell key={`${col.category}-${subIndex}`} align="center" sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, borderRight: subIndex === col.subColumns.length - 1 ? (theme) => `1px solid ${theme.palette.divider}` : 'none' }}>
                            {sub}
                          </StyledTableCell>
                        ))
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowLabels || []).map((row, rowIndex) => {
                      const isTotalRow = rowIndex === 9 || row?.error_level === 'Total';
                      const sev = SEVERITY_COLORS[row?.error_level] || null;
                      
                      const cellStyle = {
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        py: 1.5,
                      };
                      
                      const borderRightStyle = {
                        ...cellStyle,
                        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                      };

                      const rowBg = isTotalRow ? (theme) => theme.palette.primary.dark : (sev ? sev.bg : 'transparent');
                      const textColor = isTotalRow ? '#fff' : 'text.primary';

                      return (
                        <TableRow 
                          hover={!isTotalRow}
                          key={row?.error_level ?? rowIndex} 
                          sx={{ 
                            bgcolor: rowBg,
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <TableCell align="center" sx={{ ...borderRightStyle, color: textColor }}>
                            {isTotalRow ? (
                              <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                            ) : (
                              <Chip label={row?.error_level} size="small" sx={{ fontWeight: 700, borderRadius: '8px', minWidth: 32, ...(sev?.chipSx || {}) }} />
                            )}
                          </TableCell>
                          
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.prescription_had}</TableCell>
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.prescription_nonhad}</TableCell>
                          <TableCell align="center" sx={{ ...borderRightStyle, color: textColor, fontWeight: 'bold' }}>{row?.prescription_total}</TableCell>
                          
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.processing_had}</TableCell>
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.processing_nonhad}</TableCell>
                          <TableCell align="center" sx={{ ...borderRightStyle, color: textColor, fontWeight: 'bold' }}>{row?.processing_total}</TableCell>
                          
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.dispensing_had}</TableCell>
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.dispensing_nonhad}</TableCell>
                          <TableCell align="center" sx={{ ...borderRightStyle, color: textColor, fontWeight: 'bold' }}>{row?.dispensing_total}</TableCell>
                          
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.preadmin_had}</TableCell>
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.preadmin_nonhad}</TableCell>
                          <TableCell align="center" sx={{ ...borderRightStyle, color: textColor, fontWeight: 'bold' }}>{row?.preadmin_total}</TableCell>
                          
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.admin_had}</TableCell>
                          <TableCell align="center" sx={{ ...cellStyle, color: textColor, fontWeight: isTotalRow ? 'bold' : 'normal' }}>{row?.admin_nonhad}</TableCell>
                          <TableCell align="center" sx={{ ...borderRightStyle, color: textColor, fontWeight: 'bold' }}>{row?.admin_total}</TableCell>

                          <TableCell align="center" sx={{ ...cellStyle, bgcolor: isTotalRow ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.1), color: textColor }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {row?.total_all}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
