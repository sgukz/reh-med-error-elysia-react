import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getReportSummary10, saveStatVolume } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// Constants & helpers
// ============================================================================
const MONTH_LABELS = {
  1: 'มค.', 2: 'กพ.', 3: 'มีค.', 4: 'เมย.', 5: 'พค.', 6: 'มิย.',
  7: 'กค.', 8: 'สค.', 9: 'กย.', 10: 'ตค.', 11: 'พย.', 12: 'ธค.',
};
// ลำดับปีงบ ตค.→กย.
const FISCAL_MONTH_ORDER = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ERROR_TYPES = [
  { id: 1, name: 'Prescription Error', short: 'Prescription' },
  { id: 2, name: 'Dispensing Error', short: 'Dispensing' },
  { id: 3, name: 'Pre-Administration Error', short: 'Pre-Admin' },
  { id: 4, name: 'Administration Error', short: 'Admin' },
  { id: 5, name: 'Processing Error', short: 'Processing' },
  { id: 6, name: 'Transcribing Error', short: 'Transcribing' },
];

// แปลง month → ปี ค.ศ. ตามปีงบประมาณ พ.ศ.
// ตค./พย./ธค. = ปี ค.ศ. (พ.ศ. - 543 - 1), มค.-กย. = ปี ค.ศ. (พ.ศ. - 543)
const fiscalMonthsWithYear = (fiscalYearBE) => {
  const ceStart = fiscalYearBE - 543 - 1;
  const ceEnd = fiscalYearBE - 543;
  return FISCAL_MONTH_ORDER.map((m) => ({
    month: m,
    year: m >= 10 ? ceStart : ceEnd,
    label: MONTH_LABELS[m],
  }));
};

// อัตรา: count × 1000 / volume (2 ทศนิยม)
const calcRate = (count, volume) => {
  const v = Number(volume) || 0;
  if (v === 0) return '0.00';
  return ((Number(count) * 1000) / v).toFixed(2);
};

// Build O(1) lookup Map จาก errorCounts → key: `${type}-${year}-${month}-${ward}`
// เรียกครั้งเดียวต่อ render แทนที่จะ .find() ทุก cell (O(n²) → O(n))
const buildCountsMap = (errorCounts) => {
  const map = new Map();
  (errorCounts || []).forEach((r) => {
    const key = `${Number(r.error_type)}-${Number(r.error_year)}-${Number(r.error_month)}-${r.ward_group}`;
    map.set(key, {
      had: Number(r.had_count) || 0,
      nonHad: Number(r.non_had_count) || 0,
      total: Number(r.total_count) || 0,
    });
  });
  return map;
};
const EMPTY_COUNT = { had: 0, nonHad: 0, total: 0 };

// ============================================================================
// Styled
// ============================================================================
const StyledHeadCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    color: '#fff',
    borderColor: '#fff',
    fontWeight: 700,
    fontSize: 12,
    padding: '6px 8px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
}));

const BodyCell = styled(TableCell)(() => ({
  fontSize: 12,
  padding: '4px 8px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
}));

// สีหัวตาราง
const COLOR = {
  TABLE0: '#1976d2',     // primary blue
  TABLE_IPD: '#4f46e5',  // indigo
  TABLE_OPD: '#0d9488',  // teal
  TABLE_SUM: '#ed6c02',  // orange
};

