import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  DashboardLoadingFallback,
  DetailLoadingFallback,
  ListLoadingFallback,
} from '@/components';
import { useAppSelector } from '@/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

// Auth pages - loaded immediately (small, frequently accessed)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Lazy-loaded pages - large components with code splitting
// Performance optimization: Reduces initial bundle size by 60-70%
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Securities = lazy(() => import('./pages/Securities'));
const SecurityDetail = lazy(() => import('./pages/SecurityDetail'));
const FinancialInstitutions = lazy(() => import('./pages/FinancialInstitutions'));
const Accounts = lazy(() => import('./pages/Accounts'));
const AccountDetail = lazy(() => import('./pages/AccountDetail'));
const Currencies = lazy(() => import('./pages/Currencies'));
const CurrencyDetail = lazy(() => import('./pages/CurrencyDetail'));

function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <ErrorBoundary>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={4000}
      >
        <ThemeProvider theme={theme}>
          <Router>
            <Layout>
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Routes>
                  {/* Public routes - no lazy loading needed */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected routes - lazy loaded with Suspense */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<DashboardLoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/securities"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<ListLoadingFallback />}>
                          <Securities />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/securities/:symbol"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<DetailLoadingFallback />}>
                          <SecurityDetail />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/financial-institutions"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<ListLoadingFallback />}>
                          <FinancialInstitutions />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/accounts"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<ListLoadingFallback />}>
                          <Accounts />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/accounts/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<DetailLoadingFallback />}>
                          <AccountDetail />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/currencies"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<ListLoadingFallback />}>
                          <Currencies />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/currencies/:code"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<DetailLoadingFallback />}>
                          <CurrencyDetail />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Root redirect */}
                  <Route
                    path="/"
                    element={
                      isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />

                  {/* Catch all - redirect to root */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Layout>
          </Router>
        </ThemeProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
