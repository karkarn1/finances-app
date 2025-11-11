/**
 * Form TextField component with React Hook Form integration
 *
 * Wraps Material-UI TextField with Controller for automatic
 * validation, error handling, and form state management.
 */

import { FC } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

export interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

export const FormTextField = <T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  ...props
}: FormTextFieldProps<T>): ReturnType<FC> => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          error={!!error}
          helperText={error?.message || helperText}
          fullWidth
        />
      )}
    />
  );
};
