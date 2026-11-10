import type { Response } from 'express';
import type { ErrorResponseField } from '../types';
import {
  buildValidationBody,
  DEFAULT_MESSAGES,
  resolveErrorMessage,
} from '../utils/response-builder';

/**
 * Creates the `res.validationError(errors?, message?)` method bound to a response.
 */
export function createValidationErrorMethod(res: Response) {
  return (errors?: ErrorResponseField[], message?: string): Response => {
    if (res.headersSent) return res;
    const body = buildValidationBody(
      resolveErrorMessage(message, DEFAULT_MESSAGES.validationError),
      errors,
    );
    return res.status(422).json(body);
  };
}
