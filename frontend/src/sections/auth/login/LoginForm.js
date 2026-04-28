import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// @mui
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';

// import _ from 'lodash';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage, removeTokenFromLocalStorage } from '../../../libs/Auth';

// Route API
import { API_ROUTE } from '../../../utils/constants';

// Axios
import { useAxios } from '../../../utils/axiosConfig';
// Auth
import { useAuth } from '../../../contexts/AuthContext';
// components
import Iconify from '../../../components/iconify';

// Schema สำหรับตรวจสอบข้อมูล
const loginSchema = z.object({
  userName: z.string().min(6, 'กรุณาระบุชื่อผู้ใช้').max(6, 'ระบุชื่อผู้ใช้งานให้ถูกต้อง'),
  userPass: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export default function LoginForm() {
  const API = useAxios();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [messageAlert, setMessageAlert] = useState({
    msg: '',
    type: 'info',
  });
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (dataForm) => {
    try {
      setIsLoading(true);
      setOpen(true);
      setLoadingMessage('กำลังเข้าสู่ระบบ...');
      const userData = dataForm;

      const CheckLogin = await API.post(API_ROUTE.AUTH, userData);

      const { statusCode, access_token } = CheckLogin.data;
      if (access_token) {
        setTimeout(() => {
          login(access_token);
          setOpen(false);
          setMessageAlert({
            msg: 'เข้าสู่ระบบสำเร็จ...',
            type: 'success',
          });
        }, 1000);
        setTimeout(() => {
          setOpen(true);
          setLoadingMessage('กำลังไปยังหน้าหลัก....');
        }, 1800);

        setTimeout(() => {
          navigate('/lists/med', { replace: true });
        }, 2400);
      }

      if (statusCode && statusCode === 400) {
        setTimeout(() => {
          setOpen(false);
          setIsLoading(false);
          setMessageAlert({
            msg: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
            type: 'error',
          });
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error) {
        setOpen(false);
        setIsLoading(false);
        setMessageAlert({
          msg: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
          type: 'error',
        });
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    async function checkVerifyToken() {
      try {
        setIsLoading(true);
        const auth_token = getTokenFromLocalStorage('access_token');
        const verify = await verifyToken(auth_token);
        const { statusCode, profile, access_token } = verify;
        if (statusCode === 200 && profile) {
          if (access_token) {
            setOpen(true);
            setLoadingMessage('กำลังไปยังหน้าหลัก....');
            setIsLoading(false);
            setTimeout(() => {
              navigate('/lists/med', { replace: true });
            }, 1500);
          }
        } else {
          setOpen(false);
          setIsLoading(false);
          removeTokenFromLocalStorage('access_token');
        }
      } catch (error) {
        setIsLoading(false);
        if (error instanceof Error) {
          const { response } = error;
          setMessageAlert({
            msg: response.statusText,
            type: 'error',
          });
          setOpen(false);
        }
      }
    }
    checkVerifyToken();
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
        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isLoading} sx={{ mt: 2 }}>
          <Iconify icon={'ic:baseline-key'} width={32} sx={{ mr: 1 }} /> {'ล็อคอิน'}
        </LoadingButton>
      </Box>
    </>
  );
}
