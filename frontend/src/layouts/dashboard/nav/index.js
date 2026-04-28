import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar } from '@mui/material';

// hooks
import useResponsive from '../../../hooks/useResponsive';

// components
// import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import NavConfig from './config';

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
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
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Box component="img" src={`${process.env.REACT_APP_BASE_URL}/assets/images/reh_logo.png`} />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            {user &&
              user.map((_user) => {
                const urlAvatar = `${process.env.REACT_APP_BASE_URL}/assets/images/avatars/${_user.url_avatar}`;
                return <Avatar key={_user} src={urlAvatar} alt={_user.loginname} />;
              })}
            <Box sx={{ ml: 2 }}>
              {user &&
                user.map((_user) => (
                  <div key={_user}>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                      {_user.name}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {`${_user.entryposition} (${_user.groupname})`}
                    </Typography>
                    <Typography variant="caption" gutterBottom sx={{ display: 'block', pt: 2 }}>
                      {`version.${process.env.REACT_APP_VERSION}`}
                    </Typography>
                  </div>
                ))}
            </Box>
          </StyledAccount>
        </Link>
      </Box>
      {user &&
        user.map((val) => (
          <div key={val}>
            <NavSection data={val.rule === 9 ? NavConfig.navAdmin : NavConfig.navConfig} />
          </div>
        ))}

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
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
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
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
