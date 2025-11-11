/**
 * Register page component
 */

import { FC, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Container,
} from '@mui/material';
import { useAppDispatch, useAppSelector, useZodForm } from '@/hooks';
import {
  registerUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  clearError,
} from '@/store/slices/authSlice';
import { registerSchema, type RegisterInput } from '@/schemas';
import { FormTextField } from '@/components/Form';

const Register: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Initialize form with Zod validation
  const { control, handleSubmit } = useZodForm(registerSchema, {
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data: RegisterInput) => {
    // Dispatch register action (backend expects only email, username, password)
    const { confirmPassword, ...registerData } = data;
    void dispatch(registerUser(registerData)).then((result) => {
      // Navigate to dashboard on success
      if (registerUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ mb: 3 }}
            >
              Create Account
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Sign up to start managing your finances
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormTextField
                name="email"
                control={control}
                label="Email"
                type="email"
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
                sx={{ mb: 2 }}
              />

              <FormTextField
                name="username"
                control={control}
                label="Username"
                type="text"
                disabled={isLoading}
                required
                autoComplete="username"
                sx={{ mb: 2 }}
              />

              <FormTextField
                name="password"
                control={control}
                label="Password"
                type="password"
                disabled={isLoading}
                required
                autoComplete="new-password"
                sx={{ mb: 2 }}
              />

              <FormTextField
                name="confirmPassword"
                control={control}
                label="Confirm Password"
                type="password"
                disabled={isLoading}
                required
                autoComplete="new-password"
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign Up'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    underline="hover"
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
