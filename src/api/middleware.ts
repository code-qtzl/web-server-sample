import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { respondWithError } from './json.js';
import {
	BadRequestError,
	UserNotAuthenticatedError,
	UserForbiddenError,
	NotFoundError,
} from './errors.js';

// Middleware to log all responses with their status codes
export async function middlewareLogResponses(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	res.on('finish', () => {
		const statusType = res.statusCode >= 400 ? '[ERROR]' : '[OK]';
		console.log(
			`---- \n Status: ${statusType} \n Method Type: ${req.method} \n URL: ${req.originalUrl} \n Status: ${res.statusCode}`,
		);
	});
	next();
}

// error-handling middleware that responds with 500 for unhandled errors.
export function errorMiddleWare(
	err: Error,
	_: Request,
	res: Response,
	__: NextFunction,
) {
	let statusCode = 500;
	let message = 'Something went wrong on our end';

	if (err instanceof BadRequestError) {
		statusCode = 400;
		message = err.message;
	} else if (err instanceof UserNotAuthenticatedError) {
		statusCode = 401;
		message = err.message;
	} else if (err instanceof UserForbiddenError) {
		statusCode = 403;
		message = err.message;
	} else if (err instanceof NotFoundError) {
		statusCode = 404;
		message = err.message;
	}

	if (statusCode >= 500) {
		console.log(err.message);
	}

	respondWithError(res, statusCode, message);
}
