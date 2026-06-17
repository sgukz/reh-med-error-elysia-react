import React, { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { styled, alpha } from '@mui/material/styles';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import dayjs from 'dayjs';

import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getReportSummary9 } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN } from '../../utils/formatTime';
import { MedErrorTypeAll } from '../../data/DataMedError';

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

// สี + label ของ Likelihood — ตรงกับ LikelihoodCriteriaPage
const LIKELIHOOD_META = {
  5: { label: 'Frequent', th: 'เกิดบ่อยมาก', color: '#dc2626' },
  4: { label: 'Likely', th: 'เกิดบ่อย', color: '#ea580c' },
  3: { label: 'Possible', th: 'อาจเกิด', color: '#f59e0b' },
  2: { label: 'Unlikely', th: 'ไม่ค่อยเกิด', color: '#65a30d' },
  1: { label: 'Rare', th: 'เกิดน้อย', color: '#16a34a' },
  0: { label: 'Never', th: 'ไม่เกิดเลย', color: '#64748b' },
};

const LikelihoodChip = ({ score }) => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return (
      <Chip
        size="small"
        label="—"
        variant="outlined"
        sx={{ borderRadius: '8px', fontWeight: 600, color: 'text.disabled', borderColor: 'divider' }}
      />
    );
  }
  const meta = LIKELIHOOD_META[score] || { label: `${score}`, th: '', color: '#64748b' };
  return (
    <Tooltip title={`${meta.label}${meta.th ? ` — ${meta.th}` : ''}`} arrow>
      <Chip
        size="small"
        label={score}
        sx={{
          fontWeight: 800,
          fontSize: 12,
          borderRadius: '8px',
          minWidth: 32,
          color: '#fff',
          backgroundColor: meta.color,
          boxShadow: `0 2px 6px -2px ${alpha(meta.color, 0.6)}`,
          '&:hover': { backgroundColor: meta.color, filter: 'brightness(1.05)' },
        }}
      />
    </Tooltip>
  );
};
LikelihoodChip.propTypes = { score: PropTypes.number };

const RISK_MATRIX = {
  5: { 1: 'Medium', 2: 'Medium', 3: 'High', 4: 'High', 5: 'High' },
  4: { 1: 'Medium', 2: 'Medium', 3: 'Medium', 4: 'High', 5: 'High' },
  3: { 1: 'Low', 2: 'Medium', 3: 'Medium', 4: 'Medium', 5: 'High' },
  2: { 1: 'Low', 2: 'Low', 3: 'Medium', 4: 'Medium', 5: 'Medium' },
  1: { 1: 'Low', 2: 'Low', 3: 'Low', 4: 'Medium', 5: 'Medium' },
};

// สีของ Level cell (Impact * Likelihood) ตาม Risk Matrix
const getRiskLevelColor = (impact, likelihood) => {
  if (!impact || !likelihood) return { backgroundColor: '#f5f5f5', color: '#9e9e9e' };
  const risk = RISK_MATRIX[likelihood]?.[impact];
  if (risk === 'Low') return { backgroundColor: '#4caf50', color: '#fff', fontWeight: 700 }; // green
  if (risk === 'Medium') return { backgroundColor: '#ffeb3b', color: '#424242', fontWeight: 700 }; // yellow
  if (risk === 'High') return { backgroundColor: '#f44336', color: '#fff', fontWeight: 800 }; // red
  return { backgroundColor: '#f5f5f5', color: '#9e9e9e' };
};

const LevelChip = ({ impact, likelihood, level }) => {
  if (level === null || level === undefined || Number.isNaN(level)) {
    return (
      <Chip
        size="small"
        label="—"
        variant="outlined"
        sx={{ borderRadius: '8px', fontWeight: 600, color: 'text.disabled', borderColor: 'divider' }}
      />
    );
  }
  const risk = RISK_MATRIX[likelihood]?.[impact] || 'Unknown';
  let color = '#64748b';
  if (risk === 'Low') color = '#4caf50';
  if (risk === 'Medium') color = '#fbc02d'; // slightly darker yellow for better contrast with white text, or keep fbc02d and dark text
  if (risk === 'High') color = '#f44336';

  return (
    <Tooltip title={`Risk Level: ${risk}`} arrow>
      <Chip
        size="small"
        label={level}
        sx={{
          fontWeight: 800,
          fontSize: 12,
          borderRadius: '8px',
          minWidth: 32,
          color: risk === 'Medium' ? '#424242' : '#fff',
          backgroundColor: color,
          boxShadow: `0 2px 6px -2px ${alpha(color, 0.6)}`,
          '&:hover': { backgroundColor: color, filter: 'brightness(1.05)' },
        }}
      />
    </Tooltip>
  );
};
LevelChip.propTypes = {
  impact: PropTypes.number,
  likelihood: PropTypes.number,
  level: PropTypes.number,
};

