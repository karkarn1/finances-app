/**
 * Type guard utilities for runtime type checking.
 * Provides type-safe narrowing for common patterns.
 */

/**
 * Type guard to check if a value is an Error object.
 *
 * @param value - Value to check
 * @returns True if value is an Error
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error) {
 *   if (isError(error)) {
 *     console.log(error.message); // TypeScript knows error is Error
 *   }
 * }
 * ```
 */
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

/**
 * Type guard to check if a value has a message property.
 *
 * @param value - Value to check
 * @returns True if value has a string message property
 *
 * @example
 * ```typescript
 * const error: unknown = { message: 'Failed' };
 * if (hasMessage(error)) {
 *   console.log(error.message); // TypeScript knows message exists
 * }
 * ```
 */
export const hasMessage = (value: unknown): value is { message: string } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
};

/**
 * Type guard to check if a value has a detail property (common in API errors).
 *
 * @param value - Value to check
 * @returns True if value has a detail property
 *
 * @example
 * ```typescript
 * const apiError: unknown = { detail: 'Unauthorized' };
 * if (hasDetail(apiError)) {
 *   console.log(apiError.detail); // TypeScript knows detail exists
 * }
 * ```
 */
export const hasDetail = (
  value: unknown
): value is { detail: string | string[] | Record<string, unknown>[] } => {
  if (typeof value !== 'object' || value === null || !('detail' in value)) {
    return false;
  }

  const detail = (value as { detail: unknown }).detail;
  return (
    typeof detail === 'string' ||
    Array.isArray(detail)
  );
};

/**
 * Type guard to check if a value is a non-null object.
 *
 * @param value - Value to check
 * @returns True if value is a non-null object
 *
 * @example
 * ```typescript
 * const data: unknown = { id: 1 };
 * if (isObject(data)) {
 *   // TypeScript knows data is Record<string, unknown>
 *   console.log(Object.keys(data));
 * }
 * ```
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Type guard to check if a value is a string.
 *
 * @param value - Value to check
 * @returns True if value is a string
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Type guard to check if a value is a number.
 *
 * @param value - Value to check
 * @returns True if value is a number and not NaN
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value);
};

/**
 * Type guard to check if a value is a boolean.
 *
 * @param value - Value to check
 * @returns True if value is a boolean
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

/**
 * Type guard to check if a value is an array.
 *
 * @param value - Value to check
 * @returns True if value is an array
 */
export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

/**
 * Type guard to check if a value is null or undefined.
 *
 * @param value - Value to check
 * @returns True if value is null or undefined
 */
export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Type guard to check if a value is defined (not null or undefined).
 *
 * @param value - Value to check
 * @returns True if value is not null or undefined
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Type guard to check if an object has a specific property.
 *
 * @param obj - Object to check
 * @param key - Property key to check for
 * @returns True if object has the property
 *
 * @example
 * ```typescript
 * const data: unknown = { id: 1, name: 'Test' };
 * if (hasProperty(data, 'id')) {
 *   // TypeScript knows data has id property
 *   console.log(data.id);
 * }
 * ```
 */
export const hasProperty = <K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> => {
  return isObject(obj) && key in obj;
};

/**
 * Type guard to check if a value is a valid HTTP status code.
 *
 * @param value - Value to check
 * @returns True if value is a number between 100 and 599
 */
export const isHttpStatusCode = (value: unknown): value is number => {
  return isNumber(value) && value >= 100 && value <= 599;
};

/**
 * Type guard for API error responses.
 *
 * @param value - Value to check
 * @returns True if value matches API error structure
 *
 * @example
 * ```typescript
 * try {
 *   await fetch('/api/data');
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.log(error.status, error.detail);
 *   }
 * }
 * ```
 */
export interface ApiError {
  status?: number;
  detail?: string | string[] | Record<string, unknown>[];
  message?: string;
}

export const isApiError = (value: unknown): value is ApiError => {
  if (!isObject(value)) {
    return false;
  }

  const hasValidStatus = !hasProperty(value, 'status') || isHttpStatusCode(value['status']);
  const hasValidDetail = !hasProperty(value, 'detail') || hasDetail(value);
  const hasValidMessage = !hasProperty(value, 'message') || isString(value['message']);

  return hasValidStatus && (hasValidDetail || hasValidMessage);
};

/**
 * Type guard to check if a value is a valid Redux SerializedError.
 *
 * @param value - Value to check
 * @returns True if value matches SerializedError structure
 */
export interface SerializedError {
  name?: string;
  message?: string;
  code?: string;
  stack?: string;
}

export const isSerializedError = (value: unknown): value is SerializedError => {
  if (!isObject(value)) {
    return false;
  }

  const hasValidName = !hasProperty(value, 'name') || isString(value['name']);
  const hasValidMessage = !hasProperty(value, 'message') || isString(value['message']);
  const hasValidCode = !hasProperty(value, 'code') || isString(value['code']);
  const hasValidStack = !hasProperty(value, 'stack') || isString(value['stack']);

  return hasValidName && hasValidMessage && hasValidCode && hasValidStack;
};

/**
 * Type guard to check if a value is a function.
 *
 * @param value - Value to check
 * @returns True if value is a function
 */
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => {
  return typeof value === 'function';
};

/**
 * Create a discriminated union type guard.
 *
 * @param discriminantKey - The key used to discriminate between union members
 * @param discriminantValue - The value to check for
 * @returns Type guard function
 *
 * @example
 * ```typescript
 * type Success = { type: 'success'; data: string };
 * type Failure = { type: 'failure'; error: string };
 * type Result = Success | Failure;
 *
 * const isSuccess = createDiscriminatedGuard<Result, 'success'>('type', 'success');
 *
 * const result: Result = { type: 'success', data: 'Hello' };
 * if (isSuccess(result)) {
 *   console.log(result.data); // TypeScript knows this is Success
 * }
 * ```
 */
export const createDiscriminatedGuard = <
  T extends Record<string, unknown>,
  V extends T[K],
  K extends keyof T = keyof T
>(
  discriminantKey: K,
  discriminantValue: V
) => {
  return (value: T): value is Extract<T, Record<K, V>> => {
    return hasProperty(value, discriminantKey as string) &&
           value[discriminantKey] === discriminantValue;
  };
};
