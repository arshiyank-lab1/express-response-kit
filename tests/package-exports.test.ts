import { describe, it, expect } from 'vitest';
import { responseMiddleware } from '../src/index';

describe('package exports', () => {
  it('exposes responseMiddleware as a named function', () => {
    expect(typeof responseMiddleware).toBe('function');
  });

  it('exposes a default export that is the same function', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.default).toBe('function');
    expect(mod.default).toBe(responseMiddleware);
  });

  it('exports the public type names (compile-time only, sanity check at runtime)', async () => {
    const mod = await import('../src/index');
    // Type-only exports do not exist at runtime, but the module must still load.
    expect(mod).toBeDefined();
  });
});
