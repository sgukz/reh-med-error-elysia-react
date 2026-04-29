import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar } from '@mui/material';

// hooks
import useResponsive from '../../../hooks/useResponsive';

// components
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import NavConfig from './config';

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  background: 'linear-gradient(135deg, rgba(204, 251, 241, 0.7), rgba(236, 253, 245, 0.55))',
  border: '1px solid rgba(153, 246, 228, 0.55)',
  boxShadow: '0 8px 24px -10px rgba(20, 184, 166, 0.25)',
  transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 14px 30px -10px rgba(20, 184, 166, 0.35)',
  },
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
  user: PropTypes.array,
};

export default function Nav({ openNav, onCloseNav, user }) {
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');
  // const navOption = user[0].rule === 9 ? NavConfig.navAdmin : NavConfig.navConfig
  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Logo with float + glow */}
      <Box
        className="guk-stagger"
        sx={{
          px: 2.5,
          py: 3,
          display: 'flex',
          justifyContent: 'flex-start',
          animationDelay: '0.05s',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            aria-hidden="true"
            className="guk-anim-pulse-glow"
            sx={{
              position: 'absolute',
              inset: -6,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(94,234,212,0.35), rgba(110,231,183,0.35))',
              filter: 'blur(12px)',
            }}
          />
          <Box
            className="guk-anim-float"
            component="img"
            src={`${process.env.REACT_APP_BASE_URL}/assets/images/reh_logo.png`}
            alt="โลโก้โรงพยาบาลร้อยเอ็ด"
            sx={{ position: 'relative', height: 56, width: 'auto' }}
          />
        </Box>
      </Box>

      {/* User card */}
      <Box
        className="guk-stagger"
        sx={{ mb: 4, mx: 2.5, animationDelay: '0.15s' }}
      >
        <Link underline="none">
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
                      width: 48,
                      height: 48,
                      border: '2px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)',
                    }}
                  />
                );
              })}
            <Box sx={{ ml: 2 }}>
              {user &&
                user.map((_user) => (
                  <div key={_user.loginname}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: '"Prompt", sans-serif', color: '#0f766e', fontWeight: 700 }}
                    >
                      {_user.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: '"Prompt", sans-serif', color: '#475569', fontSize: 12 }}
                    >
                      {`${_user.entryposition} (${_user.groupname})`}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        pt: 1,
                        fontFamily: '"Prompt", sans-serif',
                        color: '#94a3b8',
                        fontSize: 10,
                      }}
                    >
                      {`v.${process.env.REACT_APP_VERSION}`}
                    </Typography>
                  </div>
                ))}
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      {/* Nav menu */}
      <Box className="guk-stagger" sx={{ animationDelay: '0.25s' }}>
        {user &&
          user.map((val) => (
            <div key={val.loginname}>
              <NavSection data={val.rule === 9 ? NavConfig.navAdmin : NavConfig.navConfig} />
            </div>
          ))}
      </Box>

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: openNav ? NAV_WIDTH : 0 },
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      {isDesktop ? (
        <Drawer
          open={openNav}
          variant="persistent"
          PaperProps={{
            className: 'guk-nav-panel',
            sx: {
              width: NAV_WIDTH,
              borderRightStyle: 'solid',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            className: 'guk-nav-panel',
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
