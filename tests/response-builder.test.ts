import { describe, it, expect } from 'vitest';
import {
  buildErrorBody,
  buildPaginatedBody,
  buildSuccessBody,
  buildValidationBody,
  calculatePagination,
  DEFAULT_MESSAGES,
  normalizeData,
  resolveErrorMessage,
  resolveMessage,
  resolveStatusCode,
  sanitizeMessage,
} from '../src/utils/response-builder';

describe('resolveMessage', () => {
  it('returns the message when it is a string', () => {
    expect(resolveMessage('hello', 'fallback')).toBe('hello');
  });

  it('returns the fallback for non-strings', () => {
    expect(resolveMessage(undefined, 'fallback')).toBe('fallback');
    expect(resolveMessage(null, 'fallback')).toBe('fallback');
    expect(resolveMessage(42, 'fallback')).toBe('fallback');
    expect(resolveMessage({ a: 1 }, 'fallback')).toBe('fallback');
  });

  it('keeps an empty string', () => {
    expect(resolveMessage('', 'fallback')).toBe('');
  });
});

describe('sanitizeMessage', () => {
  it('returns normal messages untouched', () => {
    expect(sanitizeMessage('Something went wrong')).toBe('Something went wrong');
    expect(sanitizeMessage('User not found')).toBe('User not found');
  });

  it('strips stack frames and the Error prefix from a stack trace', () => {
    const stack = `Error: boom\n    at /path/file.ts:10:5\n    at /path/other.ts:20:10`;
    expect(sanitizeMessage(stack)).toBe('boom');
  });

  it('strips typed-error prefixes', () => {
    const stack = `TypeError: x is not a function\n    at /path/file.ts:1:1`;
    expect(sanitizeMessage(stack)).toBe('x is not a function');
  });

  it('returns an empty string when the first line has no readable message', () => {
    const stack = `\n    at /path/file.ts:1:1\n    at /path/other.ts:2:2`;
    expect(sanitizeMessage(stack)).toBe('');
  });
});

