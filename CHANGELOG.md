# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-06

### Added

- `responseMiddleware` Express middleware that attaches standardised response helpers.
- `res.success(data, message?, statusCode?)` — success response (default 200).
- `res.error(message?, statusCode?, errors?)` — error response (default 500).
- `res.notFound(message?)` — 404 response.
- `res.validationError(errors?, message?)` — 422 response with structured errors.
- `res.unauthorized(message?)` — 401 response.
- `res.forbidden(message?)` — 403 response.
- `res.created(data?, message?)` — 201 response.
- `res.paginated(data, pagination, message?)` — paginated response with automatic `totalPages`.
- Full TypeScript types with Express `Response` interface augmentation.
- Dual CommonJS and ESM builds via `tsup`.
- Vitest test suite with ≥90% coverage threshold.
- ESLint, Prettier and GitHub Actions CI configuration.
- Example apps verifying the built package in both ESM and CommonJS.

### Security

- Internal stack traces are never exposed in error responses.
