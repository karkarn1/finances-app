import { renderHook, act } from '@testing-library/react';
import { useDialog } from './useDialog';

describe('useDialog', () => {
  interface TestFormData {
    name: string;
    email: string;
    age?: number;
  }

  const initialData: TestFormData = {
    name: '',
    email: '',
    age: undefined,
  };

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    expect(result.current.open).toBe(false);
    expect(result.current.data).toEqual(initialData);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingId).toBeNull();
  });

  it('should open dialog in create mode', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.open).toBe(true);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.data).toEqual(initialData);
  });

  it('should open dialog in edit mode with provided data', () => {
    const editData: TestFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };

    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    act(() => {
      result.current.openDialog(editData, 'edit-id-123');
    });

    expect(result.current.open).toBe(true);
    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingId).toBe('edit-id-123');
    expect(result.current.data).toEqual(editData);
  });

  it('should close dialog and reset state', () => {
    const editData: TestFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };

    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    // Open in edit mode
    act(() => {
      result.current.openDialog(editData);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.isEditing).toBe(true);

    // Close dialog
    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.data).toEqual(initialData);
  });

  it('should update data with setData', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    const newData: TestFormData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
    };

    act(() => {
      result.current.setData(newData);
    });

    expect(result.current.data).toEqual(newData);
  });

  it('should preserve data updates when closing and reopening', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    const editData: TestFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };

    // Open with edit data
    act(() => {
      result.current.openDialog(editData);
    });

    // Close
    act(() => {
      result.current.closeDialog();
    });

    // Reopen in create mode - should use initial data
    act(() => {
      result.current.openDialog();
    });

    expect(result.current.data).toEqual(initialData);
  });

  it('should handle partial data updates', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    act(() => {
      result.current.openDialog();
    });

    act(() => {
      result.current.setData({
        ...result.current.data,
        name: 'Updated Name',
      });
    });

    expect(result.current.data.name).toBe('Updated Name');
    expect(result.current.data.email).toBe('');
  });

  it('should distinguish between create and edit modes', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    // Open without data (create mode)
    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isEditing).toBe(false);

    act(() => {
      result.current.closeDialog();
    });

    // Open with data (edit mode)
    act(() => {
      result.current.openDialog({ name: 'Test', email: 'test@test.com' });
    });

    expect(result.current.isEditing).toBe(true);
  });

  it('should handle complex nested initial data', () => {
    interface ComplexData {
      user: {
        name: string;
        details: {
          age: number;
          country: string;
        };
      };
      preferences: string[];
    }

    const complexInitial: ComplexData = {
      user: {
        name: '',
        details: {
          age: 0,
          country: '',
        },
      },
      preferences: [],
    };

    const { result } = renderHook(() => useDialog<ComplexData>(complexInitial));

    expect(result.current.data).toEqual(complexInitial);

    const editData: ComplexData = {
      user: {
        name: 'John',
        details: {
          age: 30,
          country: 'USA',
        },
      },
      preferences: ['dark-mode', 'notifications'],
    };

    act(() => {
      result.current.openDialog(editData);
    });

    expect(result.current.data).toEqual(editData);
  });

  it('should maintain dialog state across multiple open/close cycles', () => {
    const { result } = renderHook(() => useDialog<TestFormData>(initialData));

    // Cycle 1
    act(() => {
      result.current.openDialog();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.closeDialog();
    });
    expect(result.current.open).toBe(false);

    // Cycle 2
    act(() => {
      result.current.openDialog({ name: 'Test', email: 'test@example.com' });
    });
    expect(result.current.open).toBe(true);
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.closeDialog();
    });
    expect(result.current.open).toBe(false);
    expect(result.current.isEditing).toBe(false);
  });

  // Enhanced features tests
  describe('editingId support', () => {
    it('should track editingId when opening in edit mode', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));
      const editData: TestFormData = { name: 'Test', email: 'test@example.com' };

      act(() => {
        result.current.openDialog(editData, 'account-123');
      });

      expect(result.current.editingId).toBe('account-123');
      expect(result.current.isEditing).toBe(true);
    });

    it('should clear editingId when closing dialog', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));

      act(() => {
        result.current.openDialog({ name: 'Test', email: 'test@example.com' }, 'id-456');
      });

      expect(result.current.editingId).toBe('id-456');

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.editingId).toBeNull();
    });

    it('should set editingId to null when opening without ID', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));

      act(() => {
        result.current.openDialog({ name: 'Test', email: 'test@example.com' });
      });

      expect(result.current.editingId).toBeNull();
      expect(result.current.isEditing).toBe(true); // Still editing mode (has data)
    });
  });

  describe('onOpen callback', () => {
    it('should invoke onOpen callback when dialog opens in create mode', () => {
      const onOpen = jest.fn();
      const { result } = renderHook(() => useDialog<TestFormData>(initialData, { onOpen }));

      act(() => {
        result.current.openDialog();
      });

      expect(onOpen).toHaveBeenCalledWith(null);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should invoke onOpen callback when dialog opens in edit mode', () => {
      const onOpen = jest.fn();
      const { result } = renderHook(() => useDialog<TestFormData>(initialData, { onOpen }));
      const editData: TestFormData = { name: 'Test', email: 'test@example.com' };

      act(() => {
        result.current.openDialog(editData, 'id-123');
      });

      expect(onOpen).toHaveBeenCalledWith(editData);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should not invoke onOpen callback when not provided', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));

      // Should not throw error
      act(() => {
        result.current.openDialog();
      });

      expect(result.current.open).toBe(true);
    });
  });

  describe('onClose callback', () => {
    it('should invoke onClose callback when dialog closes', () => {
      const onClose = jest.fn();
      const { result } = renderHook(() => useDialog<TestFormData>(initialData, { onClose }));

      act(() => {
        result.current.openDialog();
      });

      act(() => {
        result.current.closeDialog();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not invoke onClose callback when not provided', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));

      act(() => {
        result.current.openDialog();
      });

      // Should not throw error
      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.open).toBe(false);
    });
  });

  describe('resetOnClose option', () => {
    it('should reset data to initial on close by default', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));
      const editData: TestFormData = { name: 'Test', email: 'test@example.com' };

      act(() => {
        result.current.openDialog(editData);
      });

      expect(result.current.data).toEqual(editData);

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.data).toEqual(initialData); // Reset
    });

    it('should preserve data on close when resetOnClose is false', () => {
      const { result } = renderHook(() =>
        useDialog<TestFormData>(initialData, { resetOnClose: false })
      );
      const editData: TestFormData = { name: 'Test', email: 'test@example.com' };

      act(() => {
        result.current.openDialog(editData);
      });

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.data).toEqual(editData); // Preserved
    });

    it('should preserve data across multiple cycles when resetOnClose is false', () => {
      const { result } = renderHook(() =>
        useDialog<TestFormData>(initialData, { resetOnClose: false })
      );

      const data1: TestFormData = { name: 'First', email: 'first@example.com' };
      const data2: TestFormData = { name: 'Second', email: 'second@example.com' };

      // First cycle
      act(() => {
        result.current.openDialog(data1);
      });

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.data).toEqual(data1);

      // Second cycle
      act(() => {
        result.current.openDialog(data2);
      });

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.data).toEqual(data2);
    });
  });

  describe('updateData method', () => {
    it('should update form data using updateData', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));
      const newData: TestFormData = { name: 'Updated', email: 'updated@example.com' };

      act(() => {
        result.current.updateData(newData);
      });

      expect(result.current.data).toEqual(newData);
    });

    it('should support partial updates via spread operator', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));

      act(() => {
        result.current.openDialog({ name: 'Original', email: 'original@example.com' });
      });

      act(() => {
        result.current.updateData({ ...result.current.data, name: 'Updated Name' });
      });

      expect(result.current.data.name).toBe('Updated Name');
      expect(result.current.data.email).toBe('original@example.com'); // Unchanged
    });

    it('should work as alias for setData (backward compatibility)', () => {
      const { result } = renderHook(() => useDialog<TestFormData>(initialData));
      const newData: TestFormData = { name: 'Test', email: 'test@example.com' };

      act(() => {
        result.current.updateData(newData);
      });

      expect(result.current.data).toEqual(newData);

      // setData should also work
      const anotherData: TestFormData = { name: 'Another', email: 'another@example.com' };
      act(() => {
        result.current.setData(anotherData);
      });

      expect(result.current.data).toEqual(anotherData);
    });
  });

  describe('complete workflows with enhanced features', () => {
    it('should handle form validation error workflow', () => {
      const onClose = jest.fn();
      const { result } = renderHook(() => useDialog<TestFormData>(initialData, { onClose }));

      // Open dialog
      act(() => {
        result.current.openDialog();
      });

      // User fills form
      act(() => {
        result.current.updateData({ ...result.current.data, name: 'Test' });
      });

      // Validation fails - dialog stays open
      expect(result.current.open).toBe(true);

      // User closes without saving
      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.data).toEqual(initialData); // Reset
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle successful edit workflow with callbacks', () => {
      const onOpen = jest.fn();
      const onClose = jest.fn();
      const { result } = renderHook(() => useDialog<TestFormData>(initialData, { onOpen, onClose }));

      const existingData: TestFormData = { name: 'Existing', email: 'existing@example.com' };

      // Open for editing
      act(() => {
        result.current.openDialog(existingData, 'edit-id-789');
      });

      expect(onOpen).toHaveBeenCalledWith(existingData);
      expect(result.current.editingId).toBe('edit-id-789');

      // User updates
      act(() => {
        result.current.updateData({ ...result.current.data, name: 'Updated' });
      });

      // Save successful, close dialog
      act(() => {
        result.current.closeDialog();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(result.current.editingId).toBeNull();
    });
  });
});
