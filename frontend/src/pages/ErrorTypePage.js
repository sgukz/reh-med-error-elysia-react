import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import _, { filter } from 'lodash';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import { red } from '@mui/material/colors';

// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Hook form
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// Lib MedError
import { errorTypeListCreate, errorTypeListDelete, getErrorTypeByTypeList } from '../libs/MedError';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';

// Notify Toast Config
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
// Notify Toast Config

// Schema form Error Type List
const errorTypeListSchema = z.object({
  error_type: z
    .number({
      required_error: 'โปรดเลือกประเภท Error',
      invalid_type_error: 'โปรดเลือกประเภท Error',
    })
    .min(1, { message: 'โปรดเลือกประเภท Error' }), // ค่า `0` หรือ `undefined` ถือว่าไม่ถูกต้อง

  error_type_list: z
    .string({
      required_error: 'โปรดระบุ ID รายละเอียด Error',
      invalid_type_error: 'โปรดระบุ ID รายละเอียด Error',
    })
    .min(1, { message: 'โปรดระบุ ID รายละเอียด Error' }), // ห้ามเป็นค่าว่าง

  error_type_list_detail: z
    .string({
      required_error: 'โปรดระบุรายละเอียด Error',
      invalid_type_error: 'โปรดระบุรายละเอียด Error',
    })
    .min(1, { message: 'โปรดระบุรายละเอียด Error' }), // ห้ามเป็นค่าว่าง

  is_active: z.enum(['Y', 'N'], {
    errorMap: () => ({ message: 'โปรดเลือกสถานะการใช้งาน' }),
  }), // ตรวจสอบให้เลือกเฉพาะ 'Y' หรือ 'N'
  type_id: z.number(),
});

const color = red[500];

