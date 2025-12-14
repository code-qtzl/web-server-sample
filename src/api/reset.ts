import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function handlerResetMetrics(req: Request, res: Response) {
	const previousHits = config.fileserverHits;
	config.fileserverHits = 0;
	res.write(`Metrics reset from ${previousHits} to 0`);
	res.end();
}
