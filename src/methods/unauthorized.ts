import type { Response } from 'express';
import { buildErrorBody, DEFAULT_MESSAGES, resolveErrorMessage } from '../utils/response-builder';

/**
 * Creates the `res.unauthorized(message?)` method bound to a response.
 */
export function createUnauthorizedMethod(res: Response) {
  return (message?: string): Response => {
    if (res.headersSent) return res;
    const body = buildErrorBody(resolveErrorMessage(message, DEFAULT_MESSAGES.unauthorized));
    return res.status(401).json(body);
  };
}
