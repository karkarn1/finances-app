/**
 * Custom hook for React Hook Form with Zod validation
 *
 * Provides a type-safe wrapper around useForm that automatically
 * integrates Zod schema validation via zodResolver.
 *
 * @example
 * ```typescript
 * const { control, handleSubmit } = useZodForm(loginSchema, {
 *   defaultValues: { username: '', password: '' }
 * });
 * ```
 */

import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

/**
 * Create a type-safe form with Zod validation
 *
 * @template TFormValues - The shape of the form data (inferred from schema)
 * @param schema - Zod schema for validation
 * @param options - Additional useForm options (excluding resolver)
 * @returns React Hook Form methods with type safety
 */
export const useZodForm = <TFormValues extends Record<string, unknown>>(
  schema: ZodSchema<TFormValues>,
  options?: Omit<UseFormProps<TFormValues>, 'resolver'>
): UseFormReturn<TFormValues> => {
  // Type assertion is needed here due to zodResolver's generic constraints
  // The resolver is correctly typed but react-hook-form's types are too strict
  return useForm<TFormValues>({
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  });
};
