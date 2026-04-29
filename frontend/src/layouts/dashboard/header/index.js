import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Typography, Link, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
// components
import Iconify from '../../../components/iconify';

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

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  background: 'linear-gradient(135deg, rgba(204, 251, 241, 0.7), rgba(236, 253, 245, 0.55))',
  border: '1px solid rgba(153, 246, 228, 0.55)',
  boxShadow: '0 8px 24px -10px rgba(20, 184, 166, 0.25)',
  transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 14px 30px -10px rgba(20, 184, 166, 0.35)',
  },
}));

// ----------------------------------------------------------------------

Header.propTypes = {
  onOpenNav: PropTypes.func,
  user: PropTypes.any,
  openNav: PropTypes.bool,
};

export default function Header({ onOpenNav, openNav, user }) {
  const navigate = useNavigate();
  const [isLogout, setIsLogout] = useState(false);

  const handleLogout = () => {
    setIsLogout(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  };

  const handleClose = (e) => {
    setIsLogout(false);
    if (e) e.preventDefault();
  };

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

        <Box
          sx={{
            ml: 1.5,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 10,
              height: 10,
              mr: 0.5
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(20, 184, 166, 0.6)',
                animation: 'guk-pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 1.5,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              }}
            />
          </Box>
          <Typography
            className="guk-gradient-text-teal"
            sx={{
              fontFamily: '"Prompt", sans-serif',
              fontSize: 15,
              fontWeight: 700,
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
          {/* User card in Header */}
          <Tooltip title="คลิกเพื่อออกจากระบบ">
            <Link underline="none" onClick={handleLogout}>
              <StyledAccount>
                {user &&
                  user.map((_user) => {
                    const urlAvatar = `${process.env.REACT_APP_BASE_URL}/assets/images/avatars/${_user.url_avatar}`;
                    return (
                      <Avatar
                        key={_user.loginname}
                        src={urlAvatar}
                        alt={_user.loginname}
                        sx={{
                          width: 36,
                          height: 36,
                          border: '2px solid rgba(255,255,255,0.8)',
                          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)',
                        }}
                      />
                    );
                  })}
                <Box sx={{ ml: 1.5, display: { xs: 'none', sm: 'block' } }}>
                  {user &&
                    user.map((_user) => (
                      <div key={_user.loginname}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontFamily: '"Prompt", sans-serif', color: '#0f766e', fontWeight: 700, fontSize: 13 }}
                        >
                          {_user.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: '"Prompt", sans-serif', color: '#475569', fontSize: 11 }}
                        >
                          {`${_user.entryposition}`}
                        </Typography>
                      </div>
                    ))}
                </Box>
              </StyledAccount>
            </Link>
          </Tooltip>

          {/* Logout Dialog */}
          <Dialog
            open={Boolean(isLogout)}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              sx: {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 24px 48px -16px rgba(20, 184, 166, 0.3)',
                border: '1px solid rgba(153, 246, 228, 0.6)',
              }
            }}
          >
            <DialogTitle 
              id="alert-dialog-title" 
              sx={{ 
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)', 
                color: 'common.white', 
                fontFamily: '"Prompt", sans-serif',
                fontWeight: 600,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pb: 2
              }}
            >
              <Iconify icon="eva:log-out-outline" sx={{ width: 24, height: 24 }} />
              ยืนยันการออกจากระบบ
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3, pb: 2 }}>
              <DialogContentText 
                sx={{ 
                  fontSize: '15px', 
                  fontFamily: '"Prompt", sans-serif', 
                  color: '#334155',
                  fontWeight: 500,
                  pt: 1.5
                }}
              >
                คุณต้องการออกจากระบบจากระบบใช่หรือไม่?
              </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
              <Button 
                onClick={handleClose} 
                variant="outlined"
                color="inherit"
                sx={{ 
                  fontFamily: '"Prompt", sans-serif', 
                  borderColor: 'rgba(148, 163, 184, 0.5)',
                  color: '#475569',
                  '&:hover': {
                    borderColor: '#64748b',
                    background: 'rgba(148, 163, 184, 0.1)'
                  }
                }}
                startIcon={<Iconify icon={'eva:close-outline'} />}
              >
                ยกเลิก
              </Button>
              
              <Button 
                onClick={handleConfirmLogout} 
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                  fontFamily: '"Prompt", sans-serif', 
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)'
                  }
                }}
                startIcon={<Iconify icon={'eva:log-out-fill'} />}
                autoFocus
              >
                ยืนยันออกจากระบบ
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}

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
