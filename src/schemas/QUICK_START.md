# Zod Validation Quick Start

Get started with Zod validation schemas in 5 minutes.

## Installation (Already Done)

```bash
yarn add zod @hookform/resolvers
```

✅ Dependencies installed:
- `zod` v4.1.12
- `@hookform/resolvers` v5.2.2
- `react-hook-form` v7.66.0 (pre-installed)

## Basic Usage

### 1. Import the Schema

```typescript
import { loginSchema, type LoginInput } from '@/schemas';
```

### 2. Integrate with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

### 3. Handle Form Submission

```typescript
const onSubmit = async (data: LoginInput) => {
  // Data is automatically validated!
  console.log('Valid data:', data);
};
```

## Available Schemas

All schemas are available from `@/schemas`:

```typescript
import {
  // Auth
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // Accounts
  accountCreateSchema,
  accountUpdateSchema,
  accountValueCreateSchema,

  // Securities
  securitySearchSchema,
  securitySymbolSchema,
  holdingCreateSchema,
  priceQuerySchema,

  // Types (automatically inferred from schemas)
  type LoginInput,
  type RegisterInput,
  type AccountCreateInput,
  type HoldingCreateInput,
} from '@/schemas';
```

## Common Validation Rules

### Authentication
- **Email**: Valid format, lowercase, max 255 chars
- **Username**: 3-50 chars, alphanumeric + underscores/hyphens
- **Password**: Min 8 chars, must include:
  - 1 lowercase letter
  - 1 uppercase letter
  - 1 number
  - 1 special character

### Accounts
- **Name**: 1-100 characters, required
- **Account Type**: Must be one of: checking, savings, tfsa, rrsp, fhsa, margin, credit_card, line_of_credit, payment_plan, mortgage
- **Interest Rate**: 0-100 (percentage)
- **UUIDs**: Valid UUID format for IDs

### Securities
- **Symbol**: 1-10 chars, uppercase letters/numbers/dots/hyphens (auto-uppercase)
- **Shares**: Positive finite number
- **Price**: Positive finite number

## Minimal Login Example

```typescript
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button } from '@mui/material';
import { loginSchema, type LoginInput } from '@/schemas';

const LoginForm: FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    console.log('Valid login data:', data);
    // Call your API here
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

      <Button type="submit">Login</Button>
    </form>
  );
};
```

## Manual Validation (Without Forms)

```typescript
import { loginSchema } from '@/schemas';

// Throws on validation error
try {
  const validated = loginSchema.parse(data);
  console.log('Valid:', validated);
} catch (error) {
  console.error('Invalid:', error);
}

// Returns result object (no throw)
const result = loginSchema.safeParse(data);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.error('Invalid:', result.error.errors);
}
```

## Error Messages

All validation errors include user-friendly messages:

```typescript
// Example errors:
{
  username: "Username must be at least 3 characters long",
  password: "Password must contain at least one uppercase letter",
  email: "Invalid email format",
  account_type: "Invalid enum value...",
}
```

## Next Steps

- **Full Documentation**: `src/schemas/README.md`
- **Complete Examples**: `src/schemas/EXAMPLES.md`
- **Schema Files**:
  - `accountSchemas.ts` - Account and financial institution validation
  - `authSchemas.ts` - Authentication and user management
  - `securitySchemas.ts` - Securities, holdings, and portfolio
  - `index.ts` - Central exports

## Key Benefits

✅ **Type Safety**: TypeScript types automatically inferred from schemas
✅ **Runtime Validation**: Catch errors before they reach your API
✅ **User-Friendly Errors**: Clear, actionable error messages
✅ **No Duplication**: Single source of truth for validation and types
✅ **Form Integration**: Seamless React Hook Form integration
✅ **Transformations**: Auto-uppercase symbols, trim strings, etc.

---

**Need help?** Check `README.md` for comprehensive documentation or `EXAMPLES.md` for complete form implementations.
