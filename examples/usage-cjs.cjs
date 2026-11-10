// Verifies the CommonJS build (dist/index.cjs) inside a real Express app.
const express = require('express');
const { responseMiddleware } = require('../dist/index.cjs');

const app = express();
app.use(express.json());
app.use(responseMiddleware);

app.get('/success', (req, res) => res.success({ id: 1 }, 'CJS works'));
app.get('/paginated', (req, res) => res.paginated([{ id: 1 }], { page: 2, limit: 10, total: 25 }));

const server = app.listen(0);
const { port } = server.address();

(async () => {
  const checks = [
    ['/success', 200, (b) => b.success === true && b.data.id === 1 && b.message === 'CJS works'],
    ['/paginated', 200, (b) => b.pagination.totalPages === 3 && b.pagination.page === 2],
  ];

  let failed = 0;
  for (const [path, status, ok] of checks) {
    const r = await fetch(`http://localhost:${port}${path}`);
    const body = await r.json();
    const pass = r.status === status && ok(body);
    console.log(`[CJS] ${pass ? 'PASS' : 'FAIL'} ${path} -> ${r.status}`);
    if (!pass) failed++;
  }

  server.close();
  process.exit(failed === 0 ? 0 : 1);
})();
