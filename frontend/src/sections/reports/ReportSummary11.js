import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDateFnsTH, renderWeekendHighlightDay } from '../../utils/AdapterDateFnsTH';

import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getReportSummary11, getMedErrorDeptBySection } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateEN, formatDateRange } from '../../utils/formatTime';

const FILTER_OPTIONS = [
  { error_type: 'all', error_type_name: 'ทั้งหมด' },
  { error_type: 1, error_type_name: 'Prescription Error' },
  { error_type: 2, error_type_name: 'Dispensing Error' },
  { error_type: 3, error_type_name: 'Pre-Adminstration Error' },
  { error_type: 4, error_type_name: 'Adminstration Error' },
  { error_type: 5, error_type_name: 'Processing Error' },
  { error_type: 6, error_type_name: 'Transcribing Error' },
];

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

const SEVERITY_COLORS = {
  a: { bg: '#e3f2fd', text: '#0d47a1' },
  b: { bg: '#bbdefb', text: '#0d47a1' },
  c: { bg: '#c8e6c9', text: '#1b5e20' },
  d: { bg: '#81c784', text: '#1b5e20' },
  e: { bg: '#fff59d', text: '#f57f17' },
  f: { bg: '#fbc02d', text: '#fff' },
  g: { bg: '#ff9800', text: '#fff' },
  h: { bg: '#f44336', text: '#fff' },
  i: { bg: '#d32f2f', text: '#fff' },
};

const SeverityChip = ({ level, count, showZero = false }) => {
  if (count === null || count === undefined || (count === 0 && !showZero)) {
    return null;
  }
  const l = String(level).toLowerCase();
  const meta = SEVERITY_COLORS[l] || { bg: '#f5f5f5', text: '#9e9e9e' };

  return (
    <Chip
      size="small"
      label={count}
      sx={{
        fontWeight: 800,
        fontSize: 12.5,
        borderRadius: '6px',
        minWidth: 28,
        height: 22,
        color: meta.text,
        backgroundColor: meta.bg,
      }}
    />
  );
};
SeverityChip.propTypes = {
  level: PropTypes.string,
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showZero: PropTypes.bool,
};

const STAT_COLORS = {
  had: { bg: '#ffebee', text: '#c62828' }, // Red
  non_had: { bg: '#e8eaf6', text: '#3f51b5' }, // Indigo
  total: { bg: '#e0f2f1', text: '#00695c' }, // Teal
};

const StatChip = ({ type, count, showZero = false }) => {
  if (count === null || count === undefined || (count === 0 && !showZero)) {
    return null;
  }
  const meta = STAT_COLORS[type] || { bg: '#f5f5f5', text: '#9e9e9e' };

  return (
    <Chip
      size="small"
      label={count}
      sx={{
        fontWeight: 800,
        fontSize: 12.5,
        borderRadius: '6px',
        minWidth: 28,
        height: 22,
        color: meta.text,
        backgroundColor: meta.bg,
      }}
    />
  );
};
StatChip.propTypes = {
  type: PropTypes.string,
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showZero: PropTypes.bool,
};

