import type { Request, Response } from 'express';

import {
	createChirp,
	getAllChirps,
	getChirpById,
} from '../db/queries/chirps.js';
import { BadRequestError, NotFoundError } from './errors.js';
import { respondWithJSON } from './json.js';
import { getBearerToken, validateJWT } from '../auth.js';
import { config } from '../config.js';

export async function createChirpsHandler(req: Request, res: Response) {
	type parameters = {
		body: string;
	};
	const params: parameters = req.body;

	if (!params.body) {
		throw new BadRequestError('Missing required fields');
	}

	// Extract and validate JWT
	const authHeader = req.headers.authorization;
	const token = getBearerToken(req);
	const userId = validateJWT(token, config.jwt.secret);

	const chirp = await createChirp({
		userId: userId,
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

export async function getAllChirpsHandler(req: Request, res: Response) {
	const chirps = await getAllChirps();

	const formattedChirps = chirps.map((chirp) => ({
		id: chirp.id,
		userId: chirp.userId,
		body: chirp.content,
		createdAt: chirp.createdAt,
		updatedAt: chirp.updatedAt,
	}));

	respondWithJSON(res, 200, formattedChirps);
}

export async function getChirpByIdHandler(req: Request, res: Response) {
	const chirpId = req.params.chirpId?.trim();

	if (!chirpId) {
		throw new BadRequestError('Invalid chirp ID');
	}

	const chirp = await getChirpById(chirpId);

	if (!chirp) {
		throw new NotFoundError('Chirp not found');
	}

	respondWithJSON(res, 200, {
		id: chirp.id,
		userId: chirp.userId,
		body: chirp.content,
		createdAt: chirp.createdAt,
		updatedAt: chirp.updatedAt,
	});
}