const TABLE_HEAD_ERROR_TYPE = [
  { id: 'error_type_name', label: 'ประเภท', alignRight: false, alignHead: 'left' },
  { id: 'error_type_list_detail', label: 'รายละเอียด Error', alignRight: false, alignHead: 'left' },
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
      (_error_type) =>
        _error_type.error_type_list_detail.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _error_type.error_type_name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

// import
export default function ErrorTypePage() {
  const navigate = useNavigate();
  const [, setIsOpen] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selectedID, setSelectedID] = useState(null);
  const [token, setToken] = useState(getTokenFromLocalStorage('access_token'));

  const [orderBy, setOrderBy] = useState('error_type_name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [medErrorType, setMedErrorType] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(errorTypeListSchema),
    defaultValues: {
      error_type: '',
      error_type_list: '',
      error_type_list_detail: '',
      is_active: 'Y',
      type_id: 0,
    },
  });

  const [isNotify, setIsNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState({
    type: '',
    title: '',
    text: '',
    sec: '',
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

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenMenu = (event, objPerson) => {
    setOpen(event.currentTarget);
    setSelectedID(objPerson);
  };

  const handleClose = (e) => {
    setIsOpenDelete(false);
    e.preventDefault();
  };

  const onSubmit = async (dataForm) => {
    try {
      const res = await errorTypeListCreate(dataForm, token);
      const { statusCode, errorTypeList, section, type_alert } = res.data;

      if (statusCode === 200 && Array.isArray(errorTypeList) && !_.isEmpty(errorTypeList)) {
        reset();

        setNotifyMessage({
          type: `${type_alert}.main`,
          title: 'แจ้งเตือน',
          text: section === 'create' ? 'บันทึกข้อมูลเรียบร้อย' : 'อัปเดตข้อมูลเรียบร้อย',
          sec: section,
        });

        await loadMedErrorType(token);
        setIsNotify(true);
        setIsOpenForm(false);
        setOpen(null);
      } else {
        Toast.fire({ icon: 'error', title: 'ไม่สามารถบันทึกข้อมูลได้' });
      }
    } catch (error) {
      handleCatchAxios(error, 'create');
    }
  };

  const handleClickOpenForm = () => {
    setSelectedID(null);
    setIsOpenForm(true);
    setIsOpenDelete(false);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setIsOpenDelete(false);
    reset();
  };

  const handleEdit = (e, id) => {
    const dataErrorTypeList = filter(medErrorType, (_error_type) => _error_type.type_id === id);
    setIsOpenForm(true);
    if (!_.isEmpty(dataErrorTypeList)) {
      const itemErrorType = dataErrorTypeList[0];
      const formEditData = {
        error_type: itemErrorType.error_type,
        error_type_list: itemErrorType.error_type_list,
        error_type_list_detail: itemErrorType.error_type_list_detail,
        is_active: itemErrorType.is_active,
        type_id: itemErrorType.type_id,
      };
      reset(formEditData);
    }

    if (_.isEmpty(dataErrorTypeList)) {
      Toast.fire({ icon: 'error', title: 'ไม่พบข้อมูลประเภท Error นี้' });
      return;
    }

    e.preventDefault();
  };

  const handleDelete = (e) => {
    setOpen(null);
    setIsOpenDelete(true);
    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    try {
      const deleleErrorTypeList = await errorTypeListDelete(id, token);

      const { statusCode, errorTypeList } = deleleErrorTypeList.data;
      if (statusCode === 200 && errorTypeList > 0) {
        Toast.fire({
          icon: 'success',
          title: 'ลบข้อมูลเรียบร้อย',
        });
        setIsOpenDelete(false);
        loadMedErrorType(token);
        setOpen(null);
      }
    } catch (error) {
      handleCatchAxios(error, 'del');
    }
    e.preventDefault();
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
    setIsOpen(false);
  };

  const loadMedErrorType = async (auth_token) => {
    try {
      setIsOpen(true); // เริ่มโหลด (ถ้าใช้เป็น loading)
      const res = await getErrorTypeByTypeList(auth_token, 0);
      const { errorTypeList, statusCode } = res.data;

      if (statusCode === 200 && Array.isArray(errorTypeList) && errorTypeList.length > 0) {
        setMedErrorType(errorTypeList);
      } else {
        setMedErrorType([]);
      }
    } catch (error) {
      handleCatchAxios(error, 'load');
    } finally {
      setIsOpen(false); // ปิด loading เสมอ
    }
  };

  const handleNotifyClose = (event, secOrReason) => {
    setIsNotify(false);
    setIsOpenForm(false);
    setNotifyMessage({ type: '', title: '', text: '', sec: '' });

    // ถ้ามาจากปุ่ม → secOrReason จะเป็น sec จริง
    if (secOrReason !== 'load' && secOrReason !== 'backdropClick' && secOrReason !== 'escapeKeyDown') {
      loadMedErrorType(token);
    }
  };

  useEffect(() => {
    const checkVerifyToken = async () => {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;

      if (statusCode === 200 && profile && access_token) {
        setToken(access_token);
        loadMedErrorType(access_token);
      } else {
        navigate('/login', { replace: true });
      }
    };

    checkVerifyToken();
  }, [navigate]);

  const emptyRowsMedError = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - medErrorType.length) : 0;

  const filteredErrorType = applySortFilter(medErrorType, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredErrorType.length && !!filterName;

  const isEdit = Boolean(selectedID && selectedID.type_id);
  return (
    <>
      <Helmet>
        <title>ข้อมูลรายละเอียดประเภท Error | Medication error</title>
      </Helmet>
      <Container maxWidth="true">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            ข้อมูลรายละเอียดประเภท Error
          </Typography>
          <Button onClick={handleClickOpenForm} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            เพิ่มรายละเอียดประเภท Error
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
                  headLabel={TABLE_HEAD_ERROR_TYPE}
                  rowCount={medErrorType.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredErrorType.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { type_id, error_type_name, error_type_list, error_type_list_detail, is_active } = row;

                    return (
                      <Tooltip title="" key={type_id}>
                        <TableRow hover style={{ cursor: 'pointer' }} tabIndex={-1}>
                          <TableCell align="left">{error_type_name}</TableCell>
                          <TableCell align="left">{`${error_type_list}. ${error_type_list_detail}`}</TableCell>
                          <TableCell align="center">
                            <Chip
                              sx={{ color: '#FFFFFF' }}
                              label={`${is_active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`}
                              color={`${is_active === 'Y' ? 'success' : 'error'}`}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="จัดการ">
                              <IconButton
                                size="large"
                                color="info"
                                onClick={(event) =>
                                  handleOpenMenu(event, {
                                    type_id: type_id,
                                    error_type_name: error_type_name,
                                    error_type_list_detail: error_type_list_detail,
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
                  {emptyRowsMedError > 0 && (
                    <TableRow style={{ height: 53 * emptyRowsMedError }}>
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
                {medErrorType.length === 0 && (
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
            count={medErrorType.length}
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
        <MenuItem onClick={(e) => handleEdit(e, selectedID?.type_id)}>
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
          sx={{
            bgcolor: isEdit ? '#ffc400' : 'primary.dark',
            color: 'common.white',
          }}
        >
          {isEdit ? `แก้ไขรายละเอียดประเภท ${selectedID?.error_type_name ?? ''}` : 'เพิ่มรายละเอียดประเภท Error'}
        </DialogTitle>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} sx={{ py: 2, px: 2 }}>
          <DialogContent tabIndex={-1}>
            <Stack spacing={3}>
              <FormControl fullWidth error={!!errors.error_type}>
                <FormLabel id="error_type_label">
                  เลือกประเภท Error{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>

                <Controller
                  name="error_type"
                  control={control}
                  rules={{ required: 'โปรดเลือกประเภท Error' }} // กำหนด Required Message
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="error_type_label"
                      label="เลือกประเภท Error"
                      value={field.value || ''} // ตั้งค่าเริ่มต้นเป็นค่าว่างเพื่อให้ React ควบคุมค่าได้
                      onChange={(event) => field.onChange(Number(event.target.value))} // แปลงค่าเป็น Number
                    >
                      <MenuItem value={1}>Prescription Error</MenuItem>
                      <MenuItem value={2}>Dispensing Error</MenuItem>
                      <MenuItem value={3}>Pre-Administration Error</MenuItem>
                      <MenuItem value={4}>Administration Error</MenuItem>
                      <MenuItem value={5}>Processing Error</MenuItem>
                      <MenuItem value={6}>Transcribing Error</MenuItem>
                    </Select>
                  )}
                />

                {errors.error_type && <FormHelperText>{errors.error_type.message}</FormHelperText>}
              </FormControl>

              <FormControl error={!!errors.error_type_list}>
                <FormLabel id="error_type_list_label">
                  ID รายละเอียด Error{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>
                <Controller
                  name="error_type_list"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      placeholder="ระบุ ID รายละเอียด Error"
                      error={!!errors.error_type_list}
                      helperText={errors.error_type_list?.message}
                    />
                  )}
                />
              </FormControl>

              <FormControl error={!!errors.error_type_list_detail}>
                <FormLabel id="error_type_list_detail_label">
                  รายละเอียด Error{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <Controller
                  name="error_type_list_detail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      placeholder="ระบุรายละเอียด Error"
                      error={!!errors.error_type_list_detail}
                      helperText={errors.error_type_list_detail?.message}
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
                    <Select {...field} value={field.value ?? 'Y'} labelId="is_active_label" label="สถานะการใช้งาน">
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
                name="type_id"
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
          ยืนยันการลบข้อมูลรายละเอียด {`${selectedID?.error_type_name}`}
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            ต้องการลบ{' '}
            <b>
              <u>{`"${selectedID?.error_type_list_detail}"`}</u>
            </b>{' '}
            ใช่หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={(e) => handleConfirmDelete(e, selectedID?.type_id)} autoFocus sx={{ color: 'error.main' }}>
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
