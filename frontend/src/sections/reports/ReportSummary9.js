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
import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import { getReportSummary9 } from '../../libs/MedError';
import Scrollbar from '../../components/scrollbar';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN } from '../../utils/formatTime';
import { MedErrorTypeAll } from '../../data/DataMedError';

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
  '&:last-child td, &:last-child th': {
    border: 1,
  },
}));

const ReportSummary9 = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const todayDate = dayjs();
  const startOfMonth = todayDate.startOf('month');
  const [firstDate, setFirstDate] = useState(startOfMonth);
  const [lastDate, setLastDate] = useState(todayDate);
  const [token, setToken] = useState(null);
  
  const [selectedErrorType, setSelectedErrorType] = useState('');
  const [selectedErrorTypeCode, setSelectedErrorTypeCode] = useState('');

  const [dateFilter, setDateFilter] = useState({
    firstDate: formatDateEN(dayjs().startOf('month')),
    lastDate: formatDateEN(dayjs()),
    errorType: '',
  });

  const [dataReport, setDataReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstDateChange = (newDate) => {
    setFirstDate(newDate);
    sendRange(newDate, lastDate, selectedErrorTypeCode);
  };

  const handleLastDateChange = (newDate) => {
    setLastDate(newDate);
    sendRange(firstDate, newDate, selectedErrorTypeCode);
  };

  const handleChangeErrorTypeAutoComplete = (event, value) => {
    setSelectedErrorType(value);
    const typeCode = value?.error_type ?? '';
    setSelectedErrorTypeCode(typeCode);
    sendRange(firstDate, lastDate, typeCode);
  };

  const sendRange = (start, end, errType) => {
    if (start && end) {
      const formatted = {
        firstDate: formatDateEN(start),
        lastDate: formatDateEN(end),
        errorType: errType,
      };
      setDateFilter(formatted);
      loadReportResult(token, formatted);
    }
  };

  const loadReportResult = async (auth_token, filters) => {
    const GetReportSummary9 = await getReportSummary9(auth_token || token, filters);
    const { statusCode, reportList } = GetReportSummary9.data;
    setIsLoading(true);
    setTimeout(() => {
      if (statusCode === 200 && !_.isEmpty(reportList)) {
        setDataReport(reportList);
        setIsLoading(false);
      } else {
        setDataReport([]);
        setIsLoading(false);
      }
    }, 1000);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Stack direction={'column'}>
        <Typography variant="h6">รายงานแยกรายละเอียด Error</Typography>
      </Stack>
      <Stack spacing={2} direction={'row'} sx={{ mb: 2, py: 3, flexWrap: 'wrap' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                  onClick={params.inputProps.onClick}
                  readOnly
                  sx={{ width: 220 }}
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
                  onClick={params.inputProps.onClick}
                  readOnly
                  sx={{ width: 220 }}
                />
              )}
            />
            <Autocomplete
              options={MedErrorTypeAll}
              value={selectedErrorType}
              onChange={handleChangeErrorTypeAutoComplete}
              getOptionLabel={(option) => (option ? option.error_type_name : '')}
              isOptionEqualToValue={(option, value) => (value ? option.error_type === value.error_type : false)}
              size="small"
              sx={{ width: 300 }}
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
                />
              )}
            />
          </Box>
        </LocalizationProvider>
      </Stack>
      <Box>
        <Stack direction={'column'} sx={{ mb: 2 }}>
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
                      สถานที่เกิดเหตุการณ์
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
                      Transcribing Error
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      รวม
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={8}>
                      <CircularProgress color="inherit" sx={{ mr: 1 }} />
                      <Typography variant="body1">{'กำลังโหลดข้อมูล...'}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {dataReport.length === 0 && (
                    <TableRow>
                      <TableCell align="center" colSpan={8}>
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
                            {_report.error_ward_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{_report.error_prescription}</TableCell>
                        <TableCell align="center">{_report.error_dispensing}</TableCell>
                        <TableCell align="center">{_report.error_pre_administration}</TableCell>
                        <TableCell align="center">{_report.error_adminstration}</TableCell>
                        <TableCell align="center">{_report.error_processing}</TableCell>
                        <TableCell align="center">{_report.error_transcribing}</TableCell>
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

export default ReportSummary9;
