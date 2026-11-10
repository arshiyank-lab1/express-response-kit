import type { RequestHandler, Response } from 'express';
import { createCreatedMethod } from './methods/created';
import { createErrorMethod } from './methods/error';
import { createForbiddenMethod } from './methods/forbidden';
import { createNotFoundMethod } from './methods/not-found';
import { createPaginatedMethod } from './methods/paginated';
import { createSuccessMethod } from './methods/success';
import { createUnauthorizedMethod } from './methods/unauthorized';
import { createValidationErrorMethod } from './methods/validation-error';

/**
 * Express middleware that attaches the standardised response helpers to `res`.
 *
 * Mount it once, as early as possible:
 *
 * ```ts
 * app.use(responseMiddleware);
 * ```
 *
 * The helpers are only attached when missing, so existing Express methods are
 * never overwritten and the middleware is safe to re-mount.
 */
export const responseMiddleware: RequestHandler = (_req, res, next) => {
  const response = res as Response;

  if (typeof response.success !== 'function') {
    response.success = createSuccessMethod(response);
  }
  if (typeof response.error !== 'function') {
    response.error = createErrorMethod(response);
  }
  if (typeof response.notFound !== 'function') {
    response.notFound = createNotFoundMethod(response);
  }
  if (typeof response.validationError !== 'function') {
    response.validationError = createValidationErrorMethod(response);
  }
  if (typeof response.unauthorized !== 'function') {
    response.unauthorized = createUnauthorizedMethod(response);
  }
  if (typeof response.forbidden !== 'function') {
    response.forbidden = createForbiddenMethod(response);
  }
  if (typeof response.created !== 'function') {
    response.created = createCreatedMethod(response);
  }
  if (typeof response.paginated !== 'function') {
    response.paginated = createPaginatedMethod(response);
  }

  next();
};
