import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import _ from 'lodash';
// @mui
import { useTheme, styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
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
import Paper from '@mui/material/Paper';

// DataPickerRange
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

// sections
import { AppCurrentVisits, AppWidgetSummary } from '../sections/@dashboard/app';

// Lib Auth
import { verifyToken } from '../libs/Auth';
// Lib MedError
import { getSummaryFromMedError } from '../libs/MedError';

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
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={12}>
              <Box display="flex" alignItems="center" sx={{ pt: 3, pl: 3 }}>
                <Typography variant="h6">จำนวน Medication Error</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3} md={3}>
              <AppWidgetSummary
                title="รายการ"
                total={_.isEmpty(resultDashboard) ? 0 : resultDashboard[0].total}
                icon={'ant-design:fund-filled'}
              />
            </Grid>
            <Grid item xs={12} sm={9} md={9}>
              <AppCurrentVisits
                title={`ข้อมูลวันที่ ${
                  monthAndYearCurrent?.firstDate === monthAndYearCurrent?.lastDate
                    ? formatDateTHString(monthAndYearCurrent?.firstDate)
                    : `${formatDateTHString(monthAndYearCurrent?.firstDate)} - ${formatDateTHString(
                        monthAndYearCurrent?.lastDate
                      )}`
                }`}
                chartData={_.isEmpty(resultDashboard) ? [] : resultDashboard[0].data}
                chartColors={chartColors}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <Card>
              <Box display="flex" alignItems="center" sx={{ p: 3 }}>
                <Stack direction={'column'}>
                  <Typography variant="h6">ตารางจำนวน Medication Error แยกตามความรุนแรง</Typography>
                  <Typography variant="body1" style={{ fontSize: 14 }}>
                    {`ข้อมูลวันที่ ${
                      monthAndYearCurrent?.firstDate === monthAndYearCurrent?.lastDate
                        ? formatDateTHString(monthAndYearCurrent?.firstDate)
                        : `${formatDateTHString(monthAndYearCurrent?.firstDate)} - ${formatDateTHString(
                            monthAndYearCurrent?.lastDate
                          )}`
                    }`}
                  </Typography>
                </Stack>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  {/* Table Header */}
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center" rowSpan={2}>
                        ประเภท
                      </StyledTableCell>
                      {columns.map((col, index) => (
                        <StyledTableCell key={index} align="center" colSpan={col.subColumns.length}>
                          {col.category}
                        </StyledTableCell>
                      ))}
                      <StyledTableCell rowSpan={2}>Total</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      {columns.flatMap((col) =>
                        col.subColumns.map((sub, subIndex) => (
                          <StyledTableCell key={`${col.category}-${subIndex}`} align="center">
                            {sub}
                          </StyledTableCell>
                        ))
                      )}
                    </TableRow>
                  </TableHead>

                  {/* Table Body */}
                  <TableBody>
                    {(rowLabels || []).map((row, rowIndex) => {
                      const label = row;
                      return (
                        <TableRow key={label?.error_level ?? rowIndex} sx={{ border: '1px solid #000' }}>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {label?.error_level}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.prescription_had}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.prescription_nonhad}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {label?.prescription_total}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.processing_had}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.processing_nonhad}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {label?.processing_total}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.dispensing_had}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.dispensing_nonhad}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {label?.dispensing_total}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.preadmin_had}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.preadmin_nonhad}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.preadmin_total}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.admin_had}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: rowIndex === 9 ? 'bold' : 'normal' }}>
                              {label?.admin_nonhad}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              backgroundColor: rowIndex === 9 ? theme.palette.primary.dark : theme.palette.common.white,
                              color: rowIndex === 9 ? theme.palette.common.white : theme.palette.common.dark,
                              border: '1px solid #000',
                            }}
                          >
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {label?.admin_total}
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="center"
                            style={{ backgroundColor: theme.palette.primary.dark, color: theme.palette.common.white }}
                          >
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {label?.total_all}
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
