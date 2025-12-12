import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

// Middleware to log non-OK responses (status code >= 400)
export async function middlewareLogResponses(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	res.on('finish', () => {
		if (res.statusCode >= 400) {
			console.log(
				`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
			);
		}
	});
	next();
}

// Middleware to track and increment file server hits on '/app' route
export function middlewareMetricsInc(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.originalUrl.startsWith('/app/')) {
		config.fileserverHits += 1;
	}
	next();
}

// Handler to return current metrics, specifically the number of file server hits
export function handlerMetrics(req: Request, res: Response) {
	res.set('Content-Type', 'text/plain; charset=utf-8');
	res.send(`Hits: ${config.fileserverHits}`);
}

// Handler to reset the file server hit counter
export function handlerResetMetrics(req: Request, res: Response) {
	const previousHits = config.fileserverHits;
	config.fileserverHits = 0;
	res.write(`Metrics reset from ${previousHits} to 0`);
	res.end();
}