const RiskAssessmentMatrix = () => {
  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1565c0' }}>
        Risk Assessment Matrix
      </Typography>
      <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
        <Table size="small" sx={{ '& td': { border: '1px solid #FFFFFF', textAlign: 'center', p: 1 } }}>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={6} sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 700, backgroundColor: '#cfd8dc', width: 40, whiteSpace: 'nowrap', p: 2 }}>
                Frequency (Occurrent)
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#e0e0e0' }}>Certain</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#e0e0e0' }}>5</TableCell>
              <TableCell sx={getRiskLevelColor(1, 5)}>Medium (5)</TableCell>
              <TableCell sx={getRiskLevelColor(2, 5)}>Medium (10)</TableCell>
              <TableCell sx={getRiskLevelColor(3, 5)}>High (15)</TableCell>
              <TableCell sx={getRiskLevelColor(4, 5)}>High (20)</TableCell>
              <TableCell sx={getRiskLevelColor(5, 5)}>High (25)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#e0e0e0' }}>Common</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#e0e0e0' }}>4</TableCell>
              <TableCell sx={getRiskLevelColor(1, 4)}>Medium (4)</TableCell>
              <TableCell sx={getRiskLevelColor(2, 4)}>Medium (8)</TableCell>
              <TableCell sx={getRiskLevelColor(3, 4)}>Medium (12)</TableCell>
              <TableCell sx={getRiskLevelColor(4, 4)}>High (16)</TableCell>
              <TableCell sx={getRiskLevelColor(5, 4)}>High (20)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#e0e0e0' }}>Possible</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#e0e0e0' }}>3</TableCell>
              <TableCell sx={getRiskLevelColor(1, 3)}>Low (3)</TableCell>
              <TableCell sx={getRiskLevelColor(2, 3)}>Medium (6)</TableCell>
              <TableCell sx={getRiskLevelColor(3, 3)}>Medium (9)</TableCell>
              <TableCell sx={getRiskLevelColor(4, 3)}>Medium (12)</TableCell>
              <TableCell sx={getRiskLevelColor(5, 3)}>High (15)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#e0e0e0' }}>Unlikely</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#e0e0e0' }}>2</TableCell>
              <TableCell sx={getRiskLevelColor(1, 2)}>Low (2)</TableCell>
              <TableCell sx={getRiskLevelColor(2, 2)}>Low (4)</TableCell>
              <TableCell sx={getRiskLevelColor(3, 2)}>Medium (6)</TableCell>
              <TableCell sx={getRiskLevelColor(4, 2)}>Medium (8)</TableCell>
              <TableCell sx={getRiskLevelColor(5, 2)}>Medium (10)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#e0e0e0' }}>Rare</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#e0e0e0' }}>1</TableCell>
              <TableCell sx={getRiskLevelColor(1, 1)}>Low (1)</TableCell>
              <TableCell sx={getRiskLevelColor(2, 1)}>Low (2)</TableCell>
              <TableCell sx={getRiskLevelColor(3, 1)}>Low (3)</TableCell>
              <TableCell sx={getRiskLevelColor(4, 1)}>Medium (4)</TableCell>
              <TableCell sx={getRiskLevelColor(5, 1)}>Medium (5)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 700, backgroundColor: '#6a1b9a', color: '#fff', fontSize: 13 }}>
                Risk Matrix for<br />Risk Assessment of Hospital Facilities
              </TableCell>
              <TableCell sx={{ backgroundColor: '#9e9e9e', color: '#fff' }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>A (1)</Typography><Typography variant="caption" sx={{ lineHeight: 1, display: 'block', mt: 0.5 }}>Insignificant<br/>(Near miss: A-B)</Typography></TableCell>
              <TableCell sx={{ backgroundColor: '#757575', color: '#fff' }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>B (2)</Typography><Typography variant="caption" sx={{ lineHeight: 1, display: 'block', mt: 0.5 }}>Minor<br/>(No Harm; C-D)</Typography></TableCell>
              <TableCell sx={{ backgroundColor: '#9e9e9e', color: '#fff' }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>C (3)</Typography><Typography variant="caption" sx={{ lineHeight: 1, display: 'block', mt: 0.5 }}>Moderate<br/>(AE; E - F)</Typography></TableCell>
              <TableCell sx={{ backgroundColor: '#757575', color: '#fff' }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>D (4)</Typography><Typography variant="caption" sx={{ lineHeight: 1, display: 'block', mt: 0.5 }}>Major<br/>(Sentinel, G-I)</Typography></TableCell>
              <TableCell sx={{ backgroundColor: '#9e9e9e', color: '#fff' }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>E (5)</Typography><Typography variant="caption" sx={{ lineHeight: 1, display: 'block', mt: 0.5 }}>Catastrophic<br/>(ITL)</Typography></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ border: 'none', backgroundColor: '#fff' }} />
              <TableCell colSpan={7} sx={{ fontWeight: 700, backgroundColor: '#0d47a1', color: '#fff' }}>
                Consequence (Severity)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// สีของ Δ% — เพิ่ม=แดง, ลด=เขียว, 0/null=เทา
const deltaCellStyle = (deltaPct) => {
  if (deltaPct === null || deltaPct === undefined || Number.isNaN(deltaPct)) {
    return { color: '#9e9e9e' };
  }
  if (deltaPct > 0) return { color: '#c62828', fontWeight: 700 };
  if (deltaPct < 0) return { color: '#2e7d32', fontWeight: 700 };
  return { color: '#616161' };
};

// คำนวณ Δ% (B vs A): null ถ้า A=0
const calcDeltaPct = (a, b) => {
  if (a === 0 || a === null || a === undefined) return null;
  return Math.round(((b - a) / a) * 100);
};

const formatDeltaPct = (deltaPct) => {
  if (deltaPct === null || deltaPct === undefined || Number.isNaN(deltaPct)) return '—';
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct}%`;
};

const ReportSummary9 = () => {
  const navigate = useNavigate();

  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const startOfPrevMonth = today.subtract(1, 'month').startOf('month');
  const endOfPrevMonth = today.subtract(1, 'month').endOf('month');

  // Period A (required)
  const [firstDateA, setFirstDateA] = useState(startOfMonth);
  const [lastDateA, setLastDateA] = useState(today);
  // Period B (optional, สำหรับเปรียบเทียบ)
  const [compareMode, setCompareMode] = useState(false);
  const [firstDateB, setFirstDateB] = useState(startOfPrevMonth);
  const [lastDateB, setLastDateB] = useState(endOfPrevMonth);

  const [selectedErrorType, setSelectedErrorType] = useState(MedErrorTypeAll[0]);

  const [token, setToken] = useState(null);
  const [rows, setRows] = useState([]);
  const [errorTypeName, setErrorTypeName] = useState('');
  const [isCompareResult, setIsCompareResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadReport = useCallback(
    async (authToken, options) => {
      if (!authToken) return;
      const { errType, periodA, periodB, withCompare } = options;
      if (!errType?.error_type) return;
      setIsLoading(true);
      try {
        const params = {
          errorType: errType.error_type,
          firstDateA: periodA.firstDate,
          lastDateA: periodA.lastDate,
        };
        if (withCompare && periodB) {
          params.firstDateB = periodB.firstDate;
          params.lastDateB = periodB.lastDate;
        }
        const res = await getReportSummary9(authToken, params);
        const data = res?.data ?? {};
        if (data.statusCode === 200 && Array.isArray(data.reportList)) {
          setRows(data.reportList);
          setErrorTypeName(data.errorTypeName || '');
          setIsCompareResult(Boolean(data.compare));
        } else {
          setRows([]);
          setErrorTypeName('');
          setIsCompareResult(false);
        }
      } catch (_e) {
        setRows([]);
        setErrorTypeName('');
        setIsCompareResult(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // เรียก load เมื่อ filter เปลี่ยน — ใช้ค่าจาก state ตอนเรียก
  const triggerLoad = useCallback(
    (overrides = {}) => {
      const periodA = {
        firstDate: formatDateEN(overrides.firstDateA ?? firstDateA),
        lastDate: formatDateEN(overrides.lastDateA ?? lastDateA),
      };
      const useCompare = overrides.compareMode ?? compareMode;
      const periodB = useCompare
        ? {
            firstDate: formatDateEN(overrides.firstDateB ?? firstDateB),
            lastDate: formatDateEN(overrides.lastDateB ?? lastDateB),
          }
        : null;
      loadReport(token, {
        errType: overrides.errType ?? selectedErrorType,
        periodA,
        periodB,
        withCompare: useCompare,
      });
    },
    [token, selectedErrorType, firstDateA, lastDateA, compareMode, firstDateB, lastDateB, loadReport]
  );

  useEffect(() => {
    async function checkVerifyToken() {
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token: newToken } = verify ?? {};
      if (statusCode === 200 && profile) {
        setToken(newToken || null);
        // โหลดข้อมูลครั้งแรกด้วย Period A เดือนปัจจุบัน + ประเภท Error แรก
        loadReport(newToken, {
          errType: MedErrorTypeAll[0],
          periodA: { firstDate: formatDateEN(startOfMonth), lastDate: formatDateEN(today) },
          periodB: null,
          withCompare: false,
        });
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // คำนวณ rows ที่มี derived fields (total, delta, level)
  const enrichedRows = useMemo(() => {
    return rows.map((r) => {
      const hadA = Number(r.had_a) || 0;
      const nonHadA = Number(r.non_had_a) || 0;
      const totalA = Number(r.total_a) || 0;
      const hadB = isCompareResult ? Number(r.had_b) || 0 : 0;
      const nonHadB = isCompareResult ? Number(r.non_had_b) || 0 : 0;
      const totalB = isCompareResult ? Number(r.total_b) || 0 : 0;
      const impact = r.impact_score === null || r.impact_score === undefined ? null : Number(r.impact_score);
      const likelihood =
        r.likelihood_score === null || r.likelihood_score === undefined ? null : Number(r.likelihood_score);
      const level = impact !== null && likelihood !== null ? impact * likelihood : null;
      const deltaPct = isCompareResult ? calcDeltaPct(totalA, totalB) : null;
      return {
        ...r,
        hadA,
        nonHadA,
        totalA,
        hadB,
        nonHadB,
        totalB,
        impact,
        likelihood,
        level,
        deltaPct,
      };
    });
  }, [rows, isCompareResult]);

  // แถวผลรวม
  const totalsRow = useMemo(() => {
    return enrichedRows.reduce(
      (acc, r) => {
        acc.hadA += r.hadA;
        acc.nonHadA += r.nonHadA;
        acc.totalA += r.totalA;
        if (isCompareResult) {
          acc.hadB += r.hadB;
          acc.nonHadB += r.nonHadB;
          acc.totalB += r.totalB;
        }
        return acc;
      },
      { hadA: 0, nonHadA: 0, totalA: 0, hadB: 0, nonHadB: 0, totalB: 0 }
    );
  }, [enrichedRows, isCompareResult]);

  const totalsDeltaPct = isCompareResult ? calcDeltaPct(totalsRow.totalA, totalsRow.totalB) : null;

  // นับเฉพาะแถวที่ขาด Impact (Likelihood เป็น auto จากเกณฑ์ ไม่ต้องเตือน)
  const incompleteImpactCount = enrichedRows.filter((r) => r.impact === null).length;

  // Filter handlers
  const handleFirstA = (newDate) => {
    setFirstDateA(newDate);
    if (newDate && lastDateA) triggerLoad({ firstDateA: newDate });
  };
  const handleLastA = (newDate) => {
    setLastDateA(newDate);
    if (firstDateA && newDate) triggerLoad({ lastDateA: newDate });
  };
  const handleFirstB = (newDate) => {
    setFirstDateB(newDate);
    if (compareMode && newDate && lastDateB) triggerLoad({ firstDateB: newDate });
  };
  const handleLastB = (newDate) => {
    setLastDateB(newDate);
    if (compareMode && firstDateB && newDate) triggerLoad({ lastDateB: newDate });
  };
  const handleErrTypeChange = (_e, value) => {
    if (!value) return;
    setSelectedErrorType(value);
    triggerLoad({ errType: value });
  };
  const handleCompareToggle = (e) => {
    const next = e.target.checked;
    setCompareMode(next);
    triggerLoad({ compareMode: next });
  };

  // Excel Export ด้วย exceljs รองรับสีและภาพ
  const handleExportExcel = async () => {
    if (_.isEmpty(enrichedRows)) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('แยกรายละเอียด Error');

    // Define columns
    const columns = [
      { header: 'รายละเอียด Error', key: 'detail', width: 45 },
      { header: 'HAD (A)', key: 'hadA', width: 12 },
      { header: 'Non-HAD (A)', key: 'nonHadA', width: 15 },
      { header: 'รวม (A)', key: 'totalA', width: 12 },
    ];
    if (isCompareResult) {
      columns.push(
        { header: 'HAD (B)', key: 'hadB', width: 12 },
        { header: 'Non-HAD (B)', key: 'nonHadB', width: 15 },
        { header: 'รวม (B)', key: 'totalB', width: 12 },
        { header: 'Δ%', key: 'delta', width: 10 }
      );
    }
    columns.push(
      { header: 'Impact', key: 'impact', width: 10 },
      { header: 'Likelihood', key: 'likelihood', width: 12 },
      { header: 'Level', key: 'level', width: 10 }
    );
    sheet.columns = columns;

    // Add Title rows at the top
    const exportPeriodALabel = firstDateA && lastDateA
        ? formatDateEN(firstDateA) === formatDateEN(lastDateA)
          ? `วันที่ ${formatDateTime(formatDateEN(firstDateA))}`
          : `ระหว่างวันที่ ${formatDateTime(formatDateEN(firstDateA))} - ${formatDateTime(formatDateEN(lastDateA))}`
        : 'ข้อมูลทั้งหมด';
    
    const exportPeriodBLabel = isCompareResult && firstDateB && lastDateB
        ? formatDateEN(firstDateB) === formatDateEN(lastDateB)
          ? ` หรือ วันที่ ${formatDateTime(formatDateEN(firstDateB))}`
          : ` หรือ ระหว่างวันที่ ${formatDateTime(formatDateEN(firstDateB))} - ${formatDateTime(formatDateEN(lastDateB))}`
        : '';

    sheet.spliceRows(1, 0,
      ['ข้อมูลรายละเอียดประเภท Error'],
      [`${errorTypeName || 'ทุกประเภท'}`],
      [`${exportPeriodALabel}${exportPeriodBLabel}`],
      []
    );

    sheet.mergeCells('A1:D1');
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.mergeCells('A2:D2');
    sheet.getCell('A2').font = { bold: true, size: 12, color: { argb: 'FF1565C0' } };
    sheet.mergeCells('A3:D3');
    sheet.getCell('A3').font = { bold: true, size: 11 };

    // Header styling (now shifted to row 5)
    sheet.getRow(5).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Add data
    enrichedRows.forEach((r) => {
      const rowData = {
        detail: `${r.error_type_list} ${r.error_type_list_detail}`,
        hadA: r.hadA,
        nonHadA: r.nonHadA,
        totalA: r.totalA,
        impact: r.impact ?? '',
        likelihood: r.likelihood ?? '',
        level: r.level ?? '',
      };
      if (isCompareResult) {
        rowData.hadB = r.hadB;
        rowData.nonHadB = r.nonHadB;
        rowData.totalB = r.totalB;
        rowData.delta = r.deltaPct === null ? '' : `${r.deltaPct > 0 ? '+' : ''}${r.deltaPct}%`;
      }
      const row = sheet.addRow(rowData);
      
      // Color the Level cell
      if (r.impact && r.likelihood && r.level) {
        const risk = RISK_MATRIX[r.likelihood]?.[r.impact];
        const levelCell = row.getCell(isCompareResult ? 11 : 7);
        if (risk === 'Low') {
          levelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
          levelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (risk === 'Medium') {
          levelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBC02D' } };
          levelCell.font = { color: { argb: 'FF424242' }, bold: true };
        } else if (risk === 'High') {
          levelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } };
          levelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
      }
    });

    // Add totals row
    const totalsData = {
      detail: 'ผลรวม',
      hadA: totalsRow.hadA,
      nonHadA: totalsRow.nonHadA,
      totalA: totalsRow.totalA,
      impact: '',
      likelihood: '',
      level: '',
    };
    if (isCompareResult) {
      totalsData.hadB = totalsRow.hadB;
      totalsData.nonHadB = totalsRow.nonHadB;
      totalsData.totalB = totalsRow.totalB;
      totalsData.delta = '';
    }
    const totalRow = sheet.addRow(totalsData);
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });

    // Style the data cells borders and alignment
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 5) {
        row.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (colNumber > 1) cell.alignment = { horizontal: 'center' };
        });
      }
    });

    // วาดตาราง Risk Assessment Matrix ลงใน Excel โดยตรง
    const matrixStart = sheet.rowCount + 2;
    const titleCell = sheet.getCell(matrixStart, 1);
    titleCell.value = 'Risk Assessment Matrix';
    titleCell.font = { bold: true, size: 12, color: { argb: 'FF1565C0' } };

    const matrixData = [
      ['Frequency (Occurrent)', 'Certain', '5', 'Medium (5)', 'Medium (10)', 'High (15)', 'High (20)', 'High (25)'],
      ['', 'Common', '4', 'Medium (4)', 'Medium (8)', 'Medium (12)', 'High (16)', 'High (20)'],
      ['', 'Possible', '3', 'Low (3)', 'Medium (6)', 'Medium (9)', 'Medium (12)', 'High (15)'],
      ['', 'Unlikely', '2', 'Low (2)', 'Low (4)', 'Medium (6)', 'Medium (8)', 'Medium (10)'],
      ['', 'Rare', '1', 'Low (1)', 'Low (2)', 'Low (3)', 'Medium (4)', 'Medium (5)'],
      ['Risk Matrix for Risk Assessment\nof Hospital Facilities', '', '', 'A (1)\nInsignificant\n(Near miss)', 'B (2)\nMinor\n(No Harm)', 'C (3)\nModerate\n(AE)', 'D (4)\nMajor\n(Sentinel)', 'E (5)\nCatastrophic\n(ITL)'],
      ['', '', '', 'Consequence (Severity)', '', '', '', '']
    ];

    matrixData.forEach((rowVals, i) => {
      const row = sheet.getRow(matrixStart + 1 + i);
      rowVals.forEach((val, j) => {
        row.getCell(j + 1).value = val;
      });
    });

    // Merging and styling Frequency column
    sheet.mergeCells(matrixStart + 1, 1, matrixStart + 5, 1);
    const freqCell = sheet.getCell(matrixStart + 1, 1);
    freqCell.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
    freqCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCFD8DC' } };
    freqCell.font = { bold: true };

    const colors = {
      Low: 'FF4CAF50',
      Medium: 'FFFBC02D',
      High: 'FFF44336'
    };

    for (let i = 0; i < 5; i++) {
      const row = sheet.getRow(matrixStart + 1 + i);
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      row.getCell(2).font = { bold: true };
      row.getCell(3).font = { bold: true };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

      for (let j = 0; j < 5; j++) {
        const cell = row.getCell(j + 4);
        const text = cell.value || '';
        const isLow = text.includes('Low');
        const isHigh = text.includes('High');
        const isMedium = text.includes('Medium');
        const argb = isLow ? colors.Low : isHigh ? colors.High : colors.Medium;
        const fontColor = isMedium ? 'FF424242' : 'FFFFFFFF';

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
        cell.font = { color: { argb: fontColor }, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }

    // Bottom Headers
    sheet.mergeCells(matrixStart + 6, 1, matrixStart + 6, 3);
    const rmCell = sheet.getCell(matrixStart + 6, 1);
    rmCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6A1B9A' } };
    rmCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    rmCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    const headerColors = ['FF9E9E9E', 'FF757575', 'FF9E9E9E', 'FF757575', 'FF9E9E9E'];
    for (let j = 0; j < 5; j++) {
      const cell = sheet.getCell(matrixStart + 6, j + 4);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColors[j] } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    sheet.getRow(matrixStart + 6).height = 50;

    // Consequence (Severity) row
    sheet.mergeCells(matrixStart + 7, 4, matrixStart + 7, 8);
    const consCell = sheet.getCell(matrixStart + 7, 4);
    consCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };
    consCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    consCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add borders to the matrix
    for (let i = 0; i < 7; i++) {
      const row = sheet.getRow(matrixStart + 1 + i);
      for (let j = 0; j < 8; j++) {
        // Skip borders for empty bottom-left corner
        if (!(i === 6 && j < 3)) {
          const cell = row.getCell(j + 1);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      }
    }

    const fileName = `รายงานแยกรายละเอียด_Error_${errorTypeName || ''}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
  };

  const periodALabel =
    formatDateEN(firstDateA) === formatDateEN(lastDateA)
      ? formatDateTime(formatDateEN(firstDateA))
      : `${formatDateTime(formatDateEN(firstDateA))} - ${formatDateTime(formatDateEN(lastDateA))}`;
  const periodBLabel = isCompareResult
    ? formatDateEN(firstDateB) === formatDateEN(lastDateB)
      ? formatDateTime(formatDateEN(firstDateB))
      : `${formatDateTime(formatDateEN(firstDateB))} - ${formatDateTime(formatDateEN(lastDateB))}`
    : '';

  return (
    <Box>
      <Stack direction="column">
        <Typography variant="h6">รายงานแยกรายละเอียด Error</Typography>
        <Typography variant="body2" color="text.secondary">
          แสดงรายการ subtype ของประเภท Error ที่เลือก พร้อม HAD/Non-HAD, Impact (กำหนดต่อรายการ), Likelihood
          <Typography
            component="span"
            sx={{ ml: 0.5, px: 0.75, py: 0.1, borderRadius: '6px', backgroundColor: 'rgba(13,148,136,0.12)', color: '#0d9488', fontSize: 11, fontWeight: 700 }}
          >
            Auto
          </Typography>
          {' '}และ Level (Impact × Likelihood)
        </Typography>
      </Stack>

      <Stack spacing={2} direction="row" sx={{ mb: 2, py: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: 'primary.main' }}>
              ช่วง A:
            </Typography>
            <DatePicker
              label="วันที่"
              value={firstDateA}
              onChange={handleFirstA}
              inputFormat="d MMMM yyyy"
              disableMaskedInput
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
            />
            <DatePicker
              label="ถึงวันที่"
              value={lastDateA}
              onChange={handleLastA}
              inputFormat="d MMMM yyyy"
              disableMaskedInput
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
            />

            <Autocomplete
              options={MedErrorTypeAll}
              value={selectedErrorType}
              onChange={handleErrTypeChange}
              getOptionLabel={(option) => (option ? option.error_type_name : '')}
              isOptionEqualToValue={(option, value) => option?.error_type === value?.error_type}
              size="small"
              sx={{ width: 280 }}
              disableClearable
              renderInput={(params) => (
                <TextField {...params} label="ประเภท Error *" placeholder="เลือก 1 ประเภท" />
              )}
            />

            <FormControlLabel
              sx={{ ml: 1 }}
              control={<Switch size="small" checked={compareMode} onChange={handleCompareToggle} />}
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>เปรียบเทียบช่วง B</Typography>}
            />

            {compareMode && (
              <>
                <Typography variant="body2" sx={{ fontWeight: 600, ml: 1, color: 'warning.dark' }}>
                  ช่วง B:
                </Typography>
                <DatePicker
                  label="วันที่"
                  value={firstDateB}
                  onChange={handleFirstB}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
                />
                <DatePicker
                  label="ถึงวันที่"
                  value={lastDateB}
                  onChange={handleLastB}
                  inputFormat="d MMMM yyyy"
                  disableMaskedInput
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} readOnly />}
                />
              </>
            )}
          </Box>
        </LocalizationProvider>
      </Stack>

      {incompleteImpactCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<Iconify icon="eva:alert-triangle-outline" />}>
          มี {incompleteImpactCount} รายการที่ยังไม่ได้ระบุ <b>Impact</b> → คอลัมน์ Level จะแสดง &quot;—&quot;.
          กรุณาไปที่หน้า <b>&quot;ข้อมูลประเภท Error&quot;</b> เพื่อกำหนดคะแนน Impact
          <br />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
            * Likelihood คำนวณอัตโนมัติจากจำนวนครั้ง (ช่วง A) ตามเกณฑ์ที่ตั้งไว้ในหน้า <b>&quot;เกณฑ์ Likelihood&quot;</b>
          </Typography>
        </Alert>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="column">
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            {errorTypeName || (selectedErrorType?.error_type_name ?? '')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ช่วง A: {periodALabel}
            {isCompareResult && (
              <>
                {' '}| ช่วง B: <b style={{ color: '#ed6c02' }}>{periodBLabel}</b>
              </>
            )}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:file-text-fill" />}
          onClick={handleExportExcel}
          disabled={_.isEmpty(enrichedRows)}
          color={_.isEmpty(enrichedRows) ? 'inherit' : 'primary'}
        >
          Export Excel
        </Button>
      </Stack>

      <Scrollbar>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell rowSpan={2} sx={{ minWidth: 280 }}>
                  รายละเอียด Error
                </StyledTableCell>
                <StyledTableCell colSpan={3} align="center">
                  ช่วง A
                </StyledTableCell>
                {isCompareResult && (
                  <>
                    <StyledTableCell colSpan={3} align="center" sx={{ backgroundColor: '#ed6c02' }}>
                      ช่วง B
                    </StyledTableCell>
                    <StyledTableCell rowSpan={2} align="center">
                      Δ%
                    </StyledTableCell>
                  </>
                )}
                <StyledTableCell rowSpan={2} align="center">
                  Impact
                </StyledTableCell>
                <StyledTableCell rowSpan={2} align="center">
                  <Stack alignItems="center" spacing={0.25}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Likelihood</Typography>
                    <Typography
                      sx={{
                        fontSize: 9.5,
                        px: 0.5,
                        py: 0.05,
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        color: '#fff',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      AUTO
                    </Typography>
                  </Stack>
                </StyledTableCell>
                <StyledTableCell rowSpan={2} align="center">
                  Level
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell align="center">HAD</StyledTableCell>
                <StyledTableCell align="center">Non-HAD</StyledTableCell>
                <StyledTableCell align="center">รวม</StyledTableCell>
                {isCompareResult && (
                  <>
                    <StyledTableCell align="center" sx={{ backgroundColor: '#ed6c02' }}>HAD</StyledTableCell>
                    <StyledTableCell align="center" sx={{ backgroundColor: '#ed6c02' }}>Non-HAD</StyledTableCell>
                    <StyledTableCell align="center" sx={{ backgroundColor: '#ed6c02' }}>รวม</StyledTableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isCompareResult ? 11 : 7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={22} sx={{ mr: 1 }} />
                    <Typography variant="body2" component="span">กำลังโหลดข้อมูล...</Typography>
                  </TableCell>
                </TableRow>
              ) : _.isEmpty(enrichedRows) ? (
                <TableRow>
                  <TableCell colSpan={isCompareResult ? 11 : 7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      ไม่มีข้อมูล / กรุณาเลือกประเภท Error แล้วเลือกช่วงวันที่
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {enrichedRows.map((r) => (
                    <TableRow key={r.type_id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {r.error_type_list} {r.error_type_list_detail}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{r.hadA || ''}</TableCell>
                      <TableCell align="center">{r.nonHadA || ''}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{r.totalA || ''}</TableCell>
                      {isCompareResult && (
                        <>
                          <TableCell align="center" sx={{ backgroundColor: '#fff8e1' }}>{r.hadB || ''}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: '#fff8e1' }}>{r.nonHadB || ''}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: '#fff8e1' }}>{r.totalB || ''}</TableCell>
                          <TableCell align="center" sx={deltaCellStyle(r.deltaPct)}>{formatDeltaPct(r.deltaPct)}</TableCell>
                        </>
                      )}
                      <TableCell align="center">{r.impact ?? '—'}</TableCell>
                      <TableCell align="center">
                        <LikelihoodChip score={r.likelihood} />
                      </TableCell>
                      <TableCell align="center">
                        <LevelChip impact={r.impact} likelihood={r.likelihood} level={r.level} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* แถว ผลรวม */}
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>ผลรวม</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{totalsRow.hadA}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{totalsRow.nonHadA}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{totalsRow.totalA}</TableCell>
                    {isCompareResult && (
                      <>
                        <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: '#fff3e0' }}>{totalsRow.hadB}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: '#fff3e0' }}>{totalsRow.nonHadB}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, backgroundColor: '#fff3e0' }}>{totalsRow.totalB}</TableCell>
                        <TableCell align="center" sx={deltaCellStyle(totalsDeltaPct)}>{formatDeltaPct(totalsDeltaPct)}</TableCell>
                      </>
                    )}
                    <TableCell align="center">—</TableCell>
                    <TableCell align="center">—</TableCell>
                    <TableCell align="center">—</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <RiskAssessmentMatrix />
    </Box>
  );
};

export default ReportSummary9;
