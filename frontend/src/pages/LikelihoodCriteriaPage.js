import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled, useTheme } from '@mui/material/styles';

// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// components
import Iconify from '../components/iconify';

// API
import { getLikelihoodCriteria, updateLikelihoodCriteria } from '../libs/MedError';
import { verifyToken } from '../libs/Auth';

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

const GROUP_CONFIG = {
  1: {
    title: 'Group 1: Prescription error (ประเภทที่ 1)',
    color: 'info.main',
  },
  2: {
    title: 'Group 2: Processing, Pre-Administration, Transcribing error (ประเภทที่ 3, 5, 6)',
    color: 'success.main',
  },
  3: {
    title: 'Group 3: Dispensing, Administration error (ประเภทที่ 2, 4)',
    color: 'warning.main',
  },
};

const getScoreLabel = (score) => {
  switch (score) {
    case 5: return '5 (Frequent)';
    case 4: return '4 (Likely)';
    case 3: return '3 (Possible)';
    case 2: return '2 (Unlikely)';
    case 1: return '1 (Rare)';
    case 0: return '0 (Never)';
    default: return `${score}`;
  }
};

const getChipColor = (score) => {
  if (score === 5) return 'error';
  if (score === 4) return 'warning';
  if (score === 3) return 'warning';
  if (score === 2) return 'success';
  if (score === 1) return 'success';
  return 'default';
};

export default function LikelihoodCriteriaPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data structure: { 1: [...items], 2: [...items], 3: [...items] }
  const [criteriaMap, setCriteriaMap] = useState({});

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
  }, [navigate]);

  const loadData = async (authToken) => {
    setLoading(true);
    try {
      const res = await getLikelihoodCriteria(authToken);
      if (res.data.statusCode === 200) {
        const list = res.data.dataList || [];
        // Group by group_id
        const grouped = _.groupBy(list, 'group_id');
        // Sort each group by level_score DESC
        Object.keys(grouped).forEach(key => {
          grouped[key].sort((a, b) => b.level_score - a.level_score);
        });
        setCriteriaMap(grouped);
      } else {
        setCriteriaMap({});
      }
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'ดึงข้อมูลล้มเหลว' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (groupId, index, field, value) => {
    setCriteriaMap(prev => {
      const nextMap = { ...prev };
      const groupArray = [...nextMap[groupId]];
      const item = { ...groupArray[index] };
      
      if (value === '') {
        item[field] = null;
      } else {
        item[field] = parseInt(value, 10);
      }
      
      groupArray[index] = item;
      nextMap[groupId] = groupArray;
      return nextMap;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Flatten map back to array
      const allItems = Object.values(criteriaMap).flat();
      
      // Validation
      for (let i = 0; i < allItems.length; i += 1) {
        const item = allItems[i];
        if (item.min_freq === null || Number.isNaN(item.min_freq)) {
          Toast.fire({ icon: 'error', title: 'ความถี่ขั้นต่ำต้องเป็นตัวเลขเสมอ' });
          setSaving(false);
          return;
        }
      }

      const payload = {
        items: allItems,
        updated_by: profile?.name || 'Admin',
      };

      const res = await updateLikelihoodCriteria(payload, token);
      if (res.data.statusCode === 200) {
        Toast.fire({ icon: 'success', title: 'บันทึกข้อมูลสำเร็จ' });
        loadData(token);
      } else {
        Toast.fire({ icon: 'error', title: 'บันทึกข้อมูลล้มเหลว' });
      }
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'บันทึกข้อมูลล้มเหลว' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>จัดการเกณฑ์ Likelihood | Medication error</title>
      </Helmet>
      <Container maxWidth="true">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.dark' }}>
              จัดการเกณฑ์การประเมินโอกาสเกิด (Likelihood)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ตั้งค่าเกณฑ์ความถี่เพื่อนำไปคำนวณคะแนน Likelihood อัตโนมัติในรายงานแยกรายละเอียด Error
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:save-fill" />}
            onClick={handleSaveAll}
            disabled={loading || saving}
            sx={{ boxShadow: theme.shadows[4] }}
          >
            บันทึกการเปลี่ยนแปลงทั้งหมด
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }} icon={<Iconify icon="eva:info-outline" />}>
          ความถี่ในช่วงเวลา = จำนวนครั้งของอุบัติการณ์ในประเภทนั้นๆ ภายในช่วงเวลา (Period A) ที่เรียกดูรายงาน.<br/>
          <b>ความถี่สูงสุด</b> ปล่อยว่าง (ช่องว่าง) ไว้หากต้องการให้เป็น <code>&gt;= ความถี่ขั้นต่ำ</code>
        </Alert>

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4}>
            {[1, 2, 3].map(groupId => {
              const groupItems = criteriaMap[groupId] || [];
              const config = GROUP_CONFIG[groupId];
              if (!config || groupItems.length === 0) return null;

              return (
                <Card key={groupId} sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardHeader 
                    title={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="eva:folder-fill" color={theme.palette[config.color.split('.')[0]].main} width={24} />
                        <Typography variant="h6">{config.title}</Typography>
                      </Stack>
                    } 
                    sx={{ pb: 2 }}
                  />
                  <Divider />
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <StyledHeadCell align="center" width="20%">ระดับคะแนน</StyledHeadCell>
                          <StyledHeadCell align="center" width="40%">ความถี่ขั้นต่ำ (&gt;=)</StyledHeadCell>
                          <StyledHeadCell align="center" width="40%">ความถี่สูงสุด (ถึง)</StyledHeadCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupItems.map((item, index) => (
                          <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">
                              <Chip 
                                label={getScoreLabel(item.level_score)} 
                                color={getChipColor(item.level_score)}
                                sx={{ fontWeight: 700, minWidth: 100 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={item.min_freq === null ? '' : item.min_freq}
                                onChange={(e) => handleInputChange(groupId, index, 'min_freq', e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={{ width: 120, bgcolor: 'background.paper' }}
                                disabled={item.level_score === 0} // 0 is always 0
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={item.max_freq === null ? '' : item.max_freq}
                                onChange={(e) => handleInputChange(groupId, index, 'max_freq', e.target.value)}
                                inputProps={{ min: 0 }}
                                placeholder="ไม่จำกัด (>=)"
                                sx={{ width: 120, bgcolor: 'background.paper' }}
                                disabled={item.level_score === 5 || item.level_score === 0} // 5 is >= min, 0 is 0
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </>
  );
}
