import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
// @mui
import Container from '@mui/material/Container';
import _ from 'lodash';
import MedErrorForm from '../sections/med-error/MedErrorForm';
// import MedErrorPharmForm from '../sections/med-error/MedErrorPharmForm';
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';

// import
export default function FormMedErrorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function checkVerifyToken() {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify;
      if (statusCode === 200 && profile) {
        if (access_token) {
          setUser([profile]);
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
  }, []);
  return (
    <>
      <Helmet>
        <title> Register | Medication error </title>
      </Helmet>
      <Container maxWidth="false">
        <MedErrorForm userLogin={user} />
      </Container>
    </>
  );
}
