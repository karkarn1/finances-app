/**
 * withErrorHandler Higher-Order Component
 *
 * Wraps a component with an ErrorBoundary to catch and handle errors gracefully.
 * Provides consistent error handling across the application.
 */

import { FC, ComponentType } from 'react';
import { ErrorBoundary, FallbackProps } from '@/components/ErrorBoundary/index';

/**
 * HOC that wraps a component with an ErrorBoundary
 *
 * @param Component - The component to wrap with error handling
 * @param FallbackComponent - Optional custom fallback component to display on error
 * @param onReset - Optional callback to run when error boundary is reset
 *
 * @example
 * ```typescript
 * // Basic usage
 * const SafeComponent = withErrorHandler(MyComponent);
 *
 * // With custom fallback
 * const SafeComponent = withErrorHandler(MyComponent, CustomErrorFallback);
 *
 * // With reset handler
 * const SafeComponent = withErrorHandler(MyComponent, undefined, () => {
 *   console.log('Error boundary reset');
 * });
 * ```
 */
export const withErrorHandler = <P extends object>(
  Component: ComponentType<P>,
  FallbackComponent?: FC<FallbackProps>,
  onReset?: () => void
): FC<P> => {
  const WrappedComponent: FC<P> = (props) => (
    <ErrorBoundary FallbackComponent={FallbackComponent} onReset={onReset}>
      <Component {...props} />
    </ErrorBoundary>
  );

  // Set display name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorHandler(${componentName})`;

  return WrappedComponent;
};

export default withErrorHandler;
