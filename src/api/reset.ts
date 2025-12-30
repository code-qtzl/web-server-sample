import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { reset } from '../db/queries/users.js';
import { UserForbiddenError } from './errors.js';

export async function handlerResetMetrics(req: Request, res: Response) {
	if (config.api.platform !== 'dev') {
		console.log(config.api.platform);
		throw new UserForbiddenError(
			'Reset is only allowed in dev environment.',
		);
	}

	const previousHits = config.api.fileServerHits;
	config.api.fileServerHits = 0;

	// Delete all users from the database
	await reset();

	res.write(`Metrics reset from ${previousHits} to 0. All users deleted.`);
	res.end();
}
