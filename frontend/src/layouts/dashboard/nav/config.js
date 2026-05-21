// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`${process.env.REACT_APP_BASE_URL}/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navAdmin = [
  {
    title: 'Dashboard',
    path: '/dashboard/app',
    icon: icon('dashboard'),
  },
  {
    title: 'Med error',
    path: '/lists/med',
    icon: icon('drug-svgrepo-com'),
  },
  {
    title: 'ข้อมูลหอผู้ป่วย / ห้องตรวจ',
    path: '/department/main',
    icon: icon('the-construction'),
  },
  {
    title: 'ข้อมูลเภสัชกร/จพง.เภสัชกรรม / จนท.ห้องยา',
    path: '/officer/main',
    icon: icon('female-doctor'),
  },
  {
    title: 'ข้อมูลประเภท Error',
    path: '/error-type/main',
    icon: icon('list-task-svgrepo-com'),
  },
  {
    title: 'เกณฑ์ Likelihood',
    path: '/likelihood-criteria/main',
    icon: icon('ic_analytics'),
  },
  {
    title: 'รายการสาเหตุ',
    path: '/analysis/main',
    icon: icon('list-task-svgrepo-com'),
  },
  {
    title: 'รายงาน',
    path: '/reports/main',
    icon: icon('statistics'),
  },
];

const navConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard/app',
    icon: icon('dashboard'),
  },
  {
    title: 'Med error',
    path: '/lists/med',
    icon: icon('drug-svgrepo-com'),
  },
  {
    title: 'รายงาน',
    path: '/reports/main',
    icon: icon('statistics'),
  },
];

export default {
  navAdmin: navAdmin,
  navConfig: navConfig,
};
