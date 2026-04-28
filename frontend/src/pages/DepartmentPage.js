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
import { getMedErrorDeptAll, deptCreate, deptDelete } from '../libs/MedError';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';

// Context
import { useAuth } from '../contexts/AuthContext';

// Schema form Error Type List
const departmentSchema = z.object({
  med_error_depname: z
    .string({
      required_error: 'โปรดระบุหอผู้ป่วย / ห้องตรวจ',
      invalid_type_error: 'โปรดระบุหอผู้ป่วย / ห้องตรวจ',
    })
    .min(1, { message: 'โปรดระบุหอผู้ป่วย / ห้องตรวจ' }), // ห้ามเป็นค่าว่าง

  med_error_is_active: z.enum(['Y', 'N'], {
    errorMap: () => ({ message: 'โปรดเลือกสถานะการใช้งาน' }),
  }), // ตรวจสอบให้เลือกเฉพาะ 'Y' หรือ 'N'
  med_error_depcode: z.number(),
  med_error_dep_group_id: z.number().min(1, 'กรุณาเลือกประเภท'),
});

const color = red[500];

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

const TABLE_HEAD_DEPARTMENT = [
  { id: 'med_error_depname', label: 'ชื่อหน่วยงาน/หอผู้ป่วย', alignHead: 'left' },
  { id: 'med_error_dep_group_detail', label: 'ประเภท', alignRight: false, alignHead: 'center' },
  { id: 'med_error_is_active', label: 'สถานะ', alignRight: false, alignHead: 'center' },
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
    return filter(array, (_dept) => _dept.med_error_depname.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const getChipColor = (groupId) => {
  switch (groupId) {
    case 1:
      return { backgroundColor: '#1976d2', color: '#fff' }; // น้ำเงิน
    case 2:
      return { backgroundColor: '#388e3c', color: '#fff' }; // เขียว
    case 3:
      return { backgroundColor: '#f57c00', color: '#fff' }; // ส้ม
    case 4:
      return { backgroundColor: '#d32f2f', color: '#fff' }; // แดง
    default:
      return { backgroundColor: '#9e9e9e', color: '#fff' }; // เทา สำหรับค่าอื่น
  }
};

export default function DepartmentPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [token, setToken] = useState(getTokenFromLocalStorage('access_token'));
  const [orderBy, setOrderBy] = useState('med_error_depname');
  const [selectedID, setSelectedID] = useState(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [open, setOpen] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [medErrorDept, setMedErrorDept] = useState([]);

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
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      med_error_depname: '',
      med_error_is_active: 'Y',
      med_error_dep_group_id: 1,
      med_error_depcode: 0,
    },
  });

  const isActiveValue = watch('med_error_is_active') || 'Y';

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

  const loadMedErrorDept = async (auth_accesss) => {
    try {
      const dept = await getMedErrorDeptAll(auth_accesss);
      const { departmentList, statusCode } = dept.data;
      // console.log(departmentList);

      if (statusCode === 200 && Array.isArray(departmentList) && !_.isEmpty(departmentList)) {
        setMedErrorDept(departmentList);
      } else {
        setMedErrorDept([]);
      }
    } catch (error) {
      handleCatchAxios(error, 'load');
    }
  };

  const handleCatchAxios = (errorCatch, sec) => {
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

  const handleNotifyClose = (event, secOrReason) => {
    setIsNotify(false);
    setNotifyMessage({ type: '', title: '', text: '', sec: '' });

    // ถ้าเรียกจากปุ่ม -> ส่ง sec จริง เช่น 'load'
    // ถ้าเรียกจาก onClose ของ Dialog -> secOrReason จะเป็น reason ของ MUI
    if (secOrReason !== 'load') {
      loadMedErrorDept(token);
    }
  };

  const handleClickOpenForm = () => {
    setSelectedID(null);
    setIsOpenForm(true);
    setIsOpenDelete(false);
    reset({
      med_error_depname: '',
      med_error_is_active: 'Y',
      med_error_dep_group_id: 1,
      med_error_depcode: 0,
    });
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
      const res = await deptCreate(dataForm, token);
      const { statusCode, departList, section } = res.data;

      if (statusCode === 200 && Array.isArray(departList) && !_.isEmpty(departList)) {
        reset();

        Toast.fire({
          icon: 'success',
          title: section === 'create' ? 'บันทึกข้อมูลเรียบร้อย' : 'อัปเดตข้อมูลเรียบร้อย',
        });

        await loadMedErrorDept(token);
        setIsNotify(false);
        setIsOpenForm(false);
        setOpen(null);
      } else {
        Toast.fire({
          icon: 'error',
          title: 'ไม่สามารถบันทึกข้อมูลได้',
        });
      }
    } catch (error) {
      handleCatchAxios(error, 'create');
    }
  };

  const handleEdit = (e, id) => {
    const dataDeptList = filter(medErrorDept, (_dept) => _dept.med_error_depcode === id);
    setIsOpenForm(true);
    if (!_.isEmpty(dataDeptList)) {
      const itemDept = dataDeptList[0];
      const formEditDept = {
        med_error_depcode: itemDept.med_error_depcode,
        med_error_depname: itemDept.med_error_depname,
        med_error_dep_group_id: itemDept.med_error_dep_group_id,
        med_error_is_active: itemDept.med_error_is_active,
      };

      reset(formEditDept);
    }

    if (_.isEmpty(dataDeptList)) {
      Toast.fire({ icon: 'error', title: 'ไม่พบข้อมูลหอผู้ป่วย / ห้องตรวจนี้' });
      return;
    }

    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    try {
      const deleleDepartment = await deptDelete(id, token);

      const { statusCode, deleteDepart } = deleleDepartment.data;
      if (statusCode === 200 && deleteDepart > 0) {
        Toast.fire({
          icon: 'success',
          title: 'ลบข้อมูลเรียบร้อย',
        });
        setIsNotify(false);
        setIsOpenDelete(false);
        await loadMedErrorDept(token);
        setOpen(null);
      }
    } catch (error) {
      handleCatchAxios(error, 'del');
    }
    e.preventDefault();
  };

  const handleDelete = (e) => {
    setOpen(null);
    setIsOpenDelete(true);
    e.preventDefault();
  };

  useEffect(() => {
    const checkVerifyToken = async () => {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;

      if (statusCode === 200 && profile && access_token) {
        setToken(access_token);
        loadMedErrorDept(access_token);
      } else {
        navigate('/login', { replace: true });
      }
    };

    checkVerifyToken();
  }, [navigate]);

  const emptyRowsMedError = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - medErrorDept.length) : 0;
  const filteredDepartment = applySortFilter(medErrorDept, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredDepartment.length && !!filterName;

  const isEdit = Boolean(selectedID && selectedID.med_error_depcode);

  return (
    <>
      <Helmet>
        <title>ข้อมูลหอผู้ป่วย / ห้องตรวจ | Medication error</title>
      </Helmet>
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            ข้อมูลหอผู้ป่วย / ห้องตรวจ
          </Typography>
          <Button onClick={handleClickOpenForm} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            เพิ่มข้อมูลหอผู้ป่วย / ห้องตรวจ
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
                  headLabel={TABLE_HEAD_DEPARTMENT}
                  rowCount={medErrorDept.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredDepartment.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      med_error_depcode,
                      med_error_depname,
                      med_error_dep_group_id,
                      med_error_dep_group_detail,
                      med_error_is_active,
                    } = row;
                    return (
                      <Tooltip title="" key={med_error_depcode}>
                        <TableRow hover style={{ cursor: 'pointer' }} tabIndex={-1}>
                          <TableCell align="left">{med_error_depname}</TableCell>
                          <TableCell align="center">
                            <Chip sx={getChipColor(+med_error_dep_group_id)} label={med_error_dep_group_detail} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              sx={{ color: '#FFFFFF' }}
                              label={`${med_error_is_active === 'Y' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`}
                              color={`${med_error_is_active === 'Y' ? 'success' : 'error'}`}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="จัดการ">
                              <IconButton
                                size="large"
                                color="info"
                                onClick={(event) =>
                                  handleOpenMenu(event, {
                                    med_error_depcode: med_error_depcode,
                                    med_error_depname: med_error_depname,
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
                {medErrorDept.length === 0 && (
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
            count={medErrorDept.length}
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
        <MenuItem onClick={(e) => handleEdit(e, selectedID?.med_error_depcode)}>
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
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            bgcolor: isEdit ? '#ffc400' : 'primary.dark',
            color: 'common.white',
          }}
        >
          {isEdit
            ? `แก้ไขข้อมูลหอผู้ป่วย / ห้องตรวจ ${selectedID?.med_error_depname ?? ''}`
            : 'เพิ่มข้อมูลหอผู้ป่วย / ห้องตรวจ'}
        </DialogTitle>

        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} sx={{ py: 2, px: 2 }}>
          <DialogContent tabIndex={-1}>
            <Stack spacing={3}>
              {/* ประเภท */}
              <FormControl fullWidth error={!!errors.med_error_dep_group_id}>
                <FormLabel id="med_error_dep_group_id_label">
                  ประเภท
                  <Typography component="span" variant="body2" sx={{ color: 'red', ml: 0.5 }}>
                    *
                  </Typography>
                </FormLabel>

                <Controller
                  name="med_error_dep_group_id"
                  control={control}
                  defaultValue={1}
                  rules={{ required: 'กรุณาเลือกประเภท' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? 1}
                      labelId="med_error_dep_group_id_label"
                      label="ประเภท"
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    >
                      <MenuItem value={1}>OPD</MenuItem>
                      <MenuItem value={5}>OPD2</MenuItem>
                      <MenuItem value={6}>OPD-Primary</MenuItem>
                      <MenuItem value={2}>IPD</MenuItem>
                      <MenuItem value={3}>งานคลัง</MenuItem>
                      <MenuItem value={4}>งานผลิต</MenuItem>
                      <MenuItem value={7}>กลับบ้าน</MenuItem>
                      <MenuItem value={8}>TPN</MenuItem>
                      <MenuItem value={9}>เคมีบำบัด</MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.med_error_dep_group_id?.message}</FormHelperText>
              </FormControl>

              {/* ชื่อหอผู้ป่วย / ห้องตรวจ */}
              <FormControl error={!!errors.med_error_depname}>
                <FormLabel id="med_error_depname_label">
                  ชื่อหอผู้ป่วย / ห้องตรวจ{' '}
                  <Typography component="span" variant="body2" sx={{ color }}>
                    *
                  </Typography>
                </FormLabel>
                <Controller
                  name="med_error_depname"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="text"
                      placeholder="ระบุชื่อหอผู้ป่วย / ห้องตรวจ"
                      error={!!errors.med_error_depname}
                      helperText={errors.med_error_depname?.message}
                    />
                  )}
                />
              </FormControl>

              {/* สถานะการใช้งาน */}
              <FormControl fullWidth error={!!errors.med_error_is_active}>
                <FormLabel id="med_error_is_active_label">
                  สถานะการใช้งาน{' '}
                  <Typography component="span" variant="body2" sx={{ color: 'red' }}>
                    *
                  </Typography>
                </FormLabel>

                <Controller
                  name="med_error_is_active"
                  control={control}
                  defaultValue="Y"
                  rules={{ required: 'กรุณาเลือกสถานะการใช้งาน' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? 'Y'}
                      labelId="med_error_is_active_label"
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
                <FormHelperText>{errors.med_error_is_active?.message}</FormHelperText>
              </FormControl>

              {/* hidden depcode */}
              <Controller
                name="med_error_depcode"
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
          <Iconify icon={'eva:trash-2-outline'} /> ยืนยันการลบชื่อหอผู้ป่วย / ห้องตรวจ
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            ต้องการลบ{' '}
            <b>
              <u>{`"${selectedID?.med_error_depname}"`}</u>
            </b>{' '}
            ใช่หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={(e) => handleConfirmDelete(e, selectedID?.med_error_depcode)}
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
