import type { Response } from 'express';
import {
  buildSuccessBody,
  DEFAULT_MESSAGES,
  resolveMessage,
  resolveStatusCode,
} from '../utils/response-builder';

/**
 * Creates the `res.success(data, message?, statusCode?)` method bound to a response.
 */
export function createSuccessMethod(res: Response) {
  return <T = unknown>(data?: T, message?: string, statusCode?: number): Response => {
    if (res.headersSent) return res;
    const code = resolveStatusCode(statusCode, 200);
    const body = buildSuccessBody<T>(resolveMessage(message, DEFAULT_MESSAGES.success), data);
    return res.status(code).json(body);
  };
}
