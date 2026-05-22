import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { styled, alpha } from '@mui/material/styles';

// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// components
import Iconify from '../components/iconify';

// API
import { getLikelihoodCriteria, updateLikelihoodCriteria } from '../libs/MedError';
import { verifyToken } from '../libs/Auth';

// ============================================================================
// Toast
// ============================================================================
const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', MySwal.stopTimer);
    toast.addEventListener('mouseleave', MySwal.resumeTimer);
  },
});

// ============================================================================
// Constants
// ============================================================================
// แยกเกณฑ์ Likelihood เป็น 6 ตารางตามประเภท Error (error_type 1-6)
const ERROR_TYPE_CONFIG = {
  1: {
    title: 'ประเภทที่ 1',
    short: 'Prescription',
    detail: 'การสั่งใช้ยา',
    iconColor: '#0d9488',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  },
  2: {
    title: 'ประเภทที่ 2',
    short: 'Dispensing',
    detail: 'การจ่ายยา',
    iconColor: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  },
  3: {
    title: 'ประเภทที่ 3',
    short: 'Pre-Administration',
    detail: 'ก่อนให้ยา',
    iconColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
  },
  4: {
    title: 'ประเภทที่ 4',
    short: 'Administration',
    detail: 'การให้ยา',
    iconColor: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  },
  5: {
    title: 'ประเภทที่ 5',
    short: 'Processing',
    detail: 'การคีย์ / จัดเตรียม',
    iconColor: '#16a34a',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
  },
  6: {
    title: 'ประเภทที่ 6',
    short: 'Transcribing',
    detail: 'การคัดลอกคำสั่ง',
    iconColor: '#db2777',
    gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
  },
};

const ERROR_TYPE_IDS = [1, 2, 3, 4, 5, 6];

// score → label / color
const SCORE_META = {
  5: { label: 'Frequent', th: 'เกิดบ่อยมาก', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
  4: { label: 'Likely', th: 'เกิดบ่อย', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.08)' },
  3: { label: 'Possible', th: 'อาจเกิด', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.10)' },
  2: { label: 'Unlikely', th: 'ไม่ค่อยเกิด', color: '#65a30d', bg: 'rgba(101, 163, 13, 0.08)' },
  1: { label: 'Rare', th: 'เกิดน้อย', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
  0: { label: 'Never', th: 'ไม่เกิดเลย', color: '#64748b', bg: 'rgba(100, 116, 139, 0.06)' },
};

const scoreMeta = (score) => SCORE_META[score] || { label: `${score}`, th: '', color: '#64748b', bg: 'rgba(100,116,139,0.06)' };

// ============================================================================
// Styled
// ============================================================================
const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderColor: theme.palette.common.white,
    fontWeight: 700,
    fontSize: 13,
    padding: '10px 12px',
    whiteSpace: 'nowrap',
  },
}));

const BodyCell = styled(TableCell)(() => ({
  fontSize: 13,
  padding: '10px 12px',
  borderBottom: '1px solid rgba(145, 158, 171, 0.12)',
}));

// ============================================================================
// Score Pill — แสดง score + label (ภาษาอังกฤษ + ไทย)
// ============================================================================
const ScorePill = ({ score }) => {
  const meta = scoreMeta(score);
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 16,
          color: '#fff',
          background: meta.color,
          boxShadow: `0 4px 10px -4px ${alpha(meta.color, 0.6)}`,
          flexShrink: 0,
        }}
      >
        {score}
      </Box>
      <Stack spacing={0} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: meta.color, lineHeight: 1.1 }}>
          {meta.label}
        </Typography>
        {meta.th && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }}>
            {meta.th}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

ScorePill.propTypes = { score: PropTypes.number.isRequired };

