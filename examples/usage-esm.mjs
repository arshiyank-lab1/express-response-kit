// Verifies the ESM build (dist/index.js) inside a real Express app.
import express from 'express';
import { responseMiddleware } from '../dist/index.js';

const app = express();
app.use(express.json());
app.use(responseMiddleware);

app.get('/success', (req, res) => res.success({ id: 1, name: 'John' }, 'User fetched'));
app.get('/created', (req, res) => res.created({ id: 2 }, 'User created'));
app.get('/error', (req, res) => res.error('Something went wrong', 500));
app.get('/notfound', (req, res) => res.notFound());
app.get('/validation', (req, res) =>
  res.validationError([{ field: 'email', message: 'Invalid email' }]),
);
app.get('/unauthorized', (req, res) => res.unauthorized());
app.get('/forbidden', (req, res) => res.forbidden());
app.get('/paginated', (req, res) =>
  res.paginated([{ id: 1 }], { page: 1, limit: 10, total: 25 }, 'Users fetched'),
);

const server = app.listen(0);
const { port } = server.address();

const checks = [
  ['/success', 200, (b) => b.success === true && b.data.id === 1 && b.message === 'User fetched'],
  ['/created', 201, (b) => b.success === true && b.data.id === 2],
  ['/error', 500, (b) => b.success === false && b.data === null],
  ['/notfound', 404, (b) => b.success === false],
  ['/validation', 422, (b) => b.errors.length === 1],
  ['/unauthorized', 401, (b) => b.success === false],
  ['/forbidden', 403, (b) => b.success === false],
  ['/paginated', 200, (b) => b.pagination.totalPages === 3],
];

let failed = 0;
for (const [path, status, ok] of checks) {
  const r = await fetch(`http://localhost:${port}${path}`);
  const body = await r.json();
  const pass = r.status === status && ok(body);
  console.log(`[ESM] ${pass ? 'PASS' : 'FAIL'} ${path} -> ${r.status}`);
  if (!pass) failed++;
}

server.close();
process.exit(failed === 0 ? 0 : 1);
