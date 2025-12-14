import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

// Middleware to track and increment file server hits on '/app' route
export function middlewareMetricsInc(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.originalUrl.startsWith('/app')) {
		config.fileserverHits += 1;
	}
	next();
}

// Handler to return current metrics, specifically the number of file server hits
export function handlerMetrics(req: Request, res: Response) {
	res.set('Content-Type', 'text/plain; charset=utf-8');
	res.send(`Hits: ${config.fileserverHits}`);
}
