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
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import { getReportSummary2, getReportSummary3, getMedErrorDeptBySection } from '../../libs/MedError';

import Iconify from '../../components/iconify';
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

const ReportSummary3 = () => {
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
  const [dataReport2, setDataReport2] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [selectedDepCode, setSelectedDepCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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
      console.error('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const loadReportResult = async (auth_token, startAndEndDateOrDepcode) => {
    const GetReportSummary3 = await getReportSummary3(auth_token || token, startAndEndDateOrDepcode);

    const { statusCode, reportList } = GetReportSummary3.data;

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

  const loadReport2Result = async (auth_token, startAndEndDateOrDepcode) => {
    const GetReportSummary2 = await getReportSummary2(auth_token || token, startAndEndDateOrDepcode);

    const { statusCode, reportList } = GetReportSummary2.data;
    setIsLoading2(true);
    setTimeout(() => {
      if (statusCode === 200 && !_.isEmpty(reportList)) {
        setDataReport2(reportList);
        setIsLoading2(false);
      } else {
        setDataReport2([]);
        setIsLoading2(false);
      }
    }, 1500);
  };

  const handleOnOpenCollapse = (index, deptCode) => {
    setIsLoading2(true);
    setOpen(open === index ? null : index);
    const formatted = {
      firstDate: formatDateEN(dateFilter.firstDate),
      lastDate: formatDateEN(dateFilter.lastDate),
      depCode: deptCode,
    };

    loadReport2Result(token, formatted);
  };

  const StyledTableCell2 = styled(TableCell)(({ theme, idx }) => ({
    [`&.${tableCellClasses.body}`]: {
      backgroundColor: open === idx ? theme.palette.primary.main : theme.palette.common.white,
      color: open === idx ? theme.palette.common.white : theme.palette.common.black,
      borderColor: open === idx && theme.palette.common.white,
      fontWeight: open === idx && 600
    },
  }));

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
        <Typography variant="h6">หน่วยงานที่เกิดอุบัติการณ์</Typography>
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
          <Typography variant="h6">ตารางหน่วยงานที่เกิดอุบัติการณ์</Typography>
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
                      หน่วยงาน
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
                      <>
                        <StyledTableRow key={index}>
                          <StyledTableCell2 idx={index}>
                            {_report?.med_error_depname}
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => {
                                handleOnOpenCollapse(index, _report?.med_error_depcode);
                              }}
                            >
                              {open === index ? (
                                <Iconify
                                  icon="eva:arrow-ios-upward-outline"
                                  sx={{ color: theme.palette.common.white, fontWeight: 900 }}
                                />
                              ) : (
                                <Iconify icon="eva:arrow-ios-downward-outline" />
                              )}
                            </IconButton>
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_total}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_total}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {_report.total}
                            </Typography>
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_a}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_a}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_b}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_b}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_c}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_c}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_d}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_d}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_e}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_e}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_f}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_f}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_g}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_g}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_h}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_h}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.had_i}
                          </StyledTableCell2>
                          <StyledTableCell2 idx={index} align="center">
                            {_report.non_had_i}
                          </StyledTableCell2>
                        </StyledTableRow>
                        <StyledTableRow>
                          {isLoading2 && open === index ? (
                            <Table stickyHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell align="center" colSpan={22}>
                                    <CircularProgress color="inherit" sx={{ mr: 1 }} />
                                    <Typography variant="body1">{'กำลังโหลดข้อมูล...'}</Typography>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          ) : (
                            <TableCell style={{ paddingTop: 0, paddingBottom: 2 }} colSpan={22}>
                              <Collapse in={open === index} unmountOnExit>
                                <Box sx={{ mb: 2}}>
                                  <Table stickyHeader>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell rowSpan={4} align="center">
                                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {` `}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell rowSpan={3} align="center">
                                          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                                            HAD
                                          </Typography>
                                        </TableCell>
                                        <TableCell rowSpan={3} align="center">
                                          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                                            ทั่วไป
                                          </Typography>
                                        </TableCell>
                                        <TableCell rowSpan={3} align="center">
                                          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                                            รวม
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        {severityLevels.map((level) => (
                                          <Fragment key={level}>
                                            <TableCell align="center" colSpan={2}>
                                              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 14 }}>
                                                {level}
                                              </Typography>
                                            </TableCell>
                                          </Fragment>
                                        ))}
                                      </TableRow>
                                      <TableRow>
                                        {severityLevels.map((level) => (
                                          <Fragment key={level}>
                                            <TableCell align="center">
                                              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                                                HAD
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                                                ทั่วไป
                                              </Typography>
                                            </TableCell>
                                          </Fragment>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {dataReport2.length > 0 &&
                                        dataReport2.map((_report2, index) => (
                                          <StyledTableRow key={index}>
                                            <TableCell>
                                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {_report2.error_type_name}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">{_report2.had_total}</TableCell>
                                            <TableCell align="center">{_report2.non_had_total}</TableCell>
                                            <TableCell align="center">
                                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {_report2.total}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="center">{_report2.had_a}</TableCell>
                                            <TableCell align="center">{_report2.non_had_a}</TableCell>
                                            <TableCell align="center">{_report2.had_b}</TableCell>
                                            <TableCell align="center">{_report2.non_had_b}</TableCell>
                                            <TableCell align="center">{_report2.had_c}</TableCell>
                                            <TableCell align="center">{_report2.non_had_c}</TableCell>
                                            <TableCell align="center">{_report2.had_d}</TableCell>
                                            <TableCell align="center">{_report2.non_had_d}</TableCell>
                                            <TableCell align="center">{_report2.had_e}</TableCell>
                                            <TableCell align="center">{_report2.non_had_e}</TableCell>
                                            <TableCell align="center">{_report2.had_f}</TableCell>
                                            <TableCell align="center">{_report2.non_had_f}</TableCell>
                                            <TableCell align="center">{_report2.had_g}</TableCell>
                                            <TableCell align="center">{_report2.non_had_g}</TableCell>
                                            <TableCell align="center">{_report2.had_h}</TableCell>
                                            <TableCell align="center">{_report2.non_had_h}</TableCell>
                                            <TableCell align="center">{_report2.had_i}</TableCell>
                                            <TableCell align="center">{_report2.non_had_i}</TableCell>
                                          </StyledTableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          )}
                        </StyledTableRow>
                      </>
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

export default ReportSummary3;
