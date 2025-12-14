import { Router } from 'express';
import { handlerReadiness } from './readiness.js';
import { handlerMetrics } from './metrics.js';
import { handlerResetMetrics } from './reset.js';

const apiRouter = Router();

// Readiness endpoint
apiRouter.get('/healthz', handlerReadiness);

// Metrics endpoint
apiRouter.get('/metrics', handlerMetrics);

// Reset metrics endpoint
apiRouter.get('/reset', handlerResetMetrics);

export default apiRouter;
