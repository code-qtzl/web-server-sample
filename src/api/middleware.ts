import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

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

// Handler to return current metrics, specifically the number of file server hits
// export function handlerMetrics(req: Request, res: Response) {
// 	res.set('Content-Type', 'text/plain; charset=utf-8');
// 	res.send(`Hits: ${config.fileserverHits}`);
// }

// Handler to reset the file server hit counter
// export function handlerResetMetrics(req: Request, res: Response) {
// 	const previousHits = config.fileserverHits;
// 	config.fileserverHits = 0;
// 	res.write(`Metrics reset from ${previousHits} to 0`);
// 	res.end();
// }
