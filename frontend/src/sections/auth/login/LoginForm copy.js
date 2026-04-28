import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// @mui
import { Stack, IconButton, InputAdornment, TextField, Box, Alert, Typography } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { LoadingButton } from '@mui/lab';
import _ from 'lodash';
// components
import Iconify from '../../../components/iconify';
import { removeTokenFromLocalStorage, getTokenFromLocalStorage, getAuthenticatedVerify } from '../../../libs/Auth';
import { API_ROUTE, CLIENT } from '../../../utils/constants';

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    userName: null,
    userPass: null,
  });
  const [errorForm, setErrorForm] = useState({
    userName: false,
    userPass: false,
  });
  const [messageAlert, setMessageAlert] = useState({
    msg: '',
    type: '',
  });
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmitHandler = (event) => {
    if (
      (userForm.userName === null || userForm.userName === '') &&
      (userForm.userPass === null || userForm.userPass === '')
    ) {
      setErrorForm((prevState) => ({
        ...prevState,
        userName: true,
        userPass: true,
      }));
    } else if (
      (userForm.userName !== null || userForm.userName !== '') &&
      (userForm.userPass === null || userForm.userPass === '')
    ) {
      setErrorForm((prevState) => ({
        ...prevState,
        userPass: true,
      }));
    } else if (
      (userForm.userPass !== null || userForm.userPass !== '') &&
      (userForm.userName === null || userForm.userName === '')
    ) {
      setErrorForm((prevState) => ({
        ...prevState,
        userName: true,
      }));
    } else {
      setIsLoading(true);
      setTimeout(() => {
        handleLogin(userForm);
      }, 1500);
    }
    event.preventDefault();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (value === '') {
      setErrorForm((prevState) => ({
        ...prevState,
        [name]: true,
      }));
      setUserForm((prevState) => ({
        ...prevState,
        [name]: '',
      }));
    } else {
      setErrorForm((prevState) => ({ ...prevState, [name]: false }));
      setUserForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleLogin = async (formLogin) => {
    const URL = `${API_ROUTE.AUTH}`;
    const header = {
      'Content-Type': 'application/json',
      'client-id': CLIENT.ID,
      'client-token': CLIENT.TOKEN,
    };

    try {
      const checkLogin = await axios.post(URL, formLogin, { headers: header });
      const { data, status } = checkLogin;

      if (status === 200 && !_.isUndefined(data) && !_.isEmpty(data)) {
        const accessToken = data[0]?.access_token;
        try {
          const checkToken = await getAuthenticatedVerify(accessToken);
          const { statusCode, userList } = checkToken;
          if (statusCode === 200 && !_.isEmpty(userList)) {
            setIsLoading(false);
            setMessageAlert({
              msg: 'Loggin success',
              type: 'success',
            });
            setLoadingMessage('กำลังไปยังหน้าหลัก....');
            setOpen(true);
            const loginname = userList[0].loginname.substring(0, 3);
            if (loginname === '103') {
              navigate('/lists/med?ac=2', { replace: true });
            } else {
              navigate('/lists/med?ac=1', { replace: true });
            }
            // setTimeout(() => {

            // }, 1500);
          } else {
            setMessageAlert({
              msg: 'Login fail!',
              type: 'error',
            });
          }
        } catch (error) {
          handleCatchAxios(error);
        }
      }
    } catch (error) {
      handleCatchAxios(error);
    }
  };

  const handleCatchAxios = (errorCatch) => {
    if (errorCatch.response) {
      const { data } = errorCatch.response;
      setMessageAlert({
        msg: `${data?.statusMessage}`,
        type: 'error',
      });
    } else if (errorCatch.request) {
      setMessageAlert({
        msg: `เกิดข้อผิดพลาดบางอย่าง, ขออภัยในความไม่สะดวก!`,
        type: 'error',
      });
    } else {
      setMessageAlert({
        msg: `เกิดข้อผิดพลาดบางอย่าง, ขออภัยในความไม่สะดวก!`,
        type: 'error',
      });
    }
    setIsLoading(!true);
  };

  useEffect(() => {
    async function verifyToken(accessToken) {
      try {
        const checkToken = await getAuthenticatedVerify(accessToken);
        const { statusCode, userList } = checkToken;
        if (statusCode === 200 && !_.isEmpty(userList)) {
          setIsLoading(false);
          setOpen(true);
          setLoadingMessage('กำลังไปยังหน้าหลัก....');
          const loginname = userList[0].loginname.substring(0, 3);
          if (loginname === '103') {
            navigate('/lists/med?ac=2', { replace: true });
          } else {
            navigate('/lists/med?ac=1', { replace: true });
          }
          setLoadingMessage('');
          setOpen(false);
          setIsLoading(false);
        } else {
          removeTokenFromLocalStorage('token_med_error');
        }
      } catch (error) {
        handleCatchAxios(error);
      }
    }
    const token = getTokenFromLocalStorage('token_med_error');
    setOpen(true);
    setLoadingMessage(` Loading`);
    if (token) {
      setTimeout(() => {
        setOpen(false);
        setLoadingMessage('');
        verifyToken(token);
      }, 2000);
    } else {
      setLoadingMessage('');
      setOpen(false);
    }
  }, []);

  return (
    <>
      <Backdrop
        sx={{
          color: '#fff',
          backgroundColor: '#8fd2c7',
          zIndex: (theme) => theme.zIndex.drawer + 10,
          textAlign: 'center',
        }}
        open={open}
        onClick={handleClose}
      >
        <CircularProgress color="inherit" sx={{ mr: 1 }} />
        <Typography variant="body1">{loadingMessage}</Typography>
      </Backdrop>

      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {messageAlert.msg !== '' && (
            <>
              <Alert variant="outlined" severity={messageAlert.type}>
                {messageAlert.msg}
              </Alert>
            </>
          )}
          <TextField
            type="text"
            label="ชื่อผู้ใช้งาน"
            {...register('userName')}
            error={!!errors.userName}
            helperText={errors.userName?.message}
            autoFocus
          />

          <TextField
            label="รหัสผ่าน"
            type={showPassword ? 'text' : 'password'}
            {...register('userPass')}
            error={!!errors.userPass}
            helperText={errors.userPass?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Button fullWidth size="large" type="submit" variant="contained" loading={isLoading} sx={{ mt: 2 }}>
          <Iconify icon={'ic:baseline-key'} width={32} sx={{ mr: 1 }} /> {'ล็อคอิน'}
        </Button>
      </Box>
    </>
  );
}
