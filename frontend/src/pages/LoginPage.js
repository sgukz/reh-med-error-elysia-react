import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

// hooks
// import useResponsive from '../hooks/useResponsive';
// components
// import Logo from '../components/logo';
import Iconify from '../components/iconify';
// sections
import { LoginForm } from '../sections/auth/login';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));


const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login | Medication error </title>
      </Helmet>

      <StyledRoot>
        <Container maxWidth="sm">
          <StyledContent>
            <Typography
              variant="h2"
              style={{
                fontWeight: 'bold',
                color: '#8fd2c7',
                textAlign: 'center',
                letterSpacing: '5px',
                textShadow: '0px 5px 10px rgba(152, 212, 202, 0.9)',
              }}
            >
              Medication error
            </Typography>
            <Typography
              variant="h5"
              style={{ textAlign: 'center', paddingTop: '15px', fontWeight: '600' }}
              gutterBottom
            >
              Login with your account
            </Typography>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {`⭐`}
                  </Typography>
                </Divider>
            <Stack>
              <LoginForm />
            </Stack>
            <Typography variant="body2" sx={{ mt: 5, textAlign: 'center' }}>
              {`version ${process.env.REACT_APP_VERSION} `}&copy;Copyright {new Date().getFullYear()} <br />
              Powered by ศูนย์คอมพิวเตอร์{' '}
              <Link href="https://reh.moph.go.th/" underline="none" rel="noreferrer" variant="subtitle2">
                โรงพยาบาลร้อยเอ็ด
              </Link>
            </Typography>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
