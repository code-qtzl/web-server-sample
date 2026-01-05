import type { Request, Response } from 'express';

import { UserNotAuthenticatedError } from './errors.js';
import { respondWithJSON } from './json.js';
import { checkPasswordHash, makeJWT } from '../auth.js';
import { getUserByEmail } from '../db/queries/users.js';
import { createRefreshToken } from '../db/queries/refreshTokens.js';
import { UserResponse } from './users.js';
import { config } from '../config.js';
import { randomBytes } from 'crypto';

type LoginResponse = UserResponse & {
	token: string;
	refreshToken: string;
};

export async function createLoginHandler(req: Request, res: Response) {
	type parameters = {
		password: string;
		email: string;
	};

	const params: parameters = req.body;

	const user = await getUserByEmail(params.email);
	if (!user) {
		throw new UserNotAuthenticatedError('invalid username or password');
	}

	const matching = await checkPasswordHash(
		params.password,
		user.hashed_password,
	);
	if (!matching) {
		throw new UserNotAuthenticatedError('invalid username or password');
	}

	// Create access token with 1 hour expiration
	const accessToken = makeJWT(
		user.id,
		config.jwt.defaultDuration,
		config.jwt.secret,
	);

	// Create refresh token with 60 day expiration in database
	const refreshToken = await createRefreshToken(user.id);

	respondWithJSON(res, 200, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		token: accessToken,
		refreshToken: refreshToken.token,
	} satisfies LoginResponse);
}

export function makeRefreshToken(): string {
	return randomBytes(32).toString('hex');
}
