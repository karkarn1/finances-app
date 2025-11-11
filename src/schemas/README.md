# Validation Schemas

Comprehensive validation schemas using [Zod](https://zod.dev/) for the Finance Manager application.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Available Schemas](#available-schemas)
  - [Authentication Schemas](#authentication-schemas)
  - [Account Schemas](#account-schemas)
  - [Security & Holdings Schemas](#security--holdings-schemas)
- [Integration with React Hook Form](#integration-with-react-hook-form)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Installation

The following packages are installed:

```bash
yarn add zod @hookform/resolvers
```

**Dependencies:**
- `zod` (v4.1.12): Runtime validation with TypeScript type inference
- `@hookform/resolvers` (v5.2.2): React Hook Form integration for Zod
- `react-hook-form` (pre-installed): Form management library

## Basic Usage

### Standalone Validation

Validate data directly using Zod schemas:

```typescript
import { loginSchema, type LoginInput } from '@/schemas';

const data = {
  username: 'testuser',
  password: 'password123',
};

try {
  const validated: LoginInput = loginSchema.parse(data);
  console.log('Valid data:', validated);
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```

### Safe Parsing (Non-Throwing)

Use `safeParse` to avoid exceptions:

```typescript
import { accountCreateSchema } from '@/schemas';

const result = accountCreateSchema.safeParse(formData);

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.error('Validation errors:', result.error.errors);
}
```

## Available Schemas

### Authentication Schemas

Located in `src/schemas/authSchemas.ts`

#### Login Schema

```typescript
import { loginSchema, type LoginInput } from '@/schemas';

const loginData: LoginInput = {
  username: 'testuser', // Can be username or email
  password: 'SecureP@ss123',
};

loginSchema.parse(loginData);
```

**Validation Rules:**
- `username`: Required, trimmed (accepts username or email)
- `password`: Required

#### Registration Schema

```typescript
import { registerSchema, type RegisterInput } from '@/schemas';

const registerData: RegisterInput = {
  username: 'newuser',
  email: 'user@example.com',
  password: 'SecureP@ss123',
  confirmPassword: 'SecureP@ss123',
};

registerSchema.parse(registerData);
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric with underscores/hyphens
- `email`: Valid email format, lowercase, max 255 characters
- `password`:
  - Min 8 characters
  - At least 1 lowercase letter
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- `confirmPassword`: Must match `password`

#### Forgot Password Schema

```typescript
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas';

const data: ForgotPasswordInput = {
  email: 'user@example.com',
};

forgotPasswordSchema.parse(data);
```

#### Reset Password Schema

```typescript
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas';

const data: ResetPasswordInput = {
  token: 'reset-token-from-email',
  password: 'NewP@ss123',
  confirmPassword: 'NewP@ss123',
};

resetPasswordSchema.parse(data);
```

#### Change Password Schema

```typescript
import { changePasswordSchema, type ChangePasswordInput } from '@/schemas';

const data: ChangePasswordInput = {
  currentPassword: 'OldP@ss123',
  newPassword: 'NewP@ss123',
  confirmPassword: 'NewP@ss123',
};

changePasswordSchema.parse(data);
```

**Additional Rules:**
- New password must be different from current password

### Account Schemas

Located in `src/schemas/accountSchemas.ts`

#### Account Creation

```typescript
import { accountCreateSchema, type AccountCreateInput } from '@/schemas';

const data: AccountCreateInput = {
  name: 'My Checking Account',
  account_type: 'checking',
  financial_institution_id: '550e8400-e29b-41d4-a716-446655440000', // Optional
  is_investment_account: false, // Optional, defaults to false
  interest_rate: 2.5, // Optional
  currency_id: '550e8400-e29b-41d4-a716-446655440001', // Optional
};

accountCreateSchema.parse(data);
```

**Valid Account Types:**
- `checking`, `savings`, `tfsa`, `rrsp`, `fhsa`, `margin`
- `credit_card`, `line_of_credit`, `payment_plan`, `mortgage`

**Validation Rules:**
- `name`: 1-100 characters, required, trimmed
- `account_type`: Must be one of valid account types
- `financial_institution_id`: Valid UUID (optional)
- `is_investment_account`: Boolean (optional, defaults to false)
- `interest_rate`: 0-100 (optional)
- `currency_id`: Valid UUID (optional)

#### Account Update

```typescript
import { accountUpdateSchema, type AccountUpdateInput } from '@/schemas';

const data: AccountUpdateInput = {
  name: 'Updated Account Name', // All fields optional
  interest_rate: 3.0,
};

accountUpdateSchema.parse(data);
```

#### Account Value (Balance History)

```typescript
import { accountValueCreateSchema, type AccountValueCreateInput } from '@/schemas';

const data: AccountValueCreateInput = {
  timestamp: '2025-11-10T12:00:00Z', // Optional, defaults to now
  balance: 5000.00,
  cash_balance: 1000.00, // Optional, must not exceed total balance
};

accountValueCreateSchema.parse(data);
```

**Validation Rules:**
- `timestamp`: Valid ISO 8601 datetime (optional)
- `balance`: Finite number, required
- `cash_balance`: Finite number, must not exceed `balance` (optional)

#### Financial Institution

```typescript
import { financialInstitutionCreateSchema, type FinancialInstitutionCreateInput } from '@/schemas';

const data: FinancialInstitutionCreateInput = {
  name: 'Chase Bank',
  url: 'https://www.chase.com', // Optional
};

financialInstitutionCreateSchema.parse(data);
```

### Security & Holdings Schemas

Located in `src/schemas/securitySchemas.ts`

#### Security Search

```typescript
import { securitySearchSchema, type SecuritySearchInput } from '@/schemas';

const data: SecuritySearchInput = {
  query: 'aapl', // Automatically converted to uppercase
};

const result = securitySearchSchema.parse(data);
console.log(result.query); // "AAPL"
```

#### Security Symbol Validation

```typescript
import { securitySymbolSchema, type SecuritySymbol } from '@/schemas';

const symbol: SecuritySymbol = securitySymbolSchema.parse('aapl');
console.log(symbol); // "AAPL"
```

**Validation Rules:**
- 1-10 characters
- Only uppercase letters, numbers, dots, hyphens
- Automatically transformed to uppercase

#### Holding Creation

```typescript
import { holdingCreateSchema, type HoldingCreateInput } from '@/schemas';

const data: HoldingCreateInput = {
  security_id: '550e8400-e29b-41d4-a716-446655440000',
  timestamp: '2025-11-10T12:00:00Z', // Optional
  shares: 100,
  average_price_per_share: 150.50,
};

holdingCreateSchema.parse(data);
```

**Validation Rules:**
- `security_id`: Valid UUID
- `timestamp`: Valid ISO 8601 datetime (optional)
- `shares`: Positive finite number
- `average_price_per_share`: Positive finite number

#### Price Query

```typescript
import { priceQuerySchema, type PriceQueryInput } from '@/schemas';

const data: PriceQueryInput = {
  symbol: 'AAPL',
  start_date: '2025-01-01T00:00:00Z', // Optional
  end_date: '2025-11-10T00:00:00Z', // Optional
  interval: '1d', // Optional: '1d', '1wk', '1mo'
};

priceQuerySchema.parse(data);
```

**Validation Rules:**
- `start_date` must be before `end_date` if both provided
- `interval`: '1d' (daily), '1wk' (weekly), '1mo' (monthly)

#### Portfolio Rebalancing

```typescript
import { portfolioRebalancingSchema, type PortfolioRebalancingInput } from '@/schemas';

const data: PortfolioRebalancingInput = {
  allocations: [
    {
      security_id: 'uuid-1',
      target_percentage: 60,
      tolerance: 5, // Optional, defaults to 5
    },
    {
      security_id: 'uuid-2',
      target_percentage: 40,
      tolerance: 3,
    },
  ],
};

portfolioRebalancingSchema.parse(data);
```

**Validation Rules:**
- At least one allocation required
- Total of all `target_percentage` must equal 100%
- `target_percentage`: 0-100
- `tolerance`: 0-100 (optional, defaults to 5)

## Integration with React Hook Form

### Basic Form Setup

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
      await loginUser(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('username')}
        label="Username"
        error={!!errors.username}
        helperText={errors.username?.message}
        fullWidth
      />

      <TextField
        {...register('password')}
        type="password"
        label="Password"
        error={!!errors.password}
        helperText={errors.password?.message}
        fullWidth
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
```

### Material-UI Integration

```typescript
import { Controller } from 'react-hook-form';
import { Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';

const AccountForm: FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<AccountCreateInput>({
    resolver: zodResolver(accountCreateSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="account_type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.account_type}>
            <InputLabel>Account Type</InputLabel>
            <Select {...field} label="Account Type">
              <MenuItem value="checking">Checking</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="tfsa">TFSA</MenuItem>
              {/* ... other types */}
            </Select>
            {errors.account_type && (
              <FormHelperText>{errors.account_type.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </form>
  );
};
```

## Advanced Usage

### Custom Refinements

Add custom validation logic to existing schemas:

```typescript
import { z } from 'zod';
import { accountCreateSchema } from '@/schemas';

const customAccountSchema = accountCreateSchema.refine(
  (data) => {
    // Investment accounts must have a currency specified
    if (data.is_investment_account && !data.currency_id) {
      return false;
    }
    return true;
  },
  {
    message: 'Investment accounts must specify a currency',
    path: ['currency_id'],
  }
);
```

### Schema Composition

Combine multiple schemas:

```typescript
import { z } from 'zod';
import { accountCreateSchema, accountValueCreateSchema } from '@/schemas';

const accountWithInitialBalanceSchema = z.object({
  account: accountCreateSchema,
  initial_balance: accountValueCreateSchema,
});

type AccountWithInitialBalance = z.infer<typeof accountWithInitialBalanceSchema>;
```

### Partial Updates

Create partial schemas for updates:

```typescript
import { accountCreateSchema } from '@/schemas';

// Make all fields optional
const accountPartialUpdateSchema = accountCreateSchema.partial();

// Make specific fields optional
const accountSelectiveUpdateSchema = accountCreateSchema.pick({
  name: true,
  interest_rate: true,
}).partial();
```

### Transform Data

Transform data during validation:

```typescript
import { z } from 'zod';

const currencyAmountSchema = z
  .string()
  .transform((val) => parseFloat(val.replace(/[$,]/g, '')))
  .pipe(z.number().positive());

// Input: "$1,234.56" → Output: 1234.56
```

## Best Practices

### 1. Use Type Inference

Always use `z.infer<>` to derive TypeScript types:

```typescript
import { registerSchema } from '@/schemas';

// ✅ Good: Type automatically synced with schema
type RegisterInput = z.infer<typeof registerSchema>;

// ❌ Bad: Manual type definition can drift from schema
interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
```

### 2. Centralize Validation

Import schemas from the central `@/schemas` export:

```typescript
// ✅ Good
import { loginSchema, type LoginInput } from '@/schemas';

// ❌ Bad
import { loginSchema, type LoginInput } from '@/schemas/authSchemas';
```

### 3. Handle Errors Gracefully

Display user-friendly error messages:

```typescript
import { ZodError } from 'zod';

try {
  const validated = loginSchema.parse(formData);
} catch (error) {
  if (error instanceof ZodError) {
    error.errors.forEach((err) => {
      toast.error(`${err.path.join('.')}: ${err.message}`);
    });
  }
}
```

### 4. Validate Before API Calls

Always validate form data before sending to backend:

```typescript
const onSubmit = async (data: unknown) => {
  // Validate first
  const validated = accountCreateSchema.safeParse(data);

  if (!validated.success) {
    console.error('Validation failed:', validated.error);
    return;
  }

  // Now safe to call API
  await createAccount(validated.data);
};
```

### 5. Reuse Common Patterns

Extract reusable validation patterns:

```typescript
// Common patterns
const uuidSchema = z.string().uuid();
const positiveNumberSchema = z.number().positive().finite();
const timestampSchema = z.string().datetime();

// Reuse across schemas
const mySchema = z.object({
  id: uuidSchema,
  amount: positiveNumberSchema,
  created_at: timestampSchema,
});
```

## Migration Guide

### Migrating Existing Forms

**Before (without validation):**

```typescript
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const data = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };

  // No validation
  await loginUser(data);
};
```

**After (with Zod + React Hook Form):**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas';

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = async (data: LoginInput) => {
  // Data is automatically validated
  await loginUser(data);
};

// In JSX
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('username')} />
  {errors.username && <span>{errors.username.message}</span>}
  {/* ... */}
</form>
```

### Updating TypeScript Types

Replace manual interface definitions with schema-inferred types:

**Before:**

```typescript
interface AccountCreate {
  name: string;
  account_type: string;
  financial_institution_id?: string;
  // ...
}
```

**After:**

```typescript
import { type AccountCreateInput } from '@/schemas';

// AccountCreateInput is automatically derived from accountCreateSchema
```

### Testing with Schemas

Update tests to use schemas:

```typescript
import { accountCreateSchema } from '@/schemas';

describe('Account Creation', () => {
  it('should validate valid account data', () => {
    const validData = {
      name: 'Test Account',
      account_type: 'checking',
    };

    expect(() => accountCreateSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid account data', () => {
    const invalidData = {
      name: '', // Empty name
      account_type: 'checking',
    };

    expect(() => accountCreateSchema.parse(invalidData)).toThrow();
  });
});
```

## Resources

- **Zod Documentation:** https://zod.dev/
- **React Hook Form:** https://react-hook-form.com/
- **@hookform/resolvers:** https://github.com/react-hook-form/resolvers
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/intro.html

---

**Last Updated:** November 10, 2025
**Zod Version:** 4.1.12
**Status:** Production Ready
