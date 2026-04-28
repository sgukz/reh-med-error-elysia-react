import { Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
import MedErrorPage from './pages/MedErrorPage';
import LoginPage from './pages/LoginPage'; 
import Page404 from './pages/Page404'; 
import DashboardAppPage from './pages/DashboardAppPage'; 
import DepartmentPage from './pages/DepartmentPage'; 
import OfficerPage from './pages/OfficerPage'; 
import ErrorTypePage from './pages/ErrorTypePage'; 
import AnalysisPage from './pages/AnalysisPage'; 
import ReportPage from './pages/ReportPage'; 

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <LoginPage />
    },
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { path: 'app', element: <DashboardAppPage /> },
      ],
    },
    {
      path: '/lists',
      element: <DashboardLayout />,
      children: [
        { path: 'med', element: <MedErrorPage /> },
      ],
    },

    {
      path: 'login',
      element: <LoginPage />,
      children: [
        { element: <Navigate to="/login" />, index: true },
      ]
    },
    {
      path: 'department',
      element: <DashboardLayout />,
      children: [
        { path: 'main', element: <DepartmentPage /> },
      ]
    },
    {
      path: 'officer',
      element: <DashboardLayout />,
      children: [
        { path: 'main', element: <OfficerPage /> },
      ]
    },
    {
      path: 'error-type',
      element: <DashboardLayout />,
      children: [
        { path: 'main', element: <ErrorTypePage /> },
      ]
    },
    {
      path: 'analysis',
      element: <DashboardLayout />,
      children: [
        { path: 'main', element: <AnalysisPage /> },
      ]
    },
    {
      path: 'reports',
      element: <DashboardLayout />,
      children: [
        { path: 'main', element: <ReportPage /> },
      ]
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/login" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
