import type { Request, Response } from 'express';

import { createChirp } from '../db/queries.js';
import { BadRequestError } from './errors.js';
import { respondWithJSON } from './json.js';

export async function createChirpsHandler(req: Request, res: Response) {
	type parameters = {
		userId: string;
		body: string;
	};
	const params: parameters = req.body;

	if (!params.userId || !params.body) {
		throw new BadRequestError('Missing required fields');
	}

	const chirp = await createChirp({
		userId: params.userId,
		content: params.body,
	});

	if (!chirp) {
		throw new Error('Could not create chirp');
	}

	respondWithJSON(res, 201, {
		id: chirp.id,
		userId: chirp.userId,
		body: chirp.content,
		createdAt: chirp.createdAt,
		updatedAt: chirp.updatedAt,
	});
}
