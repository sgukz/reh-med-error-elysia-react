import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
//
import NotificationsPopover from './NotificationsPopover';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;
const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

Header.propTypes = {
  onOpenNav: PropTypes.func,
  user: PropTypes.any,
  openNav: PropTypes.bool,
};

const StyledRoot = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'openNav',
})(({ theme, openNav }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderBottom: '1px solid rgba(153, 246, 228, 0.4)',
  boxShadow: '0 4px 24px -16px rgba(20, 184, 166, 0.25)',
  [theme.breakpoints.up('lg')]: {
    width: openNav ? `calc(100% - ${NAV_WIDTH + 1}px)` : '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export default function Header({ onOpenNav, openNav, user }) {
  return (
    <StyledRoot openNav={openNav}>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: '#0d9488',
            background: 'linear-gradient(135deg, rgba(94,234,212,0.18), rgba(110,231,183,0.18))',
            border: '1px solid rgba(153, 246, 228, 0.6)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
            '&:hover': {
              transform: 'rotate(-8deg) scale(1.05)',
              background: 'linear-gradient(135deg, rgba(94,234,212,0.3), rgba(110,231,183,0.3))',
              boxShadow: '0 6px 18px -8px rgba(20, 184, 166, 0.5)',
            },
          }}
        >
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        {/* Title แสดงเฉพาะจอใหญ่ */}
        <Box
          sx={{
            ml: 1.5,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            className="guk-anim-float"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6, #10b981)',
              boxShadow: '0 0 0 4px rgba(20, 184, 166, 0.18)',
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Prompt", sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#0f766e',
              letterSpacing: '0.02em',
            }}
          >
            ระบบรายงานความคลาดเคลื่อนทางยา
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1,
          }}
        >
          <NotificationsPopover users={user} />
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}
