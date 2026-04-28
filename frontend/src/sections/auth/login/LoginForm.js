import { useEffect, useState, useRef } from 'react';
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
  userName: z
    .string()
    .min(1, 'กรุณาระบุชื่อผู้ใช้')
    .max(64, 'ชื่อผู้ใช้ยาวเกินกำหนด'),
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

  const timersRef = useRef([]);
  const isMountedRef = useRef(true);

  const safeSetState = (setter, value) => {
    if (isMountedRef.current) setter(value);
  };

  const scheduleTimer = (fn, delay) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      if (isMountedRef.current) fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  };

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

      const CheckLogin = await API.post(API_ROUTE.AUTH, dataForm);
      const { statusCode, access_token } = CheckLogin.data || {};

      if (access_token) {
        scheduleTimer(() => {
          login(access_token);
          safeSetState(setOpen, false);
          safeSetState(setMessageAlert, { msg: 'เข้าสู่ระบบสำเร็จ...', type: 'success' });
        }, 600);
        scheduleTimer(() => {
          safeSetState(setOpen, true);
          safeSetState(setLoadingMessage, 'กำลังไปยังหน้าหลัก...');
        }, 900);
        scheduleTimer(() => {
          navigate('/lists/med', { replace: true });
        }, 1300);
        return;
      }

      // กรณี response ไม่มี access_token (statusCode != 200)
      safeSetState(setOpen, false);
      safeSetState(setIsLoading, false);
      const errMsg =
        statusCode === 401 || statusCode === 400 || statusCode === 404
          ? 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
          : 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่';
      safeSetState(setMessageAlert, { msg: errMsg, type: 'error' });
    } catch (error) {
      safeSetState(setOpen, false);
      safeSetState(setIsLoading, false);
      const status = error?.response?.status;
      let msg = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      if (status === 401 || status === 400 || status === 403) {
        msg = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
      } else if (!error?.response) {
        msg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
      }
      safeSetState(setMessageAlert, { msg, type: 'error' });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    async function checkVerifyToken() {
      const auth_token = getTokenFromLocalStorage('access_token');
      if (!auth_token) return;
      try {
        setIsLoading(true);
        const verify = await verifyToken(auth_token);
        if (cancelled || !verify) {
          safeSetState(setIsLoading, false);
          return;
        }
        const { statusCode, profile, access_token } = verify;
        if (statusCode === 200 && profile && access_token) {
          safeSetState(setOpen, true);
          safeSetState(setLoadingMessage, 'กำลังไปยังหน้าหลัก...');
          safeSetState(setIsLoading, false);
          scheduleTimer(() => navigate('/lists/med', { replace: true }), 800);
        } else {
          safeSetState(setOpen, false);
          safeSetState(setIsLoading, false);
          removeTokenFromLocalStorage('access_token');
        }
      } catch (error) {
        safeSetState(setIsLoading, false);
        safeSetState(setOpen, false);
        // token ไม่ valid → ล้างทิ้ง ไม่ต้องแจ้ง user
        removeTokenFromLocalStorage('access_token');
      }
    }
    checkVerifyToken();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Alert variant="outlined" severity={messageAlert.type}>
              {messageAlert.msg}
            </Alert>
          )}
          <TextField
            type="text"
            label="ชื่อผู้ใช้งาน"
            inputProps={{ maxLength: 64, autoComplete: 'username' }}
            {...register('userName')}
            error={!!errors.userName}
            helperText={errors.userName?.message}
            autoFocus
          />

          <TextField
            label="รหัสผ่าน"
            type={showPassword ? 'text' : 'password'}
            inputProps={{ autoComplete: 'current-password' }}
            {...register('userPass')}
            error={!!errors.userPass}
            helperText={errors.userPass?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
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
