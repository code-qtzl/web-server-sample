import { Router, Request, Response, NextFunction } from 'express';
import { handlerReadiness } from './readiness.js';
// import { handlerMetrics } from './metrics.js';
import { handlerResetMetrics } from './reset.js';
import { handlerValidateChirpy } from './validate.js';
import { createUsersHandler } from './users.js';
import {
	createChirpsHandler,
	getAllChirpsHandler,
	getChirpByIdHandler,
} from './chirps.js';
import { createLoginHandler } from './auth.js';
import { refreshHandler } from './refresh.js';

const apiRouter = Router();

// Wrapper to catch async errors
function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

// Readiness endpoint: /api/healthz
apiRouter.get('/healthz', handlerReadiness);

// Metrics endpoint
// apiRouter.get('/metrics', handlerMetrics);

// Reset metrics endpoint: /api/reset
apiRouter.post('/reset', handlerResetMetrics);

// validate chirpy endpoint: /api/validate_chirp
apiRouter.post('/validate_chirp', handlerValidateChirpy);

// Users endpoint: /api/users
apiRouter.post('/users', asyncHandler(createUsersHandler));

// Chirps endpoints: /api/chirps
apiRouter.get('/chirps', asyncHandler(getAllChirpsHandler));
apiRouter.post('/chirps', asyncHandler(createChirpsHandler));
apiRouter.get('/chirps/:chirpId', asyncHandler(getChirpByIdHandler));

// Login endpoint: /api/login
apiRouter.post('/login', asyncHandler(createLoginHandler));

// Refresh endpoint: /api/refresh
apiRouter.post('/refresh', asyncHandler(refreshHandler));

export default apiRouter;
