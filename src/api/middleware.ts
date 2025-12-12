import type { Request, Response, NextFunction } from 'express';

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
