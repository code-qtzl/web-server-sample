import type { Request, Response, NextFunction } from 'express';

import { respondWithJSON, respondWithError } from './json.js';
import { BadRequestError } from './errors.js';

export function handlerValidateChirpy(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { body } = req.body;

		if (!body || typeof body !== 'string') {
			respondWithError(res, 400, 'Chirp is required');
			return;
		}

		const maxChirpLength = 140;
		if (body.length > maxChirpLength) {
			throw new BadRequestError(
				`Chirp is too long. Max length is ${maxChirpLength}`,
			);
		}

		// Replace profane words with ****
		const profaneWords = ['kerfuffle', 'sharbert', 'fornax'];
		let cleanedBody = body;

		profaneWords.forEach((word) => {
			while (cleanedBody.toLowerCase().includes(word.toLowerCase())) {
				const index = cleanedBody
					.toLowerCase()
					.indexOf(word.toLowerCase());
				cleanedBody =
					cleanedBody.substring(0, index) +
					'****' +
					cleanedBody.substring(index + word.length);
			}
		});

		respondWithJSON(res, 200, {
			valid: true,
			cleanedBody: cleanedBody,
		});
	} catch (error) {
		next(error);
	}
}
