import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
//
import Header from './header';
import Nav from './nav';
import { verifyToken } from '../../libs/Auth';

// hooks
import useResponsive from '../../hooks/useResponsive';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

// hooks


// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const navigate = useNavigate();
  const isDesktop = useResponsive('up', 'lg');

  const [userProfile, setUserProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [openNav, setOpenNav] = useState(true);

  useEffect(() => {
    async function checkVerifyToken() {
      const auth_token = localStorage.getItem('access_token');

      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;
      
      if (statusCode === 200 && profile) {
        if (access_token) {
          setUserProfile([profile]);
        }
      } else {
        navigate('/login', { replace: true });
      }
    }

    checkVerifyToken();
    // if (!auth.user) {
    // } else {
    //   setUserProfile([auth.user]);
    // }
  }, []);

  const handleNavToggle = () => {
    if (isDesktop) {
      setOpenNav(!openNav);
    } else {
      setOpen(!open);
    }
  };

  return (
    <StyledRoot>
      <Header user={userProfile} onOpenNav={handleNavToggle} openNav={openNav} />

      <Nav user={userProfile} openNav={isDesktop ? openNav : open} onCloseNav={() => setOpen(false)} />

      <Main>
        <Outlet context={userProfile} />
      </Main>
    </StyledRoot>
  );
}