// ============================================================================
// Range Bar — แสดง visual ของช่วง min-max แต่ละ level
// ============================================================================
const RangeBar = ({ items }) => {
  // หา max ที่จะใช้แสดง (เอา max_freq สูงสุด หรือ min_freq ของระดับ 5 + 50%)
  const positive = items.filter((it) => it.level_score > 0);
  const maxFreqVals = positive.map((it) => Number.isFinite(Number(it.max_freq)) ? Number(it.max_freq) : 0);
  const minFreqVals = positive.map((it) => Number.isFinite(Number(it.min_freq)) ? Number(it.min_freq) : 0);
  const baseMax = Math.max(...maxFreqVals, ...minFreqVals, 1);
  const displayMax = Math.max(Math.ceil(baseMax * 1.25), baseMax + 5);

  return (
    <Box sx={{ px: 1, pt: 1, pb: 2 }}>
      <Box sx={{ position: 'relative', height: 28, borderRadius: '10px', overflow: 'hidden', backgroundColor: 'rgba(148, 163, 184, 0.10)' }}>
        {positive
          .slice()
          .sort((a, b) => a.level_score - b.level_score)
          .map((it) => {
            const meta = scoreMeta(it.level_score);
            const min = Number(it.min_freq) || 0;
            const max = it.max_freq === null || it.max_freq === undefined ? displayMax : Number(it.max_freq);
            const left = (min / displayMax) * 100;
            const width = Math.max(0, ((max - min + 1) / displayMax) * 100);
            return (
              <Tooltip
                key={it.level_score}
                title={`${meta.label} (${it.level_score}) : ${min}${it.max_freq === null ? '+' : `–${max}`}`}
                arrow
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${left}%`,
                    width: `${width}%`,
                    background: meta.color,
                    opacity: 0.85,
                    transition: 'all 0.25s ease',
                    '&:hover': { opacity: 1, filter: 'brightness(1.1)' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {width > 8 ? it.level_score : ''}
                </Box>
              </Tooltip>
            );
          })}
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">0</Typography>
        <Typography variant="caption" color="text.secondary">ความถี่ในช่วงเวลา (ครั้ง)</Typography>
        <Typography variant="caption" color="text.secondary">{displayMax}+</Typography>
      </Stack>
    </Box>
  );
};

RangeBar.propTypes = { items: PropTypes.array.isRequired };

// ============================================================================
// Validation — ตรวจ gap / overlap ของ ranges (เฉพาะ score > 0)
// คืน array ของ issue: { level, kind: 'gap'|'overlap'|'missing'|'invalid', msg }
// ============================================================================
const validateRanges = (items) => {
  const issues = [];
  if (!items || items.length === 0) return issues;

  const positive = items
    .filter((it) => it.level_score > 0)
    .slice()
    .sort((a, b) => a.level_score - b.level_score); // 1,2,3,4,5

  // missing min_freq
  positive.forEach((it) => {
    if (it.min_freq === null || it.min_freq === undefined || Number.isNaN(Number(it.min_freq))) {
      issues.push({ level: it.level_score, kind: 'missing', msg: `Level ${it.level_score}: ต้องระบุความถี่ขั้นต่ำ` });
    }
  });

  // each row: min <= max (ถ้า max มี)
  positive.forEach((it) => {
    if (it.max_freq !== null && it.max_freq !== undefined && Number.isFinite(Number(it.max_freq))) {
      if (Number(it.min_freq) > Number(it.max_freq)) {
        issues.push({ level: it.level_score, kind: 'invalid', msg: `Level ${it.level_score}: ขั้นต่ำ (${it.min_freq}) ห้ามมากกว่า สูงสุด (${it.max_freq})` });
      }
    }
  });

  // continuity: max of level N + 1 should equal min of level N+1
  for (let i = 0; i < positive.length - 1; i += 1) {
    const cur = positive[i];
    const nxt = positive[i + 1];
    if (cur.max_freq !== null && cur.max_freq !== undefined) {
      const curMax = Number(cur.max_freq);
      const nxtMin = Number(nxt.min_freq);
      if (!Number.isNaN(curMax) && !Number.isNaN(nxtMin)) {
        if (nxtMin > curMax + 1) {
          issues.push({
            level: nxt.level_score,
            kind: 'gap',
            msg: `Level ${cur.level_score} จบที่ ${curMax} แต่ Level ${nxt.level_score} เริ่มที่ ${nxtMin} → ขาด ${curMax + 1}–${nxtMin - 1}`,
          });
        } else if (nxtMin <= curMax) {
          issues.push({
            level: nxt.level_score,
            kind: 'overlap',
            msg: `Level ${cur.level_score} (${cur.min_freq}–${curMax}) ทับกับ Level ${nxt.level_score} (${nxtMin}+)`,
          });
        }
      }
    }
  }

  // top level (score 5) — should have max_freq = null (ไม่จำกัด)
  const top = positive.find((it) => it.level_score === 5);
  if (top && top.max_freq !== null && top.max_freq !== undefined) {
    issues.push({
      level: 5,
      kind: 'invalid',
      msg: `Level 5 ควรปล่อยช่องสูงสุดว่าง (ไม่จำกัด >=)`,
    });
  }

  return issues;
};

// ============================================================================
// Group Editor — สำหรับแต่ละ tab
// ============================================================================
const GroupEditor = ({ items, onChange }) => {
  const issues = useMemo(() => validateRanges(items), [items]);
  const issuesByLevel = useMemo(() => _.groupBy(issues, 'level'), [issues]);

  return (
    <Box>
      {/* Visual range bar */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid rgba(13, 148, 136, 0.15)',
          background: 'linear-gradient(135deg, rgba(240, 253, 250, 0.6) 0%, rgba(236, 253, 245, 0.4) 100%)',
          p: 2,
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Iconify icon="eva:bar-chart-2-fill" width={20} sx={{ color: '#0d9488' }} />
          <Typography sx={{ fontWeight: 700, color: '#0d9488', fontSize: 14 }}>
            ภาพรวมช่วงคะแนน (Visual)
          </Typography>
        </Stack>
        <RangeBar items={items} />
      </Paper>

      {/* Validation alerts */}
      {issues.length > 0 && (
        <Alert
          severity={issues.some((i) => i.kind === 'overlap' || i.kind === 'invalid' || i.kind === 'missing') ? 'error' : 'warning'}
          icon={<Iconify icon="eva:alert-triangle-fill" />}
          sx={{ mb: 2, borderRadius: '12px' }}
        >
          <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
            พบ {issues.length} ข้อผิดพลาด — แก้ไขก่อนบันทึก
          </AlertTitle>
          <Stack spacing={0.25}>
            {issues.map((iss, idx) => (
              <Typography key={idx} variant="caption" sx={{ display: 'block', fontSize: 12 }}>
                • {iss.msg}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '14px',
          border: '1px solid rgba(145, 158, 171, 0.12)',
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledHeadCell width="28%">ระดับคะแนน</StyledHeadCell>
              <StyledHeadCell align="center" width="22%">ความถี่ขั้นต่ำ</StyledHeadCell>
              <StyledHeadCell align="center" width="22%">ความถี่สูงสุด</StyledHeadCell>
              <StyledHeadCell width="28%">ช่วงครั้ง / สถานะ</StyledHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => {
              const meta = scoreMeta(item.level_score);
              const rowIssues = issuesByLevel[item.level_score] || [];
              const hasError = rowIssues.length > 0;
              const isZero = item.level_score === 0;
              const isMax = item.level_score === 5;
              const min = item.min_freq;
              const max = item.max_freq;

              let rangeText = '';
              if (isZero) rangeText = '0 ครั้ง';
              else if (min === null || min === undefined) rangeText = '—';
              else if (max === null || max === undefined) rangeText = `≥ ${min}`;
              else if (Number(min) === Number(max)) rangeText = `${min}`;
              else rangeText = `${min} – ${max}`;

              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    backgroundColor: hasError ? 'rgba(255, 72, 66, 0.04)' : meta.bg,
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <BodyCell><ScorePill score={item.level_score} /></BodyCell>
                  <BodyCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={min === null || min === undefined ? '' : min}
                      onChange={(e) => onChange(index, 'min_freq', e.target.value)}
                      inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 600 } }}
                      sx={{
                        width: 110,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          backgroundColor: '#fff',
                          '&:hover fieldset': { borderColor: '#5eead4' },
                          '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                        },
                      }}
                      disabled={isZero}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: 11 } }}>
                            ครั้ง
                          </InputAdornment>
                        ),
                      }}
                    />
                  </BodyCell>
                  <BodyCell align="center">
                    {isMax ? (
                      <Tooltip title="Level 5 ไม่จำกัดสูงสุด (>=) — ปล่อยว่างเสมอ" arrow>
                        <Chip
                          label="∞ ไม่จำกัด"
                          size="small"
                          sx={{
                            backgroundColor: alpha('#dc2626', 0.08),
                            color: '#dc2626',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: `1px solid ${alpha('#dc2626', 0.3)}`,
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <TextField
                        type="number"
                        size="small"
                        value={max === null || max === undefined ? '' : max}
                        onChange={(e) => onChange(index, 'max_freq', e.target.value)}
                        inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 600 } }}
                        sx={{
                          width: 110,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#fff',
                            '&:hover fieldset': { borderColor: '#5eead4' },
                            '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                          },
                        }}
                        disabled={isZero}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: 11 } }}>
                              ครั้ง
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </BodyCell>
                  <BodyCell>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: meta.color }}>
                        {rangeText}
                      </Typography>
                      {hasError && rowIssues.map((iss, i) => (
                        <Chip
                          key={i}
                          size="small"
                          icon={<Iconify icon="eva:alert-circle-fill" width={14} />}
                          label={iss.kind === 'gap' ? 'ขาดช่วง' : iss.kind === 'overlap' ? 'ช่วงทับ' : iss.kind === 'missing' ? 'ยังไม่กรอก' : 'ไม่ถูกต้อง'}
                          color={iss.kind === 'gap' ? 'warning' : 'error'}
                          sx={{ fontWeight: 600, borderRadius: '8px', fontSize: 11, alignSelf: 'flex-start' }}
                        />
                      ))}
                    </Stack>
                  </BodyCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

GroupEditor.propTypes = {
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

// ============================================================================
// Main Page
// ============================================================================
export default function LikelihoodCriteriaPage() {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [criteriaMap, setCriteriaMap] = useState({});
  const [activeTab, setActiveTab] = useState(1);

  // ===== Auth + Load =====
  useEffect(() => {
    const checkAuth = async () => {
      const verify = await verifyToken(null);
      const { statusCode, profile: p, access_token } = verify || {};
      if (statusCode === 200 && p && access_token) {
        if (p.rule !== 9) {
          Toast.fire({ icon: 'error', title: 'ไม่มีสิทธิ์เข้าถึงหน้านี้' });
          navigate('/dashboard/app', { replace: true });
          return;
        }
        setToken(access_token);
        setProfile(p);
        loadData(access_token);
      } else {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadData = async (authToken) => {
    setLoading(true);
    try {
      const res = await getLikelihoodCriteria(authToken);
      if (res.data.statusCode === 200) {
        const list = res.data.dataList || [];
        const grouped = _.groupBy(list, 'error_type');
        Object.keys(grouped).forEach((key) => {
          grouped[key].sort((a, b) => b.level_score - a.level_score);
        });
        setCriteriaMap(grouped);
      } else {
        setCriteriaMap({});
      }
    } catch (err) {
      console.error('[LikelihoodCriteria] load error');
      Toast.fire({ icon: 'error', title: 'ดึงข้อมูลล้มเหลว' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (errorType, index, field, value) => {
    setCriteriaMap((prev) => {
      const nextMap = { ...prev };
      const typeArray = [...nextMap[errorType]];
      const item = { ...typeArray[index] };
      if (value === '') {
        item[field] = null;
      } else {
        const n = parseInt(value, 10);
        item[field] = Number.isFinite(n) ? Math.max(0, n) : null;
      }
      typeArray[index] = item;
      nextMap[errorType] = typeArray;
      return nextMap;
    });
  };

  // ===== Aggregate issues across all error types =====
  const allIssues = useMemo(() => {
    const result = {};
    ERROR_TYPE_IDS.forEach((tid) => {
      const items = criteriaMap[tid] || [];
      result[tid] = validateRanges(items);
    });
    return result;
  }, [criteriaMap]);

  const totalIssues = useMemo(
    () => Object.values(allIssues).reduce((acc, arr) => acc + arr.length, 0),
    [allIssues]
  );

  // ===== Save =====
  const handleSaveAll = async () => {
    if (totalIssues > 0) {
      const groupWithIssue = Object.entries(allIssues).find(([, arr]) => arr.length > 0);
      if (groupWithIssue) setActiveTab(Number(groupWithIssue[0]));
      Toast.fire({ icon: 'error', title: `กรุณาแก้ไข ${totalIssues} ข้อผิดพลาดก่อนบันทึก` });
      return;
    }
    setSaving(true);
    try {
      const allItems = Object.values(criteriaMap).flat();
      for (let i = 0; i < allItems.length; i += 1) {
        const item = allItems[i];
        if (item.min_freq === null || Number.isNaN(item.min_freq)) {
          Toast.fire({ icon: 'error', title: 'ความถี่ขั้นต่ำต้องเป็นตัวเลขเสมอ' });
          setSaving(false);
          return;
        }
      }
      const payload = { items: allItems, updated_by: profile?.name || 'Admin' };
      const res = await updateLikelihoodCriteria(payload, token);
      if (res.data.statusCode === 200) {
        Toast.fire({ icon: 'success', title: 'บันทึกข้อมูลสำเร็จ' });
        loadData(token);
      } else {
        Toast.fire({ icon: 'error', title: 'บันทึกข้อมูลล้มเหลว' });
      }
    } catch (err) {
      console.error('[LikelihoodCriteria] save error');
      Toast.fire({ icon: 'error', title: 'บันทึกข้อมูลล้มเหลว' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <>
      <Helmet>
        <title>จัดการเกณฑ์ Likelihood | Medication error</title>
      </Helmet>
      <Container maxWidth={false}>
        {/* ==================== Header Card (Glass) ==================== */}
        <Box
          className="guk-glass guk-anim-fade-up"
          sx={{ mb: 3, borderRadius: '20px', p: { xs: 2, sm: 2.5 } }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(94,234,212,0.3), rgba(110,231,183,0.3))',
                  border: '1px solid rgba(153, 246, 228, 0.7)',
                }}
              >
                <Iconify icon="eva:bar-chart-2-fill" width={24} sx={{ color: '#0d9488' }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  className="guk-gradient-text-teal"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
                >
                  จัดการเกณฑ์การประเมินโอกาสเกิด (Likelihood)
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: '#475569', mt: 0.5 }}>
                  ตั้งค่าช่วงความถี่เพื่อนำไปคำนวณคะแนน Likelihood อัตโนมัติในรายงานแยกรายละเอียด Error
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {totalIssues > 0 && (
                <Chip
                  icon={<Iconify icon="eva:alert-triangle-fill" width={16} />}
                  label={`พบ ${totalIssues} ข้อผิดพลาด`}
                  color="error"
                  sx={{ fontWeight: 700, borderRadius: '10px' }}
                />
              )}
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="eva:save-fill" />}
                onClick={handleSaveAll}
                disabled={loading || saving}
                sx={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  boxShadow: '0 4px 14px -4px rgba(13, 148, 136, 0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' },
                }}
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* ==================== Info banner ==================== */}
        <Alert
          severity="info"
          icon={<Iconify icon="eva:info-fill" />}
          sx={{
            mb: 2.5,
            borderRadius: '12px',
            '& .MuiAlert-icon': { color: '#0d9488' },
            backgroundColor: 'rgba(20, 184, 166, 0.06)',
            border: '1px solid rgba(20, 184, 166, 0.2)',
          }}
        >
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            <b>วิธีอ่าน:</b> ความถี่ในช่วงเวลา = จำนวนครั้งของอุบัติการณ์ในประเภทนั้น ๆ ภายในช่วงเวลา (Period A) ของรายงาน — ระบบจะจับคู่จำนวนครั้งกับช่วงด้านล่างเพื่อให้คะแนน Likelihood อัตโนมัติ
            <br />
            <b>หมายเหตุ:</b> Level <b>5 (Frequent)</b> ไม่จำกัดสูงสุด — Level <b>0 (Never)</b> หมายถึงไม่พบเลย (ระบบล็อกค่าไว้ที่ 0)
          </Typography>
        </Alert>

        {/* ==================== Tabs ==================== */}
        {loading ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress sx={{ color: '#0d9488' }} />
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(145, 158, 171, 0.12)',
              boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsOnMobile
              sx={{
                borderBottom: '1px solid rgba(145, 158, 171, 0.16)',
                backgroundColor: 'rgba(240, 253, 250, 0.5)',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  py: 1.5,
                  minHeight: 64,
                  minWidth: 168,
                  color: 'text.secondary',
                },
                '& .Mui-selected': { color: '#0d9488 !important' },
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#0d9488' },
              }}
            >
              {ERROR_TYPE_IDS.map((tid) => {
                const cfg = ERROR_TYPE_CONFIG[tid];
                const issueCount = (allIssues[tid] || []).length;
                return (
                  <Tab
                    key={tid}
                    value={tid}
                    icon={
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          background: cfg.gradient,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {tid}
                      </Box>
                    }
                    iconPosition="start"
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }}>
                            {cfg.short}
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                            {cfg.title} · {cfg.detail}
                          </Typography>
                        </Box>
                        {issueCount > 0 && (
                          <Chip
                            size="small"
                            label={issueCount}
                            color="error"
                            sx={{ fontWeight: 700, height: 20, fontSize: 11, borderRadius: '6px' }}
                          />
                        )}
                      </Stack>
                    }
                    sx={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  />
                );
              })}
            </Tabs>
            <Divider />

            {/* Active tab content */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {(criteriaMap[activeTab] || []).length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Iconify icon="eva:inbox-fill" width={48} sx={{ color: '#C4CDD5' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ไม่มีข้อมูลในกลุ่มนี้
                  </Typography>
                </Box>
              ) : (
                <GroupEditor
                  items={criteriaMap[activeTab] || []}
                  onChange={(index, field, value) => handleInputChange(activeTab, index, field, value)}
                />
              )}
            </Box>
          </Paper>
        )}
      </Container>
    </>
  );
}
