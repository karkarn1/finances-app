/**
 * Protected Route component - Redirects to login if not authenticated
 */

import { FC, ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectIsAuthenticated,
  selectIsLoading,
  fetchCurrentUser,
} from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);

  // Fetch current user if we have a token but no user data
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && isAuthenticated) {
      void dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
