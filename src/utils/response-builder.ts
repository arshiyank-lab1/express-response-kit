import type { ErrorResponseField, PaginationInput, PaginationMeta } from '../types';

/**
 * Default messages used when the caller does not provide one.
 */
export const DEFAULT_MESSAGES = {
  success: 'Success',
  error: 'Internal server error',
  notFound: 'Resource not found',
  validationError: 'Validation failed',
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden',
  created: 'Resource created successfully',
  paginated: 'Data fetched successfully',
} as const;

/**
 * Returns the provided message when it is a string, otherwise the fallback.
 */
export function resolveMessage(message: unknown, fallback: string): string {
  return typeof message === 'string' ? message : fallback;
}

/**
 * Removes internal stack-trace content from a message so it is never leaked in
 * an error response.
 *
 * Only messages that contain stack frames (lines starting with `at`) are
 * altered — normal messages are returned untouched. When frames are detected
 * the leading `ErrorName: ` prefix and every frame line are stripped, leaving
 * only the human-readable message. Returns an empty string when no readable
 * message can be extracted, so callers can fall back to a default.
 */
export function sanitizeMessage(message: string): string {
  if (!/\n\s*at\s/m.test(message)) {
    return message;
  }
  const firstLine = message.split('\n')[0];
  return firstLine.replace(/^\s*\w+:\s*/, '').trim();
}

/**
 * Resolves an error message: falls back for non-strings, strips any stack
 * trace, and falls back again when nothing readable remains. Used by every
 * error-response method so internal stack traces are never exposed.
 */
export function resolveErrorMessage(message: unknown, fallback: string): string {
  const sanitized = sanitizeMessage(resolveMessage(message, fallback));
  return sanitized.length > 0 ? sanitized : fallback;
}

/**
 * Returns the provided status code when it is a valid HTTP status integer,
 * otherwise the fallback. Valid range is 100-599.
 */
export function resolveStatusCode(code: unknown, fallback: number): number {
  return Number.isInteger(code) && (code as number) >= 100 && (code as number) <= 599
    ? (code as number)
    : fallback;
}

/**
 * Coerces `data` so that `undefined` becomes `null`. Falsy but valid values
 * such as `0`, `false` and `""` are preserved.
 */
export function normalizeData<T>(data: T | undefined): T | null {
  return data === undefined ? null : data;
}

export function buildSuccessBody<T>(message: string, data: T | undefined) {
  return {
    success: true as const,
    message,
    data: normalizeData(data),
  };
}

export function buildErrorBody(message: string, errors?: ErrorResponseField[]) {
  const body: {
    success: false;
    message: string;
    data: null;
    errors?: ErrorResponseField[];
  } = {
    success: false,
    message,
    data: null,
  };
  if (Array.isArray(errors) && errors.length > 0) {
    body.errors = errors;
  }
  return body;
}

export function buildValidationBody(message: string, errors?: ErrorResponseField[]) {
  return {
    success: false as const,
    message,
    data: null,
    errors: Array.isArray(errors) ? errors : [],
  };
}

/**
 * Calculates pagination metadata, defending against invalid or missing values.
 *
 * - `page` defaults to 1 when not a positive finite number.
 * - `limit` defaults to 0 when not a positive finite number (no pagination).
 * - `total` defaults to 0 when not a non-negative finite number.
 * - `totalPages` is `ceil(total / limit)`, or 0 when `limit` is not positive.
 */
export function calculatePagination(input: PaginationInput): PaginationMeta {
  const page = Number.isFinite(input.page) && input.page >= 1 ? Math.floor(input.page) : 1;
  const limit = Number.isFinite(input.limit) && input.limit >= 1 ? Math.floor(input.limit) : 0;
  const total = Number.isFinite(input.total) && input.total >= 0 ? Math.floor(input.total) : 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return { page, limit, total, totalPages };
}

export function buildPaginatedBody<T>(message: string, data: T[], pagination: PaginationMeta) {
  return {
    success: true as const,
    message,
    data: Array.isArray(data) ? data : [],
    pagination,
  };
}
