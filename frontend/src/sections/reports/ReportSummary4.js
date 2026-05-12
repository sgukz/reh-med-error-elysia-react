import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import Scrollbar from '../../components/scrollbar';
import Iconify from '../../components/iconify';
import { getDrugPairSummary } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN } from '../../utils/formatTime';

const PAIR_TABS = [
  { value: 'dispensing', label: 'คู่ยาที่จัดคลาดเคลื่อน' },
  { value: 'processing', label: 'คู่ยาที่คีย์คลาดเคลื่อน' },
];

const ReportSummary4 = () => {
  const navigate = useNavigate();

  const today = dayjs();
  const startOfMonth = today.startOf('month');

  const [firstDate, setFirstDate] = useState(startOfMonth);
  const [lastDate, setLastDate] = useState(today);
  const [dateFilter, setDateFilter] = useState({
    firstDate: formatDateEN(startOfMonth),
    lastDate: formatDateEN(today),
  });

  const [token, setToken] = useState(null);
  const [pairType, setPairType] = useState('dispensing');
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadRows = useCallback(async (authToken, range, type) => {
    if (!authToken || !range?.firstDate || !range?.lastDate) return;
    setIsLoading(true);
    try {
      const res = await getDrugPairSummary(authToken, {
        firstDate: range.firstDate,
        lastDate: range.lastDate,
        pairType: type,
      });
      const { statusCode, reportList } = res.data ?? {};
      setRows(statusCode === 200 && Array.isArray(reportList) ? reportList : []);
    } catch (err) {
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFirstDateChange = (newDate) => {
    setFirstDate(newDate);
    if (newDate && lastDate) {
      const next = { firstDate: formatDateEN(newDate), lastDate: formatDateEN(lastDate) };
      setDateFilter(next);
      setPage(0);
      loadRows(token, next, pairType);
    }
  };

  const handleLastDateChange = (newDate) => {
    setLastDate(newDate);
    if (firstDate && newDate) {
      const next = { firstDate: formatDateEN(firstDate), lastDate: formatDateEN(newDate) };
      setDateFilter(next);
      setPage(0);
      loadRows(token, next, pairType);
    }
  };

  const handlePairChange = (_event, newValue) => {
    setPairType(newValue);
    setPage(0);
    loadRows(token, dateFilter, newValue);
  };

  useEffect(() => {
    async function checkVerifyToken() {
      const verify = await verifyToken(null);
      const { statusCode, access_token: newToken } = verify ?? {};
      if (statusCode === 200 && newToken) {
        setToken(newToken);
        loadRows(newToken, dateFilter, pairType);
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredRows = normalizedSearch
    ? rows.filter(
        (r) =>
          (r.drug_right || '').toLowerCase().includes(normalizedSearch) ||
          (r.drug_wrong || '').toLowerCase().includes(normalizedSearch)
      )
    : rows;

  const visibleRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExportExcel = () => {
    if (_.isEmpty(filteredRows)) return;
    
    const dataForExcel = filteredRows.map((row) => ({
      'ชื่อยาที่ถูก': row.drug_right,
      'ชื่อยาที่คลาดเคลื่อน': row.drug_wrong,
      'จำนวนอุบัติการณ์ (ครั้ง)': row.count,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'คู่ยาคลาดเคลื่อน');
    const pairName = pairType === 'dispensing' ? 'จัดคลาดเคลื่อน' : 'คีย์คลาดเคลื่อน';
    const fileName = `รายงานคู่ยา${pairName}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const dateLabel =
    dateFilter.firstDate === dateFilter.lastDate
      ? formatDateTime(dateFilter.firstDate)
      : `${formatDateTime(dateFilter.firstDate)} - ${formatDateTime(dateFilter.lastDate)}`;

  return (
    <Box>
      <Stack direction="column">
        <Typography variant="h6">คู่ยาที่มีความคลาดเคลื่อน</Typography>
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 2, py: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="วันที่"
              value={firstDate}
              onChange={handleFirstDateChange}
              inputFormat="d MMMM yyyy" disableMaskedInput
              renderInput={(params) => <TextField {...params} size="small" fullWidth readOnly />}
            />
            <DatePicker
              label="ถึงวันที่"
              value={lastDate}
              onChange={handleLastDateChange}
              inputFormat="d MMMM yyyy" disableMaskedInput
              renderInput={(params) => <TextField {...params} size="small" fullWidth readOnly />}
            />
          </Box>
        </LocalizationProvider>

        <TextField
          size="small"
          placeholder="ค้นหาชื่อยา..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 240 }}
        />
      </Stack>

      <Tabs value={pairType} onChange={handlePairChange} sx={{ mb: 2 }}>
        {PAIR_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="column">
          <Typography variant="h6">
            {PAIR_TABS.find((t) => t.value === pairType)?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`ข้อมูลวันที่ ${dateLabel}`}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:file-text-fill" />}
          onClick={handleExportExcel}
          disabled={_.isEmpty(filteredRows)}
          color={_.isEmpty(filteredRows) ? 'inherit' : 'primary'}
        >
          Export Excel
        </Button>
      </Stack>

      <Scrollbar>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยาที่ถูก</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อยาที่คลาดเคลื่อน</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 160 }}>
                  จำนวนอุบัติการณ์
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell align="center" colSpan={3}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" component="span">
                      กำลังโหลดข้อมูล...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : _.isEmpty(filteredRows) ? (
                <TableRow>
                  <TableCell align="center" colSpan={3} sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      ไม่มีข้อมูลในช่วงเวลาที่เลือก
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, idx) => (
                  <TableRow key={`${row.drug_right}__${row.drug_wrong}__${idx}`} hover>
                    <TableCell>{row.drug_right}</TableCell>
                    <TableCell>{row.drug_wrong}</TableCell>
                    <TableCell align="center">{row.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
};

export default ReportSummary4;
