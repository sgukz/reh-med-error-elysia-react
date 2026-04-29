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
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
// Sweetalert
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { red } from '@mui/material/colors';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';
// Lib MedError
import { getMedErrorPerson, personCreate, personDelete } from '../libs/MedError';


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

const TABLE_HEAD_PERSON = [
  { id: 'error_key_person_name', label: 'ชื่อ - สกุล', alignRight: false, alignHead: 'left' },
  { id: 'error_key_sec', label: 'ประเภทตำแหน่ง', alignRight: false, alignHead: 'center' },
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
    return filter(array, (_person) => _person.error_key_person_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const getSecChipStyle = (secId) => {
  switch (secId) {
    case 1: // เภสัชกร
      return { backgroundColor: 'rgba(20, 184, 166, 0.15)', color: '#0d9488', border: '1px solid rgba(20, 184, 166, 0.4)', fontWeight: 600 };
    case 2: // พนักงานประจำห้องยา
      return { backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5', border: '1px solid rgba(79, 70, 229, 0.4)', fontWeight: 600 };
    case 3: // เจ้าพนักงานเภสัชกรรม
      return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 600 };
    case 4: // อื่นๆ
      return { backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.4)', fontWeight: 600 };
    default:
      return { backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.4)', fontWeight: 600 };
  }
};

// import
export default function OfficerPage() {
  const navigate = useNavigate();
  const [, setIsOpen] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selectedID, setSelectedID] = useState(null);
  const [token, setToken] = useState(getTokenFromLocalStorage('access_token'));

  const [orderBy, setOrderBy] = useState('error_key_sec');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [medErrorPerson, setMedErrorPerson] = useState([]);
  const [formPerson, setFormPerson] = useState({
    error_key_person_name: '',
    error_key_sec: '',
  });

  const [isNotify, setIsNotify] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState({
    type: '',
    title: '',
    text: '',
    sec: '',
  });

  const [formPersonRule, setFormPersonRule] = useState({
    error_key_person_name: {
      error: false,
      message: 'โปรดระบุ ชื่อ - สกุล',
    },
    error_key_sec: {
      error: false,
      message: 'โปรดเลือกประเภทตำแหน่ง',
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

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenMenu = (event, objPerson) => {
    setOpen(event.currentTarget);
    setSelectedID(objPerson);
  };

  const handleClose = (e) => {
    setIsOpenDelete(!true);
    e.preventDefault();
  };

  const handleChangeInput = (event) => {
    const { name, value } = event.target;
    setFormPerson((prestate) => ({
      ...prestate,
      [name]: value,
    }));
  };

  const onSubmitHandler = (event) => {
    const formFields = Object.keys(formPerson);
    let newFormValues = { ...formPersonRule };
    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formPerson[currentField];
      if (currentValue === '') {
        if (formPersonRule[currentField]) {
          newFormValues = {
            ...newFormValues,
            [currentField]: {
              ...newFormValues[currentField],
              error: true,
            },
          };
        }
      } else {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...newFormValues[currentField],
            error: false,
          },
        };
      }
    }
    setFormPersonRule(newFormValues);
    const chkError = Object.keys(newFormValues);
    let isValid = 0;
    for (let index = 0; index < chkError.length; index++) {
      const currentErrorField = chkError[index];
      const currentErrorValue = newFormValues[currentErrorField];
      if (currentErrorValue.error) {
        isValid += 1;
      }
    }

    async function create() {
      try {
        const formPersons = await personCreate(formPerson, token);
        const { statusCode, section, personList } = formPersons.data;
        if (statusCode === 201 && section === 'create') {
          Toast.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลเรียบร้อย',
          });
        } else if (statusCode === 200 && personList.length > 0) {
          Toast.fire({
            icon: 'success',
            title: 'อัพเดทข้อมูลเรียบร้อย',
          });
        }
        loadMedErrorPerson(token);
        setIsNotify(false);
        setIsOpenForm(false);
        setOpen(false);
      } catch (error) {
        handleCatchAxios(error, 'create');
      }
    }

    if (isValid === 0) {
      create();
    }
    event.preventDefault();
  };

  const handleClickOpenForm = () => {
    setIsOpenForm(true);
    setIsOpenDelete(false);
    setFormPerson({
      error_key_person_name: '',
      error_key_sec: '',
    });
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setIsOpenDelete(false);
    setFormPerson({
      error_key_person_name: '',
      error_key_sec: '',
    });
  };

  const handleEdit = (e, id) => {
    const data = filter(medErrorPerson, (_person) => _person.error_key_person_id === id);
    setIsOpenForm(true);
    if (!_.isEmpty(data)) {
      data.map((itemPerson) =>
        setFormPerson({
          error_key_person_id: itemPerson.error_key_person_id,
          error_key_person_name: itemPerson.error_key_person_name,
          error_key_sec: itemPerson.error_key_sec,
        })
      );
    }
    e.preventDefault();
  };

  const handleDelete = (e) => {
    setOpen(!true);
    setIsOpenDelete(true);
    e.preventDefault();
  };

  const handleConfirmDelete = async (e, id) => {
    try {
      const delPerson = await personDelete(id, token);
      const { statusCode, deletePerson } = delPerson.data;
      if (statusCode === 200 && deletePerson > 0) {
        Toast.fire({
          icon: 'success',
          title: 'ลบข้อมูลเรียบร้อย',
        });
        loadMedErrorPerson(token);
        setIsNotify(false);
        setIsOpenDelete(false);
        setOpen(false);
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

  const loadMedErrorPerson = async (auth_accesss) => {
    try {
      const person = await getMedErrorPerson(auth_accesss);
      const { personList, statusCode } = person.data;

      if (statusCode === 200 && personList.length > 0) {
        setMedErrorPerson(personList);
      }
      setFormPerson({
        error_key_person_id: '',
        error_key_person_name: '',
        error_key_sec: '',
      });
      setIsOpen(!true);
    } catch (error) {
      handleCatchAxios(error, 'load');
    }
  };

  const handleNotifyClose = (e, sec) => {
    setIsNotify(false);
    setIsOpenForm(false);
    setNotifyMessage({
      type: '',
      title: '',
      text: '',
      sec: '',
    });
    if (sec !== 'load') loadMedErrorPerson(token);
    e.preventDefault();
  };

  useEffect(() => {
    setIsOpen(true);
    async function checkVerifyToken() {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;
      if (statusCode === 200 && profile) {
        if (access_token) {
          setToken(access_token);
          loadMedErrorPerson(access_token);
        } else {
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyRowsMedError = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - medErrorPerson.length) : 0;

  const filteredOfficer = applySortFilter(medErrorPerson, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredOfficer.length && !!filterName;
  return (
    <>
      <Helmet>
        <title>ข้อมูลเภสัชกร/จพง.เภสัชกรรม/จนท.ห้องยา | Medication error</title>
      </Helmet>
      <Container maxWidth="true">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            ข้อมูลเภสัชกร/จพง.เภสัชกรรม/จนท.ห้องยา
          </Typography>
          <Button onClick={handleClickOpenForm} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            เพิ่มเภสัชกร/จพง.เภสัชกรรม/จนท.ห้องยา
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
                  headLabel={TABLE_HEAD_PERSON}
                  rowCount={medErrorPerson.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredOfficer.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { error_key_person_id, error_key_person_name, error_key_sec, error_key_sec_name } = row;
                    return (
                      <Tooltip title="" key={error_key_person_id}>
                        <TableRow hover style={{ cursor: 'pointer' }} tabIndex={-1}>
                          <TableCell align="left">{error_key_person_name}</TableCell>
                          <TableCell align="center">
                            <Chip label={error_key_sec_name} sx={getSecChipStyle(error_key_sec)} />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="จัดการ">
                              <IconButton
                                size="large"
                                color="info"
                                onClick={(event) =>
                                  handleOpenMenu(event, {
                                    error_key_person_id: error_key_person_id,
                                    error_key_person_name: error_key_person_name,
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
                {medErrorPerson.length === 0 && (
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
            count={medErrorPerson.length}
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
        <MenuItem onClick={(e) => handleEdit(e, selectedID?.error_key_person_id)}>
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
            bgcolor: `${
              selectedID?.error_key_person_id !== undefined && selectedID?.error_key_person_id !== ''
                ? '#ffc400'
                : 'primary.dark'
            }`,
            color: 'common.white',
          }}
        >
          {selectedID?.error_key_person_id !== undefined && selectedID?.error_key_person_id !== ''
            ? 'แก้ไขข้อมูลเภสัชกร / จนท.'
            : 'เพิ่มข้อมูลเภสัชกร / จนท.'}
        </DialogTitle>
        <Box component="form" noValidate autoComplete="off" onSubmit={onSubmitHandler} sx={{ py: 2, px: 2 }}>
          <DialogContent tabIndex={-1}>
            <Stack spacing={3}>
              <FormControl error={formPersonRule.error_key_person_name.error}>
                <FormLabel id="error_ward_label">
                  ชื่อ - สกุล{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                <TextField
                  type="text"
                  label={`(ไม่ต้องระบุคำนำหน้า)`}
                  value={`${formPerson.error_key_person_name}`}
                  id="error_key_person_name"
                  name="error_key_person_name"
                  onChange={handleChangeInput}
                  placeholder="ระบุชื่อ - สกุล (ไม่ต้องระบุคำนำหน้า)"
                  error={formPersonRule.error_key_person_name.error}
                  helperText={
                    formPersonRule.error_key_person_name.error && formPersonRule.error_key_person_name.message
                  }
                />
              </FormControl>

              <FormControl fullWidth error={formPersonRule.error_key_sec.error}>
                <FormLabel id="error_key_sec_label">
                  ประเภทตำแหน่ง{' '}
                  <Typography variant="span" style={{ color: color }}>
                    *
                  </Typography>
                </FormLabel>
                {/* <InputLabel id="error_key_sec_label">ประเภทตำแหน่ง <Typography variant="span" style={{ color: color }}>*</Typography></InputLabel> */}
                <Select
                  labelId="error_key_sec_label"
                  name="error_key_sec"
                  value={formPerson.error_key_sec}
                  label="เลือกประเภทตำแหน่ง"
                  onChange={handleChangeInput}
                >
                  <MenuItem value={1}>เภสัชกร</MenuItem>
                  <MenuItem value={2}>พนักงานประจำห้องยา</MenuItem>
                  <MenuItem value={3}>เจ้าพนักงานเภสัชกรรม</MenuItem>
                  <MenuItem value={4}>อื่นๆ</MenuItem>
                </Select>
                <FormHelperText>
                  {formPersonRule.error_key_sec.error && formPersonRule.error_key_sec.message}
                </FormHelperText>
              </FormControl>
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
        <DialogTitle sx={{ bgcolor: '#c62828', color: 'common.white' }}>ยืนยันการลบข้อมูลเภสัช / จนท.</DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            ต้องการลบ{' '}
            <b>
              <u>{`"${selectedID?.error_key_person_name}"`}</u>
            </b>{' '}
            ใช่หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={(e) => handleConfirmDelete(e, selectedID?.error_key_person_id)}
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
