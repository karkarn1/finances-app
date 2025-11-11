import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Debounce hooks
export { useDebounce } from './useDebounce';
export { useDebouncedCallback } from './useDebouncedCallback';

// Form and dialog management hooks
export { useDialog } from './useDialog';
export { useFormSubmit } from './useFormSubmit';
export { useZodForm } from './useZodForm';

// API and error handling hooks
export { useApiCall } from './useApiCall';
export type { UseApiCallOptions, UseApiCallReturn } from './useApiCall';
