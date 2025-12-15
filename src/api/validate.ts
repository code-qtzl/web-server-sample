import type { Request, Response } from 'express';

import { respondWithJSON, respondWithError } from './json.js';

export function handlerValidateChirpy(req: Request, res: Response) {
	const { body } = req.body;

	if (!body || typeof body !== 'string') {
		respondWithError(res, 400, 'Chirp is required');
		return;
	}

	const maxChirpLength = 140;
	if (body.length > maxChirpLength) {
		respondWithError(res, 400, 'Chirp is too long');
		return;
	}

	respondWithJSON(res, 200, {
		valid: true,
		body: body,
	});
}
