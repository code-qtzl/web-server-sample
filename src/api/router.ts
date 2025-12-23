import { Router } from 'express';
import { handlerReadiness } from './readiness.js';
// import { handlerMetrics } from './metrics.js';
import { handlerResetMetrics } from './reset.js';
import { handlerValidateChirpy } from './validate.js';
import { createUsersHandler } from './users.js';

const apiRouter = Router();

// Readiness endpoint: /api/healthz
apiRouter.get('/healthz', handlerReadiness);

// Metrics endpoint
// apiRouter.get('/metrics', handlerMetrics);

// Reset metrics endpoint: /api/reset
apiRouter.post('/reset', handlerResetMetrics);

// validate chirpy endpoint: /api/validate_chirp
apiRouter.post('/validate_chirp', handlerValidateChirpy);

// Users endpoint: /api/users
apiRouter.post('/users', createUsersHandler);

export default apiRouter;
