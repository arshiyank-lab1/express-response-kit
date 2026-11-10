import type { Response } from 'express';
import { buildErrorBody, DEFAULT_MESSAGES, resolveErrorMessage } from '../utils/response-builder';

/**
 * Creates the `res.notFound(message?)` method bound to a response.
 */
export function createNotFoundMethod(res: Response) {
  return (message?: string): Response => {
    if (res.headersSent) return res;
    const body = buildErrorBody(resolveErrorMessage(message, DEFAULT_MESSAGES.notFound));
    return res.status(404).json(body);
  };
}
