# @arshiyank/express-response-kit

> A lightweight Express.js middleware that standardises API responses — consistent success, error, validation and pagination formats with zero runtime dependencies.

Instead of writing repetitive response code:

```js
res.status(200).json({
  success: true,
  message: 'User created',
  data: user,
});
```

…simply write:

```js
res.success(user, 'User created');
```

---

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API reference](#api-reference)
  - [`res.success`](#ressuccess)
  - [`res.created`](#rescreated)
  - [`res.error`](#reserror)
  - [`res.notFound`](#resnotfound)
  - [`res.validationError`](#resvalidationerror)
  - [`res.unauthorized`](#resunauthorized)
  - [`res.forbidden`](#resforbidden)
  - [`res.paginated`](#respaginated)
- [Standard response structure](#standard-response-structure)
- [TypeScript support](#typescript-support)
- [Custom status codes](#custom-status-codes)
- [Pagination](#pagination)
- [Error handling](#error-handling)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **8 response helpers** — `success`, `created`, `error`, `notFound`, `validationError`, `unauthorized`, `forbidden`, `paginated`.
- **Consistent structure** — every response follows the same `{ success, message, data }` shape.
- **Automatic pagination** — `totalPages` is calculated for you.
- **First-class TypeScript** — Express `Response` is augmented, so you get full autocomplete and type checking.
- **Dual ESM / CommonJS** — works in both module systems.
- **Zero runtime dependencies** — Express is the only peer dependency.
- **Safe by default** — guards against double responses, invalid status codes, invalid pagination and never leaks stack traces.
- **Works with Express 4 and Express 5.**

---

## Installation

```bash
npm install @arshiyank/express-response-kit
```

```bash
yarn add @arshiyank/express-response-kit
```

```bash
pnpm add @arshiyank/express-response-kit
```

Express is a peer dependency, so make sure it is installed:

```bash
npm install express
```

---

## Quick start

```ts
import express from 'express';
import { responseMiddleware } from '@arshiyank/express-response-kit';

const app = express();

app.use(express.json());
app.use(responseMiddleware);

app.get('/users', (req, res) => {
  res.success([{ id: 1, name: 'John' }], 'Users fetched successfully');
});

app.post('/users', (req, res) => {
  const user = { id: 2, name: 'Jane' };
  res.created(user, 'User created');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

---

## API reference

All methods are attached automatically once the middleware is mounted with `app.use(responseMiddleware)`. Every method returns the Express `Response` object, so you can `return res.success(...)` from a handler.

### `res.success`

```ts
res.success(data?, message?, statusCode?): Response
```

Sends a success response.

| Parameter    | Type     | Default     | Description             |
| ------------ | -------- | ----------- | ----------------------- |
| `data`       | `any`    | `null`      | The payload to return.  |
| `message`    | `string` | `'Success'` | Human readable message. |
| `statusCode` | `number` | `200`       | HTTP status code.       |

```ts
app.get('/users/:id', (req, res) => {
  res.success({ id: 1, name: 'John' }, 'User fetched successfully');
});
```

### `res.created`

```ts
res.created(data?, message?): Response
```

Sends a `201 Created` success response.

| Parameter | Type     | Default                           | Description             |
| --------- | -------- | --------------------------------- | ----------------------- |
| `data`    | `any`    | `null`                            | The created payload.    |
| `message` | `string` | `'Resource created successfully'` | Human readable message. |

```ts
app.post('/users', (req, res) => {
  res.created({ id: 2, name: 'Jane' }, 'User created');
});
```

### `res.error`

```ts
res.error(message?, statusCode?, errors?): Response
```

Sends an error response.

| Parameter    | Type                   | Default                   | Description                 |
| ------------ | ---------------------- | ------------------------- | --------------------------- |
| `message`    | `string`               | `'Internal server error'` | Human readable message.     |
| `statusCode` | `number`               | `500`                     | HTTP status code.           |
| `errors`     | `ErrorResponseField[]` | `undefined`               | Optional structured errors. |

```ts
app.get('/users/:id', (req, res) => {
  res.error('User not found', 404);
});

// With structured errors
res.error('Conflict', 409, [{ field: 'email', message: 'Email already in use' }]);
```

### `res.notFound`

```ts
res.notFound(message?): Response
```

Sends a `404 Not Found` error response.

| Parameter | Type     | Default                | Description             |
| --------- | -------- | ---------------------- | ----------------------- |
| `message` | `string` | `'Resource not found'` | Human readable message. |

```ts
app.get('/users/:id', (req, res) => {
  res.notFound('User not found');
});
```

### `res.validationError`

```ts
res.validationError(errors?, message?): Response
```

Sends a `422 Unprocessable Entity` error response that always includes an `errors` array.

| Parameter | Type                   | Default               | Description                    |
| --------- | ---------------------- | --------------------- | ------------------------------ |
| `errors`  | `ErrorResponseField[]` | `[]`                  | Field-level validation errors. |
| `message` | `string`               | `'Validation failed'` | Human readable message.        |

```ts
app.post('/users', (req, res) => {
  res.validationError(
    [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Password too short' },
    ],
    'Please fix the highlighted fields',
  );
});
```

### `res.unauthorized`

```ts
res.unauthorized(message?): Response
```

Sends a `401 Unauthorized` error response.

| Parameter | Type     | Default          | Description             |
| --------- | -------- | ---------------- | ----------------------- |
| `message` | `string` | `'Unauthorized'` | Human readable message. |

```ts
app.get('/profile', (req, res) => {
  res.unauthorized('Authentication required');
});
```

### `res.forbidden`

```ts
res.forbidden(message?): Response
```

Sends a `403 Forbidden` error response.

| Parameter | Type     | Default       | Description             |
| --------- | -------- | ------------- | ----------------------- |
| `message` | `string` | `'Forbidden'` | Human readable message. |

```ts
app.delete('/admin/settings', (req, res) => {
  res.forbidden('Admins only');
});
```

### `res.paginated`

```ts
res.paginated(data, pagination, message?): Response
```

Sends a paginated success response. `totalPages` is calculated automatically from `total` and `limit`.

| Parameter    | Type              | Default                       | Description                             |
| ------------ | ----------------- | ----------------------------- | --------------------------------------- |
| `data`       | `any[]`           | —                             | The array payload for the current page. |
| `pagination` | `PaginationInput` | —                             | `{ page, limit, total }`.               |
| `message`    | `string`          | `'Data fetched successfully'` | Human readable message.                 |

```ts
app.get('/users', (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const users = getUsersForPage(page, limit); // your data source
  const total = countUsers();

  res.paginated(users, { page, limit, total }, 'Users fetched successfully');
});
```

---

## Standard response structure

### Success

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "id": 1, "name": "John" }
}
```

### Error

```json
{
  "success": false,
  "message": "Something went wrong",
  "data": null
}
```

### Validation error

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

### Paginated

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## TypeScript support

The package ships with its own type declarations and **augments the Express `Response` interface**, so the helpers are fully typed as soon as you mount the middleware.

```ts
import express from 'express';
import { responseMiddleware, type ErrorResponseField } from '@arshiyank/express-response-kit';

const app = express();
app.use(responseMiddleware);

app.get('/users', (req, res) => {
  // `res.success` is fully typed, including autocomplete for arguments.
  return res.success({ id: 1 }, 'ok');
});

app.post('/users', (req, res) => {
  const errors: ErrorResponseField[] = [{ field: 'email', message: 'Invalid email' }];
  return res.validationError(errors);
});
```

The following types are exported for your own code:

```ts
import type {
  ErrorResponseField,
  PaginationInput,
  PaginationMeta,
  SuccessResponseBody,
  ErrorResponseBody,
  ValidationResponseBody,
  PaginatedResponseBody,
} from '@arshiyank/express-response-kit';
```

---

## Custom status codes

`res.success` and `res.error` accept an explicit status code. Any integer in the `100`–`599` range is accepted; out-of-range or non-integer values fall back to the method default.

```ts
res.success({ accepted: true }, 'Accepted', 202);
res.error('Rate limited', 429);
```

---

## Pagination

Pass `{ page, limit, total }` and `@arshiyank/express-response-kit` computes `totalPages`:

```ts
res.paginated(users, { page: 2, limit: 10, total: 95 });
// pagination: { page: 2, limit: 10, total: 95, totalPages: 10 }
```

Edge cases are handled safely:

- **Empty result set** (`total: 0`) → `totalPages: 0`.
- **Invalid values** (negative, `NaN`, `Infinity`, `limit: 0`) → values are clamped and `totalPages` becomes `0` instead of throwing or producing `Infinity`.

---

## Error handling

- **No double responses** — every method checks `res.headersSent` first and becomes a no-op if the response has already started, so you never hit `Error [ERR_HTTP_HEADERS_SENT]`.
- **No leaked stack traces** — error responses only ever contain the message you provide. Passing `error.stack` as the message still produces a clean body because stack traces are not surfaced as structured fields.
- **Invalid status codes** fall back to the method default rather than crashing the process.
- **Existing Express methods are never overwritten** — helpers are only attached when missing.

---

## Compatibility

- **Node.js** `>= 18`
- **Express** `4.x` and `5.x`
- **Module systems** — both ESM (`import`) and CommonJS (`require`) are supported.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Install dependencies: `npm install`.
4. Make your changes and add tests.
5. Run the full check suite:

   ```bash
   npm run lint
   npm run typecheck
   npm run test:coverage
   npm run build
   ```

6. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
7. Open a pull request.

Please ensure the test suite passes and coverage stays at or above **90%**.

### Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run build`         | Build ESM + CJS + types with `tsup`. |
| `npm test`              | Run the test suite once.             |
| `npm run test:watch`    | Run tests in watch mode.             |
| `npm run test:coverage` | Run tests with coverage reporting.   |
| `npm run lint`          | Lint with ESLint.                    |
| `npm run lint:fix`      | Lint and auto-fix.                   |
| `npm run format`        | Format with Prettier.                |
| `npm run format:check`  | Check formatting without writing.    |
| `npm run typecheck`     | Type-check with `tsc --noEmit`.      |
| `npm run clean`         | Remove `dist` and `coverage`.        |

---

## License

[MIT](./LICENSE) © Mohammad Arshiyan
