# Zod Validation Examples

Practical examples demonstrating how to use the validation schemas in your React components.

## Table of Contents

- [Login Form Example](#login-form-example)
- [Registration Form Example](#registration-form-example)
- [Account Creation Form](#account-creation-form)
- [Security Search Form](#security-search-form)
- [Holding Creation Form](#holding-creation-form)
- [Manual Validation](#manual-validation)
- [Error Handling](#error-handling)

## Login Form Example

Complete login form with Material-UI and React Hook Form:

```typescript
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box } from '@mui/material';
import { loginSchema, type LoginInput } from '@/schemas';

const LoginForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      // Data is already validated by Zod
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      console.log('Login successful:', result);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <TextField
        {...register('username')}
        margin="normal"
        fullWidth
        label="Username or Email"
        autoComplete="username"
        autoFocus
        error={!!errors.username}
        helperText={errors.username?.message}
      />

      <TextField
        {...register('password')}
        margin="normal"
        fullWidth
        type="password"
        label="Password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
};

export default LoginForm;
```

## Registration Form Example

Registration form with password confirmation validation:

```typescript
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Alert } from '@mui/material';
import { registerSchema, type RegisterInput } from '@/schemas';

const RegisterForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError('root', { message: error.detail || 'Registration failed' });
        return;
      }

      console.log('Registration successful');
    } catch (error) {
      setError('root', { message: 'Network error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {errors.root && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      <TextField
        {...register('username')}
        margin="normal"
        fullWidth
        label="Username"
        error={!!errors.username}
        helperText={errors.username?.message}
      />

      <TextField
        {...register('email')}
        margin="normal"
        fullWidth
        type="email"
        label="Email"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        {...register('password')}
        margin="normal"
        fullWidth
        type="password"
        label="Password"
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <TextField
        {...register('confirmPassword')}
        margin="normal"
        fullWidth
        type="password"
        label="Confirm Password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? 'Creating account...' : 'Register'}
      </Button>
    </Box>
  );
};

export default RegisterForm;
```

## Account Creation Form

Form with Material-UI Select component using Controller:

```typescript
import { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { accountCreateSchema, type AccountCreateInput } from '@/schemas';

const AccountForm: FC = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountCreateInput>({
    resolver: zodResolver(accountCreateSchema),
    defaultValues: {
      is_investment_account: false,
    },
  });

  const onSubmit = async (data: AccountCreateInput) => {
    console.log('Account data:', data);
    // Send to API
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <TextField
        {...register('name')}
        margin="normal"
        fullWidth
        label="Account Name"
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <Controller
        name="account_type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.account_type}>
            <InputLabel>Account Type</InputLabel>
            <Select {...field} label="Account Type">
              <MenuItem value="checking">Checking</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="tfsa">TFSA</MenuItem>
              <MenuItem value="rrsp">RRSP</MenuItem>
              <MenuItem value="fhsa">FHSA</MenuItem>
              <MenuItem value="margin">Margin</MenuItem>
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="line_of_credit">Line of Credit</MenuItem>
              <MenuItem value="payment_plan">Payment Plan</MenuItem>
              <MenuItem value="mortgage">Mortgage</MenuItem>
            </Select>
            {errors.account_type && (
              <FormHelperText>{errors.account_type.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="is_investment_account"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={field.value} />}
            label="Investment Account"
          />
        )}
      />

      <TextField
        {...register('interest_rate', { valueAsNumber: true })}
        margin="normal"
        fullWidth
        type="number"
        label="Interest Rate (%)"
        inputProps={{ step: 0.01, min: 0, max: 100 }}
        error={!!errors.interest_rate}
        helperText={errors.interest_rate?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </Button>
    </Box>
  );
};

export default AccountForm;
```

## Security Search Form

Simple search form with debounced input:

```typescript
import { FC, useState } from 'react';
import { TextField, Box, List, ListItem, ListItemText } from '@mui/material';
import { securitySearchSchema } from '@/schemas';
import { useDebounce } from '@/hooks';

const SecuritySearch: FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    // Validate query
    const validation = securitySearchSchema.safeParse({ query: searchQuery });

    if (!validation.success) {
      setError(validation.error.errors[0]?.message ?? 'Invalid query');
      return;
    }

    setError(null);

    try {
      const response = await fetch(
        `/api/v1/securities/search?q=${encodeURIComponent(validation.data.query)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError('Search failed');
    }
  };

  // Execute search when debounced query changes
  React.useEffect(() => {
    void handleSearch(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <Box>
      <TextField
        fullWidth
        label="Search Securities"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        error={!!error}
        helperText={error || 'Enter ticker symbol or company name'}
        placeholder="e.g., AAPL, Microsoft"
      />

      {results.length > 0 && (
        <List>
          {results.map((result, index) => (
            <ListItem key={index}>
              <ListItemText primary={result} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SecuritySearch;
```

## Holding Creation Form

Form for adding portfolio holdings:

```typescript
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box } from '@mui/material';
import { holdingCreateSchema, type HoldingCreateInput } from '@/schemas';

interface HoldingFormProps {
  accountId: string;
  onSuccess: () => void;
}

const HoldingForm: FC<HoldingFormProps> = ({ accountId, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HoldingCreateInput>({
    resolver: zodResolver(holdingCreateSchema),
  });

  const onSubmit = async (data: HoldingCreateInput) => {
    try {
      const response = await fetch(`/api/v1/accounts/${accountId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create holding');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating holding:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <TextField
        {...register('security_id')}
        margin="normal"
        fullWidth
        label="Security ID"
        error={!!errors.security_id}
        helperText={errors.security_id?.message}
      />

      <TextField
        {...register('shares', { valueAsNumber: true })}
        margin="normal"
        fullWidth
        type="number"
        label="Number of Shares"
        inputProps={{ step: 0.0001, min: 0 }}
        error={!!errors.shares}
        helperText={errors.shares?.message}
      />

      <TextField
        {...register('average_price_per_share', { valueAsNumber: true })}
        margin="normal"
        fullWidth
        type="number"
        label="Average Price per Share"
        inputProps={{ step: 0.01, min: 0 }}
        error={!!errors.average_price_per_share}
        helperText={errors.average_price_per_share?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2 }}
      >
        {isSubmitting ? 'Adding...' : 'Add Holding'}
      </Button>
    </Box>
  );
};

export default HoldingForm;
```

## Manual Validation

Validate data without React Hook Form:

```typescript
import { accountCreateSchema } from '@/schemas';

// Using parse (throws on error)
try {
  const validated = accountCreateSchema.parse(formData);
  console.log('Valid data:', validated);
  // Send to API
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors);
    // Display errors to user
  }
}

// Using safeParse (returns result object)
const result = accountCreateSchema.safeParse(formData);

if (result.success) {
  console.log('Valid data:', result.data);
  // Send to API
} else {
  console.error('Validation errors:', result.error.errors);
  // Display errors to user
  result.error.errors.forEach((err) => {
    console.log(`${err.path.join('.')}: ${err.message}`);
  });
}
```

## Error Handling

Extract and display validation errors:

```typescript
import { ZodError } from 'zod';
import { loginSchema } from '@/schemas';

const validateAndSubmit = async (formData: unknown) => {
  try {
    // Validate
    const validated = loginSchema.parse(formData);

    // Submit
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ZodError) {
      // Validation error
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      console.error('Validation errors:', errorMessages);
      throw new Error(errorMessages.join(', '));
    }

    // Network or API error
    console.error('Request error:', error);
    throw error;
  }
};

// Usage
try {
  const result = await validateAndSubmit({
    username: 'testuser',
    password: 'pass',
  });
  console.log('Success:', result);
} catch (error) {
  // Display error to user
  alert(error instanceof Error ? error.message : 'An error occurred');
}
```

## Dynamic Field Validation

Show field-level errors as user types:

```typescript
import { FC, useState } from 'react';
import { TextField, Box } from '@mui/material';
import { registerSchema } from '@/schemas';

const RegisterFormWithLiveValidation: FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Validate single field
    const result = registerSchema.shape.email.safeParse(value);

    if (!result.success) {
      setEmailError(result.error.errors[0]?.message ?? 'Invalid email');
    } else {
      setEmailError(null);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        error={!!emailError}
        helperText={emailError}
      />
    </Box>
  );
};

export default RegisterFormWithLiveValidation;
```

---

**Last Updated:** November 10, 2025
**Note:** All examples assume proper imports and setup of Material-UI theme provider and React Router.