export default function ReportSummary11() {
  const navigate = useNavigate();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [firstDateA, setFirstDateA] = useState(startOfMonth);
  const [lastDateA, setLastDateA] = useState(today);
  const [selectedErrorType, setSelectedErrorType] = useState(FILTER_OPTIONS[0]);

  // Department filter state
  const [departments, setDepartments] = useState([]);
  const [selectedDepGroup, setSelectedDepGroup] = useState('all');
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [selectedDepCode, setSelectedDepCode] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);

  const groupOptions = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => {
      const id = Number(d.med_error_dep_group_id);
      if (id && !map.has(id)) {
        map.set(id, d.med_error_dep_group_detail || `กลุ่ม ${id}`);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, label]) => ({ id, label }));
  }, [departments]);

  const availableDepartments = useMemo(() => {
    if (!selectedDepGroup || selectedDepGroup === 'all') {
      return departments;
    }
    return departments.filter((d) => Number(d.med_error_dep_group_id) === Number(selectedDepGroup));
  }, [departments, selectedDepGroup]);
  
  const [token, setToken] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReport = useCallback(
    async (authToken, options) => {
      if (!authToken) return;
      const { errType, periodA } = options;
      if (!periodA.firstDate || !periodA.lastDate) return;

      setIsLoading(true);
      try {
        const errorTypeIds = errType.error_type === 'all' ? [] : [errType.error_type];
        const params = {
          dateStart: periodA.firstDate,
          dateEnd: periodA.lastDate,
          errorType: errorTypeIds,
        };
        const currentGroup = options.depGroupId ?? selectedDepGroup;
        if (currentGroup && currentGroup !== 'all') {
          params.depGroupId = currentGroup;
        }
        const currentDepCode = options.depCode ?? selectedDepCode;
        if (currentDepCode && currentDepCode.length > 0) {
          params.depCode = Array.isArray(currentDepCode) ? currentDepCode : [currentDepCode];
        }
        const res = await getReportSummary11(authToken, params);
        const data = res?.data ?? {};
        if (data.statusCode === 200 && Array.isArray(data.reportList)) {
          setRows(data.reportList);
        } else {
          setRows([]);
        }
      } catch (_e) {
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDepGroup, selectedDepCode]
  );

  const triggerLoad = useCallback(
    (overrides = {}) => {
      const periodA = {
        firstDate: overrides.firstDateA ? formatDateEN(overrides.firstDateA) : formatDateEN(firstDateA),
        lastDate: overrides.lastDateA ? formatDateEN(overrides.lastDateA) : formatDateEN(lastDateA),
      };
      if (periodA.firstDate && periodA.lastDate) {
        loadReport(token, {
          errType: overrides.errType ?? selectedErrorType,
          depGroupId: overrides.depGroupId ?? selectedDepGroup,
          depCode: overrides.depCode ?? selectedDepCode,
          periodA,
        });
      }
    },
    [token, selectedErrorType, selectedDepGroup, selectedDepCode, firstDateA, lastDateA, loadReport]
  );

  const fetchDepartments = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoadingDept(true);
    try {
      const result = await getMedErrorDeptBySection(authToken, 'Y');
      const { statusCode, departmentList } = result?.data ?? {};
      if (statusCode === 200 && Array.isArray(departmentList)) {
        setDepartments(departmentList);
      }
    } catch (_e) {
      // silent
    } finally {
      setLoadingDept(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token: newToken } = verify || {};
      if (statusCode === 200 && profile && newToken) {
        setToken(newToken || null);
        fetchDepartments(newToken);
        loadReport(newToken, {
          errType: FILTER_OPTIONS[0],
          depGroupId: 'all',
          depCode: [],
          periodA: { firstDate: formatDateEN(startOfMonth), lastDate: formatDateEN(today) },
        });
      } else {
        navigate('/login', { replace: true });
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleErrTypeChange = (_e, value) => {
    setSelectedErrorType(value || FILTER_OPTIONS[0]);
    triggerLoad({ errType: value || FILTER_OPTIONS[0] });
  };

  const handleChangeDepGroup = (event) => {
    const val = event.target.value;
    setSelectedDepGroup(val);
    setSelectedDeps([]);
    setSelectedDepCode([]);
    triggerLoad({ depGroupId: val, depCode: [] });
  };

  const handleChangeDeps = (_event, values) => {
    setSelectedDeps(values || []);
    const codes = (values || []).map((d) => d.med_error_depcode).filter(Boolean);
    setSelectedDepCode(codes);
    triggerLoad({ depCode: codes });
  };

  const totalsRow = useMemo(() => {
    const sum = {
      level_a_count: 0, level_b_count: 0, level_c_count: 0, level_d_count: 0, level_e_count: 0, level_f_count: 0, level_g_count: 0, level_h_count: 0, level_i_count: 0,
      had_count: 0, non_had_count: 0, total_count: 0
    };
    rows.forEach(r => {
      sum.level_a_count += Number(r.level_a_count) || 0;
      sum.level_b_count += Number(r.level_b_count) || 0;
      sum.level_c_count += Number(r.level_c_count) || 0;
      sum.level_d_count += Number(r.level_d_count) || 0;
      sum.level_e_count += Number(r.level_e_count) || 0;
      sum.level_f_count += Number(r.level_f_count) || 0;
      sum.level_g_count += Number(r.level_g_count) || 0;
      sum.level_h_count += Number(r.level_h_count) || 0;
      sum.level_i_count += Number(r.level_i_count) || 0;
      sum.had_count += Number(r.had_count) || 0;
      sum.non_had_count += Number(r.non_had_count) || 0;
      sum.total_count += Number(r.total_count) || 0;
    });
    return sum;
  }, [rows]);

  const exportPeriodALabel = formatDateRange(firstDateA, lastDateA);
  const errorTypeNames = selectedErrorType.error_type_name;

  let filterLabel = '';
  if (selectedDepGroup !== 'all') {
    const g = groupOptions.find((item) => Number(item.id) === Number(selectedDepGroup));
    filterLabel = `กลุ่มหน่วยงาน: ${g?.label || selectedDepGroup}`;
    if (selectedDeps.length > 0) {
      filterLabel += ` (${selectedDeps.map(d => d.med_error_depname).join(', ')})`;
    }
  } else if (selectedDeps.length > 0) {
    filterLabel = `หน่วยงาน: ${selectedDeps.map(d => d.med_error_depname).join(', ')}`;
  }

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report 11');

    sheet.columns = [
      { header: 'รายละเอียดวิเคราะห์สาเหตุ', key: 'error_analysis_name', width: 45 },
      { header: 'A', key: 'level_a', width: 6 },
      { header: 'B', key: 'level_b', width: 6 },
      { header: 'C', key: 'level_c', width: 6 },
      { header: 'D', key: 'level_d', width: 6 },
      { header: 'E', key: 'level_e', width: 6 },
      { header: 'F', key: 'level_f', width: 6 },
      { header: 'G', key: 'level_g', width: 6 },
      { header: 'H', key: 'level_h', width: 6 },
      { header: 'I', key: 'level_i', width: 6 },
      { header: 'HAD', key: 'had', width: 10 },
      { header: 'Non-HAD', key: 'non_had', width: 10 },
      { header: 'รวม', key: 'total', width: 10 },
    ];

    sheet.spliceRows(1, 0,
      ['รายงานวิเคราะห์สาเหตุ'],
      [`ประเภท Error: ${errorTypeNames}${filterLabel ? ` (${filterLabel})` : ''}`],
      [`ช่วงเวลา: ${exportPeriodALabel}`],
      []
    );

    sheet.getRow(1).font = { size: 16, bold: true };
    sheet.getRow(2).font = { size: 12, bold: true };
    sheet.getRow(3).font = { size: 12, italic: true };

    const headerRow = sheet.getRow(5);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });
    sheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'left' };

    rows.forEach(r => {
      const row = sheet.addRow({
        error_analysis_name: r.error_analysis_name,
        level_a: r.level_a_count,
        level_b: r.level_b_count,
        level_c: r.level_c_count,
        level_d: r.level_d_count,
        level_e: r.level_e_count,
        level_f: r.level_f_count,
        level_g: r.level_g_count,
        level_h: r.level_h_count,
        level_i: r.level_i_count,
        had: r.had_count,
        non_had: r.non_had_count,
        total: r.total_count,
      });
      row.eachCell((cell, colNum) => {
        cell.alignment = { vertical: 'middle', horizontal: colNum === 1 ? 'left' : 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
          right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        };
      });
    });

    const totalRow = sheet.addRow({
      error_analysis_name: 'ผลรวม',
      level_a: totalsRow.level_a_count,
      level_b: totalsRow.level_b_count,
      level_c: totalsRow.level_c_count,
      level_d: totalsRow.level_d_count,
      level_e: totalsRow.level_e_count,
      level_f: totalsRow.level_f_count,
      level_g: totalsRow.level_g_count,
      level_h: totalsRow.level_h_count,
      level_i: totalsRow.level_i_count,
      had: totalsRow.had_count,
      non_had: totalsRow.non_had_count,
      total: totalsRow.total_count,
    });

    totalRow.eachCell((cell, colNum) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      cell.alignment = { vertical: 'middle', horizontal: colNum === 1 ? 'left' : 'center' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        bottom: { style: 'medium', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
      };
    });

    const EXCEL_SEVERITY_COLORS = {
      'level_a': { bg: 'FFE3F2FD', text: 'FF0D47A1' },
      'level_b': { bg: 'FFBBDEFB', text: 'FF0D47A1' },
      'level_c': { bg: 'FFC8E6C9', text: 'FF1B5E20' },
      'level_d': { bg: 'FF81C784', text: 'FF1B5E20' },
      'level_e': { bg: 'FFFFF59D', text: 'FFF57F17' },
      'level_f': { bg: 'FFFBC02D', text: 'FFFFFFFF' },
      'level_g': { bg: 'FFFF9800', text: 'FFFFFFFF' },
      'level_h': { bg: 'FFF44336', text: 'FFFFFFFF' },
      'level_i': { bg: 'FFD32F2F', text: 'FFFFFFFF' },
    };

    sheet.eachRow((row, rowNum) => {
      if (rowNum <= 5) return; // skip header and meta
      row.eachCell((cell, colNum) => {
        const { key } = sheet.getColumn(colNum);
        if (EXCEL_SEVERITY_COLORS[key] && cell.value > 0) {
          const colorMeta = EXCEL_SEVERITY_COLORS[key];
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorMeta.bg } };
          cell.font = { color: { argb: colorMeta.text }, bold: true };
        }
      });
    });

    const fileName = `รายงานวิเคราะห์สาเหตุ_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="column" sx={{ mb: 2 }}>
        <Typography variant="h6">รายงานวิเคราะห์สาเหตุ</Typography>
        <Typography variant="body2" color="text.secondary">
          แสดงรายการรวมทุกประเภท Error ที่เลือก แยกกลุ่มตามสาเหตุ (Error Analysis) พร้อมการนับจำนวนตามความรุนแรง A-I, HAD, และ Non-HAD
        </Typography>
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 3, py: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFnsTH}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <DatePicker
              label="วันที่"
              value={firstDateA}
              onChange={(val) => { setFirstDateA(val); triggerLoad({ firstDateA: val }); }}
              inputFormat="d MMMM yyyy"
              disableMaskedInput
              renderDay={renderWeekendHighlightDay}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
            />
            <DatePicker
              label="ถึงวันที่"
              value={lastDateA}
              onChange={(val) => { setLastDateA(val); triggerLoad({ lastDateA: val }); }}
              inputFormat="d MMMM yyyy"
              disableMaskedInput
              renderDay={renderWeekendHighlightDay}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
            />
          </Box>
        </LocalizationProvider>

        <Autocomplete
          options={FILTER_OPTIONS}
          value={selectedErrorType}
          onChange={handleErrTypeChange}
          getOptionLabel={(option) => (option ? option.error_type_name : '')}
          isOptionEqualToValue={(option, value) => option?.error_type === value?.error_type}
          disableClearable
          renderInput={(params) => <TextField {...params} label="ประเภท Error *" size="small" sx={{ minWidth: 260 }} />}
        />

        {/* กลุ่มหน่วยงาน */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="rs11-dep-group-label">กลุ่มหน่วยงาน</InputLabel>
          <Select
            labelId="rs11-dep-group-label"
            id="rs11-dep-group"
            value={selectedDepGroup}
            label="กลุ่มหน่วยงาน"
            onChange={handleChangeDepGroup}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {groupOptions.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* หน่วยงาน (กรองตามกลุ่มหน่วยงานที่เลือก) */}
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={availableDepartments}
          value={selectedDeps}
          onChange={handleChangeDeps}
          getOptionLabel={(option) => option.med_error_depname}
          isOptionEqualToValue={(option, value) => option.med_error_depcode === value.med_error_depcode}
          loading={loadingDept}
          size="small"
          sx={{ minWidth: 240, maxWidth: 360 }}
          renderOption={(props, option, { selected }) => {
            // eslint-disable-next-line react/prop-types
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <FormControlLabel
                  control={<Checkbox checked={selected} size="small" />}
                  label={<ListItemText primary={option.med_error_depname} primaryTypographyProps={{ fontSize: 13 }} />}
                />
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="เลือกหน่วยงาน"
              placeholder={selectedDepGroup !== 'all' ? 'เลือกในกลุ่มนี้' : 'ค้นหาหน่วยงาน'}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingDept && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Stack>

      <Paper elevation={0} sx={{ p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="column">
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                {errorTypeNames}
              </Typography>
              {filterLabel && (
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {filterLabel}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                ช่วงเวลา: {exportPeriodALabel}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Iconify icon="vscode-icons:file-type-excel" />}
              onClick={exportExcel}
              disabled={isLoading || rows.length === 0}
              sx={{ backgroundColor: '#1d6f42', '&:hover': { backgroundColor: '#145c32' } }}
            >
              Export Excel
            </Button>
          </Stack>
        </Box>

        <Scrollbar>
          <TableContainer sx={{ minWidth: 1000 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell rowSpan={2} align="center" sx={{ width: 300 }}>
                    รายละเอียดวิเคราะห์สาเหตุ
                  </StyledTableCell>
                  <StyledTableCell colSpan={9} align="center">
                    Level
                  </StyledTableCell>
                  <StyledTableCell rowSpan={2} align="center" sx={{ width: 80 }}>
                    HAD
                  </StyledTableCell>
                  <StyledTableCell rowSpan={2} align="center" sx={{ width: 80 }}>
                    Non-HAD
                  </StyledTableCell>
                  <StyledTableCell rowSpan={2} align="center" sx={{ width: 80 }}>
                    รวม
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                    <StyledTableCell key={l} align="center" sx={{ px: 0.5, width: 45 }}>
                      <SeverityChip level={l} count={l} showZero />
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={22} sx={{ mr: 1 }} />
                      <Typography variant="body2" component="span">กำลังโหลดข้อมูล...</Typography>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 6 }}>
                      <Iconify icon="eva:inbox-outline" sx={{ width: 48, height: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        ไม่มีข้อมูล / กรุณาเลือกช่วงวันที่
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {rows.map((r, i) => (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {r.error_analysis_name}
                          </Typography>
                        </TableCell>
                        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map(l => (
                          <TableCell key={l} align="center" sx={{ px: 0.5 }}>
                            <SeverityChip level={l} count={r[`level_${l}_count`]} />
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <StatChip type="had" count={r.had_count} />
                        </TableCell>
                        <TableCell align="center">
                          <StatChip type="non_had" count={r.non_had_count} />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          <StatChip type="total" count={r.total_count} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* แถว ผลรวม */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>ผลรวม</TableCell>
                      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map(l => (
                        <TableCell key={l} align="center" sx={{ px: 0.5 }}>
                          <SeverityChip level={l} count={totalsRow[`level_${l}_count`]} showZero />
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        <StatChip type="had" count={totalsRow.had_count} showZero />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        <StatChip type="non_had" count={totalsRow.non_had_count} showZero />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>
                        <StatChip type="total" count={totalsRow.total_count} showZero />
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Paper>
    </Box>
  );
}
