import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import _, { filter } from 'lodash';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';

// Hook form
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// Lib MedError
import { getAnalysisData, analysisCreate, analysisDelete } from '../libs/MedError';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';

// Context
import { useAuth } from '../contexts/AuthContext';

// Schema form Analysis Data
const analysisSchema = z.object({
  error_analysis_name: z
    .string({
      required_error: 'โปรดระบุรายการสาเหตุ',
      invalid_type_error: 'โปรดระบุรายการสาเหตุ',
    })
    .min(1, { message: 'โปรดระบุรายการสาเหตุ' }), // ห้ามเป็นค่าว่าง

  is_active: z.enum(['Y', 'N'], {
    errorMap: () => ({ message: 'โปรดเลือกสถานะการใช้งาน' }),
  }), // ตรวจสอบให้เลือกเฉพาะ 'Y' หรือ 'N'
  error_analysis_id: z.number(),
});

const color = red[500];

// Notify Toast Config
const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
  toast: true,
  position: 'center',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', MySwal.stopTimer);
    toast.addEventListener('mouseleave', MySwal.resumeTimer);
  },
});
// Notify Toast Config

const TABLE_HEAD_ANALYSIS = [
  { id: 'error_analysis_name', label: 'รายการสาเหตุ', alignHead: 'left' },
  { id: 'is_active', label: 'สถานะ', alignRight: false, alignHead: 'center' },
  { id: '', label: 'จัดการ', alignHead: 'center' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_analysis) => _analysis.error_analysis_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function AnalysisPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [token, setToken] = useState(auth.accessToken);
  const [orderBy, setOrderBy] = useState('error_analysis_name');
  const [selectedID, setSelectedID] = useState(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [open, setOpen] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [analysisData, setAnalysisData] = useState([]);

  const [isNotify, setIsNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState({
    type: '',
    title: '',
    text: '',
    sec: '',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      error_analysis_name: '',
      is_active: 'Y',
      error_analysis_id: 0,
    },
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    event.preventDefault();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    event.preventDefault();
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const loadAnalysisData = async (auth_accesss) => {
    try {
      const analysis = await getAnalysisData(auth_accesss);
      const { analysisList, statusCode } = analysis.data;

      if (statusCode === 200 && !_.isEmpty(analysisList)) {
        setAnalysisData(analysisList);
      }
    } catch (error) {
      handleCatchAxios(error, 'load');
    }
  };

  const handleCatchAxios = (errorCatch) => {
    if (errorCatch.response) {
      const { status } = errorCatch.response;
      if (status === 404) {
        setTimeout(() => {
          Toast.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
          });
        }, 1000);
      } else {
        Toast.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดบางอย่าง',
        });
      }
    } else if (errorCatch.request) {
      Toast.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดบางอย่าง, ขออภัยในความไม่สะดวก!',
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดบางอย่าง, ขออภัยในความไม่สะดวก!',
      });
    }
    setOpen(null);
  };

  const handleNotifyClose = (e, sec) => {
    setIsNotify(false);
    setNotifyMessage({
      type: '',
      title: '',
      text: '',
      sec: '',
    });
    if (sec !== 'load') loadAnalysisData(token);
    e.preventDefault();
  };

  const handleClickOpenForm = () => {
    setSelectedID(null);
    setIsOpenForm(true);
    setIsOpenDelete(false);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenMenu = (event, objDept) => {
    setOpen(event.currentTarget);
    setSelectedID(objDept);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setIsOpenDelete(false);
    reset();
  };

  const handleClose = (e) => {
    setIsOpenDelete(!true);
    e.preventDefault();
  };

  const onSubmit = async (dataForm) => {
    try {
      const userData = dataForm;

      const formAnalysisCreate = await analysisCreate(userData, token);
      const { statusCode, analysisList, section } = formAnalysisCreate.data;

      if (!_.isEmpty(analysisList)) {
        if (statusCode === 201 && section === 'create') {
          Toast.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลเรียบร้อย',
          });
        }

        if (statusCode === 200 && section === 'update') {
          Toast.fire({
            icon: 'success',
            title: 'อัตเดทข้อมูลเรียบร้อย',
          });
        }
        reset();
        loadAnalysisData(token);
        setIsNotify(!true);
        setIsOpenForm(false);
        setOpen(false);
      }
    } catch (error) {
      handleCatchAxios(error, 'create');
    }
  };

  const handleEdit = (e, id) => {
    const dataAnalysisList = filter(analysisData, (_analysis) => _analysis.error_analysis_id === id);
    setIsOpenForm(true);
    if (!_.isEmpty(dataAnalysisList)) {
      const itemAnalysis = dataAnalysisList[0];
      const formEditAnalysis = {
        error_analysis_id: itemAnalysis.error_analysis_id,
        error_analysis_name: itemAnalysis.error_analysis_name,
        is_active: itemAnalysis.is_active,
      };

      reset(formEditAnalysis);
    }
    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    try {
      const deleleAnalysis = await analysisDelete(id, token);

      const { statusCode, deleteAnalysis } = deleleAnalysis.data;
      if (statusCode === 200 && deleteAnalysis > 0) {
        Toast.fire({
          icon: 'success',
          title: 'ลบข้อมูลเรียบร้อย',
        });
        setIsNotify(!true);
        setIsOpenDelete(false);
        loadAnalysisData(token);
        setOpen(false);
      }
    } catch (error) {
      handleCatchAxios(error, 'del');
    }
    e.preventDefault();
  };

  const handleDelete = (e) => {
    setOpen(!true);
    setIsOpenDelete(true);
    e.preventDefault();
  };

  useEffect(() => {
    async function checkVerifyToken() {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;
      if (statusCode === 200 && profile) {
        if (access_token) {
          setToken(access_token);
          loadAnalysisData(access_token);
        } else {
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, []);

  const emptyRowsAnalysis = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - analysisData.length) : 0;
  const filteredAnalysis = applySortFilter(analysisData, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredAnalysis.length && !!filterName;
  const isEdit = Boolean(selectedID && selectedID.error_analysis_id);

  return (
    <>
      <Helmet>
        <title>รายการสาเหตุ | Medication error</title>
      </Helmet>
      <Container maxWidth="false">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            รายการสาเหตุ
          </Typography>
          <Button onClick={handleClickOpenForm} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            เพิ่มรายการสาเหตุ
          </Button>
        </Stack>
        <Card>
          <UserListToolbar filterName={filterName} onFilterName={handleFilterByName} />
          <Scrollbar>
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD_ANALYSIS}
                  rowCount={analysisData.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredAnalysis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { error_analysis_id, error_analysis_name, is_active } = row;
                    return (
                      <Tooltip title="" key={error_analysis_id}>
                        <TableRow hover style={{ cursor: 'pointer' }} tabIndex={-1}>
                          <TableCell align="left">{error_analysis_name}</TableCell>
                          <TableCell align="center">
                            <Chip
                              sx={{
                                backgroundColor: is_active === 'Y' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: is_active === 'Y' ? '#16a34a' : '#dc2626',
                                border: is_active === 'Y' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                fontWeight: 600,
                              }}
                              label={`${is_active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="จัดการ">
                              <IconButton
                                size="large"
                                color="info"
                                onClick={(event) =>
                                  handleOpenMenu(event, {
                                    error_analysis_id: error_analysis_id,
                                    error_analysis_name: error_analysis_name,
                                  })
                                }
                              >
                                <Iconify icon={'eva:settings-2-outline'} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      </Tooltip>
                    );
                  })}
                  {emptyRowsAnalysis > 0 && (
                    <TableRow style={{ height: 53 * emptyRowsAnalysis }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>
                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={3} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            ไม่พบข้อมูล
                          </Typography>

                          <Typography variant="body2">
                            ไม่มีผลลัพธ์ที่ค้นหา &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> กรุณาลองใหม่อีกครั้ง
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {analysisData.length === 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={3} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body2">ไม่มีข้อมูล</Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={analysisData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={(e) => handleEdit(e, selectedID?.error_analysis_id)}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          แก้ไข
        </MenuItem>
        <Divider />
        <MenuItem onClick={(e) => handleDelete(e)} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          ลบ
        </MenuItem>
      </Popover>

      <Dialog
        open={Boolean(isOpenForm)}
        onClose={handleCloseForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={Boolean(isOpenForm)}
        maxWidth={'sm'}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            bgcolor: isEdit ? '#ffc400' : 'primary.dark',
            color: 'common.white',
          }}
        >
          {isEdit ? 'แก้ไขรายการสาเหตุ' : 'เพิ่มรายการสาเหตุ'}
        </DialogTitle>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} sx={{ py: 2, px: 2 }}>
          <DialogContent tabIndex={-1}>
            <Stack spacing={3}>
              <FormControl error={!!errors.error_analysis_name}>
                <FormLabel id="error_analysis_name_label">
                  รายการสาเหตุ{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>
                <Controller
                  name="error_analysis_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      placeholder="ระบุรายการสาเหตุ"
                      error={!!errors.error_analysis_name}
                      helperText={errors.error_analysis_name?.message}
                    />
                  )}
                />
              </FormControl>

              <FormControl fullWidth error={!!errors.is_active}>
                <FormLabel id="is_active_label">
                  สถานะการใช้งาน{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>

                <Controller
                  name="is_active"
                  control={control}
                  defaultValue="Y"
                  rules={{ required: 'กรุณาเลือกสถานะการใช้งาน' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? 'Y'} // ให้ใช้ค่าจาก RHF เป็นหลัก
                      labelId="is_active_label"
                      label="สถานะการใช้งาน"
                    >
                      <MenuItem value="Y" sx={{ color: 'success.dark' }}>
                        <Iconify icon={'material-symbols:check'} /> เปิดใช้งาน
                      </MenuItem>
                      <MenuItem value="N" sx={{ color: 'error.main' }}>
                        <Iconify icon={'material-symbols:close'} /> ปิดใช้งาน
                      </MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.is_active?.message}</FormHelperText>
              </FormControl>
              <Controller
                name="error_analysis_id"
                control={control}
                render={({ field }) => <TextField {...field} type="hidden" sx={{ display: 'none' }} />}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" size="small" type="submit">
              <Iconify icon={'material-symbols:save'} /> บันทึก
            </Button>
            <Button variant="contained" color="error" size="small" onClick={handleCloseForm}>
              <Iconify icon={'material-symbols:close'} /> ปิด
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(isNotify)}
        onClose={handleNotifyClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'common.white' }}>
          <Iconify icon={'eva:bell-outline'} /> {'แจ้งเตือน'}
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            {notifyMessage.text}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={(e) => handleNotifyClose(e, notifyMessage.sec)} sx={{ color: 'error.main' }}>
            <Iconify icon={'material-symbols:close'} /> ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notify confirm delete */}
      <Dialog
        open={Boolean(isOpenDelete)}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{ bgcolor: '#c62828', color: 'common.white' }}>
          <Iconify icon={'eva:trash-2-outline'} /> ยืนยันการลบรายการสาเหตุ
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            ต้องการลบ{' '}
            <b>
              <u>{`"${selectedID?.error_analysis_name}"`}</u>
            </b>{' '}
            ใช่หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={(e) => handleConfirmDelete(e, selectedID?.error_analysis_id)}
            autoFocus
            sx={{ color: 'error.main' }}
          >
            <Iconify icon={'eva:trash-2-outline'} /> ยืนยัน
          </Button>
          <Button onClick={handleClose}>
            <Iconify icon={'eva:close-outline'} /> ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
