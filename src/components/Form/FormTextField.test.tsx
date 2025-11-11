/**
 * Tests for FormTextField component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { FormTextField } from './FormTextField';

// Wrapper component to provide form context
function TestFormWrapper({
  defaultValue = '',
  required = false,
}: {
  defaultValue?: string;
  required?: boolean;
}) {
  const { control } = useForm({
    defaultValues: {
      testField: defaultValue,
    },
  });

  return (
    <form>
      <FormTextField
        name="testField"
        control={control}
        label="Test Field"
        required={required}
      />
    </form>
  );
}

describe('FormTextField', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<TestFormWrapper />);

      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    });

    it('should render as a text input', () => {
      render(<TestFormWrapper />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should be full width by default', () => {
      render(<TestFormWrapper />);

      const input = screen.getByLabelText('Test Field');
      expect(input.closest('.MuiTextField-root')).toHaveClass('MuiFormControl-fullWidth');
    });

    it('should render with default value', () => {
      render(<TestFormWrapper defaultValue="Initial Value" />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;
      expect(input.value).toBe('Initial Value');
    });

    it('should render with required indicator when required', () => {
      render(<TestFormWrapper required />);

      expect(screen.getByLabelText(/Test Field \*/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in the field', async () => {
      const user = userEvent.setup();
      render(<TestFormWrapper />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      await user.type(input, 'Hello World');

      expect(input.value).toBe('Hello World');
    });

    it('should allow clearing the field', async () => {
      const user = userEvent.setup();
      render(<TestFormWrapper defaultValue="Initial" />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      expect(input.value).toBe('Initial');

      await user.clear(input);

      expect(input.value).toBe('');
    });

    it('should allow updating existing value', async () => {
      const user = userEvent.setup();
      render(<TestFormWrapper defaultValue="Old" />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      await user.clear(input);
      await user.type(input, 'New');

      expect(input.value).toBe('New');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<TestFormWrapper />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      await user.type(input, '!@#$%^&*()');

      expect(input.value).toBe('!@#$%^&*()');
    });

    it('should handle numbers when type is text', async () => {
      const user = userEvent.setup();
      render(<TestFormWrapper />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      await user.type(input, '123456');

      expect(input.value).toBe('123456');
    });
  });

  describe('Input Types', () => {
    function TypedFormWrapper({ type }: { type: string }) {
      const { control } = useForm({
        defaultValues: {
          testField: '',
        },
      });

      return (
        <form>
          <FormTextField
            name="testField"
            control={control}
            label="Test Field"
            type={type}
          />
        </form>
      );
    }

    it('should render as email input when type is email', () => {
      render(<TypedFormWrapper type="email" />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render as password input when type is password', () => {
      render(<TypedFormWrapper type="password" />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render as number input when type is number', () => {
      render(<TypedFormWrapper type="number" />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render as tel input when type is tel', () => {
      render(<TypedFormWrapper type="tel" />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render as url input when type is url', () => {
      render(<TypedFormWrapper type="url" />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('type', 'url');
    });
  });

  describe('Helper Text', () => {
    function HelperTextWrapper({ helperText }: { helperText?: string }) {
      const { control } = useForm({
        defaultValues: {
          testField: '',
        },
      });

      return (
        <form>
          <FormTextField
            name="testField"
            control={control}
            label="Test Field"
            helperText={helperText}
          />
        </form>
      );
    }

    it('should display helper text when provided', () => {
      render(<HelperTextWrapper helperText="This is a helpful message" />);

      expect(screen.getByText('This is a helpful message')).toBeInTheDocument();
    });

    it('should not display helper text when not provided', () => {
      render(<HelperTextWrapper />);

      const helperText = screen.queryByText(/helpful/i);
      expect(helperText).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    function DisabledWrapper({ disabled }: { disabled: boolean }) {
      const { control } = useForm({
        defaultValues: {
          testField: '',
        },
      });

      return (
        <form>
          <FormTextField
            name="testField"
            control={control}
            label="Test Field"
            disabled={disabled}
          />
        </form>
      );
    }

    it('should render as disabled when disabled prop is true', () => {
      render(<DisabledWrapper disabled />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toBeDisabled();
    });

    it('should not allow typing when disabled', async () => {
      const user = userEvent.setup();
      render(<DisabledWrapper disabled />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      await user.type(input, 'Should not type');

      expect(input.value).toBe('');
    });

    it('should render as enabled when disabled prop is false', () => {
      render(<DisabledWrapper disabled={false} />);

      const input = screen.getByLabelText('Test Field');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Multiline', () => {
    function MultilineWrapper({ multiline, rows }: { multiline?: boolean; rows?: number }) {
      const { control } = useForm({
        defaultValues: {
          testField: '',
        },
      });

      return (
        <form>
          <FormTextField
            name="testField"
            control={control}
            label="Test Field"
            multiline={multiline}
            rows={rows}
          />
        </form>
      );
    }

    it('should render as textarea when multiline is true', () => {
      render(<MultilineWrapper multiline />);

      const input = screen.getByLabelText('Test Field');
      expect(input.tagName).toBe('TEXTAREA');
    });

    it('should render with specified rows when multiline', () => {
      render(<MultilineWrapper multiline rows={5} />);

      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('rows', '5');
    });

    it('should allow multiple lines of text', async () => {
      const user = userEvent.setup();
      render(<MultilineWrapper multiline />);

      const input = screen.getByLabelText('Test Field') as HTMLTextAreaElement;

      await user.type(input, 'Line 1\nLine 2\nLine 3');

      expect(input.value).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Placeholder', () => {
    function PlaceholderWrapper({ placeholder }: { placeholder?: string }) {
      const { control } = useForm({
        defaultValues: {
          testField: '',
        },
      });

      return (
        <form>
          <FormTextField
            name="testField"
            control={control}
            label="Test Field"
            placeholder={placeholder}
          />
        </form>
      );
    }

    it('should display placeholder when provided', () => {
      render(<PlaceholderWrapper placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('should hide placeholder when user types', async () => {
      const user = userEvent.setup();
      render(<PlaceholderWrapper placeholder="Enter text here" />);

      const input = screen.getByLabelText('Test Field') as HTMLInputElement;

      await user.type(input, 'User input');

      expect(input.value).toBe('User input');
      expect(input).toHaveAttribute('placeholder', 'Enter text here');
    });
  });
});
