import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

// Lib Auth
import { verifyToken, getTokenFromLocalStorage } from '../libs/Auth';

// Section Report
import ReportSummary1 from '../sections/reports/ReportSummary1';
import ReportSummary3 from '../sections/reports/ReportSummary3';
import ReportSummary7 from '../sections/reports/ReportSummary7';
import ReportSummary8 from '../sections/reports/ReportSummary8';

export default function ReportPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState('1');

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    async function checkVerifyToken() {
      const auth_token = getTokenFromLocalStorage('access_token');
      const verify = await verifyToken(auth_token);
      const { statusCode, profile, access_token } = verify || {};
      if (!(statusCode === 200 && profile && access_token)) {
        navigate('/login', { replace: true });
      }
    }
    checkVerifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>รายงาน | Medication error</title>
      </Helmet>
      <Container maxWidth="false">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            รายงาน Medication error
          </Typography>
        </Stack>
        <Card>
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList
                  onChange={handleChange}
                  aria-label="Report Tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  <Tab label="แยกตามสถานที่เกิดเหตุ" value="1" />
                  {/* <Tab label="สรุปอุบัติการณ์ความคลาดเคลื่อนหน่วยงานที่พบ" value="2" /> */}
                  <Tab label="หน่วยงานที่เกิดอุบัติการณ์" value="3" />
                  {/* <Tab label="คู่ยาที่มีความคลาดเคลื่อน (Pending)" value="4" /> */}
                  {/* <Tab label="สรุปอุบัติการณ์ความคลาดเคลื่อนแยก OPD - IPD - ผลิต - คลัง" value="5" /> */}
                  {/* <Tab label="สรุปอุบัติการณ์ที่ได้ RCA แล้ว (Pending)" value="6" /> */}
                  <Tab label="แยกการรายงานอุบัติการณ์ตามผู้รายงาน" value="7" />
                  <Tab label="รายงานความคลาดเคลื่อน" value="8" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <ReportSummary1 />
              </TabPanel>
              {/* <TabPanel value="2">
                <ReportSummary2 />
              </TabPanel> */}
              <TabPanel value="3">
                <ReportSummary3 />
              </TabPanel>
              {/* <TabPanel value="4">
                <ReportSummary4 />
              </TabPanel> */}
              {/* <TabPanel value="5">
                <ReportSummary5 />
              </TabPanel> */}
              {/* <TabPanel value="5">
                <ReportSummary6 />
              </TabPanel>
               */}
              <TabPanel value="7">
                <ReportSummary7 />
              </TabPanel>
              <TabPanel value="8">
                <ReportSummary8 />
              </TabPanel>
            </TabContext>
          </Box>
        </Card>
      </Container>
    </>
  );
}
