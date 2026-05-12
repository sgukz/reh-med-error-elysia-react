import React, { useEffect, useState, Fragment } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
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

import { getReportSummary5 } from '../../libs/MedError';

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

const severityLevels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const ReportSummary5 = () => {
  const navigate = useNavigate();

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
    const GetReportSummary1 = await getReportSummary5(auth_token || token, startAndEndDateOrDepcode);

    const { statusCode, reportList } = GetReportSummary1.data;
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
        <Typography variant="h6">สรุปอุบัติการณ์ความคลาดเคลื่อน</Typography>
      </Stack>
      <Stack spacing={2} direction={'row'} sx={{ mb: 2, py: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <DatePicker
                label="วันที่"
                value={firstDate}
                onChange={handleFirstDateChange}
                inputFormat="d MMMM yyyy" disableMaskedInput
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
                inputFormat="d MMMM yyyy" disableMaskedInput
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
          <Typography variant="h6">ตารางสรุปอุบัติการณ์ความคลาดเคลื่อนแยก OPD - IPD - ผลิต - คลัง</Typography>
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
                  <StyledTableCell rowSpan={4} align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      อุบัติการณ์
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell colSpan={3} align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      จำนวน
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell colSpan={18} align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ระดับความรุนแรง
                    </Typography>
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell rowSpan={3} align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                      HAD
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell rowSpan={3} align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                      ทั่วไป
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell rowSpan={3} align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                      รวม
                    </Typography>
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  {severityLevels.map((level) => (
                    <Fragment key={level}>
                      <StyledTableCell align="center" colSpan={2}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 14 }}>
                          {level}
                        </Typography>
                      </StyledTableCell>
                    </Fragment>
                  ))}
                </TableRow>
                <TableRow>
                  {severityLevels.map((level) => (
                    <Fragment key={level}>
                      <StyledTableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                          HAD
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                          ทั่วไป
                        </Typography>
                      </StyledTableCell>
                    </Fragment>
                  ))}
                </TableRow>
              </TableHead>
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={22}>
                      <CircularProgress color="inherit" sx={{ mr: 1 }} />
                      <Typography variant="body1">{'กำลังโหลดข้อมูล...'}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {dataReport.map((_report, index) => (
                    <StyledTableRow key={index}>
                      <TableCell>{_report.error_type_name}</TableCell>
                      <TableCell align="center">{_report.had_total}</TableCell>
                      <TableCell align="center">{_report.non_had_total}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {_report.total}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{_report.had_a}</TableCell>
                      <TableCell align="center">{_report.non_had_a}</TableCell>
                      <TableCell align="center">{_report.had_b}</TableCell>
                      <TableCell align="center">{_report.non_had_b}</TableCell>
                      <TableCell align="center">{_report.had_c}</TableCell>
                      <TableCell align="center">{_report.non_had_c}</TableCell>
                      <TableCell align="center">{_report.had_d}</TableCell>
                      <TableCell align="center">{_report.non_had_d}</TableCell>
                      <TableCell align="center">{_report.had_e}</TableCell>
                      <TableCell align="center">{_report.non_had_e}</TableCell>
                      <TableCell align="center">{_report.had_f}</TableCell>
                      <TableCell align="center">{_report.non_had_f}</TableCell>
                      <TableCell align="center">{_report.had_g}</TableCell>
                      <TableCell align="center">{_report.non_had_g}</TableCell>
                      <TableCell align="center">{_report.had_h}</TableCell>
                      <TableCell align="center">{_report.non_had_h}</TableCell>
                      <TableCell align="center">{_report.had_i}</TableCell>
                      <TableCell align="center">{_report.non_had_i}</TableCell>
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

export default ReportSummary5;
