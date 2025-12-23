import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { deleteAllUsers } from '../db/queries.js';

export async function handlerResetMetrics(req: Request, res: Response) {
	if (config.api.platform !== 'dev') {
		res.status(403).send('Forbidden');
		return;
	}

	const previousHits = config.api.fileServerHits;
	config.api.fileServerHits = 0;

	// Delete all users from the database
	await deleteAllUsers();

	res.write(`Metrics reset from ${previousHits} to 0. All users deleted.`);
	res.end();
}
