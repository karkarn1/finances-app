/**
 * Forgot Password page component
 */

import { FC, useState, FormEvent, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Container,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  forgotPassword,
  selectIsLoading,
  selectError,
  clearError,
} from '@/store/slices/authSlice';

const ForgotPassword: FC = () => {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Dispatch forgot password action
    void dispatch(forgotPassword(email)).then((result) => {
      // Show success message
      if (forgotPassword.fulfilled.match(result)) {
        setSuccess(true);
        setEmail('');
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
              Forgot Password
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Enter your email address and we&apos;ll send you a password reset link
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                If the email exists, a password reset link has been sent. Check
                your console logs in development mode.
              </Alert>
            )}

            {(error || validationError) && !success && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {validationError || error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
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
                  'Send Reset Link'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  underline="hover"
                >
                  Back to login
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
