/**
 * Reset Password page component
 */

import { FC, useState, FormEvent, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  resetPassword,
  selectIsLoading,
  selectError,
  clearError,
} from '@/store/slices/authSlice';

const ResetPassword: FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extract token from URL on mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');
    setSuccess(false);

    // Validation
    if (!token.trim()) {
      setValidationError('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Dispatch reset password action
    void dispatch(resetPassword({ token, password })).then((result) => {
      // Show success message
      if (resetPassword.fulfilled.match(result)) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
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
              Reset Password
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Enter your new password below
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset successful!{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                  Click here to login
                </Link>
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
                label="Reset Token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
                required
                helperText="This is automatically filled from the email link"
                sx={{ mb: 2 }}
                InputProps={{
                  readOnly: true,
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || success}
                required
                autoComplete="new-password"
                helperText="At least 8 characters"
                autoFocus
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || success}
                required
                autoComplete="new-password"
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading || success}
                sx={{ mb: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Reset Password'
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

export default ResetPassword;
