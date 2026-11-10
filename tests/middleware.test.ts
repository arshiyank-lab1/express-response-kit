import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './helper';

describe('responseMiddleware integration', () => {
  it('attaches all helper methods to res', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => {
        res.json({
          success: typeof res.success,
          error: typeof res.error,
          notFound: typeof res.notFound,
          validationError: typeof res.validationError,
          unauthorized: typeof res.unauthorized,
          forbidden: typeof res.forbidden,
          created: typeof res.created,
          paginated: typeof res.paginated,
        });
      });
    });
    const res = await request(app).get('/');
    expect(res.body).toEqual({
      success: 'function',
      error: 'function',
      notFound: 'function',
      validationError: 'function',
      unauthorized: 'function',
      forbidden: 'function',
      created: 'function',
      paginated: 'function',
    });
  });
});

describe('res.success', () => {
  it('sends a default 200 success response', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.success({ id: 1, name: 'John' }));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Success',
      data: { id: 1, name: 'John' },
    });
  });

  it('accepts a custom message and status code', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.success({ ok: true }, 'All good', 202));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(202);
    expect(res.body.message).toBe('All good');
  });

  it('defaults to null data when called with no arguments', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.success());
    });
    const res = await request(app).get('/');
    expect(res.body).toEqual({ success: true, message: 'Success', data: null });
  });

  it('preserves falsy data values', async () => {
    const app = createApp((app) => {
      app.get('/zero', (req, res) => res.success(0));
      app.get('/false', (req, res) => res.success(false));
      app.get('/empty', (req, res) => res.success(''));
      app.get('/arr', (req, res) => res.success([]));
    });
    expect((await request(app).get('/zero')).body.data).toBe(0);
    expect((await request(app).get('/false')).body.data).toBe(false);
    expect((await request(app).get('/empty')).body.data).toBe('');
    expect((await request(app).get('/arr')).body.data).toEqual([]);
  });

  it('falls back to 200 for an invalid status code', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.success({ ok: true }, 'ok', 999));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});

describe('res.error', () => {
  it('sends a default 500 error response', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.error());
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Internal server error',
      data: null,
    });
    expect(res.body).not.toHaveProperty('errors');
  });

  it('accepts a custom message and status code', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.error('Bad request', 400));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad request');
  });

  it('includes structured errors when provided', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) =>
        res.error('Conflict', 409, [{ field: 'id', message: 'Already exists' }]),
      );
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(409);
    expect(res.body.errors).toEqual([{ field: 'id', message: 'Already exists' }]);
  });

  it('falls back to 500 for an invalid status code', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.error('boom', 42));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  it('never exposes stack traces', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.error(new Error('boom').stack, 500));
    });
    const res = await request(app).get('/');
    expect(JSON.stringify(res.body)).not.toContain('at ');
    expect(JSON.stringify(res.body)).not.toContain('Error:');
  });
});

describe('res.notFound', () => {
  it('sends a 404 with the default message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.notFound());
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: 'Resource not found',
      data: null,
    });
  });

  it('accepts a custom message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.notFound('User not found'));
    });
    const res = await request(app).get('/');
    expect(res.body.message).toBe('User not found');
  });
});

describe('res.validationError', () => {
  it('sends a 422 with errors and default message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) =>
        res.validationError([{ field: 'email', message: 'Invalid email' }]),
      );
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      success: false,
      message: 'Validation failed',
      data: null,
      errors: [{ field: 'email', message: 'Invalid email' }],
    });
  });

  it('accepts a custom message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) =>
        res.validationError([{ field: 'name', message: 'Required' }], 'Please fix the errors'),
      );
    });
    const res = await request(app).get('/');
    expect(res.body.message).toBe('Please fix the errors');
  });

  it('returns an empty errors array when none are provided', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.validationError());
    });
    const res = await request(app).get('/');
    expect(res.body.errors).toEqual([]);
  });
});

describe('res.unauthorized', () => {
  it('sends a 401 with the default message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.unauthorized());
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
    expect(res.body.success).toBe(false);
  });

  it('accepts a custom message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.unauthorized('Token expired'));
    });
    const res = await request(app).get('/');
    expect(res.body.message).toBe('Token expired');
  });
});

describe('res.forbidden', () => {
  it('sends a 403 with the default message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.forbidden());
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  it('accepts a custom message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.forbidden('Admins only'));
    });
    const res = await request(app).get('/');
    expect(res.body.message).toBe('Admins only');
  });
});

describe('res.created', () => {
  it('sends a 201 with data and default message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.created({ id: 1, name: 'John' }));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: 'Resource created successfully',
      data: { id: 1, name: 'John' },
    });
  });

  it('accepts a custom message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.created({ id: 1 }, 'User created'));
    });
    const res = await request(app).get('/');
    expect(res.body.message).toBe('User created');
  });

  it('defaults to null data when called with no arguments', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.created());
    });
    const res = await request(app).get('/');
    expect(res.body.data).toBeNull();
  });
});

describe('res.paginated', () => {
  it('sends a 200 with calculated totalPages', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) =>
        res.paginated([{ id: 1 }, { id: 2 }], { page: 1, limit: 10, total: 25 }),
      );
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Data fetched successfully',
      data: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
    });
  });

  it('handles empty data with total 0', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.paginated([], { page: 1, limit: 10, total: 0 }));
    });
    const res = await request(app).get('/');
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  it('accepts a custom message', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) =>
        res.paginated([], { page: 1, limit: 10, total: 0 }, 'No users yet'),
      );
    });
    const res = await request(app).get('/');
    expect(res.body.message).toBe('No users yet');
  });

  it('handles invalid pagination values without crashing', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => res.paginated([{ id: 1 }], { page: -5, limit: 0, total: -10 }));
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({ page: 1, limit: 0, total: 0, totalPages: 0 });
  });
});

describe('double-send protection', () => {
  it('does not throw or resend when headers are already sent', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => {
        res.success({ first: true });
        // Second call must be a no-op because headers are already sent.
        res.success({ second: true });
      });
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ first: true });
  });

  it('every method becomes a no-op once headers are sent', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => {
        res.success({ first: true });
        // None of the following should throw or overwrite the first response.
        res.error();
        res.notFound();
        res.validationError();
        res.unauthorized();
        res.forbidden();
        res.created({ x: 1 });
        res.paginated([], { page: 1, limit: 10, total: 0 });
      });
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ first: true });
  });
});

describe('return value', () => {
  it('methods return the response object for chaining', async () => {
    const app = createApp((app) => {
      app.get('/', (req, res) => {
        const result = res.success({ ok: true });
        expect(result).toBe(res);
      });
    });
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});
