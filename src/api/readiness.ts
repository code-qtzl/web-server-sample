import type { Request, Response } from 'express';

// Handler for readiness probe, returns 'OK' if the server is running
export async function handlerReadiness(_: Request, res: Response) {
	res.set('Content-Type', 'text/plain; charset=utf-8');
	res.send('OK');
}
