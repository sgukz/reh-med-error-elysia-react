import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card, CardContent, CardHeader, Grid, Chip, Avatar, Divider } from '@mui/material';
import TextField from '@mui/material/TextField';
import { styled, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

import * as XLSX from 'xlsx';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import { getReportSummary8, getMedErrorDeptBySection } from '../../libs/MedError';

import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';

// Data
import { MedErrorLevel, MedErrorTypeAll } from '../../data/DataMedError';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../../libs/Auth';

// Utils
import { formatDateTime, formatDateEN } from '../../utils/formatTime';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderColor: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 1,
  },
}));

const HAD = {
  N: 'ไม่ใช่ High Alert Drugs',
  Y: 'High Alert Drugs',
};

const ReportSummary8 = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const todayDate = dayjs();
  const startOfMonth = todayDate.startOf('month');
  const [firstDate, setFirstDate] = useState(startOfMonth);
  const [lastDate, setLastDate] = useState(todayDate);
  const [token, setToken] = useState(getTokenFromLocalStorage('access_token'));
  const [dateFilter, setDateFilter] = useState({
    firstDate: formatDateEN(dayjs().startOf('month')),
    lastDate: formatDateEN(dayjs()), // วันนี้
    depCode: [],
    errorType: '',
    errorLevel: [],
    errorAlert: '',
  });

  const [dataReport, setDataReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [selectedDepCode, setSelectedDepCode] = useState([]);
  const [dataErrorLevel, setDataErrorLevel] = useState(MedErrorLevel);
  const [selectedErrorLevel, setSelectedErrorLevel] = useState([]);
  const [selectedErrorLevelCode, setSelectedErrorLevelCode] = useState([]);
  const [dataErrorType, setDataErrorType] = useState(MedErrorTypeAll);
  const [selectedErrorType, setSelectedErrorType] = useState('');
  const [selectedErrorTypeCode, setSelectedErrorTypeCode] = useState('');

  const [selectedErrorAlert, setSelectedErrorAlert] = useState('');

  const [loading, setLoading] = useState(true);

  const handleFirstDateChange = (newDate) => {
    setFirstDate(newDate);
    sendRange(newDate, lastDate);
  };

  const handleLastDateChange = (newDate) => {
    setLastDate(newDate);
    sendRange(firstDate, newDate);
  };

  const sendRange = (start, end) => {
    if (start && end) {
      const formatted = {
        firstDate: formatDateEN(start),
        lastDate: formatDateEN(end),
        depCode: selectedDepCode,
        errorLevel: selectedErrorLevelCode,
        errorType: selectedErrorTypeCode ?? '',
        errorAlert: selectedErrorAlert ?? '',
      };

      setDateFilter(formatted);
      // console.log('sendRange formatted >> ', formatted);

      loadReportResult(token, formatted);
    }
  };

  // เมื่อเลือกเปลี่ยนค่าจาก Autocomplete
  const handleChangeAutoComplete = (event, value) => {
    setSelectedDeps(value); // เก็บค่าที่เลือก
    const depCodes = value.map((item) => item.med_error_depcode);
    // const depNames = value.map((item) => item.med_error_name);
    // console.log(depNames);

    setSelectedDepCode(depCodes);
    const formatted = {
      firstDate: formatDateEN(dateFilter.firstDate),
      lastDate: formatDateEN(dateFilter.lastDate),
      depCode: depCodes,
      errorType: selectedErrorTypeCode ?? '',
      errorLevel: selectedErrorLevelCode,
      errorAlert: selectedErrorAlert ?? '',
    };
    // console.log('handleChangeAutoComplete formatted >> ', formatted);

    loadReportResult(token, formatted);
  };

  // เมื่อเลือกเปลี่ยนค่าจาก Autocomplete Error Level
  const handleChangeErrorLevelAutoComplete = (event, value) => {
    setSelectedErrorLevel(value); // เก็บค่าที่เลือก
    const levelCodes = value.map((item) => item.med_error_level_code); // แปลงเป็น array
    setSelectedErrorLevelCode(levelCodes);
    const formatted = {
      firstDate: formatDateEN(dateFilter.firstDate),
      lastDate: formatDateEN(dateFilter.lastDate),
      depCode: selectedDepCode,
      errorType: selectedErrorTypeCode ?? '',
      errorLevel: levelCodes,
      errorAlert: selectedErrorAlert ?? '',
    };

    // console.log('handleChangeErrorLevelAutoComplete formatted >> ', formatted);

    loadReportResult(token, formatted);
  };

  // เมื่อเลือกเปลี่ยนค่าจาก Autocomplete Error Type
  const handleChangeErrorTypeAutoComplete = (event, value) => {
    setSelectedErrorType(value); // เก็บค่าที่เลือก
    setSelectedErrorTypeCode(value?.error_type);
    const formatted = {
      firstDate: formatDateEN(dateFilter.firstDate),
      lastDate: formatDateEN(dateFilter.lastDate),
      depCode: selectedDepCode,
      errorType: value?.error_type ?? '',
      errorLevel: selectedErrorLevelCode,
      errorAlert: selectedErrorAlert ?? '',
    };

    // console.log('handleChangeErrorTypeAutoComplete formatted >> ', formatted);

    loadReportResult(token, formatted);
  };

  const handleChangeErrorAlert = (event) => {
    const { value } = event.target;
    setSelectedErrorAlert(value);
    const formatted = {
      firstDate: formatDateEN(dateFilter.firstDate),
      lastDate: formatDateEN(dateFilter.lastDate),
      depCode: selectedDepCode,
      errorType: value?.error_type ?? '',
      errorLevel: selectedErrorLevelCode,
      errorAlert: value ?? '',
    };

    // console.log('handleChangeErrorTypeAutoComplete formatted >> ', formatted);

    loadReportResult(token, formatted);
  };

  const handleExportExcel = () => {
    if (!dataReport || dataReport.length === 0) {
      return;
    }

    // เตรียมข้อมูลให้เป็นรูปแบบที่อ่านง่ายใน Excel
    const dataForExcel = dataReport.map((row, index) => ({
    'ลำดับ': index + 1,
    'เวลาที่บันทึก': formatDateTime(row.med_error_datetime, 5),
    'วัน/เดือน/ปี ที่พบเหตุการณ์': formatDateTime(row.med_error_date, 1),
    'เวลาที่เกิดเหตุการณ์': row.error_time,
    'สถานที่เกิดเหตุการณ์': row.error_ward_name,
    'หน่วยงานที่เกี่ยวข้อง': row.involved_ward_name,
    'เหตุการณ์ที่พบ': row.error_event,
    'ระดับความรุนแรง': row.error_level,
    'การแก้ไขปัญหาเบื้องต้น': row.error_clear,
    'วิเคราะห์สาเหตุ': row.error_analysis,
    'ประเภท Error': row.error_type_name,
    'รายละเอียด Error': row.error_type_detail,
    'ความคลาดเคลื่อน': row.error_alert,
  }));

    // สร้าง worksheet และ workbook
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReportSummary8');

    // ตั้งชื่อไฟล์ เช่น แนบช่วงวันที่เข้าไป
    const fileName = `report-summary8-${dateFilter.firstDate}-${dateFilter.lastDate}.xlsx`;

    // สั่งให้ Browser ดาวน์โหลดไฟล์
    XLSX.writeFile(workbook, fileName);
  };

  const fetchDepartments = async (auth_token) => {
    try {
      const result = await getMedErrorDeptBySection(auth_token, 'Y');
      const { statusCode, departmentList } = result.data;
      if (statusCode === 200 && departmentList && !_.isEmpty(departmentList)) {
        setDepartments(departmentList);
      }
    } catch (error) {
      // console.error('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const loadReportResult = async (auth_token, startAndEndDateOrDepcode) => {
    const GetReportSummary8 = await getReportSummary8(auth_token || token, startAndEndDateOrDepcode);

    const { statusCode, reportList } = GetReportSummary8.data;
    // console.log(statusCode, reportList);

    setIsLoading(true);
    setTimeout(() => {
      if (statusCode === 200 && !_.isEmpty(reportList)) {
        setDataReport(reportList);
        setIsLoading(false);
      } else {
        setDataReport([]);
        setIsLoading(false);
      }
    }, 1500);
  };

  // const handleOnOpenCollapse = (index, deptCode) => {
  //   setIsLoading2(true);
  //   setOpen(open === index ? null : index);
  //   const formatted = {
  //     firstDate: formatDateEN(dateFilter.firstDate),
  //     lastDate: formatDateEN(dateFilter.lastDate),
  //     depCode: deptCode,
  //   };
  //   loadReport2Result(token, formatted);
  // };

  // const StyledTableCell2 = styled(TableCell)(({ theme, idx }) => ({
  //   [`&.${tableCellClasses.body}`]: {
  //     backgroundColor: open === idx ? theme.palette.primary.main : theme.palette.common.white,
  //     color: open === idx ? theme.palette.common.white : theme.palette.common.black,
  //     borderColor: open === idx && theme.palette.common.white,
  //     fontWeight: open === idx && 600,
  //   },
  // }));

  useEffect(() => {
    async function checkVerifyToken() {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, access_token } = verify;
      if (statusCode === 200 && access_token) {
        if (access_token) {
          setToken(access_token);
          fetchDepartments(access_token);
          loadReportResult(access_token, dateFilter);
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    setDataErrorLevel(MedErrorLevel);
    setDataErrorType(MedErrorTypeAll);
  }, [token]);
  return (
    <Box>
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:funnel-fill" width={24} color="primary.main" />
              <Typography variant="h6">ตัวกรองข้อมูล (Filter Data)</Typography>
            </Stack>
          }
        />
        <Divider sx={{ borderStyle: 'dashed', py: 0.5 }} />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
            <Grid container spacing={2}>
              {/* Row 1: Date Range */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={firstDate}
                  onChange={handleFirstDateChange}
                  inputFormat="d MMMM yyyy"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      onClick={params.inputProps.onClick}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: true,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="ถึงวันที่"
                  value={lastDate}
                  onChange={handleLastDateChange}
                  inputFormat="d MMMM yyyy"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      onClick={params.inputProps.onClick}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: true,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Row 2: Department & Error Type */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={departments}
                  value={selectedDeps}
                  onChange={handleChangeAutoComplete}
                  getOptionLabel={(option) => option.med_error_depname}
                  isOptionEqualToValue={(option, value) => option.med_error_depcode === value.med_error_depcode}
                  loading={loading}
                  size="small"
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <FormControlLabel
                        control={<Checkbox checked={selected} />}
                        label={<ListItemText primary={option.med_error_depname} />}
                      />
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="เลือกหน่วยงาน"
                      placeholder="ค้นหา / เลือกได้หลายรายการ"
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
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={dataErrorType}
                  value={selectedErrorType}
                  onChange={handleChangeErrorTypeAutoComplete}
                  getOptionLabel={(option) => (option ? option.error_type_name : '')}
                  isOptionEqualToValue={(option, value) => (value ? option.error_type === value.error_type : false)}
                  loading={loading}
                  size="small"
                  renderOption={(props, option) => (
                    <li {...props}>
                      <ListItemText primary={option.error_type_name} />
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="เลือกประเภท Error"
                      placeholder="ค้นหา / เลือกหนึ่งรายการ"
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

              {/* Row 3: Error Level & Risk */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={dataErrorLevel}
                  value={selectedErrorLevel}
                  onChange={handleChangeErrorLevelAutoComplete}
                  getOptionLabel={(option) => option.med_error_level_code}
                  isOptionEqualToValue={(option, value) => option.med_error_level_code === value.med_error_level_code}
                  loading={loading}
                  size="small"
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <FormControlLabel
                        control={<Checkbox checked={selected} />}
                        label={<ListItemText primary={option.med_error_level_code} />}
                      />
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="เลือกระดับความรุนแรง"
                      placeholder="ค้นหา / เลือกได้หลายรายการ"
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="error-alert-label">เลือกความเสี่ยง</InputLabel>
                  <Select
                    labelId="error-alert-label"
                    id="error-alert"
                    value={selectedErrorAlert}
                    label="เลือกความเสี่ยง"
                    onChange={handleChangeErrorAlert}
                  >
                    <MenuItem value="ALL">ทั้งหมด</MenuItem>
                    <MenuItem value="Y" sx={{ color: 'error.main', fontWeight: 600 }}>
                      High Alert Drugs
                    </MenuItem>
                    <MenuItem value="N">ไม่ใช่ High Alert Drugs</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>

      <Box>
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Iconify icon="eva:file-text-fill" width={20} />
                </Avatar>
                <Typography variant="h6">
                  {`รายงานความคลาดเคลื่อน (${selectedErrorType !== '' ? selectedErrorType?.error_type_name : 'ทั้งหมด'})`}
                </Typography>
              </Stack>
            }
            action={
              <Button
                sx={{ bgcolor: '#008000', color: 'common.white' }}
                variant="contained"
                onClick={handleExportExcel}
                disabled={dataReport.length === 0 || isLoading}
                startIcon={<Iconify icon="eva:download-fill" />}
              >
                Export Excel
              </Button>
            }
          />
          <Divider sx={{ borderStyle: 'dashed', py: 1 }} />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="eva:calendar-fill" width={20} color="text.secondary" />
                  <Typography variant="body2" color="text.secondary">
                    ช่วงเวลา:
                  </Typography>
                  <Typography variant="subtitle2">
                    {dateFilter?.firstDate === dateFilter?.lastDate
                      ? formatDateTime(dateFilter?.firstDate)
                      : `${formatDateTime(dateFilter?.firstDate)} - ${formatDateTime(dateFilter?.lastDate)}`}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Iconify icon="eva:home-fill" width={20} color="text.secondary" sx={{ mt: 0.5 }} />
                  <Stack>
                    <Typography variant="body2" color="text.secondary">
                      หน่วยงาน:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedDeps.length > 0 ? (
                        selectedDeps.map((item) => (
                          <Chip key={item.med_error_depcode} label={item.med_error_depname} size="small" variant="outlined" />
                        ))
                      ) : (
                        <Chip label="ทั้งหมด" size="small" color="default" />
                      )}
                    </Box>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={2}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Iconify icon="eva:alert-triangle-fill" width={20} color="text.secondary" sx={{ mt: 0.5 }} />
                  <Stack>
                    <Typography variant="body2" color="text.secondary">
                      ระดับ:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedErrorLevelCode.length > 0 ? (
                        selectedErrorLevelCode.map((item) => (
                          <Chip key={item} label={item} size="small" color="error" variant="outlined" />
                        ))
                      ) : (
                        <Chip label="ทั้งหมด" size="small" />
                      )}
                    </Box>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={2}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Iconify icon="eva:shield-fill" width={20} color="text.secondary" sx={{ mt: 0.5 }} />
                  <Stack>
                    <Typography variant="body2" color="text.secondary">
                      ความเสี่ยง (HAD):
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                      {(selectedErrorAlert !== '' || selectedErrorAlert !== 'ALL') &&
                      (selectedErrorAlert === 'N' || selectedErrorAlert === 'Y') ? (
                        <Chip
                          label={HAD[selectedErrorAlert]}
                          size="small"
                          color={selectedErrorAlert === 'Y' ? 'error' : 'success'}
                        />
                      ) : (
                        <Chip label="ทั้งหมด" size="small" />
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Scrollbar>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      เวลาที่บันทึก
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      วัน/เดือน/ปี ที่พบเหตุการณ์
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      เวลาที่เกิดเหตุการณ์
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      สถานที่เกิดเหตุการณ์
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      หน่วยงานที่เกี่ยวข้อง
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      เหตุการณ์ที่พบ
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ระดับความรุนแรง
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      การแก้ไขปัญหาเบื้องต้น
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      วิเคราะห์สาเหตุ
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ประเภท Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      รายละเอียด Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ความคลาดเคลื่อน
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={12}>
                      <CircularProgress color="inherit" sx={{ mr: 1 }} />
                      <Typography variant="body1">{'กำลังโหลดข้อมูล...'}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {dataReport.length === 0 && (
                    <TableRow>

                      <TableCell align="center" colSpan={12}>
                        <Typography variant="body1" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                          {'ไม่มีข้อมูล'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {dataReport.length > 0 &&
                    dataReport.map((_report, index) => (
                      <StyledTableRow key={index}>
                        <TableCell align="center">{formatDateTime(_report.med_error_datetime, 5)}</TableCell>
                        <TableCell align="center">{formatDateTime(_report.med_error_date, 1)}</TableCell>
                        <TableCell align="center">{_report.error_time}</TableCell>
                        <TableCell align="left">{_report.error_ward_name}</TableCell>
                        <TableCell align="left">{_report.involved_ward_name}</TableCell>
                        <TableCell align="left">{_report.error_event}</TableCell>
                        <TableCell align="center">{_report.error_level}</TableCell>
                        <TableCell align="left">{_report.error_clear}</TableCell>
                        <TableCell align="center">{_report.error_analysis}</TableCell>
                        <TableCell align="center">{_report.error_type_name}</TableCell>
                        <TableCell align="left">{_report.error_type_detail}</TableCell>
                        <TableCell align="center">{_report.error_alert}</TableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default ReportSummary8;
