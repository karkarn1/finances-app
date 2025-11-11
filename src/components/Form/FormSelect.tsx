/**
 * Form Select component with React Hook Form integration
 *
 * Wraps Material-UI Select with Controller for automatic
 * validation, error handling, and form state management.
 */

import { FC, ReactNode } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  SelectProps,
  FormHelperText,
} from '@mui/material';

export interface FormSelectProps<T extends FieldValues>
  extends Omit<SelectProps, 'name' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  children: ReactNode;
  helperText?: string;
}

export const FormSelect = <T extends FieldValues>({
  name,
  control,
  label,
  children,
  helperText,
  ...props
}: FormSelectProps<T>): ReturnType<FC> => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} {...props} label={label}>
            {children}
          </Select>
          {(error || helperText) && (
            <FormHelperText>{error?.message || helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