// ============================================================================
// Main component
// ============================================================================
const ReportSummary10 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = Number(user?.rule) === 9;

  // ปีงบประมาณ default = ปีงบปัจจุบัน (ตค-กย)
  const nowBE = dayjs().year() + 543;
  const defaultFiscalYear = dayjs().month() + 1 >= 10 ? nowBE + 1 : nowBE;

  const [fiscalYear, setFiscalYear] = useState(defaultFiscalYear);
  const [token, setToken] = useState(null);
  const [statVolume, setStatVolume] = useState([]); // 12 rows (ตค.-กย.)
  const [errorCounts, setErrorCounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // {type, msg}

  // editable state สำหรับ TABLE 0 ฝั่งแอดมิน
  const [editValues, setEditValues] = useState({}); // key: 'year-month' → { ipd, opd }

  const months = useMemo(() => fiscalMonthsWithYear(fiscalYear), [fiscalYear]);

  // O(1) lookups — สร้างครั้งเดียวต่อ errorCounts/statVolume เปลี่ยน แทน .find() ทุก cell
  const countsMap = useMemo(() => buildCountsMap(errorCounts), [errorCounts]);
  const volumeMap = useMemo(() => {
    const map = new Map();
    statVolume.forEach((r) => {
      map.set(`${Number(r.stat_year)}-${Number(r.stat_month)}`, {
        ipd: Number(r.ipd_patient_days) || 0,
        opd: Number(r.opd_prescriptions) || 0,
      });
    });
    return map;
  }, [statVolume]);

  // pre-compute totals ของ TABLE A/B ต่อ ward_group + per-month sums
  // ผลลัพธ์: { IPD: { perCell: {[type-month]: counts}, perMonth: {month: counts}, perType: {type: counts}, grand: counts },
  //           OPD: ...same structure }
  const aggregates = useMemo(() => {
    const result = { IPD: null, OPD: null };
    ['IPD', 'OPD'].forEach((wg) => {
      const perCell = new Map(); // key: `${type}-${month}` → counts (single render lookup)
      const perMonth = new Map(); // key: month → { had, nonHad, total }
      const perType = new Map(); // key: type → { had, nonHad, total }
      const grand = { had: 0, nonHad: 0, total: 0 };

      ERROR_TYPES.forEach((et) => {
        const typeAgg = { had: 0, nonHad: 0, total: 0 };
        months.forEach(({ month, year }) => {
          const c = countsMap.get(`${et.id}-${year}-${month}-${wg}`) || EMPTY_COUNT;
          perCell.set(`${et.id}-${month}`, c);
          typeAgg.had += c.had;
          typeAgg.nonHad += c.nonHad;
          typeAgg.total += c.total;

          const monthAgg = perMonth.get(month) || { had: 0, nonHad: 0, total: 0 };
          monthAgg.had += c.had;
          monthAgg.nonHad += c.nonHad;
          monthAgg.total += c.total;
          perMonth.set(month, monthAgg);

          grand.had += c.had;
          grand.nonHad += c.nonHad;
          grand.total += c.total;
        });
        perType.set(et.id, typeAgg);
      });
      result[wg] = { perCell, perMonth, perType, grand };
    });
    return result;
  }, [countsMap, months]);

  // ตัวเลือกปีงบประมาณ (ย้อนหลัง 5 ปี + ปีหน้า)
  const fiscalYearOptions = useMemo(() => {
    const arr = [];
    for (let y = defaultFiscalYear + 1; y >= defaultFiscalYear - 4; y -= 1) arr.push(y);
    return arr;
  }, [defaultFiscalYear]);

  // โหลดข้อมูล — เคลียร์ state เก่าก่อน fetch เพื่อกัน flash ของข้อมูลปีก่อน
  const loadAll = useCallback(async (authToken, fy) => {
    if (!authToken) return;
    setIsLoading(true);
    setStatVolume([]);
    setErrorCounts([]);
    setEditValues({});
    try {
      const res = await getReportSummary10(authToken, { fiscalYear: fy });
      const data = res?.data ?? {};
      if (data.statusCode === 200) {
        setStatVolume(data.statVolume || []);
        setErrorCounts(data.errorCounts || []);
        // sync editValues จาก statVolume
        const ev = {};
        (data.statVolume || []).forEach((r) => {
          ev[`${r.stat_year}-${r.stat_month}`] = {
            ipd: r.ipd_patient_days || 0,
            opd: r.opd_prescriptions || 0,
          };
        });
        setEditValues(ev);
      }
    } catch (_e) {
      // state เคลียร์แล้วตอนต้นฟังก์ชัน
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const verify = await verifyToken(null);
      const { statusCode, profile, access_token } = verify ?? {};
      if (statusCode === 200 && profile && access_token) {
        setToken(access_token);
        loadAll(access_token, defaultFiscalYear);
      } else {
        navigate('/login', { replace: true });
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiscalYearChange = (e) => {
    const fy = Number(e.target.value);
    setFiscalYear(fy);
    setSaveStatus(null);
    loadAll(token, fy);
  };

  const handleEditCell = (year, month, field, value) => {
    const key = `${year}-${month}`;
    // sanitize: empty = '', อื่นๆ = Number >= 0 (กันค่าลบ)
    let safe;
    if (value === '' || value === null || value === undefined) {
      safe = '';
    } else {
      const n = Number(value);
      safe = Number.isFinite(n) && n >= 0 ? n : 0;
    }
    setEditValues((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { ipd: 0, opd: 0 }),
        [field]: safe,
      },
    }));
  };

  const handleSaveStatVolume = async () => {
    if (!isAdmin || !token) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const rows = months.map(({ month, year }) => {
        const v = editValues[`${year}-${month}`] || { ipd: 0, opd: 0 };
        // กันค่าลบฝั่ง client ก่อนส่ง (backend ก็ตรวจอีกชั้น)
        const ipd = Math.max(0, Number(v.ipd) || 0);
        const opd = Math.max(0, Number(v.opd) || 0);
        return {
          stat_month: month,
          ipd_patient_days: ipd,
          opd_prescriptions: opd,
        };
      });
      const res = await saveStatVolume(token, { fiscalYear, rows });
      if (res.data?.statusCode === 200) {
        setSaveStatus({ type: 'success', msg: `บันทึกสำเร็จ (${res.data.affected} แถว)` });
        setStatVolume(res.data.statVolume || []);
      } else {
        setSaveStatus({ type: 'error', msg: res.data?.statusMessage || 'ไม่สามารถบันทึกได้' });
      }
    } catch (e) {
      const msg = e?.response?.status === 403
        ? 'สิทธิ์ไม่เพียงพอ (เฉพาะ Admin)'
        : (e?.response?.data?.statusMessage || 'เกิดข้อผิดพลาดในการบันทึก');
      setSaveStatus({ type: 'error', msg });
    } finally {
      setIsSaving(false);
    }
  };

  // ค่าใน TABLE 0 ที่จะแสดง — admin ใช้ editValues, user ใช้ volumeMap (O(1) lookup)
  const getCellValue = useCallback((year, month, field) => {
    if (isAdmin) {
      const v = editValues[`${year}-${month}`];
      return v ? v[field] : 0;
    }
    const r = volumeMap.get(`${year}-${month}`);
    return r ? r[field] : 0;
  }, [isAdmin, editValues, volumeMap]);

  // sum รายเดือนของ TABLE 0 (cached — ไม่ recompute ทุก render ถ้า dependency ไม่เปลี่ยน)
  const { sumIpd, sumOpd } = useMemo(() => {
    let ipd = 0;
    let opd = 0;
    months.forEach((m) => {
      ipd += Number(getCellValue(m.year, m.month, 'ipd') || 0);
      opd += Number(getCellValue(m.year, m.month, 'opd') || 0);
    });
    return { sumIpd: ipd, sumOpd: opd };
  }, [months, getCellValue]);

  // ============================================================================
  // Excel Export — 4 sheets
  // ============================================================================
  const handleExportExcel = () => {
    if (isLoading) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: TABLE 0
    const sheet0Data = [
      ['รายการ', ...months.map((m) => m.label), 'รวม'],
      [
        'จำนวนวันนอน (IPD)',
        ...months.map((m) => Number(getCellValue(m.year, m.month, 'ipd') || 0)),
        sumIpd,
      ],
      [
        'จำนวนใบสั่งยา (OPD)',
        ...months.map((m) => Number(getCellValue(m.year, m.month, 'opd') || 0)),
        sumOpd,
      ],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet0Data), 'TABLE 0 ปริมาณ');

    // Sheet 2 + 3: TABLE A (IPD) + TABLE B (OPD) — ใช้ aggregates ที่ pre-computed แล้ว
    const buildErrorSheet = (wardGroup) => {
      const agg = aggregates[wardGroup];
      const header1 = ['ประเภท Error'];
      const header2 = [''];
      months.forEach((m) => {
        header1.push(m.label, '', '');
        header2.push('HAD', 'Non-HAD', 'รวม');
      });
      header1.push('รวมทั้งหมด', '', '');
      header2.push('HAD', 'Non-HAD', 'รวม');

      const rows = ERROR_TYPES.map((et) => {
        const cells = [et.name];
        months.forEach((m) => {
          const c = agg.perCell.get(`${et.id}-${m.month}`) || EMPTY_COUNT;
          cells.push(c.had, c.nonHad, c.total);
        });
        const tAgg = agg.perType.get(et.id) || EMPTY_COUNT;
        cells.push(tAgg.had, tAgg.nonHad, tAgg.total);
        return cells;
      });

      // แถวผลรวม — ใช้ perMonth + grand
      const totalRow = ['ผลรวม'];
      months.forEach((m) => {
        const mAgg = agg.perMonth.get(m.month) || EMPTY_COUNT;
        totalRow.push(mAgg.had, mAgg.nonHad, mAgg.total);
      });
      totalRow.push(agg.grand.had, agg.grand.nonHad, agg.grand.total);

      return [header1, header2, ...rows, totalRow];
    };
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildErrorSheet('IPD')), 'TABLE A IPD');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildErrorSheet('OPD')), 'TABLE B OPD');

    // Sheet 4: TABLE C — 4 sections
    const sectionsForC = [
      { title: 'IPD (Non-HAD) อัตรา/1,000 วันนอน', wardGroup: 'IPD', alertField: 'nonHad', volumeField: 'ipd' },
      { title: 'IPD-HAD อัตรา/1,000 วันนอน', wardGroup: 'IPD', alertField: 'had', volumeField: 'ipd' },
      { title: 'OPD (Non-HAD) อัตรา/1,000 ใบสั่งยา', wardGroup: 'OPD', alertField: 'nonHad', volumeField: 'opd' },
      { title: 'OPD-HAD อัตรา/1,000 ใบสั่งยา', wardGroup: 'OPD', alertField: 'had', volumeField: 'opd' },
    ];
    const sheetC = [];
    sectionsForC.forEach((sec) => {
      const agg = aggregates[sec.wardGroup];
      sheetC.push([sec.title]);
      sheetC.push(['ประเภท Error', ...months.map((m) => m.label)]);
      ERROR_TYPES.forEach((et) => {
        const cells = [et.name];
        months.forEach((m) => {
          const c = agg.perCell.get(`${et.id}-${m.month}`) || EMPTY_COUNT;
          const volume = Number(getCellValue(m.year, m.month, sec.volumeField) || 0);
          cells.push(calcRate(c[sec.alertField], volume));
        });
        sheetC.push(cells);
      });
      sheetC.push([]); // blank row
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetC), 'TABLE C สูตร');

    const fileName = `รายงานสถิติใบสั่งยา_วันนอน_ปีงบ${fiscalYear}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ============================================================================
  // Render helpers
  // ============================================================================
  const renderTable0 = () => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: COLOR.TABLE0 }}>
          <TableRow>
            <StyledHeadCell sx={{ minWidth: 180, textAlign: 'left' }}>รายการ</StyledHeadCell>
            {months.map((m) => (
              <StyledHeadCell key={`h0-${m.month}`}>{m.label}</StyledHeadCell>
            ))}
            <StyledHeadCell sx={{ backgroundColor: '#0d47a1' }}>รวม</StyledHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { field: 'ipd', label: 'จำนวนวันนอน (IPD)', sum: sumIpd },
            { field: 'opd', label: 'จำนวนใบสั่งยา (OPD)', sum: sumOpd },
          ].map((row) => (
            <TableRow key={row.field}>
              <BodyCell sx={{ textAlign: 'left', fontWeight: 600 }}>{row.label}</BodyCell>
              {months.map((m) => {
                const key = `${m.year}-${m.month}`;
                const value = isAdmin
                  ? (editValues[key]?.[row.field] ?? '')
                  : getCellValue(m.year, m.month, row.field);
                return (
                  <BodyCell key={`v-${row.field}-${m.month}`} sx={{ minWidth: 90, padding: '2px 4px' }}>
                    {isAdmin ? (
                      <TextField
                        size="small"
                        type="number"
                        value={value === 0 ? '' : value}
                        placeholder="0"
                        onChange={(e) => handleEditCell(m.year, m.month, row.field, e.target.value)}
                        inputProps={{ style: { textAlign: 'right', padding: '4px 6px', fontSize: 12 }, min: 0 }}
                        sx={{ width: 80 }}
                      />
                    ) : (
                      Number(value).toLocaleString()
                    )}
                  </BodyCell>
                );
              })}
              <BodyCell sx={{ fontWeight: 700, backgroundColor: '#e3f2fd' }}>
                {row.sum.toLocaleString()}
              </BodyCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderErrorTable = (wardGroup, title, headColor) => {
    const agg = aggregates[wardGroup]; // pre-computed: perCell / perMonth / perType / grand
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: headColor }}>
          {title}
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: headColor }}>
              <TableRow>
                <StyledHeadCell rowSpan={2} sx={{ minWidth: 160, textAlign: 'left' }}>
                  ประเภท Error
                </StyledHeadCell>
                {months.map((m) => (
                  <StyledHeadCell key={`et-${wardGroup}-${m.month}`} colSpan={3}>{m.label}</StyledHeadCell>
                ))}
                <StyledHeadCell colSpan={3} sx={{ backgroundColor: '#37474f' }}>รวมทั้งหมด</StyledHeadCell>
              </TableRow>
              <TableRow>
                {months.map((m) => (
                  <React.Fragment key={`sub-${wardGroup}-${m.month}`}>
                    <StyledHeadCell>HAD</StyledHeadCell>
                    <StyledHeadCell>Non</StyledHeadCell>
                    <StyledHeadCell>รวม</StyledHeadCell>
                  </React.Fragment>
                ))}
                <StyledHeadCell sx={{ backgroundColor: '#37474f' }}>HAD</StyledHeadCell>
                <StyledHeadCell sx={{ backgroundColor: '#37474f' }}>Non</StyledHeadCell>
                <StyledHeadCell sx={{ backgroundColor: '#37474f' }}>รวม</StyledHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ERROR_TYPES.map((et) => {
                const typeAgg = agg.perType.get(et.id) || EMPTY_COUNT;
                return (
                  <TableRow key={`row-${wardGroup}-${et.id}`} hover>
                    <BodyCell sx={{ textAlign: 'left', fontWeight: 600 }}>{et.name}</BodyCell>
                    {months.map((m) => {
                      const c = agg.perCell.get(`${et.id}-${m.month}`) || EMPTY_COUNT;
                      return (
                        <React.Fragment key={`c-${wardGroup}-${et.id}-${m.month}`}>
                          <BodyCell>{c.had || ''}</BodyCell>
                          <BodyCell>{c.nonHad || ''}</BodyCell>
                          <BodyCell sx={{ fontWeight: 600 }}>{c.total || ''}</BodyCell>
                        </React.Fragment>
                      );
                    })}
                    <BodyCell sx={{ backgroundColor: '#eceff1', fontWeight: 700 }}>{typeAgg.had}</BodyCell>
                    <BodyCell sx={{ backgroundColor: '#eceff1', fontWeight: 700 }}>{typeAgg.nonHad}</BodyCell>
                    <BodyCell sx={{ backgroundColor: '#cfd8dc', fontWeight: 800 }}>{typeAgg.total}</BodyCell>
                  </TableRow>
                );
              })}
              {/* ผลรวมตามเดือน — ใช้ perMonth + grand ที่ pre-computed แล้ว */}
              <TableRow sx={{ backgroundColor: '#fafafa' }}>
                <BodyCell sx={{ textAlign: 'left', fontWeight: 800 }}>ผลรวม</BodyCell>
                {months.map((m) => {
                  const mAgg = agg.perMonth.get(m.month) || EMPTY_COUNT;
                  return (
                    <React.Fragment key={`sum-${wardGroup}-${m.month}`}>
                      <BodyCell sx={{ fontWeight: 700 }}>{mAgg.had || ''}</BodyCell>
                      <BodyCell sx={{ fontWeight: 700 }}>{mAgg.nonHad || ''}</BodyCell>
                      <BodyCell sx={{ fontWeight: 800 }}>{mAgg.total || ''}</BodyCell>
                    </React.Fragment>
                  );
                })}
                <BodyCell sx={{ backgroundColor: '#90a4ae', fontWeight: 800, color: '#fff' }}>{agg.grand.had}</BodyCell>
                <BodyCell sx={{ backgroundColor: '#90a4ae', fontWeight: 800, color: '#fff' }}>{agg.grand.nonHad}</BodyCell>
                <BodyCell sx={{ backgroundColor: '#546e7a', fontWeight: 900, color: '#fff' }}>{agg.grand.total}</BodyCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderTableC = () => {
    const sections = [
      { title: 'IPD (Non-HAD) — อัตราต่อ 1,000 วันนอน', wardGroup: 'IPD', alertField: 'nonHad', volumeField: 'ipd' },
      { title: 'IPD-HAD — อัตราต่อ 1,000 วันนอน', wardGroup: 'IPD', alertField: 'had', volumeField: 'ipd' },
      { title: 'OPD (Non-HAD) — อัตราต่อ 1,000 ใบสั่งยา', wardGroup: 'OPD', alertField: 'nonHad', volumeField: 'opd' },
      { title: 'OPD-HAD — อัตราต่อ 1,000 ใบสั่งยา', wardGroup: 'OPD', alertField: 'had', volumeField: 'opd' },
    ];
    return sections.map((sec) => {
      const agg = aggregates[sec.wardGroup];
      return (
        <Box key={sec.title} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: COLOR.TABLE_SUM }}>
            {sec.title}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: COLOR.TABLE_SUM }}>
                <TableRow>
                  <StyledHeadCell sx={{ minWidth: 200, textAlign: 'left' }}>ประเภท Error</StyledHeadCell>
                  {months.map((m) => (
                    <StyledHeadCell key={`c-${sec.title}-${m.month}`}>{m.label}</StyledHeadCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {ERROR_TYPES.map((et) => (
                  <TableRow key={`c-row-${sec.title}-${et.id}`} hover>
                    <BodyCell sx={{ textAlign: 'left', fontWeight: 600 }}>{et.name}</BodyCell>
                    {months.map((m) => {
                      const c = agg.perCell.get(`${et.id}-${m.month}`) || EMPTY_COUNT;
                      const volume = Number(getCellValue(m.year, m.month, sec.volumeField) || 0);
                      const rate = calcRate(c[sec.alertField], volume);
                      const isZero = rate === '0.00';
                      return (
                        <BodyCell
                          key={`c-cell-${sec.title}-${et.id}-${m.month}`}
                          sx={{ color: isZero ? '#bdbdbd' : '#212121', fontWeight: isZero ? 400 : 600 }}
                        >
                          {rate}
                        </BodyCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    });
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="column">
          <Typography variant="h6">รายงานสถิติจำนวนใบสั่งยา / วันนอน</Typography>
          <Typography variant="body2" color="text.secondary">
            ปีงบประมาณ {fiscalYear} (ตค. {fiscalYear - 1} – กย. {fiscalYear})
            {isAdmin && ' • โหมด Admin (กรอกข้อมูลปริมาณได้)'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="fy-label">ปีงบประมาณ</InputLabel>
            <Select labelId="fy-label" label="ปีงบประมาณ" value={fiscalYear} onChange={handleFiscalYearChange}>
              {fiscalYearOptions.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:file-text-fill" />}
            onClick={handleExportExcel}
            disabled={isLoading}
            color={isLoading ? 'inherit' : 'primary'}
          >
            Export Excel
          </Button>
        </Stack>
      </Stack>

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          ข้อมูลปริมาณ (TABLE 0) แก้ไขได้เฉพาะ Admin (rule=9) เท่านั้น
        </Alert>
      )}

      {saveStatus && (
        <Alert severity={saveStatus.type} sx={{ mb: 2 }} onClose={() => setSaveStatus(null)}>
          {saveStatus.msg}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">กำลังโหลดข้อมูล...</Typography>
        </Box>
      )}

      {/* TABLE 0 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLOR.TABLE0 }}>
          TABLE 0 — ข้อมูลปริมาณรายเดือน (ตค.{fiscalYear - 1} – กย.{fiscalYear})
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Iconify icon="eva:save-fill" />}
            onClick={handleSaveStatVolume}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก TABLE 0'}
          </Button>
        )}
      </Stack>
      <Scrollbar>{renderTable0()}</Scrollbar>

      <Divider sx={{ my: 2 }} />

      {/* TABLE A — IPD */}
      <Scrollbar>{renderErrorTable('IPD', 'TABLE A — Error Count (IPD)', COLOR.TABLE_IPD)}</Scrollbar>

      {/* TABLE B — OPD */}
      <Scrollbar>{renderErrorTable('OPD', 'TABLE B — Error Count (OPD)', COLOR.TABLE_OPD)}</Scrollbar>

      <Divider sx={{ my: 2 }} />

      {/* TABLE C */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: COLOR.TABLE_SUM }}>
        TABLE C — อัตราความคลาดเคลื่อนต่อ 1,000 วันนอน / ใบสั่งยา
      </Typography>
      <Scrollbar>{renderTableC()}</Scrollbar>
    </Box>
  );
};

export default ReportSummary10;
