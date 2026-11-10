import type { Response } from 'express';
import { buildErrorBody, DEFAULT_MESSAGES, resolveErrorMessage } from '../utils/response-builder';

/**
 * Creates the `res.forbidden(message?)` method bound to a response.
 */
export function createForbiddenMethod(res: Response) {
  return (message?: string): Response => {
    if (res.headersSent) return res;
    const body = buildErrorBody(resolveErrorMessage(message, DEFAULT_MESSAGES.forbidden));
    return res.status(403).json(body);
  };
}
