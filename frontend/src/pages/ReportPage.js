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
import Chip from '@mui/material/Chip';

// Lib Auth
import { verifyToken } from '../libs/Auth';

// Section Report
import ReportSummary1 from '../sections/reports/ReportSummary1';
import ReportSummary3 from '../sections/reports/ReportSummary3';
import ReportSummary4 from '../sections/reports/ReportSummary4';
import ReportSummary6 from '../sections/reports/ReportSummary6';
import ReportSummary7 from '../sections/reports/ReportSummary7';
import ReportSummary8 from '../sections/reports/ReportSummary8';
import ReportSummary9 from '../sections/reports/ReportSummary9';
import ReportSummary10 from '../sections/reports/ReportSummary10';

export default function ReportPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState('1');

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    async function checkVerifyToken() {
      const verify = await verifyToken(null);
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
                  <Tab label="หน่วยงานที่เกิดอุบัติการณ์" value="3" />
                  <Tab 
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>คู่ยาคลาดเคลื่อน</span>
                        <Chip label="New" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                      </Stack>
                    } 
                    value="4" 
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>สรุปอุบัติการณ์ที่ได้ RCA แล้ว</span>
                        <Chip label="New" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                      </Stack>
                    }
                    value="6"
                  />
                  <Tab label="แยกการรายงานอุบัติการณ์ตามผู้รายงาน" value="7" />
                  <Tab label="รายงานความคลาดเคลื่อน" value="8" />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>รายงานแยกรายละเอียด Error</span>
                        <Chip label="New" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                      </Stack>
                    }
                    value="9"
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>สถิติจำนวนใบสั่งยา/วันนอน</span>
                        <Chip label="New" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                      </Stack>
                    }
                    value="10"
                  />
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
              <TabPanel value="4">
                <ReportSummary4 />
              </TabPanel>
              {/* <TabPanel value="5">
                <ReportSummary5 />
              </TabPanel> */}
              <TabPanel value="6">
                <ReportSummary6 />
              </TabPanel>
              <TabPanel value="7">
                <ReportSummary7 />
              </TabPanel>
              <TabPanel value="8">
                <ReportSummary8 />
              </TabPanel>
              <TabPanel value="9">
                <ReportSummary9 />
              </TabPanel>
              <TabPanel value="10">
                <ReportSummary10 />
              </TabPanel>
            </TabContext>
          </Box>
        </Card>
      </Container>
    </>
  );
}
