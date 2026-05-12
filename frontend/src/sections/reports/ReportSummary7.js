import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import { getReportSummary7 } from '../../libs/MedError';

// import Iconify from '../components/iconify';
import Scrollbar from '../../components/scrollbar';

// Lib Auth
import { verifyToken } from '../../libs/Auth';

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

const ReportSummary7 = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const todayDate = dayjs();
  const startOfMonth = todayDate.startOf('month');
  const [firstDate, setFirstDate] = useState(startOfMonth);
  const [lastDate, setLastDate] = useState(todayDate);
  const [token, setToken] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    firstDate: formatDateEN(dayjs().startOf('month')),
    lastDate: formatDateEN(dayjs()), // วันนี้
  });

  const [dataReport, setDataReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      };

      setDateFilter(formatted);
      loadReportResult(token, formatted);
    }
  };

  const loadReportResult = async (auth_token, startAndEndDateOrDepcode) => {
    const GetReportSummary7 = await getReportSummary7(auth_token || token, startAndEndDateOrDepcode);
    
    const { statusCode, reportList } = GetReportSummary7.data;
    setIsLoading(true);
    setTimeout(() => {
      if (statusCode === 200 && !_.isEmpty(reportList)) {
        setDataReport(reportList);
        setIsLoading(false);
      }
    }, 1500);
  };

  useEffect(() => {
    async function checkVerifyToken() {
      const verify = await verifyToken(null);
      const { statusCode, access_token } = verify || {};
      if (statusCode === 200 && access_token) {
        if (access_token) {
          setToken(access_token);
          loadReportResult(access_token, dateFilter);
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, []);
  return (
    <Box>
      <Stack direction={'column'}>
        <Typography variant="h6">แยกการรายงานอุบัติการณ์ตามผู้รายงาน</Typography>
      </Stack>
      <Stack spacing={2} direction={'row'} sx={{ mb: 2, py: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <DatePicker
                label="วันที่"
                value={firstDate}
                onChange={handleFirstDateChange}
                inputFormat="d MMMM yyyy"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    value={firstDate}
                    size="small"
                    fullWidth
                    onClick={params.inputProps.onClick}
                    readOnly
                  />
                )}
              />
              <DatePicker
                label="ถึงวันที่"
                value={lastDate}
                onChange={handleLastDateChange}
                inputFormat="d MMMM yyyy"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    value={lastDate}
                    size="small"
                    fullWidth
                    onClick={params.inputProps.onClick}
                    readOnly
                  />
                )}
              />
            </Box>
          </Box>
        </LocalizationProvider>
      </Stack>
      <Box>
        <Stack direction={'column'} sx={{ mb: 2 }}>
          <Typography variant="h6">แยกการรายงานอุบัติการณ์ตามผู้รายงาน</Typography>
          <Typography variant="body1" style={{ fontSize: 14 }}>
            {`ข้อมูลวันที่ ${
              dateFilter?.firstDate === dateFilter?.lastDate
                ? formatDateTime(dateFilter?.firstDate)
                : `${formatDateTime(dateFilter?.firstDate)} - ${formatDateTime(dateFilter?.lastDate)}`
            }`}
          </Typography>
        </Stack>
        <Scrollbar>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ชื่อ - สกุล
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Prescription Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Dispensing Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Pre-Adminstration Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Adminstration Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Processing Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      รวมทั้งหมด
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={6}>
                      <CircularProgress color="inherit" sx={{ mr: 1 }} />
                      <Typography variant="body1">{'กำลังโหลดข้อมูล...'}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {dataReport.length === 0 && (
                    <TableRow>
                      <TableCell align="center" colSpan={22}>
                        <Typography variant="body1" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                          {'ไม่มีข้อมูล'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {dataReport.length > 0 &&
                    dataReport.map((_report, index) => (
                      <StyledTableRow key={index}>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {_report.error_user_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{_report.error_prescription}</TableCell>
                        <TableCell align="center">{_report.error_dispensing}</TableCell>
                        <TableCell align="center">{_report.error_pre_administration}</TableCell>
                        <TableCell align="center">{_report.error_adminstration}</TableCell>
                        <TableCell align="center">{_report.error_processing}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {_report.total}
                          </Typography>
                        </TableCell>
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

export default ReportSummary7;
