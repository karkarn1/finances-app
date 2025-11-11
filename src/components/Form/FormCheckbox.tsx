/**
 * Form Checkbox component with React Hook Form integration
 *
 * Wraps Material-UI Checkbox with Controller for automatic
 * validation, error handling, and form state management.
 */

import { FC } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
  FormControlLabel,
  Checkbox,
  CheckboxProps,
  FormHelperText,
  Box,
} from '@mui/material';

export interface FormCheckboxProps<T extends FieldValues>
  extends Omit<CheckboxProps, 'name' | 'checked'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  helperText?: string;
}

export const FormCheckbox = <T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  ...props
}: FormCheckboxProps<T>): ReturnType<FC> => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                {...props}
                checked={field.value as boolean}
              />
            }
            label={label}
          />
          {(error || helperText) && (
            <FormHelperText error={!!error}>
              {error?.message || helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};
