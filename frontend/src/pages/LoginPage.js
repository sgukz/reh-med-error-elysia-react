import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// components
import Iconify from '../components/iconify';
// sections
import { LoginForm } from '../sections/auth/login';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden',
  fontFamily: '"Prompt", sans-serif',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledContent = styled('div')(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(8, 0),
  fontFamily: '"Prompt", sans-serif',
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login | Medication error </title>
      </Helmet>

      <StyledRoot className="guk-bg-mesh">
        {/* Animated decorative blobs */}
        <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <Box className="guk-blob guk-blob-1 guk-anim-blob" />
          <Box className="guk-blob guk-blob-2 guk-anim-blob" />
          <Box className="guk-blob guk-blob-3 guk-anim-blob" />
        </Box>
        {/* Subtle grid overlay */}
        <Box aria-hidden="true" className="guk-grid-overlay" />

        <Container maxWidth="sm">
          <StyledContent className="guk-anim-scale-in">
            <Box
              className="guk-glass-strong"
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                px: { xs: 4, sm: 6 },
                py: { xs: 5, sm: 6 },
              }}
            >
              {/* Top sheen */}
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 24,
                  right: 24,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                }}
              />

              {/* Brand row */}
              <Stack alignItems="center" textAlign="center">
                {/* Pill badge */}
                <Box
                  sx={{
                    mt: 3,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    borderRadius: 999,
                    backgroundColor: 'rgba(239, 246, 255, 0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(191, 219, 254, 0.8)',
                    px: 1.5,
                    py: 0.5,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#1d4ed8',
                  }}
                >
                  <Iconify icon="lucide:sparkles" width={14} sx={{ color: '#3b82f6' }} />
                  ระบบรายงานความคลาดเคลื่อนทางยา
                </Box>

                {/* Heading */}
                <Typography
                  component="h1"
                  className="guk-gradient-text"
                  sx={{
                    mt: 2,
                    fontFamily: '"Prompt", sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                  }}
                >
                  เข้าสู่ระบบ
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontFamily: '"Prompt", sans-serif',
                    fontSize: 14,
                    color: '#475569',
                  }}
                >
                  <Iconify icon="lucide:pill" width={14} sx={{ color: '#94a3b8' }} />
                  โรงพยาบาลร้อยเอ็ด · Medication Error
                </Typography>
              </Stack>

              {/* Form */}
              <Box sx={{ mt: 4 }}>
                <LoginForm />
              </Box>

              {/* Footer */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 4, fontFamily: '"Prompt", sans-serif' }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ fontSize: 12, color: '#64748b' }}>
                  <Iconify icon="lucide:shield-check" width={14} sx={{ color: '#10b981' }} />
                  <Box component="span" sx={{ fontWeight: 500 }}>เชื่อมต่อปลอดภัย</Box>
                </Stack>
                <Box
                  component="code"
                  sx={{
                    fontFamily: '"Prompt", sans-serif',
                    fontSize: 12,
                    color: '#94a3b8',
                    userSelect: 'all',
                  }}
                >
                  v.{process.env.REACT_APP_VERSION}
                </Box>
              </Stack>
            </Box>

            {/* Caption */}
            <Typography
              className="guk-anim-fade-in"
              sx={{
                mt: 3,
                textAlign: 'center',
                fontFamily: '"Prompt", sans-serif',
                fontSize: 12,
                color: '#64748b',
                animationDelay: '0.3s',
              }}
            >
              สำหรับเจ้าหน้าที่ผู้มีสิทธิ์เข้าใช้งานระบบเท่านั้น
            </Typography>

            {/* Hospital link */}
            <Box className="guk-anim-fade-in" sx={{ mt: 0.5, textAlign: 'center', animationDelay: '0.4s' }}>
              <Link
                href="https://reh.moph.go.th/"
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  fontFamily: '"Prompt", sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#1d4ed8',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 1,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#1e3a8a' },
                }}
              >
                เว็บไซต์โรงพยาบาลร้อยเอ็ด
                <Iconify icon="lucide:external-link" width={11} />
              </Link>
            </Box>

            {/* Powered by footer */}
            <Typography
              sx={{
                mt: 2,
                textAlign: 'center',
                fontFamily: '"Prompt", sans-serif',
                fontSize: 11,
                color: '#94a3b8',
              }}
            >
              &copy; {new Date().getFullYear()} Powered by ศูนย์คอมพิวเตอร์ โรงพยาบาลร้อยเอ็ด
            </Typography>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
