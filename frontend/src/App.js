import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <BrowserRouter 
          basename={`${process.env.REACT_APP_BASE_URL}`}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ThemeProvider>
            <ScrollToTop />
            <Router />
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    </AuthProvider>
  );
}
