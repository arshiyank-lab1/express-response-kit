import express, { type Express } from 'express';
import { responseMiddleware } from '../src/index';

/**
 * Builds an Express app with the response middleware already mounted.
 * Used by the integration test suite.
 */
export function createApp(setup: (app: Express) => void): Express {
  const app = express();
  app.use(express.json());
  app.use(responseMiddleware);
  setup(app);
  return app;
}