describe('resolveErrorMessage', () => {
  it('returns a clean message unchanged', () => {
    expect(resolveErrorMessage('Bad request', 'fallback')).toBe('Bad request');
  });

  it('falls back for non-strings', () => {
    expect(resolveErrorMessage(undefined, 'fallback')).toBe('fallback');
    expect(resolveErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('extracts the message from a stack trace', () => {
    const stack = `Error: boom\n    at /x:1:1`;
    expect(resolveErrorMessage(stack, 'fallback')).toBe('boom');
  });

  it('falls back when a stack trace has no readable message', () => {
    const stack = `\n    at /x:1:1`;
    expect(resolveErrorMessage(stack, 'fallback')).toBe('fallback');
  });
});

describe('resolveStatusCode', () => {
  it('returns valid HTTP status codes', () => {
    expect(resolveStatusCode(200, 500)).toBe(200);
    expect(resolveStatusCode(100, 500)).toBe(100);
    expect(resolveStatusCode(599, 500)).toBe(599);
    expect(resolveStatusCode(418, 500)).toBe(418);
  });

  it('falls back for out-of-range or non-integer values', () => {
    expect(resolveStatusCode(99, 500)).toBe(500);
    expect(resolveStatusCode(600, 500)).toBe(500);
    expect(resolveStatusCode(200.5, 500)).toBe(500);
    expect(resolveStatusCode('200', 500)).toBe(500);
    expect(resolveStatusCode(undefined, 500)).toBe(500);
    expect(resolveStatusCode(NaN, 500)).toBe(500);
  });
});

describe('normalizeData', () => {
  it('turns undefined into null', () => {
    expect(normalizeData(undefined)).toBeNull();
  });

  it('preserves falsy but valid values', () => {
    expect(normalizeData(0)).toBe(0);
    expect(normalizeData(false)).toBe(false);
    expect(normalizeData('')).toBe('');
    expect(normalizeData([])).toEqual([]);
  });
});

describe('buildSuccessBody', () => {
  it('builds a success body with data', () => {
    expect(buildSuccessBody('ok', { id: 1 })).toEqual({
      success: true,
      message: 'ok',
      data: { id: 1 },
    });
  });

  it('defaults undefined data to null', () => {
    expect(buildSuccessBody('ok', undefined)).toEqual({
      success: true,
      message: 'ok',
      data: null,
    });
  });
});

describe('buildErrorBody', () => {
  it('builds an error body without errors by default', () => {
    const body = buildErrorBody('boom');
    expect(body).toEqual({ success: false, message: 'boom', data: null });
    expect(body).not.toHaveProperty('errors');
  });

  it('includes errors only when provided and non-empty', () => {
    const errors = [{ field: 'email', message: 'Invalid' }];
    expect(buildErrorBody('boom', errors)).toEqual({
      success: false,
      message: 'boom',
      data: null,
      errors,
    });
  });

  it('omits errors for an empty array', () => {
    expect(buildErrorBody('boom', [])).not.toHaveProperty('errors');
  });
});

describe('buildValidationBody', () => {
  it('always includes the errors array', () => {
    expect(buildValidationBody('Validation failed', [])).toEqual({
      success: false,
      message: 'Validation failed',
      data: null,
      errors: [],
    });
  });

  it('coerces non-array errors to an empty array', () => {
    const body = buildValidationBody('x', undefined as never);
    expect(body.errors).toEqual([]);
  });
});

describe('calculatePagination', () => {
  it('calculates totalPages from total and limit', () => {
    expect(calculatePagination({ page: 1, limit: 10, total: 100 })).toEqual({
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    });
    expect(calculatePagination({ page: 2, limit: 10, total: 95 })).toEqual({
      page: 2,
      limit: 10,
      total: 95,
      totalPages: 10,
    });
  });

  it('returns 0 totalPages for an empty result set', () => {
    expect(calculatePagination({ page: 1, limit: 10, total: 0 })).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it('floors fractional page, limit and total', () => {
    expect(calculatePagination({ page: 1.9, limit: 10.9, total: 100.9 })).toEqual({
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    });
  });

  it('handles invalid values without crashing', () => {
    expect(calculatePagination({ page: -1, limit: 0, total: -5 })).toEqual({
      page: 1,
      limit: 0,
      total: 0,
      totalPages: 0,
    });
    expect(
      calculatePagination({ page: NaN, limit: '10' as unknown as number, total: Infinity }),
    ).toEqual({ page: 1, limit: 0, total: 0, totalPages: 0 });
  });

  it('returns 0 totalPages when limit is not positive', () => {
    expect(calculatePagination({ page: 1, limit: 0, total: 100 })).toEqual({
      page: 1,
      limit: 0,
      total: 100,
      totalPages: 0,
    });
  });
});

describe('buildPaginatedBody', () => {
  it('builds a paginated body', () => {
    const meta = calculatePagination({ page: 1, limit: 10, total: 25 });
    expect(buildPaginatedBody('done', [{ id: 1 }], meta)).toEqual({
      success: true,
      message: 'done',
      data: [{ id: 1 }],
      pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
    });
  });

  it('coerces non-array data to an empty array', () => {
    const meta = calculatePagination({ page: 1, limit: 10, total: 0 });
    expect(buildPaginatedBody('done', 'nope' as unknown as never[], meta).data).toEqual([]);
  });
});

describe('DEFAULT_MESSAGES', () => {
  it('exposes a message for every method', () => {
    expect(DEFAULT_MESSAGES.success).toBeTruthy();
    expect(DEFAULT_MESSAGES.error).toBeTruthy();
    expect(DEFAULT_MESSAGES.notFound).toBeTruthy();
    expect(DEFAULT_MESSAGES.validationError).toBeTruthy();
    expect(DEFAULT_MESSAGES.unauthorized).toBeTruthy();
    expect(DEFAULT_MESSAGES.forbidden).toBeTruthy();
    expect(DEFAULT_MESSAGES.created).toBeTruthy();
    expect(DEFAULT_MESSAGES.paginated).toBeTruthy();
  });
});
