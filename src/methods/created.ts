import type { Response } from 'express';
import { buildSuccessBody, DEFAULT_MESSAGES, resolveMessage } from '../utils/response-builder';

/**
 * Creates the `res.created(data?, message?)` method bound to a response.
 */
export function createCreatedMethod(res: Response) {
  return <T = unknown>(data?: T, message?: string): Response => {
    if (res.headersSent) return res;
    const body = buildSuccessBody<T>(resolveMessage(message, DEFAULT_MESSAGES.created), data);
    return res.status(201).json(body);
  };
}
