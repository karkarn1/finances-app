import { useState, useCallback } from 'react';

/**
 * Options for configuring dialog behavior.
 *
 * @template T - Type of the form data
 */
export interface UseDialogOptions<T> {
  /**
   * Callback invoked when dialog opens.
   * Receives the data being edited (for edit mode) or null (for create mode).
   */
  onOpen?: (data: T | null) => void;

  /**
   * Callback invoked when dialog closes.
   */
  onClose?: () => void;

  /**
   * If true, resets data to initialData when dialog closes.
   * @default true
   */
  resetOnClose?: boolean;
}

/**
 * Return value of the useDialog hook.
 *
 * @template T - Type of the form data
 */
export interface UseDialogReturn<T> {
  /**
   * Whether the dialog is currently open.
   */
  open: boolean;

  /**
   * Current form data.
   */
  data: T;

  /**
   * ID of the item being edited (null if creating new item).
   */
  editingId: string | null;

  /**
   * Whether currently in editing mode (true) or create mode (false).
   */
  isEditing: boolean;

  /**
   * Open the dialog.
   * @param editData - Optional data for editing mode. If provided, opens in edit mode.
   * @param id - Optional ID of the item being edited.
   */
  openDialog: (editData?: T, id?: string) => void;

  /**
   * Close the dialog and optionally reset state.
   */
  closeDialog: () => void;

  /**
   * Update the current form data.
   * @param newData - New data to set (can be partial update using spread operator).
   */
  updateData: (newData: T) => void;

  /**
   * Directly set the form data (replaces updateData, kept for backward compatibility).
   * @param newData - New data to set.
   * @deprecated Use updateData instead for clarity.
   */
  setData: (newData: T) => void;
}

/**
 * Reusable hook for managing dialog state and form data.
 *
 * Handles:
 * - Dialog open/close state
 * - Form data state management
 * - Edit vs. create mode tracking with ID support
 * - Automatic reset on close (configurable)
 * - Lifecycle callbacks (onOpen, onClose)
 *
 * @template T - Type of the form data
 * @param initialData - Initial/empty form data object
 * @param options - Optional configuration for dialog behavior
 *
 * @example
 * ```typescript
 * // Basic usage
 * const {
 *   open,
 *   data,
 *   isEditing,
 *   editingId,
 *   openDialog,
 *   closeDialog,
 *   updateData
 * } = useDialog<AccountFormData>({
 *   name: '',
 *   type: 'asset',
 *   currency: 'CAD'
 * });
 *
 * // Open for creating new item
 * openDialog();
 *
 * // Open for editing existing item
 * openDialog(existingAccount, existingAccount.id);
 *
 * // Update form data
 * updateData({ ...data, name: 'New Name' });
 * ```
 *
 * @example
 * ```typescript
 * // With callbacks and custom reset behavior
 * const {
 *   open,
 *   data,
 *   openDialog,
 *   closeDialog,
 *   updateData
 * } = useDialog<CurrencyFormData>(
 *   { code: '', name: '', symbol: '', isActive: true },
 *   {
 *     onOpen: (editData) => {
 *       console.log('Dialog opened', editData ? 'for editing' : 'for creation');
 *     },
 *     onClose: () => {
 *       console.log('Dialog closed');
 *     },
 *     resetOnClose: false, // Don't reset data on close
 *   }
 * );
 * ```
 */
export const useDialog = <T>(
  initialData: T,
  options?: UseDialogOptions<T>
): UseDialogReturn<T> => {
  const { onOpen, onClose, resetOnClose = true } = options || {};

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T>(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Open the dialog in create or edit mode.
   */
  const openDialog = useCallback(
    (editData?: T, id?: string) => {
      const editing = !!editData;
      setIsEditing(editing);
      setEditingId(id || null);
      setData(editData || initialData);
      setOpen(true);

      // Invoke onOpen callback if provided
      if (onOpen) {
        onOpen(editData || null);
      }
    },
    [initialData, onOpen]
  );

  /**
   * Close the dialog and reset state based on options.
   */
  const closeDialog = useCallback(() => {
    setOpen(false);
    setIsEditing(false);
    setEditingId(null);

    // Reset data if configured to do so
    if (resetOnClose) {
      setData(initialData);
    }

    // Invoke onClose callback if provided
    if (onClose) {
      onClose();
    }
  }, [initialData, resetOnClose, onClose]);

  /**
   * Update the current form data.
   */
  const updateData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    open,
    data,
    editingId,
    isEditing,
    openDialog,
    closeDialog,
    updateData,
    setData: updateData, // Alias for backward compatibility
  };
};
