import type { Response } from 'express';
import type { ErrorResponseField } from '../types';
import {
  buildErrorBody,
  DEFAULT_MESSAGES,
  resolveErrorMessage,
  resolveStatusCode,
} from '../utils/response-builder';

/**
 * Creates the `res.error(message?, statusCode?, errors?)` method bound to a response.
 */
export function createErrorMethod(res: Response) {
  return (message?: string, statusCode?: number, errors?: ErrorResponseField[]): Response => {
    if (res.headersSent) return res;
    const code = resolveStatusCode(statusCode, 500);
    const body = buildErrorBody(resolveErrorMessage(message, DEFAULT_MESSAGES.error), errors);
    return res.status(code).json(body);
  };
}
