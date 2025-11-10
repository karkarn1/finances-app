import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { theme } from './theme';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Securities from './pages/Securities';
import SecurityDetail from './pages/SecurityDetail';
import FinancialInstitutions from './pages/FinancialInstitutions';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Currencies from './pages/Currencies';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAppSelector } from '@/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/securities"
                element={
                  <ProtectedRoute>
                    <Securities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/securities/:symbol"
                element={
                  <ProtectedRoute>
                    <SecurityDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financial-institutions"
                element={
                  <ProtectedRoute>
                    <FinancialInstitutions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts/:id"
                element={
                  <ProtectedRoute>
                    <AccountDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/currencies"
                element={
                  <ProtectedRoute>
                    <Currencies />
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
  );
}

export default App;
