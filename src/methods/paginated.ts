import type { Response } from 'express';
import type { PaginationInput } from '../types';
import {
  buildPaginatedBody,
  calculatePagination,
  DEFAULT_MESSAGES,
  resolveMessage,
} from '../utils/response-builder';

/**
 * Creates the `res.paginated(data, pagination, message?)` method bound to a response.
 */
export function createPaginatedMethod(res: Response) {
  return <T = unknown>(data: T[], pagination: PaginationInput, message?: string): Response => {
    if (res.headersSent) return res;
    const meta = calculatePagination(pagination);
    const body = buildPaginatedBody<T>(
      resolveMessage(message, DEFAULT_MESSAGES.paginated),
      data,
      meta,
    );
    return res.status(200).json(body);
  };
}
