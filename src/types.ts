/**
 * A single validation error entry describing a failing field.
 */
export interface ErrorResponseField {
  field: string;
  message: string;
}

/**
 * Pagination metadata returned to the client.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination input provided by the caller. `totalPages` is calculated automatically.
 */
export interface PaginationInput {
  page: number;
  limit: number;
  total: number;
}

/**
 * Standard success response body.
 */
export interface SuccessResponseBody<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/**
 * Standard error response body.
 */
export interface ErrorResponseBody {
  success: false;
  message: string;
  data: null;
}

/**
 * Validation error response body. Always includes the `errors` array.
 */
export interface ValidationResponseBody extends ErrorResponseBody {
  errors: ErrorResponseField[];
}

/**
 * Paginated response body.
 */
export interface PaginatedResponseBody<T = unknown> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Augments the Express `Response` object with the standardised response helpers.
 *
 * The augmentation targets `express-serve-static-core` so that it works with both
 * Express 4 and Express 5 type definitions.
 */
declare module 'express-serve-static-core' {
  interface Response {
    /**
     * Send a success response.
     *
     * @param data        The payload to return.
     * @param message     Human readable message. Defaults to "Success".
     * @param statusCode  HTTP status code. Defaults to 200.
     */
    success<T = unknown>(data?: T, message?: string, statusCode?: number): Response;

    /**
     * Send an error response.
     *
     * @param message     Human readable message. Defaults to "Internal server error".
     * @param statusCode  HTTP status code. Defaults to 500.
     * @param errors      Optional list of structured errors.
     */
    error(message?: string, statusCode?: number, errors?: ErrorResponseField[]): Response;

    /**
     * Send a 404 Not Found response.
     *
     * @param message Human readable message. Defaults to "Resource not found".
     */
    notFound(message?: string): Response;

    /**
     * Send a 422 Validation Error response.
     *
     * @param errors  List of field-level validation errors.
     * @param message Human readable message. Defaults to "Validation failed".
     */
    validationError(errors?: ErrorResponseField[], message?: string): Response;

    /**
     * Send a 401 Unauthorized response.
     *
     * @param message Human readable message. Defaults to "Unauthorized".
     */
    unauthorized(message?: string): Response;

    /**
     * Send a 403 Forbidden response.
     *
     * @param message Human readable message. Defaults to "Forbidden".
     */
    forbidden(message?: string): Response;

    /**
     * Send a 201 Created response.
     *
     * @param data    The created payload.
     * @param message Human readable message. Defaults to "Resource created successfully".
     */
    created<T = unknown>(data?: T, message?: string): Response;

    /**
     * Send a paginated success response. `totalPages` is calculated automatically.
     *
     * @param data        The array payload for the current page.
     * @param pagination  Page, limit and total counts.
     * @param message     Human readable message. Defaults to "Data fetched successfully".
     */
    paginated<T = unknown>(data: T[], pagination: PaginationInput, message?: string): Response;
  }
}
