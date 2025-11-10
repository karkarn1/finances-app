import { useState } from 'react';

/**
 * Reusable hook for managing dialog state and form data.
 *
 * Handles:
 * - Dialog open/close state
 * - Form data state management
 * - Edit vs. create mode tracking
 * - Automatic reset on close
 *
 * @template T - Type of the form data
 * @param initialData - Initial/empty form data object
 *
 * @example
 * const { open, data, isEditing, openDialog, closeDialog, setData } =
 *   useDialog<AccountFormData>({ name: '', type: 'asset', currency: 'CAD' });
 *
 * // Open for creating new item
 * openDialog();
 *
 * // Open for editing existing item
 * openDialog(existingAccount);
 */
export const useDialog = <T,>(initialData: T) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const openDialog = (editData?: T) => {
    setIsEditing(!!editData);
    setData(editData || initialData);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setIsEditing(false);
    setData(initialData);
  };

  return {
    open,
    data,
    isEditing,
    openDialog,
    closeDialog,
    setData,
  };
};
