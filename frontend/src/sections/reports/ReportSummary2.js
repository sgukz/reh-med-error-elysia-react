import React, { useEffect, useState, Fragment } from 'react';
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
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import { getReportSummary2, getMedErrorDeptBySection } from '../../libs/MedError';

// import Iconify from '../components/iconify';
import Scrollbar from '../../components/scrollbar';

// Lib Auth
import { verifyToken } from '../../libs/Auth';

// Utils
import { formatDateEN , formatDateRange} from '../../utils/formatTime';

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

const ReportSummary2 = () => {
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
    depCode: [],
  });

  const [dataReport, setDataReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 

  const [departments, setDepartments] = useState([]);
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [selectedDepCode, setSelectedDepCode] = useState([]);
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
      };

      setDateFilter(formatted);
      // console.log(formatted);

      loadReportResult(token, formatted);
    }
  };

  // เมื่อเลือกเปลี่ยนค่าจาก Autocomplete
  const handleChangeAutoComplete = (event, value) => {
    setSelectedDeps(value); // เก็บค่าที่เลือก
    const depCodes = value.map((item) => item.med_error_depcode); // แปลงเป็น array ของ depcode
    setSelectedDepCode(depCodes);
    const formatted = {
      firstDate: formatDateEN(dateFilter.firstDate),
      lastDate: formatDateEN(dateFilter.lastDate),
      depCode: depCodes,
    };
    // console.log('formatted >> ', formatted);

    loadReportResult(token, formatted);
  };

  const fetchDepartments = async (auth_token) => {
    try {
      const result = await getMedErrorDeptBySection(auth_token, 'Y');
      const { statusCode, departmentList } = result.data;
      if (statusCode === 200 && departmentList && !_.isEmpty(departmentList)) {
        setDepartments(departmentList);
      }
    } catch (error) {
      throw new Error('error');
    } finally {
      setLoading(false);
    }
  };

  const loadReportResult = async (auth_token, startAndEndDateOrDepcode) => {
    const GetReportSummary2 = await getReportSummary2(auth_token || token, startAndEndDateOrDepcode);

    const { statusCode, reportList } = GetReportSummary2.data;

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

  useEffect(() => {
    async function checkVerifyToken() {
      const verify = await verifyToken(null);
      const { statusCode, access_token } = verify || {};
      if (statusCode === 200 && access_token) {
        if (access_token) {
          setToken(access_token);
          loadReportResult(access_token, dateFilter);
          fetchDepartments(access_token);
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, [token]);
  return (
    <Box>
      <Stack direction={'column'}>
        <Typography variant="h6">สรุปอุบัติการณ์ความคลาดเคลื่อนหน่วยงานที่พบ</Typography>
      </Stack>
      <Stack spacing={2} direction={'row'} sx={{ mb: 2, py: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
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
            <Box>
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
                renderOption={(props, option, { selected }) => {
                  // eslint-disable-next-line react/prop-types
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      <FormControlLabel
                        control={<Checkbox checked={selected} />}
                        label={<ListItemText primary={option.med_error_depname} />}
                      />
                    </li>
                  );
                }}
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
            </Box>
          </Box>
        </LocalizationProvider>
      </Stack>
      <Box>
        <Stack direction={'column'} sx={{ mb: 2 }}>
          <Typography variant="h6">ตารางสรุปอุบัติการณ์ความคลาดเคลื่อนหน่วยงานที่พบ</Typography>
          <Typography variant="body1" style={{ fontSize: 14 }}>
            {`ข้อมูล${formatDateRange(dateFilter?.firstDate, dateFilter?.lastDate)}`}
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

export default ReportSummary2;
